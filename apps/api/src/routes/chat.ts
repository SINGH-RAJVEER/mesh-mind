import express, { type Router } from "express";
import type { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { getCurrentUser, type AuthRequest } from "./auth";
import { CRISIS_WORDS, DETECT_MOOD } from "@mindscribe/types";
import { getSystemPrompt } from "../systemPrompt";
import { Conversation, Message } from "@mindscribe/database";
import type mongoose from "mongoose";

const router: Router = express.Router();

interface OllamaResponse {
  response?: string;
  result?: string;
  error?: {
    message?: string;
  };
}

const getChatResponse = async (
  userMessage: string,
  conversationId: string | null,
): Promise<string> => {
  const url =
    process.env.MODEL_API_URL || "http://localhost:11434/api/generate";
  const availableModels = ["llama3.2:3b", "deepseek-r1:8b"];
  const selectedModel = process.env.SELECTED_MODEL || "llama3.2:3b";

  if (!availableModels.includes(selectedModel)) {
    throw new Error(
      `Invalid model selected. Available models are: ${availableModels.join(", ")}`,
    );
  }

  // Get conversation history if conversationId exists
  let conversationHistory = "";
  if (conversationId) {
    // Get the last 10 messages for context to keep it manageable
    const messages = await Message.find({ conversation_id: conversationId })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    // Reverse the messages to maintain chronological order
    messages.reverse();

    // Format the conversation history
    conversationHistory = messages
      .map((msg) => `User: ${msg.user_message}\nAssistant: ${msg.bot_response}`)
      .join("\n\n");
  }

  const payload = {
    model: selectedModel,
    prompt: getSystemPrompt(userMessage, conversationHistory),
    stream: false,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await response.text();
    console.log("Raw response from model endpoint:", text);

    let data: OllamaResponse;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.error("Failed to parse JSON. Raw response:", text);
      throw new Error("Failed to parse JSON from model response");
    }

    if (!response.ok) {
      console.error("Ollama responded with error:", data);
      throw new Error(data.error?.message || "Ollama API error");
    }

    return data.response ? data.response.trim() : data.result?.trim() || "";
  } catch (err) {
    console.error("Error in getChatResponse:", err);
    throw err;
  }
};

const detectMood = (userMessage: string): string | null => {
  const lower = userMessage.toLowerCase();
  for (const [mood, keywords] of Object.entries(DETECT_MOOD)) {
    if (keywords.some((word) => lower.includes(word))) {
      return mood;
    }
  }
  return null;
};

const createNewConversation = async (
  userId: mongoose.Types.ObjectId,
  conversationId: string,
): Promise<void> => {
  const conversation = new Conversation({
    _id: conversationId,
    user_id: userId,
  });
  await conversation.save();
};

const storeChat = async (
  userId: mongoose.Types.ObjectId,
  conversationId: string,
  userMessage: string,
  botResponse: string,
  mood: string | null,
  isCrisis: boolean,
): Promise<void> => {
  const messageId = uuidv4();
  const message = new Message({
    _id: messageId,
    user_id: userId,
    conversation_id: conversationId,
    user_message: userMessage,
    bot_response: botResponse,
    mood,
    is_crisis: isCrisis,
  });
  await message.save();
};

router.post(
  "/",
  getCurrentUser,
  async (req: AuthRequest, res: Response): Promise<Response> => {
    const { user } = req;
    if (!user) return res.status(401).json({ detail: "Unauthorized" });

    let { user_message, conversation_id } = req.body;
    const isCrisis = CRISIS_WORDS.some((word) =>
      user_message.toLowerCase().includes(word),
    );
    const mood = detectMood(user_message);

    try {
      if (!conversation_id) {
        conversation_id = uuidv4();
        await createNewConversation(user.id, conversation_id);
      }

      let responseText: string;
      if (isCrisis) {
        responseText = "Please seek professional help. You're not alone ❤️.";
      } else {
        try {
          responseText = await getChatResponse(user_message, conversation_id);
        } catch (err: unknown) {
          const error = err as { message?: string };
          return res
            .status(500)
            .json({ detail: error.message || "An error occurred" });
        }
      }

      await storeChat(
        user.id,
        conversation_id,
        user_message,
        responseText,
        mood,
        isCrisis,
      );
      return res.json({ response: responseText, conversation_id, mood });
    } catch (err: unknown) {
      const error = err as { message?: string };
      return res
        .status(500)
        .json({ detail: error.message || "An error occurred" });
    }
  },
);

// GET /chat/history
router.get(
  "/history",
  getCurrentUser,
  async (req: AuthRequest, res: Response): Promise<Response> => {
    const { user } = req;
    if (!user) return res.status(401).json({ detail: "Unauthorized" });

    const limit = parseInt(req.query.limit as string) || 10;
    try {
      const messages = await Message.find({ user_id: user.id })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();

      // Group messages by conversation_id
      const conversations: Record<
        string,
        { id: string; messages: unknown[]; timestamp: Date }
      > = {};
      messages.forEach((row) => {
        if (!conversations[row.conversation_id]) {
          conversations[row.conversation_id] = {
            id: row.conversation_id,
            messages: [],
            timestamp: row.timestamp,
          };
        }
        conversations[row.conversation_id].messages.push({
          id: row._id,
          user_message: row.user_message,
          bot_response: row.bot_response,
          mood: row.mood,
          is_crisis: row.is_crisis,
          timestamp: row.timestamp,
        });
      });

      return res.json({ history: Object.values(conversations) });
    } catch (err: unknown) {
      const error = err as { message?: string };
      return res
        .status(500)
        .json({ detail: error.message || "An error occurred" });
    }
  },
);

// DELETE /chat/:conversationId
router.delete(
  "/:conversationId",
  getCurrentUser,
  async (req: AuthRequest, res: Response): Promise<Response> => {
    const { user } = req;
    if (!user) return res.status(401).json({ detail: "Unauthorized" });

    const { conversationId } = req.params;

    try {
      // Delete all messages associated with the conversation
      await Message.deleteMany({
        user_id: user.id,
        conversation_id: conversationId,
      });

      // Delete the conversation itself
      await Conversation.deleteOne({
        _id: conversationId,
        user_id: user.id,
      });

      return res.json({ message: "Conversation deleted successfully" });
    } catch (err: unknown) {
      const error = err as { message?: string };
      return res
        .status(500)
        .json({ detail: error.message || "An error occurred" });
    }
  },
);

export { router as chatbotRouter };
