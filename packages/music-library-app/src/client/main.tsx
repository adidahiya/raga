import { Classes, FocusStyleManager, HotkeysProvider } from "@blueprintjs/core";
import { createLogWriter } from "@roarr/browser-log-writer";
import { createRoot } from "react-dom/client";

import { ClientErrors } from "../common/errorMessages";
import App from "./app";
// import { INSTALL_REACT_DEVELOPER_TOOLS } from "../common/constants";

localStorage.setItem("ROARR_LOG", "true");
globalThis.ROARR.write = createLogWriter();

FocusStyleManager.onlyShowFocusOnTabs();

const domNode = document.getElementById("root");
if (domNode === null) {
  throw new Error(ClientErrors.APP_RENDER_FAILED);
}
const root = createRoot(domNode);
root.render(
  <HotkeysProvider dialogProps={{ className: Classes.DARK }}>
    <App />
  </HotkeysProvider>,
);

// (async () => {
//     if (INSTALL_REACT_DEVELOPER_TOOLS) {
//         await import("react-devtools");
//     }
// })();
