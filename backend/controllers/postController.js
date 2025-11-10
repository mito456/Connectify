import Post from "../models/Post.js";

// Create post
export const createPost = async (req, res) => {
  try {
    const { userId, content, image } = req.body;
    if (!content) return res.status(400).json({ msg: "Post content is required" });

    const post = new Post({ userId, content, image: image || "" });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Get all posts
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Like / Unlike post
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const userId = req.body.userId;
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id !== userId); // unlike
    } else {
      post.likes.push(userId); // like
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
