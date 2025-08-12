import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ConversationsPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Decode current user id from JWT
  let currentUserId = null;
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      currentUserId = payload.id;
    } catch (e) {
      console.error("Invalid token", e);
    }
  }

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await axios.get("/api/messages/conversations", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setConversations(data);
      } catch (err) {
        console.error("Failed to load conversations", err);
        setError("Failed to load conversations.");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const openChat = (otherUserId) => {
    navigate(`/messages/${otherUserId}`);
  };

  if (!currentUserId) return <div>Loading user...</div>;
  if (loading) return <div>Loading conversations…</div>;
  if (error) return <div>{error}</div>;

  if (conversations.length === 0) {
    return <div>No conversations yet. Start one from the Users page.</div>;
  }

  return (
    <div className="p-4 space-y-3">
      {conversations.map((c) => {
        const other = c.participants.find((p) => String(p._id) !== String(currentUserId));
        const last = c.lastMessage;
        return (
          <button
            key={c._id}
            className="w-full text-left border rounded-lg p-3 hover:bg-gray-50 flex items-center gap-3"
            onClick={() => openChat(other?._id)}
          >
            <img
              src={other?.profilePic ? `/${other.profilePic}` : "/profilePlaceholder.jpg"}
              alt={other?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="font-semibold">{other?.name || "Unknown User"}</div>
              <div className="text-sm opacity-80 truncate">
                {last?.content || "No messages yet"}
              </div>
            </div>
            {last?.sentAt && (
              <div className="text-xs opacity-60">
                {new Date(last.sentAt).toLocaleTimeString()}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}