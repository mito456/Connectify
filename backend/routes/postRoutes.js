import express from "express";
import { createPost, getPosts, likePost } from "../controllers/postController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", verifyToken, createPost);
router.get("/", getPosts);
router.put("/like/:id", verifyToken, likePost);

export default router;
