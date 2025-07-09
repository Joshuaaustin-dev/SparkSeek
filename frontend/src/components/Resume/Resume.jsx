import { useState } from "react";
import axios from "axios";

function ParsedResumeView({ data }) {
  if (!data) return null;

  const resume = data.data;
  console.log(resume);

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

  const extractSkills = () => {
    const skills =
      resume.skill
        ?.filter((skill) => skill.confidence >= 0.75)
        .map((skill) => skill.raw)
        .filter(Boolean)
        .map((s) => s.trim().toLowerCase()) || [];

    const languages =
      resume.language
        ?.map((lang) => lang.raw)
        .filter(Boolean)
        .map((l) => l.trim().toLowerCase()) || [];

    // Combine both and deduplicate
    return [...new Set([...skills, ...languages])];
  };

  const extractEducation = () => {
    return (
      resume.education?.map((entry) => {
        if (entry.raw) return entry.raw;

        const degree = entry.degree || "";
        const school = entry.institution || "";
        const dates = `${entry.dateRange?.start || ""} – ${
          entry.dateRange?.end || ""
        }`;
        return [degree, "at", school, `(${dates})`].filter(Boolean).join(" ");
      }) ?? []
    );
  };

  const extractExperience = () => {
    return (
      resume.workExperience?.map((entry) => {
        // Use raw if structured fields are missing or empty
        if (entry.raw) return entry.raw;

        const job = entry.jobTitle || "";
        const org = entry.organization || "";
        const dates = `${entry.dateRange?.start || ""} – ${
          entry.dateRange?.end || ""
        }`;

        // Only show structured version if there's at least a job or org
        if (job || org) {
          return [job, "at", org, `(${dates})`].filter(Boolean).join(" ");
        }

        return "Experience details unavailable";
      }) ?? []
    );
  };

  const extractYearsOfExperience = () =>
    resume.totalYearsExperience?.parsed || "Not specified";

  const extractSummary = () => resume.summary?.parsed || "Not specified";

  const skills = extractSkills();
  const education = extractEducation();
  const experience = extractExperience();
  const summary = extractSummary();

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
        <ul>
          {skills.map((skill, i) => (
            <li key={i}>{skill}</li>
          ))}
        </ul>
      ) : (
        <p>No skills listed.</p>
      )}

      <h3>Education</h3>
      {education.length > 0 ? (
        <ul>
          {education.map((edu, i) => (
            <li key={i}>{edu}</li>
          ))}
        </ul>
      ) : (
        <p>No education history found.</p>
      )}

      <h3>Experience</h3>
      <h3>Total Experience</h3>
      <p>{extractYearsOfExperience()} years</p>
      {experience.length > 0 ? (
        <ul>
          {experience.map((exp, i) => (
            <li key={i}>{exp}</li>
          ))}
        </ul>
      ) : (
        <p>No work experience found.</p>
      )}

      <h3>Summary</h3>
      <p>{summary}</p>
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
