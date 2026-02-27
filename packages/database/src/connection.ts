import mongoose from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/mindscribe");

const db = mongoose.connection;
db.on("error", (err: Error) => {
  console.error("MongoDB connection error:", err);
});
db.once("open", () => {
  console.log("Connected to MongoDB");
});

export default db;
