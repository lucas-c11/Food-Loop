import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./AuthContext";
import "./styles/global.css";
import "./styles/app.css";
createRoot(document.getElementById("root")).render(<React.StrictMode><AuthProvider><App /></AuthProvider></React.StrictMode>);
