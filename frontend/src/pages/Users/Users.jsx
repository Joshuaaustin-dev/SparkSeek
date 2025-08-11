import { useEffect, useState } from "react";
import axios from "axios";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/users/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, []);

  const handleConnect = async (userId) => {
    setSending(true);
    try {
      // Replace with your actual messaging endpoint
      await axios.post(
        `/api/messages/send`,
        { to: userId, message },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("Message sent!");
      setMessage("");
      setSelected(null);
    } catch (err) {
      alert("Failed to send message.");
    }
    setSending(false);
  };

  return (
    <div className="pt-20 pl-52 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-blue-900">
        Connect with Others
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition p-5 flex flex-col items-center border border-blue-100 cursor-pointer group"
            onClick={() => setSelected(user)}
          >
            <img
              src={user.profilePictureUrl || "/profilePlaceholder.jpg"}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-blue-300 shadow-sm group-hover:scale-105 transition"
            />
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-900">
                {user.name}
              </div>
              <div className="text-sm text-gray-500 capitalize">
                {user.role}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Popup Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="flex flex-col items-center">
              <img
                src={selected.profilePictureUrl || "/profilePlaceholder.jpg"}
                alt={selected.name}
                className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-blue-200"
              />
              <div className="text-2xl font-bold text-blue-900">
                {selected.name}
              </div>
              <div className="text-base text-gray-500 capitalize mb-2">
                {selected.role}
              </div>
              <div className="text-gray-700 mb-4">
                {selected.bio || "No bio provided."}
              </div>
              <textarea
                className="w-full border border-blue-200 rounded-lg p-2 mb-4"
                rows={3}
                placeholder="Write a message to connect..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition w-full"
                onClick={() => handleConnect(selected._id)}
                disabled={sending || !message.trim()}
              >
                {sending ? "Sending..." : "Connect & Send Message"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
