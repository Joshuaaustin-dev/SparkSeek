import { useState, useEffect } from "react";
import axios from "axios";

const ProfileEditForm = ({ user, onSave, onCancel }) => {
  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [skillsInput, setSkillsInput] = useState(
    (user.skills || []).join(", ")
  );
  const [profilePic, setProfilePic] = useState(null); // <-- New state

  useEffect(() => {
    setName(user.name || "");
    setBio(user.bio || "");
    setSkillsInput((user.skills || []).join(", "));
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Upload profile pic if selected
    if (profilePic) {
      const formData = new FormData();
      formData.append("profilePic", profilePic);

      try {
        const res = await axios.put("/api/users/profilePic", formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });

        // Merge the new profile pic path with other profile data
        await onSave({
          name,
          bio,
          skills: skillsInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          profilePic: res.data.profilePic,
        });

        return;
      } catch (err) {
        console.error("Failed to upload profile picture:", err);
        alert("Failed to upload profile picture.");
      }
    }

    // 2. Save other fields
    onSave({
      name,
      bio,
      skills: skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto space-y-6 p-6 bg-white rounded-lg shadow-md"
    >
      <h3 className="text-2xl font-semibold mb-4 text-gray-900">
        Edit Profile
      </h3>

      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block font-semibold mb-2 text-gray-700"
        >
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block font-semibold mb-2 text-gray-700">
          Bio
        </label>
        <textarea
          id="bio"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-3 resize-y text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tell us a bit about yourself"
        />
      </div>

      {/* Skills */}
      <div>
        <label
          htmlFor="skills"
          className="block font-semibold mb-2 text-gray-700"
        >
          Top Skills (comma separated)
        </label>
        <input
          id="skills"
          type="text"
          value={skillsInput}
          onChange={(e) => setSkillsInput(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="JavaScript, React, Node.js"
        />
      </div>

      {/* Profile Picture Upload */}
      <div>
        <label className="block font-semibold mb-2 text-gray-700">
          Profile Picture
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProfilePic(e.target.files[0])}
          className="w-full border border-gray-300 rounded-md p-3 text-gray-900"
        />
      </div>

      {/* Buttons */}
      <div className="flex space-x-4 mt-6 justify-end">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProfileEditForm;
