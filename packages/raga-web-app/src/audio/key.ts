import { CAMELOT_WHEEL, type CamelotKey } from "@adahiya/raga-types";

/**
 * Krumhansl-Schmuckler tonality profiles for major and minor keys, derived from listener
 * judgements of how well each pitch class fits within a key context.
 */
const KS_MAJOR = [
  6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88,
];
const KS_MINOR = [
  6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17,
];

const PITCH_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

export interface DetectedKey {
  /** Pitch class index, 0 = C, 1 = C#, ... */
  tonic: number;
  /** "major" | "minor" */
  mode: "major" | "minor";
  /** Camelot wheel notation, e.g. "8B" for C major. */
  camelot: CamelotKey;
  /** Pearson correlation against the winning template, in [-1, 1]. */
  confidence: number;
}

/**
 * Build a 12-bin chromagram from an audio buffer by binning the magnitude spectrum into pitch
 * classes. Operates on a downsampled mono mixdown for speed.
 */
export function buildChromagram(
  samples: Float32Array,
  sampleRate: number,
  fftSize = 4096,
): number[] {
  const chroma = new Array<number>(12).fill(0);
  if (samples.length === 0) return chroma;

  const hop = Math.max(1, Math.floor(fftSize / 2));
  const window = new Float32Array(fftSize);
  for (let i = 0; i < fftSize; i++) {
    // Hann window
    window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));
  }

  const a4 = 440;
  const refMidi = 69; // A4

  // Use a naive DFT magnitude estimator on each frame, only at the bin frequencies we care
  // about (one per pitch class across several octaves). This is much cheaper than a full FFT.
  const pitchFreqs: { pc: number; freq: number }[] = [];
  for (let midi = 36; midi <= 96; midi++) {
    const freq = a4 * Math.pow(2, (midi - refMidi) / 12);
    if (freq * 2 < sampleRate) {
      pitchFreqs.push({ pc: midi % 12, freq });
    }
  }

  const numFrames = Math.max(1, Math.floor((samples.length - fftSize) / hop));
  for (let f = 0; f < numFrames; f++) {
    const start = f * hop;
    for (const { pc, freq } of pitchFreqs) {
      // Goertzel-style real DFT for a single frequency bin
      const omega = (2 * Math.PI * freq) / sampleRate;
      const cosw = Math.cos(omega);
      const coeff = 2 * cosw;
      let s0 = 0;
      let s1 = 0;
      let s2 = 0;
      for (let i = 0; i < fftSize; i++) {
        const x = samples[start + i] * window[i];
        s0 = x + coeff * s1 - s2;
        s2 = s1;
        s1 = s0;
      }
      const power = s1 * s1 + s2 * s2 - coeff * s1 * s2;
      chroma[pc] += Math.max(0, power);
    }
  }

  // L1 normalize
  const sum = chroma.reduce((a, b) => a + b, 0);
  if (sum > 0) {
    for (let i = 0; i < 12; i++) chroma[i] /= sum;
  }
  return chroma;
}

function correlate(a: number[], b: number[]): number {
  const n = a.length;
  let aMean = 0;
  let bMean = 0;
  for (let i = 0; i < n; i++) {
    aMean += a[i];
    bMean += b[i];
  }
  aMean /= n;
  bMean /= n;
  let num = 0;
  let aVar = 0;
  let bVar = 0;
  for (let i = 0; i < n; i++) {
    const ad = a[i] - aMean;
    const bd = b[i] - bMean;
    num += ad * bd;
    aVar += ad * ad;
    bVar += bd * bd;
  }
  const denom = Math.sqrt(aVar * bVar);
  return denom === 0 ? 0 : num / denom;
}

function rotate(arr: number[], by: number): number[] {
  const n = arr.length;
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) out[i] = arr[(i + by) % n];
  return out;
}

/**
 * Match a chromagram against the Krumhansl-Schmuckler key profiles to find the best key.
 */
export function detectKeyFromChroma(chroma: number[]): DetectedKey {
  let best: DetectedKey = { tonic: 0, mode: "major", camelot: "8B", confidence: -Infinity };
  for (let tonic = 0; tonic < 12; tonic++) {
    const major = correlate(chroma, rotate(KS_MAJOR, -tonic));
    const minor = correlate(chroma, rotate(KS_MINOR, -tonic));
    if (major > best.confidence) {
      const wheel = CAMELOT_WHEEL[tonic].B;
      best = { tonic, mode: "major", camelot: `${wheel.toString()}B` as CamelotKey, confidence: major };
    }
    if (minor > best.confidence) {
      const wheel = CAMELOT_WHEEL[tonic].A;
      best = { tonic, mode: "minor", camelot: `${wheel.toString()}A` as CamelotKey, confidence: minor };
    }
  }
  return best;
}

export function pitchName(pc: number): string {
  return PITCH_NAMES[((pc % 12) + 12) % 12];
}
