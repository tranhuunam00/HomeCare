import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { GlobalAuthProvider } from "./contexts/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GlobalAuthProvider>
      <App />
    </GlobalAuthProvider>
  </React.StrictMode>
);
