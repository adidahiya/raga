import { AUDIO_FEATURE_VECTOR_LENGTH, type CamelotKey } from "@adahiya/raga-types";

import type { DetectedKey } from "./key";

export interface FeatureVectorInput {
  bpm: number;
  energy: number;
  key: DetectedKey;
  brightness: number;
  dynamics: number;
  /** Optional harmonicity (0-1). Defaults to 0.5 if omitted. */
  harmonicity?: number;
}

/**
 * Build a fixed-length, projection-ready feature vector from the per-track features.
 *
 * Layout (length {@link AUDIO_FEATURE_VECTOR_LENGTH}):
 *   [bpmNorm, energy, keyTonicSin, keyTonicCos, keyMode, brightness, dynamics, harmonicity]
 *
 * - bpmNorm:    BPM normalized into [0, 1] over [60, 200]
 * - energy:     [0, 1]
 * - keyTonicSin/Cos: position on the chromatic circle so distance is musically meaningful
 * - keyMode:    0 for minor, 1 for major
 * - brightness: [0, 1]
 * - dynamics:   [0, 1]
 * - harmonicity: [0, 1]
 */
export function buildFeatureVector(input: FeatureVectorInput): number[] {
  const bpmNorm = clamp01((input.bpm - 60) / 140);
  const tonicAngle = (input.key.tonic / 12) * 2 * Math.PI;
  const vec = [
    bpmNorm,
    clamp01(input.energy),
    Math.sin(tonicAngle),
    Math.cos(tonicAngle),
    input.key.mode === "major" ? 1 : 0,
    clamp01(input.brightness),
    clamp01(input.dynamics),
    clamp01(input.harmonicity ?? 0.5),
  ];
  if (vec.length !== AUDIO_FEATURE_VECTOR_LENGTH) {
    throw new Error(
      `feature vector length mismatch: expected ${AUDIO_FEATURE_VECTOR_LENGTH.toString()}, got ${vec.length.toString()}`,
    );
  }
  return vec;
}

function clamp01(x: number): number {
  if (Number.isNaN(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

/**
 * Convert a Camelot key string back into the (tonic, mode) pair. Helpful for hydrating cached
 * features into the {@link DetectedKey} shape used by {@link buildFeatureVector}.
 */
export function camelotToTonicMode(camelot: CamelotKey): { tonic: number; mode: "major" | "minor" } {
  const match = /^([0-9]{1,2})([AB])$/.exec(camelot);
  if (match === null) throw new Error(`invalid Camelot key: ${camelot}`);
  const wheel = Number.parseInt(match[1], 10);
  const mode = match[2] === "B" ? "major" : "minor";
  // Invert the Camelot table: find pitch class whose major/minor wheel position matches.
  // C major = 8B, C# = 3B, D = 10B, D# = 5B, E = 12B, F = 7B, F# = 2B,
  // G = 9B, G# = 4B, A = 11B, A# = 6B, B = 1B
  const majorWheelToPc: Record<number, number> = {
    8: 0, 3: 1, 10: 2, 5: 3, 12: 4, 7: 5, 2: 6, 9: 7, 4: 8, 11: 9, 6: 10, 1: 11,
  };
  // Minor uses A; offset by 3 wheel positions from its parallel major's wheel.
  // C minor = 5A, C#m = 12A, Dm = 7A, D#m = 2A, Em = 9A, Fm = 4A, F#m = 11A,
  // Gm = 6A, G#m = 1A, Am = 8A, A#m = 3A, Bm = 10A
  const minorWheelToPc: Record<number, number> = {
    5: 0, 12: 1, 7: 2, 2: 3, 9: 4, 4: 5, 11: 6, 6: 7, 1: 8, 8: 9, 3: 10, 10: 11,
  };
  const table = mode === "major" ? majorWheelToPc : minorWheelToPc;
  if (!(wheel in table)) throw new Error(`invalid Camelot wheel position: ${camelot}`);
  return { tonic: table[wheel], mode };
}
