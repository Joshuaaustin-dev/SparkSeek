import { useState, useEffect } from "react";
import axios from "axios";
import PieChart from "./PieChart";
import JobBoard from "./JobBoard";
import "./DashboardMain.css";

const DashboardMain = () => {
  // Define a mapping for normalized IDs to display names
  const stageMapping = {
    viewed: "Viewed",
    "application-submitted": "Application Submitted",
    "waiting-response": "Waiting Response",
    interview: "Interview",
    offer: "Offer",
  };

  // Simulated data for job applications
  const [columns, setColumns] = useState({
    viewed: [],
    "application-submitted": [],
    "waiting-response": [],
    interview: [],
    offer: [],
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
          viewed: [],
          "application-submitted": [],
          "waiting-response": [],
          interview: [],
          offer: [],
        };
        res.data.forEach((job) => {
          // Map API status to normalized ID
          const apiStatus = job.status || "Viewed";
          const normalizedStatus =
            Object.keys(stageMapping).find(
              (key) => stageMapping[key] === apiStatus
            ) || "viewed"; // Fallback to 'viewed' if status not found
          if (jobsByStatus[normalizedStatus]) {
            jobsByStatus[normalizedStatus].push({
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
    stage: stageMapping[stage], // Use display name for pie chart
    count: jobs.length,
  }));

  // Drag and drop handler
  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const startColumn = columns[source.droppableId];
    const finishColumn = columns[destination.droppableId];

    if (source.droppableId === destination.droppableId) {
      const newJobs = Array.from(startColumn);
      const [movedJob] = newJobs.splice(source.index, 1);
      newJobs.splice(destination.index, 0, movedJob);
      setColumns({
        ...columns,
        [source.droppableId]: newJobs,
      });
    } else {
      const startJobs = Array.from(startColumn);
      const [movedJob] = startJobs.splice(source.index, 1);
      const finishJobs = Array.from(finishColumn);
      finishJobs.splice(destination.index, 0, movedJob);
      setColumns({
        ...columns,
        [source.droppableId]: startJobs,
        [destination.droppableId]: finishJobs,
      });

      // Update job status on backend
      try {
        axios.patch(
          `/api/jobs/${draggableId}`,
          { status: stageMapping[destination.droppableId] }, // Send display name to backend
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } catch (err) {
        console.error("Error updating job status:", err);
      }
    }
  };

  const filteredPieData = pieData.filter((entry) => entry.count > 0);
  const lastParsedDate = new Date("2025-07-15T14:30:00");

  // Daily quote and video
  const [dailyQuote, setDailyQuote] = useState("Loading...");
  const [dailyVideoUrl, setDailyVideoUrl] = useState(
    "https://www.youtube.com/embed/ZXsQAXx_ao0"
  );

  useEffect(() => {
    const fetchDailyQuote = async () => {
      try {
        const res = await axios.get("https://zenquotes.io/api/today");
        const quote = res.data[0];
        setDailyQuote(`"${quote.q}" – ${quote.a}`);
      } catch (error) {
        console.error("Error fetching daily quote:", error);
        setDailyQuote("Stay positive and keep pushing forward!");
      }
    };

    const selectDailyVideo = () => {
      const videos = [
        "https://www.youtube.com/embed/ZXsQAXx_ao0",
        "https://www.youtube.com/embed/wnHW6o8WMas",
        "https://www.youtube.com/embed/_lfxYhtf8o4",
        "https://www.youtube.com/embed/mgmVOuLgFB0",
      ];
      const todayIndex = new Date().getDate() + new Date().getMonth() * 31;
      setDailyVideoUrl(videos[todayIndex % videos.length]);
    };

    fetchDailyQuote();
    selectDailyVideo();
  }, []);

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
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </section>
      </div>
      <JobBoard
        columns={columns}
        stageMapping={stageMapping}
        onDragEnd={onDragEnd}
      />
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
