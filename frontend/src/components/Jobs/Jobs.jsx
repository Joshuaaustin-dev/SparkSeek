import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import "./jobs.css";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
          rootMargin: "500px", // Preload next page before hitting bottom
        }
      );
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError("");

      try {
        const options = {
          method: "GET",
          url: "https://jsearch.p.rapidapi.com/search",
          params: {
            query: "software engineer",
            num_pages: "1",
            page: page.toString(), // pass current page
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
  }, [page]);

  //Scroll-to-top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="jobs-container">
      <h2 className="jobs-title">🔥 Software Engineering Jobs</h2>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      <div className="jobs-grid">
        {jobs.map((job, index) => {
          if (jobs.length === index + 1) {
            // Attach observer to the last job card
            return (
              <div key={job.job_id} ref={lastJobRef} className="job-card">
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
            );
          } else {
            return (
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
            );
          }
        })}
      </div>

      {loading && (
        <div className="jobs-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="job-card skeleton">
              <div className="skeleton-title shimmer" />
              <div className="skeleton-company shimmer" />
              <div className="skeleton-logo shimmer" />
              <div className="skeleton-location shimmer" />
            </div>
          ))}
        </div>
      )}

      {!hasMore && (
        <p style={{ textAlign: "center", color: "#888" }}>
          🎉 You've reached the end of job listings.
        </p>
      )}

      {showScrollTop && (
        <button
          className="scroll-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑
        </button>
      )}
    </div>
  );
}

export default Jobs;
