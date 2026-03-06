/**
 * ATOM 269: THE INFINITE CANVAS ENGINE
 * =======================================
 * Series 27 — Cosmic Play · Position 9
 *
 * You made a mistake on a tiny canvas. Zoom out — the canvas
 * is infinite. Your mistake is microscopic. Perspective is everything.
 *
 * SIGNATURE TECHNIQUE: Holographic Diffraction + Generative Art
 *   - Grid lines shimmer with angle-dependent rainbow diffraction
 *   - As zoom increases, concentric holographic rings emanate from center
 *   - Generative art pattern (L-system fractal branches) appear at zoom scale
 *   - Mistake mark dissolves into prismatic scatter at sufficient zoom
 *
 * PHYSICS:
 *   - Start zoomed tight on a "mistake" mark (scribble + X)
 *   - Hold → exponential zoom out (1× → 120×)
 *   - Grid spacing adapts procedurally across zoom levels
 *   - Sub-grid and super-grid emerge at different zoom thresholds
 *   - Holographic rings pulse outward from center with rainbow color
 *   - Fractal branch pattern grows as new "possibilities" appear
 *   - Mistake shrinks to invisible speck — error is irrelevant in infinity
 *   - 8 rendering layers: fractal branches, holographic rings, super-grid,
 *     sub-grid, grid, mistake mark, vastness glow, progress
 *   - Breath couples to: grid shimmer, ring expansion speed, glow warmth
 *
 * INTERACTION:
 *   Hold → zoom out (hold_start, step_advance, completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Fully zoomed-out grid with vastness glow + fractal
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, motionScale,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Starting zoom level */
const ZOOM_START = 1;
/** Maximum zoom level for completion */
const ZOOM_END = 120;
/** Zoom rate per frame (exponential multiplier) */
const ZOOM_RATE = 0.009;
/** Base grid spacing at 1× zoom (fraction of minDim) */
const GRID_SPACING = 0.04;
/** Mistake scribble radius at 1× zoom (fraction of minDim) */
const MISTAKE_R = 0.022;
/** Number of holographic rings emanating from center */
const HOLO_RING_COUNT = 6;
/** Ring expansion speed factor */
const RING_EXPAND_RATE = 0.008;
/** Fractal branch depth at max zoom */
const FRACTAL_MAX_DEPTH = 5;
/** Number of branches per node */
const FRACTAL_BRANCHES = 3;
/** Branch angle spread (radians) */
const FRACTAL_SPREAD = 0.65;
/** Base branch length (fraction of minDim) */
const FRACTAL_LENGTH = 0.08;
/** Branch length decay per depth level */
const FRACTAL_DECAY = 0.62;
/** Number of concentric glow layers for vastness */
const VASTNESS_GLOW_LAYERS = 5;
/** Breath grid shimmer modulation */
const BREATH_SHIMMER = 0.04;
/** Breath ring speed modulation */
const BREATH_RING = 0.3;
/** Breath glow warmth modulation */
const BREATH_WARMTH = 0.06;
/** Specular dot size at center of vastness */
const VASTNESS_SPECULAR_R = 0.015;

// ═════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════

/**
 * Convert hue (0–1) to RGB for holographic rainbow.
 */
function hueToRgb(hue: number): RGB {
  const h = ((hue % 1) + 1) % 1;
  const c = 0.6;
  const x = c * (1 - Math.abs((h * 6) % 2 - 1));
  const m = 0.3;
  let r = 0, g = 0, b = 0;
  if (h < 1/6)      { r = c; g = x; }
  else if (h < 2/6) { r = x; g = c; }
  else if (h < 3/6) { g = c; b = x; }
  else if (h < 4/6) { g = x; b = c; }
  else if (h < 5/6) { r = x; b = c; }
  else               { r = c; b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)] as unknown as RGB;
}

/**
 * Recursively draw generative fractal branches.
 * Branches grow longer as zoomFrac increases (more perspective = more possibilities).
 */
function drawFractalBranch(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, angle: number,
  depth: number, maxDepth: number,
  minDim: number, rgb: RGB, entrance: number,
  time: number, zoomFrac: number,
): void {
  if (depth >= maxDepth) return;
  const len = px(FRACTAL_LENGTH * Math.pow(FRACTAL_DECAY, depth) * (0.5 + zoomFrac * 0.5), minDim);
  const endX = x + Math.cos(angle) * len;
  const endY = y + Math.sin(angle) * len;

  // Branch line with depth-dependent color
  const depthFrac = depth / maxDepth;
  const branchHue = (depthFrac * 0.3 + time * 0.005) % 1;
  const branchColor = lerpColor(rgb, hueToRgb(branchHue), 0.3 + depthFrac * 0.4);
  const branchAlpha = ALPHA.content.max * (0.06 - depthFrac * 0.03) * entrance * zoomFrac;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = rgba(branchColor, branchAlpha);
  ctx.lineWidth = px(STROKE.thin * (1 - depthFrac * 0.6), minDim);
  ctx.stroke();

  // Node dot at branch tip
  if (depth > 0) {
    const dotR = px(0.003 * (1 - depthFrac * 0.5), minDim);
    ctx.beginPath();
    ctx.arc(endX, endY, dotR, 0, Math.PI * 2);
    ctx.fillStyle = rgba(branchColor, ALPHA.content.max * 0.1 * entrance * zoomFrac);
    ctx.fill();
  }

  // Recurse into sub-branches
  for (let i = 0; i < FRACTAL_BRANCHES; i++) {
    const subAngle = angle + (i - (FRACTAL_BRANCHES - 1) / 2) * FRACTAL_SPREAD;
    const wobble = Math.sin(time * 0.003 + depth * 2 + i) * 0.1;
    drawFractalBranch(ctx, endX, endY, subAngle + wobble, depth + 1, maxDepth,
      minDim, rgb, entrance, time, zoomFrac);
  }
}

/**
 * Draw the mistake mark (scribble + X cross) scaled by zoom.
 */
function drawMistake(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, minDim: number,
  rgb: RGB, entrance: number, zoom: number,
): void {
  const r = px(MISTAKE_R, minDim) / zoom;
  if (r < 0.3) {
    // Tiny dot when zoomed far out
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(0.5, r), 0, Math.PI * 2);
    ctx.fillStyle = rgba(rgb, ALPHA.content.max * 0.08 * entrance);
    ctx.fill();
    return;
  }

  // Scribble blob (deterministic — use index, not random)
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const wobble = 0.5 + 0.5 * Math.sin(i * 2.7 + 1.3);
    const mx = cx + Math.cos(angle) * r * wobble;
    const my = cy + Math.sin(angle) * r * wobble;
    if (i === 0) ctx.moveTo(mx, my);
    else ctx.lineTo(mx, my);
  }
  ctx.closePath();
  ctx.fillStyle = rgba(rgb, ALPHA.content.max * 0.18 * entrance);
  ctx.fill();

  // X through it
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.7, cy - r * 0.7);
  ctx.lineTo(cx + r * 0.7, cy + r * 0.7);
  ctx.moveTo(cx + r * 0.7, cy - r * 0.7);
  ctx.lineTo(cx - r * 0.7, cy + r * 0.7);
  ctx.strokeStyle = rgba(rgb, ALPHA.content.max * 0.12 * entrance);
  ctx.lineWidth = Math.max(0.5, r * 0.2);
  ctx.stroke();

  // Stress ring around mistake
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(rgb, ALPHA.content.max * 0.05 * entrance);
  ctx.lineWidth = Math.max(0.3, r * 0.08);
  ctx.stroke();
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function InfiniteCanvasAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    zoom: ZOOM_START,
    holding: false,
    holdNotified: false,
    stepNotified: false,
    completed: false,
  });

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      // ═══════════════════════════════════════════════════════════════
      // REDUCED MOTION — fully zoomed with vastness + fractal
      // ═══════════════════════════════════════════════════════════════
      if (p.reducedMotion) {
        // Vastness glow
        for (let i = VASTNESS_GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = px(SIZE.lg * (0.6 + i * 0.3), minDim);
          const gA = ALPHA.glow.max * 0.05 * entrance / (i + 1);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(s.primaryRgb, gA));
          gg.addColorStop(0.3, rgba(s.primaryRgb, gA * 0.4));
          gg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }
        // Static fractal
        const fracDepth = Math.min(FRACTAL_MAX_DEPTH, 4);
        for (let a = 0; a < 4; a++) {
          drawFractalBranch(ctx, cx, cy, -Math.PI / 2 + a * Math.PI / 2,
            0, fracDepth, minDim, s.primaryRgb, entrance, 0, 1);
        }
        // Center dot
        const dotR = px(VASTNESS_SPECULAR_R, minDim);
        ctx.beginPath(); ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.fill();
        cb.onStateChange?.(1);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      // ═══════════════════════════════════════════════════════════════
      // ZOOM PHYSICS
      // ═══════════════════════════════════════════════════════════════
      if (p.phase === 'resolve') { s.zoom = ZOOM_END; s.completed = true; }

      if (s.holding && !s.completed) {
        s.zoom = Math.min(ZOOM_END, s.zoom * (1 + ZOOM_RATE * ms));
      }

      const zoomFrac = Math.log(s.zoom) / Math.log(ZOOM_END);

      if (zoomFrac > 0.5 && !s.stepNotified) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }
      if (s.zoom >= ZOOM_END * 0.95 && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      cb.onStateChange?.(s.completed ? 1 : zoomFrac);

      const breathShimmer = p.breathAmplitude * BREATH_SHIMMER;
      const breathWarmth = p.breathAmplitude * BREATH_WARMTH;

      // ═══════════════════════════════════════════════════════════════
      // LAYER 1 — Generative fractal branches (appear with zoom)
      // ═══════════════════════════════════════════════════════════════
      if (zoomFrac > 0.2) {
        const fracVisibility = (zoomFrac - 0.2) / 0.8;
        const fracDepth = Math.min(FRACTAL_MAX_DEPTH, Math.floor(1 + fracVisibility * (FRACTAL_MAX_DEPTH - 1)));

        // 4 main branches at cardinal directions
        for (let a = 0; a < 4; a++) {
          const baseAngle = -Math.PI / 2 + a * Math.PI / 2;
          drawFractalBranch(ctx, cx, cy, baseAngle, 0, fracDepth,
            minDim, s.primaryRgb, entrance, s.frameCount, fracVisibility);
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 2 — Holographic rings emanating from center
      // ═══════════════════════════════════════════════════════════════
      if (zoomFrac > 0.15) {
        const ringVisibility = (zoomFrac - 0.15) / 0.85;
        for (let i = 0; i < HOLO_RING_COUNT; i++) {
          const ringPhase = (s.frameCount * RING_EXPAND_RATE * (1 + p.breathAmplitude * BREATH_RING) + i / HOLO_RING_COUNT) % 1;
          const ringR = px(SIZE.md * (0.3 + ringPhase * 2.5) * ringVisibility, minDim);
          const ringAlpha = ALPHA.content.max * 0.04 * (1 - ringPhase) * ringVisibility * entrance;

          const ringHue = (i / HOLO_RING_COUNT + s.frameCount * 0.001) % 1;
          const ringColor = hueToRgb(ringHue);

          ctx.beginPath();
          ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(ringColor, ringAlpha);
          ctx.lineWidth = px(STROKE.thin * (1 - ringPhase * 0.5), minDim);
          ctx.stroke();

          // Ring glow band
          if (ringPhase < 0.5) {
            const bandW = px(0.008, minDim);
            const bg = ctx.createRadialGradient(cx, cy, ringR - bandW, cx, cy, ringR + bandW);
            bg.addColorStop(0, 'rgba(0,0,0,0)');
            bg.addColorStop(0.5, rgba(ringColor, ALPHA.glow.max * 0.02 * ringVisibility * entrance));
            bg.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = bg;
            ctx.fillRect(cx - ringR - bandW, cy - ringR - bandW, (ringR + bandW) * 2, (ringR + bandW) * 2);
          }
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 3 — Super-grid (appears at high zoom)
      // ═══════════════════════════════════════════════════════════════
      if (s.zoom > 8) {
        const superSpacing = px(GRID_SPACING, minDim) * s.zoom * 5;
        if (superSpacing > 12) {
          const startX = cx % superSpacing;
          const startY = cy % superSpacing;
          ctx.beginPath();
          for (let x = startX; x < w; x += superSpacing) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
          for (let y = startY; y < h; y += superSpacing) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
          const superHue = (s.frameCount * 0.0008) % 1;
          ctx.strokeStyle = rgba(
            lerpColor(s.primaryRgb, hueToRgb(superHue), breathShimmer * 3),
            ALPHA.content.max * 0.05 * entrance,
          );
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 4 — Standard grid with holographic shimmer
      // ═══════════════════════════════════════════════════════════════
      const gridPx = px(GRID_SPACING, minDim) * s.zoom;
      if (gridPx > 4) {
        const startX = cx % gridPx;
        const startY = cy % gridPx;
        ctx.beginPath();
        for (let x = startX; x < w; x += gridPx) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
        for (let y = startY; y < h; y += gridPx) { ctx.moveTo(0, y); ctx.lineTo(w, y); }

        // Grid color shifts with holographic shimmer
        const gridHue = (s.frameCount * 0.0005 + breathShimmer) % 1;
        const gridColor = lerpColor(s.primaryRgb, hueToRgb(gridHue), 0.15 + breathShimmer);
        ctx.strokeStyle = rgba(gridColor, ALPHA.content.max * 0.035 * entrance);
        ctx.lineWidth = px(0.0004, minDim);
        ctx.stroke();
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 5 — Sub-grid (visible at moderate zoom)
      // ═══════════════════════════════════════════════════════════════
      if (s.zoom > 4) {
        const subSpacing = gridPx * 0.2;
        if (subSpacing > 3 && subSpacing < 100) {
          const startX = cx % subSpacing;
          const startY = cy % subSpacing;
          ctx.beginPath();
          for (let x = startX; x < w; x += subSpacing) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
          for (let y = startY; y < h; y += subSpacing) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.015 * entrance);
          ctx.lineWidth = px(0.0003, minDim);
          ctx.stroke();
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 6 — The "mistake" mark (shrinks with zoom)
      // ═══════════════════════════════════════════════════════════════
      drawMistake(ctx, cx, cy, minDim, s.accentRgb, entrance, s.zoom);

      // ═══════════════════════════════════════════════════════════════
      // LAYER 7 — Vastness glow (builds as zoom increases)
      // ═══════════════════════════════════════════════════════════════
      if (zoomFrac > 0.25) {
        const vastness = (zoomFrac - 0.25) / 0.75;
        const warmColor = lerpColor(s.primaryRgb, s.accentRgb, breathWarmth);

        for (let i = VASTNESS_GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = px(SIZE.lg * vastness * (0.5 + i * 0.35), minDim);
          const gA = ALPHA.glow.max * (0.03 + vastness * 0.04) * entrance / (i + 1);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(warmColor, gA));
          gg.addColorStop(0.25, rgba(warmColor, gA * 0.5));
          gg.addColorStop(0.6, rgba(s.primaryRgb, gA * 0.15));
          gg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }

        // Specular dot at center of vastness
        if (vastness > 0.5) {
          const spR = px(VASTNESS_SPECULAR_R * vastness, minDim);
          const sp = ctx.createRadialGradient(cx - spR * 0.3, cy - spR * 0.3, 0, cx, cy, spR);
          sp.addColorStop(0, `rgba(255,255,255,${0.25 * vastness * entrance})`);
          sp.addColorStop(0.5, `rgba(255,255,255,${0.06 * vastness * entrance})`);
          sp.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = sp;
          ctx.beginPath();
          ctx.arc(cx, cy, spR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 8 — Progress bar + hold prompt + completion bloom
      // ═══════════════════════════════════════════════════════════════
      if (!s.completed) {
        // Thin progress bar at bottom
        const barW = px(0.12, minDim);
        const barH = px(0.003, minDim);
        const barX = cx - barW / 2;
        const barY = h * 0.94;

        // Bar background
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.03 * entrance);
        ctx.fillRect(barX, barY, barW, barH);
        // Bar fill
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
        ctx.fillRect(barX, barY, barW * zoomFrac, barH);

        // Hold prompt when idle
        if (!s.holding) {
          const pulse = 0.5 + 0.5 * Math.sin(s.frameCount * 0.03);
          ctx.beginPath();
          ctx.arc(cx, cy, px(MISTAKE_R * 2.5, minDim), 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.03 * pulse * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.setLineDash([px(0.004, minDim), px(0.008, minDim)]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Completion: expanding holographic bloom
      if (s.completed) {
        for (let i = 0; i < 5; i++) {
          const cPhase = (s.frameCount * 0.004 + i * 0.2) % 1;
          const cR = px(SIZE.md * (1 + cPhase * 4), minDim);
          const cHue = (i * 0.2 + s.frameCount * 0.001) % 1;
          const cColor = hueToRgb(cHue);
          const cAlpha = ALPHA.content.max * 0.035 * (1 - cPhase) * entrance;
          ctx.beginPath();
          ctx.arc(cx, cy, cR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(cColor, cAlpha);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer events ─────────────────────────────────────
    const onDown = () => {
      const s = stateRef.current;
      s.holding = true;
      if (!s.holdNotified) {
        s.holdNotified = true;
        callbacksRef.current.onHaptic('hold_start');
      }
    };
    const onUp = () => { stateRef.current.holding = false; };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'zoom-out' }}
      />
    </div>
  );
}
