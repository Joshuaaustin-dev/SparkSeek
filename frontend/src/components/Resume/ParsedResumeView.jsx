import { useState } from "react";
import "./ParsedResumeView.css";

function ExperienceItem({ text }) {
  const [expanded, setExpanded] = useState(false);
  const limit = 300;

  // Split into sentences by punctuation followed by space
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);

  // If text is short enough, just show it as paragraph or list
  if (text.length <= limit) {
    if (sentences.length > 1) {
      return (
        <ul className="experience-list">
          {sentences.map((sentence, i) => (
            <li key={i}>{sentence}</li>
          ))}
        </ul>
      );
    }
    return <p className="experience-paragraph">{text}</p>;
  }

  // For longer text, show truncated or full with toggle
  if (!expanded) {
    // Find how many sentences fit within the limit
    let truncatedText = "";
    for (let i = 0; i < sentences.length; i++) {
      const candidate = truncatedText
        ? truncatedText + " " + sentences[i]
        : sentences[i];
      if (candidate.length > limit) break;
      truncatedText = candidate;
    }

    // If truncatedText is empty (very long first sentence), truncate manually
    if (!truncatedText) truncatedText = text.slice(0, limit);

    return (
      <p className="experience-paragraph">
        {truncatedText.trim()}
        {truncatedText.length < text.length && "... "}
        <span
          className="read-more-toggle"
          tabIndex={0}
          role="button"
          onClick={() => setExpanded(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setExpanded(true);
          }}
        >
          Read More
        </span>
      </p>
    );
  }

  // Expanded view
  return sentences.length > 1 ? (
    <>
      <ul className="experience-list">
        {sentences.map((sentence, i) => (
          <li key={i}>{sentence}</li>
        ))}
      </ul>
      <span
        className="read-more-toggle"
        tabIndex={0}
        role="button"
        onClick={() => setExpanded(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setExpanded(false);
        }}
      >
        Read Less
      </span>
    </>
  ) : (
    <>
      <p className="experience-paragraph">{text}</p>
      <span
        className="read-more-toggle"
        tabIndex={0}
        role="button"
        onClick={() => setExpanded(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setExpanded(false);
        }}
      >
        Read Less
      </span>
    </>
  );
}

export default function ParsedResumeView({ data }) {
  if (!data?.parsed) return <p>No resume selected or data missing.</p>;

  const {
    name,
    email,
    phone,
    summary,
    skills = [],
    education = [],
    experience = [],
    totalYearsWorked,
  } = data.parsed;

  const cleanSkill = (skill) => skill.replace(/[^a-zA-Z0-9 &+#]/g, "").trim();

  // Deduplicate and normalize skills
  const uniqueSkills = Array.from(
    new Set(skills.map((s) => cleanSkill(s).toLowerCase()).filter(Boolean))
  );

  const normalizedSkills = uniqueSkills.map((s) => {
    const original =
      skills.find((orig) => cleanSkill(orig).toLowerCase() === s) || s;

    if (original && /^[A-Z&+#0-9]+$/.test(original.replace(/\s+/g, ""))) {
      return original.toUpperCase();
    }

    return s.replace(/\b\w/g, (c) => c.toUpperCase());
  });

  const [showAllSkills, setShowAllSkills] = useState(false);

  const skillsToShow = showAllSkills
    ? normalizedSkills
    : normalizedSkills.slice(0, 10);

  const half = Math.ceil(skillsToShow.length / 2);
  const skillColumns = [skillsToShow.slice(0, half), skillsToShow.slice(half)];

  return (
    <div className="parsed-resume-container">
      <h2 className="parsed-resume-name">{name || "Unnamed"}</h2>
      <p className="parsed-resume-contact">
        {email && <span>Email: {email}</span>}
        {phone && <span> | Phone: {phone}</span>}
      </p>

      {summary && (
        <>
          <h3 className="parsed-resume-section-title">Summary</h3>
          <p className="parsed-resume-summary-text">{summary}</p>
        </>
      )}

      {normalizedSkills.length > 0 && (
        <>
          <h3 className="parsed-resume-section-title">Skills</h3>
          <div className="skills-container">
            {skillsToShow.map((skill, idx) => (
              <div key={idx} className="skill-bubble">
                {skill}
              </div>
            ))}
          </div>

          {normalizedSkills.length > 10 && (
            <button
              className="view-toggle-button"
              onClick={() => setShowAllSkills(!showAllSkills)}
            >
              {showAllSkills ? "View Less Skills" : "View More Skills"}
            </button>
          )}
        </>
      )}

      {education.length > 0 && (
        <>
          <h3 className="parsed-resume-section-title">Education</h3>
          <div className="education-text">
            {education.map((edu, idx) => (
              <p key={idx}>{edu}</p>
            ))}
          </div>
        </>
      )}

      {experience.length > 0 && (
        <>
          <h3 className="parsed-resume-section-title">Experience</h3>
          <div className="experience-text">
            {experience.map((exp, idx) => (
              <ExperienceItem key={idx} text={exp} />
            ))}
          </div>
        </>
      )}

      {totalYearsWorked && (
        <p className="total-years-experience">
          Total Years Experience: {totalYearsWorked} years
        </p>
      )}
    </div>
  );
}
