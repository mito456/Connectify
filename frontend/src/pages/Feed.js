import React, { useEffect, useState } from "react";
import API from "../api/axiosConfig";
import Post from "../components/Post";
import Navbar from "../components/Navbar";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts");
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const createPost = async () => {
    if (!newPost) return;
    try {
      await API.post("/posts/create", { userId: user.id, content: newPost });
      setNewPost("");
      fetchPosts();
    } catch (err) {
      console.error("Error creating post:", err);
      alert(err.response?.data?.msg || "Error creating post");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="feed-container">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's on your mind?"
        />
        <button onClick={createPost}>Post</button>

        {posts.map((post) => (
          <Post key={post._id} post={post} currentUser={user} refresh={fetchPosts} />
        ))}
      </div>
    </div>
  );
}

export default Feed;
