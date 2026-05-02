/* eslint-disable simple-import-sort/imports */
import { scan } from "react-scan"; // import this BEFORE react
import "react";

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // Skip React Scan on the kitchen sink page — its component-name overlay
  // labels make the design-system reference page unreadable.
  const isKitchenSink = window.location.pathname.startsWith("/__kitchen-sink");
  scan({
    enabled: !isKitchenSink,
    // log: true, // logs render info to console (default: false)
  });
}
/* eslint-enable simple-import-sort/imports */
