// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "@/app/App"; // 👈 MODIFICATION ICI

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // On retire le StrictMode pour éviter les doubles exécutions pendant le développement
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
