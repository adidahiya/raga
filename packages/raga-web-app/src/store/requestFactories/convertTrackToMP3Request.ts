import type { TrackDefinition } from "@adahiya/raga-types";
import {
  AudioFilesServerRoutes as Routes,
  type ConvertTrackToMP3RequestBody,
} from "@adahiya/raga-types";
import { call, type Operation } from "effection";
import { pick } from "radash";

export default function* convertTrackToMP3Request(
  serverBaseURL: string,
  trackDef: TrackDefinition,
  init?: RequestInit,
): Operation<Response> {
  return yield* call(() =>
    fetch(`${serverBaseURL}${Routes.POST_CONVERT_TO_MP3}`, {
      method: "POST",
      body: JSON.stringify({
        trackDefinition: pick(trackDef, ["Location", "Persistent ID", "Track ID"]),
      } satisfies ConvertTrackToMP3RequestBody),
      ...init,
    }),
  );
}
