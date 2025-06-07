import type { TrackDefinition } from "@adahiya/raga-lib";
import { AudioFilesServerRoutes as ServerRoutes } from "@adahiya/raga-lib";
import { notifications } from "@mantine/notifications";
import { call, type Operation, run } from "effection";
import { IoCheckmark, IoClose } from "react-icons/io5";
import { Roarr as log } from "roarr";
import type { ErrorObject } from "serialize-error";

import { withTimeout } from "../../common/asyncUtils";
import {
  AUDIO_FILES_SERVER_PING_TIMEOUT,
  DEFAULT_AUDIO_FILES_SERVER_PORT,
  WRITE_AUDIO_FILE_TAG_TIMEOUT,
} from "../../common/constants";
import {
  type AudioFilesServerStartedEventPayload,
  ClientEventChannel,
  ServerEventChannel,
  type SupportedTagName,
  type WriteAudioFileTagOptions,
} from "../../common/events";
import getAllConvertedMP3sRequest from "../requestFactories/allConvertedMP3sRequest";
import convertTrackToMP3Request from "../requestFactories/convertTrackToMP3Request";
import getDiscogsGenreTagsRequest from "../requestFactories/getDiscogsGenreTagsRequest";
import pingRequest from "../requestFactories/pingRequest";
import type { AppStoreSet, AppStoreSliceCreator } from "../zustandUtils";

export type AudioFilesServerStatus = "stopped" | "starting" | "started" | "failed";

// TODO: better server URL
const serverBaseURL = `http://localhost:${DEFAULT_AUDIO_FILES_SERVER_PORT.toString()}`;

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
  getConvertedMP3s: () => Operation<void>;
  writeAudioFileTag: (
    trackDef: TrackDefinition,
    tagName: SupportedTagName,
    newValue: string | number | undefined,
  ) => Operation<void>;

  // Third party API actions
  getDiscogsGenres: (trackDef: TrackDefinition) => Operation<string[] | undefined>;
}

export const createAudioFilesServerSlice: AppStoreSliceCreator<
  AudioFilesServerState & AudioFilesServerActions
> = (set, get) => {
  return {
    audioFilesRootFolder: "",
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
     * Update the record of converted MP3 file URLs from the audio files server
     */
    getConvertedMP3s: function* (): Operation<void> {
      const res = yield* getAllConvertedMP3sRequest(serverBaseURL);
      if (res.ok) {
        const convertedFilePaths = (yield* call(() => res.json())) as Record<string, string>;
        const audioConvertedFileURLs: Record<number, string> = {};
        for (const [trackID, filePath] of Object.entries(convertedFilePaths)) {
          audioConvertedFileURLs[parseInt(trackID, 10)] = `${serverBaseURL}${
            ServerRoutes.GET_CONVERTED_MP3
          }/${encodeURIComponent(filePath)}`;
        }
        set({ audioConvertedFileURLs });
      }
    },

    /**
     * @returns the URL of the converted MP3 file, or undefined if unsuccessful
     */
    convertTrackToMP3: function* (trackDef: TrackDefinition): Operation<string | undefined> {
      const trackID = trackDef["Track ID"];

      log.debug(
        `[client] Initiating request to convert track ${trackID.toString()} to MP3, this may take a few seconds...`,
      );
      set({ audioFilesConverterIsBusy: true });

      try {
        const res = yield* convertTrackToMP3Request(serverBaseURL, trackDef);
        const responseText = yield* call(() => res.text());

        if (res.ok) {
          const outputFilePath = responseText;
          log.debug(
            `[client] Successfully converted track ${trackID.toString()} to MP3 at: ${outputFilePath}`,
          );

          const convertedFileURL = `${serverBaseURL}${
            ServerRoutes.GET_CONVERTED_MP3
          }/${encodeURIComponent(outputFilePath)}`;
          set((state) => {
            state.audioConvertedFileURLs[trackID] = convertedFileURL;
          });

          return convertedFileURL;
        } else {
          log.error(`[client] Failed to convert ${trackDef.Location} to MP3: ${responseText}`);
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

    writeAudioFileTag: function* (trackDef, tagName, newValue): Operation<void> {
      const { userEmail } = get();
      const trackID = trackDef["Track ID"];

      window.api.send(ClientEventChannel.WRITE_AUDIO_FILE_TAG, {
        fileLocation: trackDef.Location,
        tagName,
        userEmail,
        value: newValue,
      } satisfies WriteAudioFileTagOptions);

      try {
        yield* call(
          window.api.waitForResponse(
            ServerEventChannel.WRITE_AUDIO_FILE_TAG_COMPLETE,
            WRITE_AUDIO_FILE_TAG_TIMEOUT,
          ),
        );

        log.info(`[client] completed updating '${tagName}' tag for track ${trackID.toString()}`);

        set((state) => {
          switch (tagName) {
            case "BPM":
              state.library!.Tracks[trackID].BPM = newValue as number | undefined;
              break;
            case "Rating":
              state.library!.Tracks[trackID].Rating = newValue as number | undefined;
              break;
            case "Artist":
              state.library!.Tracks[trackID].Artist = newValue as string | undefined;
              break;
            case "Album":
              state.library!.Tracks[trackID].Album = newValue as string | undefined;
              break;
            case "Title":
              state.library!.Tracks[trackID].Name = newValue as string | undefined;
              break;
            case "Genre":
              state.library!.Tracks[trackID].Genre = newValue as string | undefined;
              break;
            default:
              return;
          }
          state.libraryWriteState = "ready"; // needs to be written to disk
        });
      } catch (e) {
        log.error(`[client] Failed to write audio file tag: ${(e as Error).message}`);
      }
    },

    getDiscogsGenres: function* (trackDef: TrackDefinition): Operation<string[] | undefined> {
      if (!trackDef.Artist || !trackDef.Name) {
        log.error(
          `[client] cannot get Discogs genres for track ${trackDef["Track ID"].toString()}: missing Artist or Name`,
        );
        return undefined;
      }

      log.debug(`[client] getting Discogs genres for ${trackDef.Artist} - ${trackDef.Name}`);
      const genres = yield* getDiscogsGenreTagsRequest(serverBaseURL, trackDef);
      return genres;
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
      (data) => {
        console.log("[AudioFilesServerSlice] Audio files server started", data);
        set((state) => {
          notifications.show({
            title: "Audio files server started",
            message: state.audioFilesRootFolder,
            color: "green",
            icon: <IoCheckmark />,
          });
          state.audioFilesConverterTemporaryFolder = data.audioConverterTemporaryFolder;
          state.audioFilesServerStatus = "started";

          // Fetch the list of previously-converted MP3s from the audio files server. We rely on the server for this
          // information (rather than caching it) so that we know the files are guaranteed to exist on disk and
          // they have not been cleaned up by some OS process.
          void run(state.getConvertedMP3s);
        });
      },
    );

    window.api.handleOnce<ErrorObject>(ServerEventChannel.AUDIO_FILES_SERVER_ERROR, (err) => {
      console.error("[AudioFilesServerSlice] Failed to start audio files server", err);
      set((state) => {
        notifications.show({
          title: "Audio files server failed to start",
          message: state.audioFilesRootFolder,
          color: "red",
          icon: <IoClose />,
        });
        state.audioFilesServerStatus = "failed";
      });
    });
  });
}
