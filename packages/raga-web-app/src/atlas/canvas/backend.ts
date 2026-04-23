/**
 * Backend interface for the {@link AtlasCanvas} surface. The Canvas2D backend ships today; a
 * future WebGL backend can drop in by implementing this interface, no consumer changes
 * required.
 */
export interface AtlasViewport {
  /** Pan offset in unit coordinates [0, 1]. */
  panX: number;
  panY: number;
  /** Zoom multiplier. 1 = fit-to-square, >1 = zoomed in. */
  zoom: number;
  /** Width / height of the surface in CSS pixels. */
  width: number;
  height: number;
}

export interface AtlasRenderPoint {
  id: string;
  x: number;
  y: number;
  /** Marker radius in CSS pixels at zoom = 1. Will be scaled with viewport.zoom. */
  r: number;
  color: string;
  opacity?: number;
  /** When true, highlight this point (selected / hovered). */
  emphasized?: boolean;
}

export interface AtlasRenderOptions {
  background?: string;
  /** Color for the highlight ring around emphasized points. */
  highlightColor?: string;
}

export interface AtlasRenderBackend {
  /** Resize the underlying surface, including HiDPI scaling. */
  resize(width: number, height: number, devicePixelRatio: number): void;
  /** Draw a frame using the supplied points + viewport. */
  draw(
    points: readonly AtlasRenderPoint[],
    viewport: AtlasViewport,
    options?: AtlasRenderOptions,
  ): void;
  /** Release any resources owned by the backend. */
  dispose(): void;
}

/** Map a unit-square coord to canvas-pixel space, accounting for pan + zoom. */
export function projectToPixels(
  x: number,
  y: number,
  viewport: AtlasViewport,
): { px: number; py: number } {
  const cx = (x - viewport.panX) * viewport.zoom * viewport.width;
  const cy = (y - viewport.panY) * viewport.zoom * viewport.height;
  return { px: cx, py: cy };
}

/** Inverse of {@link projectToPixels}: pixel space -> unit coords. */
export function unprojectFromPixels(
  px: number,
  py: number,
  viewport: AtlasViewport,
): { x: number; y: number } {
  return {
    x: px / (viewport.zoom * viewport.width) + viewport.panX,
    y: py / (viewport.zoom * viewport.height) + viewport.panY,
  };
}
