import "./webApi"; // Initialize the web API

import { createLogWriter } from "@roarr/browser-log-writer";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./app";
import { ClientErrors } from "./common/errorMessages";

// Declare ROARR global type
declare global {
  const ROARR: {
    write: (message: string) => void;
  };
}

function main() {
  // set up client logging
  localStorage.setItem("ROARR_LOG", "true");
  if (typeof ROARR !== "undefined") {
    ROARR.write = createLogWriter();
  }

  // render the app with necessary providers
  const domNode = document.getElementById("root");
  if (domNode === null) {
    throw new Error(ClientErrors.APP_RENDER_FAILED);
  }
  const root = createRoot(domNode);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

main();
