import { Link, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaFileAlt,
  FaUser,
  FaSignOutAlt,
  FaEnvelope,
  FaBell,
  FaMoon,
  FaBriefcase,
} from "react-icons/fa";
import "./NavigationMenu.css";

const NavigationMenu = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="sidebar">
      <ul className="nav-links">
        <li>
          <Link to="/dashboard">
            <FaTachometerAlt /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/resume">
            <FaFileAlt /> Resume
          </Link>
        </li>
        <li>
          <Link to="/jobs">
            <FaBriefcase /> Jobs
          </Link>
        </li>
        <li>
          <Link to="/profile">
            <FaUser /> Profile
          </Link>
        </li>
        <li>
          <button onClick={handleLogout}>
            <FaSignOutAlt /> Log Out
          </button>
        </li>
      </ul>
      <div className="sidebar-tools">
        <FaEnvelope className="tool-icon" title="Messages" />
        <FaBell className="tool-icon" title="Notifications" />
        <FaMoon
          className="tool-icon"
          title="Toggle Dark Mode"
          onClick={() => console.log("Toggle dark mode")}
        />
      </div>
    </div>
  );
};

export default NavigationMenu;
