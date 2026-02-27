import "dotenv/config";
import express from "express";
import cors from "cors";
import { chatbotRouter } from "./routes/chat";
import { authRouter } from "./routes/auth";
import { db } from "@mindscribe/database";
import ollamaManager from "./utils/ollamaManager";

const app = express();
const PORT = 8000;

// Initialize Ollama
async function initializeOllama(): Promise<void> {
  try {
    await ollamaManager.checkOllamaInstallation();
    ollamaManager.startOllama();
    // Wait a bit for the service to start
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check if model is available
    const hasModel = await ollamaManager.checkModelAvailability();
    if (!hasModel) {
      console.log("Model not found, pulling llama3.2:3b...");
      await ollamaManager.pullModel();
    } else {
      console.log("Model llama3.2:3b is already available");
    }
  } catch (error) {
    console.error("Failed to initialize Ollama:", error);
    process.exit(1);
  }
}

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/chat", chatbotRouter);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to MindScribe API" });
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  ollamaManager.stopOllama();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  ollamaManager.stopOllama();
  process.exit(0);
});

// Start the server
initializeOllama().then(() => {
  app.listen(PORT, () => {
    console.log(`MindScribe API running on port ${PORT}`);
  });
});
