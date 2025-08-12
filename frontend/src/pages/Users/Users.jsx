import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./Users.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const modalRef = useRef(null);
  const firstCardRef = useRef(null);
  const messageTextareaRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/users/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users", err);
        setError("Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Focus management for accessibility
  useEffect(() => {
    if (selected && messageTextareaRef.current) {
      // Focus textarea when modal opens
      setTimeout(() => {
        messageTextareaRef.current.focus();
      }, 100);
    }
  }, [selected]);

  // Handle keyboard navigation
  const handleKeyDown = (e, user) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelected(user);
    }
  };

  // Handle modal keyboard events
  const handleModalKeyDown = (e) => {
    if (e.key === "Escape") {
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    setSelected(null);
    setMessage("");
    setSuccess(false);
    setError("");
    // Return focus to the card that opened the modal
    const cardIndex = users.findIndex((user) => user._id === selected?._id);
    const cardElement = document.querySelector(
      `[data-user-id="${selected?._id}"]`
    );
    if (cardElement) {
      cardElement.focus();
    }
  };

  const handleConnect = async (userId) => {
    if (!message.trim()) {
      setError("Please enter a message before connecting.");
      return;
    }

    setSending(true);
    setError("");

    try {
      await axios.post(
        `/api/messages/send`,
        { to: userId, message: message.trim() },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setSuccess(true);
      setMessage("");

      // Auto-close modal after success
      setTimeout(() => {
        handleCloseModal();
      }, 2000);
    } catch (err) {
      console.error("Failed to send message", err);
      setError(
        err.response?.data?.message ||
          "Failed to send message. Please try again."
      );
    }
    setSending(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  if (loading) {
    return (
      <div className="container users-container">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}
        >
          <div className="loading-spinner"></div>
          <span className="ms-2">Loading users...</span>
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="container users-container">
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button
            className="connect-btn"
            style={{ maxWidth: "200px" }}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container users-container">
      <h1 className="users-title">Connect with Others</h1>

      {users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>No users found</h3>
          <p>
            There are no other users available to connect with at the moment.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {users.map((user, index) => (
            <div key={user._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div
                className="user-card h-100"
                data-user-id={user._id}
                onClick={() => setSelected(user)}
                tabIndex={0}
                role="button"
                aria-label={`Connect with ${user.name}, ${user.role}`}
                onKeyDown={(e) => handleKeyDown(e, user)}
                ref={index === 0 ? firstCardRef : null}
              >
                <div className="user-card-body">
                                      <img
                      src={user.profilePic ? `/${user.profilePic}` : "/profilePlaceholder.jpg"}
                      className="user-img rounded-circle mx-auto d-block"
                      alt={user.name}
                      loading="lazy"
                    />
                  <h5 className="user-name">{user.name}</h5>
                  <p className="user-role">{user.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Modal */}
      {selected && (
        <div
          className="modal-overlay"
          onClick={handleBackdropClick}
          onKeyDown={handleModalKeyDown}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="modal-content-custom" ref={modalRef}>
            <button
              className="modal-close-btn"
              onClick={handleCloseModal}
              aria-label="Close modal"
              type="button"
            >
              ✕
            </button>

            <div className="modal-header">
              <img
                src={selected.profilePic ? `/${selected.profilePic}` : "/profilePlaceholder.jpg"}
                alt={selected.name}
                className="user-img-large rounded-circle mx-auto d-block"
              />
              <h3 id="modal-title" className="modal-name">
                {selected.name}
              </h3>
              <p className="modal-role">{selected.role}</p>
            </div>

            {selected.bio && (
              <div className="modal-bio">
                <strong>About:</strong> {selected.bio}
              </div>
            )}

            {success ? (
              <div className="success-message">
                ✅ Message sent successfully! You'll be notified when they
                respond.
              </div>
            ) : (
              <>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <div className="mb-3">
                  <label
                    htmlFor="message-textarea"
                    className="form-label fw-semibold"
                  >
                    Your Message
                  </label>
                  <textarea
                    id="message-textarea"
                    ref={messageTextareaRef}
                    className="message-textarea w-100"
                    rows={4}
                    placeholder={`Write a message to ${selected.name}...`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={500}
                    aria-describedby="char-count"
                  />
                  <small id="char-count" className="form-text text-muted">
                    {message.length}/500 characters
                  </small>
                </div>

                <button
                  className="connect-btn"
                  onClick={() => handleConnect(selected._id)}
                  disabled={sending || !message.trim()}
                  type="button"
                >
                  {sending && <span className="loading-spinner"></span>}
                  {sending ? "Sending..." : "Connect & Send Message"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
