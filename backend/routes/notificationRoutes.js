import express from "express";
const router = express.Router();
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead,
  deleteNotification 
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

// GET /api/notifications?filter=all|likes|comments|follows
router.get("/", protect, getNotifications);

// GET /api/notifications/unread-count
router.get("/unread-count", protect, getUnreadCount);

// PUT /api/notifications/:id/read
router.put("/:id/read", protect, markAsRead);

// PUT /api/notifications/mark-all-read
router.put("/mark-all-read", protect, markAllAsRead);

// DELETE /api/notifications/:id
router.delete("/:id", protect, deleteNotification);

export default router;
