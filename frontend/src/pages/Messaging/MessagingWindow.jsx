import { useState, useEffect, useRef } from "react";
import axios from "axios";
// import { io } from "socket.io-client";

const api = axios.create({
  baseURL: "/api/messages",
});

export default function MessagingWindow({ currentUserId, otherUserId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const token = localStorage.getItem("token");
        const { data } = await api.get(`/${currentUserId}/${otherUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (alive) setMessages(data);
        scrollToBottom();
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    }

    load();
    const id = setInterval(load, 3000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [currentUserId, otherUserId]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    try {
      const token = localStorage.getItem("token");
      const payload = {
        to: otherUserId,
        message: trimmed,
      };
      const { data } = await api.post("/send", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => [...prev, data.message]);
      setNewMessage("");
      scrollToBottom();
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.sender.toString() === currentUserId.toString();
          return (
            <div
              key={msg._id}
              className={`max-w-sm rounded-2xl shadow p-3 ${
                isMe ? "bg-primary text-primary-foreground ml-auto" : "bg-muted text-muted-foreground"
              }`}
            >
              <p className="text-base break-words">{msg.content}</p>
              <span className="block text-xs mt-1 opacity-70">
                {new Date(msg.sentAt).toLocaleTimeString()}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="border-t p-4 flex gap-2">
        <input
          placeholder="Type a message…"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1"
          autoComplete="off"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
