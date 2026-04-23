/** Compute root-mean-square amplitude for a sample buffer. */
export function computeRMS(samples: Float32Array): number {
  if (samples.length === 0) return 0;
  let sum = 0;
  for (const s of samples) {
    sum += s * s;
  }
  return Math.sqrt(sum / samples.length);
}

/**
 * Compute a [0, 1] energy proxy from RMS amplitude. Approximates loudness perception with a
 * mild compression curve so very quiet tracks register above zero and very loud tracks don't
 * saturate.
 */
export function rmsToEnergy(rms: number): number {
  // Map RMS -> approximate dBFS, then compress to [0, 1] over the typical music range
  // [-40 dB, 0 dB].
  const db = 20 * Math.log10(Math.max(rms, 1e-6));
  const normalized = (db + 40) / 40;
  return Math.max(0, Math.min(1, normalized));
}

/**
 * Spectral brightness proxy in [0, 1]: ratio of high-frequency RMS to total RMS. Computed
 * cheaply with a one-pole high-pass filter rather than a full FFT.
 */
export function computeBrightness(samples: Float32Array, sampleRate: number): number {
  if (samples.length === 0) return 0;
  // High-pass cutoff at ~2 kHz
  const cutoff = 2000;
  const rc = 1 / (2 * Math.PI * cutoff);
  const dt = 1 / sampleRate;
  const alpha = rc / (rc + dt);
  let prevSample = samples[0];
  let prevHp = 0;
  let hpSumSq = 0;
  let totalSumSq = 0;
  for (const x of samples) {
    const hp = alpha * (prevHp + x - prevSample);
    hpSumSq += hp * hp;
    totalSumSq += x * x;
    prevHp = hp;
    prevSample = x;
  }
  if (totalSumSq === 0) return 0;
  return Math.sqrt(hpSumSq / totalSumSq);
}

/**
 * Dynamics proxy: normalized standard deviation of frame RMS values. Higher = more dynamic
 * range, lower = more compressed.
 */
export function computeDynamics(samples: Float32Array, sampleRate: number): number {
  if (samples.length === 0) return 0;
  const frameSize = Math.max(1, Math.floor(sampleRate * 0.05));
  const frames: number[] = [];
  for (let i = 0; i + frameSize <= samples.length; i += frameSize) {
    let sum = 0;
    for (let j = 0; j < frameSize; j++) {
      const x = samples[i + j];
      sum += x * x;
    }
    frames.push(Math.sqrt(sum / frameSize));
  }
  if (frames.length === 0) return 0;
  const mean = frames.reduce((a, b) => a + b, 0) / frames.length;
  if (mean === 0) return 0;
  let variance = 0;
  for (const v of frames) variance += (v - mean) * (v - mean);
  variance /= frames.length;
  return Math.min(1, Math.sqrt(variance) / mean);
}
