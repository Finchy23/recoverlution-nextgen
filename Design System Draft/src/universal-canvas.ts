/**
 * UNIVERSAL CANVAS
 * ================
 *
 * The shared mathematical substrate for every visual layer in Recoverlution.
 * Pure math. Zero framework imports. Zero design-system imports.
 *
 * Everything that renders visually — atoms, engine renderers, atmosphere
 * overlays, transitions, entrance choreography — imports spatial tokens,
 * color math, alpha governance, and easing from HERE.
 *
 * CONSUMERS:
 *   atom-utils.ts         re-exports everything + adds atom-specific helpers
 *   EngineRenderers.tsx    imports parseColor, rgba, px, PARTICLE_SIZE, STROKE
 *   Particles.tsx          imports px, PARTICLE_SIZE, ALPHA
 *   DeviceMirror.tsx       imports parseColor, rgba, px, GLOW
 *   Overview.tsx           imports parseColor, rgba, px, GLOW, PARTICLE_SIZE
 *   NaviCueCompositor.tsx  Z-layer comments reference ALPHA tiers
 *   AtomsLibrary.tsx       Z-layer comments reference ALPHA tiers
 *   SurfacesWorkspace.tsx  Z-layer comments reference ALPHA tiers
 *
 * RULES:
 *   - This file imports NOTHING. It is the leaf of the dependency tree.
 *   - Every spatial dimension is a fraction of `minDim` (viewport short edge).
 *   - Every alpha value lives in a named tier. No magic numbers.
 *   - Every color flows as an RGB tuple, never a hex string.
 *
 * Z-LAYER ALPHA HIERARCHY:
 *   Z-0  Solid base (the void)                      opaque
 *   Z-1  Engine background elements                  ALPHA.background  (.005–.03)
 *   Z-2  Color signature ambient light               ALPHA.atmosphere  (.01–.06)
 *   Z-3  Atom secondary elements (hazes, guides)     ALPHA.content     (.04–.12)
 *   Z-4  Atom primary elements (interactive hero)    ALPHA.focal       (.10–.22)
 *   Z-5  Resolution / peak moments                   ALPHA.accent      (.14–.30)
 *   Z-6  Voice text overlay                          ALPHA.text        (.04–.10)
 *        Radial glow fills (any layer)               ALPHA.glow        (.01–.08)
 *
 * NAVICUE LIFECYCLE:
 *   Previous NaviCue                   Current NaviCue
 *     resolve ── TRANSITION ── enter ── active ── resolve ── TRANSITION ──
 *                  t: 0-1     entrance: 0-1                    t: 0-1
 *
 *   During transition, every layer interpolates independently:
 *     Color:      lerpColor(A.primary, B.primary, t)
 *     Engine:     lerp(A.density, B.density, t) — or crossfade if type changes
 *     Atmosphere: travels with engine params
 *     Atom:       A resolves (exit), B enters (entrance)
 *     Breath:     amplitude continues, pattern timing morphs
 */

// =====================================================================
// 1. COLOR TYPE
// =====================================================================

export type RGB = [number, number, number];

// =====================================================================
// 2. COLOR PARSING
// =====================================================================

/**
 * Parse any CSS color string to an RGB tuple.
 * Handles #RGB, #RRGGBB, #RRGGBBAA, rgb(), rgba().
 * Falls back to mid-grey if parsing fails.
 */
export function parseColor(input: string): RGB {
  if (!input) return [128, 128, 128];

  // #RGB (3-char)
  const hex3 = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(input);
  if (hex3) return [parseInt(hex3[1]+hex3[1],16), parseInt(hex3[2]+hex3[2],16), parseInt(hex3[3]+hex3[3],16)];

  // #RRGGBB / #RRGGBBAA
  const hex = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(input);
  if (hex) return [parseInt(hex[1], 16), parseInt(hex[2], 16), parseInt(hex[3], 16)];

  // rgb(r, g, b) / rgba(r, g, b, a)
  const rgb = /rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/.exec(input);
  if (rgb) return [+rgb[1], +rgb[2], +rgb[3]];

  return [128, 128, 128];
}

// =====================================================================
// 3. COLOR MATH
// =====================================================================

/** Linear interpolation between two RGB colors. */
export function lerpColor(a: RGB, b: RGB, t: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/** Convert RGB + alpha to CSS rgba() string. Alpha is clamped 0-1; NaN defaults to 0. */
export function rgba(rgb: RGB, alpha: number): string {
  const a = Number.isNaN(alpha) ? 0 : Math.max(0, Math.min(1, alpha));
  const r = Number.isNaN(rgb[0]) ? 0 : rgb[0];
  const g = Number.isNaN(rgb[1]) ? 0 : rgb[1];
  const b = Number.isNaN(rgb[2]) ? 0 : rgb[2];
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Desaturate an RGB color by lerping toward its luminance grey.
 * t=0 -> unchanged, t=1 -> fully grey.
 */
export function desaturate(c: RGB, t: number): RGB {
  const grey = Math.round(c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114);
  return lerpColor(c, [grey, grey, grey], t);
}

// =====================================================================
// 4. NUMERIC INTERPOLATION
// =====================================================================

/** Linear interpolation between two numbers. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Interpolate within an alpha tier based on a driver (0-1).
 * Usage: `lerpAlpha(ALPHA.atmosphere, breathAmplitude)`
 */
export function lerpAlpha(
  tier: { readonly min: number; readonly max: number },
  driver: number,
): number {
  return tier.min + driver * (tier.max - tier.min);
}

// =====================================================================
// 5. EASING
// =====================================================================

/** Exponential ease-out -- fast start, graceful deceleration. */
export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/** Cubic ease-out. */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Sine ease-in-out. */
export function easeSineInOut(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

/** Cubic ease-in-out. */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// =====================================================================
// 6. VIEWPORT
// =====================================================================

/** Resolved viewport geometry — the universal coordinate context. */
export interface ViewportCtx {
  /** Full logical width */
  w: number;
  /** Full logical height */
  h: number;
  /** Center X */
  cx: number;
  /** Center Y */
  cy: number;
  /** Short edge: Math.min(w, h) — the base for all spatial tokens */
  minDim: number;
}

/**
 * Derive viewport geometry from width and height.
 * Every consumer calls this once per frame or on resize.
 */
export function resolveViewport(w: number, h: number): ViewportCtx {
  return { w, h, cx: w / 2, cy: h / 2, minDim: Math.min(w, h) };
}

// =====================================================================
// 7. SPATIAL TOKENS (fractions of minDim)
// =====================================================================
// All spatial dimensions are expressed as fractions of `minDim`.
// Convert to pixels with `px(TOKEN, minDim)`.

/**
 * Convert a minDim-fraction token to pixels.
 * Usage: `const r = px(SIZE.lg, minDim);`
 */
export function px(fraction: number, minDim: number): number {
  return minDim * fraction;
}

/**
 * Background glow / gradient outer-radius tiers.
 *
 *   C1 reference:  standard = 0.45, large scenes = 0.55
 *   C2 bug range:  0.30-0.35 (too small -- now deprecated)
 */
export const GLOW = {
  /** Compact / subtle atoms */
  sm: 0.35,
  /** Standard -- matches C1 default */
  md: 0.45,
  /** Expansive / dramatic atoms */
  lg: 0.55,
  /** Full-bleed (use sparingly) */
  xl: 0.70,
} as const;

/**
 * Primary visual-element radius tiers.
 * The "hero shape" of an atom should typically be SIZE.md-lg.
 *
 *   C1 reference:  instruments 0.35, dormancy 0.30, composting 0.35
 */
export const SIZE = {
  /** Tiny indicators, handles, drag dots */
  xs: 0.04,
  /** Small rings, particles, knobs */
  sm: 0.10,
  /** Medium shapes, orbits, gauges */
  md: 0.22,
  /** Large -- primary geometry (C1 standard) */
  lg: 0.32,
  /** Extra-large -- hero centrifuge, full instruments */
  xl: 0.42,
} as const;

/**
 * Font-size tiers (fraction of minDim).
 * Use with `Math.max(MIN_PX, px(FONT_SIZE.md, minDim))`.
 *
 *   C1 reference:  labels 0.022-0.035, headlines 0.05-0.08
 */
export const FONT_SIZE = {
  /** Tiny annotations, axis labels -- min 7px */
  xs: 0.014,
  /** Secondary text, timestamps -- min 8px */
  sm: 0.020,
  /** Standard labels, instructions -- min 9px */
  md: 0.028,
  /** Primary text, state indicators -- min 10px */
  lg: 0.038,
  /** Headlines, hero text -- min 12px */
  xl: 0.055,
  /** Display / splash -- min 14px */
  xxl: 0.08,
} as const;

/**
 * Stroke / lineWidth tiers (fraction of minDim).
 *
 * Conversion reference (at 500px viewport):
 *   hairline ~ 0.2px    thin ~ 0.4px    light ~ 0.5px
 *   medium   ~ 0.8px    bold ~ 1.5px    heavy ~ 2.5px
 */
export const STROKE = {
  hairline: 0.0004,
  thin:     0.0008,
  light:    0.001,
  medium:   0.0016,
  bold:     0.003,
  heavy:    0.005,
} as const;

/**
 * Dash-pattern tiers (fraction of minDim).
 * Usage: `ctx.setLineDash([px(DASH.fine[0], minDim), px(DASH.fine[1], minDim)])`
 */
export const DASH = {
  fine:   [0.004, 0.008] as const,
  medium: [0.008, 0.008] as const,
  coarse: [0.012, 0.008] as const,
} as const;

/**
 * Particle / dot radius tiers.
 */
export const PARTICLE_SIZE = {
  /** Barely visible speck */
  dot:    0.003,
  /** Small particle */
  sm:     0.005,
  /** Standard particle */
  md:     0.008,
  /** Large particle / node */
  lg:     0.012,
  /** Prominent orb */
  xl:     0.018,
} as const;

/**
 * Edge-padding tiers (inset from canvas boundary).
 */
export const PAD = {
  sm: 0.03,
  md: 0.05,
  lg: 0.08,
} as const;

// =====================================================================
// 8. ALPHA GOVERNANCE
// =====================================================================
// Every opacity value in the system maps to one of these tiers.
// The tier name reflects the Z-layer role, not absolute brightness.
// Use `lerpAlpha(ALPHA.tier, driver)` for breath/entrance-driven values.

/**
 * Z-layer-aware alpha tiers.
 *
 * Each tier defines the safe {min, max} range for elements at that
 * compositional depth. When all layers composite together, each stays
 * in its lane — engines never fight atoms, atoms never fight text.
 */
export const ALPHA = {
  /** Z-1: Engine background elements -- felt, not seen */
  background:  { min: 0.005, max: 0.03 },
  /** Z-2: Color signature ambient light, secondary atmosphere */
  atmosphere:  { min: 0.01,  max: 0.06 },
  /** Z-3: Atom primary interactive elements (particles, rings, lines) */
  content:     { min: 0.04,  max: 0.12 },
  /** Z-4: Focal hero shapes, active indicators */
  focal:       { min: 0.10,  max: 0.22 },
  /** Z-5: Resolution bursts, completion flashes, seal glows */
  accent:      { min: 0.14,  max: 0.30 },
  /** Z-6: Text / label elements */
  text:        { min: 0.04,  max: 0.10 },
  /** Radial glow fills (any layer) */
  glow:        { min: 0.01,  max: 0.08 },
} as const;

/** Type for any alpha tier -- used by lerpAlpha(). */
export type AlphaTier = { readonly min: number; readonly max: number };

// =====================================================================
// 9. QUICK REFERENCE — CONVERSION EXAMPLES
// =====================================================================
//
// BEFORE (hardcoded px):                    AFTER (token-governed):
// ─────────────────────────────────────     ───────────────────────────────────
// ctx.lineWidth = 0.5;                      ctx.lineWidth = px(STROKE.medium, minDim);
// ctx.lineWidth = 1;                        ctx.lineWidth = px(STROKE.bold, minDim);
// ctx.lineWidth = 1.5;                      ctx.lineWidth = px(STROKE.heavy, minDim);
// width: 3, height: 3                       const d = px(PARTICLE_SIZE.md, minDim);
// size: 1.5 + random * 2.5                  sizeFrac: PARTICLE_SIZE.sm + random * (PARTICLE_SIZE.lg - PARTICLE_SIZE.sm)
// driftX: ±(2 + random * 10)               driftXFrac: ±(0.006 + random * 0.032)   then * minDim in render
// boxShadow: `0 0 ${3+a*4}px`              boxShadow: `0 0 ${px(PARTICLE_SIZE.md + a * PARTICLE_SIZE.lg, minDim)}px`
// ctx.setLineDash([4, 8])                   ctx.setLineDash([px(DASH.fine[0], m), px(DASH.fine[1], m)])
// fontSize: 9                               fontSize: Math.max(9, px(FONT_SIZE.md, minDim))
// rgba(rgb, 0.15)                           rgba(rgb, lerpAlpha(ALPHA.content, breathAmplitude))
//
// COLOR WORKFLOW:
//   const accentRgb = parseColor(accent);   // parse once per render
//   rgba(accentRgb, 0.2)                    // use everywhere
//   lerpColor(fromRgb, toRgb, t)            // transitions
//
// VIEWPORT WORKFLOW (canvas atoms):
//   const v = resolveViewport(w, h);
//   const r = px(SIZE.lg, v.minDim);        // hero radius in px
//   ctx.arc(v.cx, v.cy, r, 0, Math.PI * 2);
//
// VIEWPORT WORKFLOW (DOM engines):
//   const minDim = Math.min(viewport?.width ?? 320, viewport?.height ?? 652);
//   const dotSize = px(PARTICLE_SIZE.md, minDim);
//   style={{ width: dotSize, height: dotSize }}