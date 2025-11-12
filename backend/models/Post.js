import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, default: "" },
  userAvatar: { type: String, default: "" },
  content: { type: String, required: true },
  image: { type: String, default: "" },
  video: { type: String, default: "" },
  likes: { type: [String], default: [] },
  comments: { type: [commentSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Post", postSchema);
