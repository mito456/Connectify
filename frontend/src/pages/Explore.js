import React, { useState, useEffect } from "react";
import API from "../api/axiosConfig";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";

function Explore() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrendingPosts();
    fetchSuggestedUsers();
  }, []);

  const fetchTrendingPosts = async () => {
    try {
      const res = await API.get("/posts");
      // Sort by number of likes
      const sorted = res.data.sort((a, b) => b.likes.length - a.likes.length);
      setTrendingPosts(sorted.slice(0, 10));
    } catch (err) {
      console.error("Error fetching trending posts:", err);
    }
  };

  const fetchSuggestedUsers = async () => {
    try {
      const res = await API.get("/users/suggested");
      setSuggestedUsers(res.data);
    } catch (err) {
      console.error("Error fetching suggested users:", err);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      alert("Please enter a search term");
      return;
    }
    
    try {
      const res = await API.get(`/users/search?query=${encodeURIComponent(searchTerm)}`);
      setSearchResults(res.data);
      setShowResults(true);
    } catch (err) {
      console.error("Error searching:", err);
      alert(err.response?.data?.msg || "Error searching users");
    }
  };

  const handleFollow = async (userId) => {
    try {
      await API.post(`/users/follow/${userId}`);
      
      // Update current user's following list
      const updatedUser = { ...currentUser, following: [...(currentUser.following || []), userId] };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("tokenChange"));
      
      // Refresh suggested users
      fetchSuggestedUsers();
      
      alert("User followed successfully!");
    } catch (err) {
      console.error("Error following user:", err);
      alert(err.response?.data?.msg || "Error following user");
    }
  };

  const viewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div>
      <Navbar />
      <div className="explore-container">
        <h2 style={{ textAlign: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "30px" }}>
          🔍 Explore Connectify
        </h2>

        {/* Search Section */}
        <div className="search-section">
          <input
            type="text"
            placeholder="🔎 Search for users by name or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="search-btn">Search</button>
        </div>

        {/* Search Results Section */}
        {showResults && (
          <div className="section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="section-title">🔎 Search Results</h3>
              <button onClick={() => setShowResults(false)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "1.2em" }}>✕</button>
            </div>
            {searchResults.length === 0 ? (
              <p style={{ textAlign: "center", color: "#888", margin: "20px 0" }}>No users found</p>
            ) : (
              <div className="users-grid">
                {searchResults.map((user) => (
                  <div key={user._id} className="user-card">
                    <div className="user-avatar">
                      {user.avatar && user.avatar.startsWith('/uploads') ? (
                        <img src={`http://localhost:5000${user.avatar}`} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        user.avatar || "👤"
                      )}
                    </div>
                    <h4>{user.name}</h4>
                    {user.username && <p className="user-username">@{user.username}</p>}
                    <p className="user-bio">{user.bio || "No bio yet"}</p>
                    <div style={{ display: "flex", gap: "15px", justifyContent: "center", margin: "10px 0", fontSize: "0.9em", color: "#666" }}>
                      <span><b>{user.followers?.length || 0}</b> followers</span>
                      <span><b>{user.following?.length || 0}</b> following</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginTop: "10px", justifyContent: "center" }}>
                      <button onClick={() => viewProfile(user._id)} className="view-profile-btn">View</button>
                      {user._id !== currentUser.id && !currentUser.following?.includes(user._id) && (
                        <button onClick={() => handleFollow(user._id)} className="follow-btn">Follow</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Suggested Users Section */}
        <div className="section">
          <h3 className="section-title">✨ Suggested Connections</h3>
          {suggestedUsers.length === 0 ? (
            <p style={{ textAlign: "center", color: "#888", margin: "20px 0" }}>No suggestions available</p>
          ) : (
            <div className="users-grid">
              {suggestedUsers.map((user) => (
                <div key={user._id} className="user-card">
                  <div className="user-avatar">
                    {user.avatar && user.avatar.startsWith('/uploads') ? (
                      <img src={`http://localhost:5000${user.avatar}`} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      user.avatar || "👤"
                    )}
                  </div>
                  <h4>{user.name}</h4>
                  {user.username && <p className="user-username">@{user.username}</p>}
                  <p className="user-bio">{user.bio || "No bio yet"}</p>
                  <div style={{ display: "flex", gap: "15px", justifyContent: "center", margin: "10px 0", fontSize: "0.9em", color: "#666" }}>
                    <span><b>{user.followers?.length || 0}</b> followers</span>
                    <span><b>{user.following?.length || 0}</b> following</span>
                  </div>
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px", justifyContent: "center" }}>
                    <button onClick={() => viewProfile(user._id)} className="view-profile-btn">View</button>
                    <button onClick={() => handleFollow(user._id)} className="follow-btn">Follow</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trending Posts Section */}
        <div className="section">
          <h3 className="section-title">🔥 Trending Posts</h3>
          <div className="trending-posts">
            {trendingPosts.length === 0 ? (
              <p style={{ textAlign: "center", color: "#888" }}>No posts yet</p>
            ) : (
              trendingPosts.map((post) => (
                <div key={post._id} className="trending-post">
                  <p className="post-content">{post.content}</p>
                  {post.image && (
                    <img 
                      src={post.image.startsWith('/uploads') ? `http://localhost:5000${post.image}` : post.image}
                      alt="Post content" 
                      className="post-image"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  {post.video && (
                    <video controls className="post-video">
                      <source 
                        src={post.video.startsWith('/uploads') ? `http://localhost:5000${post.video}` : post.video}
                        type="video/mp4" 
                      />
                      Your browser does not support the video tag.
                    </video>
                  )}
                  <div className="post-stats">
                    <span>❤️ {post.likes.length} likes</span>
                    <span>💬 {post.comments?.length || 0} comments</span>
                    <span className="post-author">By: @{post.username || post.userId}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Explore;
