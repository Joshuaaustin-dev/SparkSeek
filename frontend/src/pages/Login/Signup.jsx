import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "seeker",
  });

  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match");
      setHasError(true);
      return;
    }

    try {
      await axios.post("/api/auth/signup", form);
      setMessage("Signup successful! Redirecting to login...");
      setHasError(false);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setMessage("Signup failed, please try again.");
      setHasError(true);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Signup</h2>
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
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <br />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <br />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <br />
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />
        <br />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="seeker">Job Seeker</option>
          <option value="recruiter">Recruiter</option>
        </select>
        <br />
        <button type="submit" className="login-button">
          Signup
        </button>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-6 w-full border border-blue-600 text-blue-600 font-semibold py-2 rounded-md hover:bg-blue-50 transition-colors"
        >
          Back to Login
        </button>
      </form>
    </div>
  );
};

export default Signup;
