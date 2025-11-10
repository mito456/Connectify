import express from "express";
import { createChat, getUserChats } from "../controllers/chatController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createChat);
router.get("/:userId", verifyToken, getUserChats);

export default router;
