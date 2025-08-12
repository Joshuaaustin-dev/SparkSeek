import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaSearch, FaEnvelope } from "react-icons/fa";
import "./DashboardMain.css";

const RecruiterDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/users/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Only seekers
        const seekers = (res.data || []).filter((u) => u.role === "seeker");
        setCandidates(seekers);
        setFiltered(seekers);
      } catch (err) {
        console.error("Failed to load candidates", err);
        setError("Failed to load candidates. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered(candidates);
      return;
    }
    const q = query.toLowerCase();
    setFiltered(
      candidates.filter((c) => {
        const nameMatch = c.name?.toLowerCase().includes(q);
        const emailMatch = c.email?.toLowerCase().includes(q);
        const bioMatch = c.bio?.toLowerCase().includes(q);
        const skillsMatch = Array.isArray(c.skills)
          ? c.skills.join(" ").toLowerCase().includes(q)
          : false;
        return nameMatch || emailMatch || bioMatch || skillsMatch;
      })
    );
  }, [query, candidates]);

  const handleConnect = async (userId) => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await axios.post(
        "/api/messages/send",
        { to: userId, message: message.trim() },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setMessage("");
      setSelected(null);
      alert("Message sent");
    } catch (err) {
      console.error("Failed to send message", err);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="dashboard-container">Loading candidates...</div>;
  }
  if (error) {
    return <div className="dashboard-container">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-top-row">
        <section className="dashboard-card" style={{ flex: "1 1 100%" }}>
          <h3>Candidate Finder</h3>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <FaSearch style={{ position: "absolute", top: 10, left: 10, color: "#6b7280" }} />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email, bio or skills"
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                }}
              />
            </div>
          </div>
          {filtered.length === 0 ? (
            <p>No candidates match your search.</p>
          ) : (
            <div className="row g-4">
              {filtered.map((user) => (
                <div key={user._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <div className="user-card h-100">
                    <div className="user-card-body">
                      <img
                        src={
                          user.profilePic
                            ? `${import.meta.env.VITE_BASE_URL}/${user.profilePic}`
                            : "/profilePlaceholder.jpg"
                        }
                        className="user-img rounded-circle mx-auto d-block"
                        alt={user.name}
                        loading="lazy"
                      />
                      <h5 className="user-name">{user.name}</h5>
                      <p className="user-role">{Array.isArray(user.skills) ? user.skills.join(", ") : user.bio}</p>
                      <button
                        className="connect-btn"
                        onClick={() => setSelected(user)}
                        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                      >
                        <FaEnvelope /> Message
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {selected && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <div className="modal-content-custom">
            <button
              className="modal-close-btn"
              onClick={() => setSelected(null)}
              aria-label="Close modal"
              type="button"
            >
              ✕
            </button>

            <div className="modal-header">
              <img
                src={
                  selected.profilePic
                    ? `${import.meta.env.VITE_BASE_URL}/${selected.profilePic}`
                    : "/profilePlaceholder.jpg"
                }
                alt={selected.name}
                className="user-img-large rounded-circle mx-auto d-block"
              />

              <h3 id="modal-title" className="modal-name">
                {selected.name}
              </h3>
              <p className="modal-role">{Array.isArray(selected.skills) ? selected.skills.join(", ") : selected.bio}</p>
            </div>

            <div className="mb-3">
              <label htmlFor="message-textarea" className="form-label fw-semibold">
                Your Message
              </label>
              <textarea
                id="message-textarea"
                className="message-textarea w-100"
                rows={4}
                placeholder={`Write a message to ${selected.name}...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
              />
            </div>

            <button
              className="connect-btn"
              onClick={() => handleConnect(selected._id)}
              disabled={sending || !message.trim()}
              type="button"
            >
              {sending ? "Sending..." : "Send Message"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;