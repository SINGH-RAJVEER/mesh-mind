# Docker Setup Guide

This repository now has separate Docker workflows for development and production.

- Development uses Bun and Vite dev servers with bind mounts for fast local iteration.
- Production uses compiled assets, a production API image, and Nginx as the public web entrypoint.

## Services

- `postgres`: PostgreSQL 16 with `pgvector`
- `api`: Bun dev server for `apps/api`
- `web`: Vite dev server for `apps/web`

## Development

The development workflow lives in [docker/dev/docker-compose.dev.yml](../docker/dev/docker-compose.dev.yml).

### Development quick start

1. Create a root `.env` file with the environment variables required by the API and OAuth providers. Use [.env.example](../.env.example) as the starting point and make sure `SECRET_KEY`, database credentials, OAuth credentials, and the frontend API variables are populated.
2. Start the stack:

```bash
docker compose -f docker/dev/docker-compose.dev.yml up --build
```

1. Open the app:

- Frontend: <http://localhost:3000>
- API: <http://localhost:8000>
- PostgreSQL: localhost:5432

Stop the stack:

```bash
docker compose -f docker/dev/docker-compose.dev.yml down
```

Remove containers and volumes:

```bash
docker compose -f docker/dev/docker-compose.dev.yml down -v
```

## Why this setup is suitable for development

### API container

- uses the Bun base image directly
- runs `bun run dev`
- mounts the repository at `/app`
- stores `/app/node_modules` in a Docker volume

### Web container

- uses the Bun base image directly
- runs `bun run dev --host 0.0.0.0 --port 3000`
- exposes the Vite dev server on port `3000`
- enables polling-based file watching for containerized development

### Shared behavior

- host code changes are reflected immediately through bind mounts
- Bun's install cache is stored in a Docker volume for faster rebuilds
- PostgreSQL data is stored in a named volume and survives restarts

## Common commands

Start in the background:

```bash
docker compose -f docker/dev/docker-compose.dev.yml up --build -d
```

Show all logs:

```bash
docker compose -f docker/dev/docker-compose.dev.yml logs -f
```

Show a single service:

```bash
docker compose -f docker/dev/docker-compose.dev.yml logs -f api
docker compose -f docker/dev/docker-compose.dev.yml logs -f web
docker compose -f docker/dev/docker-compose.dev.yml logs -f postgres
```

Rebuild the app images after Dockerfile changes:

```bash
docker compose -f docker/dev/docker-compose.dev.yml build api web
```

Equivalent `just` commands are also available from the repository root:

```bash
just docker-dev-up
just docker-dev-up-d
just docker-dev-down
just docker-dev-run build
just docker-dev-run lint
just docker-dev-run-ports db-studio
```

Run workspace-level commands from the dev Compose file:

```bash
docker compose -f docker/dev/docker-compose.dev.yml run --rm build
docker compose -f docker/dev/docker-compose.dev.yml run --rm lint
docker compose -f docker/dev/docker-compose.dev.yml run --rm format
docker compose -f docker/dev/docker-compose.dev.yml run --rm type-check
docker compose -f docker/dev/docker-compose.dev.yml run --rm clean
docker compose -f docker/dev/docker-compose.dev.yml run --rm db-generate
docker compose -f docker/dev/docker-compose.dev.yml run --rm db-push
```

Run the full Turborepo dev workflow in one container when needed:

```bash
docker compose -f docker/dev/docker-compose.dev.yml --profile commands up workspace-dev
```

Open Drizzle Studio from the dev Compose file:

```bash
docker compose -f docker/dev/docker-compose.dev.yml run --rm --service-ports db-studio
```

## Production

The production workflow lives in [docker/prod/docker-compose.prod.yml](../docker/prod/docker-compose.prod.yml).

### Production quick start

1. Set production-ready values in `.env`, especially `SECRET_KEY` or `BETTER_AUTH_SECRET`, OAuth credentials, database credentials, `FRONTEND_URL`, `BACKEND_URL`, and `VITE_API_URL`.
2. Start the production stack:

```bash
docker compose -f docker/prod/docker-compose.prod.yml up --build -d
```

1. Open the app at <http://localhost>.

### Production architecture

- [docker/prod/Dockerfile.api.prod](../docker/prod/Dockerfile.api.prod) builds the API and runs the compiled output.
- [docker/prod/Dockerfile.web.prod](../docker/prod/Dockerfile.web.prod) builds the frontend and serves it from Nginx.
- [docker/prod/nginx.prod.conf](../docker/prod/nginx.prod.conf) serves the SPA, caches static assets, and proxies `/api/` to the internal API service.

### Production commands

Follow logs:

```bash
docker compose -f docker/prod/docker-compose.prod.yml logs -f
```

Stop the production stack:

```bash
docker compose -f docker/prod/docker-compose.prod.yml down
```

Equivalent production `just` commands:

```bash
just docker-prod-up
just docker-prod-logs
just docker-prod-down
```

## Notes

- [docker/dev/Dockerfile.api.dev](../docker/dev/Dockerfile.api.dev) and [docker/dev/Dockerfile.web.dev](../docker/dev/Dockerfile.web.dev) are used for development.
- [docker/dev/docker-compose.dev.yml](../docker/dev/docker-compose.dev.yml) also includes one-off command services for build, lint, format, type-check, clean, and database tasks.
- [Justfile](../Justfile) wraps the most common Bun and Docker workflows in one place.
- The production Nginx entrypoint and production Dockerfiles live under [docker/prod](../docker/prod).
- Development does not use Nginx; Nginx is only part of the production web image.
- The production web image expects `VITE_API_URL` to stay aligned with the Nginx proxy path, which defaults to `/api`.
