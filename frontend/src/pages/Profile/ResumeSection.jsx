const ResumeSection = ({ skills = [] }) => (
  <div className="mb-6">
    <h3 className="text-xl font-semibold mb-2">Resume & Skills</h3>
    <p>
      <strong>Skills:</strong>{" "}
      {skills.length ? skills.join(", ") : "Not listed"}
    </p>
    <p>
      <strong>Resume:</strong>{" "}
      <a
        href="/resume"
        rel="noopener noreferrer"
        className="underline" style={{ color: 'var(--color-tertiary)' }}
      >
        View Resume
      </a>
    </p>
  </div>
);

export default ResumeSection;
