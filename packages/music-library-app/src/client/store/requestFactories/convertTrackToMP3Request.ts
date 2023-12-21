import { TrackDefinition } from "@adahiya/music-library-tools-lib";
import { pick } from "radash";

import { AudioFilesServerRoutes } from "../../../common/audioFilesServerRoutes";

export default function convertTrackToMP3Request(serverBaseURL: string, trackDef: TrackDefinition) {
  return fetch(`${serverBaseURL}${AudioFilesServerRoutes.POST_CONVERT_TO_MP3}`, {
    method: "POST",
    body: JSON.stringify({
      trackProperties: pick(trackDef, ["Artist", "Album", "Location", "Name", "Track ID"]),
    }),
  });
}
