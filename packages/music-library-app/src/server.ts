import { DEBUG } from "./common/constants";
import { initAppServer } from "./server/appServer";

if (DEBUG) {
    console.log("[server] loaded utility process");
}

initAppServer();
