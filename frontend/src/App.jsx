import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Login from "./pages/Login/Login";
import Signup from "./pages/Login/Signup";
import DashboardMain from "./pages/Dashboard/DashboardMain";
import NavigationMenu from "./components/Navbar/NavigationMenu";
import TopNav from "./components/Navbar/TopNav";
import ProfileMain from "./pages/Profile/ProfileMain";
import ResumeMain from "./pages/Resume/ResumeMain";
import Jobs from "./pages/Jobs/Jobs";
import JobInfoCard from "./pages/Jobs/JobInfoCard";
import UserPage from "./pages/Users/Users";
import MessagingWindow from "./pages/Messaging/MessagingWindow";
import MessagingPage from "./pages/Messaging/MessagingPage";
import "./App.css";
import Users from "./pages/Users/Users";

function AppWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const isExpired = payload.exp * 1000 < Date.now();

        if (!isExpired) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Invalid token", err);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  }, []);

  const handleSignupSuccess = () => {
    alert("Signup successful! Please log in.");
    navigate("/");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <main className="main-container">
      {isAuthenticated && <TopNav />}
      <div className="flex flex-1 overflow-hidden">
        {isAuthenticated && !["/", "/signup"].includes(location.pathname) && (
          <NavigationMenu />
        )}
        <div className="bg-blue-300 mt-5 p-4">
          <Routes>
            <Route
              path="/"
              element={<Login onLogin={() => setIsAuthenticated(true)} />}
            />
            <Route
              path="/signup"
              element={<Signup onSignupSuccess={handleSignupSuccess} />}
            />
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? (
                  <DashboardMain />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/profile"
              element={
                isAuthenticated ? <ProfileMain /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/resume"
              element={
                isAuthenticated ? <ResumeMain /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/jobs"
              element={isAuthenticated ? <Jobs /> : <Navigate to="/" replace />}
            />
            <Route
              path="/jobinfo/:jobId"
              element={
                isAuthenticated ? <JobInfoCard /> : <Navigate to="/" replace />
              }
            />
            <Route path="/users" element={<UserPage />} />
            <Route path="/messages" element={<MessagingWindow />} />
            <Route path="/messages/:otherUserId" element={<MessagingPage />} />
          </Routes>
        </div>
      </div>
    </main>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
