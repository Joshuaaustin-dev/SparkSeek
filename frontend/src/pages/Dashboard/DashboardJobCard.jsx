import { useState } from "react";

const DashboardJobCard = ({ job }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          marginBottom: 10,
          backgroundColor: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          cursor: "pointer",
          userSelect: "none",
          transition: "box-shadow 0.2s ease",
        }}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", JSON.stringify(job));
        }}
        onClick={() => setShowDetails(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setShowDetails(true);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`${job.position} at ${job.company}, click for details`}
      >
        <h4
          style={{
            margin: "0 0 6px 0",
            fontSize: "1rem",
            color: "#222",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={job.position}
        >
          {job.position}
        </h4>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: "#666",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={job.company}
        >
          {job.company}
        </p>
      </div>

      {showDetails && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowDetails(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 8,
              maxWidth: 600,
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDetails(false)}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                fontSize: 18,
                cursor: "pointer",
                border: "none",
                background: "none",
              }}
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
