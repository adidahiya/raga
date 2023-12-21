import installExtension, { REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";
import { serializeError } from "serialize-error";

export async function installReactDevTools() {
  try {
    await installExtension(REACT_DEVELOPER_TOOLS, {
      loadExtensionOptions: {
        allowFileAccess: true,
      },
    });
    console.debug(`[main] installed React DevTools extension`);
  } catch (e) {
    console.error(
      `[main] error installing React DevTools extension ${JSON.stringify(serializeError(e))}`,
    );
  }
}
