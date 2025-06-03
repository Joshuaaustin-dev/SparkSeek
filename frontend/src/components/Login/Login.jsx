import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("token", response.data.token); //Save JWT Token
      alert("login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      alert("Login failed. Please check credentials");
    }
  };

  return (
    <div class="login-container">
      <h2 class="login-title">Login</h2>
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
        <button type="submit" class="login-button">
          Login
        </button>
        <a href="/signup" class="new-user-link">
          New User
        </a>
      </form>
    </div>
  );
};

export default Login;
