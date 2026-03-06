set shell := ["bash", "-lc"]
set dotenv-load := true
set export := true

alias i := install
alias tc := type-check
alias ddu := docker-dev-up
alias ddd := docker-dev-down
alias dpu := docker-prod-up
alias dpd := docker-prod-down

@default:
  just --list

install:
  bun install

dev:
  bun run dev

build:
  bun run build

lint:
  bun run lint

format:
  bun run format

type-check:
  bun run type-check

clean:
  bun run clean

api-dev:
  cd apps/api && bun run dev

api-build:
  cd apps/api && bun run build

api-start:
  cd apps/api && bun run start

web-dev:
  cd apps/web && bun run dev

web-build:
  cd apps/web && bun run build

web-preview:
  cd apps/web && bun run preview

types-build:
  cd packages/types && bun run build

types-dev:
  cd packages/types && bun run dev

db-build:
  cd packages/database && bun run build

db-dev:
  cd packages/database && bun run dev

db-generate:
  bun run --filter=@mindscribe/database db:generate

db-push:
  bun run --filter=@mindscribe/database db:push

db-studio:
  bun run --filter=@mindscribe/database db:studio

postgres-up:
  docker compose -f docker/dev/docker-compose.dev.yml up -d postgres

postgres-down:
  docker compose -f docker/dev/docker-compose.dev.yml stop postgres

docker-dev-up:
  docker compose -f docker/dev/docker-compose.dev.yml up --build

docker-dev-up-d:
  docker compose -f docker/dev/docker-compose.dev.yml up --build -d

docker-dev-down:
  docker compose -f docker/dev/docker-compose.dev.yml down

docker-dev-down-v:
  docker compose -f docker/dev/docker-compose.dev.yml down -v

docker-dev-logs:
  docker compose -f docker/dev/docker-compose.dev.yml logs -f

docker-dev-api-logs:
  docker compose -f docker/dev/docker-compose.dev.yml logs -f api

docker-dev-web-logs:
  docker compose -f docker/dev/docker-compose.dev.yml logs -f web

docker-dev-db-logs:
  docker compose -f docker/dev/docker-compose.dev.yml logs -f postgres

docker-dev-build:
  docker compose -f docker/dev/docker-compose.dev.yml build api web

docker-dev-run service:
  docker compose -f docker/dev/docker-compose.dev.yml run --rm {{service}}

docker-dev-run-ports service:
  docker compose -f docker/dev/docker-compose.dev.yml run --rm --service-ports {{service}}

docker-workspace-dev:
  docker compose -f docker/dev/docker-compose.dev.yml --profile commands up workspace-dev

docker-prod-up:
  docker compose -f docker/prod/docker-compose.prod.yml up --build -d

docker-prod-down:
  docker compose -f docker/prod/docker-compose.prod.yml down

docker-prod-down-v:
  docker compose -f docker/prod/docker-compose.prod.yml down -v

docker-prod-logs:
  docker compose -f docker/prod/docker-compose.prod.yml logs -f

docker-prod-api-logs:
  docker compose -f docker/prod/docker-compose.prod.yml logs -f api

docker-prod-web-logs:
  docker compose -f docker/prod/docker-compose.prod.yml logs -f web

docker-prod-build:
  docker compose -f docker/prod/docker-compose.prod.yml build api web
