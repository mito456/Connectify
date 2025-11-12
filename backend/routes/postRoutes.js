import express from "express";
import { createPost, getPosts, likePost, addComment, deleteComment } from "../controllers/postController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", verifyToken, createPost);
router.get("/", getPosts);
router.put("/like/:id", verifyToken, likePost);
router.post("/:id/comment", verifyToken, addComment);
router.delete("/:postId/comment/:commentId", verifyToken, deleteComment);

export default router;
