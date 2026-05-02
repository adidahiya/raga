/// <reference lib="webworker" />
import {
  AUDIO_FEATURE_CACHE_VERSION,
  type TrackAudioFeatures,
} from "@adahiya/raga-types";

import { computeBrightness, computeDynamics, computeRMS, rmsToEnergy } from "./energy";
import { buildFeatureVector } from "./featureVector";
import { buildChromagram, detectKeyFromChroma } from "./key";

export interface AnalyzerWorkerRequest {
  id: number;
  samples: Float32Array;
  sampleRate: number;
  /**
   * BPM value to use in the resulting feature vector. The main thread is responsible for
   * supplying this — either from an existing tag (knownBpm) or from the async
   * web-audio-beat-detector flow which already runs in its own internal worker.
   */
  bpm: number;
}

export interface AnalyzerWorkerSuccess {
  id: number;
  ok: true;
  features: TrackAudioFeatures;
}

export interface AnalyzerWorkerFailure {
  id: number;
  ok: false;
  error: string;
}

export type AnalyzerWorkerResponse = AnalyzerWorkerSuccess | AnalyzerWorkerFailure;

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = (event: MessageEvent<AnalyzerWorkerRequest>) => {
  const { id, samples, sampleRate, bpm } = event.data;
  try {
    const energy = rmsToEnergy(computeRMS(samples));
    const brightness = computeBrightness(samples, sampleRate);
    const dynamics = computeDynamics(samples, sampleRate);

    const chroma = buildChromagram(samples, sampleRate);
    const key = detectKeyFromChroma(chroma);

    const vector = buildFeatureVector({
      bpm,
      energy,
      key,
      brightness,
      dynamics,
    });

    const features: TrackAudioFeatures = {
      bpm,
      key: key.camelot,
      energy,
      vector,
      version: AUDIO_FEATURE_CACHE_VERSION,
      extractedAt: Date.now(),
    };

    const response: AnalyzerWorkerSuccess = { id, ok: true, features };
    ctx.postMessage(response);
  } catch (err) {
    const response: AnalyzerWorkerFailure = {
      id,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
    ctx.postMessage(response);
  }
};
