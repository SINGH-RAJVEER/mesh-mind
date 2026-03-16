# MeshMind - Universal LLM Chat Interface

MeshMind is a responsive and friendly LLM chat interface that lets you connect to practically any model under the sun through a single, polished UX. It is built with a modern Turborepo monorepo architecture featuring full TypeScript support and shared packages.

## Features

- **Any Model, One Interface:** Connect to OpenAI-compatible endpoints via LiteLLM and switch providers easily.
- **Responsive Chat UX:** Enjoy real-time streaming responses designed to feel fast and natural.
- **Friendly Experience:** Clean, approachable interface focused on delightful day-to-day usage.
- **Private by Design:** Run with your own local or hosted providers while keeping control of your data.

## Quick Start

1. **Clone the repository:**

   ```bash
   git clone https://github.com/SINGH-RAJVEER/mesh-mind.git
   cd mesh-mind
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Configure environment** — see [LiteLLM Setup](docs/LITELLM_SETUP.md) for full configuration details.

4. **Start development servers:**

   ```bash
   bun run dev
   ```

## Documentation

- [Project Structure](docs/PROJECT_STRUCTURE.md) — Architecture, scripts, and services
- [LiteLLM Setup](docs/LITELLM_SETUP.md) — LLM provider configuration and environment setup
- [Authentication](docs/AUTHENTICATION.md) — Auth system, OAuth, and API endpoints
- [Docker Setup](docs/DOCKER_SETUP.md) — Docker and production deployment

## License

MeshMind is open-source under the [MIT License](LICENSE).
