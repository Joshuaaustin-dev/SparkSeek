import { useState } from "react";
import DashboardJobDetails from "./DashboardJobDetails";

const DashboardJobCard = ({ job }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <div
        className="job-card"
        onClick={() => setShowDetails(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setShowDetails(true);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`${job.title} at ${job.company}, click for details`}
        title={`${job.title} • ${job.company}`}
      >
        <h4 className="job-card-title" title={job.title}>
          {job.title}
        </h4>
        <p className="job-card-company" title={job.company}>
          {job.company}
        </p>
      </div>
      {showDetails && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowDetails(false)}
              className="modal-close-btn"
              aria-label="Close job details"
            >
              &times;
            </button>
            <DashboardJobDetails job={job} />
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardJobCard;
