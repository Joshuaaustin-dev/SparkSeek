import { useState, useEffect } from "react";
import axios from "axios";
import UploadResume from "./UploadResume";
import ResumeSelector from "./ResumeSelector";
import ParsedResumeView from "./ParsedResumeView";
import "./ResumeMain.css";

export default function ResumeMain() {
  const [resumeList, setResumeList] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedResume = resumeList.find((r) => r._id === selectedResumeId);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/resumes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResumeList(res.data);
      if (res.data.length > 0) {
        setSelectedResumeId(res.data[0]._id);
      }
    } catch (err) {
      setError("Failed to load resumes.");
      console.error(err);
    }
  };

  const handleUpload = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");
      await axios.post("/api/resumes", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchResumes();
    } catch (err) {
      setError("Failed to upload resume.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-main-container">
      <div className="resume-controls">
        <div className="resume-panel">
          <h2>Upload Resume</h2>
          <UploadResume onUpload={handleUpload} loading={loading} />
          {error && <p className="error-message">{error}</p>}
        </div>

        <div className="resume-panel">
          <h2>Choose Past Resume</h2>
          <ResumeSelector
            resumes={resumeList}
            selectedId={selectedResumeId}
            onSelect={setSelectedResumeId}
          />
        </div>
      </div>

      <div className="resume-details">
        <h3>Resume Details</h3>
        {selectedResume ? (
          <ParsedResumeView data={selectedResume} />
        ) : (
          <p className="no-resume-message">No resume selected.</p>
        )}
      </div>
    </div>
  );
}
