import { useState } from "react";

// src/components/DashboardJobDetails.jsx
const DashboardJobDetails = ({ job }) => {
  const [showMore, setShowMore] = useState(false);
  const MAX_LENGTH = 200;

  if (!job) return null;

  return (
    <div>
      <h2>{job.position}</h2>
      <h4 style={{ margin: "8px 0", color: "#555" }}>{job.company}</h4>

      {job.location && (
        <p>
          <strong>Location:</strong> {job.location}
        </p>
      )}

      {job.salary_min && job.salary_max && (
        <p>
          <strong>Salary Range:</strong> ${job.salary_min.toLocaleString()} – $
          {job.salary_max.toLocaleString()}
        </p>
      )}

      {job.status && (
        <p>
          <strong>Status:</strong> {job.status}
        </p>
      )}

      <p>
        {showMore
          ? job.description
          : job.description.slice(0, MAX_LENGTH) +
            (job.description.length > MAX_LENGTH ? "..." : "")}
      </p>
      {job.description.length > MAX_LENGTH && (
        <button onClick={() => setShowMore(!showMore)}>
          {showMore ? "Show Less" : "Show More"}
        </button>
      )}

      {job.applyUrl && (
        <p>
          <strong>Apply:</strong>{" "}
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#007bff" }}
          >
            Visit application page
          </a>
        </p>
      )}

      {job.employerWebsite && (
        <p>
          <strong>Employer Website:</strong>{" "}
          <a
            href={job.employerWebsite}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#007bff" }}
          >
            {job.employerWebsite}
          </a>
        </p>
      )}
    </div>
  );
};

export default DashboardJobDetails;
