import type { TrackDefinition } from "@adahiya/music-library-tools-lib";
import { pick } from "radash";

import {
  AudioFilesServerRoutes as Routes,
  type ConvertTrackToMP3RequestBody,
} from "../../../common/api/audioFilesServerAPI";

export default function convertTrackToMP3Request(serverBaseURL: string, trackDef: TrackDefinition) {
  return fetch(`${serverBaseURL}${Routes.POST_CONVERT_TO_MP3}`, {
    method: "POST",
    body: JSON.stringify({
      trackDefinition: pick(trackDef, ["Location", "Persistent ID", "Track ID"]),
    } satisfies ConvertTrackToMP3RequestBody),
  });
}
