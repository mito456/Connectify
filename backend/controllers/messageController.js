import Message from "../models/Message.js";

// Send message
export const sendMessage = async (req, res) => {
  const { chatId, senderId, text } = req.body;
  if (!chatId || !senderId || !text) return res.status(400).json({ msg: "All fields required" });

  try {
    const message = new Message({ chatId, senderId, text });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Get messages of a chat
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
