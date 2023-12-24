import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { type Handler, type NextFunction, type Response } from "@tinyhttp/app";
import { sync as commandExistsSync } from "command-exists";
import ffmpeg from "fluent-ffmpeg";
import { json, type ReqWithBody as RequestWithBody } from "milliparsec";

import { ServerErrors } from "../../common/errorMessages";
import {
  type AudioFilesConverter,
  type AudioFilesConverterTrackDefinition,
} from "../audioFilesConverter";
import { log } from "../serverLogger";

export function getConvertToMP3RequestHandler(converter: AudioFilesConverter): Handler {
  return async (
    req: RequestWithBody<{ trackProperties: AudioFilesConverterTrackDefinition }>,
    res: Response,
    next: NextFunction,
  ) => {
    await json()(req, res, (err) => {
      if (err) {
        next(err);
        return;
      }
    });

    if (req.body === undefined) {
      res.status(400).send(ServerErrors.INVALID_CONVERSION_REQUEST);
      return;
    }

    const { trackProperties } = req.body;
    const inputFilePath = fileURLToPath(trackProperties.Location);
    log.debug(
      `Handling request for an track with file type unsupported by Web Audio: ${JSON.stringify(
        trackProperties,
      )}`,
    );

    const fileExists = existsSync(inputFilePath);
    if (!fileExists) {
      res.status(404).send(ServerErrors.AUDIO_FILE_NOT_FOUND);
      return;
    }

    const ffmpegExists = commandExistsSync("ffmpeg");
    if (!ffmpegExists) {
      // 501 means server does not support the requested functionality, see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/501
      res.status(501).send(ServerErrors.FFMPEG_NOT_INSTALLED);
      return;
    }

    const codec = await getBestAvailableMP3Codec();
    if (codec === undefined) {
      res.status(501).send(ServerErrors.MP3_CODEC_UNAVAILABLE);
      return;
    }

    try {
      const outputFilePath = await converter.convertAudioFileToMP3(trackProperties, {
        codec,
        outputDirKind: "temp",
      });
      res.status(200).send(outputFilePath);
    } catch (e) {
      const err = e as Error;
      log.error(err.message);
      res.status(500).send(err.message);
    }
  };
}

// See https://trac.ffmpeg.org/wiki/Encode/HighQualityAudio#AudioencodersFFmpegcanuse
const MP3_CODECS = ["libmp3lame", "libshine"] as const;

/**
 * Does not throw if unavailable, just returns `undefined`.
 * Caller is responsible for throwing an error in this case.
 */
async function getBestAvailableMP3Codec(): Promise<string | undefined> {
  /* eslint-disable @typescript-eslint/no-unnecessary-condition -- @types/fluent-ffmpeg is not accurate with strict null checks */
  return new Promise<string | undefined>((resolve, reject) => {
    ffmpeg.getAvailableCodecs((err, codecs) => {
      if (err != null) {
        reject(err);
      } else {
        const codec = MP3_CODECS.find((c) => codecs[c]);
        resolve(codec);
      }
    });
  });
  /* eslint-enable @typescript-eslint/no-unnecessary-condition */
}
