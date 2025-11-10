import React from "react";
import API from "../api/axiosConfig";

function Post({ post, currentUser, refresh }) {
  const liked = post.likes.includes(currentUser.id);

  const toggleLike = async () => {
    await API.put(`/posts/like/${post._id}`, { userId: currentUser.id });
    refresh();
  };

  return (
    <div className="post">
      <p><b>User:</b> {post.userId}</p>
      <p>{post.content}</p>
      <button onClick={toggleLike}>{liked ? "Unlike" : "Like"} ({post.likes.length})</button>
    </div>
  );
}

export default Post;
