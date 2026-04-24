import "./styles/global.css";

import React from "react";
import { createRoot } from "react-dom/client";

import { KitchenSink } from "./pages/KitchenSink";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root container #root not found");
}

createRoot(container).render(
  <React.StrictMode>
    <KitchenSink />
  </React.StrictMode>,
);
