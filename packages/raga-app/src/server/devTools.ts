import installExtension, { REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";
import { serializeError } from "serialize-error";

import { log } from "./serverLogger";

export async function installReactDevTools() {
  try {
    await installExtension(REACT_DEVELOPER_TOOLS, {
      loadExtensionOptions: {
        allowFileAccess: true,
      },
    });
  } catch (e) {
    log.error(
      `[main] failed to install React DevTools: ${JSON.stringify(serializeError(e as Error))}`,
    );
    return;
  }

  console.debug(`[main] installed React DevTools extension`);
}
