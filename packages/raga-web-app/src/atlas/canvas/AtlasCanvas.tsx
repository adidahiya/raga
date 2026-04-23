import { useEffect, useMemo, useRef } from "react";

import { Quadtree, type QuadtreePoint } from "../quadtree";
import {
  type AtlasRenderBackend,
  type AtlasRenderOptions,
  type AtlasRenderPoint,
  type AtlasViewport,
  unprojectFromPixels,
} from "./backend";
import { Canvas2DBackend } from "./canvas2dBackend";

export interface AtlasCanvasProps {
  points: readonly AtlasRenderPoint[];
  viewport: AtlasViewport;
  emphasizedIds?: ReadonlySet<string>;
  options?: AtlasRenderOptions;
  /** Pixel radius around the cursor used for hit-testing. Defaults to 8. */
  hitRadius?: number;
  onHover?: (id: string | undefined) => void;
  onSelect?: (id: string | undefined, event: { metaKey: boolean; ctrlKey: boolean; shiftKey: boolean }) => void;
  /** Inject a custom backend; defaults to Canvas2D. Useful for tests / WebGL swap-in later. */
  createBackend?: (canvas: HTMLCanvasElement) => AtlasRenderBackend;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Headless atlas render surface.
 *
 * Owns nothing about chrome, axis pickers, peek panels, etc. Takes a list of points and a
 * viewport, draws them via a swappable backend, and reports hover/click events with the
 * picked id (looked up via a quadtree). Consumers wire it into the atlas slice.
 */
export function AtlasCanvas({
  points,
  viewport,
  emphasizedIds,
  options,
  hitRadius = 8,
  onHover,
  onSelect,
  createBackend,
  className,
  style,
}: AtlasCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const backendRef = useRef<AtlasRenderBackend | null>(null);

  const renderPoints = useMemo<AtlasRenderPoint[]>(() => {
    if (emphasizedIds === undefined) return points.slice();
    return points.map((p) => ({ ...p, emphasized: emphasizedIds.has(p.id) }));
  }, [points, emphasizedIds]);

  const quadtree = useMemo(() => {
    const qpts: QuadtreePoint[] = points.map((p) => ({ id: p.id, x: p.x, y: p.y }));
    return Quadtree.fromPoints(qpts, { minX: -1, minY: -1, maxX: 2, maxY: 2 });
  }, [points]);

  // Init backend
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    backendRef.current = createBackend !== undefined ? createBackend(canvas) : new Canvas2DBackend(canvas);
    return () => {
      backendRef.current?.dispose();
      backendRef.current = null;
    };
  }, [createBackend]);

  // Resize + draw on viewport / points change
  useEffect(() => {
    const backend = backendRef.current;
    if (backend === null) return;
    const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio;
    backend.resize(viewport.width, viewport.height, dpr);
    backend.draw(renderPoints, viewport, options);
  }, [renderPoints, viewport, options]);

  // Hit-test in unit space using the quadtree
  const pickFromEvent = (event: React.PointerEvent<HTMLCanvasElement>): string | undefined => {
    const canvas = canvasRef.current;
    if (canvas === null) return undefined;
    const rect = canvas.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    const { x, y } = unprojectFromPixels(px, py, viewport);
    // Convert hitRadius from pixels to unit space using the smaller axis to avoid stretching.
    const denom = Math.min(viewport.width, viewport.height) * viewport.zoom;
    const radius = hitRadius / denom;
    return quadtree.pickPoint(x, y, radius)?.id;
  };

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={style}
      onPointerMove={(e) => {
        if (onHover === undefined) return;
        onHover(pickFromEvent(e));
      }}
      onPointerLeave={() => onHover?.(undefined)}
      onClick={(e) => {
        if (onSelect === undefined) return;
        const id = pickFromEvent(e as unknown as React.PointerEvent<HTMLCanvasElement>);
        onSelect(id, { metaKey: e.metaKey, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey });
      }}
    />
  );
}
AtlasCanvas.displayName = "AtlasCanvas";
