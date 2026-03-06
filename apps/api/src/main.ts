import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { chatbotRouter } from "./routes/chat";
import { authRouter } from "./routes/auth";
import { healthCheck } from "@mindscribe/database";

const app = new Hono();
const PORT = parseInt(process.env.PORT || "8000", 10);
const frontendOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  "*",
  cors({
    origin: frontendOrigin,
    credentials: true,
  }),
);

app.route("/auth", authRouter);
app.route("/chat", chatbotRouter);

app.get("/", (c) => {
  return c.json({ message: "MindScribe API" });
});

app.get("/health", async (c) => {
  const pgStatus = await healthCheck();

  return c.json({
    status: pgStatus.ok ? "healthy" : "degraded",
    services: {
      postgresql: pgStatus.ok ? "connected" : "disconnected",
    },
    ...(pgStatus.error ? { databaseError: pgStatus.error } : {}),
    timestamp: new Date().toISOString(),
  });
});

const effectiveLlmModel = process.env.LLM_MODEL || "gpt-3.5-turbo";
const effectiveEmbeddingModel =
  process.env.LLM_EMBEDDING_MODEL || "text-embedding-004";

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  async (info) => {
    console.log(`API running on port ${info.port}`);
    console.log(`LLM Model: ${effectiveLlmModel}`);
    console.log(`Embedding Model: ${effectiveEmbeddingModel}`);

    const pgStatus = await healthCheck();

    if (pgStatus.ok) {
      console.log("PostgreSQL with pgvector is ready");
    } else {
      console.warn(
        `${pgStatus.error ? `${pgStatus.error}` : "pgvector unavailable"} - embeddings will be disabled`,
      );
    }
  },
);
