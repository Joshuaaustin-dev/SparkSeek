import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

// Reusable Card wrapper with consistent styling and margin
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-md p-8 mb-6 mt-12 ${className}`}>
    {children}
  </div>
);

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ""
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/users/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (!user)
    return (
      <p className="text-center mt-12 text-gray-700">Loading Dashboard...</p>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-[96px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success message */}
        {successMessage && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded-md mb-6 transition-opacity duration-500 break-words"
            role="alert"
          >
            {successMessage}
          </div>
        )}

        {/* Welcome Header Card */}
        <Card className="mt-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mt-16 break-words">
            Welcome Back, {user.name || "User"}
          </h1>
          <p className="text-lg text-gray-600 font-medium break-words">
            {user.role === "recruiter"
              ? "Recruiter Dashboard"
              : "Job Seeker Dashboard"}
          </p>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Application Overview Card */}
            <Card>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 break-words">
                Application Overview
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {[
                  {
                    label: "Total Applications",
                    value: 12,
                    bg: "bg-blue-50",
                    text: "text-blue-700",
                  },
                  {
                    label: "Interviews",
                    value: 2,
                    bg: "bg-green-50",
                    text: "text-green-700",
                  },
                  {
                    label: "Rejected",
                    value: 4,
                    bg: "bg-red-50",
                    text: "text-red-700",
                  },
                  {
                    label: "Pending",
                    value: 6,
                    bg: "bg-yellow-50",
                    text: "text-yellow-700",
                  },
                  {
                    label: "Offers",
                    value: 0,
                    bg: "bg-purple-50",
                    text: "text-purple-700",
                  },
                ].map(({ label, value, bg, text }) => (
                  <div
                    key={label}
                    className={`text-center p-6 ${bg} rounded-lg shadow-sm break-words`}
                  >
                    <div className={`text-3xl font-bold ${text} mb-1`}>
                      {value}
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Job Search Progress Card */}
            <Card>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 break-words">
                Job Search Progress
              </h2>
              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 font-medium break-words">
                    Weekly Goal Progress
                  </span>
                  <span className="text-sm font-semibold text-gray-900 break-words">
                    3 of 5
                  </span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-gray-700 break-words">
                Great progress! You've completed 3 applications this week. Keep
                going to reach your goal of 5!
              </p>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Quick Stats Card */}
            <Card>
              <h3 className="text-xl font-semibold text-gray-800 mb-6 break-words">
                Quick Stats
              </h3>
              <div className="space-y-5">
                {[
                  {
                    label: "Applications Sent",
                    value: 24,
                    bg: "bg-indigo-50",
                    text: "text-indigo-700",
                  },
                  {
                    label: "Interviews Scheduled",
                    value: 3,
                    bg: "bg-green-50",
                    text: "text-green-700",
                  },
                  {
                    label: "Profile Complete",
                    value: "85%",
                    bg: "bg-blue-50",
                    text: "text-blue-700",
                  },
                ].map(({ label, value, bg, text }) => (
                  <div
                    key={label}
                    className={`text-center p-5 ${bg} rounded-lg cursor-default shadow-sm break-words`}
                  >
                    <div className={`text-3xl font-bold ${text} mb-1`}>
                      {value}
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recommended Jobs Card */}
            <Card>
              <h3 className="text-xl font-semibold text-gray-800 mb-6 break-words">
                Recommended Jobs
              </h3>
              <div className="space-y-4">
                {[
                  { title: "UI/UX Developer", company: "Design Studio" },
                  { title: "JavaScript Developer", company: "WebSolutions" },
                  { title: "Frontend Engineer", company: "DataFlow Inc" },
                ].map(({ title, company }) => (
                  <div
                    key={title}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors break-words"
                  >
                    <h4 className="font-semibold text-gray-900 text-base break-words">
                      {title}
                    </h4>
                    <p className="text-xs text-gray-600 break-words">
                      {company}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Next Steps Card */}
            <Card>
              <h3 className="text-xl font-semibold text-gray-800 mb-6 break-words">
                Next Steps
              </h3>
              <div className="space-y-4">
                {[
                  "Update your resume to highlight recent projects.",
                  "Apply to 3 new job postings this week.",
                  "Schedule mock interview with career coach.",
                ].map((text, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 break-words">{text}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
