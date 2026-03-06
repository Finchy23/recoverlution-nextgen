/**
 * ATOM 238: THE BUTTERFLY EFFECT ENGINE
 * =======================================
 * Series 24 — Net of Indra · Position 8
 *
 * A tiny shift changes the entire outcome. Scrub a microscopic
 * slider — watch a chaotic Lorenz attractor resolve into a
 * harmonious mandala. Sensitivity to initial conditions.
 *
 * PHYSICS:
 *   - Lorenz strange attractor visualized as 3 projected trajectory paths
 *   - Each path starts from nearly-identical initial conditions
 *   - Horizontal scrub adjusts the tiny perturbation (0.0001 range)
 *   - Paths diverge exponentially — the butterfly effect
 *   - At one specific scrub position, all paths converge → mandala
 *   - Mandala = 8-fold symmetric pattern from converged trajectories
 *   - 200 trajectory points per path, drawn as glowing dot trails
 *   - Breath modulates Lorenz sigma parameter (chaos intensity)
 *
 * INTERACTION:
 *   Horizontal scrub → adjusts perturbation → paths converge/diverge
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static converged mandala
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Lorenz sigma */
const SIGMA = 10;
/** Lorenz rho */
const RHO = 28;
/** Lorenz beta */
const BETA = 8 / 3;
/** Integration timestep */
const DT = 0.005;
/** Trajectory point count */
const TRAJ_POINTS = 200;
/** Number of diverging paths */
const PATH_COUNT = 3;
/** Perturbation range */
const PERTURB_RANGE = 0.001;
/** Convergence threshold (average path distance) */
const CONVERGE_THRESHOLD = 2;
/** Convergence frames needed */
const CONVERGE_FRAMES = 90;
/** Drag sensitivity */
const DRAG_SENSITIVITY = 0.003;
/** Breath sigma modulation */
const BREATH_SIGMA = 0.15;
/** Projection scale (Lorenz coords → viewport fraction) */
const PROJ_SCALE = 0.008;
/** Mandala fold symmetry */
const MANDALA_FOLDS = 8;

// =====================================================================
// STATE TYPES
// =====================================================================

interface LorenzPath {
  points: Array<{ x: number; y: number; z: number }>;
  colorT: number;
}

// =====================================================================
// HELPERS
// =====================================================================

function computeLorenz(x0: number, y0: number, z0: number, sigma: number): Array<{ x: number; y: number; z: number }> {
  const pts: Array<{ x: number; y: number; z: number }> = [];
  let x = x0, y = y0, z = z0;
  for (let i = 0; i < TRAJ_POINTS; i++) {
    const dx = sigma * (y - x) * DT;
    const dy = (x * (RHO - z) - y) * DT;
    const dz = (x * y - BETA * z) * DT;
    x += dx; y += dy; z += dz;
    pts.push({ x, y, z });
  }
  return pts;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function ButterflyEffectAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  composed,
  onHaptic,
  onStateChange,
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
    perturbation: 0.5,   // 0-1, middle = convergence point
    dragging: false,
    lastX: 0,
    paths: [] as LorenzPath[],
    convergeFrames: 0,
    completed: false,
    stepNotified: false,
    completionGlow: 0,
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
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;
      const time = s.frameCount * 0.012;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.phase === 'resolve') {
        s.perturbation = 0.5;
        s.completed = true;
      }

      // ── Compute Lorenz paths ───────────────────────────
      const sigma = SIGMA * (1 + breath * BREATH_SIGMA);
      const perturbAmt = (s.perturbation - 0.5) * PERTURB_RANGE * 2;

      s.paths = [];
      for (let pi = 0; pi < PATH_COUNT; pi++) {
        const offset = (pi - 1) * perturbAmt;
        const pts = computeLorenz(1 + offset, 1 + offset * 0.5, 1, sigma);
        s.paths.push({ points: pts, colorT: pi / (PATH_COUNT - 1) });
      }

      // ── Convergence measurement ────────────────────────
      let avgDist = 0;
      if (s.paths.length >= 2) {
        const lastIdx = TRAJ_POINTS - 1;
        for (let i = 0; i < PATH_COUNT - 1; i++) {
          const a = s.paths[i].points[lastIdx];
          const b = s.paths[i + 1].points[lastIdx];
          avgDist += Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
        }
        avgDist /= PATH_COUNT - 1;
      }

      const converged = avgDist < CONVERGE_THRESHOLD;
      if (converged) {
        s.convergeFrames = Math.min(CONVERGE_FRAMES, s.convergeFrames + 1);
      } else {
        s.convergeFrames = Math.max(0, s.convergeFrames - 0.5);
      }

      if (s.convergeFrames >= CONVERGE_FRAMES * 0.5 && !s.stepNotified) {
        s.stepNotified = true;
        cb.onHaptic('drag_snap');
      }
      if (s.convergeFrames >= CONVERGE_FRAMES && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      if (s.completed) {
        s.completionGlow = Math.min(1, s.completionGlow + 0.005);
      }

      const convergence = s.convergeFrames / CONVERGE_FRAMES;
      cb.onStateChange?.(s.completed ? 0.5 + s.completionGlow * 0.5 : convergence * 0.5);

      // ── Reduced motion ──────────────────────────────────
      if (p.reducedMotion) {
        // Static mandala
        const mandR = px(SIZE.md, minDim);
        for (let fold = 0; fold < MANDALA_FOLDS; fold++) {
          const foldAngle = (fold / MANDALA_FOLDS) * Math.PI * 2;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(foldAngle);
          ctx.beginPath();
          for (let i = 0; i < 30; i++) {
            const t = i / 30;
            const mx = t * mandR;
            const my = Math.sin(t * Math.PI * 3) * mandR * 0.2;
            if (i === 0) ctx.moveTo(mx, my);
            else ctx.lineTo(mx, my);
          }
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.12 * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
          ctx.restore();
        }
        cb.onStateChange?.(1);
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Trajectory field background glow
      // ════════════════════════════════════════════════════
      const glowR = px(0.35, minDim);
      const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      fg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.04 * entrance));
      fg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.01 * entrance));
      fg.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = fg;
      ctx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Lorenz trajectory paths
      // ════════════════════════════════════════════════════
      for (const path of s.paths) {
        const pathColor = lerpColor(s.primaryRgb, s.accentRgb, path.colorT * 0.5);

        // Trail line
        ctx.beginPath();
        for (let i = 0; i < path.points.length; i++) {
          const pt = path.points[i];
          // Project 3D Lorenz coords to 2D
          const projX = cx + pt.x * PROJ_SCALE * minDim;
          const projY = cy + pt.z * PROJ_SCALE * minDim - px(0.15, minDim);

          if (i === 0) ctx.moveTo(projX, projY);
          else ctx.lineTo(projX, projY);
        }
        ctx.strokeStyle = rgba(pathColor, ALPHA.content.max * 0.08 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();

        // Bright dots at intervals
        for (let i = 0; i < path.points.length; i += 5) {
          const pt = path.points[i];
          const projX = cx + pt.x * PROJ_SCALE * minDim;
          const projY = cy + pt.z * PROJ_SCALE * minDim - px(0.15, minDim);
          const dotR = px(0.002 + convergence * 0.001, minDim);
          const dotAlpha = (i / path.points.length) * 0.3; // fade in along path

          ctx.beginPath();
          ctx.arc(projX, projY, dotR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(pathColor, ALPHA.content.max * (0.1 + dotAlpha) * entrance);
          ctx.fill();
        }

        // Head glow (end of trajectory)
        const head = path.points[path.points.length - 1];
        const headX = cx + head.x * PROJ_SCALE * minDim;
        const headY = cy + head.z * PROJ_SCALE * minDim - px(0.15, minDim);
        const headR = px(0.008, minDim);
        const hg = ctx.createRadialGradient(headX, headY, 0, headX, headY, headR);
        hg.addColorStop(0, rgba(pathColor, ALPHA.glow.max * 0.15 * entrance));
        hg.addColorStop(0.3, rgba(pathColor, ALPHA.glow.max * 0.05 * entrance));
        hg.addColorStop(1, rgba(pathColor, 0));
        ctx.fillStyle = hg;
        ctx.fillRect(headX - headR, headY - headR, headR * 2, headR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Mandala overlay (at convergence)
      // ════════════════════════════════════════════════════
      if (convergence > 0.3) {
        const mandalaAlpha = (convergence - 0.3) / 0.7;
        const mandR = px(SIZE.md * convergence, minDim);

        for (let fold = 0; fold < MANDALA_FOLDS; fold++) {
          const foldAngle = (fold / MANDALA_FOLDS) * Math.PI * 2 + time * 0.05;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(foldAngle);

          ctx.beginPath();
          for (let i = 0; i < 30; i++) {
            const t = i / 30;
            const mx = t * mandR;
            const my = Math.sin(t * Math.PI * 3 + time * 0.3) * mandR * 0.15 * convergence;
            if (i === 0) ctx.moveTo(mx, my);
            else ctx.lineTo(mx, my);
          }
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * mandalaAlpha * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
          ctx.restore();
        }

        // Central mandala glow
        const mgR = mandR * 0.5;
        const mg = ctx.createRadialGradient(cx, cy, 0, cx, cy, mgR);
        mg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.1 * mandalaAlpha * entrance));
        mg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.03 * mandalaAlpha * entrance));
        mg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = mg;
        ctx.fillRect(cx - mgR, cy - mgR, mgR * 2, mgR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Scrub indicator
      // ════════════════════════════════════════════════════
      const scrubY = h * 0.88;
      const scrubW = w * 0.5;
      const scrubX0 = cx - scrubW / 2;

      // Track
      ctx.beginPath();
      ctx.moveTo(scrubX0, scrubY);
      ctx.lineTo(scrubX0 + scrubW, scrubY);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance);
      ctx.lineWidth = px(STROKE.thin, minDim);
      ctx.stroke();

      // Handle
      const handleX = scrubX0 + s.perturbation * scrubW;
      const handleR = px(0.008, minDim);
      const handleGrad = ctx.createRadialGradient(handleX - handleR * 0.15, scrubY - handleR * 0.15, handleR * 0.1, handleX, scrubY, handleR);
      handleGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3), ALPHA.content.max * 0.35 * entrance));
      handleGrad.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.content.max * 0.25 * entrance));
      handleGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance));
      ctx.beginPath();
      ctx.arc(handleX, scrubY, handleR, 0, Math.PI * 2);
      ctx.fillStyle = handleGrad;
      ctx.fill();

      // ── Progress ───────────────────────────────────────
      if (!s.completed && convergence > 0.02) {
        const progR = px(SIZE.xs, minDim);
        ctx.beginPath();
        ctx.arc(cx, cy - px(0.4, minDim), progR, -Math.PI / 2, -Math.PI / 2 + convergence * Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Horizontal scrub ────────────────────────────────
    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      stateRef.current.lastX = e.clientX;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const dx = e.clientX - s.lastX;
      s.perturbation = Math.max(0, Math.min(1, s.perturbation + dx * DRAG_SENSITIVITY));
      s.lastX = e.clientX;
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
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ew-resize' }}
      />
    </div>
  );
}
