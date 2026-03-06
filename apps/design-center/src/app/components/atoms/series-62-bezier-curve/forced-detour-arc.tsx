/**
 * ATOM 614: THE FORCED DETOUR ENGINE
 * ====================================
 * Series 62 — Bezier Curve · Position 4
 *
 * Prove the scenic route is better. Grab the severed path end and
 * drag a sweeping wide arc around the boulder — the beautiful
 * detour reconnects and is more satisfying than the original.
 *
 * SIGNATURE TECHNIQUE: Phase Portrait Flow Fields
 *   - Flow arrows show streamlines bending around the boulder
 *   - Like fluid dynamics around an obstacle — visible pressure gradients
 *   - As detour arc forms, flow field becomes smooth laminar around obstacle
 *   - Physics teaches: obstacles create the most beautiful paths
 *
 * PHYSICS:
 *   - Straight path with a massive boulder dropped onto it
 *   - Path severs; dead end
 *   - Drag the severed end to arc around the boulder
 *   - Arc forms a smooth Bezier detour, reconnects on other side
 *   - Flow field shows streamlines curving around obstacle
 *   - Breath modulates boulder pulse + flow drift
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + depth field
 *   2. Flow field streamlines around boulder
 *   3. Original path (broken) with shadow
 *   4. Boulder with multi-layer gradient + specular
 *   5. Detour arc path with glow trail
 *   6. Reconnection point spark
 *   7. Severed end (draggable) with handle glow
 *   8. Progress ring + completion bloom
 *
 * INTERACTION: Drag (severed end around boulder) → forms detour arc
 * RENDER: Canvas 2D (rAF) · REDUCED MOTION: Static detour path
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

/** Boulder radius */
const BOULDER_R = SIZE.md * 0.7;
/** Boulder glow layers */
const BOULDER_GLOW_LAYERS = 3;
/** Path vertical position */
const PATH_Y_FRAC = 0.52;
/** Boulder center X offset from center */
const BOULDER_X_OFF = 0.0;
/** Original path left start */
const PATH_LEFT = 0.08;
/** Original path right end */
const PATH_RIGHT = 0.92;
/** Severed end dot radius */
const HANDLE_R = PARTICLE_SIZE.xl;
/** Handle glow layers */
const HANDLE_GLOW_LAYERS = 3;
/** Detour arc maximum height (above boulder) */
const ARC_HEIGHT = SIZE.lg;
/** Detour path stroke */
const PATH_STROKE = STROKE.bold;
/** Path glow stroke */
const PATH_GLOW_W = 0.006;
/** Flow streamline count */
const STREAM_COUNT = 30;
/** Flow streamline segments */
const STREAM_SEGS = 20;
/** Flow streamline step size */
const STREAM_STEP = 0.012;
/** Reconnection spark radius */
const SPARK_R = PARTICLE_SIZE.md;
/** Spark ring count */
const SPARK_RINGS = 3;
/** Completion threshold (arc coverage) */
const COMPLETE_THRESHOLD = 0.88;
/** Progress ring radius */
const PROGRESS_R = SIZE.sm;
/** Bloom frames */
const BLOOM_FRAMES = 35;
/** Breath boulder pulse */
const BREATH_BOULDER_PULSE = 0.02;
/** Specular size on boulder */
const SPECULAR_R = 0.008;

// =====================================================================
// STATE TYPES
// =====================================================================

interface DetourState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  arcProgress: number;
  dragging: boolean;
  dragX: number;
  dragY: number;
  completed: boolean;
  bloomTimer: number;
}

// =====================================================================
// HELPER: FLOW AROUND OBSTACLE
// =====================================================================

/**
 * Compute flow direction around a circular obstacle.
 * Mimics potential flow around a cylinder.
 */
function flowAroundBoulder(
  fx: number, fy: number,
  bx: number, by: number,
  bRadius: number,
): [number, number] {
  const dx = fx - bx;
  const dy = fy - by;
  const r2 = dx * dx + dy * dy;
  const R2 = bRadius * bRadius;

  if (r2 < R2 * 1.1) return [0, 0]; // Inside boulder

  // Potential flow: uniform stream + doublet
  const factor = R2 / r2;
  const ux = 1 - factor * (dx * dx - dy * dy) / r2;
  const uy = -factor * 2 * dx * dy / r2;
  const mag = Math.sqrt(ux * ux + uy * uy) + 0.001;
  return [ux / mag, uy / mag];
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function ForcedDetourArcAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef<DetourState>({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    arcProgress: 0,
    dragging: false,
    dragX: 0,
    dragY: 0,
    completed: false,
    bloomTimer: 0,
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

      const pathY = h * PATH_Y_FRAC;
      const bx = cx + px(BOULDER_X_OFF, minDim);
      const by = pathY;
      const boulderR = px(BOULDER_R, minDim) * (1 + breath * BREATH_BOULDER_PULSE);
      const arc = s.arcProgress;

      // ═══════════════════════════════════════════════════════════
      // LAYER 1: ATMOSPHERE
      // ═══════════════════════════════════════════════════════════
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.lg);

      // ═══════════════════════════════════════════════════════════
      // LAYER 2: FLOW STREAMLINES
      // ═══════════════════════════════════════════════════════════
      {
        const bxNorm = bx / w;
        const byNorm = by / h;
        const bRNorm = boulderR / Math.min(w, h);

        ctx.lineWidth = px(STROKE.hairline, minDim);
        for (let i = 0; i < STREAM_COUNT; i++) {
          const startY = h * 0.12 + (i / (STREAM_COUNT - 1)) * h * 0.76;
          let sx = w * 0.03;
          let sy = startY;

          ctx.beginPath();
          ctx.moveTo(sx, sy);

          for (let seg = 0; seg < STREAM_SEGS; seg++) {
            const [fdx, fdy] = flowAroundBoulder(
              sx / w, sy / h,
              bxNorm, byNorm,
              bRNorm,
            );
            sx += fdx * px(STREAM_STEP, minDim) * w / minDim;
            sy += fdy * px(STREAM_STEP, minDim) * h / minDim;
            if (sx > w || sx < 0 || sy > h || sy < 0) break;
            ctx.lineTo(sx, sy);
          }

          const streamDist = Math.abs(startY - by) / (h * 0.4);
          const alpha = ALPHA.background.max * entrance * (0.3 + arc * 0.7) * (1 - streamDist * 0.5);
          ctx.strokeStyle = rgba(
            lerpColor(s.accentRgb, s.primaryRgb, arc),
            Math.max(0, alpha),
          );
          ctx.stroke();
        }
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 3: ORIGINAL PATH (broken)
      // ═══════════════════════════════════════════════════════════
      {
        const leftEnd = bx - boulderR - px(0.01, minDim);
        const rightStart = bx + boulderR + px(0.01, minDim);

        // Shadow
        const shadowOff = px(0.003, minDim);
        ctx.beginPath();
        ctx.moveTo(w * PATH_LEFT, pathY + shadowOff);
        ctx.lineTo(leftEnd, pathY + shadowOff);
        ctx.strokeStyle = rgba([0, 0, 0] as RGB, 0.02 * entrance);
        ctx.lineWidth = px(PATH_STROKE * 1.5, minDim);
        ctx.lineCap = 'round';
        ctx.stroke();

        // Left segment
        ctx.beginPath();
        ctx.moveTo(w * PATH_LEFT, pathY);
        ctx.lineTo(leftEnd, pathY);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.focal.max * entrance);
        ctx.lineWidth = px(PATH_STROKE, minDim);
        ctx.lineCap = 'round';
        ctx.stroke();

        // Right segment (faded until reconnection)
        ctx.beginPath();
        ctx.moveTo(rightStart, pathY);
        ctx.lineTo(w * PATH_RIGHT, pathY);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * (0.3 + arc * 0.7) * entrance);
        ctx.lineWidth = px(PATH_STROKE, minDim);
        ctx.lineCap = 'round';
        ctx.stroke();

        // Break marks (jagged)
        if (arc < 0.5) {
          const breakAlpha = (1 - arc * 2) * ALPHA.content.max * entrance;
          for (let j = 0; j < 3; j++) {
            const jx = leftEnd + (j - 1) * px(0.003, minDim);
            const jy = pathY + (Math.random() - 0.5) * px(0.008, minDim);
            ctx.beginPath();
            ctx.arc(jx, jy, px(PARTICLE_SIZE.dot, minDim), 0, Math.PI * 2);
            ctx.fillStyle = rgba(s.accentRgb, breakAlpha);
            ctx.fill();
          }
        }
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 4: BOULDER
      // ═══════════════════════════════════════════════════════════
      {
        // Boulder shadow
        const shadowOff = px(0.005, minDim);
        const bShadow = ctx.createRadialGradient(bx + shadowOff, by + shadowOff, 0, bx + shadowOff, by + shadowOff, boulderR * 1.2);
        bShadow.addColorStop(0, rgba([0, 0, 0] as RGB, 0.04 * entrance));
        bShadow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bShadow;
        ctx.beginPath();
        ctx.arc(bx + shadowOff, by + shadowOff, boulderR * 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Boulder glow layers
        for (let g = BOULDER_GLOW_LAYERS; g >= 1; g--) {
          const gr = boulderR * (1 + g * 0.3);
          const bGlow = ctx.createRadialGradient(bx, by, boulderR * 0.8, bx, by, gr);
          bGlow.addColorStop(0, rgba(s.accentRgb, (ALPHA.glow.max / g) * entrance * 0.5));
          bGlow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = bGlow;
          ctx.beginPath();
          ctx.arc(bx, by, gr, 0, Math.PI * 2);
          ctx.fill();
        }

        // Boulder body — multi-stop gradient
        const bGrad = ctx.createRadialGradient(
          bx - boulderR * 0.2, by - boulderR * 0.2, 0,
          bx, by, boulderR,
        );
        const boulderDark = lerpColor(s.accentRgb, [40, 30, 50] as RGB, 0.6);
        bGrad.addColorStop(0, rgba(lerpColor(s.accentRgb, [200, 180, 200] as RGB, 0.2), ALPHA.accent.max * entrance));
        bGrad.addColorStop(0.3, rgba(s.accentRgb, ALPHA.focal.max * entrance));
        bGrad.addColorStop(0.65, rgba(boulderDark, ALPHA.focal.max * entrance));
        bGrad.addColorStop(0.9, rgba(boulderDark, ALPHA.content.max * entrance));
        bGrad.addColorStop(1, rgba(boulderDark, 0));
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(bx, by, boulderR, 0, Math.PI * 2);
        ctx.fill();

        // Boulder specular
        const specX = bx - boulderR * 0.3;
        const specY = by - boulderR * 0.3;
        const specGrad = ctx.createRadialGradient(specX, specY, 0, specX, specY, px(SPECULAR_R, minDim) * 2);
        specGrad.addColorStop(0, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.7 * entrance));
        specGrad.addColorStop(0.5, rgba([255, 255, 255] as RGB, ALPHA.glow.max * entrance));
        specGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = specGrad;
        ctx.beginPath();
        ctx.arc(specX, specY, px(SPECULAR_R, minDim) * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 5: DETOUR ARC PATH
      // ═══════════════════════════════════════════════════════════
      if (arc > 0.05) {
        const leftEnd = bx - boulderR - px(0.01, minDim);
        const rightStart = bx + boulderR + px(0.01, minDim);
        const arcTop = by - boulderR - px(ARC_HEIGHT, minDim) * arc;

        // Draw arc as Bezier curve
        ctx.beginPath();
        ctx.moveTo(leftEnd, pathY);
        ctx.bezierCurveTo(
          leftEnd, arcTop,
          rightStart, arcTop,
          rightStart, pathY,
        );

        // Glow
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.glow.max * arc * entrance);
        ctx.lineWidth = px(PATH_GLOW_W, minDim);
        ctx.lineCap = 'round';
        ctx.stroke();

        // Body
        ctx.beginPath();
        ctx.moveTo(leftEnd, pathY);
        ctx.bezierCurveTo(
          leftEnd, arcTop,
          rightStart, arcTop,
          rightStart, pathY,
        );
        const arcColor = lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.1);
        ctx.strokeStyle = rgba(arcColor, ALPHA.focal.max * arc * entrance);
        ctx.lineWidth = px(PATH_STROKE, minDim);
        ctx.stroke();
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 6: RECONNECTION SPARK
      // ═══════════════════════════════════════════════════════════
      if (arc > 0.7) {
        const rightStart = bx + boulderR + px(0.01, minDim);
        const sparkAlpha = (arc - 0.7) / 0.3;

        for (let r = 0; r < SPARK_RINGS; r++) {
          const sr = px(SPARK_R, minDim) * (1 + r * 1.5) * (1 + Math.sin(s.frameCount * 0.08) * 0.1 * ms);
          const sparkGlow = ctx.createRadialGradient(rightStart, pathY, 0, rightStart, pathY, sr);
          sparkGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * sparkAlpha * entrance / (r + 1)));
          sparkGlow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = sparkGlow;
          ctx.beginPath();
          ctx.arc(rightStart, pathY, sr, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 7: SEVERED END HANDLE
      // ═══════════════════════════════════════════════════════════
      {
        const leftEnd = bx - boulderR - px(0.01, minDim);
        const handleX = leftEnd;
        const handleY = pathY;
        const hr = px(HANDLE_R, minDim) * (1 + breath * 0.1);

        for (let g = HANDLE_GLOW_LAYERS; g >= 1; g--) {
          const gr = hr * (1 + g * 1.2);
          const hGlow = ctx.createRadialGradient(handleX, handleY, 0, handleX, handleY, gr);
          hGlow.addColorStop(0, rgba(s.primaryRgb, (ALPHA.glow.max / g) * entrance));
          hGlow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = hGlow;
          ctx.beginPath();
          ctx.arc(handleX, handleY, gr, 0, Math.PI * 2);
          ctx.fill();
        }

        const hGrad = ctx.createRadialGradient(handleX, handleY, 0, handleX, handleY, hr);
        hGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.4), ALPHA.accent.max * entrance));
        hGrad.addColorStop(0.35, rgba(s.primaryRgb, ALPHA.focal.max * entrance));
        hGrad.addColorStop(0.75, rgba(s.primaryRgb, ALPHA.content.max * entrance));
        hGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = hGrad;
        ctx.beginPath();
        ctx.arc(handleX, handleY, hr, 0, Math.PI * 2);
        ctx.fill();

        // Specular
        ctx.beginPath();
        ctx.arc(handleX - hr * 0.3, handleY - hr * 0.3, hr * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.7 * entrance);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 8: PROGRESS RING + COMPLETION
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
        ctx.arc(ringX, ringY, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * arc);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      if (arc >= COMPLETE_THRESHOLD && !s.completed) {
        s.completed = true;
        s.bloomTimer = BLOOM_FRAMES;
        cb.onHaptic('completion');
        cb.onStateChange?.(1);
      }

      if (s.bloomTimer > 0) {
        s.bloomTimer -= ms;
        const bloomT = Math.max(0, s.bloomTimer / BLOOM_FRAMES);
        const bloomR = px(SIZE.lg, minDim) * (1 - bloomT);
        const bloom = ctx.createRadialGradient(cx, pathY, 0, cx, pathY, bloomR);
        bloom.addColorStop(0, rgba(s.primaryRgb, ALPHA.accent.max * bloomT * entrance));
        bloom.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * bloomT * entrance));
        bloom.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bloom;
        ctx.beginPath();
        ctx.arc(cx, pathY, bloomR, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ═══════════════════════════════════════════════════════════════
    // POINTER EVENTS
    // ═══════════════════════════════════════════════════════════════
    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      stateRef.current.dragX = e.clientX;
      stateRef.current.dragY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('drag_snap');
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      // Upward drag increases arc
      const dy = s.dragY - e.clientY;
      const newArc = Math.min(1, Math.max(s.arcProgress, dy / 150));
      if (newArc > s.arcProgress) {
        s.arcProgress = newArc;
        callbacksRef.current.onStateChange?.(s.arcProgress * 0.95);
        if (newArc > 0.3 && newArc < 0.35) {
          callbacksRef.current.onHaptic('step_advance');
        }
      }
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.dragging = false;
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
