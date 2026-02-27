import mongoose, { Schema } from "mongoose";
import type { Document } from "mongoose";

export interface IConversation extends Omit<Document, "_id"> {
  _id: string;
  user_id: mongoose.Types.ObjectId;
}

const conversationSchema = new Schema<IConversation>({
  _id: { type: String, required: true },
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

// Create indexes for faster queries
conversationSchema.index({ user_id: 1 });
conversationSchema.index({ _id: 1, user_id: 1 });

export default mongoose.model<IConversation>(
  "Conversation",
  conversationSchema,
);
