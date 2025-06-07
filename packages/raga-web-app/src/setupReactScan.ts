/* eslint-disable simple-import-sort/imports */
import { scan } from "react-scan"; // import this BEFORE react
import "react";

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  scan({
    enabled: true,
    // log: true, // logs render info to console (default: false)
  });
}
/* eslint-enable simple-import-sort/imports */
