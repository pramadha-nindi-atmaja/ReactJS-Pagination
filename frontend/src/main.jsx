import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "bulma/css/bulma.css";
import axios from "axios";

/**
 * Axios Global Configuration
 */
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.timeout = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

// Ensure POST content-type is correct for JSON APIs
axios.defaults.headers.post["Content-Type"] = "application/json";

/**
 * Render Application
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
