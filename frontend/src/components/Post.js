import React, { useState } from "react";
import API from "../api/axiosConfig";

function Post({ post, currentUser, refresh }) {
  const liked = post.likes.includes(currentUser.id);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const toggleLike = async () => {
    await API.put(`/posts/like/${post._id}`, { userId: currentUser.id });
    refresh();
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      await API.post(`/posts/${post._id}/comment`, {
        userId: currentUser.id,
        text: commentText
      });
      setCommentText("");
      refresh();
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Error adding comment");
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const seconds = Math.floor((now - postDate) / 1000);
    
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return postDate.toLocaleDateString();
  };

  return (
    <div className="post">
      <div className="post-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="post-user-avatar">
            {post.userAvatar && post.userAvatar.startsWith('/uploads') ? (
              <img 
                src={`http://localhost:5000${post.userAvatar}`} 
                alt="avatar" 
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {post.userAvatar || "👤"}
              </div>
            )}
          </div>
          <p><b>@{post.username || post.userId}</b></p>
        </div>
        <span className="post-time">{getTimeAgo(post.createdAt)}</span>
      </div>
      
      <p style={{ fontSize: "1.1em", marginTop: "10px" }}>{post.content}</p>
      
      {post.image && (
        <img 
          src={post.image.startsWith('/uploads') ? `http://localhost:5000${post.image}` : post.image}
          alt="Post content" 
          className="post-image"
        />
      )}
      
      {post.video && (
        <video 
          controls 
          className="post-video"
        >
          <source src={post.video.startsWith('/uploads') ? `http://localhost:5000${post.video}` : post.video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
      
      <div className="post-actions">
        <button onClick={toggleLike} className={liked ? "unlike-btn" : "like-btn"}>
          {liked ? "Unlike" : "Like"} ({post.likes.length})
        </button>
        <button onClick={() => setShowComments(!showComments)} className="comment-btn">
          Comments ({post.comments?.length || 0})
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <div className="add-comment">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              onKeyPress={(e) => e.key === 'Enter' && addComment()}
            />
            <button onClick={addComment} className="post-comment-btn">Post</button>
          </div>
          
          <div className="comments-list">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment._id} className="comment">
                  <p><b>@{comment.username}</b></p>
                  <p>{comment.text}</p>
                  <span className="comment-time">{getTimeAgo(comment.createdAt)}</span>
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center", color: "#888", padding: "10px" }}>
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Post;
