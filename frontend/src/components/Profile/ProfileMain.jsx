import { useState, useEffect } from "react";
import axios from "axios";

import ProfileHeader from "./ProfileHeader";
import ResumeSection from "./ResumeSection";
import JobSeekerDetails from "./JobSeekerDetails";
import ProfileEditForm from "./ProfileEditForm";

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
      <p className="text-center mt-10 text-gray-500">Loading Profile...</p>
    );

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      {/* Profile Picture + Basic Info */}
      <div className="flex flex-col items-center md:flex-row md:items-start md:space-x-6 mb-8">
        <img
          src={user.profilePictureUrl || DEFAULT_PROFILE_PIC}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border-2 border-gray-300 shadow"
        />
        <div className="text-center md:text-left mt-4 md:mt-0">
          <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
          <p className="text-gray-600">{user.email}</p>
          <span className="inline-block mt-2 text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
        </div>
      </div>

      {/* Editable or Display Mode */}
      {isEditing ? (
        <ProfileEditForm
          user={user}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <>
          {/* About Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">About</h2>
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

          {/* Resume Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6 shadow-sm">
            <ResumeSection skills={skills} resumeUrl={resumeUrl} />
          </div>

          {/* Edit Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileMain;
