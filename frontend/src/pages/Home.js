import React, { useEffect, useState } from "react";
import API from "../api/axiosConfig";
import Post from "../components/Post";
import Navbar from "../components/Navbar";

function Home() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts");
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert("Please select an image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("Image size should be less than 10MB");
        return;
      }
      setImageFile(file);
      setVideoFile(null);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        alert("Please select a video file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("Video size should be less than 10MB");
        return;
      }
      setVideoFile(file);
      setImageFile(null);
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await API.post("/upload/single", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return res.data.fileUrl;
    } catch (err) {
      console.error("Error uploading file:", err);
      throw err;
    }
  };

  const createPost = async () => {
    if (!newPost.trim()) {
      alert("Please write something!");
      return;
    }
    
    setUploading(true);
    try {
      let imageUrl = "";
      let videoUrl = "";

      if (imageFile) {
        imageUrl = await uploadFile(imageFile);
      }

      if (videoFile) {
        videoUrl = await uploadFile(videoFile);
      }

      await API.post("/posts/create", { 
        userId: user.id, 
        content: newPost,
        image: imageUrl,
        video: videoUrl
      });
      
      setNewPost("");
      setImageFile(null);
      setVideoFile(null);
      document.getElementById('imageInput').value = '';
      document.getElementById('videoInput').value = '';
      
      fetchPosts();
    } catch (err) {
      console.error("Error creating post:", err);
      alert(err.response?.data?.msg || "Error creating post");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="home-container">
        <div className="create-post-card">
          <h2 className="section-title">✨ What's on your mind? ✨</h2>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="💭 Share your thoughts with the world..."
            className="post-textarea"
          />
          
          <div className="media-upload-section">
            <div className="file-upload-wrapper">
              <label htmlFor="imageInput" className="file-upload-label">
                🖼️ {imageFile ? imageFile.name : "Add Image"}
              </label>
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>

            <div className="file-upload-wrapper">
              <label htmlFor="videoInput" className="file-upload-label">
                🎥 {videoFile ? videoFile.name : "Add Video"}
              </label>
              <input
                id="videoInput"
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                style={{ display: 'none' }}
              />
            </div>

            {(imageFile || videoFile) && (
              <button 
                className="clear-media-btn"
                onClick={() => {
                  setImageFile(null);
                  setVideoFile(null);
                  document.getElementById('imageInput').value = '';
                  document.getElementById('videoInput').value = '';
                }}
              >
                ❌ Clear
              </button>
            )}
          </div>
          
          <button onClick={createPost} disabled={uploading} className="post-button">
            {uploading ? "📤 Posting..." : "📤 Share Post"}
          </button>
        </div>

        <div className="posts-section">
          <h3 className="posts-header">
            🌟 Recent Posts 🌟
          </h3>
          {posts.length === 0 ? (
            <div className="no-posts">
              <p>📝 No posts yet</p>
              <p style={{ fontSize: "0.9em", color: "#888" }}>Be the first to share something!</p>
            </div>
          ) : (
            posts.map((post) => (
              <Post key={post._id} post={post} currentUser={user} refresh={fetchPosts} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
