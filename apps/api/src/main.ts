import "dotenv/config";
import express from "express";
import cors from "cors";
import { chatbotRouter } from "./routes/chat";
import { authRouter } from "./routes/auth";
import { db, pgVector } from "@mindscribe/database";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/chat", chatbotRouter);

app.get("/", (_req, res) => {
  res.json({ message: "Welcome to MindScribe API" });
});

app.get("/health", async (_req, res) => {
  const pgHealthy = await pgVector.healthCheck();

  res.json({
    status: pgHealthy ? "healthy" : "degraded",
    services: {
      postgresql: pgHealthy ? "connected" : "disconnected",
    },
    timestamp: new Date().toISOString(),
  });
});

// Start the server
app.listen(PORT, async () => {
  console.log(`MindScribe API running on port ${PORT}`);
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
});
