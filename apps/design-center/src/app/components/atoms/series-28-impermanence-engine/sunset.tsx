/**
 * ATOM 279: THE SUNSET ENGINE
 * ==============================
 * Series 28 — Impermanence Engine · Position 9
 *
 * You do not cry when the sun sets — you marvel at the colors.
 * Treat the end of this chapter the same way.
 *
 * SIGNATURE TECHNIQUE: Fabric/Cloth Simulation + Entropy Rendering
 *   - Sky rendered as layered cloth curtains (horizontal fiber bands)
 *   - Sun descent drags cloth bands through Rayleigh color spectrum
 *   - Each cloth band refracts differently (blue → gold → crimson → purple)
 *   - Entropy arc: bright orderly noon → color entropy cascade → peaceful night
 *   - Stars emerge as pinhole light through dark cloth
 *   - Horizon haze = translucent cloth veil with atmospheric scattering
 *
 * PHYSICS:
 *   - Sun disc at top: draggable downward toward horizon
 *   - Sky = 8 horizontal cloth bands, each with fiber texture
 *   - Band colors shift through scattering spectrum as sun descends
 *   - Horizon line with atmospheric haze veil (cloth membrane)
 *   - Stars = tiny punctures in dark cloth that glow through
 *   - Cloud wisps as floating cloth scraps that catch sunset color
 *   - 8 render layers: sky cloth bands, cloud wisps, horizon veil,
 *     sun glow, sun disc, star field, specular, completion halo
 *
 * INTERACTION:
 *   Drag sun downward (drag_snap → step_advance → completion)
 *
 * RENDER: Canvas 2D with cloth-band sky + atmospheric scattering
 * REDUCED MOTION: Static twilight scene
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, motionScale,
  easeOutCubic,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Sun disc radius (fraction of minDim) */
const SUN_R = 0.06;
/** Sun starting Y position (fraction of viewport height) */
const SUN_START_Y = 0.18;
/** Horizon line Y position */
const HORIZON_Y = 0.72;
/** Number of sky cloth bands */
const SKY_BANDS = 8;
/** Number of stars that emerge */
const STAR_COUNT = 40;
/** Number of cloud wisps */
const CLOUD_COUNT = 5;
/** Star emerge threshold (sun descent fraction) */
const STAR_THRESHOLD = 0.6;
/** Drag sensitivity for sun position */
const DRAG_SENSITIVITY = 1.2;
/** Step advance threshold */
const STEP_THRESHOLD = 0.5;
/** Cloth band fiber count per band */
const BAND_FIBERS = 12;
/** Horizon veil cloth drape amplitude */
const VEIL_DRAPE = 0.006;
/** Breath coupling to cloud drift */
const BREATH_CLOUD = 0.003;

// ═════════════════════════════════════════════════════════════════════
// COLOR SPECTRUM (Rayleigh scattering progression)
// ═════════════════════════════════════════════════════════════════════
/** Noon sky blue */
const NOON: RGB = [80, 140, 220];
/** Golden hour */
const GOLDEN: RGB = [230, 180, 80];
/** Deep orange */
const ORANGE: RGB = [220, 120, 50];
/** Crimson sunset */
const CRIMSON: RGB = [180, 50, 60];
/** Deep purple dusk */
const PURPLE: RGB = [60, 30, 90];
/** Night navy */
const NIGHT: RGB = [12, 10, 25];

// ═════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═════════════════════════════════════════════════════════════════════

interface Star {
  x: number; y: number;
  size: number;
  twinklePhase: number;
  twinkleSpeed: number;
}

interface CloudWisp {
  x: number; y: number;
  w: number; h: number;
  speed: number;
  phase: number;
}

// ═════════════════════════════════════════════════════════════════════
// HELPERS
// ═════════════════════════════════════════════════════════════════════

function createStars(): Star[] {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: 0.02 + Math.random() * 0.96,
    y: 0.02 + Math.random() * 0.65,
    size: 0.001 + Math.random() * 0.002,
    twinklePhase: Math.random() * Math.PI * 2,
    twinkleSpeed: 0.02 + Math.random() * 0.04,
  }));
}

function createClouds(): CloudWisp[] {
  return Array.from({ length: CLOUD_COUNT }, () => ({
    x: 0.1 + Math.random() * 0.8,
    y: 0.15 + Math.random() * 0.45,
    w: 0.08 + Math.random() * 0.12,
    h: 0.01 + Math.random() * 0.015,
    speed: 0.0001 + Math.random() * 0.0003,
    phase: Math.random() * Math.PI * 2,
  }));
}

/** Interpolate sky color based on sun descent (0=noon, 1=below horizon) */
function skyColor(descent: number, bandFrac: number): RGB {
  // Higher bands shift faster
  const adj = descent * (1 + (1 - bandFrac) * 0.3);
  if (adj < 0.25) return lerpColor(NOON, GOLDEN, adj / 0.25);
  if (adj < 0.5) return lerpColor(GOLDEN, ORANGE, (adj - 0.25) / 0.25);
  if (adj < 0.7) return lerpColor(ORANGE, CRIMSON, (adj - 0.5) / 0.2);
  if (adj < 0.9) return lerpColor(CRIMSON, PURPLE, (adj - 0.7) / 0.2);
  return lerpColor(PURPLE, NIGHT, Math.min(1, (adj - 0.9) / 0.15));
}

export default function SunsetAtom({
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
    sunY: SUN_START_Y,
    descent: 0,
    dragging: false,
    dragStartY: 0,
    dragStartSunY: 0,
    stepNotified: false,
    completed: false,
    stars: createStars(),
    clouds: createClouds(),
    dragNotified: false,
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
      const time = s.frameCount * 0.015;
      const breath = (p.breathAmplitude ?? 0) * BREATH_CLOUD;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      if (p.reducedMotion) { s.descent = 0.85; s.sunY = HORIZON_Y + 0.05; s.completed = true; }
      if (p.phase === 'resolve') { s.descent = 1; s.sunY = HORIZON_Y + 0.1; s.completed = true; }

      // Calculate descent
      s.descent = Math.max(0, Math.min(1, (s.sunY - SUN_START_Y) / (HORIZON_Y + 0.05 - SUN_START_Y)));

      // Completion check
      if (s.descent >= 0.95 && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      if (s.descent >= STEP_THRESHOLD && !s.stepNotified) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }

      cb.onStateChange?.(s.completed ? 1 : s.descent);

      // ── 1. Sky cloth bands ──────────────────────────────────────
      for (let b = 0; b < SKY_BANDS; b++) {
        const bFrac = b / SKY_BANDS;
        const nextFrac = (b + 1) / SKY_BANDS;
        const bandTop = bFrac * HORIZON_Y * h;
        const bandBot = nextFrac * HORIZON_Y * h;
        const bandH = bandBot - bandTop;

        const col = skyColor(s.descent, bFrac);
        const nextCol = skyColor(s.descent, nextFrac);
        const bandGrad = ctx.createLinearGradient(0, bandTop, 0, bandBot);
        bandGrad.addColorStop(0, rgba(col, ALPHA.content.max * 0.22 * entrance));
        bandGrad.addColorStop(0.5, rgba(lerpColor(col, nextCol, 0.5), ALPHA.content.max * 0.18 * entrance));
        bandGrad.addColorStop(1, rgba(nextCol, ALPHA.content.max * 0.22 * entrance));
        ctx.fillStyle = bandGrad;
        ctx.fillRect(0, bandTop, w, bandH + 1);

        // Cloth fiber lines within band
        for (let f = 0; f < BAND_FIBERS; f++) {
          const fFrac = f / BAND_FIBERS;
          const fy = bandTop + fFrac * bandH;
          const fWave = Math.sin(time * 0.5 + b * 2 + f * 0.8) * px(0.002, minDim);
          ctx.beginPath();
          ctx.moveTo(0, fy + fWave);
          ctx.lineTo(w, fy - fWave);
          ctx.strokeStyle = rgba(col, ALPHA.content.max * 0.03 * entrance);
          ctx.lineWidth = px(STROKE.hairline * 0.5, minDim);
          ctx.stroke();
        }
      }

      // Ground below horizon
      const groundGrad = ctx.createLinearGradient(0, HORIZON_Y * h, 0, h);
      const groundCol = skyColor(s.descent, 1);
      groundGrad.addColorStop(0, rgba(groundCol, ALPHA.content.max * 0.15 * entrance));
      groundGrad.addColorStop(0.5, rgba(lerpColor(groundCol, NIGHT, 0.3), ALPHA.content.max * 0.10 * entrance));
      groundGrad.addColorStop(1, rgba(NIGHT, ALPHA.content.max * 0.08 * entrance));
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, HORIZON_Y * h, w, h - HORIZON_Y * h);

      // ── 2. Cloud wisps (cloth scraps catching color) ────────────
      for (const cl of s.clouds) {
        cl.x += cl.speed * ms + breath * Math.sin(time + cl.phase);
        if (cl.x > 1.2) cl.x = -0.2;
        const cloudCol = skyColor(s.descent, cl.y / HORIZON_Y);
        const brightCol: RGB = [
          Math.min(255, cloudCol[0] + 40),
          Math.min(255, cloudCol[1] + 30),
          Math.min(255, cloudCol[2] + 20),
        ];
        const clx = cl.x * w;
        const cly = cl.y * h;
        const clw = cl.w * w;
        const clh = cl.h * h;

        // Cloud as elongated gradient
        const clg = ctx.createRadialGradient(clx, cly, 0, clx, cly, clw * 0.5);
        clg.addColorStop(0, rgba(brightCol, ALPHA.content.max * 0.10 * entrance));
        clg.addColorStop(0.4, rgba(cloudCol, ALPHA.content.max * 0.06 * entrance));
        clg.addColorStop(1, rgba(cloudCol, 0));
        ctx.fillStyle = clg;
        ctx.beginPath();
        ctx.ellipse(clx, cly, clw * 0.5, clh, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cloth fiber across cloud
        ctx.beginPath();
        ctx.moveTo(clx - clw * 0.4, cly);
        ctx.lineTo(clx + clw * 0.4, cly);
        ctx.strokeStyle = rgba(brightCol, ALPHA.content.max * 0.04 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ── 3. Horizon veil (cloth membrane with drape) ─────────────
      const horizPx = HORIZON_Y * h;
      ctx.beginPath();
      for (let hx = 0; hx <= w; hx += 4) {
        const hFrac = hx / w;
        const drape = Math.sin(hFrac * Math.PI * 8 + time * 1.5) * px(VEIL_DRAPE, minDim);
        if (hx === 0) ctx.moveTo(hx, horizPx + drape);
        else ctx.lineTo(hx, horizPx + drape);
      }
      const horizCol = skyColor(s.descent, 0.95);
      ctx.strokeStyle = rgba(horizCol, ALPHA.content.max * 0.15 * entrance);
      ctx.lineWidth = px(STROKE.light, minDim);
      ctx.stroke();

      // Atmospheric haze along horizon
      const hazeR = px(0.35, minDim);
      const hazeG = ctx.createRadialGradient(cx, horizPx, 0, cx, horizPx, hazeR);
      const hazeCol = lerpColor(skyColor(s.descent, 0.8), GOLDEN, s.descent * 0.3);
      hazeG.addColorStop(0, rgba(hazeCol, ALPHA.glow.max * 0.10 * entrance));
      hazeG.addColorStop(0.4, rgba(hazeCol, ALPHA.glow.max * 0.04 * entrance));
      hazeG.addColorStop(0.7, rgba(hazeCol, ALPHA.glow.max * 0.01 * entrance));
      hazeG.addColorStop(1, rgba(hazeCol, 0));
      ctx.fillStyle = hazeG;
      ctx.fillRect(cx - hazeR, horizPx - hazeR, hazeR * 2, hazeR * 2);

      // ── 4. Sun glow ────────────────────────────────────────────
      const sunPxY = s.sunY * h;
      const sunR = px(SUN_R, minDim);

      // Sun glow corona
      for (let g = 4; g >= 0; g--) {
        const gR = sunR * (3 + g * 2);
        const gA = ALPHA.glow.max * 0.06 * (1 - s.descent * 0.7) * entrance / (g + 1);
        const gCol = lerpColor(GOLDEN, CRIMSON, s.descent * 0.6);
        const gg = ctx.createRadialGradient(cx, sunPxY, 0, cx, sunPxY, gR);
        gg.addColorStop(0, rgba(gCol, gA));
        gg.addColorStop(0.3, rgba(gCol, gA * 0.4));
        gg.addColorStop(0.6, rgba(gCol, gA * 0.1));
        gg.addColorStop(1, rgba(gCol, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(cx - gR, sunPxY - gR, gR * 2, gR * 2);
      }

      // ── 5. Sun disc ────────────────────────────────────────────
      if (s.sunY < HORIZON_Y + SUN_R * 3) {
        const sunGrad = ctx.createRadialGradient(cx - sunR * 0.15, sunPxY - sunR * 0.15, 0, cx, sunPxY, sunR);
        const discCol = lerpColor(GOLDEN, CRIMSON, s.descent * 0.8);
        const corCol: RGB = [
          Math.min(255, discCol[0] + 30),
          Math.min(255, discCol[1] + 20),
          discCol[2],
        ];
        sunGrad.addColorStop(0, rgba(corCol, ALPHA.content.max * 0.40 * entrance));
        sunGrad.addColorStop(0.3, rgba(discCol, ALPHA.content.max * 0.35 * entrance));
        sunGrad.addColorStop(0.7, rgba(discCol, ALPHA.content.max * 0.25 * entrance));
        sunGrad.addColorStop(1, rgba(discCol, ALPHA.content.max * 0.10 * entrance));
        ctx.beginPath();
        ctx.arc(cx, sunPxY, sunR, 0, Math.PI * 2);
        ctx.fillStyle = sunGrad;
        ctx.fill();

        // Sun specular
        const sSpecR = sunR * 0.25;
        const sSpecG = ctx.createRadialGradient(cx - sunR * 0.25, sunPxY - sunR * 0.25, 0,
          cx - sunR * 0.25, sunPxY - sunR * 0.25, sSpecR);
        sSpecG.addColorStop(0, rgba([255, 255, 240] as RGB, ALPHA.content.max * 0.25 * entrance));
        sSpecG.addColorStop(0.5, rgba([255, 255, 240] as RGB, ALPHA.content.max * 0.08 * entrance));
        sSpecG.addColorStop(1, rgba([255, 255, 240] as RGB, 0));
        ctx.fillStyle = sSpecG;
        ctx.beginPath();
        ctx.arc(cx - sunR * 0.25, sunPxY - sunR * 0.25, sSpecR, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── 6. Star field ──────────────────────────────────────────
      if (s.descent > STAR_THRESHOLD) {
        const starAlphaBase = (s.descent - STAR_THRESHOLD) / (1 - STAR_THRESHOLD);
        for (const star of s.stars) {
          const twinkle = (Math.sin(time * star.twinkleSpeed * 60 + star.twinklePhase) * 0.5 + 0.5);
          const sAlpha = ALPHA.content.max * 0.18 * starAlphaBase * twinkle * entrance;
          const sx = star.x * w;
          const sy = star.y * h;
          const sr = px(star.size, minDim);

          const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 2);
          sg.addColorStop(0, rgba([255, 255, 240] as RGB, sAlpha));
          sg.addColorStop(0.3, rgba([220, 220, 255] as RGB, sAlpha * 0.4));
          sg.addColorStop(1, rgba([220, 220, 255] as RGB, 0));
          ctx.fillStyle = sg;
          ctx.fillRect(sx - sr * 2, sy - sr * 2, sr * 4, sr * 4);

          // Star center dot
          ctx.beginPath();
          ctx.arc(sx, sy, sr * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = rgba([255, 255, 255] as RGB, sAlpha * 1.2);
          ctx.fill();
        }
      }

      // ── 7. Afterglow (post-sunset beauty) ──────────────────────
      if (s.descent > 0.7) {
        const afterFrac = (s.descent - 0.7) / 0.3;
        const afterR = px(0.4, minDim) * afterFrac;
        const afterG = ctx.createRadialGradient(cx, horizPx, 0, cx, horizPx, afterR);
        const afterCol = lerpColor(CRIMSON, PURPLE, afterFrac * 0.6);
        afterG.addColorStop(0, rgba(afterCol, ALPHA.glow.max * 0.06 * afterFrac * entrance));
        afterG.addColorStop(0.4, rgba(afterCol, ALPHA.glow.max * 0.02 * afterFrac * entrance));
        afterG.addColorStop(1, rgba(afterCol, 0));
        ctx.fillStyle = afterG;
        ctx.fillRect(cx - afterR, horizPx - afterR * 0.5, afterR * 2, afterR);
      }

      // ── 8. Completion peaceful halo ─────────────────────────────
      if (s.completed) {
        for (let i = 0; i < 3; i++) {
          const rPhase = (time * 0.03 + i * 0.33) % 1;
          const rR = px(0.08 + rPhase * 0.2, minDim);
          ctx.beginPath();
          ctx.arc(cx, horizPx, rR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(PURPLE, ALPHA.content.max * 0.03 * (1 - rPhase) * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer events ─────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed) return;
      s.dragging = true;
      s.dragStartY = e.clientY;
      s.dragStartSunY = s.sunY;
      if (!s.dragNotified) {
        s.dragNotified = true;
        callbacksRef.current.onHaptic('drag_snap');
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const dy = (e.clientY - s.dragStartY) / rect.height * DRAG_SENSITIVITY;
      s.sunY = Math.max(SUN_START_Y, Math.min(HORIZON_Y + 0.1, s.dragStartSunY + dy));
    };
    const onUp = () => { stateRef.current.dragging = false; };

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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}
