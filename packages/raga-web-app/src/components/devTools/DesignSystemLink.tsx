import React from "react";

const KITCHEN_SINK_PATH = "/__kitchen-sink";

export default function DesignSystemLink() {
  return (
    <a
      href={KITCHEN_SINK_PATH}
      title="Open Design System kitchen sink"
      style={{
        position: "fixed",
        bottom: 56,
        right: 16,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 10px",
        borderRadius: 999,
        background: "rgba(20,20,28,0.85)",
        border: "1px solid rgba(138,92,246,0.4)",
        color: "#c4b5fd",
        fontFamily: "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace",
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.08em",
        textDecoration: "none",
        backdropFilter: "blur(8px)",
        boxShadow: "0 0 12px rgba(138,92,246,0.25)",
        cursor: "pointer",
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: 11 }}>✦</span>
      DS
    </a>
  );
}
