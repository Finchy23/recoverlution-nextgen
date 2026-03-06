/**
 * ATOM 281: THE BIO-MIRROR ENGINE
 * ==================================
 * Series 29 — Interoceptive Anchor · Position 1
 *
 * Track the blood pumping through your thumb right now.
 * Each heartbeat creates a massive glowing sonic ring.
 * Hold to synchronize — the phone becomes a beating heart.
 *
 * SIGNATURE TECHNIQUE: Topographic contour lines + Chladni patterns
 *   - Background rendered as somatic terrain with pulse-reactive contours
 *   - Contour elevation distorted by heartbeat shockwaves
 *   - Chladni nodal lines emerge around the core as beat stabilizes
 *
 * PHYSICS:
 *   - Core node pulses with simulated heartbeat (~72 BPM)
 *   - Double-peak lub-dub waveform (systole/diastole)
 *   - Each beat spawns expanding sonic ring with thickness decay
 *   - Topographic contour field deforms with each pulse shockwave
 *   - Chladni-pattern nodal lines crystallize as rhythm stabilizes
 *   - 7 rendering layers: terrain contours, Chladni field, core shadow,
 *     core glow, core body with specular, sonic rings + glow, progress
 *   - Breath couples to: glow warmth, contour drift, ring color warmth
 *   - 20 beats to completion
 *
 * INTERACTION:
 *   Hold → heart syncs + amplifies (hold_start, step_advance, completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static core with single contour ring + Chladni pattern
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

/** Resting heart rate in BPM */
const HEART_BPM = 72;
/** Phase increment per frame at ~60fps for heartbeat cycle */
const HEART_PHASE_SPEED = (HEART_BPM / 60) * Math.PI * 2 * 0.016;
/** Fractional delay between lub and dub peaks */
const LUB_DUB_GAP = 0.18;
/** Core node base radius (fraction of minDim) */
const CORE_BASE_R = SIZE.md;
/** Core expansion on each beat pulse */
const CORE_BEAT_EXPAND = 0.04;
/** Sonic ring expansion rate (px per frame) */
const RING_EXPAND_SPEED = 2.2;
/** Sonic ring life decay per frame */
const RING_LIFE_DECAY = 0.006;
/** Base ring stroke thickness (fraction of minDim) */
const RING_THICKNESS_BASE = STROKE.bold;
/** Maximum concurrent rings in pool */
const MAX_RINGS = 24;
/** Number of beats needed for completion */
const BEATS_TO_COMPLETE = 20;
/** Number of layered glow passes for the core */
const CORE_GLOW_LAYERS = 5;
/** Number of topographic contour rings */
const CONTOUR_COUNT = 14;
/** Contour ring spacing (fraction of minDim) */
const CONTOUR_SPACING = 0.032;
/** Contour drift speed (breath-coupled) */
const CONTOUR_DRIFT = 0.0008;
/** Chladni grid resolution (NxN sample points) */
const CHLADNI_RES = 28;
/** Chladni dot max radius (fraction of minDim) */
const CHLADNI_DOT_R = 0.003;
/** Chladni resonance threshold (below this = nodal point) */
const CHLADNI_THRESHOLD = 0.15;
/** Specular highlight offset from center (fraction of core radius) */
const SPECULAR_OFFSET = 0.28;
/** Specular highlight radius (fraction of core radius) */
const SPECULAR_R = 0.22;
/** Breath warmth modulation factor */
const BREATH_WARMTH = 0.06;
/** Breath contour modulation factor */
const BREATH_CONTOUR = 0.04;
/** Breath ring warmth modulation */
const BREATH_RING_WARMTH = 0.05;

// ═════════════════════════════════════════════════════════════════════
// STATE TYPES
// ═════════════════════════════════════════════════════════════════════

/** Expanding sonic ring spawned on each heartbeat */
interface SonicRing {
  r: number;
  life: number;
  isLub: boolean;
}

// ═════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════

/**
 * Evaluate Chladni plate pattern at normalized coordinates.
 * Uses cos(n*pi*x)*cos(m*pi*y) - cos(m*pi*x)*cos(n*pi*y) which
 * produces the classic nodal-line sand figures.
 */
function chladniValue(nx: number, ny: number, n: number, m: number): number {
  return Math.cos(n * Math.PI * nx) * Math.cos(m * Math.PI * ny)
       - Math.cos(m * Math.PI * nx) * Math.cos(n * Math.PI * ny);
}

/**
 * Draw topographic contour rings around center, distorted by pulse.
 * Each contour is an ellipse whose radii wobble with heartbeat phase.
 */
function drawContours(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, minDim: number,
  rgb: RGB, entrance: number, frame: number,
  beatIntensity: number, breathAmp: number,
): void {
  for (let i = 0; i < CONTOUR_COUNT; i++) {
    const baseR = px(CONTOUR_SPACING * (i + 2), minDim);
    // Pulse shockwave: beat distorts contours outward
    const shockOffset = beatIntensity * px(0.015, minDim) * Math.sin(i * 0.7);
    // Breath causes gentle drift
    const breathOffset = breathAmp * px(BREATH_CONTOUR, minDim) * Math.cos(i * 0.5 + frame * 0.01);
    const r = baseR + shockOffset + breathOffset;
    // Elevation-dependent alpha (inner = stronger)
    const elevAlpha = (1 - i / CONTOUR_COUNT) * 0.4 + 0.1;
    const contourAlpha = ALPHA.atmosphere.max * elevAlpha * entrance * 0.35;

    ctx.beginPath();
    // Wobble the contour to look organic
    const angleSteps = 48;
    for (let a = 0; a <= angleSteps; a++) {
      const angle = (a / angleSteps) * Math.PI * 2;
      const wobble = 1 + 0.06 * Math.sin(angle * 3 + i * 1.2 + frame * CONTOUR_DRIFT * 10);
      const px2 = cx + Math.cos(angle) * r * wobble;
      const py2 = cy + Math.sin(angle) * r * wobble;
      if (a === 0) ctx.moveTo(px2, py2);
      else ctx.lineTo(px2, py2);
    }
    ctx.closePath();
    ctx.strokeStyle = rgba(rgb, contourAlpha);
    ctx.lineWidth = px(STROKE.hairline + (i % 3 === 0 ? STROKE.thin : 0), minDim);
    ctx.stroke();
  }
}

/**
 * Draw Chladni nodal-line pattern — sand dots at zero-crossings.
 * Resonance frequency shifts as rhythm stabilizes (progFrac).
 */
function drawChladniField(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, minDim: number,
  rgb: RGB, entrance: number, progFrac: number,
  frame: number,
): void {
  // Modal numbers shift as progress increases (more complex patterns)
  const n = 2 + Math.floor(progFrac * 3);
  const m = 3 + Math.floor(progFrac * 2);
  const fieldR = px(0.38, minDim);
  const dotR = px(CHLADNI_DOT_R, minDim);
  const timeShift = frame * 0.0003;

  for (let xi = 0; xi < CHLADNI_RES; xi++) {
    for (let yi = 0; yi < CHLADNI_RES; yi++) {
      const nx = (xi / (CHLADNI_RES - 1)) * 2 - 1;
      const ny = (yi / (CHLADNI_RES - 1)) * 2 - 1;
      // Skip points outside circular domain
      const d = Math.sqrt(nx * nx + ny * ny);
      if (d > 1) continue;

      const val = Math.abs(chladniValue(nx + timeShift * 0.1, ny, n, m));
      if (val < CHLADNI_THRESHOLD) {
        const x = cx + nx * fieldR;
        const y = cy + ny * fieldR;
        // Nodal dots — closer to zero = brighter
        const intensity = 1 - val / CHLADNI_THRESHOLD;
        const alpha = ALPHA.content.max * 0.15 * intensity * entrance * (0.3 + progFrac * 0.7);
        ctx.beginPath();
        ctx.arc(x, y, dotR * (0.5 + intensity * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = rgba(rgb, alpha);
        ctx.fill();
      }
    }
  }
}

/**
 * Draw specular highlight on the core sphere.
 */
function drawSpecular(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, coreR: number,
  entrance: number, beatIntensity: number,
): void {
  const spX = cx - coreR * SPECULAR_OFFSET;
  const spY = cy - coreR * SPECULAR_OFFSET;
  const spR = coreR * SPECULAR_R * (1 + beatIntensity * 0.2);
  const sg = ctx.createRadialGradient(spX, spY, 0, spX, spY, spR);
  sg.addColorStop(0, `rgba(255,255,255,${0.35 * entrance})`);
  sg.addColorStop(0.5, `rgba(255,255,255,${0.08 * entrance})`);
  sg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(spX, spY, spR, 0, Math.PI * 2);
  ctx.fill();
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function BioMirrorAtom({
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
    heartPhase: 0,
    lastLub: false,
    lastDub: false,
    holding: false,
    holdNotified: false,
    rings: [] as SonicRing[],
    beatCount: 0,
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
      // REDUCED MOTION — static terrain + core + one Chladni pattern
      // ═══════════════════════════════════════════════════════════════
      if (p.reducedMotion) {
        // Static contours
        for (let i = 0; i < 8; i++) {
          const r = px(CONTOUR_SPACING * (i + 2), minDim);
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.15 * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
        // Static Chladni
        drawChladniField(ctx, cx, cy, minDim, s.primaryRgb, entrance, 0.5, 0);
        // Core
        const cR = px(CORE_BASE_R, minDim);
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, cR);
        cg.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.7 * entrance));
        cg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance));
        cg.addColorStop(0.85, rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance));
        cg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(cx, cy, cR, 0, Math.PI * 2);
        ctx.fill();
        drawSpecular(ctx, cx, cy, cR, entrance, 0);
        // Single ring
        ctx.beginPath();
        ctx.arc(cx, cy, cR * 2.5, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.1 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
        cb.onStateChange?.(1);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      const active = s.holding || p.phase === 'resolve';
      const breathWarmth = p.breathAmplitude * BREATH_WARMTH;

      // ═══════════════════════════════════════════════════════════════
      // HEARTBEAT PHYSICS
      // ═══════════════════════════════════════════════════════════════
      s.heartPhase += HEART_PHASE_SPEED * ms;
      const cyclePos = (s.heartPhase % (Math.PI * 2)) / (Math.PI * 2);

      const lubIntensity = Math.pow(Math.max(0, Math.cos(cyclePos * Math.PI * 2 * 5)), 12);
      const dubIntensity = Math.pow(Math.max(0, Math.cos((cyclePos - LUB_DUB_GAP) * Math.PI * 2 * 5)), 12);
      const beatIntensity = Math.max(lubIntensity, dubIntensity);

      // Spawn rings on beats (when active)
      if (active) {
        if (lubIntensity > 0.8 && !s.lastLub) {
          s.lastLub = true;
          if (s.rings.length < MAX_RINGS) s.rings.push({ r: 0, life: 1, isLub: true });
          s.beatCount++;
          if (s.beatCount % 5 === 0) cb.onHaptic('step_advance');
          if (s.beatCount >= BEATS_TO_COMPLETE && !s.completed) {
            s.completed = true;
            cb.onHaptic('completion');
          }
        }
        if (lubIntensity < 0.3) s.lastLub = false;
        if (dubIntensity > 0.8 && !s.lastDub) {
          s.lastDub = true;
          if (s.rings.length < MAX_RINGS) s.rings.push({ r: 0, life: 0.7, isLub: false });
        }
        if (dubIntensity < 0.3) s.lastDub = false;
      }

      const progFrac = Math.min(1, s.beatCount / BEATS_TO_COMPLETE);
      cb.onStateChange?.(progFrac);

      // Ring physics
      for (let i = s.rings.length - 1; i >= 0; i--) {
        const ring = s.rings[i];
        ring.r += RING_EXPAND_SPEED * ms;
        ring.life -= RING_LIFE_DECAY * ms;
        if (ring.life <= 0) s.rings.splice(i, 1);
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 1 — Topographic contour terrain
      // ═══════════════════════════════════════════════════════════════
      drawContours(ctx, cx, cy, minDim, s.primaryRgb, entrance, s.frameCount,
        beatIntensity, p.breathAmplitude);

      // ═══════════════════════════════════════════════════════════════
      // LAYER 2 — Chladni nodal-line resonance field
      // ═══════════════════════════════════════════════════════════════
      drawChladniField(ctx, cx, cy, minDim,
        lerpColor(s.primaryRgb, s.accentRgb, breathWarmth),
        entrance, progFrac, s.frameCount);

      // ═══════════════════════════════════════════════════════════════
      // LAYER 3 — Core shadow (beneath the heart node)
      // ═══════════════════════════════════════════════════════════════
      const coreR = px(CORE_BASE_R + (active ? CORE_BEAT_EXPAND * beatIntensity : 0)
        + p.breathAmplitude * 0.01, minDim);
      const shadowR = coreR * 1.3;
      const shadowY = cy + coreR * 0.15;
      const sg = ctx.createRadialGradient(cx, shadowY, 0, cx, shadowY, shadowR);
      sg.addColorStop(0, rgba([0, 0, 0] as unknown as RGB, 0.12 * entrance));
      sg.addColorStop(0.6, rgba([0, 0, 0] as unknown as RGB, 0.04 * entrance));
      sg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.ellipse(cx, shadowY, shadowR, shadowR * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // ═══════════════════════════════════════════════════════════════
      // LAYER 4 — Core glow field (multi-stop radial, 5 passes)
      // ═══════════════════════════════════════════════════════════════
      const warmCore = lerpColor(s.primaryRgb, s.accentRgb,
        progFrac * 0.25 + breathWarmth);
      for (let i = CORE_GLOW_LAYERS - 1; i >= 0; i--) {
        const gR = coreR * (2.5 + i * 2.0 + beatIntensity * 1.8);
        const gA = ALPHA.glow.max * (0.08 + beatIntensity * 0.18 + progFrac * 0.1) * entrance / (i + 1);
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
        gg.addColorStop(0, rgba(warmCore, gA));
        gg.addColorStop(0.25, rgba(warmCore, gA * 0.55));
        gg.addColorStop(0.5, rgba(warmCore, gA * 0.15));
        gg.addColorStop(0.8, rgba(s.primaryRgb, gA * 0.04));
        gg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gg;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 5 — Core body (5-stop gradient + specular highlight)
      // ═══════════════════════════════════════════════════════════════
      const bodyGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      const bodyAlpha = ALPHA.content.max * (0.5 + beatIntensity * 0.3 + progFrac * 0.15) * entrance;
      bodyGrad.addColorStop(0, rgba(lerpColor(warmCore, [255, 255, 255] as unknown as RGB, 0.15), bodyAlpha));
      bodyGrad.addColorStop(0.3, rgba(warmCore, bodyAlpha));
      bodyGrad.addColorStop(0.65, rgba(s.primaryRgb, bodyAlpha * 0.7));
      bodyGrad.addColorStop(0.9, rgba(s.primaryRgb, bodyAlpha * 0.3));
      bodyGrad.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      // Inner beat flash
      if (beatIntensity > 0.3) {
        const flashR = coreR * (0.6 + beatIntensity * 0.4);
        const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, flashR);
        fg.addColorStop(0, rgba(warmCore, ALPHA.content.max * 0.15 * beatIntensity * entrance));
        fg.addColorStop(0.5, rgba(warmCore, ALPHA.content.max * 0.04 * beatIntensity * entrance));
        fg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.arc(cx, cy, flashR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Specular highlight
      drawSpecular(ctx, cx, cy, coreR, entrance, beatIntensity);

      // Secondary reflection ellipse (bottom-right)
      const refX = cx + coreR * 0.15;
      const refY = cy + coreR * 0.2;
      const refR = coreR * 0.12;
      ctx.beginPath();
      ctx.ellipse(refX, refY, refR, refR * 0.5, Math.PI * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.06 * entrance})`;
      ctx.fill();

      // ═══════════════════════════════════════════════════════════════
      // LAYER 6 — Sonic rings + ring glow + Fresnel edges
      // ═══════════════════════════════════════════════════════════════
      for (const ring of s.rings) {
        const rr = coreR + ring.r;
        const thickness = px(RING_THICKNESS_BASE * (ring.isLub ? 1.5 : 1) * ring.life, minDim);
        if (thickness < 0.3) continue;

        const ringColor = lerpColor(s.primaryRgb, s.accentRgb,
          progFrac * 0.3 + p.breathAmplitude * BREATH_RING_WARMTH);
        const ringAlpha = ALPHA.content.max * ring.life * (ring.isLub ? 0.3 : 0.14) * entrance;

        // Main ring stroke
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(ringColor, ringAlpha);
        ctx.lineWidth = thickness;
        ctx.stroke();

        // Ring glow (radial spread around ring radius)
        if (ring.life > 0.4 && ring.isLub) {
          const glowSpread = thickness * 4;
          const rg = ctx.createRadialGradient(cx, cy, rr - glowSpread, cx, cy, rr + glowSpread);
          rg.addColorStop(0, 'rgba(0,0,0,0)');
          rg.addColorStop(0.35, rgba(ringColor, ALPHA.glow.max * 0.03 * ring.life * entrance));
          rg.addColorStop(0.5, rgba(ringColor, ALPHA.glow.max * 0.06 * ring.life * entrance));
          rg.addColorStop(0.65, rgba(ringColor, ALPHA.glow.max * 0.03 * ring.life * entrance));
          rg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = rg;
          ctx.fillRect(cx - rr - glowSpread, cy - rr - glowSpread,
            (rr + glowSpread) * 2, (rr + glowSpread) * 2);
        }

        // Fresnel edge glow — brighter on outer edge
        if (ring.life > 0.6) {
          ctx.beginPath();
          ctx.arc(cx, cy, rr + thickness * 0.5, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(ringColor, ALPHA.glow.max * 0.04 * ring.life * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 7 — Progress ring + hold indicator + completion bloom
      // ═══════════════════════════════════════════════════════════════
      const progR = coreR * 1.8;
      const progAngle = progFrac * Math.PI * 2;
      if (progFrac > 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, progR, -Math.PI / 2, -Math.PI / 2 + progAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.12 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();

        // Progress tick marks
        const ticks = BEATS_TO_COMPLETE;
        for (let t = 0; t < Math.min(s.beatCount, ticks); t++) {
          const tickAngle = -Math.PI / 2 + (t / ticks) * Math.PI * 2;
          const tInner = progR - px(0.008, minDim);
          const tOuter = progR + px(0.008, minDim);
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(tickAngle) * tInner, cy + Math.sin(tickAngle) * tInner);
          ctx.lineTo(cx + Math.cos(tickAngle) * tOuter, cy + Math.sin(tickAngle) * tOuter);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }
      }

      // Hold indicator (pulsing dashed ring when idle)
      if (!active && !s.completed) {
        const pulse = 0.5 + 0.5 * Math.sin(s.frameCount * 0.03);
        ctx.beginPath();
        ctx.arc(cx, cy, coreR * 2.5, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.04 * pulse * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.setLineDash([px(0.004, minDim), px(0.008, minDim)]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Completion bloom — expanding radiance rings
      if (s.completed) {
        for (let i = 0; i < 4; i++) {
          const rPhase = (s.frameCount * 0.003 + i * 0.25) % 1;
          const rR = coreR * (2 + rPhase * 7);
          const bloomAlpha = ALPHA.content.max * 0.06 * (1 - rPhase) * entrance;
          // Radial glow ring
          const bg = ctx.createRadialGradient(cx, cy, rR - px(0.005, minDim), cx, cy, rR + px(0.005, minDim));
          bg.addColorStop(0, 'rgba(0,0,0,0)');
          bg.addColorStop(0.5, rgba(warmCore, bloomAlpha));
          bg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = bg;
          ctx.fillRect(cx - rR - px(0.005, minDim), cy - rR - px(0.005, minDim),
            (rR + px(0.005, minDim)) * 2, (rR + px(0.005, minDim)) * 2);
        }

        // Final Chladni pattern — fully crystallized
        drawChladniField(ctx, cx, cy, minDim, warmCore, entrance, 1, s.frameCount);
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
