import { useState, useEffect } from "react";
import axios from "axios";
import "./DashboardJobCard.css";

const DashboardJobDetails = ({ job, onJobUpdated, onJobDeleted }) => {
  const [editMode, setEditMode] = useState(false);
  const [localJob, setLocalJob] = useState({ ...job });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // When job prop changes, update local state
  useEffect(() => {
    setLocalJob({ ...job });
  }, [job]);

  if (!job) return null;

  const onFieldChange = (field, value) => {
    setLocalJob((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put(
        `/api/jobs/update-status/${job._id || job.id}`,
        localJob,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setEditMode(false);
      onJobUpdated && onJobUpdated(res.data);
    } catch (err) {
      alert("Failed to update job.");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/jobs/${job._id || job.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      onJobDeleted && onJobDeleted(job._id || job.id);
    } catch (err) {
      alert("Failed to delete job.");
    }
    setDeleting(false);
  };

  return (
    <div className="job-details">
      <div className="job-details-header">
        <h2 className="job-details-title">{localJob.title}</h2>
        <h4 className="job-details-company">{localJob.company}</h4>
      </div>

      <div className="job-details-info">
        {localJob.location && (
          <p>
            <strong>Location:</strong> {localJob.location}
          </p>
        )}

        {localJob.salary_min && localJob.salary_max && (
          <p>
            <strong>Salary Range:</strong>{" "}
            <span className="job-details-salary">
              ${Number(localJob.salary_min).toLocaleString()} – $
              {Number(localJob.salary_max).toLocaleString()}
            </span>
          </p>
        )}

        {localJob.status && (
          <p>
            <strong>Status:</strong>
            <span className="job-details-status">{localJob.status}</span>
          </p>
        )}
      </div>

      <div className="job-description-section">
        <label className="job-description-label">Description:</label>
        {editMode ? (
          <div>
            <input
              className="job-edit-input"
              value={localJob.title || ""}
              onChange={(e) => onFieldChange("title", e.target.value)}
              placeholder="Job Title"
            />
            <input
              className="job-edit-input"
              value={localJob.company || ""}
              onChange={(e) => onFieldChange("company", e.target.value)}
              placeholder="Company"
            />
            <input
              className="job-edit-input"
              value={localJob.location || ""}
              onChange={(e) => onFieldChange("location", e.target.value)}
              placeholder="Location"
            />
            <input
              className="job-edit-input"
              value={localJob.applyUrl || ""}
              onChange={(e) => onFieldChange("applyUrl", e.target.value)}
              placeholder="Apply URL"
            />
            <input
              type="number"
              className="job-edit-input"
              value={localJob.salary_min || ""}
              onChange={(e) => onFieldChange("salary_min", e.target.value)}
              placeholder="Salary Min"
            />
            <input
              type="number"
              className="job-edit-input"
              value={localJob.salary_max || ""}
              onChange={(e) => onFieldChange("salary_max", e.target.value)}
              placeholder="Salary Max"
            />
            <textarea
              className="job-edit-textarea"
              value={localJob.description || ""}
              onChange={(e) => onFieldChange("description", e.target.value)}
              placeholder="Job description..."
            />
            <div className="job-button-group">
              <button
                className="job-btn job-btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                className="job-btn job-btn-secondary"
                onClick={() => {
                  setEditMode(false);
                  setLocalJob({ ...job });
                }}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="job-description-display">
            {localJob.description || "No description provided."}
          </div>
        )}
      </div>

      <div className="job-button-group">
        <button
          className="job-btn job-btn-edit"
          onClick={() => setEditMode(true)}
          disabled={editMode}
        >
          Edit Job
        </button>
        <button
          className="job-btn job-btn-danger"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete Job"}
        </button>
      </div>

      {(localJob.applyUrl || localJob.employerWebsite) && (
        <div className="job-details-links">
          {localJob.applyUrl && (
            <p>
              <strong>Apply:</strong>{" "}
              <a
                href={localJob.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit application page →
              </a>
            </p>
          )}

          {localJob.employerWebsite && (
            <p>
              <strong>Employer Website:</strong>{" "}
              <a
                href={localJob.employerWebsite}
                target="_blank"
                rel="noopener noreferrer"
              >
                {localJob.employerWebsite} →
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardJobDetails;
