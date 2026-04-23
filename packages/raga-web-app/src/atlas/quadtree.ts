/**
 * Bare-bones quadtree for fast 2D point lookups: nearest, rectangle, and polygon queries.
 *
 * The atlas can have tens of thousands of points so we want sub-linear hit testing for hover
 * (point pick) and lasso (polygon pick) interactions. The implementation deliberately keeps
 * its API minimal and renderer-agnostic.
 */

export interface QuadtreePoint {
  id: string;
  x: number;
  y: number;
}

export interface QuadtreeBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface QuadtreeNode {
  bounds: QuadtreeBounds;
  points: QuadtreePoint[];
  children?: [QuadtreeNode, QuadtreeNode, QuadtreeNode, QuadtreeNode];
}

const NODE_CAPACITY = 8;
const MAX_DEPTH = 16;

export class Quadtree {
  private root: QuadtreeNode;

  constructor(bounds: QuadtreeBounds = { minX: 0, minY: 0, maxX: 1, maxY: 1 }) {
    this.root = makeNode(bounds);
  }

  static fromPoints(
    points: readonly QuadtreePoint[],
    bounds?: QuadtreeBounds,
  ): Quadtree {
    const tree = new Quadtree(bounds);
    for (const p of points) tree.insert(p);
    return tree;
  }

  insert(point: QuadtreePoint): void {
    insertInto(this.root, point, 0);
  }

  /** Returns the nearest point to (x, y) within radius, or undefined if none. */
  pickPoint(x: number, y: number, radius: number): QuadtreePoint | undefined {
    let best: QuadtreePoint | undefined;
    let bestDistSq = radius * radius;
    const search = (node: QuadtreeNode) => {
      if (!intersectsCircle(node.bounds, x, y, radius)) return;
      for (const p of node.points) {
        const dx = p.x - x;
        const dy = p.y - y;
        const d2 = dx * dx + dy * dy;
        if (d2 <= bestDistSq) {
          bestDistSq = d2;
          best = p;
        }
      }
      if (node.children !== undefined) {
        for (const c of node.children) search(c);
      }
    };
    search(this.root);
    return best;
  }

  /** Returns all points inside the given axis-aligned rectangle. */
  pickRect(rect: QuadtreeBounds): QuadtreePoint[] {
    const out: QuadtreePoint[] = [];
    const search = (node: QuadtreeNode) => {
      if (!intersectsRect(node.bounds, rect)) return;
      for (const p of node.points) {
        if (p.x >= rect.minX && p.x <= rect.maxX && p.y >= rect.minY && p.y <= rect.maxY) {
          out.push(p);
        }
      }
      if (node.children !== undefined) {
        for (const c of node.children) search(c);
      }
    };
    search(this.root);
    return out;
  }

  /** Returns all points inside the given (open) polygon. */
  pickPolygon(polygon: readonly { x: number; y: number }[]): QuadtreePoint[] {
    if (polygon.length < 3) return [];
    const polyBounds = polygonBounds(polygon);
    const candidates = this.pickRect(polyBounds);
    return candidates.filter((p) => pointInPolygon(p.x, p.y, polygon));
  }
}

function makeNode(bounds: QuadtreeBounds): QuadtreeNode {
  return { bounds, points: [] };
}

function insertInto(node: QuadtreeNode, point: QuadtreePoint, depth: number) {
  if (!containsPoint(node.bounds, point.x, point.y)) return;
  if (node.children === undefined) {
    if (node.points.length < NODE_CAPACITY || depth >= MAX_DEPTH) {
      node.points.push(point);
      return;
    }
    subdivide(node);
    // Re-distribute existing points: each goes to exactly one child.
    const old = node.points;
    node.points = [];
    for (const p of old) {
      const child = pickChild(node, p.x, p.y);
      insertInto(child, p, depth + 1);
    }
  }
  // Route to the single child whose half-open quadrant owns this point.
  const child = pickChild(node, point.x, point.y);
  insertInto(child, point, depth + 1);
}

/**
 * Returns the unique child node that owns (x, y). Children are laid out as
 * [NW, NE, SW, SE] using half-open partitioning on the right/bottom edges of the parent so
 * points sitting on a split line (e.g. x === midX after normalization) are not duplicated.
 */
function pickChild(node: QuadtreeNode, x: number, y: number): QuadtreeNode {
  if (node.children === undefined) {
    throw new Error("pickChild called on leaf node");
  }
  const { minX, minY, maxX, maxY } = node.bounds;
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  const right = x >= midX ? 1 : 0;
  const bottom = y >= midY ? 1 : 0;
  return node.children[bottom * 2 + right];
}

function subdivide(node: QuadtreeNode) {
  const { minX, minY, maxX, maxY } = node.bounds;
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  node.children = [
    makeNode({ minX, minY, maxX: midX, maxY: midY }),
    makeNode({ minX: midX, minY, maxX, maxY: midY }),
    makeNode({ minX, minY: midY, maxX: midX, maxY }),
    makeNode({ minX: midX, minY: midY, maxX, maxY }),
  ];
}

function containsPoint(b: QuadtreeBounds, x: number, y: number): boolean {
  return x >= b.minX && x <= b.maxX && y >= b.minY && y <= b.maxY;
}

function intersectsRect(a: QuadtreeBounds, b: QuadtreeBounds): boolean {
  return !(a.maxX < b.minX || a.minX > b.maxX || a.maxY < b.minY || a.minY > b.maxY);
}

function intersectsCircle(b: QuadtreeBounds, cx: number, cy: number, r: number): boolean {
  const closestX = Math.max(b.minX, Math.min(cx, b.maxX));
  const closestY = Math.max(b.minY, Math.min(cy, b.maxY));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy <= r * r;
}

function polygonBounds(poly: readonly { x: number; y: number }[]): QuadtreeBounds {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of poly) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY };
}

/** Standard ray-casting point-in-polygon. */
export function pointInPolygon(
  x: number,
  y: number,
  poly: readonly { x: number; y: number }[],
): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
