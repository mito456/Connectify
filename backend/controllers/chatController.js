import Chat from "../models/Chat.js";

// Create or fetch chat between two users
export const createChat = async (req, res) => {
  const { senderId, receiverId } = req.body;
  if (!senderId || !receiverId) return res.status(400).json({ msg: "User IDs required" });

  try {
    let chat = await Chat.findOne({ members: { $all: [senderId, receiverId] } });
    if (!chat) {
      chat = new Chat({ members: [senderId, receiverId] });
      await chat.save();
    }
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Get all chats for a user
export const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ members: { $in: [req.params.userId] } }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
