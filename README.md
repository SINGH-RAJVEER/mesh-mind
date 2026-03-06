# MindScribe - AI Mental Well-being Companion

MindScribe is your friendly AI-assisted chat companion dedicated to mental well-being, built with a modern Turborepo monorepo architecture featuring full TypeScript support and shared packages.

## Architecture

This project follows a clean monorepo architecture with:

- **apps/api**: Express.js backend API
- **apps/web**: React frontend application
- **packages/types**: Shared TypeScript types
- **packages/database**: Database models and connection logic

## Features

- **Instant Support:** Get quick responses with warm and empathetic advice.
- **Personalized Conversations:** Enjoy discussions tailored to your feelings and needs.
- **24/7 Availability:** Reach out any time. MindScribe is always ready to help.
- **Secure & Confidential:** Your privacy is paramount. All conversations are local and therefore private and secure.
- **Vector Embeddings:** Smart context retrieval using semantic search with pgvector and Gemini embeddings for better conversation continuity.

## Tech Stack

### Backend

- Express.js with TypeScript
- PostgreSQL with pgvector for embeddings
- JWT Authentication
- LiteLLM SDK for LLM inference with streaming support
- Gemini embeddings via LiteLLM for semantic search
- Server-Sent Events (SSE) for response streaming

### Frontend

- React 18 with TypeScript
- Vite
- TanStack Query (React Query)
- Zustand for state management
- Tailwind CSS + Radix UI

### Infrastructure

- Turborepo monorepo
- npm workspaces

## Installation

### Prerequisites

- PostgreSQL 16+ with pgvector (for embeddings)
- LiteLLM proxy server (or compatible LLM endpoint like Ollama, OpenAI, etc.)
- Gemini API key (for embeddings
- MongoDB running locally
- LiteLLM proxy server (or compatible LLM endpoint like Ollama, OpenAI, etc.)

### Setup Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/SINGH-RAJVEER/MindScribe.git
   cd mind-scribe
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Start MongoDB server:**

   ````bash
   # macOS (Homebrew)
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod

   # Start PostgreSQL with pgvector (for embeddings):**

   Using Docker (recommended):

   ```bash
   docker compose -f docker/dev/docker-compose.dev.yml up -d postgres
   ````

   Or install locally:

   ```bash
   # macOS (Homebrew)
   brew install postgresql pgvector

   # Linux
   sudo apt-get install postgresql-16 postgresql-16-pgvector
   ```

   Embeddings Model (Gemini via LiteLLM)
   LLM_EMBEDDING_MODEL=text-embedding-004

   # Database Configuration

   MONGODB_URI=mongodb://localhost:27017/mindscribe

   # PostgreSQL for Vector Embeddings

   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=mindscribe_vectors
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_postgres_passwordEMBEDDINGS.md) for detailed instructions.

4. \*\*Windows

   # MongoDB runs as a Windows service automatically

   ```

   ```

5. **Configure environment:**

   Create `.env` file in `apps/api/`:

   ```env
   # LiteLLM Configuration
   # Base URL for LLM endpoint (compatible with OpenAI API)
   LLM_BASE_URL=http://localhost:8000/v1

   # Model name (e.g., gpt-3.5-turbo, llama2, etc.)
   LLM_MODEL=gpt-3.5-turbo

   # API Key (if required by your provider)
   LLM_API_KEY=your-api-key-here

   # Optional: Database URL
   MONGODB_URI=mongodb://localhost:27017/mindscribe
   ```

   **Note:** The `LLM_BASE_URL` should point to a LiteLLM proxy server or OpenAI-compatible endpoint.

   ### Setting up LiteLLM Proxy (Optional)

   If running locally with Ollama or other providers:

   ```bash
   # Install LiteLLM
   pip install litellm

   # Start LiteLLM proxy server (pointing to Ollama)
   litellm --model ollama/llama2 --api_base http://localhost:11434
   ```

   Or for OpenAI:

   ```bash
   litellm --model gpt-3.5-turbo --api_key sk-your-key
   ```

6. **Build the project:**

   ```bash
   bun run build
   ```

7. **Start development servers:**

   ```bash
   bun run dev
   ```

   This will start:
   - Backend on `http://localhost:8000`
   - Frontend on `http://localhost:5173`

## Available Scripts

## Just Commands

This repository now includes a root [Justfile](Justfile) for common local and Docker workflows.

Examples:

```bash
just install
just dev
just build
just docker-dev-up
just docker-dev-run lint
just docker-prod-up
```

### Root Level

- `bun run dev` - Start all packages in development mode
- `bun run build` - Build all packages
- `bun run lint` - Lint all packages
- `bun run type-check` - Type check all packages
- `bun run clean` - Clean build artifacts

### Individual Packages

```bash
# API (backend) only
bun run dev --workspace=@mindscribe/api
bun run build --workspace=@mindscribe/api

# Web (frontend) only
bun run dev --workspace=@mindscribe/web
bun run build --workspace=@mindscribe/web

# Build shared packages
bun run build --workspace=@mindscribe/types
bun run build --workspace=@mindscribe/database
```

## Project Structure

```
mind-scribe/
├── apps/
│   ├── api/                  # Backend API (Express + TypeScript)
│   │   ├── src/
│   │   │   ├── routes/       # API routes (auth, chat)
│   │   │   ├── services/     # Business logic services
│   │   │   │   └── embeddingsService.ts  # Vector embeddings management
│   │   │   ├── utils/        # Utility functions
│   │   │   │   ├── litellmManager.ts     # LLM inference
│   │   │   │   └── embeddingsManager.ts  # Embeddings generation
│   │   │   ├── config.ts     # Configuration
│   │   │   ├── systemPrompt.ts
│   │   │   └── main.ts       # Entry point
│   │   ├── dist/             # Compiled JavaScript
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── web/                  # Frontend (React + TypeScript)
│       ├── src/
│       │   ├── api/          # API client
│       │   ├── components/   # React components
│       │   ├── hooks/        # Custom hooks
│       │   ├── store/        # Zustand stores
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   ├── types/                # Shared TypeScript types
│   │   ├── src/
│   │   │   └── index.ts      # Type definitions
│   │   ├── dist/             # Compiled types
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── database/             # Database models & connection
│       ├── src/
│       │   ├── models/       # Mongoose models
│       │   ├── connection.ts # MongoDB connection
│       │   ├── pgvector.ts   # PostgreSQL pgvector connection
│       │   └── index.ts      # Exports
│       ├── dist/             # Compiled code
│       ├── tsconfig.json
│       └── package.json
├── docker/
│   ├── dev/
│   │   ├── Dockerfile.api.dev
│   │   ├── Dockerfile.web.dev
│   │   └── docker-compose.dev.yml
│   ├── prod/
│   │   ├── Dockerfile.api.prod
│   │   ├── Dockerfile.web.prod
│   │   ├── docker-compose.prod.yml
│   │   └── nginx.prod.conf
│   └── init-pgvector.sql    # PostgreSQL initialization
├── docs/
│   ├── VECTOR_EMBEDDINGS.md       # Complete embeddings guide
│   ├── QUICKSTART_EMBEDDINGS.md   # Quick start guide
│   ├── AUTHENTICATION.md
│   ├── DOCKER_SETUP.md
│   └── LITELLM_SETUP.md
├── scripts/
│   └── check-embeddings.sh  # Health check script
├── turbo.json                # Turborepo config
├── package.json              # Root workspace config
└── README.md
```

## Package Dependencies

- `@mindscribe/api` depends on `@mindscribe/types` and `@mindscribe/database`
- `@mindscribe/web` depends on `@mindscribe/types`
- `@mindscribe/database` is independent (only external deps)
- `@mindscribe/types` is independent (no dependencies)

## Usage

When you run the application, you'll be greeted by a warm, inviting chat interface. Simply type your thoughts to initiate the discussion.

## Vector Embeddings (Semantic Search)

MindScribe now includes intelligent context retrieval using vector embeddings! This feature provides:

- 🎯 **Semantic Search**: Find relevant past conversations based on meaning, not just keywords
- 🧠 **Better Context**: When resuming chats, get contextually relevant history automatically
- ⚡ **Fast Retrieval**: HNSW indexing for efficient similarity search
- 🔄 **Hybrid Approach**: Combines recent messages with semantically similar ones

### Quick Start

```bash
# Start PostgreSQL with pgvector
docker compose -f docker/dev/docker-compose.dev.yml up -d postgres

# Verify setup
./scripts/check-embeddings.sh

# Start the API
bun run dev
```

### Documentation

- 📖 [Complete Vector Embeddings Guide](docs/VECTOR_EMBEDDINGS.md)
- 🚀 [Quick Start Guide](docs/QUICKSTART_EMBEDDINGS.md)
- 🛠️ [LiteLLM Setup](docs/LITELLM_SETUP.md)

### How It Works

When you send a message, MindScribe:

1. Generates embeddings using Gemini's `text-embedding-004` model via LiteLLM
2. Stores vectors in PostgreSQL with pgvector for fast similarity search
3. Retrieves relevant context when you return to the conversation
4. Combines recent + semantically similar messages for optimal context

This makes conversations feel more natural and contextually aware!

## License

MindScribe is open-source under the [MIT License](LICENSE).
