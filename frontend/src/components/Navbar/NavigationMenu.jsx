import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaFileAlt,
  FaUser,
  FaSignOutAlt,
  FaCommentDots,
  FaUsers,
  FaMoon,
  FaSun,
  FaBriefcase,
} from "react-icons/fa";
import useDarkMode from "./useDarkMode";
import "./NavigationMenu.css";

const NavigationMenu = () => {
  const navigate = useNavigate();
  const { theme, toggle } = useDarkMode();

  const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    //remove job search filters
    localStorage.removeItem("jobs_query");
    localStorage.removeItem("jobs_location");
    localStorage.removeItem("jobs_remoteOnly");
    localStorage.removeItem("jobs_employmentType");
    localStorage.removeItem("jobs_datePosted");
    localStorage.removeItem("jobs_experience");
    localStorage.removeItem("jobs_results");

    navigate("/");
  };

  return (
    <div className="sidebar">
      <ul className="nav-links">
        <li>
          <NavLink to="/dashboard">
            <FaTachometerAlt />
            <span>{role === "recruiter" ? "Recruiter Home" : "Dashboard"}</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile">
            <FaUser />
            <span>Profile</span>
          </NavLink>
        </li>
        {role !== "recruiter" && (
          <li>
            <NavLink to="/resume">
              <FaFileAlt />
              <span>Resume</span>
            </NavLink>
          </li>
        )}
        <li>
          <NavLink to="/jobs">
            <FaBriefcase />
            <span>{role === "recruiter" ? "Find Talent" : "Jobs"}</span>
          </NavLink>
        </li>
        <li>
          <button onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Log Out</span>
          </button>
        </li>
      </ul>
      <div className="sidebar-tools">
        <NavLink to="/users">
          <FaUsers className="tool-icon" title="Users" />
        </NavLink>
        <NavLink to="/conversations">
          <FaCommentDots className="tool-icon" title="Conversations" />
        </NavLink>{" "}
        {/* moon/sun icon switches with theme */}
        {theme === "light" ? (
          <FaMoon
            className="tool-icon"
            title="Switch to dark mode"
            onClick={toggle}
          />
        ) : (
          <FaSun
            className="tool-icon"
            title="Switch back to light mode"
            onClick={toggle}
          />
        )}
      </div>
    </div>
  );
};

export default NavigationMenu;
