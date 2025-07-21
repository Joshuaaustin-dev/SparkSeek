import { useState, useEffect } from "react";
import axios from "axios";
import ResumeSection from "./ResumeSection";
import JobSeekerDetails from "./JobSeekerDetails";
import ProfileEditForm from "./ProfileEditForm";
import "./ProfileMain.css";

const DEFAULT_PROFILE_PIC = "/profilePlaceholder.jpg";

const ProfileMain = () => {
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [resumeUrl, setResumeUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRes = await axios.get("/api/users/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUser(userRes.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, []);

  const handleSave = async (updatedData) => {
    try {
      await axios.put("/api/users/updateUser", updatedData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setUser((prev) => ({ ...prev, ...updatedData }));
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating profile.");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (!user)
    return (
      <div className="text-center mt-5 text-muted">Loading Profile...</div>
    );

  return (
    <div className="container mt-5">
      <div className="profile-card">
        <div className="card-body">
          {/* Top Row */}
          <div className="row align-items-center mb-4">
            <div className="col-md-3 text-center">
              <img
                src={user.profilePictureUrl || DEFAULT_PROFILE_PIC}
                alt="Profile"
                className="profile-img"
              />
            </div>
            <div className="col-md-9 text-center text-md-start">
              <h2 className="fw-bold">{user.name}</h2>
              <p className="text-muted mb-1">{user.email}</p>
              <span className="badge bg-primary">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>
          </div>

          {/* Sections */}
          <div className="profile-section">
            <h4>About</h4>
            {user.role === "seeker" ? (
              <JobSeekerDetails bio={user.bio} setBio={() => {}} />
            ) : (
              <RecruiterDetails
                companyName={user.companyName}
                setCompanyName={() => {}}
                companyWebsite={user.companyWebsite}
                setCompanyWebsite={() => {}}
                contactNumber={user.contactNumber}
                setContactNumber={() => {}}
              />
            )}
          </div>

          <div className="profile-section">
            <ResumeSection skills={skills} resumeUrl={resumeUrl} />
          </div>

          <div className="text-end">
            <button
              className="btn btn-primary btn-edit-profile"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileMain;
