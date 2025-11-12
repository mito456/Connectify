import React, { useState, useEffect } from "react";
import API from "../api/axiosConfig";
import Navbar from "../components/Navbar";

function Dashboard() {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalFollowers: 0,
    totalFollowing: 0,
    postsThisMonth: 0,
    engagementRate: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await API.get(`/users/${currentUser.id}`);
      setUserProfile(res.data);
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const res = await API.get("/posts");
      const userPosts = res.data.filter(post => post.userId === currentUser.id);
      
      const totalLikes = userPosts.reduce((acc, post) => acc + post.likes.length, 0);
      const totalComments = userPosts.reduce((acc, post) => acc + (post.comments?.length || 0), 0);
      const sortedByLikes = [...userPosts].sort((a, b) => b.likes.length - a.likes.length);
      
      // Calculate posts this month
      const now = new Date();
      const thisMonth = userPosts.filter(post => {
        const postDate = new Date(post.createdAt);
        return postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear();
      });

      // Calculate engagement rate (likes + comments per post)
      const totalEngagements = totalLikes + totalComments;
      const engagementRate = userPosts.length > 0 
        ? ((totalEngagements / userPosts.length)).toFixed(1)
        : 0;

      // Get real followers and following count
      const followers = currentUser.followers?.length || 0;
      const following = currentUser.following?.length || 0;

      setStats({
        totalPosts: userPosts.length,
        totalLikes: totalLikes,
        totalComments: totalComments,
        totalFollowers: followers,
        totalFollowing: following,
        postsThisMonth: thisMonth.length,
        engagementRate: engagementRate
      });

      setTopPosts(sortedByLikes.slice(0, 5));

      // Generate recent activity based on actual data
      generateRecentActivity(userPosts);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  const generateRecentActivity = (posts) => {
    const activities = [];
    
    // Get recent posts
    const recentPosts = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
    
    recentPosts.forEach(post => {
      const timeAgo = getTimeAgo(post.createdAt);
      activities.push({
        icon: "📝",
        text: `Created: "${post.content.substring(0, 30)}${post.content.length > 30 ? '...' : ''}"`,
        time: timeAgo
      });
      
      if (post.likes.length > 0) {
        activities.push({
          icon: "❤️",
          text: `Received ${post.likes.length} like${post.likes.length > 1 ? 's' : ''}`,
          time: timeAgo
        });
      }
      
      if (post.comments && post.comments.length > 0) {
        activities.push({
          icon: "💬",
          text: `${post.comments.length} comment${post.comments.length > 1 ? 's' : ''} on your post`,
          time: timeAgo
        });
      }
    });

    setRecentActivity(activities.slice(0, 5));
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const seconds = Math.floor((now - postDate) / 1000);
    
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minute${Math.floor(seconds / 60) > 1 ? 's' : ''} ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) > 1 ? 's' : ''} ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) > 1 ? 's' : ''} ago`;
    return postDate.toLocaleDateString();
  };

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <h2 style={{ textAlign: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "30px" }}>
          📊 Your Dashboard
        </h2>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="dashboard-stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-value">{stats.totalPosts}</div>
            <div className="stat-label">Total Posts</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="stat-icon">❤️</div>
            <div className="stat-value">{stats.totalLikes}</div>
            <div className="stat-label">Total Likes</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{stats.totalFollowers}</div>
            <div className="stat-label">Followers</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="stat-icon">🔗</div>
            <div className="stat-value">{stats.totalFollowing}</div>
            <div className="stat-label">Following</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-value">{stats.postsThisMonth}</div>
            <div className="stat-label">Posts This Month</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-value">{stats.engagementRate}</div>
            <div className="stat-label">Avg Engagement</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-value">{stats.totalComments}</div>
            <div className="stat-label">Total Comments</div>
          </div>
        </div>

        {/* Activity Overview */}
        <div className="dashboard-section">
          <h3 className="dashboard-section-title">⚡ Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p style={{ textAlign: "center", color: "#888", padding: "20px" }}>
              No recent activity. Start creating posts!
            </p>
          ) : (
            <div className="activity-list">
              {recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <span className="activity-icon">{activity.icon}</span>
                  <span className="activity-text">{activity.text}</span>
                  <span className="activity-time">{activity.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Posts */}
        <div className="dashboard-section">
          <h3 className="dashboard-section-title">🏆 Your Top Posts</h3>
          {topPosts.length === 0 ? (
            <p style={{ textAlign: "center", color: "#888", padding: "20px" }}>
              No posts yet. Start creating content!
            </p>
          ) : (
            <div className="top-posts-list">
              {topPosts.map((post, index) => (
                <div key={post._id} className="top-post-item">
                  <div className="post-rank">#{index + 1}</div>
                  <div className="post-details">
                    <p className="post-text">{post.content}</p>
                    <p className="post-likes">❤️ {post.likes.length} likes</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="dashboard-section">
          <h3 className="dashboard-section-title">📌 Quick Stats</h3>
          <div className="quick-stats">
            <div className="quick-stat">
              <span className="quick-stat-label">Average Likes per Post:</span>
              <span className="quick-stat-value">
                {stats.totalPosts > 0 ? (stats.totalLikes / stats.totalPosts).toFixed(1) : 0}
              </span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat-label">Average Comments per Post:</span>
              <span className="quick-stat-value">
                {stats.totalPosts > 0 ? (stats.totalComments / stats.totalPosts).toFixed(1) : 0}
              </span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat-label">Follower/Following Ratio:</span>
              <span className="quick-stat-value">
                {stats.totalFollowing > 0 ? (stats.totalFollowers / stats.totalFollowing).toFixed(2) : stats.totalFollowers}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
