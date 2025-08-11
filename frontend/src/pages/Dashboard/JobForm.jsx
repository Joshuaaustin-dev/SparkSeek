import { useState, useEffect } from "react";
import axios from "axios";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <form
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative"
        onSubmit={handleJobSubmit}
      >
        <button
          type="button"
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4 text-blue-900">Add Custom Job</h2>
        <input
          className="w-full border border-blue-200 rounded-lg p-2 mb-3"
          placeholder="Job Title"
          name="title"
          value={jobForm.title}
          onChange={handleChange}
          required
        />
        <input
          className="w-full border border-blue-200 rounded-lg p-2 mb-3"
          placeholder="Company"
          name="company"
          value={jobForm.company}
          onChange={handleChange}
          required
        />
        <input
          className="w-full border border-blue-200 rounded-lg p-2 mb-3"
          placeholder="Location"
          name="location"
          value={jobForm.location}
          onChange={handleChange}
        />
        <input
          className="w-full border border-blue-200 rounded-lg p-2 mb-3"
          placeholder="Apply URL"
          name="applyUrl"
          value={jobForm.applyUrl}
          onChange={handleChange}
        />
        <input
          className="w-full border border-blue-200 rounded-lg p-2 mb-3"
          placeholder="Salary Min"
          type="number"
          name="salary_min"
          value={jobForm.salary_min}
          onChange={handleChange}
        />
        <input
          className="w-full border border-blue-200 rounded-lg p-2 mb-3"
          placeholder="Salary Max"
          type="number"
          name="salary_max"
          value={jobForm.salary_max}
          onChange={handleChange}
        />
        <textarea
          className="w-full border border-blue-200 rounded-lg p-2 mb-4"
          placeholder="Description"
          rows={3}
          name="description"
          value={jobForm.description}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition w-full"
          disabled={submitting}
        >
          {submitting ? "Adding..." : "Add Job"}
        </button>
      </form>
    </div>
  );
};

export default JobForm;
