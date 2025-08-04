import DashboardJobCard from "./DashboardJobCard";

const JobBoard = ({ columns, onCardClick }) => {
  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        marginTop: 20,
        overflowX: "auto",
        paddingBottom: 10,
      }}
    >
      {Object.entries(columns).map(([stage, jobs]) => (
        <div
          key={stage}
          style={{
            flex: "1 1 0",
            backgroundColor: "#fafafa",
            padding: 12,
            borderRadius: 8,
            minHeight: 350,
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            maxWidth: 320,
            overflowY: "auto",
          }}
        >
          <h3
            style={{
              textAlign: "center",
              fontSize: "1.1rem",
              marginBottom: 12,
              color: "#333",
              fontWeight: "600",
              userSelect: "none",
            }}
          >
            {stage}
          </h3>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              overflowY: "auto",
              paddingRight: 4,
            }}
          >
            {jobs.length === 0 && (
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#777",
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                No applications
              </p>
            )}
            {jobs.map((job) => (
              <DashboardJobCard
                key={job.id}
                job={job}
                style={{
                  fontSize: "0.9rem",
                  wordWrap: "break-word",
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobBoard;
