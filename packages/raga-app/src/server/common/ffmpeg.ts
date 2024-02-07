import { existsSync } from "node:fs";
import { join } from "node:path";

import ffmpeg from "fluent-ffmpeg";

import { appPath } from "./appPath";
import { log } from "./serverLogger";

const ffmpegPath = join(appPath, "bin", "ffmpeg-darwin-arm64");
export const isFfmpegAvailable = existsSync(ffmpegPath);

if (isFfmpegAvailable) {
  log.debug(`Using ffmpeg from ${ffmpegPath}`);
  ffmpeg.setFfmpegPath(ffmpegPath);
} else {
  log.error("ffmpeg is not available");
}

export default ffmpeg;
