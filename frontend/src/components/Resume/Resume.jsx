import { useState, useEffect } from "react";
import axios from "axios";

function Resume() {
  const [file, setFile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Fetch user's resumes on mount
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/resumes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResumes(res.data);
      } catch (err) {
        setError("Failed to fetch resumes");
      }
    };

    fetchResumes();
  }, []);

  // Handle file input change
  const onFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  // Upload file handler
  const onUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/api/resumes", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setResumes((prev) => [res.data, ...prev]);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2>Upload Resume</h2>
      <input type="file" accept=".pdf,.doc,.docx" onChange={onFileChange} />
      <button onClick={onUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h3>Your Resumes</h3>
      {resumes.length === 0 && <p>No resumes uploaded yet.</p>}
      <ul>
        {resumes.map((r) => (
          <li key={r._id}>
            <a href={r.filePath} target="_blank" rel="noopener noreferrer">
              {r.originalName}
            </a>
            (Uploaded on {new Date(r.uploadDate).toLocaleDateString()})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Resume;
