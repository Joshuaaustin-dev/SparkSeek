import "./NavigationMenu";
import logo from "../../assets/LogoNoTitle.PNG";
import { FaEnvelope, FaBell, FaMoon } from "react-icons/fa";

const TopNav = () => {
  return (
    <div className="top-nav">
      <img src={logo} alt="SparkSeek Logo" className="logo" />
      <h1 className="app-title">Ignite Opportunities, Illuminate Careers</h1>
    </div>
  );
};

export default TopNav;
