# MeshMind

MeshMind is an LLM-agnostic AI chat application built as a Bun monorepo. It connects to chat and embedding models through LiteLLM or any other OpenAI-compatible endpoint, while PostgreSQL, Drizzle, and pgvector handle persistence and semantic retrieval.

## Stack

- API: Hono + Better Auth + Drizzle ORM + OpenAI-compatible LLM routing
- Web: SolidJS + Vite
- Database: PostgreSQL 16 + pgvector
- Tooling: Bun + Nx + Biome

## Workspace layout

- `apps/api` — Hono API and auth endpoints
- `apps/web` — SolidJS frontend for authenticated AI chat
- `packages/database` — Drizzle schema, PostgreSQL connection, database utilities
- `packages/types` — shared TypeScript types
- `docs` — setup and architecture notes

## Database model

All persisted application data lives in PostgreSQL:

- `users`
- `accounts`
- `sessions`
- `verification`
- `conversations`
- `messages`
- `message_embeddings`

`message_embeddings` uses pgvector for semantic similarity search, while the rest of the application uses relational tables through Drizzle.

## Prerequisites

- Bun
- PostgreSQL 16 with pgvector
- LiteLLM or another OpenAI-compatible endpoint
- Gemini API key if using `text-embedding-004`

## Local setup

1. Install dependencies:

   ```bash
   bun install
   ```

2. Copy the environment template and fill in secrets:

   ```bash
   cp .env.example .env
   ```

3. Start PostgreSQL locally with pgvector enabled.

4. Apply the Drizzle schema:

   ```bash
   bun run --filter=@meshmind/database db:push
   ```

5. Start the apps:

   ```bash
   bun run dev
   ```

## Useful commands

```bash
just install
just dev
just build
just type-check
just db-push
```

## Environment notes

Important backend variables:

- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `BETTER_AUTH_SECRET`
- `LLM_MODEL`
- `LLM_EMBEDDING_MODEL`
- `LLM_BASE_URL`

If `LLM_BASE_URL` is omitted, the API defaults to `http://localhost:4000/v1`.

See [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md), [docs/LITELLM_SETUP.md](docs/LITELLM_SETUP.md), and [docs/VECTOR_EMBEDDINGS.md](docs/VECTOR_EMBEDDINGS.md) for details.
