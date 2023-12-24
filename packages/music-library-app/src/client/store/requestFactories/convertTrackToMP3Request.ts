import type { TrackDefinition } from "@adahiya/music-library-tools-lib";
import { pick } from "radash";

import { AudioFilesServerRoutes as Routes } from "../../../common/audioFilesServerRoutes";

export default function convertTrackToMP3Request(serverBaseURL: string, trackDef: TrackDefinition) {
  return fetch(`${serverBaseURL}${Routes.POST_CONVERT_TO_MP3}`, {
    method: "POST",
    body: JSON.stringify({
      trackProperties: pick(trackDef, ["Artist", "Album", "Location", "Name", "Track ID"]),
    }),
  });
}
