# Nix Devenv

MeshMind uses a Nix-backed devenv for local development.

## Start the stack

```bash
just dev
```

This runs `devenv up` and starts:

- PostgreSQL 16 with pgvector on `localhost:5432`
- Drizzle schema sync through `@meshmind/database db:push`
- API on `http://localhost:8000`
- Web app on `http://localhost:5173`

PostgreSQL data is stored under `.devenv` and is ignored by git.

## Environment

The devenv provides local defaults for:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=meshmind
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
PORT=8000
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:8000
```

Keep OAuth and LLM provider secrets in the root `.env` file. The process manager and Bun scripts load it at runtime when it exists.

## Commands

Use normal workspace commands inside the shell:

```bash
devenv shell
bun install
bun run type-check
bun run build
```

The `just dev` command is the full dev preview entrypoint.
