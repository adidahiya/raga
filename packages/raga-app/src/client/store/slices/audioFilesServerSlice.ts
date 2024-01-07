import type { TrackDefinition } from "@adahiya/raga-lib";
import { call, type Operation } from "effection";
import { Roarr as log } from "roarr";
import type { ErrorObject } from "serialize-error";

import { AudioFilesServerRoutes as ServerRoutes } from "../../../common/api/audioFilesServerAPI";
import { withTimeout } from "../../../common/asyncUtils";
import {
  AUDIO_FILES_SERVER_PING_TIMEOUT,
  DEFAULT_AUDIO_FILES_ROOT_FOLDER,
  DEFAULT_AUDIO_FILES_SERVER_PORT,
} from "../../../common/constants";
import {
  type AudioFilesServerStartedEventPayload,
  ClientEventChannel,
  ServerEventChannel,
} from "../../../common/events";
import convertTrackToMP3Request from "../requestFactories/convertTrackToMP3Request";
import pingRequest from "../requestFactories/pingRequest";
import type { AppStoreSet, AppStoreSliceCreator } from "../zustandUtils";

export type AudioFilesServerStatus = "stopped" | "starting" | "started" | "failed";

// TODO: better server URL
const serverBaseURL = `http://localhost:${DEFAULT_AUDIO_FILES_SERVER_PORT}`;

export interface AudioFilesServerState {
  audioFilesRootFolder: string;
  audioFilesServerStatus: AudioFilesServerStatus;
  audioFilesConverterIsBusy: boolean;
  /** Temporary folder on disk where the audio files coverterer is storing MP3s */
  audioFilesConverterTemporaryFolder: string | undefined;
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
  pingAudioFilesServer: () => Operation<Response | undefined>;

  // complex server actions
  convertTrackToMP3: (trackDef: TrackDefinition) => Operation<string | undefined>;
}

export const createAudioFilesServerSlice: AppStoreSliceCreator<
  AudioFilesServerState & AudioFilesServerActions
> = (set) => {
  return {
    audioFilesRootFolder: DEFAULT_AUDIO_FILES_ROOT_FOLDER,
    audioFilesServerStatus: "stopped",
    audioFilesConverterIsBusy: false,
    audioFilesConverterTemporaryFolder: undefined,
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

    pingAudioFilesServer: function* (): Operation<Response | undefined> {
      log.debug(`[client] pinging audio files server at ${serverBaseURL}...`);
      let res: Response | undefined;

      try {
        res = yield* withTimeout(
          pingRequest(serverBaseURL),
          AUDIO_FILES_SERVER_PING_TIMEOUT,
          `[client] audio files server ping timed out`,
        );
      } catch (e) {
        // not a catastrophic error, just log it
        log.error((e as Error).message);
        set({ audioFilesServerStatus: "stopped" });
        return undefined;
      }

      if (res.ok) {
        set({ audioFilesServerStatus: "started" });
      } else {
        set({ audioFilesServerStatus: "failed" });
        log.error(`[client] audio files server ping failed`);
      }

      return res;
    },

    /**
     * @returns the URL of the converted MP3 file, or undefined if unsuccessful
     */
    convertTrackToMP3: function* (trackDef: TrackDefinition): Operation<string | undefined> {
      const trackID = trackDef["Track ID"];

      log.debug(
        `[client] Initiating request to convert track ${trackID} to MP3, this may take a few seconds...`,
      );
      set({ audioFilesConverterIsBusy: true });

      try {
        const res = yield* convertTrackToMP3Request(serverBaseURL, trackDef);
        if (res.ok) {
          const outputFilePath = yield* call(res.text());
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

    window.api.handleOnce<AudioFilesServerStartedEventPayload>(
      ServerEventChannel.AUDIO_FILES_SERVER_STARTED,
      (_event, data) => {
        set((state) => {
          if (
            state.audioFilesConverterTemporaryFolder !== data?.audioConverterTemporaryFolder &&
            Object.entries(state.audioConvertedFileURLs).length > 0
          ) {
            // we may receive a new temporary folder from the server (typically after an OS restart)
            log.debug(
              `[client] server returned a new temporary folder for converted audio files; clearing local cache of converted file URLs`,
            );
            state.audioConvertedFileURLs = {};
          }
          state.audioFilesConverterTemporaryFolder = data?.audioConverterTemporaryFolder;
          state.audioFilesServerStatus = "started";
        });
      },
    );

    window.api.handleOnce<ErrorObject>(
      ServerEventChannel.AUDIO_FILES_SERVER_ERROR,
      (_event, err) => {
        log.error(
          `[client] audio files server failed to start, check server logs: ${JSON.stringify(err)}`,
        );
        set((state) => {
          state.audioFilesServerStatus = "failed";
        });
      },
    );
  });
}
