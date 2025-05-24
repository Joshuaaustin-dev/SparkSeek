import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [message, setMessage] = useState(0);

  useEffect(() => {
    fetch("/api/")
      .then((res) => res.text())
      .then((data) => setMessage(data));
  }, []);

  return <div>{message || "Loading..."}</div>;
}

export default App;
