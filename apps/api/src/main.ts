import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { chatbotRouter } from "./routes/chat";
import { authRouter } from "./routes/auth";
import { pgVector } from "@mindscribe/database";

const app = new Hono();
const PORT = parseInt(process.env.PORT || "8000", 10);

app.use("*", cors());

// Routes
app.route("/auth", authRouter);
app.route("/chat", chatbotRouter);

// Home endpoint
app.get("/", (c) => {
  return c.json({ message: "MindScribe API" });
});

// Health check endpoint
app.get("/health", async (c) => {
  const pgHealthy = await pgVector.healthCheck();

  return c.json({
    status: pgHealthy ? "healthy" : "degraded",
    services: {
      postgresql: pgHealthy ? "connected" : "disconnected",
    },
    timestamp: new Date().toISOString(),
  });
});

// Start the server
serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  async (info) => {
    console.log(`MindScribe API running on port ${info.port}`);
    console.log(
      `LLM Base URL: ${process.env.LLM_BASE_URL || "http://localhost:8000/v1"}`,
    );
    console.log(`LLM Model: ${process.env.LLM_MODEL || "gpt-3.5-turbo"}`);
    console.log(
      `Embedding Model: ${process.env.LLM_EMBEDDING_MODEL || "text-embedding-004"}`,
    );

    // Test pgVector connection
    const pgHealthy = await pgVector.healthCheck();
    if (pgHealthy) {
      console.log("✓ PostgreSQL with pgvector is ready");
    } else {
      console.warn(
        "⚠ PostgreSQL connection failed - embeddings will be disabled",
      );
    }
  },
);
