import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import type { AudioFileConverter } from "@adahiya/raga-lib";
import { type Handler, type NextFunction, type Response } from "@tinyhttp/app";
import { action, type Operation, run, suspend } from "effection";
import { json, type ReqWithBody as RequestWithBody } from "milliparsec";

import type { ConvertTrackToMP3RequestBody } from "../../common/api/audioFilesServerAPI";
import { ServerErrors } from "../../common/errorMessages";
import ffmpeg, { ffmpegInfo, isFfmpegAvailable } from "../common/ffmpeg";
import { log } from "../common/serverLogger";

export function getConvertToMP3RequestHandler(converter: AudioFileConverter): Handler {
  return async (
    req: RequestWithBody<ConvertTrackToMP3RequestBody>,
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

    const { trackDefinition } = req.body;
    const inputFilePath = fileURLToPath(trackDefinition.Location);
    log.debug(
      `Handling request for an track with file type unsupported by Web Audio: ${JSON.stringify(
        trackDefinition,
      )}`,
    );

    const fileExists = existsSync(inputFilePath);
    if (!fileExists) {
      res.status(404).send(ServerErrors.AUDIO_FILE_NOT_FOUND);
      return;
    }

    if (!isFfmpegAvailable) {
      // 501 means server does not support the requested functionality, see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/501
      res.status(501).send(JSON.stringify(ffmpegInfo));
      // res.status(501).send(ServerErrors.FFMPEG_UNAVAILABLE);
      return;
    }

    const codec = await run(getBestAvailableMP3Codec);
    if (codec === undefined) {
      res.status(501).send(ServerErrors.MP3_CODEC_UNAVAILABLE);
      return;
    }

    try {
      const outputFilePath = await converter.convertAudioFileToMP3(trackDefinition, {
        codec,
        outputDirKind: "temporary",
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
function getBestAvailableMP3Codec(): Operation<string | undefined> {
  return action<string | undefined>(function* (resolve, reject) {
    ffmpeg.getAvailableCodecs((err, codecs) => {
      /* eslint-disable @typescript-eslint/no-unnecessary-condition -- @types/fluent-ffmpeg is not accurate with strict null checks */
      if (err != null) {
        reject(err);
      } else {
        const codec = MP3_CODECS.find((c) => codecs[c]);
        resolve(codec);
      }
      /* eslint-enable @typescript-eslint/no-unnecessary-condition */
    });

    yield* suspend();
  });
}
