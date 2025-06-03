import React, { useEffect, useState } from "react";
import axios from "axios";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError("");

      try {
        const options = {
          method: "GET",
          url: "https://jsearch.p.rapidapi.com/search",
          params: { query: "software engineer", num_pages: "1" },
          headers: {
            "X-RapidAPI-Key":
              "88a344f5bemsh8bce1c34516bb7cp112a99jsn9989661c2147", // Replace with your key
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
          },
        };

        const response = await axios.request(options);
        console.log("Job Data");
        console.log(response.data.data);
        setJobs(response.data.data || []);
      } catch (err) {
        setError("Failed to fetch jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
    console.log(jobs);
  }, []);

  if (loading) return <p>Loading jobs...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Job Listings</h2>
      {jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          {jobs.map((job) => (
            <div
              key={job.job_id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1rem",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                backgroundColor: "#fff",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
              }}
            >
              <a
                href={job.job_apply_link}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  color: "#0077cc",
                  textDecoration: "none",
                  marginBottom: "0.5rem",
                }}
              >
                {job.job_title}
              </a>
              <div style={{ color: "#555", marginBottom: "0.5rem" }}>
                {job.employer_name}
              </div>
              <div style={{ fontSize: "0.9rem", color: "#777" }}>
                {job.job_city}, {job.job_country}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Jobs;
