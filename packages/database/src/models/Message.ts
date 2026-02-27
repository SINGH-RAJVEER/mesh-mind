import mongoose, { Schema } from "mongoose";
import type { Document } from "mongoose";

export interface IMessage extends Omit<Document, "_id"> {
  _id: string;
  user_id: mongoose.Types.ObjectId;
  conversation_id: string;
  user_message: string;
  bot_response: string;
  mood: string | null;
  is_crisis: boolean;
  timestamp: Date;
}

const messageSchema = new Schema<IMessage>({
  _id: { type: String, required: true },
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  conversation_id: { type: String, ref: "Conversation", required: true },
  user_message: String,
  bot_response: String,
  mood: String,
  is_crisis: Boolean,
  timestamp: { type: Date, default: Date.now },
});

// Create indexes for faster queries
messageSchema.index({ user_id: 1 });
messageSchema.index({ conversation_id: 1 });
messageSchema.index({ user_id: 1, conversation_id: 1 });
messageSchema.index({ timestamp: -1 });
messageSchema.index({ is_crisis: 1 });

export default mongoose.model<IMessage>("Message", messageSchema);
