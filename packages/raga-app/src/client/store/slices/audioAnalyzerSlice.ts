import { type Operation, run, useAbortSignal } from "effection";
import { Roarr as log } from "roarr";

import { withTimeout } from "../../../common/asyncUtils";
import {
  ANALYZE_AUDIO_FILE_TIMEOUT,
  DEFAULT_AUDIO_FILES_SERVER_PORT,
} from "../../../common/constants";
import { ClientErrors } from "../../../common/errorMessages";
import { analyzeBPM } from "../../audio/bpm";
import { loadAudioBuffer, type LoadAudioBufferOptions } from "../../audio/buffer";
import { isTrackReadyForAnalysis } from "../../hooks/useIsTrackReadyForAnalysis";
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
  analyzeTrack: (trackId: number) => Operation<void>;
  analyzePlaylist: (playlistId: string) => Operation<void>;
}

export const createAudioAnalyzerSlice: AppStoreSliceCreator<
  AudioAnalyzerState & AudioAnalyzerActions
> = (set, get) => ({
  analyzeBPMPerTrack: false,
  analyzerStatus: "ready",

  setAnalyzeBPMPerTrack: (analyzeBPMPerTrack: boolean) => {
    set({ analyzeBPMPerTrack });
  },

  analyzeTrack: function* (trackID: number) {
    try {
      yield* analyzeTrackOrThrow(set, get, { trackID });
    } catch (e) {
      log.error(ClientErrors.analyzeTrackFailed(trackID, e as Error));
      set({ analyzerStatus: "ready" });
    }
  },

  analyzePlaylist: function* (playlistID: string) {
    const { audioConvertedFileURLs, convertTrackToMP3, getTrackDef, libraryPlaylists } = get();

    if (libraryPlaylists === undefined) {
      log.error(ClientErrors.analyzePlaylistFailed(playlistID) + " libraryPlaylists is undefined");
      return;
    }

    const playlistDef = libraryPlaylists[playlistID];
    if (playlistDef === undefined) {
      log.error(
        ClientErrors.analyzePlaylistFailed(playlistID) + " could not find it in the library",
      );
      return;
    }

    log.debug(`[client] analyzing playlist ${playlistID} (name: '${playlistDef.Name}')...`);

    const trackIDs = playlistDef["Playlist Items"].map((item) => item["Track ID"]);

    for (const trackID of trackIDs) {
      try {
        const trackDef = getTrackDef(trackID);
        const isReadyForAnalysis = isTrackReadyForAnalysis(trackDef, audioConvertedFileURLs);
        if (!isReadyForAnalysis && trackDef !== undefined) {
          yield* convertTrackToMP3(trackDef);
        }
        yield* analyzeTrackOrThrow(set, get, { trackID });
      } catch (e) {
        log.error(ClientErrors.analyzeTrackInPlaylistFailed(trackID, playlistID, e as Error));
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
function* analyzeTrackOrThrow(
  set: AppStoreSet,
  get: AppStoreGet,
  { force = false, trackID }: AnalyzeTrackOptions,
) {
  const { audioConvertedFileURLs, audioFilesRootFolder, getTrackDef, writeAudioFileTag } = get();
  const trackDef = getTrackDef(trackID);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const signal = yield* useAbortSignal();

  if (trackDef === undefined) {
    throw new Error(ClientErrors.libraryNoTrackDefFound(trackID));
  }

  if (trackDef.BPM !== undefined && !force) {
    log.debug(`[client] skipping analysis of track ${trackID.toString()}`);
    return;
  }

  const loadAudioBufferOptions = {
    fileOrResourceURL: audioConvertedFileURLs[trackID] ?? trackDef.Location,
    serverRootFolder: audioFilesRootFolder,
    serverPort: DEFAULT_AUDIO_FILES_SERVER_PORT,
    signal,
  };
  let bpm: number | undefined;

  try {
    set({ analyzerStatus: "busy" });
    bpm = yield* loadAudioBufferAndAnalyzeBPM(loadAudioBufferOptions, trackID);
  } catch (e) {
    set({ analyzerStatus: "ready" });
    throw new Error(ClientErrors.analyzeTrackFailed(trackID, e as Error));
  }

  try {
    yield* writeAudioFileTag(trackDef, "BPM", bpm);
  } finally {
    set({ analyzerStatus: "ready" });
  }
}

function loadAudioBufferAndAnalyzeBPM(
  options: LoadAudioBufferOptions,
  trackID: number,
): Operation<number> {
  return withTimeout(
    run(function* () {
      const trackAudio = yield* loadAudioBuffer(options);
      const analyzedBPM = yield* analyzeBPM(trackAudio);
      return Math.round(analyzedBPM);
    }),
    ANALYZE_AUDIO_FILE_TIMEOUT,
    ClientErrors.analyzeTrackTimedOut(trackID),
  );
}
