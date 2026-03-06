set shell := ["bash", "-lc"]
set dotenv-load := true
set export := true

alias i := install
alias tc := type-check
alias ddu := docker-dev-up
alias ddd := docker-dev-down
alias dpu := docker-prod-up
alias dpd := docker-prod-down

# Show available recipes
@default:
  just --list

# Install workspace dependencies
install:
  bun install

# Run the full local development workflow
dev:
  bun run dev

# Build every workspace package
build:
  bun run build

# Lint every workspace package
lint:
  bun run lint

# Format every workspace package
format:
  bun run format

# Type-check every workspace package
type-check:
  bun run type-check

# Clean workspace build output
clean:
  bun run clean

# Run API locally
api-dev:
  cd apps/api && bun run dev

# Build API locally
api-build:
  cd apps/api && bun run build

# Start built API locally
api-start:
  cd apps/api && bun run start

# Run web app locally
web-dev:
  cd apps/web && bun run dev

# Build web app locally
web-build:
  cd apps/web && bun run build

# Preview built web app locally
web-preview:
  cd apps/web && bun run preview

# Build shared types package
types-build:
  cd packages/types && bun run build

# Watch shared types package
types-dev:
  cd packages/types && bun run dev

# Build database package
db-build:
  cd packages/database && bun run build

# Watch database package
db-dev:
  cd packages/database && bun run dev

# Generate Drizzle migrations
db-generate:
  bun run --filter=@mindscribe/database db:generate

# Push Drizzle schema to the database
db-push:
  bun run --filter=@mindscribe/database db:push

# Open Drizzle Studio locally
db-studio:
  bun run --filter=@mindscribe/database db:studio

# Start only PostgreSQL for local work
postgres-up:
  docker compose -f docker/dev/docker-compose.dev.yml up -d postgres

# Stop only PostgreSQL started from the dev stack
postgres-down:
  docker compose -f docker/dev/docker-compose.dev.yml stop postgres

# Start the full development Docker stack
docker-dev-up:
  docker compose -f docker/dev/docker-compose.dev.yml up --build

# Start the development Docker stack in the background
docker-dev-up-d:
  docker compose -f docker/dev/docker-compose.dev.yml up --build -d

# Stop the development Docker stack
docker-dev-down:
  docker compose -f docker/dev/docker-compose.dev.yml down

# Stop the development Docker stack and remove volumes
docker-dev-down-v:
  docker compose -f docker/dev/docker-compose.dev.yml down -v

# Show all development Docker logs
docker-dev-logs:
  docker compose -f docker/dev/docker-compose.dev.yml logs -f

# Show API logs from the development Docker stack
docker-dev-api-logs:
  docker compose -f docker/dev/docker-compose.dev.yml logs -f api

# Show web logs from the development Docker stack
docker-dev-web-logs:
  docker compose -f docker/dev/docker-compose.dev.yml logs -f web

# Show PostgreSQL logs from the development Docker stack
docker-dev-db-logs:
  docker compose -f docker/dev/docker-compose.dev.yml logs -f postgres

# Rebuild development app images
docker-dev-build:
  docker compose -f docker/dev/docker-compose.dev.yml build api web

# Run one of the dev command services, for example: just docker-dev-run build
docker-dev-run service:
  docker compose -f docker/dev/docker-compose.dev.yml run --rm {{service}}

# Run a dev command service with published ports, for example: just docker-dev-run-ports db-studio
docker-dev-run-ports service:
  docker compose -f docker/dev/docker-compose.dev.yml run --rm --service-ports {{service}}

# Start the combined workspace dev container from the commands profile
docker-workspace-dev:
  docker compose -f docker/dev/docker-compose.dev.yml --profile commands up workspace-dev

# Start the production Docker stack in the background
docker-prod-up:
  docker compose -f docker/prod/docker-compose.prod.yml up --build -d

# Stop the production Docker stack
docker-prod-down:
  docker compose -f docker/prod/docker-compose.prod.yml down

# Stop the production Docker stack and remove volumes
docker-prod-down-v:
  docker compose -f docker/prod/docker-compose.prod.yml down -v

# Show production Docker logs
docker-prod-logs:
  docker compose -f docker/prod/docker-compose.prod.yml logs -f

# Show production API logs
docker-prod-api-logs:
  docker compose -f docker/prod/docker-compose.prod.yml logs -f api

# Show production web logs
docker-prod-web-logs:
  docker compose -f docker/prod/docker-compose.prod.yml logs -f web

# Rebuild production images
docker-prod-build:
  docker compose -f docker/prod/docker-compose.prod.yml build api web
