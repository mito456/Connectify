import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server as IOServer } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authroutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// routes
app.use("/api/auth", authRoutes);
// After app.use("/api/auth", authRoutes);

import postRoutes from "./routes/postRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

app.use("/api/posts", postRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);


// start http + socket.io server
const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

const io = new IOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const users = {}; // socketId -> userId

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Add user
  socket.on("addUser", (userId) => {
    users[userId] = socket.id;
  });

  // Send message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const receiverSocket = users[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit("getMessage", { senderId, text });
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    for (let key in users) {
      if (users[key] === socket.id) delete users[key];
    }
  });
});


httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
