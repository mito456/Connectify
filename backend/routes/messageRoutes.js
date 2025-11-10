import express from "express";
import { sendMessage, getMessages } from "../controllers/messageController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", verifyToken, sendMessage);
router.get("/:chatId", verifyToken, getMessages);

export default router;
