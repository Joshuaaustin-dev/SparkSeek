import { useState, useEffect } from "react";
import axios from "axios";
import "./jobs.css";

const JobCardSkeleton = () => (
  <div className="job-card skeleton">
    <div className="skeleton-title shimmer" />
    <div className="skeleton-company shimmer" />
    <div className="skeleton-logo shimmer" />
    <div className="skeleton-location shimmer" />
  </div>
);

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [employmentType, setEmploymentType] = useState("");
  const [datePosted, setDatePosted] = useState("");

  const [showScrollTop, setShowScrollTop] = useState(false);

  // Fetch jobs when the user clicks Search
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setJobs([]);

    try {
      const params = new URLSearchParams({
        query: query.trim() || "developer",
        location: location.trim() || "",
        remoteOnly: remoteOnly ? "true" : "false",
        employmentType: employmentType || "",
        datePosted: datePosted || "",
        page: "1",
      });

      const response = await axios.get(
        `/api/jobs/external-jobs?${params.toString()}`
      );

      const newJobs = response.data.data || [];
      setJobs(newJobs);

      if (newJobs.length === 0) {
        setError("No jobs found for your criteria.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="jobs-container">
      <h2 className="jobs-title">🔥 Discover Your Spark!</h2>

      <form className="jobs-search" onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search job titles..."
          className="search-input"
        />

        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (e.g., Remote or New York)"
          className="search-input"
        />

        <select
          value={employmentType}
          onChange={(e) => setEmploymentType(e.target.value)}
          className="filter-select"
        >
          <option value="">Any Type</option>
          <option value="FULLTIME">Full-time</option>
          <option value="PARTTIME">Part-time</option>
          <option value="CONTRACTOR">Contract</option>
          <option value="INTERN">Internship</option>
        </select>

        <select
          value={datePosted}
          onChange={(e) => setDatePosted(e.target.value)}
          className="filter-select"
        >
          <option value="">Any Date</option>
          <option value="today">Last 24 hours</option>
          <option value="3days">Last 3 days</option>
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
        </select>

        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
          />
          Remote Only
        </label>

        <button type="submit" className="search-button" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && (
        <div className="jobs-error">
          <p>{error}</p>
          <button onClick={handleSearch}>Retry</button>
        </div>
      )}

      <div className="jobs-grid">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}

        {!loading &&
          jobs.map((job) => (
            <a
              key={job.job_id}
              href={job.job_apply_link}
              target="_blank"
              rel="noreferrer"
              className="job-card"
            >
              <div className="job-header">
                <h3 className="job-title">{job.job_title}</h3>
                {job.employer_logo && (
                  <img
                    src={job.employer_logo}
                    alt={job.employer_name || "Employer logo"}
                    className="job-logo"
                  />
                )}
              </div>
              <div className="job-company">{job.employer_name}</div>
              <div className="job-location">
                {job.job_city || "Remote"}, {job.job_country}
              </div>
              {job.job_employment_type && (
                <div className="job-type">{job.job_employment_type}</div>
              )}
            </a>
          ))}
      </div>

      {showScrollTop && (
        <button
          className="scroll-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
    </div>
  );
}

export default Jobs;
