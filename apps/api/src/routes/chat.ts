import { Hono, type Context } from "hono";
import { getCurrentUser } from "../middleware/auth";
import { getSystemPrompt } from "../systemPrompt";
import { db, conversations, messages } from "@mindscribe/database";
import { eq, and, desc } from "drizzle-orm";
import litellmManager from "../utils/litellmManager";
import embeddingsService from "../services/embeddingsService";

const chatbotRouter = new Hono();
const sseHeaders = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
} as const;

const encoder = new TextEncoder();

const encodeSseEvent = (payload: Record<string, unknown>): Uint8Array => {
  return encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);
};

/**
 * Get conversation history for context using vector embeddings
 * Combines recent messages with semantically relevant past messages
 */
const getConversationHistory = async (
  conversationId: string | null,
  currentMessage: string,
): Promise<string> => {
  if (!conversationId) {
    return "";
  }

  try {
    // Try to get context using vector embeddings first
    const vectorContext = await embeddingsService.getConversationContext(
      conversationId,
      currentMessage,
      5, // 5 recent messages
      5, // 5 similar messages
    );

    if (vectorContext) {
      return vectorContext;
    }
  } catch (err) {
    console.warn("Vector search failed, falling back to chronological:", err);
  }

  // Fallback to traditional chronological retrieval
  const messageHistory = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.timestamp))
    .limit(10);

  messageHistory.reverse();

  return messageHistory
    .map((msg) => `User: ${msg.userMessage}\nAssistant: ${msg.botResponse}`)
    .join("\n\n");
};

const createNewConversation = async (
  userId: string,
  conversationId: string,
): Promise<void> => {
  await db.insert(conversations).values({
    id: conversationId,
    userId: userId,
  });
};

const storeChat = async (
  userId: string,
  conversationId: string,
  userMessage: string,
  botResponse: string,
): Promise<string> => {
  const [message] = await db
    .insert(messages)
    .values({
      userId: userId,
      conversationId: conversationId,
      userMessage: userMessage,
      botResponse: botResponse,
    })
    .returning();

  // Store embeddings asynchronously (don't await to avoid blocking)
  embeddingsService
    .storeMessageEmbeddings(
      message.id,
      conversationId,
      userId,
      userMessage,
      botResponse,
    )
    .catch((err) => {
      console.error("Failed to store embeddings:", err);
    });

  return message.id;
};

// POST /chat - Stream response using Server-Sent Events (SSE)
chatbotRouter.post("/", getCurrentUser, async (c: Context) => {
  try {
    const user = c.get("user") as { id: string };
    if (!user) {
      return c.json({ detail: "Unauthorized" }, 401);
    }

    const body = (await c.req.json()) as {
      user_message?: string;
      conversation_id?: string;
    };
    let { user_message, conversation_id } = body;

    // Validate input
    if (!user_message || typeof user_message !== "string") {
      return c.json({ detail: "user_message is required" }, 400);
    }

    try {
      if (!conversation_id) {
        conversation_id = crypto.randomUUID();
        await createNewConversation(user.id, conversation_id);
      }

      const finalizedConversationId = conversation_id;

      const responseStream = new ReadableStream<Uint8Array>({
        async start(controller) {
          let fullResponse = "";
          let shouldPersist = false;
          let closed = false;

          const closeStream = () => {
            if (!closed) {
              closed = true;
              try {
                controller.close();
              } catch (err) {
                console.warn("Failed to close chat stream cleanly:", err);
              }
            }
          };

          const sendEvent = (payload: Record<string, unknown>) => {
            if (closed || c.req.raw.signal.aborted) {
              return;
            }

            try {
              controller.enqueue(encodeSseEvent(payload));
            } catch (err) {
              closed = true;
              console.warn("Failed to write chat stream event:", err);
            }
          };

          try {
            sendEvent({
              type: "metadata",
              conversation_id: finalizedConversationId,
            });

            const conversationHistory = await getConversationHistory(
              finalizedConversationId,
              user_message,
            );
            const systemPrompt = getSystemPrompt(
              user_message,
              conversationHistory,
            );

            for await (const chunk of litellmManager.streamChatResponse(
              user_message,
              systemPrompt,
            )) {
              if (c.req.raw.signal.aborted) {
                break;
              }

              fullResponse += chunk;
              sendEvent({ type: "text", content: chunk });
            }

            if (!c.req.raw.signal.aborted) {
              shouldPersist = true;
              sendEvent({ type: "done" });
            }
          } catch (err: unknown) {
            const error = err as { message?: string };
            console.error("Chat stream error:", error);

            sendEvent({
              type: "error",
              content: error.message || "An error occurred during inference",
            });
          } finally {
            closeStream();

            if (shouldPersist && fullResponse) {
              storeChat(
                user.id,
                finalizedConversationId,
                user_message,
                fullResponse,
              ).catch((err) => {
                console.error("Failed to store chat:", err);
              });
            }
          }
        },
        cancel(reason) {
          console.warn("Chat stream cancelled:", reason);
        },
      });

      return new Response(responseStream, {
        status: 200,
        headers: sseHeaders,
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      const errorMsg = error.message || "An error occurred";
      console.error("Chat error:", errorMsg);

      return c.json({ detail: errorMsg }, 500);
    }
  } catch (err: unknown) {
    const error = err as { message?: string };
    return c.json({ detail: error.message || "An error occurred" }, 500);
  }
});

// GET /chat/history
chatbotRouter.get("/history", getCurrentUser, async (c: Context) => {
  try {
    const user = c.get("user") as { id: string };
    if (!user) return c.json({ detail: "Unauthorized" }, 401);

    const limit = parseInt(c.req.query("limit") || "10", 10);

    const messageHistory = await db
      .select()
      .from(messages)
      .where(eq(messages.userId, user.id))
      .orderBy(desc(messages.timestamp))
      .limit(limit);

    // Group messages by conversation_id
    const conversationsMap: Record<
      string,
      { id: string; messages: unknown[]; timestamp: Date }
    > = {};

    messageHistory.forEach((row) => {
      if (!conversationsMap[row.conversationId]) {
        conversationsMap[row.conversationId] = {
          id: row.conversationId,
          messages: [],
          timestamp: row.timestamp,
        };
      }
      conversationsMap[row.conversationId].messages.push({
        id: row.id,
        user_message: row.userMessage,
        bot_response: row.botResponse,
        timestamp: row.timestamp,
      });
    });

    return c.json({ history: Object.values(conversationsMap) });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return c.json({ detail: error.message || "An error occurred" }, 500);
  }
});

// DELETE /chat/:conversationId
chatbotRouter.delete("/:conversationId", getCurrentUser, async (c: Context) => {
  try {
    const user = c.get("user") as { id: string };
    if (!user) return c.json({ detail: "Unauthorized" }, 401);

    const { conversationId } = c.req.param();

    // Delete embeddings first
    await embeddingsService
      .deleteConversationEmbeddings(conversationId)
      .catch((err) => {
        console.warn("Failed to delete embeddings:", err);
      });

    // Delete all messages associated with the conversation
    await db
      .delete(messages)
      .where(
        and(
          eq(messages.userId, user.id),
          eq(messages.conversationId, conversationId),
        ),
      );

    // Delete the conversation itself
    await db
      .delete(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, user.id),
        ),
      );

    return c.json({ message: "Conversation deleted successfully" });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return c.json({ detail: error.message || "An error occurred" }, 500);
  }
});

export { chatbotRouter };
