import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

import appRootDir from "app-root-dir";
import ffmpeg from "fluent-ffmpeg";

import { log } from "./serverLogger";

const ffmpegPath = resolve(join(appRootDir.get(), "bin", "ffmpeg"));
export const isFfmpegAvailable = existsSync(ffmpegPath);

if (isFfmpegAvailable) {
  log.debug(`Using ffmpeg from ${ffmpegPath}`);
  ffmpeg.setFfmpegPath(ffmpegPath);
} else {
  log.error("ffmpeg is not available");
}

export default ffmpeg;
