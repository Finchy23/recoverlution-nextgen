/**
 * ATOM 264: THE SISYPHUS SMILE ENGINE
 * ======================================
 * Series 27 — Cosmic Play · Position 4
 *
 * Pushing the boulder is only punishment if you hate the pushing.
 * Establish rhythm — the grind becomes a kinetic game. The boulder
 * transforms from dull stone to holographic crystal as joy builds.
 *
 * SIGNATURE TECHNIQUE: Holographic Diffraction + Generative Art
 *   - Boulder surface gains rainbow diffraction as it rises
 *   - Push sparks scatter in kaleidoscopic 8-fold symmetry
 *   - Slope becomes a holographic ramp with prismatic edge glow
 *   - Momentum trail shows rainbow wake behind the rolling crystal
 *   - At peak: boulder shatters into generative starburst pattern
 *
 * PHYSICS:
 *   - Heavy boulder (SIZE.md radius) at bottom of luminous slope
 *   - Swipe up → impulse pushes boulder against gravity + friction
 *   - Rhythmic swipes build velocity → joy factor rises
 *   - Joy transforms boulder: grey stone → holographic crystal
 *   - Surface gains angle-dependent rainbow diffraction fringes
 *   - Push events spawn kaleidoscopic sparks (8-fold symmetry)
 *   - Rolling motion leaves prismatic momentum trail
 *   - 8 rendering layers: slope terrain, slope glow, trail, sparks,
 *     boulder shadow, boulder glow, boulder body+specular, progress
 *   - Breath couples to: friction reduction, trail warmth, glow depth
 *
 * INTERACTION:
 *   Swipe up → push boulder (drag_snap, step_advance, completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Boulder at peak as holographic crystal orb
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

/** Boulder base radius (fraction of minDim) */
const BOULDER_R = SIZE.md * 0.28;
/** Slope angle (negative = uphill to the right) */
const SLOPE_ANGLE = -Math.PI * 0.18;
/** Gravitational pull per frame along slope */
const GRAVITY_PULL = 0.00007;
/** Upward impulse per swipe event */
const PUSH_IMPULSE = 0.006;
/** Velocity damping factor per frame */
const FRICTION = 0.996;
/** Breath-modulated friction reduction */
const BREATH_FRICTION = 0.18;
/** Position threshold for completion (0–1 along slope) */
const PEAK_POSITION = 0.92;
/** Kaleidoscopic spark count per push */
const SPARK_COUNT = 8;
/** Spark lifetime in frames */
const SPARK_LIFE = 45;
/** Momentum trail max length */
const TRAIL_MAX = 20;
/** Number of slope terrain marks */
const SLOPE_MARKS = 12;
/** Holographic surface segment count for boulder */
const HOLO_SEGMENTS = 16;
/** Number of glow layers for boulder */
const GLOW_LAYERS = 5;
/** Specular highlight offset */
const SPECULAR_OFFSET = 0.25;
/** Specular highlight size */
const SPECULAR_SIZE = 0.2;
/** Breath trail warmth modulation */
const BREATH_TRAIL_WARMTH = 0.06;
/** Breath glow depth modulation */
const BREATH_GLOW_DEPTH = 0.04;
/** Slope length as fraction of minDim */
const SLOPE_LENGTH = 0.6;

// ═════════════════════════════════════════════════════════════════════
// STATE TYPES
// ═════════════════════════════════════════════════════════════════════

/** Kaleidoscopic push spark with 8-fold symmetry color */
interface PushSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  hue: number;
  brightness: number;
}

// ═════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════

/**
 * Convert hue (0–1) to RGB for holographic diffraction.
 */
function hueToRgb(hue: number): RGB {
  const h = ((hue % 1) + 1) % 1;
  const c = 0.65;
  const x = c * (1 - Math.abs((h * 6) % 2 - 1));
  const m = 0.28;
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
 * Get pixel position along the slope for a given parameter t (0–1).
 */
function getSlopePos(t: number, cx: number, cy: number, minDim: number) {
  const len = px(SLOPE_LENGTH, minDim);
  const startX = cx - len * 0.42;
  const startY = cy + len * 0.28;
  return {
    x: startX + t * len * Math.cos(SLOPE_ANGLE) * 0.95,
    y: startY + t * len * Math.sin(SLOPE_ANGLE) * 0.95,
  };
}

/**
 * Draw specular highlight on sphere.
 */
function drawSpecular(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number, entrance: number,
): void {
  const sx = cx - r * SPECULAR_OFFSET;
  const sy = cy - r * SPECULAR_OFFSET;
  const sr = r * SPECULAR_SIZE;
  const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
  sg.addColorStop(0, `rgba(255,255,255,${0.38 * entrance})`);
  sg.addColorStop(0.5, `rgba(255,255,255,${0.1 * entrance})`);
  sg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(sx, sy, sr, 0, Math.PI * 2);
  ctx.fill();
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function SisyphusSmileAtom({
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
    position: 0.05,
    velocity: 0,
    trail: [] as Array<{ x: number; y: number; vel: number }>,
    sparks: [] as PushSpark[],
    swiping: false,
    lastY: 0,
    stepNotified: false,
    completed: false,
    completionGlow: 0,
    holoAngle: 0,
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
      const time = s.frameCount * 0.012;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      // ═══════════════════════════════════════════════════════════════
      // REDUCED MOTION — boulder at peak as holographic orb
      // ═══════════════════════════════════════════════════════════════
      if (p.reducedMotion) {
        const peakPos = getSlopePos(PEAK_POSITION, cx, cy, minDim);
        const bR = px(BOULDER_R, minDim);
        // Glow
        for (let gi = GLOW_LAYERS - 1; gi >= 0; gi--) {
          const gR = bR * (2 + gi * 1.8);
          const gA = ALPHA.glow.max * 0.08 * entrance / (gi + 1);
          const gg = ctx.createRadialGradient(peakPos.x, peakPos.y, 0, peakPos.x, peakPos.y, gR);
          gg.addColorStop(0, rgba(s.primaryRgb, gA));
          gg.addColorStop(0.4, rgba(s.primaryRgb, gA * 0.3));
          gg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = gg;
          ctx.fillRect(peakPos.x - gR, peakPos.y - gR, gR * 2, gR * 2);
        }
        // Body
        const bg = ctx.createRadialGradient(peakPos.x - bR * 0.2, peakPos.y - bR * 0.2, bR * 0.1, peakPos.x, peakPos.y, bR);
        bg.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as unknown as RGB, 0.35), ALPHA.content.max * 0.5 * entrance));
        bg.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance));
        bg.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.1 * entrance));
        ctx.beginPath(); ctx.arc(peakPos.x, peakPos.y, bR, 0, Math.PI * 2);
        ctx.fillStyle = bg; ctx.fill();
        drawSpecular(ctx, peakPos.x, peakPos.y, bR, entrance);
        cb.onStateChange?.(1);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      if (p.phase === 'resolve') { s.position = PEAK_POSITION; s.completed = true; }

      // ═══════════════════════════════════════════════════════════════
      // BOULDER PHYSICS
      // ═══════════════════════════════════════════════════════════════
      const frictionMod = FRICTION + p.breathAmplitude * BREATH_FRICTION * 0.001;
      s.velocity -= GRAVITY_PULL * ms;
      s.velocity *= frictionMod;
      s.position = Math.max(0, Math.min(1, s.position + s.velocity * ms));
      if (s.position <= 0 && s.velocity < 0) s.velocity = 0;

      // Holographic angle accumulates with velocity
      s.holoAngle += Math.abs(s.velocity) * 8 * ms;

      const boulderPos = getSlopePos(s.position, cx, cy, minDim);

      // Trail
      s.trail.push({ x: boulderPos.x, y: boulderPos.y, vel: Math.abs(s.velocity) });
      if (s.trail.length > TRAIL_MAX) s.trail.shift();

      // Spark physics
      for (let i = s.sparks.length - 1; i >= 0; i--) {
        const sp = s.sparks[i];
        sp.x += sp.vx * ms;
        sp.y += sp.vy * ms;
        sp.vy += 0.00006 * ms;
        sp.life -= ms;
        if (sp.life <= 0) s.sparks.splice(i, 1);
      }

      // Completion
      const joyFactor = s.position;
      if (s.position >= PEAK_POSITION * 0.5 && !s.stepNotified) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }
      if (s.position >= PEAK_POSITION && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      if (s.completed) s.completionGlow = Math.min(1, s.completionGlow + 0.005 * ms);
      cb.onStateChange?.(s.completed ? 0.5 + s.completionGlow * 0.5 : s.position * 0.5);

      const breathTrailWarmth = p.breathAmplitude * BREATH_TRAIL_WARMTH;
      const breathGlowDepth = p.breathAmplitude * BREATH_GLOW_DEPTH;

      // ═══════════════════════════════════════════════════════════════
      // LAYER 1 — Slope terrain with tick marks
      // ═══════════════════════════════════════════════════════════════
      const slopeStart = getSlopePos(0, cx, cy, minDim);
      const slopeEnd = getSlopePos(1.05, cx, cy, minDim);

      // Slope line
      ctx.beginPath();
      ctx.moveTo(slopeStart.x, slopeStart.y);
      ctx.lineTo(slopeEnd.x, slopeEnd.y);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance);
      ctx.lineWidth = px(STROKE.light, minDim);
      ctx.stroke();

      // Terrain tick marks with holographic hints
      const perpX = Math.sin(SLOPE_ANGLE);
      const perpY = -Math.cos(SLOPE_ANGLE);
      for (let i = 0; i <= SLOPE_MARKS; i++) {
        const t = i / SLOPE_MARKS;
        const markPos = getSlopePos(t, cx, cy, minDim);
        const markLen = px(0.01, minDim);
        const markHue = (t * 0.5 + s.holoAngle * 0.02) % 1;
        const markColor = lerpColor(s.primaryRgb, hueToRgb(markHue), joyFactor * 0.3);

        ctx.beginPath();
        ctx.moveTo(markPos.x - perpX * markLen, markPos.y - perpY * markLen);
        ctx.lineTo(markPos.x + perpX * markLen, markPos.y + perpY * markLen);
        ctx.strokeStyle = rgba(markColor, ALPHA.content.max * 0.04 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ══���════════════════════════════════════════════════════════════
      // LAYER 2 — Slope prismatic edge glow
      // ═══════════════════════════════════════════════════════════════
      if (joyFactor > 0.15) {
        const edgeIntensity = (joyFactor - 0.15) / 0.85;
        const glowWidth = px(0.015 * edgeIntensity, minDim);

        // Draw glow along slope using perpendicular gradient
        ctx.save();
        ctx.translate(slopeStart.x, slopeStart.y);
        ctx.rotate(SLOPE_ANGLE);
        const sLen = px(SLOPE_LENGTH, minDim);
        const eg = ctx.createLinearGradient(0, -glowWidth, 0, glowWidth);
        const edgeHue = (s.holoAngle * 0.03) % 1;
        eg.addColorStop(0, 'rgba(0,0,0,0)');
        eg.addColorStop(0.3, rgba(hueToRgb(edgeHue), ALPHA.glow.max * 0.03 * edgeIntensity * entrance));
        eg.addColorStop(0.5, rgba(hueToRgb((edgeHue + 0.15) % 1), ALPHA.glow.max * 0.05 * edgeIntensity * entrance));
        eg.addColorStop(0.7, rgba(hueToRgb((edgeHue + 0.3) % 1), ALPHA.glow.max * 0.03 * edgeIntensity * entrance));
        eg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = eg;
        ctx.fillRect(0, -glowWidth, sLen, glowWidth * 2);
        ctx.restore();
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 3 — Prismatic momentum trail
      // ═══════════════════════════════════════════════════════════════
      if (s.trail.length > 2 && Math.abs(s.velocity) > 0.0004) {
        for (let i = 0; i < s.trail.length; i++) {
          const tp = s.trail[i];
          const t = i / s.trail.length;
          const trailR = px(BOULDER_R * 0.35 * t * joyFactor, minDim);
          if (trailR < 0.4) continue;

          const trailHue = (t * 0.3 + s.holoAngle * 0.04 + breathTrailWarmth) % 1;
          const trailColor = lerpColor(s.primaryRgb, hueToRgb(trailHue), joyFactor * 0.5);
          const trailAlpha = ALPHA.content.max * 0.05 * t * (0.5 + joyFactor * 0.5) * entrance;

          // Trail dot with glow
          const tgR = trailR * 2;
          const tg = ctx.createRadialGradient(tp.x, tp.y, 0, tp.x, tp.y, tgR);
          tg.addColorStop(0, rgba(trailColor, trailAlpha));
          tg.addColorStop(0.5, rgba(trailColor, trailAlpha * 0.3));
          tg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = tg;
          ctx.fillRect(tp.x - tgR, tp.y - tgR, tgR * 2, tgR * 2);
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 4 — Kaleidoscopic push sparks
      // ═══════════════════════════════════════════════════════════════
      for (const sp of s.sparks) {
        const life = sp.life / SPARK_LIFE;
        const spR = px(0.004 * life, minDim);
        if (spR < 0.3) continue;

        const sparkColor = hueToRgb(sp.hue);

        // Spark glow
        const sgR = spR * 3;
        const sg = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, sgR);
        sg.addColorStop(0, rgba(sparkColor, ALPHA.glow.max * 0.15 * life * sp.brightness * entrance));
        sg.addColorStop(0.5, rgba(sparkColor, ALPHA.glow.max * 0.04 * life * entrance));
        sg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = sg;
        ctx.fillRect(sp.x - sgR, sp.y - sgR, sgR * 2, sgR * 2);

        // Spark body
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, spR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(lerpColor(sparkColor, [255, 255, 255] as unknown as RGB, 0.35),
          ALPHA.content.max * 0.35 * life * entrance);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 5 — Boulder shadow
      // ═══════════════════════════════════════════════════════════════
      const bR = px(BOULDER_R, minDim);
      const shadowR = bR * 1.4;
      const shadowOffset = bR * 0.25;
      const sGrad = ctx.createRadialGradient(
        boulderPos.x + perpX * shadowOffset, boulderPos.y + perpY * shadowOffset, 0,
        boulderPos.x + perpX * shadowOffset, boulderPos.y + perpY * shadowOffset, shadowR,
      );
      sGrad.addColorStop(0, rgba([0, 0, 0] as unknown as RGB, 0.06 * entrance));
      sGrad.addColorStop(0.5, rgba([0, 0, 0] as unknown as RGB, 0.02 * entrance));
      sGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sGrad;
      ctx.beginPath();
      ctx.ellipse(
        boulderPos.x + perpX * shadowOffset,
        boulderPos.y + perpY * shadowOffset,
        shadowR, shadowR * 0.45, SLOPE_ANGLE, 0, Math.PI * 2,
      );
      ctx.fill();

      // ═══════════════════════════════════════════════════════════════
      // LAYER 6 — Boulder glow field (intensifies with joy)
      // ═══════════════════════════════════════════════════════════════
      const holoHue = (s.holoAngle * 0.08) % 1;
      const bColor = lerpColor(s.accentRgb, s.primaryRgb, joyFactor);
      const glowColor = lerpColor(bColor, hueToRgb(holoHue), joyFactor * 0.4 + breathGlowDepth);

      for (let gi = GLOW_LAYERS - 1; gi >= 0; gi--) {
        const gR = bR * (1.6 + gi * 1.6 + joyFactor * 2.5);
        const gA = ALPHA.glow.max * (0.02 + joyFactor * 0.1 + breathGlowDepth) * entrance / (gi + 1);
        const gg = ctx.createRadialGradient(boulderPos.x, boulderPos.y, 0, boulderPos.x, boulderPos.y, gR);
        gg.addColorStop(0, rgba(glowColor, gA));
        gg.addColorStop(0.3, rgba(glowColor, gA * 0.4));
        gg.addColorStop(0.6, rgba(bColor, gA * 0.1));
        gg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gg;
        ctx.fillRect(boulderPos.x - gR, boulderPos.y - gR, gR * 2, gR * 2);
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 7 — Boulder body with holographic diffraction surface
      // ═══════════════════════════════════════════════════════════════

      // Base body gradient (5-stop)
      const bodyAlpha = ALPHA.content.max * (0.22 + joyFactor * 0.28) * entrance;
      const bodyGrad = ctx.createRadialGradient(
        boulderPos.x - bR * 0.2, boulderPos.y - bR * 0.2, bR * 0.05,
        boulderPos.x, boulderPos.y, bR,
      );
      bodyGrad.addColorStop(0, rgba(lerpColor(bColor, [255, 255, 255] as unknown as RGB, 0.35), bodyAlpha));
      bodyGrad.addColorStop(0.3, rgba(bColor, bodyAlpha));
      bodyGrad.addColorStop(0.6, rgba(lerpColor(bColor, s.primaryRgb, 0.3), bodyAlpha * 0.75));
      bodyGrad.addColorStop(0.85, rgba(s.primaryRgb, bodyAlpha * 0.35));
      bodyGrad.addColorStop(1, rgba(s.primaryRgb, bodyAlpha * 0.05));
      ctx.beginPath();
      ctx.arc(boulderPos.x, boulderPos.y, bR, 0, Math.PI * 2);
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Holographic diffraction fringes on boulder surface
      if (joyFactor > 0.1) {
        const fringeIntensity = (joyFactor - 0.1) / 0.9;
        for (let seg = 0; seg < HOLO_SEGMENTS; seg++) {
          const segAngle = (seg / HOLO_SEGMENTS) * Math.PI * 2;
          const segHue = (seg / HOLO_SEGMENTS + s.holoAngle * 0.05) % 1;
          const segColor = hueToRgb(segHue);
          const segAlpha = ALPHA.content.max * 0.04 * fringeIntensity * entrance;

          const arcStart = segAngle;
          const arcEnd = segAngle + (Math.PI * 2) / HOLO_SEGMENTS;
          ctx.beginPath();
          ctx.arc(boulderPos.x, boulderPos.y, bR * 0.92, arcStart, arcEnd);
          ctx.arc(boulderPos.x, boulderPos.y, bR * 0.6, arcEnd, arcStart, true);
          ctx.closePath();
          ctx.fillStyle = rgba(segColor, segAlpha);
          ctx.fill();
        }
      }

      // Edge rim (Fresnel holographic)
      if (joyFactor > 0.2) {
        ctx.beginPath();
        ctx.arc(boulderPos.x, boulderPos.y, bR, 0, Math.PI * 2);
        const rimHue = (holoHue + 0.3) % 1;
        ctx.strokeStyle = rgba(hueToRgb(rimHue), ALPHA.content.max * 0.08 * joyFactor * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
      }

      // Specular highlight
      drawSpecular(ctx, boulderPos.x, boulderPos.y, bR, entrance);

      // Secondary reflection
      if (bR > 2) {
        ctx.beginPath();
        ctx.ellipse(
          boulderPos.x + bR * 0.12, boulderPos.y + bR * 0.18,
          bR * 0.1, bR * 0.06, 0.5, 0, Math.PI * 2,
        );
        ctx.fillStyle = `rgba(255,255,255,${0.05 * entrance})`;
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 8 — Progress arc + completion starburst
      // ═══════════════════════════════════════════════════════════════
      if (!s.completed && s.position > 0.03) {
        const progR = px(0.04, minDim);
        const progAngle = s.position * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy - px(0.4, minDim), progR, -Math.PI / 2, -Math.PI / 2 + progAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.18 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      // Completion: holographic starburst
      if (s.completed) {
        for (let i = 0; i < 6; i++) {
          const rPhase = (time * 0.012 + i * 0.167) % 1;
          const rR = px(SIZE.md * (0.3 + rPhase * 3.5), minDim);
          const burstHue = (i * 0.167 + time * 0.008) % 1;
          const burstColor = hueToRgb(burstHue);
          const burstAlpha = ALPHA.content.max * 0.04 * (1 - rPhase) * s.completionGlow * entrance;

          ctx.beginPath();
          ctx.arc(boulderPos.x, boulderPos.y, rR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(burstColor, burstAlpha);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer events ─────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      stateRef.current.swiping = true;
      stateRef.current.lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.swiping) return;
      const dy = s.lastY - e.clientY;
      if (dy > 2) {
        s.velocity += PUSH_IMPULSE * Math.min(3, dy * 0.04);
        // Spawn kaleidoscopic sparks (8-fold symmetry)
        const bPos = getSlopePos(
          s.position,
          viewport.width / 2, viewport.height / 2,
          Math.min(viewport.width, viewport.height),
        );
        for (let i = 0; i < SPARK_COUNT; i++) {
          const sa = (i / SPARK_COUNT) * Math.PI * 2;
          const ss = 0.002 + Math.random() * 0.003;
          s.sparks.push({
            x: bPos.x, y: bPos.y,
            vx: Math.cos(sa) * ss,
            vy: Math.sin(sa) * ss - 0.001,
            life: SPARK_LIFE,
            hue: i / SPARK_COUNT + s.holoAngle * 0.05,
            brightness: 0.5 + Math.random() * 0.5,
          });
        }
        callbacksRef.current.onHaptic('drag_snap');
      }
      s.lastY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.swiping = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ns-resize' }}
      />
    </div>
  );
}
