# LiteLLM Proxy Setup Guide

This guide matches the variables defined in [.env.example](../.env.example).

## Variables used by the API

Chat inference uses:

```env
LLM_BASE_URL=http://localhost:8000/v1
LLM_MODEL=gpt-3.5-turbo
GROQ_API_KEY=your_llm_api_key
```

Embedding inference uses:

```env
LLM_BASE_URL=http://localhost:8000/v1
LLM_EMBEDDING_MODEL=text-embedding-004
GEMINI_API_KEY=your_llm_api_key
```

Database and server variables remain:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=mindscribe
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_postgres_password
PORT=8000
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

## How Mind Scribe uses them

- [apps/api/src/utils/litellmManager.ts](apps/api/src/utils/litellmManager.ts) uses `GROQ_API_KEY` for chat completions.
- [apps/api/src/utils/embeddingsManager.ts](apps/api/src/utils/embeddingsManager.ts) uses `GEMINI_API_KEY` for embeddings.
- Both clients send requests to the OpenAI-compatible `LLM_BASE_URL`.
- The `/chat` route streams chunks to the browser as they arrive.

## LiteLLM proxy example

Example `config.yaml`:

```yaml
model_list:
  - model_name: gpt-3.5-turbo
    litellm_params:
      model: groq/llama-3.3-70b-versatile
      api_key: os.environ/GROQ_API_KEY

  - model_name: text-embedding-004
    litellm_params:
      model: gemini/text-embedding-004
      api_key: os.environ/GEMINI_API_KEY
```

Start LiteLLM:

```bash
litellm --config config.yaml --port 8000
```

## Streaming verification

Verify the proxy:

```bash
curl -N http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "system", "content": "Be concise."},
      {"role": "user", "content": "Say hello in one sentence."}
    ],
    "stream": true
  }'
```

Verify embeddings:

```bash
curl -X POST http://localhost:8000/v1/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GEMINI_API_KEY" \
  -d '{"model":"text-embedding-004","input":"test"}'
```

## Running the app

```bash
bun install
bun run dev
```

## Notes

- Only variable names from [.env.example](../.env.example) are referenced here.
- If embeddings fail, chat still falls back to chronological PostgreSQL history.
