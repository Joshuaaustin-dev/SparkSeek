import { useState } from "react";
import axios from "axios";

function ParsedResumeView({ data }) {
  if (!data) return null;

  const resume = data.data;

  //return the user's name from the resume
  const getFullName = () => resume.candidateName?.[0]?.raw || "Candidate Name";

  //return the user's email from the resume
  const getEmail = () => {
    if (!resume.email?.length) return "N/A";
    return resume.email[0].parsed || resume.email[0].raw || "N/A";
  };

  //return the user's phone number from the resume
  const getPhone = () => {
    if (!resume.phoneNumber?.length) return "N/A";
    const firstPhone = resume.phoneNumber[0];
    if (typeof firstPhone.parsed === "string") return firstPhone.parsed;
    if (firstPhone.parsed?.rawText) return firstPhone.parsed.rawText;
    return firstPhone.raw || "N/A";
  };

  const getSkills = () => {
    if (!resume.skill?.length) return [];
    return resume.skill.map((skill) => skill.name || skill.raw || "");
  };

  const skills = getSkills();

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: 20,
        borderRadius: 6,
        marginTop: 20,
      }}
    >
      <h2>{getFullName()}</h2>
      <p>
        <strong>Email:</strong> {getEmail()} <br />
        <strong>Phone:</strong> {getPhone()}
      </p>
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

      const response = await axios.post("/api/resumes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
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
