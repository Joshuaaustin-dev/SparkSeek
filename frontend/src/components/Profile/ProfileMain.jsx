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
    //fetch user information
    const fetchUser = async () => {
      try {
        const userRes = await axios.get("/api/users/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUser(userRes.data);

        // Fetch latest resume for that user
        if (userRes.data && userRes.data._id) {
          const resumeRes = await axios.get(
            `/api/resumes/latest/${userRes.data._id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          setSkills(resumeRes.data.skills || []);
          setResumeUrl(resumeRes.data.resumeUrl || "");
        }
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
      <div className="text-center mt-5 text-muted">
        <div className="spinner-border text-primary" role="status" />
        <p>Loading Profile...</p>
      </div>
    );

  return (
    <div className="container mt-5">
      <div className="profile-card card shadow-sm">
        <div className="card-body">
          {isEditing ? (
            <ProfileEditForm
              user={user}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <>
              {/* Top Row */}
              <div className="row align-items-center mb-4">
                <div className="col-md-3 text-center">
                  <img
                    src={
                      user.profilePic
                        ? `/${user.profilePic}`
                        : DEFAULT_PROFILE_PIC
                    }
                    alt="Profile"
                    className="profile-img rounded-circle img-fluid"
                  />
                </div>
                <div className="col-md-9 text-center text-md-start">
                  <h2 className="fw-bold mb-2">{user.name}</h2>
                  <p className="text-muted mb-1">{user.email}</p>
                  <span className="badge bg-primary fs-6 text-uppercase px-3 py-2">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
              </div>

              {/* Sections */}
              <div className="profile-section p-4 rounded mb-4 shadow-sm bg-white border">
                <h4 className="mb-4 border-bottom pb-2">About</h4>
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

              <div className="profile-section p-4 rounded mb-4 shadow-sm bg-white border">
                <ResumeSection skills={skills} resumeUrl={resumeUrl} />
              </div>

              <div className="text-end">
                <button
                  className="btn btn-primary btn-edit-profile px-4 py-2"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileMain;
