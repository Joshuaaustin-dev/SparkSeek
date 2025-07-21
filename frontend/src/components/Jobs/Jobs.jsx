import { useEffect, useState, useRef, useCallback } from "react";
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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [employmentType, setEmploymentType] = useState("");
  const [datePosted, setDatePosted] = useState("");

  const [showScrollTop, setShowScrollTop] = useState(false);
  const observer = useRef();

  const lastJobRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setPage((prevPage) => prevPage + 1);
          }
        },
        {
          rootMargin: "500px",
        }
      );
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    const fetchJobs = async () => {
      const searchTerm = query.trim() || "developer"; // fallback default

      setLoading(true);
      setError("");

      try {
        const options = {
          method: "GET",
          url: "https://jsearch.p.rapidapi.com/search",
          params: {
            query: searchTerm,
            location: location.trim() || undefined,
            remote_jobs_only: remoteOnly ? "true" : undefined,
            employment_types: employmentType || undefined,
            date_posted: datePosted || undefined,
            num_pages: "1",
            page: page.toString(),
          },
          headers: {
            "X-RapidAPI-Key":
              "88a344f5bemsh8bce1c34516bb7cp112a99jsn9989661c2147",
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
          },
        };

        const response = await axios.request(options);
        const newJobs = response.data.data || [];

        setJobs((prevJobs) => [...prevJobs, ...newJobs]);
        setHasMore(newJobs.length > 0);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [page, query, location, remoteOnly, employmentType, datePosted]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setJobs([]);
    setPage(1);
    setHasMore(true);
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

        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
          />
          Remote Only
        </label>

        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {error && (
        <div className="jobs-error">
          <p>{error}</p>
          <button onClick={() => setPage((p) => p)}>Retry</button>
        </div>
      )}

      <div className="jobs-grid">
        {jobs.map((job, index) => {
          const JobCardContent = (
            <>
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
            </>
          );

          return (
            <a
              key={job.job_id}
              href={job.job_apply_link}
              target="_blank"
              rel="noreferrer"
              className="job-card"
              ref={jobs.length === index + 1 ? lastJobRef : null}
            >
              {JobCardContent}
            </a>
          );
        })}

        {loading &&
          Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
      </div>

      {!loading && !hasMore && (
        <p className="jobs-end-message">
          🎉 You've reached the end of job listings.
        </p>
      )}

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
