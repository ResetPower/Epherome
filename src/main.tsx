import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import { initMetadata } from "./stores";

initMetadata()
  .then(() => import("./App")) // initialize app component after initializing metadata
  .then((App) =>
    ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
      <React.StrictMode>
        <App.default />
      </React.StrictMode>
    )
  )
  .catch(() => console.error("Failed to init app metadata!"));
