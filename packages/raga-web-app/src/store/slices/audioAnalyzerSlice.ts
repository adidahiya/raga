import {
  AUDIO_FEATURE_CACHE_VERSION,
  type AudioFeatureCache,
  createEmptyAudioFeatureCache,
  type TrackAudioFeatures,
} from "@adahiya/raga-types";
import { type Operation, run, useAbortSignal } from "effection";
import { Roarr as log } from "roarr";

import { analyzeBPM } from "../../audio/bpm";
import { loadAudioBuffer, type LoadAudioBufferOptions } from "../../audio/buffer";
import { getFeatureCacheClient } from "../../audio/featureCache";
import { extractTrackFeatures } from "../../audio/features";
import { withTimeout } from "../../common/asyncUtils";
import {
  ANALYZE_AUDIO_FILE_TIMEOUT,
  DEFAULT_AUDIO_FILES_SERVER_PORT,
} from "../../common/constants";
import { ClientErrors } from "../../common/errorMessages";
import { isTrackReadyForAnalysis } from "../../hooks/useIsTrackReadyForAnalysis";
import type { AppStoreGet, AppStoreSet, AppStoreSliceCreator } from "../zustandUtils";

export type AudioAnalyzerStatus = "ready" | "busy";

export type AnalyzerJobStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";

export interface AnalyzerJob {
  trackId: number;
  status: AnalyzerJobStatus;
  /** Last error message, if any. */
  error?: string;
}

export interface AnalyzerProgress {
  total: number;
  completed: number;
  failed: number;
  /** Track id of the job currently running, if any. */
  currentTrackId: number | undefined;
  /** Estimated time remaining in milliseconds, derived from a rolling per-track average. */
  etaMs: number | undefined;
}

export interface AudioAnalyzerState {
  analyzeBPMPerTrack: boolean;
  analyzerStatus: AudioAnalyzerStatus;
  /** In-memory feature cache, keyed by track Persistent ID. */
  audioFeatureCache: AudioFeatureCache;
  /** Background analysis queue. */
  analyzerJobs: AnalyzerJob[];
  /** Aggregated progress for the current run, or undefined when nothing is queued. */
  analyzerProgress: AnalyzerProgress | undefined;
  /** When true, a cancel has been requested for the current queue. */
  analyzerCancelRequested: boolean;
}

export interface AudioAnalyzerActions {
  // simple setters
  setAnalyzeBPMPerTrack: (analyzeBPMPerTrack: boolean) => void;
  setAudioFeatureCache: (cache: AudioFeatureCache) => void;
  setTrackAudioFeatures: (persistentId: string, features: TrackAudioFeatures) => void;

  // queue management
  enqueueAnalysis: (trackIds: number[]) => void;
  cancelAnalysisQueue: () => void;
  clearAnalysisQueue: () => void;

  // complex actions
  analyzeTrack: (trackId: number, options?: { force?: boolean }) => Operation<void>;
  analyzePlaylist: (playlistId: string) => Operation<void>;
  /** Run all currently-queued jobs sequentially with progress reporting. */
  runAnalysisQueue: () => Operation<void>;
}

export const createAudioAnalyzerSlice: AppStoreSliceCreator<
  AudioAnalyzerState & AudioAnalyzerActions
> = (set, get) => ({
  analyzeBPMPerTrack: false,
  analyzerStatus: "ready",
  audioFeatureCache: createEmptyAudioFeatureCache(),
  analyzerJobs: [],
  analyzerProgress: undefined,
  analyzerCancelRequested: false,

  setAnalyzeBPMPerTrack: (analyzeBPMPerTrack: boolean) => {
    set({ analyzeBPMPerTrack });
  },

  setAudioFeatureCache: (cache) => {
    set({ audioFeatureCache: cache });
  },

  setTrackAudioFeatures: (persistentId, features) => {
    set((state) => {
      state.audioFeatureCache.tracks[persistentId] = features;
    });
  },

  enqueueAnalysis: (trackIds) => {
    set((state) => {
      const existing = new Set(state.analyzerJobs.map((j) => j.trackId));
      for (const id of trackIds) {
        if (!existing.has(id)) {
          state.analyzerJobs.push({ trackId: id, status: "queued" });
        }
      }
      const total = state.analyzerJobs.length;
      const completed = state.analyzerJobs.filter((j) => j.status === "succeeded").length;
      const failed = state.analyzerJobs.filter((j) => j.status === "failed").length;
      state.analyzerProgress = {
        total,
        completed,
        failed,
        currentTrackId: undefined,
        etaMs: undefined,
      };
      state.analyzerCancelRequested = false;
    });
  },

  cancelAnalysisQueue: () => {
    set({ analyzerCancelRequested: true });
  },

  clearAnalysisQueue: () => {
    set({
      analyzerJobs: [],
      analyzerProgress: undefined,
      analyzerCancelRequested: false,
    });
  },

  analyzeTrack: function* (trackID: number, options) {
    try {
      yield* analyzeTrackOrThrow(set, get, { trackID, force: options?.force });
    } catch (e) {
      log.error(ClientErrors.analyzeTrackFailed(trackID, e as Error));
      set({ analyzerStatus: "ready" });
    }
  },

  analyzePlaylist: function* (playlistID: string) {
    const { libraryPlaylists } = get();
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
    get().enqueueAnalysis(trackIDs);
    yield* get().runAnalysisQueue();
  },

  runAnalysisQueue: function* () {
    const start = Date.now();
    let done = 0;
    for (;;) {
      const job = get().analyzerJobs.find((j) => j.status === "queued");
      if (job === undefined) break;
      if (get().analyzerCancelRequested) {
        set((state) => {
          for (const j of state.analyzerJobs) {
            if (j.status === "queued") j.status = "cancelled";
          }
        });
        break;
      }

      set((state) => {
        const target = state.analyzerJobs.find((j) => j.trackId === job.trackId);
        if (target !== undefined) target.status = "running";
        if (state.analyzerProgress !== undefined) {
          state.analyzerProgress.currentTrackId = job.trackId;
        }
      });

      try {
        const { audioConvertedFileURLs, convertTrackToMP3, getTrackDef } = get();
        const trackDef = getTrackDef(job.trackId);
        if (trackDef !== undefined) {
          const ready = isTrackReadyForAnalysis(trackDef, audioConvertedFileURLs);
          if (!ready) {
            yield* convertTrackToMP3(trackDef);
          }
        }
        yield* analyzeTrackOrThrow(set, get, { trackID: job.trackId });
        set((state) => {
          const target = state.analyzerJobs.find((j) => j.trackId === job.trackId);
          if (target !== undefined) target.status = "succeeded";
        });
      } catch (e) {
        const err = e as Error;
        log.error(ClientErrors.analyzeTrackFailed(job.trackId, err));
        set((state) => {
          const target = state.analyzerJobs.find((j) => j.trackId === job.trackId);
          if (target !== undefined) {
            target.status = "failed";
            target.error = err.message;
          }
        });
      } finally {
        done += 1;
        set((state) => {
          if (state.analyzerProgress === undefined) return;
          const completed = state.analyzerJobs.filter((j) => j.status === "succeeded").length;
          const failed = state.analyzerJobs.filter((j) => j.status === "failed").length;
          state.analyzerProgress.completed = completed;
          state.analyzerProgress.failed = failed;
          const elapsed = Date.now() - start;
          const perItem = elapsed / Math.max(1, done);
          const remaining = state.analyzerJobs.filter((j) => j.status === "queued").length;
          state.analyzerProgress.etaMs = remaining * perItem;
          state.analyzerProgress.currentTrackId = undefined;
        });
      }
    }
    set((state) => {
      state.analyzerCancelRequested = false;
    });
  },
});

interface AnalyzeTrackOptions {
  trackID: number;
  /**
   * Set to `true` to re-extract features for tracks that already have a cache entry. Without
   * this flag, re-running analysis is a no-op when the cache is up-to-date.
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
  const {
    audioConvertedFileURLs,
    audioFeatureCache,
    audioFilesRootFolder,
    getTrackDef,
    writeAudioFileTag,
  } = get();
  const trackDef = getTrackDef(trackID);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const signal = yield* useAbortSignal();

  if (trackDef === undefined) {
    throw new Error(ClientErrors.libraryNoTrackDefFound(trackID));
  }

  const persistentId = trackDef["Persistent ID"];
  const cached = audioFeatureCache.tracks[persistentId] as TrackAudioFeatures | undefined;
  if (!force && cached?.version === AUDIO_FEATURE_CACHE_VERSION) {
    log.debug(`[client] skipping analysis of track ${trackID.toString()} (cache hit)`);
    return;
  }

  const loadAudioBufferOptions = {
    fileOrResourceURL: audioConvertedFileURLs[trackID] ?? trackDef.Location,
    serverRootFolder: audioFilesRootFolder,
    serverPort: DEFAULT_AUDIO_FILES_SERVER_PORT,
    signal,
  };
  let features: TrackAudioFeatures;
  try {
    set({ analyzerStatus: "busy" });
    features = yield* loadAudioBufferAndExtractFeatures(loadAudioBufferOptions, trackID, {
      knownBpm: trackDef.BPM,
    });
  } catch (e) {
    set({ analyzerStatus: "ready" });
    throw new Error(ClientErrors.analyzeTrackFailed(trackID, e as Error));
  }

  // BPM continues to be persisted to the file's ID3 tag for backwards compat.
  try {
    if (trackDef.BPM !== features.bpm) {
      yield* writeAudioFileTag(trackDef, "BPM", features.bpm);
    }
    set((state) => {
      state.audioFeatureCache.tracks[persistentId] = features;
    });
    try {
      yield* getFeatureCacheClient().write({
        entries: { [persistentId]: features },
        libraryPersistentId: get().audioFeatureCache.libraryPersistentId,
      });
    } catch (err) {
      log.warn(
        `[client] failed to persist audio feature cache entry for ${persistentId}: ${(err as Error).message}`,
      );
    }
  } finally {
    set({ analyzerStatus: "ready" });
  }
}

function loadAudioBufferAndExtractFeatures(
  options: LoadAudioBufferOptions,
  trackID: number,
  extractOptions: { knownBpm?: number },
): Operation<TrackAudioFeatures> {
  return withTimeout(
    run(function* () {
      const trackAudio = yield* loadAudioBuffer(options);
      // Run the extended pipeline. If knownBpm is provided we skip BPM analysis to reuse the
      // existing tag value.
      let features: TrackAudioFeatures;
      if (extractOptions.knownBpm === undefined) {
        features = yield* extractTrackFeatures(trackAudio);
        // round BPM consistently with the previous behaviour
        features = { ...features, bpm: Math.round(features.bpm) };
        // ensure BPM was actually computed
        if (features.bpm === 0) {
          features = { ...features, bpm: Math.round(yield* analyzeBPM(trackAudio)) };
        }
      } else {
        features = yield* extractTrackFeatures(trackAudio, { knownBpm: extractOptions.knownBpm });
      }
      return features;
    }),
    ANALYZE_AUDIO_FILE_TIMEOUT,
    ClientErrors.analyzeTrackTimedOut(trackID),
  );
}
