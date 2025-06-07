import type { BasicTrackDefinition } from "../models/tracks.js";

export const AudioFilesServerRoutes = {
  GET_PING: "/ping",
  GET_CONVERTED_MP3: "/convertedMP3",
  GET_ALL_CONVERTED_MP3S: "/allConvertedMP3s",
  POST_CONVERT_TO_MP3: "/convertToMP3",
  GET_DISCOGS_GENRES: "/discogsGenres",
};

export interface ConvertTrackToMP3RequestBody {
  trackDefinition: BasicTrackDefinition;
}

export interface GetDiscogsGenresRequestParams {
  artist: string;
  track: string;
}
