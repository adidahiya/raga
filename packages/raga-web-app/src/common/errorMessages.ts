import { serializeError } from "serialize-error";

const CLIENT = "[client]";

export const ClientErrors = {
  analyzeTrackFailed: (trackID: number, err: Error) =>
    `${CLIENT} error analyzing track ${trackID.toString()}: ${JSON.stringify(serializeError(err))}`,
  analyzeTrackTimedOut: (trackID: number) =>
    `${CLIENT} timed out while analyzing track ${trackID.toString()}`,
  analyzeTrackInPlaylistFailed: (trackID: number, playlistID: string, err: Error) =>
    `${CLIENT} error analyzing track ${trackID.toString()} in playlist ${playlistID}: ${JSON.stringify(
      serializeError(err),
    )}`,
  analyzePlaylistFailed: (playlistID: string) =>
    `${CLIENT} Unable to analyze playlist ${playlistID}, libraryPlaylists is undefined`,

  contextBridgeResponseTimeout: (channel: string) =>
    `${CLIENT} Timed out waiting for response to ${channel} event`,

  libraryFailedToLoad: (err: Error) => `${CLIENT} Failed to load library: ${err.message}`,
  libraryNoTracksFoundForPlaylist: (playlistID: string) =>
    `${CLIENT} No track definitions found for playlist ${playlistID}`,
  libraryNoTrackDefFound: (trackID: number) =>
    `${CLIENT} No track definition found for track ${trackID.toString()}`,
  libraryWriteTagFailedFileNotFound: (filePath: string) =>
    `${CLIENT} Failed to write tag to track at ${filePath}: file not found`,

  APP_RENDER_FAILED: `${CLIENT} Failed to render application: no root DOM node available`,
  LIBRARY_NOT_LOADED: `${CLIENT} Library is not loaded`,
  LIBRARY_WRITE_NO_OUTPUT_FILEPATH: `${CLIENT} No output filepath specified`,
  LIBRARY_WRITE_TIMED_OUT: `${CLIENT} Timed out while writing library to disk`,
};
