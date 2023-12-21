import { TrackDefinition } from "@adahiya/music-library-tools-lib";
import { Roarr as log } from "roarr";

import { AudioFilesServerRoutes as ServerRoutes } from "../../../common/audioFilesServerRoutes";
import {
  AUDIO_FILES_SERVER_PINT_TIMEOUT,
  DEFAULT_AUDIO_FILES_ROOT_FOLDER,
  DEFAULT_AUDIO_FILES_SERVER_PORT,
} from "../../../common/constants";
import { ClientEventChannel, ServerEventChannel } from "../../../common/events";
import convertTrackToMP3Request from "../requestFactories/convertTrackToMP3Request";
import type { AppStoreSet, AppStoreSliceCreator } from "../zustandUtils";

export type AudioFilesServerStatus = "stopped" | "starting" | "started" | "failed";

// TODO: better server URL
const serverBaseURL = `http://localhost:${DEFAULT_AUDIO_FILES_SERVER_PORT}`;

export interface AudioFilesServerState {
  audioFilesRootFolder: string;
  audioFilesServerStatus: AudioFilesServerStatus;
  audioFilesConverterIsBusy: boolean;
  /**
   * Record of Track ID -> audio file server URL of the converted MP3 for tracks with
   * unsupported file formats (.aif and .aiff). This is useful to avoid re-converting the same
   * track over and over.
   */
  audioConvertedFileURLs: PartialRecord<number, string>;
}

export interface AudioFilesServerActions {
  // simple state setters
  setAudioTracksRootFolder: (audioFilesRootFolder: string) => void;
  setAudioFilesConverterIsBusy: (isBusy: boolean) => void;
  setConvertedAudioFileURL: (trackID: number, fileURL: string) => void;

  // simple server actions
  startAudioFilesServer: () => void;
  stopAudioFilesServer: () => void;
  pingAudioFilesServer: () => Promise<Response>;

  // complex server actions
  convertTrackToMP3: (trackDef: TrackDefinition) => Promise<string | undefined>;
}

export const createAudioFilesServerSlice: AppStoreSliceCreator<
  AudioFilesServerState & AudioFilesServerActions
> = (set) => {
  return {
    audioFilesRootFolder: DEFAULT_AUDIO_FILES_ROOT_FOLDER,
    audioFilesServerStatus: "stopped",
    audioFilesConverterIsBusy: false,
    audioConvertedFileURLs: {},

    setAudioTracksRootFolder: (audioFilesRootFolder: string) => {
      set({ audioFilesRootFolder });
    },

    setAudioFilesConverterIsBusy: (audioFilesConverterIsBusy: boolean) => {
      set({ audioFilesConverterIsBusy });
    },

    setConvertedAudioFileURL: (trackID: number, fileURL: string) => {
      set((state) => {
        state.audioConvertedFileURLs[trackID] = fileURL;
      });
    },

    startAudioFilesServer: () => {
      set((state) => {
        if (state.audioFilesServerStatus === "started") {
          window.api.send(ClientEventChannel.AUDIO_FILES_SERVER_STOP);
          window.api.handleOnce(ServerEventChannel.AUDIO_FILES_SERVER_READY_FOR_RESTART, () => {
            log.debug("[client] restarting audio files server...");
            initAudioFilesServer(set);
          });
        } else {
          log.debug("[client] starting audio files server...");
          initAudioFilesServer(set);
        }
      });
    },

    stopAudioFilesServer: () => {
      set((state) => {
        if (state.audioFilesServerStatus !== "started") {
          log.error("[client] audio files server is not running");
          return;
        }

        log.debug("[client] stopping audio files server...");
        window.api.send(ClientEventChannel.AUDIO_FILES_SERVER_STOP);
        state.audioFilesServerStatus = "stopped";
      });
    },

    pingAudioFilesServer: () => {
      const port = DEFAULT_AUDIO_FILES_SERVER_PORT;
      const pingURL = `http://localhost:${port}/ping`;

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          log.error(`[client] audio files server ping timed out`);
          set({ audioFilesServerStatus: "stopped" });
          reject();
        }, AUDIO_FILES_SERVER_PINT_TIMEOUT);

        log.debug(`[client] pinging audio files server at ${pingURL}...`);
        fetch(pingURL)
          .then((res) => {
            if (res.ok) {
              set({ audioFilesServerStatus: "started" });
              resolve(res);
            } else {
              set({ audioFilesServerStatus: "failed" });
              reject();
            }
          })
          .catch(() => {
            set({ audioFilesServerStatus: "failed" });
            reject();
          })
          .finally(() => {
            clearTimeout(timeout);
          });
      });
    },

    /**
     * @returns the URL of the converted MP3 file, or undefined if unsuccessful
     */
    convertTrackToMP3: async (trackDef: TrackDefinition) => {
      const trackID = trackDef["Track ID"];

      log.debug(
        `[client] Initiating request to convert track ${trackID} to MP3, this may take a few seconds...`,
      );
      set({ audioFilesConverterIsBusy: true });

      try {
        const res = await convertTrackToMP3Request(serverBaseURL, trackDef);
        if (res.ok) {
          const outputFilePath = await res.text();
          log.debug(
            `[client] Successfully converted track ${trackID} to MP3 at: ${outputFilePath}`,
          );

          const convertedFileURL = `${serverBaseURL}${
            ServerRoutes.GET_CONVERTED_MP3
          }/${encodeURIComponent(outputFilePath)}`;
          set((state) => {
            state.audioConvertedFileURLs[trackID] = convertedFileURL;
          });

          return convertedFileURL;
        } else {
          log.error(`[client] Failed to convert ${trackDef.Location} to MP3: ${res.statusText}`);
        }
      } catch (e) {
        log.error(
          `[client] Failed to convert ${trackDef.Location} to MP3: ${(e as Error).message}`,
        );
      } finally {
        set({ audioFilesConverterIsBusy: false });
      }

      return undefined;
    },
  };
};

function initAudioFilesServer(set: AppStoreSet) {
  set((state) => {
    window.api.send(ClientEventChannel.AUDIO_FILES_SERVER_START, {
      audioFilesRootFolder: state.audioFilesRootFolder,
    });
    state.audioFilesServerStatus = "starting";

    window.api.handleOnce(ServerEventChannel.AUDIO_FILES_SERVER_STARTED, () => {
      set((state) => {
        state.audioFilesServerStatus = "started";
      });
    });

    window.api.handleOnce(
      ServerEventChannel.AUDIO_FILES_SERVER_ERROR,
      (errorData: object | undefined) => {
        log.error(`[client] audio files server failed to start: ${JSON.stringify(errorData)}`);
        set((state) => {
          state.audioFilesServerStatus = "failed";
        });
      },
    );
  });
}
