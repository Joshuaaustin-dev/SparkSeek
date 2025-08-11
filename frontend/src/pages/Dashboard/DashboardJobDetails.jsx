import { useState, useEffect } from "react";
import axios from "axios";

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
    <div>
      <h2 className="text-xl font-bold">{localJob.title || localJob.title}</h2>
      <h4 className="my-2 text-gray-600">{localJob.company}</h4>

      {localJob.location && (
        <p>
          <strong>Location:</strong> {localJob.location}
        </p>
      )}

      {localJob.salary_min && localJob.salary_max && (
        <p>
          <strong>Salary Range:</strong> $
          {Number(localJob.salary_min).toLocaleString()} – $
          {Number(localJob.salary_max).toLocaleString()}
        </p>
      )}

      {localJob.status && (
        <p>
          <strong>Status:</strong> {localJob.status}
        </p>
      )}

      <div className="my-4">
        <strong>Description:</strong>
        {editMode ? (
          <div>
            <input
              className="w-full border mb-2 p-2 rounded"
              value={localJob.title || ""}
              onChange={(e) => onFieldChange("title", e.target.value)}
              placeholder="Job Title"
            />
            <input
              className="w-full border mb-2 p-2 rounded"
              value={localJob.company || ""}
              onChange={(e) => onFieldChange("company", e.target.value)}
              placeholder="Company"
            />
            <input
              className="w-full border mb-2 p-2 rounded"
              value={localJob.location || ""}
              onChange={(e) => onFieldChange("location", e.target.value)}
              placeholder="Location"
            />
            <input
              className="w-full border mb-2 p-2 rounded"
              value={localJob.applyUrl || ""}
              onChange={(e) => onFieldChange("applyUrl", e.target.value)}
              placeholder="Company Site"
            />
            <input
              type="number"
              className="w-full border mb-2 p-2 rounded"
              value={localJob.salary_min || ""}
              onChange={(e) => onFieldChange("salary_min", e.target.value)}
              placeholder="Salary Min"
            />
            <input
              type="number"
              className="w-full border mb-2 p-2 rounded"
              value={localJob.salary_max || ""}
              onChange={(e) => onFieldChange("salary_max", e.target.value)}
              placeholder="Salary Max"
            />
            <textarea
              className="mt-1 max-h-40 min-h-[80px] w-full overflow-y-auto rounded bg-gray-50 p-3 border border-gray-200 text-sm"
              value={localJob.description || ""}
              onChange={(e) => onFieldChange("description", e.target.value)}
            />
            <div className="flex gap-2 mt-2">
              <button
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                className="bg-gray-200 px-4 py-1 rounded hover:bg-gray-300"
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
          <div className="mt-1 max-h-40 overflow-y-auto rounded bg-gray-50 p-3 border border-gray-200 text-sm whitespace-pre-wrap">
            {localJob.description}
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-4">
        <button
          className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600"
          onClick={() => setEditMode(true)}
          disabled={editMode}
        >
          Edit
        </button>
        <button
          className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      {localJob.applyUrl && (
        <p className="mt-4">
          <strong>Apply:</strong>{" "}
          <a
            href={localJob.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Visit application page
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
            className="text-blue-600 hover:underline"
          >
            {localJob.employerWebsite}
          </a>
        </p>
      )}
    </div>
  );
};

export default DashboardJobDetails;
