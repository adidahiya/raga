import { type TrackAudioFeatures } from "@adahiya/raga-types";
import { call, type Operation, useAbortSignal } from "effection";

import type { AnalyzerWorkerRequest, AnalyzerWorkerResponse } from "./analyzerWorker";
import { analyzeBPM } from "./bpm";

interface PendingJob {
  resolve: (features: TrackAudioFeatures) => void;
  reject: (err: Error) => void;
}

let _worker: Worker | undefined;
let _nextId = 1;
const _pending = new Map<number, PendingJob>();

function getWorker(): Worker {
  if (_worker === undefined) {
    const worker = new Worker(new URL("./analyzerWorker.ts", import.meta.url), {
      type: "module",
      name: "raga-analyzer",
    });
    worker.onmessage = (event: MessageEvent<AnalyzerWorkerResponse>) => {
      const data = event.data;
      const handler = _pending.get(data.id);
      if (handler === undefined) return;
      _pending.delete(data.id);
      if (data.ok) {
        handler.resolve(data.features);
      } else {
        handler.reject(new Error(data.error));
      }
    };
    worker.onerror = (event) => {
      const err = new Error(event.message || "analyzer worker error");
      for (const handler of _pending.values()) handler.reject(err);
      _pending.clear();
    };
    worker.onmessageerror = () => {
      const err = new Error("analyzer worker message could not be deserialized");
      for (const handler of _pending.values()) handler.reject(err);
      _pending.clear();
    };
    _worker = worker;
  }
  return _worker;
}

/**
 * Tear down the active worker (if any) and reject every outstanding job. Called when an
 * Effection-driven analysis is aborted: terminating the worker is the only reliable way to
 * stop the in-flight chromagram / key math, since `postMessage` does not support cancellation.
 * The next call to {@link getWorker} will spin up a fresh dedicated worker.
 */
function terminateWorker(reason: Error): void {
  if (_worker !== undefined) {
    try {
      _worker.terminate();
    } catch {
      // ignore
    }
    _worker = undefined;
  }
  for (const handler of _pending.values()) handler.reject(reason);
  _pending.clear();
}

/**
 * Public cancel hatch: kill any in-flight analyzer worker job immediately. Used by the
 * Analyzer panel's Cancel button so the user does not have to wait for the current track to
 * finish before the queue stops.
 */
export function cancelInFlightAnalyzerJob(): void {
  if (_pending.size === 0 && _worker === undefined) return;
  terminateWorker(new Error("analysis cancelled by user"));
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
 * - Mixdown happens on the main thread because `AudioBuffer` is not structured-clone /
 *   transferable; only the resulting `Float32Array` is shipped to the worker (transferred so
 *   the underlying memory is not copied).
 * - BPM analysis stays on the main thread because `web-audio-beat-detector` requires an
 *   `AudioBuffer` and already runs its expensive work inside its own internal worker, so it
 *   doesn't block the UI either.
 * - The Effection `useAbortSignal` plumbing makes cancellation propagate through to the
 *   worker: when the surrounding task aborts, the worker is terminated and the promise is
 *   rejected so the caller can clean up.
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

function runWorkerJob(
  samples: Float32Array,
  sampleRate: number,
  bpm: number,
  signal: AbortSignal,
): Promise<TrackAudioFeatures> {
  if (signal.aborted) {
    return Promise.reject(new Error("analysis aborted"));
  }

  const id = _nextId++;
  const worker = getWorker();

  return new Promise<TrackAudioFeatures>((resolve, reject) => {
    const onAbort = () => {
      terminateWorker(new Error("analysis aborted"));
    };
    const cleanup = () => {
      signal.removeEventListener("abort", onAbort);
    };

    _pending.set(id, {
      resolve: (features) => {
        cleanup();
        resolve(features);
      },
      reject: (err) => {
        cleanup();
        reject(err);
      },
    });

    signal.addEventListener("abort", onAbort, { once: true });

    const request: AnalyzerWorkerRequest = { id, samples, sampleRate, bpm };
    worker.postMessage(request, [samples.buffer]);
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
