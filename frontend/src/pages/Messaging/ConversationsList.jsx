import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ConversationsList.css";

const ConversationsList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/messages/conversations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setConversations(response.data);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (conversation) => {
    navigate(`/messages/${conversation.otherUser._id}`);
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 24 * 7) {
      return messageDate.toLocaleDateString([], { weekday: "short" });
    } else {
      return messageDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  };

  const truncateMessage = (content, maxLength = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="conversations-container">
        <div className="conversations-header">
          <h1>Messages</h1>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span>Loading conversations...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="conversations-container">
        <div className="conversations-header">
          <h1>Messages</h1>
        </div>
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button onClick={fetchConversations} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="conversations-container">
      <div className="conversations-header">
        <h1>Messages</h1>
        <button
          onClick={() => navigate("/users")}
          className="new-conversation-btn"
        >
          + Start New Conversation
        </button>
      </div>

      {conversations.length === 0 ? (
        <div className="empty-conversations">
          <div className="empty-icon">💬</div>
          <h3>No conversations yet</h3>
          <p>Start connecting with other users to begin messaging!</p>
          <button
            onClick={() => navigate("/users")}
            className="start-conversation-btn"
          >
            Find Users to Connect With
          </button>
        </div>
      ) : (
        <div className="conversations-list">
          {conversations.map((conversation) => (
            <div
              key={conversation.conversationId}
              className="conversation-item"
              onClick={() => handleConversationClick(conversation)}
            >
              <div className="conversation-avatar">
                <img
                  src={
                    conversation.otherUser.profilePic
                      ? `${import.meta.env.VITE_BASE_URL}/${
                          conversation.otherUser.profilePic
                        }`
                      : "/profilePlaceholder.jpg"
                  }
                  alt={conversation.otherUser.name}
                  className="avatar-img"
                />
                {conversation.unreadCount > 0 && (
                  <span className="unread-badge">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>

              <div className="conversation-content">
                <div className="conversation-header">
                  <h4 className="user-name">{conversation.otherUser.name}</h4>
                  <span className="message-time">
                    {formatTime(conversation.lastMessage.timestamp)}
                  </span>
                </div>

                <div className="conversation-preview">
                  <p
                    className={`last-message ${
                      conversation.unreadCount > 0 ? "unread" : ""
                    }`}
                  >
                    {conversation.lastMessage.isFromCurrentUser && "You: "}
                    {truncateMessage(conversation.lastMessage.content)}
                  </p>
                  <span className="user-role">
                    {conversation.otherUser.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationsList;
