/**
 * ATOM SHARED UTILITIES
 * 
 * Standalone math substrate for all atom rendering.
 * No framework dependencies. Pure functions.
 *
 * RULE: Every atom imports from here. Zero inline duplication.
 * If you need a function in two atoms, it lives here.
 */

// ─── Types ───

export type RGB = [number, number, number];

// ─── Color Math ───

export function parseColor(hex: string): RGB {
  const h = hex.replace('#', '');
  if (h.length === 3) {
    return [
      parseInt(h[0] + h[0], 16),
      parseInt(h[1] + h[1], 16),
      parseInt(h[2] + h[2], 16),
    ];
  }
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

export function lerpColor(a: RGB, b: RGB, t: number): RGB {
  const ct = Math.max(0, Math.min(1, t));
  return [
    Math.round(a[0] + (b[0] - a[0]) * ct),
    Math.round(a[1] + (b[1] - a[1]) * ct),
    Math.round(a[2] + (b[2] - a[2]) * ct),
  ];
}

export function rgba(color: RGB, alpha: number): string {
  return `rgba(${color[0]},${color[1]},${color[2]},${Math.max(0, Math.min(1, alpha))})`;
}

export function desaturate(c: RGB, amount: number): RGB {
  const gray = Math.round(c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114);
  return lerpColor(c, [gray, gray, gray], amount);
}

// ─── Numeric ───

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// ─── Easing ───

export function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeSineInOut(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

// ─── Atom Constants ───

/** Entrance rate for enter phase (slow, contemplative) */
export const ENTRANCE_RATE_ENTER = 0.005;
/** Entrance rate for active phase (fast warm-up) */
export const ENTRANCE_RATE_ACTIVE = 0.012;

// ─── Standard Canvas Setup ───

/**
 * Prepare a canvas for DPR-correct rendering.
 * Call at the start of each render frame.
 * Returns logical dimensions and center point.
 */
export function setupCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  viewportW: number,
  viewportH: number,
): { w: number; h: number; dpr: number; cx: number; cy: number; minDim: number } {
  const dpr = window.devicePixelRatio || 1;
  const cw = Math.round(viewportW * dpr);
  const ch = Math.round(viewportH * dpr);
  if (canvas.width !== cw || canvas.height !== ch) {
    canvas.width = cw;
    canvas.height = ch;
  }
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, viewportW, viewportH);
  return {
    w: viewportW,
    h: viewportH,
    dpr,
    cx: viewportW / 2,
    cy: viewportH / 2,
    minDim: Math.min(viewportW, viewportH),
  };
}

// ─── Entrance Helper ───

/**
 * Advance entrance progress and return eased value.
 * Atoms call this once per frame.
 */
export function advanceEntrance(
  current: number,
  phase: 'enter' | 'active' | 'resolve',
): { progress: number; entrance: number } {
  const rate = phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
  const progress = Math.min(1, current + rate);
  return { progress, entrance: easeOutExpo(progress) };
}

// ─── Standard Atmosphere ───

/**
 * Draw the standard 2-layer atmosphere background.
 * Call once at the start of every atom's render pass, after clearRect.
 * This is the faintest possible tint — the glass breathing.
 */
export function drawAtmosphere(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  minDim: number,
  primaryRgb: RGB,
  entrance: number,
): void {
  const outerR = minDim * 0.45;
  const outer = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerR);
  outer.addColorStop(0, rgba(lerpColor([12, 10, 18], primaryRgb, 0.08), 0.03 * entrance));
  outer.addColorStop(0.6, rgba(lerpColor([8, 7, 14], primaryRgb, 0.04), 0.02 * entrance));
  outer.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = outer;
  ctx.fillRect(0, 0, w, h);

  const innerR = minDim * 0.32;
  const inner = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR);
  inner.addColorStop(0, rgba(primaryRgb, 0.04 * entrance));
  inner.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = inner;
  ctx.fillRect(0, 0, w, h);
}

// ─── Pointer Helpers ───

/**
 * Convert a pointer event to canvas-local coordinates.
 */
export function pointerToCanvas(
  e: PointerEvent,
  canvas: HTMLCanvasElement,
  w: number,
  h: number,
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) / rect.width * w,
    y: (e.clientY - rect.top) / rect.height * h,
  };
}