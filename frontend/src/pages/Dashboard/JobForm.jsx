import { useState, useEffect } from "react";
import axios from "axios";
// Import the stylesheet
import "./JobForm.css";

const initialState = {
  title: "",
  company: "",
  location: "",
  description: "",
  applyUrl: "",
  salary_min: "",
  salary_max: "",
};

const JobForm = ({ open, onClose, onSuccess }) => {
  const [jobForm, setJobForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);

  // Reset form state every time the modal opens
  useEffect(() => {
    if (open) setJobForm(initialState);
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post("/api/jobs/track", jobForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setJobForm(initialState);
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      alert("Failed to add job.");
    }
    setSubmitting(false);
  };

  return (
    <div className="job-form-overlay">
      <form className="job-form-container" onSubmit={handleJobSubmit}>
        <button
          type="button"
          className="job-form-close"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <h2 className="job-form-title">Track a Job</h2>

        <div className="job-form-field-group">
          <input
            className="job-form-input"
            placeholder="Job Title"
            name="title"
            value={jobForm.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="job-form-field-group">
          <input
            className="job-form-input"
            placeholder="Company"
            name="company"
            value={jobForm.company}
            onChange={handleChange}
            required
          />
        </div>

        <div className="job-form-field-group">
          <input
            className="job-form-input"
            placeholder="Location"
            name="location"
            value={jobForm.location}
            onChange={handleChange}
          />
        </div>

        <div className="job-form-field-group">
          <input
            className="job-form-input"
            placeholder="Apply URL"
            name="applyUrl"
            value={jobForm.applyUrl}
            onChange={handleChange}
            type="url"
          />
        </div>

        <div className="job-form-field-row">
          <input
            className="job-form-input"
            placeholder="Salary Min"
            type="number"
            name="salary_min"
            value={jobForm.salary_min}
            onChange={handleChange}
            min="0"
          />
          <input
            className="job-form-input"
            placeholder="Salary Max"
            type="number"
            name="salary_max"
            value={jobForm.salary_max}
            onChange={handleChange}
            min="0"
          />
        </div>

        <div className="job-form-field-group">
          <textarea
            className="job-form-input job-form-textarea"
            placeholder="Job Description"
            rows={3}
            name="description"
            value={jobForm.description}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className={`job-form-submit ${submitting ? "loading" : ""}`}
          disabled={submitting}
        >
          {submitting ? "Adding Job..." : "Add Job"}
        </button>
      </form>
    </div>
  );
};

export default JobForm;
