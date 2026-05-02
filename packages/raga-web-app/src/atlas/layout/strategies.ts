/**
 * Layout strategies that turn a feature matrix into 2D coordinates.
 *
 * All strategies are pure (deterministic) so they can run in a Web Worker, on the main thread,
 * or in a unit test without ceremony. Each returns coordinates in the unit square [0, 1] x
 * [0, 1] for renderer-agnostic consumption.
 */

import { UMAP } from "umap-js";

export type LayoutAlgo = "axis" | "pca" | "umap";

export interface LayoutParams {
  /** For "axis": indices into the feature vector to use as X and Y axes. */
  xFeature?: number;
  yFeature?: number;
  /** For "umap": tuning parameters; deferred to the implementation. */
  nNeighbors?: number;
  minDist?: number;
}

export interface LayoutInput {
  /** N x D feature matrix; one row per album. */
  matrix: number[][];
  /** Persistent album ids, indexed parallel to {@link matrix}. */
  ids: string[];
  algo: LayoutAlgo;
  params?: LayoutParams;
}

export interface LayoutPoint {
  id: string;
  x: number;
  y: number;
}

export interface LayoutResult {
  algo: LayoutAlgo;
  points: LayoutPoint[];
}

export function layout(input: LayoutInput): LayoutResult {
  switch (input.algo) {
    case "axis":
      return layoutByAxes(input);
    case "pca":
      return layoutByPCA(input);
    case "umap":
      return layoutByUMAP(input);
  }
}

/**
 * UMAP layout backed by `umap-js`. Runs synchronously inside the worker. Determinism is
 * achieved by seeding the library's random source with a value derived from the input rows
 * and ids, so identical inputs always produce identical embeddings.
 *
 * For very small input sets (where UMAP is undefined or numerically unstable) we fall back
 * to PCA so the caller still receives a sensible 2D projection.
 */
function layoutByUMAP(input: LayoutInput): LayoutResult {
  const { matrix, ids, params } = input;
  const n = matrix.length;
  if (n === 0) return { algo: "umap", points: [] };
  // UMAP needs enough points to construct a meaningful neighbour graph; below this we
  // reuse PCA, which behaves well at small N.
  if (n < 4) {
    return { ...layoutByPCA(input), algo: "umap" };
  }

  const seed = seedFromInput(matrix, ids);
  const random = mulberry32(seed);

  // Clamp nNeighbors to a valid range. umap-js requires nNeighbors < N.
  const requestedNeighbors = params?.nNeighbors ?? 15;
  const nNeighbors = Math.max(2, Math.min(requestedNeighbors, n - 1));
  const minDist = params?.minDist ?? 0.1;

  let embedding: number[][];
  try {
    const umap = new UMAP({
      nComponents: 2,
      nNeighbors,
      minDist,
      random,
    });
    embedding = umap.fit(matrix);
  } catch (err) {
    // Defensive: if umap-js throws (e.g. due to degenerate input), fall back to PCA so the
    // atlas still renders something useful instead of surfacing an opaque worker error.
    // Surface a warning so silent degradation is at least visible in the worker console.
    console.warn("[layout] UMAP fit failed, falling back to PCA:", err);
    return { ...layoutByPCA(input), algo: "umap" };
  }

  const xs = embedding.map((row) => row[0]);
  const ys = embedding.map((row) => row[1]);
  const xn = normalize(xs);
  const yn = normalize(ys);
  return {
    algo: "umap",
    points: ids.map((id, i) => ({ id, x: xn[i], y: yn[i] })),
  };
}

/**
 * Derive a 32-bit seed from the matrix + ids by mixing a small amount of content into an
 * FNV-1a-style accumulator. Cheap, stable, and good enough to disambiguate distinct inputs.
 */
function seedFromInput(matrix: number[][], ids: string[]): number {
  let h = 0x811c9dc5;
  const mix = (x: number) => {
    h ^= x | 0;
    h = Math.imul(h, 0x01000193) >>> 0;
  };
  for (const id of ids) {
    for (let i = 0; i < id.length; i++) mix(id.charCodeAt(i));
  }
  for (const row of matrix) {
    for (const v of row) mix(Math.floor(v * 1e6));
  }
  return h >>> 0;
}

/** Mulberry32 PRNG: tiny, fast, and produces a deterministic [0, 1) stream from a seed. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function layoutByAxes(input: LayoutInput): LayoutResult {
  const { matrix, ids } = input;
  const xFeature = input.params?.xFeature ?? 0;
  const yFeature = input.params?.yFeature ?? 1;
  const xs = matrix.map((row) => row[xFeature] ?? 0);
  const ys = matrix.map((row) => row[yFeature] ?? 0);
  const xn = normalize(xs);
  const yn = normalize(ys);
  return {
    algo: "axis",
    points: ids.map((id, i) => ({ id, x: xn[i], y: yn[i] })),
  };
}

function layoutByPCA(input: LayoutInput): LayoutResult {
  const { matrix, ids } = input;
  if (matrix.length === 0) return { algo: "pca", points: [] };

  const d = matrix[0].length;
  const n = matrix.length;
  // Center
  const mean = new Array<number>(d).fill(0);
  for (const row of matrix) for (let j = 0; j < d; j++) mean[j] += row[j];
  for (let j = 0; j < d; j++) mean[j] /= n;
  const centered = matrix.map((row) => row.map((v, j) => v - mean[j]));

  // Find first two principal components via simple power iteration on the covariance matrix.
  const cov = covariance(centered, d);
  const pc1 = powerIterate(cov, d);
  const pc2 = powerIterate(deflate(cov, pc1), d);

  const xs = centered.map((row) => dot(row, pc1));
  const ys = centered.map((row) => dot(row, pc2));
  const xn = normalize(xs);
  const yn = normalize(ys);
  return {
    algo: "pca",
    points: ids.map((id, i) => ({ id, x: xn[i], y: yn[i] })),
  };
}

function covariance(centered: number[][], d: number): number[][] {
  const n = centered.length;
  const out: number[][] = Array.from({ length: d }, () => new Array<number>(d).fill(0));
  for (const row of centered) {
    for (let i = 0; i < d; i++) {
      for (let j = 0; j <= i; j++) {
        const v = row[i] * row[j];
        out[i][j] += v;
        if (i !== j) out[j][i] += v;
      }
    }
  }
  const denom = Math.max(1, n - 1);
  for (let i = 0; i < d; i++) for (let j = 0; j < d; j++) out[i][j] /= denom;
  return out;
}

function powerIterate(m: number[][], d: number, iterations = 64): number[] {
  let v = new Array<number>(d).fill(0).map((_, i) => Math.cos(i + 1));
  for (let k = 0; k < iterations; k++) {
    const next = new Array<number>(d).fill(0);
    for (let i = 0; i < d; i++) {
      let s = 0;
      for (let j = 0; j < d; j++) s += m[i][j] * v[j];
      next[i] = s;
    }
    const norm = Math.sqrt(next.reduce((a, b) => a + b * b, 0)) || 1;
    v = next.map((x) => x / norm);
  }
  return v;
}

function deflate(m: number[][], v: number[]): number[][] {
  // Subtract the rank-1 component along v: M' = M - lambda * v v^T, where lambda = v^T M v.
  let lambda = 0;
  for (let i = 0; i < v.length; i++) {
    for (let j = 0; j < v.length; j++) {
      lambda += v[i] * m[i][j] * v[j];
    }
  }
  return m.map((row, i) => row.map((val, j) => val - lambda * v[i] * v[j]));
}

function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function normalize(values: number[]): number[] {
  if (values.length === 0) return values;
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (max === min) return values.map(() => 0.5);
  const span = max - min;
  return values.map((v) => (v - min) / span);
}
