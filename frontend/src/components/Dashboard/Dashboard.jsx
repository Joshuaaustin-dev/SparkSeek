import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ""
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/users/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, []);

  // Clear the success message after 30 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 30000);
      return () => clearTimeout(timer); // Clean up on unmount
    }
  }, [successMessage]);

  if (!user) return <p>Loading Dashboard...</p>;

  return (
    <div className="flex-1 p-8 pt-20">
      {successMessage && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          {successMessage}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">
          Welcome Back, {user.name}
        </h1>
        <p className="text-gray-600 text-sm">
          {user.role === "seeker"
            ? "Job Seeker Dashboard"
            : "Recruiter Dashboard"}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
