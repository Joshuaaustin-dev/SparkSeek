import { useState } from "react";
import axios from "axios";

function ParsedResumeView({ data }) {
  if (!data || !data.data) return null;
  console.log("Full resume parse data:", JSON.stringify(data, null, 2));

  const resume = data.data;

  // Extract top-level fields safely
  const name = resume.name?.raw || "Candidate Name";
  const email = resume.contactInformation?.emails?.[0] || "N/A";
  const phone = resume.contactInformation?.phoneNumbers?.[0] || "N/A";

  // Work Experience is an array of objects with nested raw fields
  const workExperience = resume.workExperience || [];
  // Education similarly
  const education = resume.education || [];
  // Skills are objects with a name property
  const skills = resume.skills?.map((skill) => skill.name) || [];

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: 20,
        borderRadius: 6,
        marginTop: 20,
      }}
    >
      <h2>{name}</h2>
      <p>
        <strong>Email:</strong> {email} <br />
        <strong>Phone:</strong> {phone}
      </p>

      <h3>Work Experience</h3>
      {workExperience.length > 0 ? (
        <ul>
          {workExperience.map((job, i) => (
            <li key={i} style={{ marginBottom: 10 }}>
              <strong>{job.jobTitle?.raw || "No title"}</strong> at{" "}
              {job.organization?.raw || "Unknown"} <br />
              {job.dates?.startDate || "Unknown"} -{" "}
              {job.dates?.endDate || "Present"} <br />
              <em>{job.jobDescription?.raw || ""}</em>
            </li>
          ))}
        </ul>
      ) : (
        <p>No work experience listed.</p>
      )}

      <h3>Education</h3>
      {education.length > 0 ? (
        <ul>
          {education.map((school, i) => (
            <li key={i} style={{ marginBottom: 10 }}>
              {school.accreditation?.inputStr || "Degree Unknown"} at{" "}
              {school.organization?.raw || "Unknown"} <br />
              Graduated: {school.dates?.completionDate || "N/A"}
            </li>
          ))}
        </ul>
      ) : (
        <p>No education listed.</p>
      )}

      <h3>Skills</h3>
      {skills.length > 0 ? (
        <p>{skills.join(", ")}</p>
      ) : (
        <p>No skills listed.</p>
      )}
    </div>
  );
}

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setParsedData(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Adjust URL if your backend is on a different port
      const response = await axios.post("/api/resumes", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Raw resume parse response:", response.data);
      setParsedData(response.data);
    } catch (err) {
      setError("Failed to parse resume. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>
      <h2>Upload Resume</h2>
      <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        disabled={loading}
        style={{ marginTop: 10 }}
      >
        {loading ? "Parsing..." : "Upload & Parse"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {parsedData && <ParsedResumeView data={parsedData} />}
    </div>
  );
}
