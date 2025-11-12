import React, { useEffect, useState } from "react";
import API from "../api/axiosConfig";
import Post from "../components/Post";
import Navbar from "../components/Navbar";

function Feed() {
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
      setVideoFile(null); // Clear video if image is selected
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
      setImageFile(null); // Clear image if video is selected
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

      // Upload image if selected
      if (imageFile) {
        imageUrl = await uploadFile(imageFile);
      }

      // Upload video if selected
      if (videoFile) {
        videoUrl = await uploadFile(videoFile);
      }

      // Create post with uploaded file URLs
      await API.post("/posts/create", { 
        userId: user.id, 
        content: newPost,
        image: imageUrl,
        video: videoUrl
      });
      
      setNewPost("");
      setImageFile(null);
      setVideoFile(null);
      // Clear file inputs
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
      <div className="feed-page">
        <div className="feed-container">
          <h2 style={{ textAlign: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "30px" }}>
            ✨ Share Your Thoughts ✨
          </h2>
          
          <div className="create-post-section">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="💭 What's on your mind?"
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
            
            <button onClick={createPost} disabled={uploading} className="create-post-btn">
              {uploading ? "📤 Posting..." : "📤 POST"}
            </button>
          </div>

          <div className="posts-section">
            <h3 style={{ textAlign: "center", background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "20px" }}>
              🌟 Recent Posts 🌟
            </h3>
            {posts.length === 0 ? (
              <p style={{ textAlign: "center", color: "#888", padding: "20px" }}>No posts yet. Be the first to post!</p>
            ) : (
              posts.map((post) => (
                <Post key={post._id} post={post} currentUser={user} refresh={fetchPosts} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Feed;
