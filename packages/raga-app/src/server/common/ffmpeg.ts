import { existsSync } from "node:fs";
import { join } from "node:path";

import ffmpeg from "fluent-ffmpeg";

import { appPath } from "./appPath";
import { log } from "./serverLogger";

const ffmpegPath = join(appPath, "bin", "ffmpeg-darwin-arm64");
export const isFfmpegAvailable = existsSync(ffmpegPath);

log.debug(`Attempting to use ffmpeg from path '${ffmpegPath}' ...`);

if (isFfmpegAvailable) {
  log.debug(`Found ffmpeg ✅`);
  ffmpeg.setFfmpegPath(ffmpegPath);
} else {
  log.error(`ffmpeg is not available ❌`);
}

export default ffmpeg;
