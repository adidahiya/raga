import installExtension, { REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";
import { tryit } from "radash";
import { serializeError } from "serialize-error";

import { log } from "./serverLogger";

export async function installReactDevTools() {
  const [err] = await tryit(installExtension)(REACT_DEVELOPER_TOOLS, {
    loadExtensionOptions: {
      allowFileAccess: true,
    },
  });

  if (err) {
    log.error(`[main] failed to install React DevTools: ${JSON.stringify(serializeError(err))}`);
    return;
  }

  console.debug(`[main] installed React DevTools extension`);
}
