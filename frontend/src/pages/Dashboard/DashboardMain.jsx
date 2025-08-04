import { useState, useEffect } from "react";
import axios from "axios";
import PieChart from "./PieChart";
import JobBoard from "./JobBoard";
import "./DashboardMain.css";

const DashboardMain = () => {
  // Simulated data for job applications
  const [columns, setColumns] = useState({
    Viewed: [],
    "Application Submitted": [],
    "Waiting Response": [],
    Interview: [],
    Offer: [],
  });

  // Fetch tracked jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get("/api/jobs/my-jobs", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const jobsByStatus = {
          Viewed: [],
          "Application Submitted": [],
          "Waiting Response": [],
          Interview: [],
          Offer: [],
        };

        res.data.forEach((job) => {
          const stage = job.status || "Viewed";
          if (jobsByStatus[stage]) {
            jobsByStatus[stage].push({
              id: job._id,
              position: job.title,
              company: job.company,
            });
          }
        });

        setColumns(jobsByStatus);
      } catch (err) {
        console.error("Error loading jobs:", err);
      }
    };

    fetchJobs();
  }, []);

  // Pie chart data
  const pieData = Object.entries(columns).map(([stage, jobs]) => ({
    stage,
    count: jobs.length,
  }));
  const filteredPieData = pieData.filter((entry) => entry.count > 0);

  const lastParsedDate = new Date("2025-07-15T14:30:00");
  const dailyQuote =
    "“Success usually comes to those who are too busy to be looking for it.” – Henry David Thoreau";
  const dailyVideoUrl = "https://www.youtube.com/embed/ZXsQAXx_ao0";

  return (
    <div className="dashboard-container">
      <div className="dashboard-top-row">
        <div className="dashboard-card">
          <h3>Application Status</h3>
          <PieChart data={filteredPieData} />
        </div>

        <section className="dashboard-card">
          <h3>Daily Inspiration</h3>
          <blockquote className="dashboard-quote">{dailyQuote}</blockquote>
          <div className="dashboard-video-wrapper">
            <iframe
              src={dailyVideoUrl}
              title="Daily Inspirational Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      </div>

      <JobBoard columns={columns} />

      <section className="resume-section">
        <h3>Last Resume Parsed</h3>
        <p>
          {lastParsedDate
            ? lastParsedDate.toLocaleString()
            : "You haven't parsed a resume yet."}
        </p>
      </section>
    </div>
  );
};

export default DashboardMain;
