import "./NavigationMenu";
import logo from "../../assets/logoNoTitle.png";
import { FaEnvelope, FaBell, FaMoon } from "react-icons/fa";

const TopNav = () => {
  return (
    <div className="top-nav">
      <img src={logo} alt="SparkSeek Logo" className="logo" />
      <h1 className="app-title">Ignite Your Spark!</h1>
    </div>
  );
};

export default TopNav;
