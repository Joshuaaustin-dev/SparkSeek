const ResumeSection = ({ skills = [], resumeUrl }) => (
  <div className="mb-6">
    <h3 className="text-xl font-semibold mb-2">Resume & Skills</h3>
    <p>
      <strong>Skills:</strong>{" "}
      {skills.length ? skills.join(", ") : "Not listed"}
    </p>
    <p>
      <strong>Resume:</strong>{" "}
      {resumeUrl ? (
        <a
          href={resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          View Resume
        </a>
      ) : (
        "No resume uploaded"
      )}
    </p>
  </div>
);

export default ResumeSection;
