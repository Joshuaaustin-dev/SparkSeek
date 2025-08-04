import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Jobs.css";

const US_STATES = [
  "",
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

const SALARY_OPTIONS = [
  { label: "Any Salary", value: "" },
  { label: "Up to $30,000", value: "0-30000" },
  { label: "$30,000 - $50,000", value: "30000-50000" },
  { label: "$50,000 - $70,000", value: "50000-70000" },
  { label: "$70,000 - $100,000", value: "70000-100000" },
  { label: "Over $100,000", value: "100000-" },
];

const DATE_POSTED_OPTIONS = [
  { label: "Any Date", value: "" },
  { label: "Last 24 hours", value: "today" },
  { label: "Last 3 days", value: "3days" },
  { label: "Last 7 days", value: "week" },
  { label: "Last 30 days", value: "month" },
];

const JobCardSkeleton = () => (
  <div className="job-card skeleton">
    <div className="skeleton-title shimmer" />
    <div className="skeleton-company shimmer" />
    <div className="skeleton-logo shimmer" />
    <div className="skeleton-location shimmer" />
  </div>
);

function Jobs() {
  const [query, setQuery] = useState(
    () => localStorage.getItem("jobs_query") || ""
  );
  const [location, setLocation] = useState(
    () => localStorage.getItem("jobs_location") || ""
  );
  const [salaryRange, setSalaryRange] = useState(
    () => localStorage.getItem("jobs_salaryRange") || ""
  );
  const [datePosted, setDatePosted] = useState(
    () => localStorage.getItem("jobs_datePosted") || ""
  );

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Save filters to localStorage on change
  useEffect(() => {
    localStorage.setItem("jobs_query", query);
    localStorage.setItem("jobs_location", location);
    localStorage.setItem("jobs_salaryRange", salaryRange);
    localStorage.setItem("jobs_datePosted", datePosted);
  }, [query, location, salaryRange, datePosted]);

  useEffect(() => {
    const savedJobs = localStorage.getItem("job_results");
    if (savedJobs) {
      setJobs(JSON.parse(savedJobs));
    } else {
      fetchJobs();
    }
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    setJobs([]);

    // Parse salary range for backend params
    let salaryMin = "";
    let salaryMax = "";
    if (salaryRange) {
      const [min, max] = salaryRange.split("-");
      salaryMin = min;
      salaryMax = max;
    }

    try {
      const response = await axios.get("/api/jobs/external-jobs", {
        params: {
          query: query.trim(),
          location: location.trim(),
          salaryMin,
          salaryMax,
          datePosted,
        },
      });

      console.log("Fetched jobs:", response.data.data);

      setJobs(response.data.data || []);

      //store jobs in localStorage for later use
      localStorage.setItem("job_results", JSON.stringify(response.data.data));

      if (!response.data.data?.length) {
        setError("No jobs found.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch jobs.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

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

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="filter-select"
        >
          <option value="">Any State</option>
          {US_STATES.slice(1).map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>

        <select
          value={salaryRange}
          onChange={(e) => setSalaryRange(e.target.value)}
          className="filter-select"
        >
          {SALARY_OPTIONS.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={datePosted}
          onChange={(e) => setDatePosted(e.target.value)}
          className="filter-select"
        >
          {DATE_POSTED_OPTIONS.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

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
              key={job.id}
              className="job-card"
              onClick={() => handleJobClick(job.id)}
              role="button"
              tabIndex={0}
            >
              <div className="job-header">
                <h3 className="job-title">{job.title}</h3>
                {job.company?.display_name && (
                  <div className="job-company">{job.company.display_name}</div>
                )}
              </div>
              <div className="job-location">{job.location.display_name}</div>
              <div className="job-type">{job.contract_time}</div>
              <div className="job-salary">
                {job.salary_min && job.salary_max
                  ? `$${Math.round(
                      job.salary_min
                    ).toLocaleString()} - $${Math.round(
                      job.salary_max
                    ).toLocaleString()}`
                  : job.salary_min
                  ? `$${Math.round(job.salary_min).toLocaleString()}`
                  : ""}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Jobs;
