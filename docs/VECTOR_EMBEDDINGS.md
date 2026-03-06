# Vector Embeddings

MindScribe stores semantic embeddings in PostgreSQL using pgvector. There is no secondary document database.

## Storage model

Relational chat data:

- `conversations`
- `messages`

Semantic retrieval data:

- `message_embeddings`

Each `messages` row can have two embedding rows:

- one for the user message
- one for the assistant reply

## Environment

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=mindscribe
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

LLM_BASE_URL=http://localhost:8000/v1
LLM_EMBEDDING_MODEL=text-embedding-004
GEMINI_API_KEY=your_gemini_key
```

## Table shape

`message_embeddings` contains:

- `message_id`
- `conversation_id`
- `user_id`
- `content`
- `is_user_message`
- `embedding vector(768)`
- `created_at`

It also has:

- a unique constraint on `message_id + is_user_message`
- lookup indexes for `user_id`, `conversation_id`, and `created_at`
- an HNSW cosine index for vector search

## Query flow

1. Store the chat message in `messages`
2. Generate embeddings for the user and assistant text
3. Upsert both vectors into `message_embeddings`
4. On the next prompt, combine:
   - recent relational message history
   - semantically similar embedding matches

## Behavior

- Embedding writes are asynchronous
- Vector lookup failure falls back to chronological PostgreSQL history
- Deleting a conversation cascades through messages and embeddings

## Useful commands

```bash
docker compose -f docker/dev/docker-compose.dev.yml up -d postgres
bun run --filter=@mindscribe/database db:push
./scripts/check-embeddings.sh
```

## Manual verification

```sql
SELECT COUNT(*) FROM message_embeddings;

SELECT conversation_id, is_user_message, created_at
FROM message_embeddings
ORDER BY created_at DESC
LIMIT 10;
```
