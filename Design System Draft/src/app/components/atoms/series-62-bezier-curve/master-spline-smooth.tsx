/**
 * ATOM 620: THE MASTER SPLINE ENGINE (Series Seal)
 * ==================================================
 * Series 62 — Bezier Curve · Position 10
 *
 * The apex: every jagged edge of your life is one breathtaking
 * continuous curve. Full palm press activates the master
 * interpolation — 50 broken points smooth into one flawless
 * glowing masterpiece path.
 *
 * SIGNATURE TECHNIQUE: Phase Portrait Flow Fields
 *   - 50 chaotic points create a turbulent flow field
 *   - Master interpolation: all flow vectors align into one stream
 *   - The entire viewport's flow field harmonizes into laminar perfection
 *   - Visible chaos → order transformation in the vector topology
 *
 * PHYSICS:
 *   - 50 scattered chaotic points fill the screen
 *   - Each point has erratic velocity vectors
 *   - Hold/press activates master interpolation
 *   - All points smooth-merge into one continuous spline
 *   - Flow field unifies from turbulent to single laminar stream
 *   - Breath modulates interpolation glow + final path luminance
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + chaos energy field
 *   2. Flow field (turbulent → laminar)
 *   3. Chaotic point cloud with connections
 *   4. Interpolation lines (appearing during smoothing)
 *   5. Master spline with viewport-spanning glow
 *   6. Point merge animations
 *   7. Seal stamp glow (completion)
 *   8. Progress ring + eternal breath pulse
 *
 * INTERACTION: Hold (full press) → master interpolation activates
 * RENDER: Canvas 2D (rAF) · REDUCED MOTION: Static master spline
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, PARTICLE_SIZE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Number of chaotic points */
const POINT_COUNT = 50;
/** Point radius */
const POINT_R = PARTICLE_SIZE.sm;
/** Point glow layers */
const POINT_GLOW_LAYERS = 2;
/** Connection line threshold (fraction) */
const CONNECT_DIST = 0.12;
/** Interpolation speed */
const INTERP_SPEED = 0.008;
/** Master spline stroke */
const SPLINE_STROKE = STROKE.heavy;
/** Spline glow width */
const SPLINE_GLOW_W = 0.01;
/** Flow grid cols */
const FLOW_COLS = 14;
/** Flow grid rows */
const FLOW_ROWS = 10;
/** Flow arrow length */
const FLOW_ARROW_LEN = 0.02;
/** Seal glow radius */
const SEAL_GLOW_R = SIZE.xl;
/** Seal ring radius */
const SEAL_RING_R = SIZE.md;
/** Progress ring radius */
const PROGRESS_R = SIZE.sm;
/** Breath path luminance */
const BREATH_LUMINANCE = 0.1;
/** Chaos energy pulse */
const CHAOS_PULSE_FREQ = 0.04;
/** Point merge speed */
const MERGE_SPEED = 0.015;

// =====================================================================
// STATE TYPES
// =====================================================================

interface ChaosPoint {
  /** Original chaotic position (normalized 0-1) */
  ox: number; oy: number;
  /** Current position */
  cx: number; cy: number;
  /** Target position on spline */
  tx: number; ty: number;
  /** Random drift */
  drift: number;
  /** Phase offset */
  phase: number;
}

interface MasterState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  points: ChaosPoint[];
  holding: boolean;
  interpolation: number;
  completed: boolean;
  sealPulse: number;
}

// =====================================================================
// HELPER: GENERATE SPLINE TARGET
// =====================================================================

/**
 * Generate smooth spline target positions for N points.
 * Creates a flowing S-curve across the viewport.
 */
function generateSplineTargets(count: number): { x: number; y: number }[] {
  const targets: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const x = 0.08 + t * 0.84;
    const y = 0.5 + Math.sin(t * Math.PI * 2.5) * 0.15 + Math.sin(t * Math.PI * 1.2) * 0.08;
    targets.push({ x, y });
  }
  return targets;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function MasterSplineSmoothAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const buildPoints = (): ChaosPoint[] => {
    const targets = generateSplineTargets(POINT_COUNT);
    return targets.map((t, i) => ({
      ox: 0.1 + Math.random() * 0.8,
      oy: 0.1 + Math.random() * 0.8,
      cx: 0.1 + Math.random() * 0.8,
      cy: 0.1 + Math.random() * 0.8,
      tx: t.x,
      ty: t.y,
      drift: 0.001 + Math.random() * 0.003,
      phase: Math.random() * Math.PI * 2,
    }));
  };

  const stateRef = useRef<MasterState>({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    points: buildPoints(),
    holding: false,
    interpolation: 0,
    completed: false,
    sealPulse: 0,
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
      const breath = p.breathAmplitude;
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      // Physics: interpolation
      if (!p.reducedMotion) {
        if (s.holding && s.interpolation < 1) {
          s.interpolation = Math.min(1, s.interpolation + INTERP_SPEED * ms);
          cb.onStateChange?.(s.interpolation * 0.95);

          // Step haptics
          const tier = Math.floor(s.interpolation * 6);
          const prevTier = Math.floor((s.interpolation - INTERP_SPEED) * 6);
          if (tier > prevTier && tier > 0) cb.onHaptic('step_advance');

          if (s.interpolation >= 1 && !s.completed) {
            s.completed = true;
            cb.onHaptic('seal_stamp');
            cb.onStateChange?.(1);
          }
        }

        // Move points toward targets
        for (const pt of s.points) {
          if (s.interpolation > 0) {
            pt.cx += (pt.tx - pt.cx) * MERGE_SPEED * s.interpolation * ms;
            pt.cy += (pt.ty - pt.cy) * MERGE_SPEED * s.interpolation * ms;
          } else {
            // Chaotic drift
            pt.cx += Math.sin(s.frameCount * 0.02 + pt.phase) * pt.drift * ms;
            pt.cy += Math.cos(s.frameCount * 0.015 + pt.phase * 1.3) * pt.drift * ms;
            pt.cx = Math.max(0.05, Math.min(0.95, pt.cx));
            pt.cy = Math.max(0.05, Math.min(0.95, pt.cy));
          }
        }

        if (s.completed) s.sealPulse = (s.sealPulse + 0.02 * ms) % (Math.PI * 2);
      }

      const interp = s.interpolation;

      // ═══════════════════════════════════════════════════════════
      // LAYER 1: ATMOSPHERE + CHAOS ENERGY
      // ═══════════════════════════════════════════════════════════
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.xl);

      if (interp < 0.5) {
        const chaosPulse = Math.sin(s.frameCount * CHAOS_PULSE_FREQ) * 0.3 + 0.7;
        const chaosR = px(SIZE.xl, minDim) * chaosPulse;
        const chaos = ctx.createRadialGradient(cx, cy, 0, cx, cy, chaosR);
        chaos.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * (1 - interp * 2) * entrance * 0.3));
        chaos.addColorStop(0.5, rgba(s.accentRgb, ALPHA.glow.min * (1 - interp * 2) * entrance));
        chaos.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = chaos;
        ctx.fillRect(0, 0, w, h);
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 2: FLOW FIELD
      // ═══════════════════════════════════════════════════════════
      {
        ctx.lineWidth = px(STROKE.hairline, minDim);
        const arrowLen = px(FLOW_ARROW_LEN, minDim);

        for (let col = 0; col < FLOW_COLS; col++) {
          for (let row = 0; row < FLOW_ROWS; row++) {
            const fx = w * 0.04 + (col / (FLOW_COLS - 1)) * w * 0.92;
            const fy = h * 0.06 + (row / (FLOW_ROWS - 1)) * h * 0.88;

            let dx: number, dy: number;

            if (interp < 0.5) {
              // Chaotic: random-ish directions influenced by nearest point
              let nearDist = Infinity;
              let nearDx = 0;
              let nearDy = 0;
              for (const pt of s.points) {
                const pdx = pt.cx * w - fx;
                const pdy = pt.cy * h - fy;
                const d = pdx * pdx + pdy * pdy;
                if (d < nearDist) {
                  nearDist = d;
                  nearDx = pdx;
                  nearDy = pdy;
                }
              }
              const chaos = 1 - interp * 2;
              dx = nearDx * 0.001 + Math.sin(fx * 0.01 + s.frameCount * 0.03) * chaos;
              dy = nearDy * 0.001 + Math.cos(fy * 0.01 + s.frameCount * 0.025) * chaos;
            } else {
              // Laminar: flowing right along the spline direction
              dx = 1;
              const splineT = (fx - w * 0.08) / (w * 0.84);
              const splineSlope = Math.cos(splineT * Math.PI * 2.5) * 0.15 * Math.PI * 2.5 / (w * 0.84);
              dy = splineSlope * interp;
            }

            const mag = Math.sqrt(dx * dx + dy * dy) + 0.001;
            const alpha = ALPHA.background.max * entrance * (0.3 + interp * 0.7);
            const arrowColor = lerpColor(s.accentRgb, s.primaryRgb, interp);
            ctx.strokeStyle = rgba(arrowColor, alpha);

            const aLen = arrowLen * Math.min(1, mag * 50);
            const ex = fx + (dx / mag) * aLen;
            const ey = fy + (dy / mag) * aLen;
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(ex, ey);
            ctx.stroke();

            const a = Math.atan2(dy / mag, dx / mag);
            const hl = aLen * 0.25;
            ctx.beginPath();
            ctx.moveTo(ex, ey);
            ctx.lineTo(ex - Math.cos(a - 0.5) * hl, ey - Math.sin(a - 0.5) * hl);
            ctx.stroke();
          }
        }
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 3: CHAOTIC POINT CLOUD + CONNECTIONS
      // ═══════════════════════════════════════════════════════════
      {
        const cloudAlpha = Math.max(0, 1 - interp * 1.5);
        if (cloudAlpha > 0) {
          // Connections
          ctx.lineWidth = px(STROKE.hairline, minDim);
          for (let i = 0; i < s.points.length; i++) {
            for (let j = i + 1; j < s.points.length; j++) {
              const dx = s.points[i].cx - s.points[j].cx;
              const dy = s.points[i].cy - s.points[j].cy;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < CONNECT_DIST) {
                const connAlpha = (1 - dist / CONNECT_DIST) * ALPHA.background.max * cloudAlpha * entrance;
                ctx.beginPath();
                ctx.moveTo(s.points[i].cx * w, s.points[i].cy * h);
                ctx.lineTo(s.points[j].cx * w, s.points[j].cy * h);
                ctx.strokeStyle = rgba(s.accentRgb, connAlpha);
                ctx.stroke();
              }
            }
          }

          // Points
          for (const pt of s.points) {
            const px_ = pt.cx * w;
            const py_ = pt.cy * h;
            const pr = px(POINT_R, minDim);

            for (let g = POINT_GLOW_LAYERS; g >= 1; g--) {
              const gr = pr * (1 + g * 1.5);
              const pGlow = ctx.createRadialGradient(px_, py_, 0, px_, py_, gr);
              pGlow.addColorStop(0, rgba(s.accentRgb, (ALPHA.glow.max / g) * cloudAlpha * entrance));
              pGlow.addColorStop(1, 'rgba(0,0,0,0)');
              ctx.fillStyle = pGlow;
              ctx.beginPath();
              ctx.arc(px_, py_, gr, 0, Math.PI * 2);
              ctx.fill();
            }

            ctx.beginPath();
            ctx.arc(px_, py_, pr, 0, Math.PI * 2);
            ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * cloudAlpha * entrance);
            ctx.fill();
          }
        }
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 4: INTERPOLATION LINES
      // ═══════════════════════════════════════════════════════════
      if (interp > 0.2 && interp < 0.9) {
        ctx.lineWidth = px(STROKE.thin, minDim);
        const lineAlpha = Math.sin((interp - 0.2) / 0.7 * Math.PI) * ALPHA.content.min * entrance;

        for (let i = 0; i < s.points.length - 1; i++) {
          ctx.beginPath();
          ctx.moveTo(s.points[i].cx * w, s.points[i].cy * h);
          ctx.lineTo(s.points[i + 1].cx * w, s.points[i + 1].cy * h);
          ctx.strokeStyle = rgba(lerpColor(s.accentRgb, s.primaryRgb, interp), lineAlpha);
          ctx.stroke();
        }
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 5: MASTER SPLINE
      // ═══════════════════════════════════════════════════════════
      if (interp > 0.3) {
        const splineAlpha = Math.min(1, (interp - 0.3) / 0.5);
        const breathLum = breath * BREATH_LUMINANCE;

        // Spline glow (wide)
        ctx.beginPath();
        for (let i = 0; i < s.points.length; i++) {
          const px_ = s.points[i].cx * w;
          const py_ = s.points[i].cy * h;
          if (i === 0) ctx.moveTo(px_, py_);
          else {
            const prev = s.points[i - 1];
            const cpx = (prev.cx * w + px_) / 2;
            const cpy = (prev.cy * h + py_) / 2;
            ctx.quadraticCurveTo(prev.cx * w, prev.cy * h, cpx, cpy);
          }
        }
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.glow.max * splineAlpha * entrance * (0.6 + breathLum));
        ctx.lineWidth = px(SPLINE_GLOW_W, minDim);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Spline body
        ctx.beginPath();
        for (let i = 0; i < s.points.length; i++) {
          const px_ = s.points[i].cx * w;
          const py_ = s.points[i].cy * h;
          if (i === 0) ctx.moveTo(px_, py_);
          else {
            const prev = s.points[i - 1];
            const cpx = (prev.cx * w + px_) / 2;
            const cpy = (prev.cy * h + py_) / 2;
            ctx.quadraticCurveTo(prev.cx * w, prev.cy * h, cpx, cpy);
          }
        }
        const splineColor = lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.1 + breathLum);
        ctx.strokeStyle = rgba(splineColor, ALPHA.accent.max * splineAlpha * entrance);
        ctx.lineWidth = px(SPLINE_STROKE, minDim);
        ctx.stroke();

        // Specular dots on spline
        if (splineAlpha > 0.5) {
          for (let i = 0; i < s.points.length; i += 5) {
            const px_ = s.points[i].cx * w;
            const py_ = s.points[i].cy * h;
            ctx.beginPath();
            ctx.arc(px_, py_ - px(0.004, minDim), px(PARTICLE_SIZE.dot, minDim), 0, Math.PI * 2);
            ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.content.min * splineAlpha * entrance);
            ctx.fill();
          }
        }
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 7: SEAL STAMP GLOW
      // ═══════════════════════════════════════════════════════════
      if (s.completed) {
        const sealPulse = 0.7 + Math.sin(s.sealPulse) * 0.3;
        const sealR = px(SEAL_GLOW_R, minDim) * sealPulse * (1 + breath * 0.05);

        const sealGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, sealR);
        sealGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * sealPulse * entrance));
        sealGlow.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.glow.min * sealPulse * entrance));
        sealGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = sealGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, sealR, 0, Math.PI * 2);
        ctx.fill();

        // Seal ring
        const ringR = px(SEAL_RING_R, minDim);
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.min * sealPulse * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 8: PROGRESS RING
      // ═══════════════════════════════════════════════════════════
      {
        const ringR = px(PROGRESS_R, minDim);
        const ringX = w * 0.92;
        const ringY = h * 0.08;

        ctx.beginPath();
        ctx.arc(ringX, ringY, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.background.max * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ringX, ringY, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * interp);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ═══════════════════════════════════════════════════════════════
    // POINTER EVENTS
    // ═══════════════════════════════════════════════════════════════
    const onDown = (e: PointerEvent) => {
      stateRef.current.holding = true;
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('hold_start');
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.holding = false;
      canvas.releasePointerCapture(e.pointerId);
    };

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
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }}
      />
    </div>
  );
}
