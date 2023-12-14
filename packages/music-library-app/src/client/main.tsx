import { FocusStyleManager } from "@blueprintjs/core";
import { createRoot } from "react-dom/client";

import { createLogWriter } from "@roarr/browser-log-writer";

import App from "./app";
// import { INSTALL_REACT_DEVELOPER_TOOLS } from "../common/constants";

localStorage.setItem("ROARR_LOG", "true");
globalThis.ROARR.write = createLogWriter();

FocusStyleManager.onlyShowFocusOnTabs();

const domNode = document.getElementById("root");
if (domNode === null) {
    throw new Error(`[client] Failed to render application: no root DOM node available.`);
}
const root = createRoot(domNode);
root.render(<App />);

// (async () => {
//     if (INSTALL_REACT_DEVELOPER_TOOLS) {
//         await import("react-devtools");
//     }
// })();
