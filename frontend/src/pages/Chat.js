import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import API from "../api/axiosConfig";
import Navbar from "../components/Navbar";

// Replace 'localhost' with your IP address (e.g., '192.168.1.100') for network access
const socket = io("http://localhost:5000");

function Chat() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [chatUsers, setChatUsers] = useState([]); // Users with active chats
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [chat, setChat] = useState(null);
  const [chatsWithPreviews, setChatsWithPreviews] = useState({});
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastSeenMessages, setLastSeenMessages] = useState({});

  useEffect(() => {
    // Load last seen messages from localStorage
    const savedLastSeen = localStorage.getItem(`lastSeenMessages_${user.id}`);
    if (savedLastSeen) {
      setLastSeenMessages(JSON.parse(savedLastSeen));
    }
  }, [user.id]);

  useEffect(() => {
    fetchChatUsers();
    fetchAllUsers();
    socket.emit("addUser", user.id);

    socket.on("getMessage", (data) => {
      // Add message to current chat if it's the selected one
      if (selectedUser && (data.senderId === selectedUser._id || data.senderId === user.id)) {
        setMessages((prev) => [...prev, { senderId: data.senderId, text: data.text, createdAt: new Date() }]);
      }
      // Refresh chat list to show new messages
      fetchChatUsers();
    });

    return () => socket.disconnect();
  }, [user.id]);

  const fetchChatUsers = async () => {
    try {
      // Get all chats for the current user
      const chatsRes = await API.get(`/chat/${user.id}`);
      const chats = chatsRes.data;
      
      if (chats.length === 0) {
        setChatUsers([]);
        setChatsWithPreviews({});
        return;
      }

      // Get user details and last message for each chat
      const usersWithChats = [];
      const previews = {};

      for (const chat of chats) {
        // Find the other user in the chat
        const otherUserId = chat.members.find(memberId => memberId !== user.id);
        
        if (otherUserId) {
          try {
            // Fetch user details
            const userRes = await API.get(`/users/${otherUserId}`);
            const chatUser = userRes.data;
            
            // Get messages for this chat
            const messagesRes = await API.get(`/message/${chat._id}`);
            const msgs = messagesRes.data;
            
            // Only add users with at least one message
            if (msgs.length > 0) {
              const lastMsg = msgs[msgs.length - 1];
              
              usersWithChats.push({
                ...chatUser,
                lastMessageTime: new Date(lastMsg.createdAt)
              });
              
              previews[chatUser._id] = {
                text: lastMsg.text,
                time: lastMsg.createdAt,
                senderId: lastMsg.senderId
              };
            }
          } catch (err) {
            console.error(`Error fetching user ${otherUserId}:`, err);
          }
        }
      }

      // Sort by most recent message first
      usersWithChats.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

      setChatUsers(usersWithChats);
      setChatsWithPreviews(previews);
    } catch (err) {
      console.error("Error fetching chat users:", err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await API.get("/users/all");
      setAllUsers(res.data);
    } catch (err) {
      console.error("Error fetching all users:", err);
    }
  };

  const startChat = async (chatUser) => {
    try {
      setSelectedUser(chatUser);
      const res = await API.post("/chat", { senderId: user.id, receiverId: chatUser._id });
      setChat(res.data);
      const msgs = await API.get(`/message/${res.data._id}`);
      setMessages(msgs.data);
      setShowNewChatModal(false);
      
      // Mark as seen when viewing the chat
      const newLastSeen = { ...lastSeenMessages, [chatUser._id]: new Date().toISOString() };
      setLastSeenMessages(newLastSeen);
      localStorage.setItem(`lastSeenMessages_${user.id}`, JSON.stringify(newLastSeen));
      
      // Dispatch custom event to notify navbar
      window.dispatchEvent(new Event('lastSeenUpdated'));
      
      // Refresh chat list to include new chat
      fetchChatUsers();
    } catch (err) {
      console.error("Error starting chat:", err);
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    const newMsg = { chatId: chat._id, senderId: user.id, text };
    await API.post("/message/send", newMsg);
    socket.emit("sendMessage", { senderId: user.id, receiverId: selectedUser._id, text });
    setMessages((prev) => [...prev, { ...newMsg, createdAt: new Date() }]);
    setText("");
    
    // Mark as seen when sending a reply
    const newLastSeen = { ...lastSeenMessages, [selectedUser._id]: new Date().toISOString() };
    setLastSeenMessages(newLastSeen);
    localStorage.setItem(`lastSeenMessages_${user.id}`, JSON.stringify(newLastSeen));
    
    // Dispatch custom event to notify navbar
    window.dispatchEvent(new Event('lastSeenUpdated'));
    
    // Refresh chat list to update preview
    fetchChatUsers();
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const msgDate = new Date(date);
    const seconds = Math.floor((now - msgDate) / 1000);
    
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return msgDate.toLocaleDateString();
  };

  const formatTime = (date) => {
    const msgDate = new Date(date);
    return msgDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      <Navbar />
      <div className="chat-page">
        {/* Left Sidebar - Following List */}
        <div className="chat-sidebar">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", borderBottom: "1px solid #e0e0e0" }}>
            <h3 style={{ margin: 0 }}>💬 Messages</h3>
            <button 
              onClick={() => setShowNewChatModal(true)}
              style={{ 
                padding: "8px 16px", 
                fontSize: "0.85em", 
                margin: 0,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              }}
            >
              ➕ New
            </button>
          </div>
          <div className="following-list">
            {chatUsers.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#888" }}>
                <p>� No chats yet</p>
                <p style={{ fontSize: "0.9em" }}>Click "New" to start a conversation</p>
              </div>
            ) : (
              chatUsers.map((chatUser) => {
                const preview = chatsWithPreviews[chatUser._id];
                const lastSeen = lastSeenMessages[chatUser._id];
                const hasUnread = preview && preview.senderId !== user.id && 
                                 (!lastSeen || new Date(preview.time) > new Date(lastSeen));
                
                return (
                  <div
                    key={chatUser._id}
                    className={`chat-list-item ${selectedUser?._id === chatUser._id ? 'active' : ''}`}
                    onClick={() => startChat(chatUser)}
                  >
                    <div className="chat-avatar" style={{ position: 'relative' }}>
                      {chatUser.avatar && chatUser.avatar.startsWith('/uploads') ? (
                        <img src={`http://localhost:5000${chatUser.avatar}`} alt="avatar" />
                      ) : (
                        <div className="avatar-placeholder">{chatUser.avatar || "👤"}</div>
                      )}
                      {hasUnread && (
                        <span style={{
                          position: 'absolute',
                          top: '-2px',
                          right: '-2px',
                          width: '14px',
                          height: '14px',
                          background: 'red',
                          borderRadius: '50%',
                          border: '2px solid white'
                        }}></span>
                      )}
                    </div>
                    <div className="chat-info">
                      <div className="chat-header">
                        <span className="chat-name" style={{ fontWeight: hasUnread ? 700 : 600 }}>
                          {chatUser.name}
                        </span>
                        {preview && <span className="chat-time">{getTimeAgo(preview.time)}</span>}
                      </div>
                      <div className="chat-preview">
                        {preview ? (
                          <span 
                            className={preview.senderId === user.id ? "you-message" : ""}
                            style={{ fontWeight: hasUnread ? 600 : 'normal' }}
                          >
                            {preview.senderId === user.id ? "You: " : ""}{preview.text.substring(0, 30)}{preview.text.length > 30 ? "..." : ""}
                          </span>
                        ) : (
                          <span style={{ color: "#aaa" }}>Start a conversation</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side - Chat Messages */}
        <div className="chat-main">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="chat-main-header">
                <div className="chat-avatar">
                  {selectedUser.avatar && selectedUser.avatar.startsWith('/uploads') ? (
                    <img src={`http://localhost:5000${selectedUser.avatar}`} alt="avatar" />
                  ) : (
                    <div className="avatar-placeholder">{selectedUser.avatar || "👤"}</div>
                  )}
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>{selectedUser.name}</h4>
                  {selectedUser.username && <p style={{ margin: 0, fontSize: "0.9em", color: "#666" }}>@{selectedUser.username}</p>}
                </div>
              </div>

              {/* Messages Area */}
              <div className="messages-area">
                {messages.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#888", marginTop: "50px" }}>
                    <p style={{ fontSize: "3em" }}>💬</p>
                    <p>No messages yet</p>
                    <p style={{ fontSize: "0.9em" }}>Send a message to start the conversation</p>
                  </div>
                ) : (
                  messages.map((m, i) => (
                    <div key={i} className={`message-bubble ${m.senderId === user.id ? "sent" : "received"}`}>
                      <p className="message-text">{m.text}</p>
                      <span className="message-time">{formatTime(m.createdAt)}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="message-input-container">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="💬 Type a message..."
                  className="message-input"
                />
                <button onClick={sendMessage} className="send-button">
                  📨
                </button>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <p style={{ fontSize: "4em" }}>💬</p>
              <h3>Your Messages</h3>
              <p style={{ color: "#888" }}>Select a conversation from the left to start chatting</p>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="modal-overlay" onClick={() => setShowNewChatModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Start New Chat</h3>
              <button 
                onClick={() => setShowNewChatModal(false)}
                style={{ background: "transparent", color: "#666", fontSize: "1.5em", padding: "0", margin: "0", boxShadow: "none" }}
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              placeholder="🔎 Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="modal-search-input"
            />
            <div className="modal-users-list">
              {filteredUsers.length === 0 ? (
                <p style={{ textAlign: "center", color: "#888", padding: "20px" }}>No users found</p>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="modal-user-item"
                    onClick={() => startChat(user)}
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

export default Chat;
