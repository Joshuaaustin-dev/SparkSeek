import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./ProfileEditForm.css";

const DEFAULT_PROFILE_PIC = "/profilePlaceholder.jpg";

const MAX_SKILLS = 10;

const ProfileEditForm = ({ user, onSave, onCancel }) => {
  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [skills, setSkills] = useState(user.skills || []);
  const [skillInput, setSkillInput] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const dragCounter = useRef(0);
  const [dragActive, setDragActive] = useState(false);

  // Reset on user change
  useEffect(() => {
    setName(user.name || "");
    setBio(user.bio || "");
    setSkills(user.skills || []);
    setSkillInput("");
    setPreview(null);
    setProfilePic(null);
    setErrors({});
    setUploadError("");
    setIsDirty(false);
  }, [user]);

  // Preview for new profile pic
  useEffect(() => {
    if (!profilePic) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(profilePic);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [profilePic]);

  // Validate inputs
  useEffect(() => {
    const newErrors = {};
    if (name.trim().length < 2)
      newErrors.name = "Name must be at least 2 characters.";

    if (skills.length === 0)
      newErrors.skills = "Please add at least one skill.";

    if (skills.some((s) => !/^[a-zA-Z0-9\s\+\#\.\-]+$/.test(s))) {
      newErrors.skills =
        "Skills must only contain letters, numbers, spaces, +, #, ., -";
    }

    setErrors(newErrors);
  }, [name, skills]);

  // Track form changes for enabling Save button
  useEffect(() => {
    const originalSkills = user.skills || [];
    const changed =
      name !== (user.name || "") ||
      bio !== (user.bio || "") ||
      skills.join(",") !== originalSkills.join(",") ||
      profilePic !== null;
    setIsDirty(changed);
  }, [name, bio, skills, profilePic, user]);

  // Drag and drop handlers for profile pic (same as before)
  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounter.current++;
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setProfilePic(file);
        setUploadError("");
      } else {
        setUploadError("Please upload a valid image file.");
      }
    }
  };

  // Delete profile pic
  const deleteImage = async () => {
    try {
      await axios.put(
        "/api/users/profilePic",
        { profilePic: null },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setProfilePic(null);
      setPreview(null);
      await onSave({
        name: name.trim(),
        bio: bio.trim(),
        skills,
        profilePic: null,
      });
    } catch (err) {
      console.error("Failed to delete profile picture:", err);
      setUploadError("Failed to delete profile picture.");
    }
  };

  // Add skill from input (on Enter or button)
  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (
      trimmed &&
      /^[a-zA-Z0-9\s\+\#\.\-]+$/.test(trimmed) &&
      skills.length < MAX_SKILLS &&
      !skills.includes(trimmed)
    ) {
      setSkills((prev) => [...prev, trimmed]);
      setSkillInput("");
    }
  };

  // Remove skill by index
  const removeSkill = (idx) => {
    setSkills((prev) => prev.filter((_, i) => i !== idx));
  };

  // Handle Enter key on skill input
  const onSkillInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length) return;

    try {
      let updatedProfilePic = user.profilePic;

      if (profilePic) {
        const formData = new FormData();
        formData.append("profilePic", profilePic);

        const res = await axios.put("/api/users/profilePic", formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });
        updatedProfilePic = res.data.profilePic;
      }

      await onSave({
        name: name.trim(),
        bio: bio.trim(),
        skills,
        profilePic: updatedProfilePic,
      });
    } catch (err) {
      console.error("Failed to upload profile picture:", err);
      setUploadError("Failed to upload profile picture.");
    }
  };

  return (
    <div className="custom-card">
      <div className="card-body">
        <h3 className="mb-4 fw-bold text-primary">Edit Profile</h3>
        <form
          onSubmit={handleSubmit}
          className="profile-edit-form"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="row align-items-start">
            <div className="col-md-3 text-center mb-3 mb-md-0">
              <img
                src={
                  preview
                    ? preview
                    : user.profilePic
                    ? `${import.meta.env.VITE_BASE_URL}/${user.profilePic}`
                    : DEFAULT_PROFILE_PIC
                }
                alt="Profile Preview"
                className="profile-img rounded-circle img-fluid mb-3"
                style={{
                  maxWidth: "120px",
                  height: "auto",
                  aspectRatio: "1 / 1",
                }}
              />
              {(user.profilePic || preview) && (
                <button
                  type="button"
                  onClick={deleteImage}
                  className="btn btn-outline-danger btn-sm"
                  aria-label="Delete profile picture"
                >
                  Delete Image
                </button>
              )}
            </div>

            <div className="col-md-9">
              {/* Name */}
              <div className="mb-3">
                <label htmlFor="name" className="form-label fw-semibold">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  required
                />
                {errors.name && (
                  <div className="invalid-feedback">{errors.name}</div>
                )}
              </div>

              {/* Upload New Image */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Upload New Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePic(e.target.files[0])}
                  className="form-control"
                />
              </div>

              {/* Bio */}
              <div className="mb-3">
                <label htmlFor="bio" className="form-label fw-semibold">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="form-control"
                  placeholder="Tell us a bit about yourself"
                />
              </div>

              {/* Skills */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Top Skills (max {MAX_SKILLS})
                </label>

                {/* Skills tags */}
                <div className="skills-tags-container mb-2">
                  {skills.map((skill, idx) => (
                    <span key={idx} className="skill-tag">
                      {skill}
                      <button
                        type="button"
                        aria-label={`Remove skill ${skill}`}
                        className="btn-remove-skill"
                        onClick={() => removeSkill(idx)}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>

                {/* Input + Add button */}
                <div className="input-group">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={onSkillInputKeyDown}
                    className={`form-control ${
                      errors.skills ? "is-invalid" : ""
                    }`}
                    placeholder="Type a skill and press Enter or click Add"
                    disabled={skills.length >= MAX_SKILLS}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={addSkill}
                    disabled={!skillInput.trim() || skills.length >= MAX_SKILLS}
                  >
                    Add
                  </button>
                </div>

                {/* Skills counter */}
                <small className="text-muted mt-1 d-block">
                  {skills.length} / {MAX_SKILLS} skills added
                </small>

                {errors.skills && (
                  <div className="invalid-feedback d-block">
                    {errors.skills}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="text-end">
                <button
                  type="submit"
                  className="btn btn-primary me-2"
                  disabled={!isDirty || Object.keys(errors).length > 0}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn-secondary-custom"
                  onClick={onCancel}
                >
                  Cancel
                </button>
              </div>

              {uploadError && (
                <div className="text-danger mt-2 small">{uploadError}</div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditForm;
