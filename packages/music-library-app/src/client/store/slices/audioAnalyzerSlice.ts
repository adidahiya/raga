import { Roarr as log } from "roarr";
import { serializeError } from "serialize-error";

import {
  ANALYZE_AUDIO_FILE_TIMEOUT,
  DEFAULT_AUDIO_FILES_SERVER_PORT,
  WRITE_AUDIO_FILE_TAG_TIMEOUT,
} from "../../../common/constants";
import { ClientEventChannel, ServerEventChannel } from "../../../common/events";
import { isSupportedWebAudioFileFormat } from "../../../common/webAudioUtils";
import { analyzeBPM } from "../../audio/bpm";
import { getAudioFileURL, loadAudioBuffer } from "../../audio/buffer";
import type { AppStoreGet, AppStoreSet, AppStoreSliceCreator } from "../zustandUtils";

export type AudioAnalyzerStatus = "ready" | "busy";

export interface AudioAnalyzerState {
  analyzeBPMPerTrack: boolean;
  analyzerStatus: AudioAnalyzerStatus;
}

export interface AudioAnalyzerActions {
  setAnalyzeBPMPerTrack: (analyzeBPMPerTrack: boolean) => void;
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

  analyzeTrack: async (trackId: number) => {
    try {
      await analyzeTrackOrThrow(set, get, trackId);
    } catch (e) {
      log.error(`[client] error analyzing track ${trackId}: ${JSON.stringify(serializeError(e))}`);
      set({ analyzerStatus: "ready" });
    }
  },

  analyzePlaylist: async (playlistId: string) => {
    const { libraryPlaylists } = get();

    if (libraryPlaylists === undefined) {
      log.error(`[client] Unable to analyze playlist ${playlistId}, libraryPlaylists is undefined`);
      return;
    }

    const playlistDef = libraryPlaylists[playlistId];
    if (playlistDef === undefined) {
      log.error(
        `[client] Unable to analyze playlist ${playlistId}, could not find it in the library`,
      );
      return;
    }

    log.debug(`[client] analyzing playlist ${playlistId} (name: '${playlistDef.Name}')...`);

    const trackIds = playlistDef["Playlist Items"].map((item) => item["Track ID"]);

    for (const trackId of trackIds) {
      try {
        await analyzeTrackOrThrow(set, get, trackId);
      } catch (e) {
        log.error(
          `[client] error analyzing track ${trackId} in playlist ${playlistId}: ${JSON.stringify(
            serializeError(e),
          )}`,
        );
        set({ analyzerStatus: "ready" });
        continue;
      }
    }
  },
});

/** @throws */
async function analyzeTrackOrThrow(set: AppStoreSet, get: AppStoreGet, trackId: number) {
  const trackDef = get().getTrackDef(trackId);

  if (trackDef === undefined) {
    throw new Error(`Unable to find track definition`);
  }

  const fileLocation = trackDef.Location;
  const canAnalyzeFileFormat = isSupportedWebAudioFileFormat(trackDef);

  if (trackDef.BPM !== undefined || !canAnalyzeFileFormat) {
    log.debug(`[client] skipping analysis of track ${trackId}`);
    return;
  }

  set({ analyzerStatus: "busy" });
  const analyzeAudioTimeout = setTimeout(() => {
    set({ analyzerStatus: "ready" });
    throw new Error(`timed out while analyzing track ${trackId}`);
  }, ANALYZE_AUDIO_FILE_TIMEOUT);

  const serverRootFolder = get().audioFilesRootFolder;
  const loadAudioBufferOptions = {
    fileLocation,
    serverRootFolder,
    serverPort: DEFAULT_AUDIO_FILES_SERVER_PORT,
  };
  const fileURL = getAudioFileURL(loadAudioBufferOptions);

  let bpm: number | undefined;

  try {
    const trackAudio = await loadAudioBuffer(loadAudioBufferOptions);
    const analyzedBPM = await analyzeBPM(trackAudio);
    bpm = Math.round(analyzedBPM);
  } catch (e) {
    throw new Error(
      `failed to analyze track ${trackId}, is the audio files server running? (file URL: ${fileURL})`,
    );
  } finally {
    clearTimeout(analyzeAudioTimeout);
  }

  window.api.send(ClientEventChannel.WRITE_AUDIO_FILE_TAG, {
    fileLocation,
    tagName: "BPM",
    value: bpm,
  });

  await window.api.waitForResponse(
    ServerEventChannel.WRITE_AUDIO_FILE_TAG_COMPLETE,
    WRITE_AUDIO_FILE_TAG_TIMEOUT,
  );
  log.info(`[client] completed updating BPM for track ${trackId}`);
  set((state) => {
    state.library!.Tracks[trackId].BPM = bpm!;
    state.libraryWriteState = "ready"; // needs to be written to disk
    state.analyzerStatus = "ready";
  });
}
