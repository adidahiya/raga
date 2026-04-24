import { describe, expect, it } from "vitest";

import { hashFeatureSet } from "./hash";
import { layout } from "./strategies";

describe("layout strategies", () => {
  it("axis preset projects requested feature dims into [0, 1]", () => {
    const result = layout({
      algo: "axis",
      ids: ["a", "b", "c"],
      matrix: [
        [0, 0],
        [0.5, 0.5],
        [1, 1],
      ],
      params: { xFeature: 0, yFeature: 1 },
    });
    expect(result.points.map((p) => p.x)).toEqual([0, 0.5, 1]);
    expect(result.points.map((p) => p.y)).toEqual([0, 0.5, 1]);
  });

  it("pca produces deterministic 2D coordinates in [0, 1]", () => {
    const ids = Array.from({ length: 20 }, (_, i) => `id${i.toString()}`);
    const matrix = ids.map((_, i) => [
      Math.cos(i),
      Math.sin(i),
      i / 20,
      i % 2,
    ]);
    const result = layout({ algo: "pca", ids, matrix });
    expect(result.points).toHaveLength(20);
    for (const p of result.points) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(1);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(1);
    }
    // determinism: same input -> same output
    const second = layout({ algo: "pca", ids, matrix });
    expect(result.points).toEqual(second.points);
  });

  it("umap produces deterministic 2D coordinates in [0, 1] that differ from PCA", () => {
    const ids = Array.from({ length: 60 }, (_, i) => `id${i.toString()}`);
    // Two well-separated Gaussian-ish clusters in 5D so PCA and UMAP both have signal,
    // but UMAP's non-linear projection should land somewhere visibly different.
    const matrix = ids.map((_, i) => {
      const cluster = i % 2 === 0 ? 0 : 1;
      const base = cluster === 0 ? 0 : 5;
      return [
        base + Math.cos(i),
        base + Math.sin(i),
        base + (i % 7) / 7,
        base + (i % 5) / 5,
        base + (i % 3) / 3,
      ];
    });

    const umap = layout({ algo: "umap", ids, matrix, params: { nNeighbors: 8 } });
    expect(umap.algo).toBe("umap");
    expect(umap.points).toHaveLength(60);
    for (const p of umap.points) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(1);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(1);
    }

    // Determinism: identical input -> identical output.
    const umapAgain = layout({ algo: "umap", ids, matrix, params: { nNeighbors: 8 } });
    expect(umap.points).toEqual(umapAgain.points);

    // Differs from PCA: at least some points should land in different positions.
    const pca = layout({ algo: "pca", ids, matrix });
    const differences = umap.points.reduce((acc, p, i) => {
      const dx = p.x - pca.points[i].x;
      const dy = p.y - pca.points[i].y;
      return acc + Math.sqrt(dx * dx + dy * dy);
    }, 0);
    expect(differences).toBeGreaterThan(1);
  });

  it("umap falls back gracefully for tiny inputs", () => {
    const result = layout({
      algo: "umap",
      ids: ["a", "b"],
      matrix: [
        [0, 0, 0],
        [1, 1, 1],
      ],
    });
    expect(result.algo).toBe("umap");
    expect(result.points).toHaveLength(2);
  });

  it("hashes change when the matrix changes", () => {
    const a = hashFeatureSet({ algo: "pca", ids: ["a"], matrix: [[1, 2]] });
    const b = hashFeatureSet({ algo: "pca", ids: ["a"], matrix: [[1, 3]] });
    expect(a).not.toBe(b);
  });
});
