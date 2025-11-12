import React, { useState, useEffect } from "react";
import API from "../api/axiosConfig";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    
    // Refresh notifications every 10 seconds
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const res = await API.get(`/notifications?filter=${filter}`);
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await API.get("/notifications/unread-count");
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put("/notifications/mark-all-read");
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const seconds = Math.floor((now - notifDate) / 1000);
    
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return notifDate.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like": return "";
      case "comment": return "";
      case "follow": return "";
      default: return "";
    }
  };

  const getNotificationText = (notif) => {
    switch (notif.type) {
      case "like":
        return `${notif.senderName} liked your post`;
      case "comment":
        return `${notif.senderName} commented on your post`;
      case "follow":
        return `${notif.senderName} started following you`;
      default:
        return "New notification";
    }
  };

  const handleNotificationClick = (notif) => {
    markAsRead(notif._id);
    if (notif.postId) {
      navigate("/home");
    } else if (notif.type === "follow") {
      navigate(`/profile/${notif.sender}`);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="notifications-container">
        <div className="notifications-header">
          <h2> Notifications</h2>
          {unreadCount > 0 && (
            <div className="unread-badge">{unreadCount} new</div>
          )}
        </div>

        <div className="notification-controls">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              ALL
            </button>
            <button 
              className={`filter-btn ${filter === "likes" ? "active" : ""}`}
              onClick={() => setFilter("likes")}
            >
               LIKES
            </button>
            <button 
              className={`filter-btn ${filter === "follows" ? "active" : ""}`}
              onClick={() => setFilter("follows")}
            >
               FOLLOWS
            </button>
            <button 
              className={`filter-btn ${filter === "comments" ? "active" : ""}`}
              onClick={() => setFilter("comments")}
            >
               COMMENTS
            </button>
          </div>
          
          {unreadCount > 0 && (
            <button className="mark-read-btn" onClick={markAllAsRead}>
               MARK ALL AS READ
            </button>
          )}
        </div>

        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="no-notifications">
              <p style={{ fontSize: "3em" }}></p>
              <p>No notifications yet</p>
              <p style={{ fontSize: "0.9em", color: "#888" }}>
                When someone likes your post, comments, or follows you, you will see it here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif._id} 
                className={`notification-item ${!notif.read ? "unread" : ""}`}
                onClick={() => handleNotificationClick(notif)}
                style={{ cursor: "pointer" }}
              >
                <div className="notification-icon">{getNotificationIcon(notif.type)}</div>
                <div className="notification-avatar">
                  {notif.senderAvatar && notif.senderAvatar.startsWith("/uploads") ? (
                    <img src={`http://localhost:5000${notif.senderAvatar}`} alt="avatar" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    notif.senderAvatar || ""
                  )}
                </div>
                <div className="notification-content">
                  <p className="notification-text">
                    <b>@{notif.senderUsername || notif.senderName}</b> {getNotificationText(notif).replace(notif.senderName, "")}
                  </p>
                  {notif.postContent && (
                    <div className="notification-preview">
                      "{notif.postContent}"
                    </div>
                  )}
                  {notif.commentText && (
                    <div className="notification-preview">
                       "{notif.commentText}"
                    </div>
                  )}
                  <p className="notification-time">{getTimeAgo(notif.createdAt)}</p>
                </div>
                <div className="notification-actions">
                  {!notif.read && (
                    <button 
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notif._id);
                      }}
                      title="Mark as read"
                    >
                      
                    </button>
                  )}
                  <button 
                    className="action-btn delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif._id);
                    }}
                    title="Delete"
                  >
                    
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications;
