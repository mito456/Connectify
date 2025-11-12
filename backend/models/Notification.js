import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: { type: String, required: true }, // userId who receives notification
  sender: { type: String, required: true }, // userId who triggered the notification
  senderName: { type: String, required: true },
  senderUsername: { type: String, default: "" },
  senderAvatar: { type: String, default: "" },
  type: { 
    type: String, 
    required: true, 
    enum: ['like', 'comment', 'follow'] 
  },
  postId: { type: String, default: "" }, // for likes and comments
  postContent: { type: String, default: "" }, // preview of the post
  commentText: { type: String, default: "" }, // for comments
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Index for faster queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

export default mongoose.model("Notification", notificationSchema);
