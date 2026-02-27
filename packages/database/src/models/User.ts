import mongoose, { Schema } from "mongoose";
import type { Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
}

const userSchema = new Schema<IUser>({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

// Create indexes for faster queries
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

export default mongoose.model<IUser>("User", userSchema);
