import Post from "../models/Post.js";
import User from "../models/user.js";
import { createNotification } from "./notificationController.js";

// Create post
export const createPost = async (req, res) => {
  try {
    const { userId, content, image, video } = req.body;
    if (!content) return res.status(400).json({ msg: "Post content is required" });

    // Get user to fetch username and avatar
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const post = new Post({ 
      userId, 
      username: user.username || user.name,
      userAvatar: user.avatar || "",
      content, 
      image: image || "", 
      video: video || "" 
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get all posts
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    
    // Populate user avatar for each post
    const postsWithAvatars = await Promise.all(
      posts.map(async (post) => {
        const user = await User.findById(post.userId);
        return {
          ...post.toObject(),
          userAvatar: user ? user.avatar : ""
        };
      })
    );
    
    res.json(postsWithAvatars);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Like / Unlike post
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const userId = req.body.userId;
    const isLiking = !post.likes.includes(userId);
    
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id !== userId); // unlike
    } else {
      post.likes.push(userId); // like
      
      // Create notification for post owner
      if (isLiking) {
        const liker = await User.findById(userId);
        await createNotification({
          recipient: post.userId,
          sender: userId,
          senderName: liker.name,
          senderUsername: liker.username || "",
          senderAvatar: liker.avatar || "",
          type: 'like',
          postId: post._id.toString(),
          postContent: post.content.substring(0, 100)
        });
      }
    }

    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Add comment to post
export const addComment = async (req, res) => {
  try {
    const { userId, text } = req.body;
    if (!text) return res.status(400).json({ msg: "Comment text is required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    // Get user to fetch username
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const comment = {
      userId,
      username: user.username || user.name,
      text,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();
    
    // Create notification for post owner
    await createNotification({
      recipient: post.userId,
      sender: userId,
      senderName: user.name,
      senderUsername: user.username || "",
      senderAvatar: user.avatar || "",
      type: 'comment',
      postId: post._id.toString(),
      postContent: post.content.substring(0, 100),
      commentText: text.substring(0, 100)
    });
    
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    post.comments = post.comments.filter(comment => comment._id.toString() !== commentId);
    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
