# MindScribe

MindScribe is an AI mental well-being companion built as a Bun monorepo. The app now uses PostgreSQL as the only database, with Drizzle managing the relational schema and pgvector powering semantic retrieval.

## Stack

- API: Hono + Better Auth + Drizzle ORM
- Web: SolidJS + Vite
- Database: PostgreSQL 16 + pgvector
- Tooling: Bun + Turbo + Biome

## Workspace layout

- `apps/api` — Hono API and auth endpoints
- `apps/web` — SolidJS frontend
- `packages/database` — Drizzle schema, PostgreSQL connection, database utilities
- `packages/types` — shared TypeScript types
- `docker` — local and production containers
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

3. Start PostgreSQL locally with Docker:

   ```bash
   docker compose -f docker/dev/docker-compose.dev.yml up -d postgres
   ```

4. Apply the Drizzle schema:

   ```bash
   bun run --filter=@mindscribe/database db:push
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
just postgres-up
just db-push
just docker-dev-up
```

## Environment notes

Important backend variables:

- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `BETTER_AUTH_SECRET`
- `LLM_BASE_URL`
- `LLM_MODEL`
- `LLM_EMBEDDING_MODEL`

See [docs/DOCKER_SETUP.md](docs/DOCKER_SETUP.md), [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md), and [docs/VECTOR_EMBEDDINGS.md](docs/VECTOR_EMBEDDINGS.md) for details.
