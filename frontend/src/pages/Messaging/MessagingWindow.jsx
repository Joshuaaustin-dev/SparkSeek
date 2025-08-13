import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import { FaVideo, FaPhone } from "react-icons/fa";

import "./MessagingWindow.css";

const MessagingWindow = () => {
  const { otherUserId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Get conversation ID
  const getConversationId = (userId1, userId2) => {
    return [userId1, userId2].sort().join("_");
  };

  // Generate unique Jitsi room name
  const generateRoomName = (userId1, userId2) => {
    return [userId1, userId2].sort().join("-");
  };

  // Open Jitsi video call in new tab
  const handleStartVideoCall = () => {
    if (!currentUser || !otherUser) return;
    const roomName = generateRoomName(currentUser._id, otherUser._id);
    const jitsiUrl = `https://meet.jit.si/${roomName}`;
    window.open(jitsiUrl, "_blank");
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const newSocket = io(import.meta.env.VITE_BASE_URL, {
      auth: { token },
    });

    newSocket.on("newMessage", (messageData) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now().toString(),
          sender: { _id: messageData.sender },
          content: messageData.content,
          timestamp: messageData.timestamp,
        },
      ]);
    });

    newSocket.on("userTyping", (data) => {
      if (data.userId === otherUserId) {
        setOtherUserTyping(true);
      }
    });

    newSocket.on("userStoppedTyping", (data) => {
      if (data.userId === otherUserId) {
        setOtherUserTyping(false);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [otherUserId, navigate]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Get current user
        const userRes = await axios.get("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(userRes.data);

        // Get other user info
        const otherUserRes = await axios.get(`/api/users/${otherUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOtherUser(otherUserRes.data);

        // Get conversation messages
        const messagesRes = await axios.get(
          `/api/messages/conversation/${otherUserId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(messagesRes.data.messages || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (otherUserId) {
      fetchData();
    }
  }, [otherUserId]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/messages/send",
        {
          to: otherUserId,
          message: newMessage.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Add message to local state immediately
      setMessages((prev) => [...prev, response.data.data]);
      setNewMessage("");

      // Send via socket for real-time delivery
      if (socket) {
        socket.emit("sendMessage", {
          recipientId: otherUserId,
          content: newMessage.trim(),
          conversationId: getConversationId(currentUser._id, otherUserId),
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  // Handle typing indicators
  const handleTyping = () => {
    if (!socket || !currentUser) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", {
        recipientId: otherUserId,
        conversationId: getConversationId(currentUser._id, otherUserId),
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("stopTyping", {
        recipientId: otherUserId,
        conversationId: getConversationId(currentUser._id, otherUserId),
      });
    }, 1000);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else {
      handleTyping();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="messaging-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span>Loading conversation...</span>
        </div>
      </div>
    );
  }

  if (!otherUser || !currentUser) {
    return (
      <div className="messaging-container">
        <div className="error-state">
          <h3>User not found</h3>
          <button onClick={() => navigate("/users")} className="back-btn">
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="messaging-container">
      {/* Header */}
      <div className="messaging-header" style={{ position: "relative" }}>
        <button onClick={() => navigate("/conversations")} className="back-btn">
          ← Back
        </button>
        <div className="other-user-info">
          <img
            src={
              otherUser.profilePic
                ? `${import.meta.env.VITE_BASE_URL}/${otherUser.profilePic}`
                : "/profilePlaceholder.jpg"
            }
            alt={otherUser.name}
            className="user-avatar"
          />
          <div>
            <h3>{otherUser.name}</h3>
            <p>{otherUser.role}</p>
          </div>
        </div>
        {/* Video Call Button */}
        <button
          onClick={handleStartVideoCall}
          className="video-call-btn"
          style={{
            position: "absolute",
            right: "10px",
            top: "10px",
            padding: "6px 12px",
            backgroundColor: "var(--color-tertiary)",
            color: "var(--color-bg)",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          <FaVideo />
        </button>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`message ${
                message.sender._id === currentUser._id
                  ? "own-message"
                  : "other-message"
              }`}
            >
              <div className="message-content">{message.content}</div>
              <div className="message-time">
                {formatTime(message.timestamp)}
              </div>
            </div>
          ))
        )}

        {otherUserTyping && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>{otherUser.name} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="message-input-container">
        <textarea
          ref={messageInputRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Message ${otherUser.name}...`}
          rows={1}
          className="message-input"
          maxLength={1000}
        />
        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || sending}
          className="send-btn"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default MessagingWindow;
