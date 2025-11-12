import express from "express";
const router = express.Router();
import upload from "../config/upload.js";
import { uploadFile, uploadMultipleFiles } from "../controllers/uploadController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

// Single file upload
router.post("/single", verifyToken, upload.single('file'), uploadFile);

// Multiple files upload
router.post("/multiple", verifyToken, upload.array('files', 5), uploadMultipleFiles);

export default router;
