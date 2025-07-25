import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./jobInfoCard.css";

function ToggleableSection({ title, children, previewLength = 300 }) {
  const [expanded, setExpanded] = useState(false);

  const isText = typeof children === "string";
  const isLong = isText && children.length > previewLength;
  const previewText = isLong
    ? children.slice(0, previewLength) + "..."
    : children;

  const sectionId = title.toLowerCase().replace(/\s+/g, "-") + "-content";

  return (
    <section className={`toggle-section ${expanded ? "expanded" : ""}`}>
      <h3>{title}</h3>
      {isText ? (
        <>
          <p id={sectionId}>{expanded || !isLong ? children : previewText}</p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="toggle-button"
              aria-expanded={expanded}
              aria-controls={sectionId}
            >
              {expanded ? "See Less" : "See More"}
            </button>
          )}
        </>
      ) : (
        <div id={sectionId}>{children}</div>
      )}
    </section>
  );
}

function JobInfoCard() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError("");

    try {
      const savedJobs = localStorage.getItem("jobs_results");
      if (!savedJobs) {
        setError("No saved job data found.");
        setLoading(false);
        return;
      }

      const jobsArray = JSON.parse(savedJobs);
      const foundJob = jobsArray.find((j) => j.job_id === jobId);

      if (!foundJob) {
        setError("Job not found in saved data.");
      } else {
        setJob(foundJob);
      }
    } catch (err) {
      setError("Failed to load job data.");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  async function handleSaveJob() {
    if (!job) return;
    setSaving(true);
    setSaveSuccess(null);

    try {
      const response = await fetch("/api/saveJob", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ job }),
      });

      if (!response.ok) throw new Error("Failed to save job");

      setSaveSuccess(true);
    } catch {
      setSaveSuccess(false);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="loading">Loading job details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!job) return <div className="no-job">No job found.</div>;

  return (
    <main className="job-info-card" role="main" aria-label="Job details">
      <button
        onClick={() => navigate(-1)}
        className="back-button"
        aria-label="Go back to job listings"
      >
        ← Back to Search Results
      </button>

      <section className="action-buttons" aria-label="Job actions">
        <button
          onClick={handleSaveJob}
          className="save-job-button"
          disabled={saving}
          aria-live="polite"
          aria-disabled={saving}
        >
          {saving ? "Saving..." : "Track Application"}
        </button>
        {saveSuccess === true && (
          <div className="save-success" role="alert" aria-live="assertive">
            Job saved to your dashboard!
          </div>
        )}
        {saveSuccess === false && (
          <div className="save-error" role="alert" aria-live="assertive">
            Failed to save job. Please try again.
          </div>
        )}

        {job.job_apply_link && (
          <a
            href={job.job_apply_link}
            target="_blank"
            rel="noreferrer noopener"
            className="apply-button"
            aria-label={`Apply for ${job.job_title} at ${job.employer_name}`}
          >
            Apply Now
          </a>
        )}
      </section>

      {/* Job details */}
      <header className="job-header">
        <h1 className="job-title">{job.job_title}</h1>
        <div className="company-info">
          {job.employer_logo && (
            <img
              src={job.employer_logo}
              alt={`${job.employer_name} logo`}
              className="employer-logo"
              loading="lazy"
            />
          )}
          <h2 className="employer-name">{job.employer_name}</h2>
        </div>
        {job.employer_website && (
          <a
            href={job.employer_website}
            target="_blank"
            rel="noreferrer noopener"
            className="employer-website"
          >
            Visit Employer Website
          </a>
        )}
      </header>

      <section className="job-key-info" aria-label="Job key information">
        <p>
          <strong>Location:</strong>{" "}
          {job.job_location ||
            `${job.job_city}, ${job.job_state}, ${job.job_country}`}
        </p>
        <p>
          <strong>Employment Type:</strong> {job.job_employment_type || "N/A"}
        </p>
        <p>
          <strong>Remote:</strong> {job.job_is_remote ? "Yes" : "No"}
        </p>
        <p>
          <strong>Posted:</strong> {job.job_posted_at}
        </p>
        {(job.job_min_salary || job.job_max_salary) && (
          <p>
            <strong>Salary:</strong>{" "}
            {job.job_min_salary ? `$${job.job_min_salary}` : ""}
            {job.job_max_salary ? ` - $${job.job_max_salary}` : ""}
          </p>
        )}
      </section>

      {/* Job Description and Highlights */}
      {job.job_description && (
        <ToggleableSection title="Job Description">
          {job.job_description}
        </ToggleableSection>
      )}

      {job.job_highlights && (
        <section className="job-highlights">
          {job.job_highlights.Qualifications?.length > 0 && (
            <ToggleableSection title="Qualifications">
              <ul>
                {job.job_highlights.Qualifications.map((q, i) => (
                  <li key={`qual-${i}`}>{q}</li>
                ))}
              </ul>
            </ToggleableSection>
          )}

          {job.job_highlights.Responsibilities?.length > 0 && (
            <ToggleableSection title="Responsibilities">
              <ul>
                {job.job_highlights.Responsibilities.map((r, i) => (
                  <li key={`resp-${i}`}>{r}</li>
                ))}
              </ul>
            </ToggleableSection>
          )}
        </section>
      )}
    </main>
  );
}

export default JobInfoCard;
