/**
 * ATOM SHARED UTILITIES & DESIGN TOKENS
 * ======================================
 *
 * Single source of truth for ALL atom rendering utilities.
 * Every atom imports from here -- zero inline duplication.
 *
 * RULES:
 *   - This file's ONLY external import is `@/universal-canvas`
 *     (pure math substrate -- zero framework or design-system deps).
 *   - All color math, easing, spatial tokens, and alpha governance
 *     are re-exported from universal-canvas.
 *   - Atom-specific helpers (setupCanvas, advanceEntrance, drawAtmosphere,
 *     roundedRect, motionScale) live HERE, not in universal-canvas.
 *   - Atoms NEVER define their own parseColor/lerpColor/rgba/easing.
 *   - Background behavior is token-driven, not per-atom decisions.
 */

// =====================================================================
// RE-EXPORTS FROM UNIVERSAL CANVAS
// =====================================================================
// Everything atoms need from the shared math substrate.
// Atom import paths (`../atom-utils`) stay unchanged.

export {
  // Types
  type RGB,
  type AlphaTier,
  type ViewportCtx,

  // Color math
  parseColor,
  lerpColor,
  rgba,
  desaturate,

  // Numeric interpolation
  lerp,
  lerpAlpha,

  // Easing
  easeOutExpo,
  easeOutCubic,
  easeSineInOut,
  easeInOutCubic,

  // Viewport
  resolveViewport,

  // Spatial math
  px,

  // Spatial tokens
  GLOW,
  SIZE,
  FONT_SIZE,
  STROKE,
  DASH,
  PARTICLE_SIZE,
  PAD,

  // Alpha governance (canonical)
  ALPHA,
} from '@/universal-canvas';

// Import what we need locally for atom-specific helpers
import {
  type RGB,
  px, GLOW,
  lerpColor, rgba,
  easeOutExpo,
  ALPHA,
} from '@/universal-canvas';

// =====================================================================
// BACKWARD-COMPATIBLE ALPHA ALIASES
// =====================================================================
// C2 atoms import ELEMENT_ALPHA and EMPHASIS_ALPHA by name.
// These map 1:1 to ALPHA tiers -- same values, old naming.

/**
 * Standard element alpha ranges.
 * @deprecated Prefer ALPHA.content / ALPHA.atmosphere / ALPHA.background
 */
export const ELEMENT_ALPHA = {
  /** Primary interactive elements (particles, rings, lines) */
  primary:   ALPHA.content,
  /** Secondary atmospheric elements (hazes, glows) */
  secondary: ALPHA.atmosphere,
  /** Tertiary background textures (noise, vignettes) */
  tertiary:  ALPHA.background,
  /** Text / label elements */
  text:      ALPHA.text,
  /** Glow / radial gradient fills */
  glow:      ALPHA.glow,
} as const;

/**
 * Emphasis alpha tiers -- for focal elements that need to stand out.
 * @deprecated Prefer ALPHA.focal / ALPHA.accent
 */
export const EMPHASIS_ALPHA = {
  focal:  ALPHA.focal,
  accent: ALPHA.accent,
} as const;

// =====================================================================
// ATOM-SPECIFIC CONSTANTS
// =====================================================================

/**
 * Background tint alpha -- the maximum opacity an atom's background
 * fill should ever reach. This ensures composition layers always
 * show through. Atoms use: rgba(bgColor, ATOM_BG_ALPHA * entrance)
 *
 * Set to 0 for fully transparent (composition-only backgrounds).
 * Set to ~0.03 for the faintest color-story-connected tint.
 */
export const ATOM_BG_ALPHA = 0;

/**
 * Pure white for canvas mask operations — fully opaque in alpha masks.
 * Named constant so atoms never contain anonymous hex literals.
 */
export const MASK_WHITE = '#fff';

/**
 * Entrance rate for enter phase (slow, contemplative build).
 * Used as: entranceProgress += phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE
 */
export const ENTRANCE_RATE_ENTER = 0.005;

/** Entrance rate for active phase (fast warm-up). */
export const ENTRANCE_RATE_ACTIVE = 0.012;

/**
 * Motion scale -- returns 1 when animations should run, 0 when reducedMotion is on.
 * Use to multiply frame-based offsets: `Math.sin(frame * 0.03) * motionScale(p.reducedMotion)`
 */
export function motionScale(reducedMotion: boolean): number {
  return reducedMotion ? 0 : 1;
}

// =====================================================================
// STANDARD ATMOSPHERE RENDERER
// =====================================================================

/**
 * Draw the standard 2-layer atmosphere background.
 * Call once at the start of every atom's render pass, after clearRect.
 *
 * Layer 1: outer radial glow  (primaryRgb-tinted, near-transparent)
 * Layer 2: inner atmosphere   (primaryRgb-tinted, slightly warmer)
 *
 * @param ctx        Canvas context (already scaled for DPR)
 * @param cx         Center X (px)
 * @param cy         Center Y (px)
 * @param w          Logical canvas width
 * @param h          Logical canvas height
 * @param minDim     Math.min(w, h)
 * @param primaryRgb The atom's blended primary color
 * @param entrance   Eased entrance progress 0-1
 * @param glowTier   Which GLOW tier to use (default GLOW.md = 0.45)
 */
export function drawAtmosphere(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  w: number, h: number,
  minDim: number,
  primaryRgb: RGB,
  entrance: number,
  glowTier: number = GLOW.md,
): void {
  // Layer 1 -- outer glow
  const outerR = px(glowTier, minDim);
  const outer = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerR);
  outer.addColorStop(0, rgba(lerpColor([12, 10, 18], primaryRgb, 0.08), 0.03 * entrance));
  outer.addColorStop(0.6, rgba(lerpColor([8, 7, 14], primaryRgb, 0.04), 0.02 * entrance));
  outer.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = outer;
  ctx.fillRect(0, 0, w, h);

  // Layer 2 -- inner atmosphere
  const innerR = px(glowTier * 0.7, minDim);
  const inner = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR);
  inner.addColorStop(0, rgba(primaryRgb, 0.04 * entrance));
  inner.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = inner;
  ctx.fillRect(0, 0, w, h);
}

// =====================================================================
// STANDARD CANVAS SETUP
// =====================================================================

/**
 * Prepare a canvas for DPR-correct rendering.
 * Returns the logical width, height, and dpr.
 * Call at the start of each render frame.
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

// =====================================================================
// ENTRANCE HELPER
// =====================================================================

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

// =====================================================================
// SHARED DRAWING HELPERS
// =====================================================================

/**
 * Draw a rounded rectangle path (does NOT fill or stroke -- caller does that).
 * Used by multiple atoms for blocks, gauges, UI elements.
 */
export function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}