import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./jobInfoCard.css";

function JobInfoCard() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);

  useEffect(() => {
    const storedJobs = localStorage.getItem("job_results");
    if (storedJobs) {
      const parsedJobs = JSON.parse(storedJobs);

      // Try both possible ID fields
      const foundJob = parsedJobs.find(
        (j) => String(j.id) === jobId || String(j.job_id) === jobId
      );

      setJob(foundJob);
      console.log("Job found in localStorage:", foundJob);
    }
  }, [jobId]);

  if (!job) {
    return (
      <div className="job-info-card">
        <h2>Job Not Found</h2>
        <button onClick={() => navigate(-1)}>← Back</button>
      </div>
    );
  }

  return (
    <div className="job-info-card">
      <button onClick={() => navigate(-1)}>← Back</button>
      <h2>{job.title}</h2>
      <h3>{job.company?.display_name}</h3>
      <p>
        <strong>Location:</strong> {job.location?.display_name || "Remote"}
      </p>
      <p>
        <strong>Type:</strong> {job.contract_time || "N/A"}
      </p>

      {job.salary_min && (
        <p>
          <strong>Salary:</strong>{" "}
          {job.salary_max
            ? `$${Math.round(job.salary_min).toLocaleString()} - $${Math.round(
                job.salary_max
              ).toLocaleString()}`
            : `$${Math.round(job.salary_min).toLocaleString()}`}
        </p>
      )}

      <p>
        <strong>Description:</strong>
      </p>
      <p
        dangerouslySetInnerHTML={{
          __html: job.description || "No description available.",
        }}
      />

      {job.redirect_url && (
        <a
          href={job.redirect_url}
          target="_blank"
          rel="noopener noreferrer"
          className="apply-button"
        >
          Apply Now
        </a>
      )}

      <button
        className="track-button"
        onClick={async () => {
          try {
            const payload = {
              title: job.title,
              company: job.company?.display_name || "",
              location: job.location?.display_name || "",
              type: job.contract_time || "",
              description: job.description || "",
              applyUrl: job.redirect_url || "",
              salary_min: job.salary_min,
              salary_max: job.salary_max,
              jobId: job.id,
            };

            const res = await fetch("/api/jobs/track", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (res.ok) {
              alert("Application tracked!");
            } else {
              alert("Failed to track: " + data.error);
            }
          } catch (error) {
            console.error(error);
            alert("Error tracking job.");
          }
        }}
      >
        Track Application
      </button>
    </div>
  );
}

export default JobInfoCard;
