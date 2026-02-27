import type { Document } from "mongoose";
import { User, Conversation, Message } from "@mindscribe/database";
import type { IUser, IConversation, IMessage } from "@mindscribe/database";

export class UserService {
  static async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  static async findByUsername(username: string): Promise<IUser | null> {
    return User.findOne({ username });
  }
}

export class ConversationService {
  static async getConversationsByUserId(
    userId: string,
  ): Promise<IConversation[]> {
    const conversations = await Conversation.find({ user_id: userId }).lean();
    return conversations as unknown as IConversation[];
  }

  static async getConversationById(id: string): Promise<IConversation | null> {
    return Conversation.findById(id);
  }

  static async createConversation(
    userId: string,
    id: string,
  ): Promise<IConversation> {
    return Conversation.create({ _id: id, user_id: userId });
  }

  static async deleteConversation(id: string): Promise<boolean> {
    const result = await Conversation.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}

export class MessageService {
  static async getMessagesByConversationId(
    conversationId: string,
  ): Promise<IMessage[]> {
    const messages = await Message.find({ conversation_id: conversationId })
      .sort({ timestamp: 1 })
      .lean();
    return messages as unknown as IMessage[];
  }

  static async createMessage(
    messageData: Partial<IMessage>,
  ): Promise<IMessage> {
    return Message.create(messageData);
  }

  static async getCrisisMessages(userId: string): Promise<IMessage[]> {
    const messages = await Message.find({ user_id: userId, is_crisis: true })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();
    return messages as unknown as IMessage[];
  }
}
