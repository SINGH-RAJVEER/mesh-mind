import mongoose, { Schema } from "mongoose";
import type { Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username?: string;
  email: string;
  password?: string;
  profile_picture?: string;
  provider: "local" | "google" | "github";
  provider_id?: string;
  created_at: Date;
  updated_at: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, sparse: true },
    profile_picture: { type: String, default: null },
    provider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },
    provider_id: { type: String, sparse: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

// Create indexes for faster queries
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ provider: 1, provider_id: 1 });

export default mongoose.model<IUser>("User", userSchema);
