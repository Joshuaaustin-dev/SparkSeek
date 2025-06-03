import { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/users/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("Token sent:", localStorage.getItem("token"));
        setUser(res.data);
        console.log(res.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, []);

  if (!user) return <p>Loading Dashboard...</p>;

  return (
    <div className="flex-1 p-8 pt-20">
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

      {/* TODO Render dashboard sections based on role */}
    </div>
  );
};

export default Dashboard;
