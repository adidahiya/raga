import {
  AUDIO_FEATURE_CACHE_VERSION,
  type AudioFeatureCache,
  createEmptyAudioFeatureCache,
  type TrackAudioFeatures,
} from "@adahiya/raga-types";
import { type Operation, run, spawn, type Task, useAbortSignal } from "effection";
import { Roarr as log } from "roarr";

import {
  ANALYZER_WORKER_POOL_SIZE,
  cancelInFlightAnalyzerJob,
  extractTrackFeaturesViaWorker,
} from "../../audio/analyzerWorkerClient";
import { loadAudioBuffer, type LoadAudioBufferOptions } from "../../audio/buffer";
import { getFeatureCacheClient } from "../../audio/featureCache";
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
  /**
   * Track id of one of the jobs currently running, if any. With parallel execution there may
   * be multiple running tracks; this is one representative pick (the first running job in
   * queue order). See {@link runningTrackIds} for the full set.
   */
  currentTrackId: number | undefined;
  /** Track ids of all jobs currently running. Empty when nothing is in-flight. */
  runningTrackIds: number[];
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
  /**
   * Run all currently-queued jobs concurrently with progress reporting. The number of jobs
   * processed in parallel is capped by {@link ANALYZER_WORKER_POOL_SIZE}.
   */
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
        runningTrackIds: [],
        etaMs: undefined,
      };
      state.analyzerCancelRequested = false;
    });
  },

  cancelAnalysisQueue: () => {
    set({ analyzerCancelRequested: true });
    // Kill every in-flight worker so running tracks stop immediately instead of running to
    // completion. The queue workers see analyzerCancelRequested and exit on the next tick.
    cancelInFlightAnalyzerJob();
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
    const concurrency = Math.max(1, ANALYZER_WORKER_POOL_SIZE);

    set({ analyzerStatus: "busy" });
    try {
      const tasks: Task<void>[] = [];
      for (let i = 0; i < concurrency; i++) {
        tasks.push(yield* spawn(() => runQueueWorker(set, get, start)));
      }
      for (const task of tasks) {
        yield* task;
      }
    } finally {
      set((state) => {
        state.analyzerCancelRequested = false;
        if (state.analyzerProgress !== undefined) {
          state.analyzerProgress.runningTrackIds = [];
          state.analyzerProgress.currentTrackId = undefined;
        }
      });
      set({ analyzerStatus: "ready" });
    }
  },
});

/**
 * One concurrent worker in the queue runner. Repeatedly picks the next queued job, runs it,
 * and updates progress until the queue is drained or a cancellation is requested.
 */
function* runQueueWorker(
  set: AppStoreSet,
  get: AppStoreGet,
  start: number,
): Operation<void> {
  for (;;) {
    if (get().analyzerCancelRequested) {
      set((state) => {
        for (const j of state.analyzerJobs) {
          if (j.status === "queued") j.status = "cancelled";
        }
      });
      return;
    }

    // Atomically pick the next queued job and flip it to running so a sibling worker
    // doesn't grab the same one.
    let pickedTrackId: number | undefined;
    set((state) => {
      const target = state.analyzerJobs.find((j) => j.status === "queued");
      if (target !== undefined) {
        target.status = "running";
        pickedTrackId = target.trackId;
      }
    });

    if (pickedTrackId === undefined) return;
    const trackId = pickedTrackId;

    updateAnalyzerProgress(set, start);

    try {
      const { audioConvertedFileURLs, convertTrackToMP3, getTrackDef } = get();
      const trackDef = getTrackDef(trackId);
      if (trackDef !== undefined) {
        const ready = isTrackReadyForAnalysis(trackDef, audioConvertedFileURLs);
        if (!ready) {
          yield* convertTrackToMP3(trackDef);
        }
      }
      yield* analyzeTrackBody(set, get, { trackID: trackId });
      set((state) => {
        const t = state.analyzerJobs.find((j) => j.trackId === trackId);
        if (t !== undefined) t.status = "succeeded";
      });
    } catch (e) {
      const err = e as Error;
      // Attribute failures during cancellation as cancellations rather than padding the
      // failure count.
      if (get().analyzerCancelRequested) {
        set((state) => {
          const t = state.analyzerJobs.find((j) => j.trackId === trackId);
          if (t !== undefined) t.status = "cancelled";
        });
      } else {
        log.error(ClientErrors.analyzeTrackFailed(trackId, err));
        set((state) => {
          const t = state.analyzerJobs.find((j) => j.trackId === trackId);
          if (t !== undefined) {
            t.status = "failed";
            t.error = err.message;
          }
        });
      }
    } finally {
      updateAnalyzerProgress(set, start);
    }
  }
}

/**
 * Refresh the aggregated progress fields from the current job statuses. ETA is throughput-
 * based (`elapsed / done` × `remaining`), which naturally accounts for parallel execution
 * because `elapsed / done` measures wall-time per completion, not per-track CPU time.
 */
function updateAnalyzerProgress(set: AppStoreSet, start: number): void {
  set((state) => {
    if (state.analyzerProgress === undefined) return;
    const completed = state.analyzerJobs.filter((j) => j.status === "succeeded").length;
    const failed = state.analyzerJobs.filter((j) => j.status === "failed").length;
    const running = state.analyzerJobs.filter((j) => j.status === "running");
    const queued = state.analyzerJobs.filter((j) => j.status === "queued").length;
    const done = completed + failed;
    const remaining = queued + running.length;

    state.analyzerProgress.completed = completed;
    state.analyzerProgress.failed = failed;
    state.analyzerProgress.runningTrackIds = running.map((j) => j.trackId);
    state.analyzerProgress.currentTrackId = running[0]?.trackId;

    if (done > 0 && remaining > 0) {
      const elapsed = Date.now() - start;
      state.analyzerProgress.etaMs = (elapsed / done) * remaining;
    } else {
      state.analyzerProgress.etaMs = undefined;
    }
  });
}

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

/**
 * Single-track entry point. Wraps the shared body in the legacy `analyzerStatus` busy/ready
 * toggle so callers outside the queue (the per-track Analyze button) keep their existing
 * status semantics.
 *
 * @throws
 */
function* analyzeTrackOrThrow(
  set: AppStoreSet,
  get: AppStoreGet,
  options: AnalyzeTrackOptions,
) {
  set({ analyzerStatus: "busy" });
  try {
    yield* analyzeTrackBody(set, get, options);
  } finally {
    set({ analyzerStatus: "ready" });
  }
}

/**
 * The actual analysis pipeline shared by single-track and queue-driven callers. Does NOT
 * mutate `analyzerStatus` — the queue runner manages that across the whole batch (so a job
 * finishing while siblings are still busy doesn't prematurely flip the status to "ready").
 *
 * @throws
 */
function* analyzeTrackBody(
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
    features = yield* loadAudioBufferAndExtractFeatures(loadAudioBufferOptions, trackID, {
      knownBpm: trackDef.BPM,
    });
  } catch (e) {
    throw new Error(ClientErrors.analyzeTrackFailed(trackID, e as Error));
  }

  // BPM continues to be persisted to the file's ID3 tag for backwards compat.
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
}

function loadAudioBufferAndExtractFeatures(
  options: LoadAudioBufferOptions,
  trackID: number,
  extractOptions: { knownBpm?: number },
): Operation<TrackAudioFeatures> {
  return withTimeout(
    run(function* () {
      const trackAudio = yield* loadAudioBuffer(options);
      // Heavy chromagram / key / energy / dynamics math runs in a dedicated worker so the UI
      // stays responsive between (and during) tracks. BPM analysis still happens on the main
      // thread but uses web-audio-beat-detector, which already runs in its own worker.
      return yield* extractTrackFeaturesViaWorker({
        audioBuffer: trackAudio,
        knownBpm: extractOptions.knownBpm,
      });
    }),
    ANALYZE_AUDIO_FILE_TIMEOUT,
    ClientErrors.analyzeTrackTimedOut(trackID),
  );
}
