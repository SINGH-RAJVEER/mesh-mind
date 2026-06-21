# Project Structure

MeshMind is organized as an LLM-agnostic chat platform with a web client, an authenticated API, and shared database tooling.

The repository is a Bun workspace orchestrated by Nx. Root commands such as `bun run build`, `bun run lint`, `bun run type-check`, and `bun run dev` delegate to Nx, which discovers package scripts from `apps/*` and `packages/*` and applies the target dependency rules in `nx.json`.

## Applications

### `apps/api`

- `src/main.ts` — Hono server bootstrap and health endpoint
- `src/auth.ts` — Better Auth configuration backed by Drizzle
- `src/routes/auth.ts` — auth route mounting and profile endpoint
- `src/routes/chat.ts` — chat streaming, history, and conversation deletion
- `src/middleware/auth.ts` — authenticated user middleware
- `src/services/embeddingsService.ts` — pgvector-backed semantic retrieval
- `src/utils/litellmManager.ts` — OpenAI-compatible chat completion streaming helper
- `src/utils/embeddingsManager.ts` — OpenAI-compatible embedding generation helper

### `apps/web`

- `src/components` — UI screens and reusable primitives
- `src/components/ui/sidebar.tsx` — branded sidebar header with logo-first expand and collapse affordance
- `src/hooks` — auth and chat hooks
- `src/store` — client state
- `src/api` — frontend API clients
- frontend UI uses Solid-specific packages, including `@solidjs/router` and `lucide-solid`

## Packages

### `packages/database`

Drizzle owns the PostgreSQL schema and connection layer.

- `src/schema.ts` — Drizzle table definitions for auth, chat, and embeddings
- `src/connection.ts` — shared PostgreSQL client and health helpers
- `src/index.ts` — public exports for the API
- `drizzle.config.ts` — Drizzle Kit configuration

### `packages/types`

- shared prompt and API-related types

## Database tables

MeshMind stores all persisted data in PostgreSQL:

- `users`
- `accounts`
- `sessions`
- `verification`
- `conversations`
- `messages`
- `message_embeddings`

## Performance notes

- Drizzle indexes are defined in `packages/database/src/schema.ts`
- `message_embeddings` uses an HNSW index for pgvector similarity search
- chat history uses relational queries first and semantic similarity when embeddings are available

## Environment variables

Core database variables:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=meshmind
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
```

Related setup guides:

- [AUTHENTICATION.md](./AUTHENTICATION.md)
- [VECTOR_EMBEDDINGS.md](./VECTOR_EMBEDDINGS.md)
