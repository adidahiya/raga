import { BlueprintProvider, Classes, FocusStyleManager } from "@blueprintjs/core";
import { createLogWriter } from "@roarr/browser-log-writer";
import { call, main } from "effection";
// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { INSTALL_REACT_DEVELOPER_TOOLS } from "../common/constants";
import { ClientErrors } from "../common/errorMessages";
import App from "./app";

await main(function* () {
  // set up client logging
  localStorage.setItem("ROARR_LOG", "true");
  globalThis.ROARR.write = createLogWriter();

  // set up focus ring styles
  FocusStyleManager.onlyShowFocusOnTabs();

  // render the app with necessary providers
  const domNode = document.getElementById("root");
  if (domNode === null) {
    throw new Error(ClientErrors.APP_RENDER_FAILED);
  }
  const root = createRoot(domNode);
  // HACKHACK: StrictMode disabled due to Blueprint bug https://github.com/palantir/blueprint/issues/5503
  root.render(
    <BlueprintProvider hotkeysProviderDialogProps={{ className: Classes.DARK }}>
      {/* <StrictMode> */}
      <App />
      {/* </StrictMode> */}
    </BlueprintProvider>,
  );

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (INSTALL_REACT_DEVELOPER_TOOLS) {
    yield* call(import("react-devtools"));
  }
});
