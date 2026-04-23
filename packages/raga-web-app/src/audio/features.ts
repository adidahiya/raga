import {
  AUDIO_FEATURE_CACHE_VERSION,
  type TrackAudioFeatures,
} from "@adahiya/raga-types";
import { call, type Operation } from "effection";

import { analyzeBPM } from "./bpm";
import { computeBrightness, computeDynamics, computeRMS, rmsToEnergy } from "./energy";
import { buildFeatureVector } from "./featureVector";
import { buildChromagram, detectKeyFromChroma } from "./key";

export interface ExtractFeaturesOptions {
  /** When true, also analyze BPM. Defaults to true. */
  analyzeBpm?: boolean;
  /** Override BPM if the caller already analyzed it (e.g. from an existing tag). */
  knownBpm?: number;
}

/**
 * Run the full extended feature pipeline on a single AudioBuffer:
 *   - BPM (or use {@link ExtractFeaturesOptions.knownBpm})
 *   - Camelot key (Krumhansl-Schmuckler against a chromagram)
 *   - RMS-based energy proxy
 *   - Brightness, dynamics
 *   - Fixed-length feature vector for projection
 *
 * Operations are wrapped in `call` so they cooperate with Effection cancellation.
 */
export function* extractTrackFeatures(
  audioBuffer: AudioBuffer,
  options: ExtractFeaturesOptions = {},
): Operation<TrackAudioFeatures> {
  const samples = mixdown(audioBuffer);
  const sampleRate = audioBuffer.sampleRate;

  const bpm = yield* call(function* (): Operation<number> {
    if (options.knownBpm !== undefined) return options.knownBpm;
    if (options.analyzeBpm === false) return 0;
    return Math.round(yield* analyzeBPM(audioBuffer));
  });

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

  return {
    bpm,
    key: key.camelot,
    energy,
    vector,
    version: AUDIO_FEATURE_CACHE_VERSION,
    extractedAt: Date.now(),
  };
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
