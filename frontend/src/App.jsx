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
import Dashboard from "./components/Dashboard/Dashboard";
import NavigationMenu from "./components/Navbar/NavigationMenu";
import TopNav from "./components/Navbar/TopNav";
import Profile from "./components/Profile/Profile";
import Resume from "./components/Resume/Resume";
import Jobs from "./components/Jobs/Jobs";
import "./App.css";

function AppWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleSignupSuccess = () => {
    alert("Signup successful! Please log in.");
    navigate("/");
  };

  return (
    <>
      {isAuthenticated && <TopNav />}
      {isAuthenticated && !["/", "/signup"].includes(location.pathname) && (
        <NavigationMenu />
      )}
      <div>
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
              isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/profile"
            element={
              isAuthenticated ? <Profile /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/resume"
            element={isAuthenticated ? <Resume /> : <Navigate to="/" replace />}
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
