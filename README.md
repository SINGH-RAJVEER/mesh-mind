# MindScribe - AI Mental Well-being Companion

MindScribe is your friendly AI-assisted chat companion dedicated to mental well-being, built with a modern Turborepo monorepo architecture featuring full TypeScript support and shared packages.

## Architecture 🏗️

This project follows a clean monorepo architecture with:

- **apps/api**: Express.js backend API
- **apps/web**: React frontend application
- **packages/types**: Shared TypeScript types
- **packages/database**: Database models and connection logic

## What's New? 🎉

- ✅ **Turborepo Monorepo**: Efficient build orchestration and caching
- ✅ **Full TypeScript**: End-to-end type safety across all packages
- ✅ **Shared Packages**: Reusable types and database logic
- ✅ **Clean Architecture**: Separation of concerns with dedicated packages
- ✅ **Enhanced Developer Experience**: Faster builds and better IDE support

## Features

- **Instant Support:** Get quick responses with warm and empathetic advice.
- **Personalized Conversations:** Enjoy discussions tailored to your feelings and needs.
- **24/7 Availability:** Reach out any time. MindScribe is always ready to help.
- **Secure & Confidential:** Your privacy is paramount. All conversations are local and therefore private and secure.

## Tech Stack

### Backend

- Express.js with TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Ollama for LLM integration

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

- Node.js 18+ and npm
- MongoDB running locally
- Ollama (will be auto-installed if not present)

### Setup Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/SINGH-RAJVEER/MindScribe.git
   cd mind-scribe
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start MongoDB server:**

   ```bash
   # macOS (Homebrew)
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod

   # Windows
   # MongoDB runs as a Windows service automatically
   ```

4. **Configure environment:**

   Create `.env` file in `apps/api/`:

   ```env
   MODEL_API_URL=http://localhost:11434/api/generate
   SELECTED_MODEL=llama3.2:3b
   ```

5. **Build the project:**

   ```bash
   npm run build
   ```

6. **Start development servers:**

   ```bash
   npm run dev
   ```

   This will start:
   - Backend on `http://localhost:8000`
   - Frontend on `http://localhost:5173`

## Available Scripts

### Root Level

- `npm run dev` - Start all packages in development mode
- `npm run build` - Build all packages
- `npm run lint` - Lint all packages
- `npm run type-check` - Type check all packages
- `npm run clean` - Clean build artifacts

### Individual Packages

```bash
# API (backend) only
npm run dev --workspace=@mindscribe/api
npm run build --workspace=@mindscribe/api

# Web (frontend) only
npm run dev --workspace=@mindscribe/web
npm run build --workspace=@mindscribe/web

# Build shared packages
npm run build --workspace=@mindscribe/types
npm run build --workspace=@mindscribe/database
```

## Project Structure

```
mind-scribe/
├── apps/
│   ├── api/                  # Backend API (Express + TypeScript)
│   │   ├── src/
│   │   │   ├── routes/       # API routes (auth, chat)
│   │   │   ├── utils/        # Utility functions
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
│       │   ├── connection.ts # DB connection
│       │   └── index.ts      # Exports
│       ├── dist/             # Compiled code
│       ├── tsconfig.json
│       └── package.json
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

## Contributing

MindScribe is an open-source project built with a modern tech stack:

- **Node.js** and **Express** with **TypeScript** for the backend API
- **React** with **TypeScript**, **Tailwind CSS**, and **Shadcn UI** for a fast, responsive, and modern frontend
- **Turborepo** for efficient monorepo management
- **MongoDB** as the lightweight NOSQL database
- **Ollama** for AI model integration
- **Authentication** is implemented using **bcrypt** for password hashing, **JWT** for token-based authentication, and **express-validator** for input validation

We believe in the power of community and warmly welcome contributions from developers of all backgrounds. Every contribution helps us enhance our compassionate support system and make a positive impact together.

## License

MindScribe is open-source under the [MIT License](LICENSE).
