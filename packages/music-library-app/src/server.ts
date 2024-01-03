import { ServerEventChannel } from "./common/events";
import { initAppServer } from "./server/appServer";
import { log } from "./server/serverLogger";

// HACKHACK: we can't use top-level await until we migrate to ESM, which is currently blocked by
// electron-vite support. Also, effection's main() function isn't running correctly for some reason,
// even with the standard Promise callback APIs...

log.debug("loaded utility process, starting app server...");
initAppServer();
process.parentPort.postMessage({ channel: ServerEventChannel.APP_SERVER_READY });
