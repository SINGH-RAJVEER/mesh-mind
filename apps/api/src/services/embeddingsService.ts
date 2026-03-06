import {
  db,
  messageEmbeddings,
  queryClient,
} from "@mindscribe/database";
import { desc, eq, sql } from "drizzle-orm";
import embeddingsManager from "../utils/embeddingsManager";
import type { MessageEmbeddingRow } from "./types";

export interface MessageEmbeddingData {
  id?: string;
  messageId: string;
  conversationId: string;
  userId: string;
  content: string;
  isUserMessage: boolean;
  embedding?: number[];
  createdAt?: Date;
  similarity?: number;
}

class MessageEmbeddingsService {
  private toVectorLiteral(values: number[]): string {
    return `[${values
      .map((value) => {
        const normalized = Number(value);
        return Number.isFinite(normalized) ? normalized.toString() : "0";
      })
      .join(",")}]`;
  }

  /**
   * Store embeddings for a user message and bot response
   */
  async storeMessageEmbeddings(
    messageId: string,
    conversationId: string,
    userId: string,
    userMessage: string,
    botResponse: string,
  ): Promise<void> {
    try {
      // Prepare texts for embedding
      const preparedUserMessage =
        embeddingsManager.prepareTextForEmbedding(userMessage);
      const preparedBotResponse =
        embeddingsManager.prepareTextForEmbedding(botResponse);

      // Generate embeddings in batch for efficiency
      const embeddings = await embeddingsManager.generateEmbeddings([
        preparedUserMessage,
        preparedBotResponse,
      ]);

      const [userEmbedding, botEmbedding] = embeddings;

      // Store both embeddings in the database
      await this.insertEmbedding({
        messageId,
        conversationId,
        userId,
        content: preparedUserMessage,
        isUserMessage: true,
        embedding: userEmbedding,
      });

      await this.insertEmbedding({
        messageId,
        conversationId,
        userId,
        content: preparedBotResponse,
        isUserMessage: false,
        embedding: botEmbedding,
      });
    } catch (err) {
      console.error("Error storing message embeddings:", err);
      // Don't throw - embeddings are supplementary, shouldn't break main flow
    }
  }

  /**
   * Insert a single embedding into the database
   */
  private async insertEmbedding(data: MessageEmbeddingData): Promise<void> {
    if (!data.embedding) {
      throw new Error("Embedding data is required");
    }

    await db
      .insert(messageEmbeddings)
      .values({
        messageId: data.messageId,
        conversationId: data.conversationId,
        userId: data.userId,
        content: data.content,
        isUserMessage: data.isUserMessage,
        embedding: data.embedding,
      })
      .onConflictDoUpdate({
        target: [
          messageEmbeddings.messageId,
          messageEmbeddings.isUserMessage,
        ],
        set: {
          content: data.content,
          embedding: data.embedding,
          createdAt: sql`CURRENT_TIMESTAMP`,
        },
      });
  }

  /**
   * Find similar messages in a conversation using vector similarity search
   * This retrieves contextually relevant messages based on semantic meaning
   */
  async findSimilarMessagesInConversation(
    conversationId: string,
    queryText: string,
    limit: number = 10,
    similarityThreshold: number = 0.5,
  ): Promise<MessageEmbeddingData[]> {
    try {
      // Generate embedding for the query
      const preparedQuery =
        embeddingsManager.prepareTextForEmbedding(queryText);
      const queryEmbedding =
        await embeddingsManager.generateEmbedding(preparedQuery);

      // Search for similar messages using cosine similarity
      // 1 - (embedding <=> query) gives us cosine similarity (1 = identical, 0 = orthogonal)
      const query = `
        SELECT 
          id,
          message_id,
          conversation_id,
          user_id,
          content,
          is_user_message,
          created_at,
          1 - (embedding <=> $1::vector) AS similarity
        FROM message_embeddings
        WHERE conversation_id = $2
          AND 1 - (embedding <=> $1::vector) > $3
        ORDER BY embedding <=> $1::vector
        LIMIT $4
      `;

      const result = (await queryClient.unsafe(query, [
        this.toVectorLiteral(queryEmbedding),
        conversationId,
        similarityThreshold,
        limit,
      ])) as MessageEmbeddingRow[];

      return result.map((row) => ({
        id: row.id,
        messageId: row.message_id,
        conversationId: row.conversation_id,
        userId: row.user_id,
        content: row.content,
        isUserMessage: row.is_user_message,
        createdAt: row.created_at,
        similarity: row.similarity ? Number(row.similarity) : undefined,
      }));
    } catch (err) {
      console.error("Error finding similar messages:", err);
      return []; // Return empty array on error to not break the flow
    }
  }

  /**
   * Find similar messages across all user's conversations
   */
  async findSimilarMessagesForUser(
    userId: string,
    queryText: string,
    limit: number = 10,
    similarityThreshold: number = 0.5,
  ): Promise<MessageEmbeddingData[]> {
    try {
      const preparedQuery =
        embeddingsManager.prepareTextForEmbedding(queryText);
      const queryEmbedding =
        await embeddingsManager.generateEmbedding(preparedQuery);

      const query = `
        SELECT 
          id,
          message_id,
          conversation_id,
          user_id,
          content,
          is_user_message,
          created_at,
          1 - (embedding <=> $1::vector) AS similarity
        FROM message_embeddings
        WHERE user_id = $2
          AND 1 - (embedding <=> $1::vector) > $3
        ORDER BY embedding <=> $1::vector
        LIMIT $4
      `;

      const result = (await queryClient.unsafe(query, [
        this.toVectorLiteral(queryEmbedding),
        userId,
        similarityThreshold,
        limit,
      ])) as MessageEmbeddingRow[];

      return result.map((row) => ({
        id: row.id,
        messageId: row.message_id,
        conversationId: row.conversation_id,
        userId: row.user_id,
        content: row.content,
        isUserMessage: row.is_user_message,
        createdAt: row.created_at,
        similarity: row.similarity ? Number(row.similarity) : undefined,
      }));
    } catch (err) {
      console.error("Error finding similar messages for user:", err);
      return [];
    }
  }

  /**
   * Get conversation context using hybrid approach:
   * - Recent messages (chronological)
   * - Relevant messages (semantic similarity)
   */
  async getConversationContext(
    conversationId: string,
    currentMessage: string,
    recentLimit: number = 5,
    similarLimit: number = 5,
  ): Promise<string> {
    try {
      // Get recent messages (chronological order)
      const recentMessages = await db
        .select({
          content: messageEmbeddings.content,
          isUserMessage: messageEmbeddings.isUserMessage,
          createdAt: messageEmbeddings.createdAt,
        })
        .from(messageEmbeddings)
        .where(eq(messageEmbeddings.conversationId, conversationId))
        .orderBy(desc(messageEmbeddings.createdAt))
        .limit(recentLimit);

      // Get semantically similar messages
      const similarMessages = await this.findSimilarMessagesInConversation(
        conversationId,
        currentMessage,
        similarLimit,
        0.6, // Higher threshold for better relevance
      );

      // Combine and format the context
      const recentContext = recentMessages
        .reverse()
        .map(
          (row) => `${row.isUserMessage ? "User" : "Assistant"}: ${row.content}`,
        )
        .join("\n");

      const similarContext = similarMessages
        .map(
          (msg) =>
            `${msg.isUserMessage ? "User" : "Assistant"}: ${msg.content}`,
        )
        .join("\n");

      // Format the combined context
      let context = "";
      if (recentContext) {
        context += `Recent conversation:\n${recentContext}\n\n`;
      }
      if (similarContext && similarContext !== recentContext) {
        context += `Relevant past context:\n${similarContext}`;
      }

      return context;
    } catch (err) {
      console.error("Error getting conversation context:", err);
      return "";
    }
  }

  /**
   * Delete embeddings for a specific conversation
   */
  async deleteConversationEmbeddings(conversationId: string): Promise<void> {
    await db
      .delete(messageEmbeddings)
      .where(eq(messageEmbeddings.conversationId, conversationId));
  }

  /**
   * Delete embeddings for a specific message
   */
  async deleteMessageEmbeddings(messageId: string): Promise<void> {
    await db
      .delete(messageEmbeddings)
      .where(eq(messageEmbeddings.messageId, messageId));
  }
}

export default new MessageEmbeddingsService();
