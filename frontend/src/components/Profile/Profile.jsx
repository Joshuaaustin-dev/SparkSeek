import { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/users/profile", {
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

  if (!user) return <p>Loading Profile...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-3xl font-semibold mb-4">Your Profile</h2>

      {/* Common Info */}
      <div className="mb-6">
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
      </div>

      {/* Role-specific info */}
      {user.role === "seeker" ? (
        <div>
          <h3 className="text-xl font-semibold mb-2">Job Seeker Details</h3>
          <p>
            <strong>Skills:</strong> {user.skills?.join(", ") || "Not listed"}
          </p>
          <p>
            <strong>Resume:</strong>{" "}
            {user.resumeUrl ? (
              <a
                href={user.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View Resume
              </a>
            ) : (
              "No resume uploaded"
            )}
          </p>
          <p>
            <strong>Bio:</strong> {user.bio || "No bio available"}
          </p>
        </div>
      ) : (
        <div>
          <h3 className="text-xl font-semibold mb-2">Recruiter Details</h3>
          <p>
            <strong>Company Name:</strong> {user.companyName || "Not specified"}
          </p>
          <p>
            <strong>Company Website:</strong>{" "}
            {user.companyWebsite ? (
              <a
                href={user.companyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {user.companyWebsite}
              </a>
            ) : (
              "Not specified"
            )}
          </p>
          <p>
            <strong>Contact Number:</strong>{" "}
            {user.contactNumber || "Not specified"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Profile;
