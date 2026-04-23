import {
  type AtlasRenderBackend,
  type AtlasRenderOptions,
  type AtlasRenderPoint,
  type AtlasViewport,
  projectToPixels,
} from "./backend";

export class Canvas2DBackend implements AtlasRenderBackend {
  private ctx: CanvasRenderingContext2D;
  private dpr = 1;
  private width = 0;
  private height = 0;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (ctx === null) throw new Error("[AtlasCanvas] failed to acquire 2D context");
    this.ctx = ctx;
  }

  resize(width: number, height: number, devicePixelRatio: number): void {
    this.dpr = devicePixelRatio;
    this.width = width;
    this.height = height;
    this.canvas.width = Math.round(width * devicePixelRatio);
    this.canvas.height = Math.round(height * devicePixelRatio);
    this.canvas.style.width = `${width.toString()}px`;
    this.canvas.style.height = `${height.toString()}px`;
  }

  draw(
    points: readonly AtlasRenderPoint[],
    viewport: AtlasViewport,
    options: AtlasRenderOptions = {},
  ): void {
    const { ctx, dpr } = this;
    ctx.save();
    ctx.scale(dpr, dpr);
    if (options.background !== undefined) {
      ctx.fillStyle = options.background;
      ctx.fillRect(0, 0, this.width, this.height);
    } else {
      ctx.clearRect(0, 0, this.width, this.height);
    }

    const highlight = options.highlightColor ?? "rgba(255, 255, 255, 0.7)";

    for (const p of points) {
      if (p.emphasized === true) continue;
      drawPoint(ctx, p, viewport);
    }
    for (const p of points) {
      if (p.emphasized !== true) continue;
      drawPoint(ctx, p, viewport);
      const { px, py } = projectToPixels(p.x, p.y, viewport);
      ctx.beginPath();
      ctx.arc(px, py, p.r * viewport.zoom + 6, 0, 2 * Math.PI);
      ctx.strokeStyle = highlight;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
  }

  dispose(): void {
    // Nothing to dispose for Canvas2D.
  }
}

function drawPoint(
  ctx: CanvasRenderingContext2D,
  p: AtlasRenderPoint,
  viewport: AtlasViewport,
) {
  const { px, py } = projectToPixels(p.x, p.y, viewport);
  ctx.beginPath();
  ctx.arc(px, py, Math.max(0.5, p.r * viewport.zoom), 0, 2 * Math.PI);
  ctx.fillStyle = p.color;
  ctx.globalAlpha = p.opacity ?? 1;
  ctx.fill();
  ctx.globalAlpha = 1;
}
