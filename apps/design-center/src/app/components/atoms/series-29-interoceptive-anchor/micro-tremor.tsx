/**
 * ATOM 287: THE MICRO-TREMOR ENGINE
 * ====================================
 * Series 29 — Interoceptive Anchor · Position 7
 *
 * The glass mirrors your hidden adrenaline at 100x magnification.
 * Consciously relax until the mercury pools into a flawless mirror.
 *
 * SIGNATURE TECHNIQUE: Topographic contour lines + Chladni patterns
 *   - Mercury surface disturbance renders as topographic elevation map
 *   - Contour lines track the wave heights across the liquid surface
 *   - When calm is achieved: Chladni nodal pattern forms ON the mirror
 *     surface — the resonance frequency of perfect stillness
 *   - Teaches: your body's micro-tremors reveal hidden tension
 *
 * PHYSICS:
 *   - 50-point liquid mercury surface with spring-damper physics
 *   - Pointer movement = adrenaline → surface ripples at 100x magnification
 *   - Sustained stillness → surface smooths → mirror forms
 *   - 8 layers: topographic contours, Chladni mirror pattern,
 *     mercury body with depth gradient, surface line with highlights,
 *     surface reflection, jitter seismograph, calmness meter,
 *     completion mirror glow
 *   - Breath couples to: surface warmth, mirror clarity, glow pulse
 *
 * INTERACTION:
 *   Move pointer → mercury ripples (magnified tremor)
 *   Hold still → mercury smooths → mirror (step_advance → completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static perfect mirror surface with Chladni
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

/** Number of surface simulation points */
const SURFACE_POINTS = 50;
/** Surface vertical position (fraction of height) */
const SURFACE_Y = 0.5;
/** Mercury depth below surface (fraction of minDim) */
const MERCURY_DEPTH = 0.18;
/** Surface spring restoration constant */
const RIPPLE_SPRING = 0.008;
/** Surface wave spread to neighbors */
const RIPPLE_SPREAD = 0.15;
/** Surface velocity damping per frame */
const RIPPLE_DAMPING = 0.975;
/** Pointer movement magnification factor */
const MOVEMENT_MAGNIFICATION = 100;
/** Jitter threshold for "calm" detection */
const CALM_THRESHOLD = 0.005;
/** Frames of calm needed for completion (~3s) */
const CALM_FRAMES_TO_COMPLETE = 180;
/** Number of topographic contour levels */
const CONTOUR_LEVELS = 8;
/** Contour level spacing in wave units */
const CONTOUR_SPACING_WAVE = 0.002;
/** Chladni grid resolution for mirror pattern */
const CHLADNI_RES = 24;
/** Chladni threshold */
const CHLADNI_THRESH = 0.14;
/** Chladni dot radius */
const CHLADNI_DOT = 0.002;
/** Seismograph trace length */
const SEISMO_POINTS = 30;
/** Breath warmth coupling */
const BREATH_WARMTH = 0.05;
/** Breath mirror clarity coupling */
const BREATH_CLARITY = 0.04;

// ═════════════════════════════════════════════════════════════════════
// STATE TYPES
// ═════════════════════════════════════════════════════════════════════

/** Surface simulation point */
interface SurfacePoint {
  y: number;
  vy: number;
}

// ═════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════

/**
 * Draw topographic contour lines along the mercury surface.
 * Each contour traces a horizontal isoline at a specific wave height.
 */
function drawSurfaceContours(
  ctx: CanvasRenderingContext2D,
  surface: SurfacePoint[], w: number, surfY: number, minDim: number,
  rgb: RGB, entrance: number, jitter: number,
): void {
  if (jitter < 0.001) return; // no contours when perfectly calm
  for (let level = -CONTOUR_LEVELS / 2; level <= CONTOUR_LEVELS / 2; level++) {
    if (level === 0) continue;
    const targetH = level * CONTOUR_SPACING_WAVE;
    const alpha = ALPHA.atmosphere.max * 0.25 * Math.min(1, jitter * 50) * entrance *
      (1 - Math.abs(level) / (CONTOUR_LEVELS / 2 + 1));

    ctx.beginPath();
    let started = false;
    for (let i = 0; i < surface.length - 1; i++) {
      const h0 = surface[i].y;
      const h1 = surface[i + 1].y;
      // Check if contour level crosses between these two points
      if ((h0 <= targetH && h1 >= targetH) || (h0 >= targetH && h1 <= targetH)) {
        const t = (targetH - h0) / (h1 - h0 || 0.0001);
        const x = ((i + t) / (surface.length - 1)) * w;
        const y = surfY + targetH * minDim;
        if (!started) { ctx.moveTo(x, y); started = true; }
        else ctx.lineTo(x, y);
      }
    }
    if (started) {
      ctx.strokeStyle = rgba(rgb, alpha);
      ctx.lineWidth = px(level % 2 === 0 ? STROKE.thin : STROKE.hairline, minDim);
      ctx.stroke();
    }
  }
}

/**
 * Draw Chladni pattern on the mirror surface when calm.
 * Pattern mapped to a horizontal band around the surface line.
 */
function drawMirrorChladni(
  ctx: CanvasRenderingContext2D,
  cx: number, surfY: number, w: number, minDim: number,
  rgb: RGB, entrance: number, mirrorAlpha: number,
): void {
  if (mirrorAlpha < 0.2) return;
  const vis = (mirrorAlpha - 0.2) / 0.8;
  const n = 4; const m = 5;
  const dotR = px(CHLADNI_DOT, minDim);
  const fieldW = w * 0.8;
  const fieldH = px(0.12, minDim);

  for (let xi = 0; xi < CHLADNI_RES; xi++) {
    for (let yi = 0; yi < CHLADNI_RES / 2; yi++) {
      const nx = (xi / (CHLADNI_RES - 1)) * 2 - 1;
      const ny = (yi / (CHLADNI_RES / 2 - 1));
      const val = Math.abs(
        Math.cos(n * Math.PI * nx) * Math.cos(m * Math.PI * ny) -
        Math.cos(m * Math.PI * nx) * Math.cos(n * Math.PI * ny)
      );
      if (val < CHLADNI_THRESH) {
        const x = cx + nx * fieldW * 0.5;
        const y = surfY + ny * fieldH;
        const intensity = (1 - val / CHLADNI_THRESH) * vis;
        ctx.beginPath();
        ctx.arc(x, y, dotR * (0.3 + intensity * 0.7), 0, Math.PI * 2);
        ctx.fillStyle = rgba(rgb, ALPHA.content.max * 0.08 * intensity * entrance);
        ctx.fill();
      }
    }
  }
}

/**
 * Draw seismograph trace showing magnified tremor reading.
 */
function drawSeismograph(
  ctx: CanvasRenderingContext2D,
  cx: number, y: number, minDim: number,
  rgb: RGB, entrance: number,
  jitter: number, frame: number,
): void {
  const magAmp = jitter * MOVEMENT_MAGNIFICATION * minDim * 0.4;
  const traceW = px(0.12, minDim);
  const traceH = px(0.04, minDim);

  // Background track
  ctx.beginPath();
  ctx.moveTo(cx - traceW, y);
  ctx.lineTo(cx + traceW, y);
  ctx.strokeStyle = rgba(rgb, ALPHA.content.max * 0.03 * entrance);
  ctx.lineWidth = px(STROKE.hairline, minDim);
  ctx.stroke();

  // Waveform
  ctx.beginPath();
  for (let i = 0; i < SEISMO_POINTS; i++) {
    const x = cx - traceW + (i / (SEISMO_POINTS - 1)) * traceW * 2;
    const sy = y + Math.sin(i * 0.8 + frame * 0.2) * magAmp;
    if (i === 0) ctx.moveTo(x, sy);
    else ctx.lineTo(x, sy);
  }
  ctx.strokeStyle = rgba(rgb, ALPHA.content.max * Math.min(0.25, jitter * 12) * entrance);
  ctx.lineWidth = px(STROKE.light, minDim);
  ctx.stroke();

  // Peak dots
  for (let i = 1; i < SEISMO_POINTS - 1; i++) {
    const sy = Math.sin(i * 0.8 + frame * 0.2) * magAmp;
    const prev = Math.sin((i - 1) * 0.8 + frame * 0.2) * magAmp;
    const next = Math.sin((i + 1) * 0.8 + frame * 0.2) * magAmp;
    if (Math.abs(sy) > Math.abs(prev) && Math.abs(sy) > Math.abs(next) && Math.abs(sy) > traceH * 0.3) {
      const x = cx - traceW + (i / (SEISMO_POINTS - 1)) * traceW * 2;
      ctx.beginPath();
      ctx.arc(x, y + sy, px(0.002, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(rgb, ALPHA.content.max * 0.12 * entrance);
      ctx.fill();
    }
  }
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function MicroTremorAtom({
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
    surface: Array.from({ length: SURFACE_POINTS }, (): SurfacePoint => ({
      y: 0, vy: 0,
    })),
    lastPointerX: -1,
    lastPointerY: -1,
    jitterAccum: 0,
    calmFrames: 0,
    stepNotified: false,
    completed: false,
    mirrorAlpha: 0,
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

      if (p.reducedMotion || p.phase === 'resolve') {
        s.completed = true; s.mirrorAlpha = 1;
        for (const pt of s.surface) { pt.y = 0; pt.vy = 0; }
      }

      const warmRgb = lerpColor(s.primaryRgb, s.accentRgb, p.breathAmplitude * BREATH_WARMTH);

      // ═══════════════════════════════════════════════════════════════
      // SURFACE PHYSICS
      // ═══════════════════════════════════════════════════════════════
      let maxDisplacement = 0;
      for (let i = 0; i < s.surface.length; i++) {
        const pt = s.surface[i];
        pt.vy += -RIPPLE_SPRING * pt.y * ms;
        if (i > 0) pt.vy += (s.surface[i - 1].y - pt.y) * RIPPLE_SPREAD * ms;
        if (i < s.surface.length - 1) pt.vy += (s.surface[i + 1].y - pt.y) * RIPPLE_SPREAD * ms;
        pt.vy *= RIPPLE_DAMPING;
        pt.y += pt.vy * ms;
        maxDisplacement = Math.max(maxDisplacement, Math.abs(pt.y));
      }

      // Calmness tracking
      s.jitterAccum = s.jitterAccum * 0.95 + maxDisplacement * 0.05;
      if (s.jitterAccum < CALM_THRESHOLD) {
        s.calmFrames += ms;
        if (s.calmFrames > CALM_FRAMES_TO_COMPLETE * 0.5 && !s.stepNotified) {
          s.stepNotified = true;
          cb.onHaptic('step_advance');
        }
        if (s.calmFrames >= CALM_FRAMES_TO_COMPLETE && !s.completed) {
          s.completed = true;
          cb.onHaptic('completion');
        }
      } else {
        s.calmFrames = Math.max(0, s.calmFrames - 2 * ms);
      }

      // Mirror alpha
      const targetMirror = s.completed ? 1 : s.calmFrames / CALM_FRAMES_TO_COMPLETE * 0.5;
      s.mirrorAlpha += (targetMirror - s.mirrorAlpha) * 0.02;

      cb.onStateChange?.(s.completed ? 1 : s.calmFrames / CALM_FRAMES_TO_COMPLETE);

      const surfY = SURFACE_Y * h;

      // ═══════════════════════════════════════════════════════════════
      // LAYER 1 — Topographic contour lines (wave elevation map)
      // ═══════════════════════════════════════════════════════════════
      drawSurfaceContours(ctx, s.surface, w, surfY, minDim,
        s.accentRgb, entrance, s.jitterAccum);

      // ═══════════════════════════════════════════════════════════════
      // LAYER 2 — Chladni mirror pattern (when calm)
      // ═══════════════════════════════════════════════════════════════
      drawMirrorChladni(ctx, cx, surfY, w, minDim, warmRgb, entrance, s.mirrorAlpha);

      // ═══════════════════════════════════════════════════════════════
      // LAYER 3 — Mercury body (below surface, 5-stop depth gradient)
      // ═══════════════════════════════════════════════════════════════
      const depthPx = px(MERCURY_DEPTH, minDim);
      const mercGrad = ctx.createLinearGradient(0, surfY, 0, surfY + depthPx);
      mercGrad.addColorStop(0, rgba(warmRgb, ALPHA.content.max * 0.18 * entrance));
      mercGrad.addColorStop(0.2, rgba(s.primaryRgb, ALPHA.content.max * 0.12 * entrance));
      mercGrad.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.content.max * 0.07 * entrance));
      mercGrad.addColorStop(0.8, rgba(s.primaryRgb, ALPHA.content.max * 0.03 * entrance));
      mercGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.beginPath();
      ctx.moveTo(0, surfY + s.surface[0].y * minDim);
      for (let i = 1; i < s.surface.length; i++) {
        const x = (i / (s.surface.length - 1)) * w;
        const y = surfY + s.surface[i].y * minDim;
        const prevX = ((i - 1) / (s.surface.length - 1)) * w;
        const prevY = surfY + s.surface[i - 1].y * minDim;
        const cpx = (prevX + x) / 2;
        ctx.quadraticCurveTo(prevX, prevY, cpx, (prevY + y) / 2);
      }
      ctx.lineTo(w, surfY + depthPx);
      ctx.lineTo(0, surfY + depthPx);
      ctx.closePath();
      ctx.fillStyle = mercGrad;
      ctx.fill();

      // ═══════════════════════════════════════════════════════════════
      // LAYER 4 — Surface line + highlights + specular dots
      // ═══════════════════════════════════════════════════════════════
      // Surface line
      ctx.beginPath();
      for (let i = 0; i < s.surface.length; i++) {
        const x = (i / (s.surface.length - 1)) * w;
        const y = surfY + s.surface[i].y * minDim;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = rgba(warmRgb,
        ALPHA.content.max * (0.2 + s.mirrorAlpha * 0.25) * entrance);
      ctx.lineWidth = px(STROKE.light + s.mirrorAlpha * STROKE.medium, minDim);
      ctx.stroke();

      // Surface highlights (bright spots on wave crests)
      for (let i = 1; i < s.surface.length - 1; i += 2) {
        const y = s.surface[i].y;
        const slope = s.surface[i + 1].y - s.surface[i - 1].y;
        if (slope < -0.001) {
          const x = (i / (s.surface.length - 1)) * w;
          const sy = surfY + y * minDim;
          const intensity = Math.min(1, Math.abs(slope) * 30);
          // Specular dot
          const dotR = px(0.002, minDim) * (0.5 + intensity);
          ctx.beginPath();
          ctx.arc(x, sy, dotR, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${0.15 * intensity * entrance})`;
          ctx.fill();
          // Crest glow
          const glowR = dotR * 3;
          const gg = ctx.createRadialGradient(x, sy, 0, x, sy, glowR);
          gg.addColorStop(0, rgba(warmRgb, ALPHA.glow.max * 0.06 * intensity * entrance));
          gg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = gg;
          ctx.fillRect(x - glowR, sy - glowR, glowR * 2, glowR * 2);
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 5 — Mirror reflection (when calm)
      // ═══════════════════════════════════════════════════════════════
      if (s.mirrorAlpha > 0.1) {
        ctx.save();
        ctx.globalAlpha = s.mirrorAlpha * 0.18 * entrance;
        const reflectY = surfY + px(0.008, minDim);
        ctx.translate(0, reflectY * 2);
        ctx.scale(1, -1);

        // Reflected glow orb
        const rR = px(SIZE.sm * 0.5 + p.breathAmplitude * BREATH_CLARITY * 0.5, minDim);
        const rg = ctx.createRadialGradient(cx, surfY - px(0.08, minDim), 0,
          cx, surfY - px(0.08, minDim), rR);
        rg.addColorStop(0, rgba(warmRgb, ALPHA.glow.max * 0.2));
        rg.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.glow.max * 0.06));
        rg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rg;
        ctx.fillRect(cx - rR, surfY - px(0.08, minDim) - rR, rR * 2, rR * 2);

        ctx.restore();
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 6 — Jitter seismograph (magnified tremor reading)
      // ═══════════════════════════════════════════════════════════════
      if (!s.completed) {
        drawSeismograph(ctx, cx, h * 0.15, minDim,
          s.accentRgb, entrance, s.jitterAccum, s.frameCount);
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 7 — Calmness progress meter
      // ═══════════════════════════════════════════════════════════════
      if (!s.completed) {
        const meterW = px(0.18, minDim);
        const meterH = px(0.004, minDim);
        const meterX = cx - meterW / 2;
        const meterY = h * 0.88;
        // Track background
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.04 * entrance);
        ctx.fillRect(meterX, meterY, meterW, meterH);
        // Progress fill
        const progW = meterW * (s.calmFrames / CALM_FRAMES_TO_COMPLETE);
        const progG = ctx.createLinearGradient(meterX, 0, meterX + progW, 0);
        progG.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.12 * entrance));
        progG.addColorStop(1, rgba(warmRgb, ALPHA.content.max * 0.2 * entrance));
        ctx.fillStyle = progG;
        ctx.fillRect(meterX, meterY, progW, meterH);
        // End cap glow
        if (progW > 2) {
          const capG = ctx.createRadialGradient(meterX + progW, meterY + meterH / 2, 0,
            meterX + progW, meterY + meterH / 2, px(0.008, minDim));
          capG.addColorStop(0, rgba(warmRgb, ALPHA.glow.max * 0.08 * entrance));
          capG.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = capG;
          ctx.fillRect(meterX + progW - px(0.008, minDim), meterY - px(0.008, minDim),
            px(0.016, minDim), px(0.016, minDim) + meterH);
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 8 — Completion mirror glow + seal
      // ═══════════════════════════════════════════════════════════════
      if (s.completed) {
        // Horizontal light band along mirror surface
        const glowH = px(0.06, minDim);
        const mGlow = ctx.createLinearGradient(0, surfY - glowH, 0, surfY + glowH);
        mGlow.addColorStop(0, 'rgba(0,0,0,0)');
        mGlow.addColorStop(0.3, rgba(warmRgb, ALPHA.glow.max * 0.06 * entrance));
        mGlow.addColorStop(0.5, rgba(warmRgb, ALPHA.glow.max * 0.14 * entrance));
        mGlow.addColorStop(0.7, rgba(warmRgb, ALPHA.glow.max * 0.06 * entrance));
        mGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = mGlow;
        ctx.fillRect(0, surfY - glowH, w, glowH * 2);

        // Expanding calm rings
        for (let i = 0; i < 3; i++) {
          const rPhase = (s.frameCount * 0.003 + i * 0.33) % 1;
          const ringW = w * 0.4 * (0.5 + rPhase);
          const ringH = px(0.005, minDim) * (1 - rPhase);
          ctx.beginPath();
          ctx.ellipse(cx, surfY, ringW, ringH + px(0.01, minDim), 0, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(warmRgb, ALPHA.content.max * 0.04 * (1 - rPhase) * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer events ─────────────────────────────────────
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      if (s.lastPointerX >= 0) {
        const dx = mx - s.lastPointerX;
        const dy = my - s.lastPointerY;
        const movement = Math.sqrt(dx * dx + dy * dy);

        const surfIdx = Math.floor(mx * (SURFACE_POINTS - 1));
        if (surfIdx >= 0 && surfIdx < s.surface.length) {
          s.surface[surfIdx].vy += movement * 0.3;
          if (surfIdx > 0) s.surface[surfIdx - 1].vy += movement * 0.15;
          if (surfIdx < s.surface.length - 1) s.surface[surfIdx + 1].vy += movement * 0.15;
        }
      }

      s.lastPointerX = mx;
      s.lastPointerY = my;
    };

    const onLeave = () => {
      stateRef.current.lastPointerX = -1;
      stateRef.current.lastPointerY = -1;
    };

    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'none' }} />
    </div>
  );
}
