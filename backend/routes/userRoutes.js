import express from "express";
const router = express.Router();
import { 
  getUserById, 
  updateProfile, 
  searchUsers, 
  followUser, 
  unfollowUser,
  getSuggestedUsers,
  getFollowingList,
  getAllUsers
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

// GET /api/users/search?query=username
router.get("/search", searchUsers);

// GET /api/users/all
router.get("/all", protect, getAllUsers);

// GET /api/users/suggested
router.get("/suggested", protect, getSuggestedUsers);

// GET /api/users/following
router.get("/following", protect, getFollowingList);

// GET /api/users/:id
router.get("/:id", getUserById);

// PUT /api/users/profile
router.put("/profile", protect, updateProfile);

// POST /api/users/follow/:id
router.post("/follow/:id", protect, followUser);

// POST /api/users/unfollow/:id
router.post("/unfollow/:id", protect, unfollowUser);

export default router;
