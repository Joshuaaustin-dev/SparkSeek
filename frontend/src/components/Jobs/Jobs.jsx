import { useEffect, useState } from "react";
import axios from "axios";
import "./jobs.css";

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
              "88a344f5bemsh8bce1c34516bb7cp112a99jsn9989661c2147",
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
          },
        };

        const response = await axios.request(options);
        setJobs(response.data.data || []);
      } catch (err) {
        setError("Failed to fetch jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="jobs-container">
      <h2 className="jobs-title">🔥 Software Engineering Jobs</h2>

      {loading && (
        <p style={{ textAlign: "center", color: "#555" }}>Loading jobs...</p>
      )}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {jobs.length === 0 && !loading ? (
        <p style={{ textAlign: "center", color: "#999" }}>No jobs found.</p>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <div key={job.job_id} className="job-card">
              <a
                href={job.job_apply_link}
                target="_blank"
                rel="noreferrer"
                className="job-link"
              >
                {job.job_title}
              </a>
              <div className="job-company">{job.employer_name}</div>
              {job.employer_logo && (
                <img
                  src={job.employer_logo}
                  alt="Employer logo"
                  className="job-logo"
                />
              )}
              <div className="job-location">
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
