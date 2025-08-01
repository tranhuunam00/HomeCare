import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { GlobalAuthProvider } from "./contexts/AuthContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <GoogleOAuthProvider
    clientId={
      "506643667310-r9u7425ui324en7kh17sskspj5e55kte.apps.googleusercontent.com"
    }
  >
    <GlobalAuthProvider>
      <App />
    </GlobalAuthProvider>
  </GoogleOAuthProvider>

  // </React.StrictMode>
);
