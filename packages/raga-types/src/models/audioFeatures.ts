/** Current schema version for the persisted audio feature cache. */
export const AUDIO_FEATURE_CACHE_VERSION = 1;

/** Length of the projection-ready feature vector emitted per track. */
export const AUDIO_FEATURE_VECTOR_LENGTH = 8;

/**
 * Camelot wheel notation, e.g. "8B" for C major or "5A" for C minor.
 * The integer is the wheel position [1, 12]; the letter is the mode (A = minor, B = major).
 */
export type CamelotKey = `${number}A` | `${number}B`;

/**
 * Per-track audio analysis output. All numeric ranges are normalized to [0, 1] unless otherwise
 * noted, so they're safe to feed directly into a layout / projection pipeline.
 */
export interface TrackAudioFeatures {
  /** Beats per minute, rounded. */
  bpm: number;
  /** Musical key in Camelot notation. */
  key: CamelotKey;
  /** Energy proxy in [0, 1] derived from RMS / spectral content. */
  energy: number;
  /**
   * Fixed-length, projection-ready feature vector. Currently:
   *   [bpmNorm, energy, keyTonicSin, keyTonicCos, keyMode, brightness, dynamics, harmonicity]
   * All entries are in [-1, 1] or [0, 1]. Length is {@link AUDIO_FEATURE_VECTOR_LENGTH}.
   */
  vector: number[];
  /** Schema version of the extractor that produced this entry. */
  version: number;
  /** Unix timestamp (ms) when this entry was produced. */
  extractedAt: number;
}

/**
 * Versioned sidecar JSON cache, keyed by track Persistent ID. This is loaded once per library
 * open and updated incrementally as analysis completes; the writer never throws away keys it
 * doesn't recognize, so older / unknown versions round-trip safely.
 */
export interface AudioFeatureCache {
  version: typeof AUDIO_FEATURE_CACHE_VERSION;
  /** Persistent ID of the originating library, if known. */
  libraryPersistentId?: string;
  /** Map of track Persistent ID -> features. */
  tracks: Record<string, TrackAudioFeatures>;
}

export function createEmptyAudioFeatureCache(libraryPersistentId?: string): AudioFeatureCache {
  return {
    version: AUDIO_FEATURE_CACHE_VERSION,
    libraryPersistentId,
    tracks: {},
  };
}

/** Camelot wheel positions for each pitch class index, indexed by [pitchClass][modeIndex]. */
export const CAMELOT_WHEEL: Readonly<Record<number, Readonly<{ A: number; B: number }>>> = {
  // pitch class 0 = C
  0: { B: 8, A: 5 },
  1: { B: 3, A: 12 },
  2: { B: 10, A: 7 },
  3: { B: 5, A: 2 },
  4: { B: 12, A: 9 },
  5: { B: 7, A: 4 },
  6: { B: 2, A: 11 },
  7: { B: 9, A: 6 },
  8: { B: 4, A: 1 },
  9: { B: 11, A: 8 },
  10: { B: 6, A: 3 },
  11: { B: 1, A: 10 },
};
