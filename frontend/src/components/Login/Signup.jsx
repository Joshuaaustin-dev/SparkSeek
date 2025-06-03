import { useState } from "react";
import axios from "axios";

const Signup = ({ onSignupSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "seeker",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await axios.post("/api/auth/signup", form);
      onSignupSuccess(); // ✅ Navigate to login page
    } catch (err) {
      alert("Signup failed, try again");
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <br />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <br />
        <input
          name="password"
          placeholder="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <br />
        <input
          name="confirmPassword"
          placeholder="confirm password"
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
        <button type="submit">Signup</button>
      </form>
    </div>
  );
};

export default Signup;
