import { Roarr as log } from "roarr";
import { serializeError } from "serialize-error";

import {
  ANALYZE_AUDIO_FILE_TIMEOUT,
  DEFAULT_AUDIO_FILES_SERVER_PORT,
  WRITE_AUDIO_FILE_TAG_TIMEOUT,
} from "../../../common/constants";
import { ClientEventChannel, ServerEventChannel } from "../../../common/events";
import { analyzeBPM } from "../../audio/bpm";
import { loadAudioBuffer } from "../../audio/buffer";
import type { AppStoreGet, AppStoreSet, AppStoreSliceCreator } from "../zustandUtils";

export type AudioAnalyzerStatus = "ready" | "busy";

export interface AudioAnalyzerState {
  analyzeBPMPerTrack: boolean;
  analyzerStatus: AudioAnalyzerStatus;
}

export interface AudioAnalyzerActions {
  // simple setters
  setAnalyzeBPMPerTrack: (analyzeBPMPerTrack: boolean) => void;

  // complex actions
  analyzeTrack: (trackId: number) => Promise<void>;
  analyzePlaylist: (playlistId: string) => Promise<void>;
}

export const createAudioAnalyzerSlice: AppStoreSliceCreator<
  AudioAnalyzerState & AudioAnalyzerActions
> = (set, get) => ({
  analyzeBPMPerTrack: false,
  analyzerStatus: "ready",

  setAnalyzeBPMPerTrack: (analyzeBPMPerTrack: boolean) => {
    set({ analyzeBPMPerTrack });
  },

  analyzeTrack: async (trackID: number) => {
    try {
      await analyzeTrackOrThrow(set, get, { trackID });
    } catch (e) {
      log.error(`[client] error analyzing track ${trackID}: ${JSON.stringify(serializeError(e))}`);
      set({ analyzerStatus: "ready" });
    }
  },

  analyzePlaylist: async (playlistID: string) => {
    const { libraryPlaylists } = get();

    if (libraryPlaylists === undefined) {
      log.error(`[client] Unable to analyze playlist ${playlistID}, libraryPlaylists is undefined`);
      return;
    }

    const playlistDef = libraryPlaylists[playlistID];
    if (playlistDef === undefined) {
      log.error(
        `[client] Unable to analyze playlist ${playlistID}, could not find it in the library`,
      );
      return;
    }

    log.debug(`[client] analyzing playlist ${playlistID} (name: '${playlistDef.Name}')...`);

    const trackIDs = playlistDef["Playlist Items"].map((item) => item["Track ID"]);

    for (const trackID of trackIDs) {
      try {
        await analyzeTrackOrThrow(set, get, { trackID });
      } catch (e) {
        log.error(
          `[client] error analyzing track ${trackID} in playlist ${playlistID}: ${JSON.stringify(
            serializeError(e),
          )}`,
        );
        set({ analyzerStatus: "ready" });
        continue;
      }
    }
  },
});

interface AnalyzeTrackOptions {
  /**
   * ID of the track to analyze.
   */
  trackID: number;

  /**
   * Set to `true` to re-analyze tracks which already have a BPM tag.
   *
   * @default false
   */
  force?: boolean;
}

/** @throws */
async function analyzeTrackOrThrow(
  set: AppStoreSet,
  get: AppStoreGet,
  { force = false, trackID }: AnalyzeTrackOptions,
) {
  const { audioConvertedFileURLs, audioFilesRootFolder, getTrackDef } = get();
  const trackDef = getTrackDef(trackID);

  if (trackDef === undefined) {
    throw new Error(`Unable to find track definition`);
  }

  if (trackDef.BPM !== undefined && !force) {
    log.debug(`[client] skipping analysis of track ${trackID}`);
    return;
  }

  set({ analyzerStatus: "busy" });
  const analyzeAudioTimeout = setTimeout(() => {
    set({ analyzerStatus: "ready" });
    throw new Error(`timed out while analyzing track ${trackID}`);
  }, ANALYZE_AUDIO_FILE_TIMEOUT);

  let bpm: number | undefined;

  try {
    const trackAudio = await loadAudioBuffer({
      fileOrResourceURL: audioConvertedFileURLs[trackID] ?? trackDef.Location,
      serverRootFolder: audioFilesRootFolder,
      serverPort: DEFAULT_AUDIO_FILES_SERVER_PORT,
    });
    const analyzedBPM = await analyzeBPM(trackAudio);
    bpm = Math.round(analyzedBPM);
  } catch (e) {
    throw new Error(`Failed to analyze track ${trackID}`);
  } finally {
    clearTimeout(analyzeAudioTimeout);
  }

  window.api.send(ClientEventChannel.WRITE_AUDIO_FILE_TAG, {
    fileLocation: trackDef.Location,
    tagName: "BPM",
    value: bpm,
  });

  await window.api.waitForResponse(
    ServerEventChannel.WRITE_AUDIO_FILE_TAG_COMPLETE,
    WRITE_AUDIO_FILE_TAG_TIMEOUT,
  );
  log.info(`[client] completed updating BPM for track ${trackID}`);
  set((state) => {
    state.library!.Tracks[trackID].BPM = bpm!;
    state.libraryWriteState = "ready"; // needs to be written to disk
    state.analyzerStatus = "ready";
  });
}
