/**
 * ATOM 389: THE SLINGSHOT ORBIT ENGINE
 * ======================================
 * Series 39 — Momentum Wheel · Position 9
 *
 * Cure using past failure as an excuse to stop. Plot a trajectory
 * that uses the failure's gravity to slingshot forward at 3x velocity.
 *
 * PHYSICS:
 *   - Massive dark "Failure" node at viewport center with gravity well
 *   - Concentric gravitational field rings visualize pull strength
 *   - Small bright probe node starts at left edge
 *   - User drags to set launch angle and velocity vector
 *   - Release sends probe on trajectory influenced by gravity
 *   - Correct angle: probe whips around dark mass, accelerates 3x
 *   - Too direct: captured and destroyed. Too wide: misses entirely
 *   - Breath modulates the gravitational field visualization
 *
 * INTERACTION:
 *   Drag (from probe) → sets trajectory vector, release launches
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static trajectory arc with probe at exit velocity
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, GLOW, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Dark mass radius (visual) */
const DARK_MASS_R_FRAC = 0.06;
/** Gravity field visible rings */
const GRAVITY_RING_COUNT = 5;
/** Gravity field outer radius */
const GRAVITY_FIELD_R_FRAC = SIZE.lg;
/** Gravitational constant */
const GRAVITY_CONSTANT = 0.00012;
/** Capture radius (too close = destroyed) */
const CAPTURE_R_FRAC = 0.04;
/** Probe radius */
const PROBE_R_FRAC = 0.014;
/** Probe start position */
const PROBE_START_X = 0.12;
const PROBE_START_Y = 0.35;
/** Initial launch speed multiplier (from drag length) */
const LAUNCH_SPEED_MULT = 0.0003;
/** Maximum drag distance for velocity display */
const MAX_DRAG_DIST = 200;
/** Slingshot exit speed threshold for success */
const EXIT_SPEED_THRESHOLD = 0.006;
/** Trail max length */
const TRAIL_MAX = 150;
/** Trail dot spacing */
const TRAIL_DOT_INTERVAL = 3;
/** Velocity arrow scale */
const VELOCITY_ARROW_SCALE = 0.15;
/** Breath field modulation */
const BREATH_FIELD_FACTOR = 0.12;
/** Exit zone X (fraction) */
const EXIT_X = 1.05;
/** Probe glow multiplier at high speed */
const SPEED_GLOW_MULT = 3;
/** Max physics steps per frame (prevent tunneling) */
const MAX_STEPS = 3;

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function SlingshotOrbitAtom({
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
    probeX: PROBE_START_X,
    probeY: PROBE_START_Y,
    vx: 0,
    vy: 0,
    launched: false,
    captured: false,
    escaped: false,
    escapeAnim: 0,
    completed: false,
    trail: [] as { x: number; y: number; speed: number }[],
    peakSpeed: 0,
    // Drag state
    dragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragEndX: 0,
    dragEndY: 0,
    // Closest approach tracking
    closestDist: Infinity,
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

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      if (!p.composed) {
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      }

      // ── Resolve phase ───────────────────────────────
      if (p.phase === 'resolve' && !s.launched) {
        s.launched = true;
        s.vx = 0.005;
        s.vy = 0.002;
      }

      // ── Gravity physics ─────────────────────────────
      if (s.launched && !s.captured && !s.escaped) {
        for (let step = 0; step < MAX_STEPS; step++) {
          const dx = 0.5 - s.probeX;
          const dy = 0.5 - s.probeY;
          const dist = Math.max(0.03, Math.sqrt(dx * dx + dy * dy));
          const force = GRAVITY_CONSTANT / (dist * dist);

          s.vx += (dx / dist) * force * ms;
          s.vy += (dy / dist) * force * ms;
          s.probeX += s.vx * ms / MAX_STEPS;
          s.probeY += s.vy * ms / MAX_STEPS;

          s.closestDist = Math.min(s.closestDist, dist);
        }

        const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
        s.peakSpeed = Math.max(s.peakSpeed, speed);

        // Trail recording
        if (s.frameCount % TRAIL_DOT_INTERVAL === 0) {
          s.trail.push({ x: s.probeX, y: s.probeY, speed });
          if (s.trail.length > TRAIL_MAX) s.trail.shift();
        }

        // Capture check
        const distToCenter = Math.sqrt(
          (s.probeX - 0.5) ** 2 + (s.probeY - 0.5) ** 2,
        );
        if (distToCenter < CAPTURE_R_FRAC) {
          s.captured = true;
          cb.onHaptic('error_boundary');
        }

        // Escape check
        if (s.probeX > EXIT_X && speed > EXIT_SPEED_THRESHOLD) {
          s.escaped = true;
          s.completed = true;
          cb.onHaptic('completion');
        }

        // Off screen without sufficient speed = miss
        if ((s.probeX < -0.2 || s.probeX > 1.3 || s.probeY < -0.2 || s.probeY > 1.3) && !s.escaped) {
          s.captured = true; // Treat as failure
        }
      }

      if (s.escaped) {
        s.escapeAnim = Math.min(1, s.escapeAnim + 0.01 * ms);
      }

      cb.onStateChange?.(s.escaped
        ? 0.5 + s.escapeAnim * 0.5
        : s.launched ? Math.min(0.5, s.peakSpeed * 30) : 0);

      const darkR = px(DARK_MASS_R_FRAC, minDim);
      const fieldR = px(GRAVITY_FIELD_R_FRAC, minDim);

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        // Dark mass
        ctx.beginPath();
        ctx.arc(cx, cy, darkR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.35 * entrance);
        ctx.fill();

        // Gravity rings
        for (let i = 0; i < GRAVITY_RING_COUNT; i++) {
          const rr = darkR + (fieldR - darkR) * ((i + 1) / GRAVITY_RING_COUNT);
          ctx.beginPath();
          ctx.arc(cx, cy, rr, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.atmosphere.max * 0.2 * (1 - i / GRAVITY_RING_COUNT) * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }

        // Curved trajectory
        ctx.beginPath();
        ctx.arc(cx, cy, darkR * 2, -Math.PI * 0.7, Math.PI * 0.1);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();

        // Probe at exit
        const exitX = w * 0.85;
        const exitY = cy - darkR * 0.5;
        ctx.beginPath();
        ctx.arc(exitX, exitY, px(PROBE_R_FRAC, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
        ctx.fill();

        const eg = ctx.createRadialGradient(exitX, exitY, 0, exitX, exitY, px(0.05, minDim));
        eg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
        eg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = eg;
        ctx.fillRect(exitX - px(0.05, minDim), exitY - px(0.05, minDim), px(0.1, minDim), px(0.1, minDim));

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      // ── Gravity field rings ─────────────────────────
      const breathMod = 1 + breath * BREATH_FIELD_FACTOR;
      for (let i = 0; i < GRAVITY_RING_COUNT; i++) {
        const t = (i + 1) / GRAVITY_RING_COUNT;
        const rr = darkR + (fieldR * breathMod - darkR) * t;
        const ringAlpha = ALPHA.atmosphere.max * 0.25 * (1 - t) * entrance;
        const pulse = 1 + Math.sin(s.frameCount * 0.015 + i * 0.5) * 0.03;

        ctx.beginPath();
        ctx.arc(cx, cy, rr * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.accentRgb, ringAlpha);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ── Dark mass body ──────────────────────────────
      // Dark glow
      const darkGlowR = darkR * 4;
      const dg = ctx.createRadialGradient(cx, cy, darkR * 0.3, cx, cy, darkGlowR);
      dg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.15 * entrance));
      dg.addColorStop(0.3, rgba(s.accentRgb, ALPHA.glow.min * entrance));
      dg.addColorStop(1, rgba(s.accentRgb, 0));
      ctx.fillStyle = dg;
      ctx.fillRect(cx - darkGlowR, cy - darkGlowR, darkGlowR * 2, darkGlowR * 2);

      // Dark mass
      ctx.beginPath();
      ctx.arc(cx, cy, darkR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.4 * entrance);
      ctx.fill();

      // Inner void
      ctx.beginPath();
      ctx.arc(cx, cy, darkR * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = rgba([0, 0, 0] as RGB, ALPHA.content.max * 0.3 * entrance);
      ctx.fill();

      // ── Capture radius indicator ────────────────────
      ctx.beginPath();
      ctx.arc(cx, cy, px(CAPTURE_R_FRAC, minDim), 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.atmosphere.max * 0.15 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim);
      ctx.setLineDash([px(0.003, minDim), px(0.006, minDim)]);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── Trail ───────────────────────────────────────
      for (let i = 1; i < s.trail.length; i++) {
        const t = i / s.trail.length;
        const tp = s.trail[i];
        const prev = s.trail[i - 1];
        const speedColor = lerpColor(s.accentRgb, s.primaryRgb, Math.min(1, tp.speed * 80));
        const trailAlpha = ALPHA.content.max * 0.2 * t * entrance;

        ctx.beginPath();
        ctx.moveTo(prev.x * w, prev.y * h);
        ctx.lineTo(tp.x * w, tp.y * h);
        ctx.strokeStyle = rgba(speedColor, trailAlpha);
        ctx.lineWidth = px(STROKE.thin, minDim) * (0.5 + t * 0.5);
        ctx.stroke();
      }

      // ── Drag vector preview ─────────────────────────
      if (s.dragging && !s.launched) {
        const startX = PROBE_START_X * w;
        const startY = PROBE_START_Y * h;

        // Direction line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(s.dragEndX, s.dragEndY);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();

        // Arrow head
        const angle = Math.atan2(s.dragEndY - startY, s.dragEndX - startX);
        const arrowLen = px(0.012, minDim);
        ctx.beginPath();
        ctx.moveTo(s.dragEndX, s.dragEndY);
        ctx.lineTo(
          s.dragEndX - Math.cos(angle - 0.4) * arrowLen,
          s.dragEndY - Math.sin(angle - 0.4) * arrowLen,
        );
        ctx.moveTo(s.dragEndX, s.dragEndY);
        ctx.lineTo(
          s.dragEndX - Math.cos(angle + 0.4) * arrowLen,
          s.dragEndY - Math.sin(angle + 0.4) * arrowLen,
        );
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.25 * entrance);
        ctx.stroke();
      }

      // ── Probe ───────────────────────────────────────
      if (!s.captured && (s.probeX > -0.15 && s.probeX < 1.2 && s.probeY > -0.15 && s.probeY < 1.2)) {
        const ppx = s.probeX * w;
        const ppy = s.probeY * h;
        const probeR = px(PROBE_R_FRAC, minDim);
        const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
        const speedRatio = Math.min(1, speed / 0.012);

        // Speed-dependent glow
        const glowR = probeR * (2 + speedRatio * SPEED_GLOW_MULT);
        const pg = ctx.createRadialGradient(ppx, ppy, 0, ppx, ppy, glowR);
        pg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * (0.2 + speedRatio * 0.3) * entrance));
        pg.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.glow.min * speedRatio * entrance));
        pg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = pg;
        ctx.fillRect(ppx - glowR, ppy - glowR, glowR * 2, glowR * 2);

        // Probe body
        const bodyR = probeR * (1 + speedRatio * 0.2);
        ctx.beginPath();
        ctx.arc(ppx, ppy, bodyR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.55 * entrance);
        ctx.fill();

        // Probe bright core
        ctx.beginPath();
        ctx.arc(ppx, ppy, bodyR * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3),
          ALPHA.content.max * 0.3 * entrance,
        );
        ctx.fill();

        // Velocity vector (while in flight)
        if (s.launched && speed > 0.001) {
          const vScale = minDim * VELOCITY_ARROW_SCALE;
          const normSpeed = speed * 100;
          ctx.beginPath();
          ctx.moveTo(ppx, ppy);
          ctx.lineTo(ppx + (s.vx / speed) * vScale * normSpeed, ppy + (s.vy / speed) * vScale * normSpeed);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.12 * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }
      }

      // ── Captured flash ──────────────────────────────
      if (s.captured) {
        const captureFlash = Math.max(0, 1 - (s.frameCount % 60) / 30);
        if (captureFlash > 0) {
          const cfR = darkR * 2;
          const cf = ctx.createRadialGradient(cx, cy, darkR, cx, cy, cfR);
          cf.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.3 * captureFlash * entrance));
          cf.addColorStop(1, rgba(s.accentRgb, 0));
          ctx.fillStyle = cf;
          ctx.fillRect(cx - cfR, cy - cfR, cfR * 2, cfR * 2);
        }
      }

      // ── Escape celebration glow ─────────────────────
      if (s.escaped) {
        const eGlowR = px(GLOW.lg, minDim) * easeOutCubic(s.escapeAnim);
        const eg = ctx.createRadialGradient(w * 0.85, cy, 0, w * 0.85, cy, eGlowR);
        eg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * s.escapeAnim * entrance));
        eg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = eg;
        ctx.fillRect(w * 0.85 - eGlowR, cy - eGlowR, eGlowR * 2, eGlowR * 2);
      }

      // ── Launch hint (pre-launch) ────────────────────
      if (!s.launched && !s.dragging) {
        const hintR = px(PROBE_R_FRAC, minDim) * (1.5 + Math.sin(s.frameCount * 0.05) * 0.2);
        ctx.beginPath();
        ctx.arc(PROBE_START_X * w, PROBE_START_Y * h, hintR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.4 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.launched || s.captured) return;

      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      // Check if near probe
      if (Math.sqrt((mx - PROBE_START_X) ** 2 + (my - PROBE_START_Y) ** 2) < 0.1) {
        s.dragging = true;
        s.dragStartX = e.clientX - rect.left;
        s.dragStartY = e.clientY - rect.top;
        s.dragEndX = s.dragStartX;
        s.dragEndY = s.dragStartY;
        canvas.setPointerCapture(e.pointerId);
      }
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      s.dragEndX = e.clientX - rect.left;
      s.dragEndY = e.clientY - rect.top;
    };

    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.dragging) {
        const dx = s.dragEndX - s.dragStartX;
        const dy = s.dragEndY - s.dragStartY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 15) {
          // Launch!
          s.launched = true;
          s.vx = dx * LAUNCH_SPEED_MULT;
          s.vy = dy * LAUNCH_SPEED_MULT;
          callbacksRef.current.onHaptic('drag_snap');
        }
        s.dragging = false;
        canvas.releasePointerCapture(e.pointerId);
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
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
          cursor: 'crosshair',
        }}
      />
    </div>
  );
}
