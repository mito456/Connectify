import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axiosConfig";
import Navbar from "../components/Navbar";
import Post from "../components/Post";

function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", username: "", bio: "", avatar: "" });
  const [userPosts, setUserPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);

  const isOwnProfile = !userId || userId === currentUser.id;

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const targetUserId = userId || currentUser.id;
      
      if (isOwnProfile) {
        // Use current user data
        setProfile({
          id: currentUser.id,
          name: currentUser.name,
          username: currentUser.username || "",
          email: currentUser.email,
          bio: currentUser.bio || "Hey there! I'm using Connectify 🚀",
          avatar: currentUser.avatar || "👤",
          followers: currentUser.followers || [],
          following: currentUser.following || []
        });
        setEditForm({
          name: currentUser.name,
          username: currentUser.username || "",
          bio: currentUser.bio || "",
          avatar: currentUser.avatar || ""
        });
      } else {
        // Fetch other user's profile
        const res = await API.get(`/users/${targetUserId}`);
        setProfile({
          id: res.data._id,
          name: res.data.name,
          username: res.data.username || "",
          email: res.data.email,
          bio: res.data.bio || "Hey there! I'm using Connectify 🚀",
          avatar: res.data.avatar || "👤",
          followers: res.data.followers || [],
          following: res.data.following || []
        });
        setIsFollowing(currentUser.following?.includes(targetUserId) || false);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const res = await API.get("/posts");
      const targetUserId = userId || currentUser.id;
      const filtered = res.data.filter(post => post.userId === targetUserId);
      setUserPosts(filtered);
    } catch (err) {
      console.error("Error fetching user posts:", err);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setUploading(true);
      
      let avatarUrl = editForm.avatar;
      
      // Upload avatar if file is selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        
        const uploadRes = await API.post("/upload/single", formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        avatarUrl = uploadRes.data.fileUrl;
      }
      
      const res = await API.put("/users/profile", {
        ...editForm,
        avatar: avatarUrl
      });
      const updatedUser = res.data.user;
      
      // Update local storage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("tokenChange"));
      
      setProfile({ 
        ...profile, 
        name: updatedUser.name,
        username: updatedUser.username,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar
      });
      setIsEditing(false);
      setAvatarFile(null);
      alert("Profile updated successfully! ✨");
    } catch (err) {
      console.error("Error updating profile:", err);
      const errorMsg = err.response?.data?.msg || "Error updating profile";
      alert(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      setAvatarFile(file);
    }
  };

  const handleFollow = async () => {
    try {
      await API.post(`/users/follow/${profile.id}`);
      setIsFollowing(true);
      setProfile({ ...profile, followers: [...profile.followers, currentUser.id] });
      
      // Update current user's following list
      const updatedUser = { ...currentUser, following: [...(currentUser.following || []), profile.id] };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("tokenChange"));
    } catch (err) {
      console.error("Error following user:", err);
      alert(err.response?.data?.msg || "Error following user");
    }
  };

  const handleUnfollow = async () => {
    try {
      await API.post(`/users/unfollow/${profile.id}`);
      setIsFollowing(false);
      setProfile({ ...profile, followers: profile.followers.filter(id => id !== currentUser.id) });
      
      // Update current user's following list
      const updatedUser = { ...currentUser, following: (currentUser.following || []).filter(id => id !== profile.id) };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("tokenChange"));
    } catch (err) {
      console.error("Error unfollowing user:", err);
      alert(err.response?.data?.msg || "Error unfollowing user");
    }
  };

  const fetchFollowersList = async () => {
    try {
      if (!profile || !profile.followers || profile.followers.length === 0) {
        setFollowersList([]);
        return;
      }
      
      // Fetch user details for all followers
      const followersData = await Promise.all(
        profile.followers.map(async (followerId) => {
          try {
            const res = await API.get(`/users/${followerId}`);
            return res.data;
          } catch (err) {
            console.error(`Error fetching user ${followerId}:`, err);
            return null;
          }
        })
      );
      
      setFollowersList(followersData.filter(user => user !== null));
      setShowFollowersModal(true);
    } catch (err) {
      console.error("Error fetching followers list:", err);
    }
  };

  const fetchFollowingList = async () => {
    try {
      if (!profile || !profile.following || profile.following.length === 0) {
        setFollowingList([]);
        return;
      }
      
      // Fetch user details for all following
      const followingData = await Promise.all(
        profile.following.map(async (followingId) => {
          try {
            const res = await API.get(`/users/${followingId}`);
            return res.data;
          } catch (err) {
            console.error(`Error fetching user ${followingId}:`, err);
            return null;
          }
        })
      );
      
      setFollowingList(followingData.filter(user => user !== null));
      setShowFollowingModal(true);
    } catch (err) {
      console.error("Error fetching following list:", err);
    }
  };

  const viewUserProfile = (userId) => {
    setShowFollowersModal(false);
    setShowFollowingModal(false);
    navigate(`/profile/${userId}`);
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div>
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.avatar && profile.avatar.startsWith('/uploads') ? (
              <img src={`http://localhost:5000${profile.avatar}`} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              profile.avatar || "👤"
            )}
          </div>
          <div className="profile-info">
            {isEditing ? (
              <div className="edit-form">
                <input
                  name="name"
                  value={editForm.name}
                  onChange={handleChange}
                  placeholder="Name"
                  className="profile-input"
                />
                <input
                  name="username"
                  value={editForm.username}
                  onChange={handleChange}
                  placeholder="@username"
                  className="profile-input"
                />
                <div className="avatar-upload-section">
                  <label htmlFor="avatarInput" className="avatar-upload-label">
                    📷 {avatarFile ? avatarFile.name : "Upload Profile Picture"}
                  </label>
                  <input
                    id="avatarInput"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                  {avatarFile && (
                    <button 
                      className="clear-avatar-btn"
                      onClick={() => setAvatarFile(null)}
                      type="button"
                    >
                      ❌
                    </button>
                  )}
                </div>
                <input
                  name="avatar"
                  value={editForm.avatar}
                  onChange={handleChange}
                  placeholder="Or use emoji/text as avatar"
                  className="profile-input"
                />
                <textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={handleChange}
                  placeholder="Bio"
                  className="profile-textarea"
                />
                <div className="profile-actions">
                  <button onClick={handleSave} className="save-btn" disabled={uploading}>
                    {uploading ? "💾 Saving..." : "💾 Save"}
                  </button>
                  <button onClick={() => {
                    setIsEditing(false);
                    setAvatarFile(null);
                  }} className="cancel-btn">❌ Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <h2>{profile.name}</h2>
                {profile.username && <p className="profile-username">@{profile.username}</p>}
                <p className="profile-email">📧 {profile.email}</p>
                <p className="profile-bio">{profile.bio}</p>
                {isOwnProfile ? (
                  <button onClick={handleEdit} className="edit-btn">Edit Profile</button>
                ) : (
                  <button 
                    onClick={isFollowing ? handleUnfollow : handleFollow} 
                    className={isFollowing ? "unfollow-btn" : "follow-btn"}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card" onClick={fetchUserPosts} style={{ cursor: "pointer" }}>
            <h3>{userPosts.length}</h3>
            <p>Posts</p>
          </div>
          <div className="stat-card" onClick={fetchFollowersList} style={{ cursor: "pointer" }}>
            <h3>{profile.followers.length}</h3>
            <p>Followers</p>
          </div>
          <div className="stat-card" onClick={fetchFollowingList} style={{ cursor: "pointer" }}>
            <h3>{profile.following.length}</h3>
            <p>Following</p>
          </div>
        </div>

        <div className="profile-posts-section">
          <h3 style={{ textAlign: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            📝 Posts
          </h3>
          {userPosts.length === 0 ? (
            <p style={{ textAlign: "center", marginTop: "20px", color: "#888" }}>No posts yet</p>
          ) : (
            userPosts.map((post) => (
              <Post key={post._id} post={post} currentUser={currentUser} refresh={fetchUserPosts} />
            ))
          )}
        </div>
      </div>

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="modal-overlay" onClick={() => setShowFollowersModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Followers ({followersList.length})</h3>
              <button 
                onClick={() => setShowFollowersModal(false)}
                style={{ background: "transparent", color: "#666", fontSize: "1.5em", padding: "0", margin: "0", boxShadow: "none" }}
              >
                ✕
              </button>
            </div>
            <div className="modal-users-list">
              {followersList.length === 0 ? (
                <p style={{ textAlign: "center", color: "#888", padding: "20px" }}>No followers yet</p>
              ) : (
                followersList.map((user) => (
                  <div
                    key={user._id}
                    className="modal-user-item"
                    onClick={() => viewUserProfile(user._id)}
                  >
                    <div className="chat-avatar">
                      {user.avatar && user.avatar.startsWith('/uploads') ? (
                        <img src={`http://localhost:5000${user.avatar}`} alt="avatar" />
                      ) : (
                        <div className="avatar-placeholder">{user.avatar || "👤"}</div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{user.name}</div>
                      {user.username && <div style={{ fontSize: "0.85em", color: "#666" }}>@{user.username}</div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className="modal-overlay" onClick={() => setShowFollowingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Following ({followingList.length})</h3>
              <button 
                onClick={() => setShowFollowingModal(false)}
                style={{ background: "transparent", color: "#666", fontSize: "1.5em", padding: "0", margin: "0", boxShadow: "none" }}
              >
                ✕
              </button>
            </div>
            <div className="modal-users-list">
              {followingList.length === 0 ? (
                <p style={{ textAlign: "center", color: "#888", padding: "20px" }}>Not following anyone yet</p>
              ) : (
                followingList.map((user) => (
                  <div
                    key={user._id}
                    className="modal-user-item"
                    onClick={() => viewUserProfile(user._id)}
                  >
                    <div className="chat-avatar">
                      {user.avatar && user.avatar.startsWith('/uploads') ? (
                        <img src={`http://localhost:5000${user.avatar}`} alt="avatar" />
                      ) : (
                        <div className="avatar-placeholder">{user.avatar || "👤"}</div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{user.name}</div>
                      {user.username && <div style={{ fontSize: "0.85em", color: "#666" }}>@{user.username}</div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
