import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  //use states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //filters
  const [query, setQuery] = useState(
    () => localStorage.getItem("jobs_query") || ""
  );
  const [location, setLocation] = useState(
    () => localStorage.getItem("jobs_location") || ""
  );
  const [remoteOnly, setRemoteOnly] = useState(() => {
    const val = localStorage.getItem("jobs_remoteOnly");
    return val === "true";
  });
  const [employmentType, setEmploymentType] = useState(
    () => localStorage.getItem("jobs_employmentType") || ""
  );
  const [datePosted, setDatePosted] = useState(
    () => localStorage.getItem("jobs_datePosted") || ""
  );
  const [experience, setExperience] = useState(
    () => localStorage.getItem("jobs_experience") || ""
  );
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem("jobs_results");
    return saved ? JSON.parse(saved) : [];
  });

  // store last search parameters
  const lastSearchRef = useRef(null);

  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();

  // This function creates a stable key from filters to compare searches
  const getSearchKey = () =>
    JSON.stringify({
      query: query.trim() || "developer",
      location: location.trim() || "",
      remoteOnly,
      employmentType,
      datePosted,
      experience,
    });

  // Save to localStorage whenever filters change
  useEffect(() => {
    localStorage.setItem("jobs_query", query);
    localStorage.setItem("jobs_location", location);
    localStorage.setItem("jobs_remoteOnly", remoteOnly);
    localStorage.setItem("jobs_employmentType", employmentType);
    localStorage.setItem("jobs_datePosted", datePosted);
    localStorage.setItem("jobs_experience", experience);
  }, [query, location, remoteOnly, employmentType, datePosted, experience]);

  // Fetch jobs function
  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    setJobs([]);

    const searchParams = {
      query: query.trim() || "developer",
      location: location.trim() || "",
      remoteOnly: remoteOnly ? "true" : "false",
      employmentType: employmentType || "",
      datePosted: datePosted || "",
      experience: experience || "",
      page: "1",
    };

    try {
      const params = new URLSearchParams(searchParams);
      const response = await axios.get(
        `/api/jobs/external-jobs?${params.toString()}`
      );
      const newJobs = response.data.data || [];
      //filter out duplicates
      const uniqueJobs = newJobs.filter(
        (job, index, self) =>
          index === self.findIndex((t) => t.job_id === job.job_id)
      );
      setJobs(uniqueJobs);
      localStorage.setItem("jobs_results", JSON.stringify(uniqueJobs));

      if (uniqueJobs.length === 0) {
        setError("No jobs found for your criteria.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch jobs.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submit, trigger fetch if search params changed
  const handleSearch = (e) => {
    e.preventDefault();
    const currentSearchKey = getSearchKey();

    if (lastSearchRef.current !== currentSearchKey) {
      lastSearchRef.current = currentSearchKey;
      fetchJobs();
    }
  };

  // Scroll handler (no change)
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigate to job info page
  const handleJobClick = (jobId) => {
    navigate(`/jobinfo/${jobId}`);
  };

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

        <select
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          className="filter-select"
        >
          <option value="">Any Experience</option>
          <option value="0">Entry Level</option>
          <option value="1">1+ years</option>
          <option value="3">3+ years</option>
          <option value="5">5+ years</option>
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
          jobs.map((job, index) => (
            <div
              key={`${job.job_id}-${index}`}
              className="job-card"
              onClick={() => handleJobClick(job.job_id)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleJobClick(job.job_id);
              }}
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
            </div>
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
