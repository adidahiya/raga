import { describe, expect, it } from "vitest";

import { pointInPolygon, Quadtree } from "./quadtree";

describe("Quadtree", () => {
  const points = [
    { id: "a", x: 0.1, y: 0.1 },
    { id: "b", x: 0.5, y: 0.5 },
    { id: "c", x: 0.9, y: 0.9 },
    { id: "d", x: 0.2, y: 0.8 },
  ];

  it("picks the nearest point within a radius", () => {
    const tree = Quadtree.fromPoints(points);
    expect(tree.pickPoint(0.51, 0.49, 0.05)?.id).toBe("b");
    expect(tree.pickPoint(0.6, 0.1, 0.05)).toBeUndefined();
  });

  it("returns all points inside a rectangle", () => {
    const tree = Quadtree.fromPoints(points);
    const hits = tree.pickRect({ minX: 0, minY: 0.4, maxX: 0.6, maxY: 1 });
    expect(hits.map((p) => p.id).sort()).toEqual(["b", "d"]);
  });

  it("returns all points inside a polygon", () => {
    const tree = Quadtree.fromPoints(points);
    // Triangle covering the lower-left quadrant
    const poly = [
      { x: 0, y: 0 },
      { x: 0.6, y: 0 },
      { x: 0, y: 0.6 },
    ];
    const hits = tree.pickPolygon(poly);
    expect(hits.map((p) => p.id)).toEqual(["a"]);
  });

  it("scales reasonably for many points", () => {
    const many = Array.from({ length: 5_000 }, (_, i) => ({
      id: i.toString(),
      x: Math.random(),
      y: Math.random(),
    }));
    const tree = Quadtree.fromPoints(many);
    const hits = tree.pickRect({ minX: 0.4, minY: 0.4, maxX: 0.6, maxY: 0.6 });
    // Roughly 4% of points should be in the central 20% x 20% rect
    expect(hits.length).toBeGreaterThan(50);
  });

  it("does not duplicate points sitting on split boundaries", () => {
    // Many points exactly on midX / midY would explode the tree if insertion routed each point
    // into multiple children. Exercise both the leaf cap and a deeper level to be safe.
    const onBoundary = Array.from({ length: 200 }, (_, i) => ({
      id: `b${i.toString()}`,
      x: 0.5,
      y: 0.5,
    }));
    const tree = Quadtree.fromPoints(onBoundary);
    const hits = tree.pickRect({ minX: 0.49, minY: 0.49, maxX: 0.51, maxY: 0.51 });
    expect(hits.length).toBe(onBoundary.length);
    const unique = new Set(hits.map((p) => p.id));
    expect(unique.size).toBe(onBoundary.length);
  });

  it("pointInPolygon handles convex shapes", () => {
    const square = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ];
    expect(pointInPolygon(0.5, 0.5, square)).toBe(true);
    expect(pointInPolygon(1.5, 0.5, square)).toBe(false);
  });
});
