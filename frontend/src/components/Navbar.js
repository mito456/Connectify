import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axiosConfig";

function Navbar() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    fetchUnreadMessagesCount();
    
    // Refresh counts every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchUnreadMessagesCount();
    }, 30000);
    
    // Listen for storage changes (when messages are marked as seen)
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('lastSeenMessages_')) {
        fetchUnreadMessagesCount();
      }
    };
    
    // Listen for custom event when localStorage is updated in same tab
    const handleLastSeenUpdate = () => {
      fetchUnreadMessagesCount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('lastSeenUpdated', handleLastSeenUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('lastSeenUpdated', handleLastSeenUpdate);
    };
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await API.get("/notifications/unread-count");
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  const fetchUnreadMessagesCount = async () => {
    try {
      // Get last seen data from localStorage
      const savedLastSeen = localStorage.getItem(`lastSeenMessages_${currentUser.id}`);
      const lastSeenMessages = savedLastSeen ? JSON.parse(savedLastSeen) : {};
      
      // Get all chats for the current user
      const chatsRes = await API.get(`/chat/${currentUser.id}`);
      const chats = chatsRes.data;
      
      let totalUnread = 0;
      
      for (const chat of chats) {
        try {
          // Get the other user ID
          const otherUserId = chat.members.find(memberId => memberId !== currentUser.id);
          
          // Get messages for this chat
          const messagesRes = await API.get(`/message/${chat._id}`);
          const messages = messagesRes.data;
          
          if (messages.length > 0) {
            // Get last message from the other user
            const messagesFromOther = messages.filter(msg => msg.senderId !== currentUser.id);
            
            if (messagesFromOther.length > 0) {
              const lastMsgFromOther = messagesFromOther[messagesFromOther.length - 1];
              const lastSeenTime = lastSeenMessages[otherUserId];
              
              // If no last seen time, or last message is newer than last seen
              if (!lastSeenTime || new Date(lastMsgFromOther.createdAt) > new Date(lastSeenTime)) {
                totalUnread++;
              }
            }
          }
        } catch (err) {
          console.error(`Error fetching messages for chat ${chat._id}:`, err);
        }
      }
      
      setUnreadMessagesCount(totalUnread);
    } catch (err) {
      console.error("Error fetching unread messages count:", err);
    }
  };
  
  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav>
      <div style={{ fontSize: "1.5em", fontWeight: "bold" }}>
        <Link to="/home" style={{ color: "white" }}>🌐 Connectify</Link>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Link to="/home">🏠 Home</Link>
        <Link to="/explore">🔍 Explore</Link>
        <Link to="/chat" style={{ position: "relative", display: "inline-block" }}>
          💬 Chat
          {unreadMessagesCount > 0 && (
            <span style={{
              position: "absolute",
              top: "-8px",
              right: "-10px",
              background: "red",
              color: "white",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.7em",
              fontWeight: "bold"
            }}>
              {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
            </span>
          )}
        </Link>
        <Link to="/notifications" style={{ position: "relative", display: "inline-block" }}>
          🔔 Notifications
          {unreadCount > 0 && (
            <span style={{
              position: "absolute",
              top: "-8px",
              right: "-10px",
              background: "red",
              color: "white",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.7em",
              fontWeight: "bold"
            }}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        <Link to="/dashboard">📊 Dashboard</Link>
        <Link to={`/profile/${currentUser?.id || ""}`}>👤 Profile</Link>
        <Link to="/settings">⚙️ Settings</Link>
        <button onClick={logout}>🚪 Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
