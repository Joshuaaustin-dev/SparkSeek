import { useState, useEffect } from "react";
import axios from "axios";
import PieChart from "./PieChart";
import JobBoard from "./JobBoard";
import JobForm from "./JobForm";
import YouTube from "react-youtube";
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
              title: job.title,
              company: job.company,
              location: job.location,
              description: job.description,
              applyUrl: job.applyUrl,
              salary_min: job.salary_min,
              salary_max: job.salary_max,
              status: job.status,
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
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return; //handled dropped outside of droppable area

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
      //update status locally
      const updatedMovedJob = { ...movedJob, status: destination.droppableId };
      const finishJobs = Array.from(finishColumn);
      finishJobs.splice(destination.index, 0, updatedMovedJob);
      setColumns({
        ...columns,
        [source.droppableId]: startJobs,
        [destination.droppableId]: finishJobs,
      });

      // Update job status on backend
      try {
        axios.put(
          `/api/jobs/update-status/${draggableId}`,
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

  // Daily quote and video states
  const [dailyQuote, setDailyQuote] = useState("");
  const [dailyVideoId, setDailyVideoId] = useState("");
  const [isLoadingQuote, setIsLoadingQuote] = useState(true);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);

  const fallbackQuotes = [
    {
      q: "Success is not final, failure is not fatal.",
      a: "Winston Churchill",
    },
    {
      q: "The only way to do great work is to love what you do.",
      a: "Steve Jobs",
    },
  ];

  const API_BASE_URL = "http://localhost:5000";

  // Fetch daily quote with caching
  // Fetch daily quote with caching
  useEffect(() => {
    const getDailyQuote = async () => {
      const today = new Date().toDateString();
      const cachedQuote = localStorage.getItem("dailyQuote");
      const cachedDate = localStorage.getItem("quoteDate");

      if (cachedQuote && cachedDate === today) {
        setDailyQuote(cachedQuote);
        setIsLoadingQuote(false);
        return;
      }

      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/inspiration/daily-quote`
        );
        console.log("Quote API response:", res.data); // Debug log
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const quote = `"${res.data[0].q}" – ${res.data[0].a}`;
          setDailyQuote(quote);
          localStorage.setItem("dailyQuote", quote);
          localStorage.setItem("quoteDate", today);
        } else {
          throw new Error("Invalid quote response");
        }
      } catch (error) {
        console.error("Error fetching daily quote:", error);
        const fallbackQuote = `"${fallbackQuotes[0].q}" – ${fallbackQuotes[0].a}`;
        setDailyQuote(fallbackQuote);
        localStorage.setItem("dailyQuote", fallbackQuote);
        localStorage.setItem("quoteDate", today);
      }
      setIsLoadingQuote(false);
    };
    getDailyQuote();
  }, []);

  // Fetch daily video ID
  useEffect(() => {
    const getDailyVideo = async () => {
      const today = new Date().toDateString();
      const cachedVideoId = localStorage.getItem("dailyVideoId");
      const cachedDate = localStorage.getItem("videoDate");

      if (cachedVideoId && cachedDate === today) {
        setDailyVideoId(cachedVideoId);
        setIsLoadingVideo(false);
        return;
      }

      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/inspiration/video-of-the-day`
        );
        console.log("Video API response:", res.data); // Debug log
        const videoId = res.data.videoId.includes("/embed/")
          ? res.data.videoId.split("/embed/")[1]
          : res.data.videoId;
        setDailyVideoId(videoId);
        localStorage.setItem("dailyVideoId", videoId);
        localStorage.setItem("videoDate", today);
        setIsLoadingVideo(false);
      } catch (error) {
        console.error("Failed to load daily video:", error);
        const fallbackVideoId = "TfC-V6PyYQM";
        setDailyVideoId(fallbackVideoId);
        localStorage.setItem("dailyVideoId", fallbackVideoId);
        localStorage.setItem("videoDate", today);
        setIsLoadingVideo(false);
      }
    };
    getDailyVideo();
  }, []);

  const [showJobModal, setShowJobModal] = useState(false);

  const handleCustomJobSubmit = () => {
    window.location.reload();
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-top-row">
        <div className="dashboard-card">
          <h3>Application Status</h3>
          <PieChart data={filteredPieData} />
        </div>
        <section className="dashboard-card">
          <h3>Daily Inspiration</h3>
          <blockquote className="dashboard-quote">
            {isLoadingQuote ? "Loading quote..." : dailyQuote}
          </blockquote>{" "}
          <div className="dashboard-video-wrapper">
            {isLoadingVideo ? (
              <p>Loading video...</p>
            ) : dailyVideoId ? (
              <YouTube
                videoId={dailyVideoId}
                opts={{
                  width: "100%",
                  height: "200",
                  playerVars: { autoplay: 0 },
                }}
                onError={() => {
                  console.error("Error loading YouTube video");
                  setDailyVideoId("TfC-V6PyYQM");
                }}
              />
            ) : (
              <p>Video not available today.</p>
            )}
          </div>
        </section>
      </div>
      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          onClick={() => setShowJobModal(true)}
        >
          + Add Job
        </button>
      </div>
      <JobForm
        open={showJobModal}
        onClose={() => setShowJobModal(false)}
        onSuccess={handleCustomJobSubmit}
      />
      <JobBoard
        columns={columns}
        stageMapping={stageMapping}
        onDragEnd={onDragEnd}
      />
    </div>
  );
};

export default DashboardMain;
