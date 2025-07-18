import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Login from "./components/Login/Login";
import Signup from "./components/Login/Signup";
import DashboardMain from "./components/Dashboard/DashboardMain";
import NavigationMenu from "./components/Navbar/NavigationMenu";
import TopNav from "./components/Navbar/TopNav";
import ProfileMain from "./components/Profile/ProfileMain";
import ResumeMain from "./components/Resume/ResumeMain";
import Jobs from "./components/Jobs/Jobs";
import "./App.css";

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

  if (loading) return <div>Loading...</div>; // 🔒 Wait before rendering routes

  return (
    <>
      {isAuthenticated && <TopNav />}
      {isAuthenticated && !["/", "/signup"].includes(location.pathname) && (
        <NavigationMenu />
      )}
      <div className="main-content">
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
              isAuthenticated ? <DashboardMain /> : <Navigate to="/" replace />
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
        </Routes>
      </div>
    </>
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
