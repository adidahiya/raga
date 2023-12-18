import { initAppServer } from "./server/appServer";
import { log } from "./server/serverLogger";

log.debug("[server] loaded utility process, starting app server...");

initAppServer();
