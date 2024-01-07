import type { BasicTrackDefinition } from "../../../../raga-lib/lib";

export const AudioFilesServerRoutes = {
  GET_PING: "/ping",
  GET_CONVERTED_MP3: "/convertedMP3",
  POST_CONVERT_TO_MP3: "/convertToMP3",
};

export interface ConvertTrackToMP3RequestBody {
  trackDefinition: BasicTrackDefinition;
}
