import { installExtension, REACT_DEVELOPER_TOOLS } from "electron-extension-installer";
import { serializeError } from "serialize-error";

import { log } from "./common/serverLogger";

// N.B. we are using a non-standard version of the devtools installer because React devtools is not
// compatible with Electron due to https://github.com/facebook/react/issues/25843.
// This version of the installer ("electron-extension-installer") downloads an older version of React devtools.
export async function installReactDevTools() {
  try {
    await installExtension([REACT_DEVELOPER_TOOLS], {
      loadExtensionOptions: {
        allowFileAccess: true,
      },
    });
    log.debug(`[main] installed React DevTools extension`);
  } catch (e) {
    log.error(
      `[main] failed to install React DevTools: ${JSON.stringify(serializeError(e as Error))}`,
    );
    return;
  }
}
