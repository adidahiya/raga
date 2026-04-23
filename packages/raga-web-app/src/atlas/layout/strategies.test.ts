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

  it("hashes change when the matrix changes", () => {
    const a = hashFeatureSet({ algo: "pca", ids: ["a"], matrix: [[1, 2]] });
    const b = hashFeatureSet({ algo: "pca", ids: ["a"], matrix: [[1, 3]] });
    expect(a).not.toBe(b);
  });
});
