import { useState, useEffect } from "react";

const ProfileEditForm = ({ user, onSave, onCancel }) => {
  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [skillsInput, setSkillsInput] = useState(
    (user.skills || []).join(", ")
  );

  useEffect(() => {
    setName(user.name || "");
    setBio(user.bio || "");
    setSkillsInput((user.skills || []).join(", "));
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const skillsArray = skillsInput
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    onSave({
      name,
      bio,
      skills: skillsArray,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
      <h3 className="text-2xl font-semibold mb-4">Edit Profile</h3>

      {/* Name */}
      <div>
        <label htmlFor="name" className="block font-semibold mb-1">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded p-2"
          required
        />
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block font-semibold mb-1">
          Bio
        </label>
        <textarea
          id="bio"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full border border-gray-300 rounded p-2"
          placeholder="Tell us a bit about yourself"
        />
      </div>

      {/* Skills */}
      <div>
        <label htmlFor="skills" className="block font-semibold mb-1">
          Skills (comma separated)
        </label>
        <input
          id="skills"
          type="text"
          value={skillsInput}
          onChange={(e) => setSkillsInput(e.target.value)}
          className="w-full border border-gray-300 rounded p-2"
          placeholder="JavaScript, React, Node.js"
        />
      </div>

      {/* Buttons */}
      <div className="flex space-x-4 mt-6">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProfileEditForm;
