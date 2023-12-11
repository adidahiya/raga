import { createRoot } from "react-dom/client";

import App from "./app";
// import { INSTALL_REACT_DEVELOPER_TOOLS } from "../common/constants";

const domNode = document.getElementById("root")!;
const root = createRoot(domNode);
root.render(<App />);

// (async () => {
//     if (INSTALL_REACT_DEVELOPER_TOOLS) {
//         await import("react-devtools");
//     }
// })();
