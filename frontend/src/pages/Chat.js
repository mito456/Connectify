import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import API from "../api/axiosConfig";
import Navbar from "../components/Navbar";

const socket = io("http://localhost:5000");

function Chat() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [receiverId, setReceiverId] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [chat, setChat] = useState(null);

  useEffect(() => {
    socket.emit("addUser", user.id);

    socket.on("getMessage", (data) => {
      setMessages((prev) => [...prev, { senderId: data.senderId, text: data.text }]);
    });

    return () => socket.disconnect();
  }, [user.id]);

  const startChat = async () => {
    const res = await API.post("/chat", { senderId: user.id, receiverId });
    setChat(res.data);
    const msgs = await API.get(`/message/${res.data._id}`);
    setMessages(msgs.data);
  };

  const sendMessage = async () => {
    if (!text) return;
    const newMsg = { chatId: chat._id, senderId: user.id, text };
    await API.post("/message/send", newMsg);
    socket.emit("sendMessage", { senderId: user.id, receiverId, text });
    setMessages((prev) => [...prev, newMsg]);
    setText("");
  };

  return (
    <div>
      <Navbar />
      <div className="chat-container">
        <input
          placeholder="Enter receiver userId"
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
        />
        <button onClick={startChat}>Start Chat</button>

        <div className="messages">
          {messages.map((m, i) => (
            <p key={i} className={m.senderId === user.id ? "sent" : "received"}>
              {m.text}
            </p>
          ))}
        </div>

        {chat && (
          <div className="send-box">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
