/**
 * ATOM 605: THE KINETIC RETURN ENGINE
 * =====================================
 * Series 61 — Aikido Redirect · Position 5
 *
 * Return projections at zero cost. Draw a parabolic U-shape curve
 * in front of your node — the projectile rides the geometry retaining
 * 100% velocity shooting directly back to its source.
 *
 * PHYSICS:
 *   - Sharp dark projectile fired at user from top
 *   - Draw a U-shaped curve in the interception zone
 *   - Projectile rides the parabolic curve
 *   - Retains 100% velocity, returns to source
 *   - User expends zero energy
 *
 * INTERACTION:
 *   Draw (parabolic U-shape) → creates reflector curve
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static parabolic curve with arrow path
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

const PROJECTILE_SPEED = 0.005;
const PROJECTILE_R_FRAC = 0.012;
const NODE_R_FRAC = 0.022;
const INTERCEPT_ZONE_TOP = 0.45;
const INTERCEPT_ZONE_BOT = 0.68;
const MIN_CURVE_POINTS = 6;
const RETURN_SPEED = 0.006;

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function KineticReturnCurveAtom({
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
    // Projectile
    projY: -0.05,       // fraction of h
    projX: 0.5,
    projActive: true,
    projReturning: false,
    projReturnY: 0,
    projReturnX: 0.5,
    // Drawn curve
    curvePoints: [] as { x: number; y: number }[],
    drawing: false,
    curveReady: false,
    // Ride animation
    rideProgress: 0,    // 0→1 along curve
    ridingDown: true,    // first half: down the U
    // Completion
    completions: 0,
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

      const nodeR = px(NODE_R_FRAC, minDim);
      const projR = px(PROJECTILE_R_FRAC, minDim);
      const coreY = h * 0.78;

      // ── Projectile physics ──────────────────────────
      if (!p.reducedMotion && s.projActive && !s.projReturning && !s.curveReady) {
        s.projY += PROJECTILE_SPEED;
        // Miss — projectile reaches core without curve
        if (s.projY * h >= coreY) {
          s.projActive = false;
          s.respawnTimer = 60;
          cb.onHaptic('error_boundary');
        }
      }

      // ── Check if curve intercepts projectile ────────
      if (s.curveReady && s.projActive && !s.projReturning) {
        const projAbsY = s.projY * h;
        // Check if projectile reached the curve zone
        if (s.curvePoints.length > 0) {
          const firstPt = s.curvePoints[0];
          if (projAbsY >= firstPt.y - projR * 2) {
            s.projReturning = true;
            s.rideProgress = 0;
            cb.onHaptic('drag_snap');
          }
        }
      }

      // ── Ride the curve ──────────────────────────────
      if (s.projReturning && s.curvePoints.length > 1) {
        s.rideProgress += RETURN_SPEED * 60;
        const idx = Math.min(Math.floor(s.rideProgress * s.curvePoints.length), s.curvePoints.length - 1);
        const pt = s.curvePoints[idx];
        s.projReturnX = pt.x / w;
        s.projReturnY = pt.y / h;

        if (s.rideProgress >= 1) {
          // Projectile exits upward
          s.projActive = false;
          s.projReturning = false;
          s.curveReady = false;
          s.curvePoints = [];
          s.completions++;
          cb.onHaptic('completion');
          cb.onStateChange?.(Math.min(1, s.completions / 3));
          s.respawnTimer = 80;
        }
      }

      // ── Respawn ─────────────────────────────────────
      if (!s.projActive && !s.projReturning) {
        s.respawnTimer--;
        if (s.respawnTimer <= 0 && p.phase !== 'resolve') {
          s.projY = -0.05;
          s.projX = 0.4 + Math.random() * 0.2;
          s.projActive = true;
          s.projReturning = false;
          s.curveReady = false;
          s.curvePoints = [];
        }
      }

      // ── Draw user core ──────────────────────────────
      const coreGlow = ctx.createRadialGradient(cx, coreY, 0, cx, coreY, nodeR * 5);
      coreGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * entrance));
      coreGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = coreGlow;
      ctx.fillRect(cx - nodeR * 5, coreY - nodeR * 5, nodeR * 10, nodeR * 10);

      ctx.beginPath();
      ctx.arc(cx, coreY, nodeR * (1 + breath * 0.1), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
      ctx.fill();

      // ── Draw intercept zone hint ────────────────────
      if (s.projActive && !s.curveReady && !s.projReturning) {
        const zoneTop = h * INTERCEPT_ZONE_TOP;
        const zoneBot = h * INTERCEPT_ZONE_BOT;
        const zoneAlpha = ALPHA.background.min * entrance * (0.5 + 0.5 * Math.sin(s.frameCount * 0.04 * ms));
        ctx.fillStyle = rgba(s.primaryRgb, zoneAlpha);
        ctx.fillRect(cx - minDim * 0.2, zoneTop, minDim * 0.4, zoneBot - zoneTop);
      }

      // ── Draw curve ──────────────────────────────────
      if (s.curvePoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(s.curvePoints[0].x, s.curvePoints[0].y);
        for (let i = 1; i < s.curvePoints.length; i++) {
          ctx.lineTo(s.curvePoints[i].x, s.curvePoints[i].y);
        }
        const curveAlpha = (s.curveReady ? ALPHA.content.max : ALPHA.atmosphere.max) * entrance;
        ctx.strokeStyle = rgba(s.primaryRgb, curveAlpha);
        ctx.lineWidth = px(0.002, minDim);
        ctx.stroke();
      }

      // ── Draw projectile ─────────────────────────────
      if (s.projActive) {
        let projDrawX: number, projDrawY: number;
        if (s.projReturning) {
          projDrawX = s.projReturnX * w;
          projDrawY = s.projReturnY * h;
        } else {
          projDrawX = s.projX * w;
          projDrawY = s.projY * h;
        }

        // Sharp diamond shape
        ctx.beginPath();
        ctx.moveTo(projDrawX, projDrawY - projR * 1.5);
        ctx.lineTo(projDrawX + projR, projDrawY);
        ctx.lineTo(projDrawX, projDrawY + projR * 1.5);
        ctx.lineTo(projDrawX - projR, projDrawY);
        ctx.closePath();
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * entrance);
        ctx.fill();

        // Trail
        if (!s.projReturning) {
          ctx.beginPath();
          ctx.moveTo(projDrawX, projDrawY - projR * 1.5);
          ctx.lineTo(projDrawX, projDrawY - projR * 1.5 - minDim * 0.04);
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.atmosphere.min * entrance);
          ctx.lineWidth = px(0.001, minDim);
          ctx.stroke();
        }
      }

      // ── Source indicator (top) ──────────────────────
      const sourceAlpha = ALPHA.atmosphere.min * entrance;
      ctx.beginPath();
      ctx.arc(s.projX * w, h * 0.04, px(0.008, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.accentRgb, sourceAlpha);
      ctx.fill();

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Pointer handlers ──────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.curveReady || s.projReturning || !s.projActive) return;
      s.drawing = true;
      s.curvePoints = [];
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (viewport.width / rect.width);
      const my = (e.clientY - rect.top) * (viewport.height / rect.height);
      s.curvePoints.push({ x: mx, y: my });
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.drawing) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (viewport.width / rect.width);
      const my = (e.clientY - rect.top) * (viewport.height / rect.height);
      s.curvePoints.push({ x: mx, y: my });
    };

    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.drawing) return;
      s.drawing = false;
      canvas.releasePointerCapture(e.pointerId);

      // Validate U-shape: need enough points, and Y should dip then rise
      if (s.curvePoints.length >= MIN_CURVE_POINTS) {
        const ys = s.curvePoints.map(p => p.y);
        const minY = Math.min(...ys);
        const firstY = ys[0];
        const lastY = ys[ys.length - 1];
        // U-shape: start high, dip low, end high-ish
        if (minY < firstY && minY < lastY) {
          s.curveReady = true;
          callbacksRef.current.onHaptic('drag_snap');
        }
      }
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
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }}
      />
    </div>
  );
}
