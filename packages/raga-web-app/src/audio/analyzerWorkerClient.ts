import { type TrackAudioFeatures } from "@adahiya/raga-types";
import { call, type Operation, useAbortSignal } from "effection";

import type { AnalyzerWorkerRequest, AnalyzerWorkerResponse } from "./analyzerWorker";
import { analyzeBPM } from "./bpm";

interface PendingJob {
  id: number;
  resolve: (features: TrackAudioFeatures) => void;
  reject: (err: Error) => void;
}

interface PooledWorker {
  worker: Worker;
  pending?: PendingJob;
}

/**
 * Maximum number of analyzer workers to run in parallel.
 *
 * Sized to leave at least one core for the UI / audio decode work and capped at 4 so we don't
 * oversubscribe modest machines. On a typical 8-thread laptop this gives 4 concurrent
 * analyses, which empirically saturates the chromagram math without starving the main thread.
 */
export const ANALYZER_WORKER_POOL_SIZE = (() => {
  const hwc =
    typeof navigator !== "undefined" && typeof navigator.hardwareConcurrency === "number"
      ? navigator.hardwareConcurrency
      : 2;
  return Math.max(1, Math.min(4, hwc - 1));
})();

let _nextId = 1;
const _pool: PooledWorker[] = [];
const _idle: PooledWorker[] = [];
type WorkerWaiter = (worker: PooledWorker | null) => void;
const _waiters: WorkerWaiter[] = [];

function spawnWorker(): PooledWorker {
  const worker = new Worker(new URL("./analyzerWorker.ts", import.meta.url), {
    type: "module",
    name: "raga-analyzer",
  });
  const pw: PooledWorker = { worker };
  worker.onmessage = (event: MessageEvent<AnalyzerWorkerResponse>) => {
    const data = event.data;
    const job = pw.pending;
    if (job === undefined || job.id !== data.id) return;
    pw.pending = undefined;
    if (data.ok) {
      job.resolve(data.features);
    } else {
      job.reject(new Error(data.error));
    }
    releaseWorker(pw);
  };
  worker.onerror = (event) => {
    handleWorkerFailure(pw, new Error(event.message || "analyzer worker error"));
  };
  worker.onmessageerror = () => {
    handleWorkerFailure(pw, new Error("analyzer worker message could not be deserialized"));
  };
  return pw;
}

/** Reject the worker's in-flight job (if any) and remove it from the pool entirely. */
function handleWorkerFailure(pw: PooledWorker, err: Error): void {
  const job = pw.pending;
  pw.pending = undefined;
  if (job !== undefined) {
    job.reject(err);
  }
  removeWorker(pw);
}

function removeWorker(pw: PooledWorker): void {
  try {
    pw.worker.terminate();
  } catch {
    // ignore
  }
  const i = _pool.indexOf(pw);
  if (i >= 0) _pool.splice(i, 1);
  const j = _idle.indexOf(pw);
  if (j >= 0) _idle.splice(j, 1);
}

function acquireWorker(signal: AbortSignal): Promise<PooledWorker> {
  if (signal.aborted) {
    return Promise.reject(new Error("analysis aborted"));
  }
  const reused = _idle.pop();
  if (reused !== undefined) {
    return Promise.resolve(reused);
  }
  if (_pool.length < ANALYZER_WORKER_POOL_SIZE) {
    const pw = spawnWorker();
    _pool.push(pw);
    return Promise.resolve(pw);
  }
  return new Promise<PooledWorker>((resolve, reject) => {
    const waiter: WorkerWaiter = (worker) => {
      signal.removeEventListener("abort", onAbort);
      if (worker === null) {
        reject(new Error("analysis aborted"));
      } else {
        resolve(worker);
      }
    };
    const onAbort = () => {
      const idx = _waiters.indexOf(waiter);
      if (idx >= 0) _waiters.splice(idx, 1);
      reject(new Error("analysis aborted"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
    _waiters.push(waiter);
  });
}

function releaseWorker(pw: PooledWorker): void {
  // Worker may have been removed (e.g. terminated by cancellation) between dispatch and
  // completion. Don't try to reuse such a worker.
  if (!_pool.includes(pw)) return;
  const next = _waiters.shift();
  if (next !== undefined) {
    next(pw);
  } else {
    _idle.push(pw);
  }
}

/**
 * Public cancel hatch: kill all in-flight analyzer worker jobs immediately and reject any
 * waiters parked on the pool. Used by the Analyzer panel's Cancel button so the user does
 * not have to wait for currently-running tracks to finish before the queue stops.
 */
export function cancelInFlightAnalyzerJob(): void {
  if (_pool.length === 0 && _waiters.length === 0) return;
  // Snapshot waiters first because their handlers will splice the array.
  const waiters = _waiters.splice(0);
  for (const waiter of waiters) waiter(null);
  // Snapshot pool because removeWorker mutates _pool during iteration.
  for (const pw of _pool.slice()) {
    handleWorkerFailure(pw, new Error("analysis cancelled by user"));
  }
}

export interface ExtractFeaturesViaWorkerOptions {
  /** Decoded audio (decoded on the main thread; not transferable). */
  audioBuffer: AudioBuffer;
  /** When provided, BPM analysis is skipped and the supplied value is used directly. */
  knownBpm?: number;
  /** When false, BPM analysis is skipped entirely and the resulting BPM is 0. */
  analyzeBpm?: boolean;
}

/**
 * Extract a {@link TrackAudioFeatures} payload from an in-memory {@link AudioBuffer}, doing
 * the heavy chromagram / key / energy / dynamics / feature-vector math in a dedicated worker
 * so the UI thread stays responsive.
 *
 * Multiple calls run in parallel up to {@link ANALYZER_WORKER_POOL_SIZE} concurrent workers;
 * any extra calls park on the pool and resume as workers free up. Workers are reused across
 * jobs to amortize spawn cost when analyzing large libraries.
 *
 * - Mixdown happens on the main thread because `AudioBuffer` is not structured-clone /
 *   transferable; only the resulting `Float32Array` is shipped to the worker (transferred so
 *   the underlying memory is not copied).
 * - BPM analysis stays on the main thread because `web-audio-beat-detector` requires an
 *   `AudioBuffer` and already runs its expensive work inside its own internal worker, so it
 *   doesn't block the UI either.
 * - The Effection `useAbortSignal` plumbing makes cancellation propagate through to the
 *   worker: when the surrounding task aborts, the worker carrying this job is terminated and
 *   the promise is rejected so the caller can clean up.
 */
export function* extractTrackFeaturesViaWorker(
  options: ExtractFeaturesViaWorkerOptions,
): Operation<TrackAudioFeatures> {
  const samples = mixdown(options.audioBuffer);
  // NB: preserve previous behavior — chromagram pitch frequencies are computed against the
  // original AudioBuffer sample rate, not the decimated rate.
  const sampleRate = options.audioBuffer.sampleRate;

  let bpm = 0;
  if (options.knownBpm !== undefined) {
    bpm = Math.round(options.knownBpm);
  } else if (options.analyzeBpm !== false) {
    bpm = Math.round(yield* analyzeBPM(options.audioBuffer));
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const signal = yield* useAbortSignal();
  return yield* call(() => runWorkerJob(samples, sampleRate, bpm, signal));
}

async function runWorkerJob(
  samples: Float32Array,
  sampleRate: number,
  bpm: number,
  signal: AbortSignal,
): Promise<TrackAudioFeatures> {
  // acquireWorker already short-circuits on a pre-aborted signal and rejects parked waiters
  // when the signal aborts mid-wait, so we don't need a separate aborted check here.
  const pw = await acquireWorker(signal);
  if (signal.aborted) {
    // Tiny race: caller aborted between acquireWorker resolving and us getting control.
    // Release the worker without dispatch so a sibling job can pick it up.
    releaseWorker(pw);
    throw new Error("analysis aborted");
  }

  const id = _nextId++;
  return new Promise<TrackAudioFeatures>((resolve, reject) => {
    const onAbort = () => {
      // Terminate the worker carrying this job so its CPU work stops immediately. The
      // Promise rejection is delivered via handleWorkerFailure → pending.reject.
      handleWorkerFailure(pw, new Error("analysis aborted"));
    };
    pw.pending = {
      id,
      resolve: (features) => {
        signal.removeEventListener("abort", onAbort);
        resolve(features);
      },
      reject: (err) => {
        signal.removeEventListener("abort", onAbort);
        reject(err);
      },
    };
    signal.addEventListener("abort", onAbort, { once: true });
    const request: AnalyzerWorkerRequest = { id, samples, sampleRate, bpm };
    pw.worker.postMessage(request, [samples.buffer]);
  });
}

/** Mixdown stereo (or N-channel) audio to a mono Float32Array, downsampled to ~22kHz for speed. */
function mixdown(audioBuffer: AudioBuffer): Float32Array {
  const channels: Float32Array[] = [];
  for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
    channels.push(audioBuffer.getChannelData(c));
  }
  const length = channels[0].length;
  const targetRate = 22_050;
  const decim = Math.max(1, Math.floor(audioBuffer.sampleRate / targetRate));
  const out = new Float32Array(Math.floor(length / decim));
  for (let i = 0, j = 0; j < out.length; i += decim, j++) {
    let sum = 0;
    for (const ch of channels) sum += ch[i];
    out[j] = sum / channels.length;
  }
  return out;
}
