import User from "../models/user.js";
import { createNotification } from "./notificationController.js";

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, username, bio, avatar } = req.body;
    const userId = req.user.id; // from auth middleware

    // Check if username is taken by another user
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ msg: "Username already taken" });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (username !== undefined) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("-password");

    res.json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        followers: user.followers,
        following: user.following
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Search users by username or name
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ msg: "Search query required" });

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } }
      ]
    })
      .select("-password")
      .limit(20);

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Follow a user
export const followUser = async (req, res) => {
  try {
    const userToFollow = req.params.id;
    const currentUserId = req.user.id;

    if (userToFollow === currentUserId) {
      return res.status(400).json({ msg: "You cannot follow yourself" });
    }

    const user = await User.findById(currentUserId);
    const targetUser = await User.findById(userToFollow);

    if (!targetUser) return res.status(404).json({ msg: "User not found" });

    // Check if already following
    if (user.following.includes(userToFollow)) {
      return res.status(400).json({ msg: "Already following this user" });
    }

    // Add to following list
    user.following.push(userToFollow);
    await user.save();

    // Add to target user's followers list
    targetUser.followers.push(currentUserId);
    await targetUser.save();

    // Create notification for the followed user
    await createNotification({
      recipient: userToFollow,
      sender: currentUserId,
      senderName: user.name,
      senderUsername: user.username || "",
      senderAvatar: user.avatar || "",
      type: 'follow'
    });

    res.json({ msg: "User followed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = req.params.id;
    const currentUserId = req.user.id;

    const user = await User.findById(currentUserId);
    const targetUser = await User.findById(userToUnfollow);

    if (!targetUser) return res.status(404).json({ msg: "User not found" });

    // Remove from following list
    user.following = user.following.filter(id => id !== userToUnfollow);
    await user.save();

    // Remove from target user's followers list
    targetUser.followers = targetUser.followers.filter(id => id !== currentUserId);
    await targetUser.save();

    res.json({ msg: "User unfollowed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get suggested users (users not followed)
export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUser = await User.findById(currentUserId);

    const users = await User.find({
      _id: { $ne: currentUserId, $nin: currentUser.following }
    })
      .select("-password")
      .limit(10);

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get following list with user details
export const getFollowingList = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Get full user details for all following users
    const followingUsers = await User.find({
      _id: { $in: currentUser.following }
    }).select("-password");

    res.json(followingUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get all users (for chat)
export const getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const users = await User.find({
      _id: { $ne: currentUserId }
    })
      .select("-password")
      .limit(50);

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
