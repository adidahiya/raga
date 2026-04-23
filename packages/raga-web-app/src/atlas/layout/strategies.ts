/**
 * Layout strategies that turn a feature matrix into 2D coordinates.
 *
 * All strategies are pure (deterministic) so they can run in a Web Worker, on the main thread,
 * or in a unit test without ceremony. Each returns coordinates in the unit square [0, 1] x
 * [0, 1] for renderer-agnostic consumption.
 */

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
      // UMAP is gated behind a feature flag; until we wire in a real implementation, fall
      // back to PCA so consumers still receive valid output.
      return { ...layoutByPCA(input), algo: "umap" };
  }
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
