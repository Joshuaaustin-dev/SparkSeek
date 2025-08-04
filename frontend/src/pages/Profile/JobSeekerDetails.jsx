const JobSeekerDetails = ({ bio }) => (
  <div className="mb-5">
    <div
      aria-label="Bio"
      style={{
        padding: "0.375rem 0.75rem", // similar padding to form-control
        backgroundColor: "transparent",
        minHeight: "100px",
        fontSize: "1rem",
        whiteSpace: "pre-wrap",
      }}
    >
      {bio || "Write something about yourself..."}
    </div>
  </div>
);

export default JobSeekerDetails;
