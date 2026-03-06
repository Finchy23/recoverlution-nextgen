/**
 * ATOM 603: THE CORNER TRAP ENGINE
 * ==================================
 * Series 61 — Aikido Redirect · Position 3
 *
 * Escape being cornered. Execute a tight circular pivot gesture —
 * physics rotates you around the threat swapping spatial coordinates.
 * You slide into open space. Threat faces the wall.
 *
 * PHYSICS:
 *   - User node backed into rigid 90-degree corner
 *   - Threat node approaches, blocking escape
 *   - Circular pivot gesture rotates user around threat
 *   - Coordinate swap: user → open space, threat → corner
 *   - Breath modulates ambient corner glow
 *
 * INTERACTION:
 *   Drag (circular) → pivots user around threat
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static pre/post coordinate swap
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const NODE_R_FRAC = 0.022;
const THREAT_R_FRAC = 0.03;
const CORNER_INSET = 0.12;       // fraction of minDim from edge
const PIVOT_SENSITIVITY = 0.004;
const PIVOT_THRESHOLD = Math.PI * 1.5; // ~270° rotation needed to complete
const THREAT_APPROACH_SPEED = 0.0008;

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function CornerTrapPivotAtom({
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
    // Positions (fraction of viewport)
    userAngle: 0,          // angle around the pivot center
    pivotAccum: 0,         // accumulated pivot rotation
    pivotComplete: false,
    // Threat
    threatApproach: 0,     // 0 = far, 1 = at user
    threatLocked: false,   // threat reached corner
    // Drag
    dragActive: false,
    lastAngle: 0,
    // Completion
    swapProgress: 0,       // 0→1 animated swap
    completed: false,
    respawnTimer: 0,
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

      if (!p.composed) {
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      }

      const inset = minDim * CORNER_INSET;
      const cornerX = w - inset;     // bottom-right corner
      const cornerY = h - inset;
      const nodeR = px(NODE_R_FRAC, minDim);
      const threatR = px(THREAT_R_FRAC, minDim);

      // ── Draw corner walls ───────────────────────────
      const wallAlpha = ALPHA.atmosphere.max * entrance;
      ctx.strokeStyle = rgba(s.primaryRgb, wallAlpha);
      ctx.lineWidth = px(0.002, minDim);
      // Right wall
      ctx.beginPath();
      ctx.moveTo(w - px(0.005, minDim), h * 0.3);
      ctx.lineTo(w - px(0.005, minDim), h - px(0.005, minDim));
      ctx.lineTo(w * 0.3, h - px(0.005, minDim));
      ctx.stroke();

      // ── Threat approach ─────────────────────────────
      if (!p.reducedMotion && !s.pivotComplete && !s.completed) {
        s.threatApproach = Math.min(1, s.threatApproach + THREAT_APPROACH_SPEED);
      }

      // Threat position: approaches from upper-left toward corner
      const threatStartX = w * 0.3;
      const threatStartY = h * 0.3;
      const threatTargetX = cornerX - minDim * 0.08;
      const threatTargetY = cornerY - minDim * 0.08;
      const threatX = threatStartX + (threatTargetX - threatStartX) * s.threatApproach;
      const threatY = threatStartY + (threatTargetY - threatStartY) * s.threatApproach;

      // ── User position: in corner, pivots around threat ──
      const pivotCenterX = threatX;
      const pivotCenterY = threatY;
      const orbitR = minDim * 0.07;

      // User starts in corner (angle ~π/4 toward bottom-right)
      const baseAngle = Math.PI * 0.25;
      const currentAngle = baseAngle + s.pivotAccum;
      const userX = s.pivotComplete
        ? pivotCenterX + Math.cos(currentAngle) * orbitR * (1 - s.swapProgress) + (w * 0.35) * s.swapProgress
        : pivotCenterX + Math.cos(currentAngle) * orbitR;
      const userY = s.pivotComplete
        ? pivotCenterY + Math.sin(currentAngle) * orbitR * (1 - s.swapProgress) + (h * 0.35) * s.swapProgress
        : pivotCenterY + Math.sin(currentAngle) * orbitR;

      // ── Swap animation ──────────────────────────────
      if (s.pivotComplete && !s.completed) {
        s.swapProgress = Math.min(1, s.swapProgress + 0.02);
        if (s.swapProgress >= 1) {
          s.completed = true;
          cb.onHaptic('completion');
          cb.onStateChange?.(1);
          s.respawnTimer = 100;
        }
      }

      // ── Draw pivot trail ────────────────────────────
      if (s.pivotAccum > 0.1 && !s.completed) {
        ctx.beginPath();
        ctx.arc(pivotCenterX, pivotCenterY, orbitR, baseAngle, currentAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * entrance);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();
      }

      // ── Draw threat node ────────────────────────────
      const tAlpha = ALPHA.content.max * entrance;
      const threatGlow = ctx.createRadialGradient(threatX, threatY, 0, threatX, threatY, threatR * 3);
      threatGlow.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.3 * entrance));
      threatGlow.addColorStop(1, rgba(s.accentRgb, 0));
      ctx.fillStyle = threatGlow;
      ctx.fillRect(threatX - threatR * 3, threatY - threatR * 3, threatR * 6, threatR * 6);

      ctx.beginPath();
      ctx.arc(threatX, threatY, threatR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.accentRgb, tAlpha);
      ctx.fill();

      // ── Draw user node ──────────────────────────────
      const userGlow = ctx.createRadialGradient(userX, userY, 0, userX, userY, nodeR * 4);
      userGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.5 * entrance));
      userGlow.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * entrance));
      userGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = userGlow;
      ctx.fillRect(userX - nodeR * 4, userY - nodeR * 4, nodeR * 8, nodeR * 8);

      ctx.beginPath();
      ctx.arc(userX, userY, nodeR * (1 + breath * 0.1), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
      ctx.fill();

      // ── Open space indicator ────────────────────────
      if (s.pivotComplete) {
        const openAlpha = ALPHA.glow.min * s.swapProgress * entrance;
        const openGrad = ctx.createRadialGradient(w * 0.35, h * 0.35, 0, w * 0.35, h * 0.35, minDim * 0.15);
        openGrad.addColorStop(0, rgba(s.primaryRgb, openAlpha));
        openGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = openGrad;
        ctx.fillRect(0, 0, w * 0.7, h * 0.7);

        const corridorW = minDim * (0.16 + s.swapProgress * 0.08);
        const escapeX = w * 0.35;
        const escapeY = h * 0.35;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cornerX - minDim * 0.04, cornerY - minDim * 0.04);
        ctx.quadraticCurveTo(
          w * 0.68,
          h * 0.68,
          escapeX,
          escapeY,
        );
        ctx.lineWidth = corridorW;
        ctx.lineCap = 'round';
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.background.min * 3.2 * s.swapProgress * entrance);
        ctx.stroke();
        ctx.restore();

        const cageW = minDim * (0.12 + s.swapProgress * 0.06);
        const cageH = minDim * (0.1 + s.swapProgress * 0.04);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.atmosphere.max * 0.24 * s.swapProgress * entrance);
        ctx.lineWidth = px(0.0012, minDim);
        ctx.strokeRect(threatX - cageW / 2, threatY - cageH / 2, cageW, cageH);
      }

      // ── Respawn ─────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.pivotAccum = 0;
          s.pivotComplete = false;
          s.swapProgress = 0;
          s.completed = false;
          s.threatApproach = 0;
          s.threatLocked = false;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const getAngle = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      const { w: vw, h: vh } = { w: viewport.width, h: viewport.height };
      const inset = Math.min(vw, vh) * CORNER_INSET;
      // Pivot around threat position
      const approach = s.threatApproach;
      const pcx = vw * 0.3 + ((vw - inset) - vw * 0.3 - Math.min(vw, vh) * 0.08) * approach;
      const pcy = vh * 0.3 + ((vh - inset) - vh * 0.3 - Math.min(vw, vh) * 0.08) * approach;
      const mx = (e.clientX - rect.left) * (vw / rect.width);
      const my = (e.clientY - rect.top) * (vh / rect.height);
      return Math.atan2(my - pcy, mx - pcx);
    };

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.pivotComplete || s.completed) return;
      s.dragActive = true;
      s.lastAngle = getAngle(e);
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('drag_snap');
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragActive) return;
      const newAngle = getAngle(e);
      let delta = newAngle - s.lastAngle;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      // Only allow counter-clockwise (positive) rotation
      if (delta > 0) {
        s.pivotAccum += delta;
        callbacksRef.current.onStateChange?.(Math.min(1, s.pivotAccum / PIVOT_THRESHOLD));
        if (s.pivotAccum >= PIVOT_THRESHOLD && !s.pivotComplete) {
          s.pivotComplete = true;
          callbacksRef.current.onHaptic('drag_snap');
        }
      }
      s.lastAngle = newAngle;
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.dragActive = false;
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
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }}
      />
    </div>
  );
}
