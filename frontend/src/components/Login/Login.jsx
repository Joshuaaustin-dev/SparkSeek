import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("token", response.data.token); // Save JWT token

      // Show success message briefly before navigating
      setMessage("Login successful! Redirecting...");
      setHasError(false);
      setMessage("Login successful! Redirecting...");
      setHasError(false);
      setTimeout(() => {
        navigate("/dashboard", { state: { message: "Login successful!" } });
      }, 1000);
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setMessage("Login failed. Please check your credentials.");
      setHasError(true);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      {message && (
        <div
          className={`login-message ${hasError ? "error" : "success"}`}
          style={{
            color: hasError ? "red" : "green",
            marginBottom: "1rem",
            fontWeight: "bold",
          }}
        >
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit" className="login-button">
          Login
        </button>
        <a href="/signup" className="new-user-link">
          New User
        </a>
      </form>
    </div>
  );
};

export default Login;
