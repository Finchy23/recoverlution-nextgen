/**
 * ATOM 261: THE DESTINATION OVERRIDE ENGINE
 * ============================================
 * Series 27 — Cosmic Play · Position 1
 *
 * If music's purpose was the end, conductors would play the final
 * chord first. The progress bar bends into a circle — there is no end.
 *
 * PHYSICS:
 *   - Horizontal progress bar with a travelling dot of light
 *   - Drag right → bar smoothly morphs from line into a circle
 *   - Morph is parametric: each point on line maps to arc on circle
 *   - Tick marks along bar become radial segments on circle
 *   - Trail of light follows the dot (20+ afterimages)
 *   - At full circle: dot orbits endlessly — the journey IS the destination
 *   - Glow intensifies as bend progresses, bloom at completion
 *   - Breath modulates dot orbit speed when circularized
 *
 * INTERACTION:
 *   Drag right → bend bar into circle (drag_snap, step_advance, completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static circle with dot and glow
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Bar total width (line state) */
const BAR_W = 0.55;
/** Circle radius (circular state) */
const CIRCLE_R = SIZE.md * 0.55;
/** Travelling dot radius */
const DOT_R = 0.01;
/** Dot orbit speed (radians per frame) */
const DOT_SPEED = 0.015;
/** Light trail length */
const TRAIL_LEN = 25;
/** Tick mark count */
const TICK_COUNT = 12;
/** Tick mark length */
const TICK_LEN = 0.015;
/** Glow bloom layers */
const GLOW_LAYERS = 5;
/** Drag sensitivity */
const DRAG_SENSITIVITY = 0.004;
/** Completion threshold for bend */
const COMPLETE_THRESHOLD = 0.92;
/** Breath orbit speed modulation */
const BREATH_ORBIT = 0.2;

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function DestinationOverrideAtom({
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
    bend: 0,              // 0 = line, 1 = circle
    dotAngle: 0,          // travelling dot position
    trail: [] as Array<{ x: number; y: number }>,
    dragging: false,
    lastX: 0,
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

    /** Map a parameter t (0-1) to a point on the morphing bar/circle */
    const getPoint = (t: number, bend: number, cx: number, cy: number, minDim: number): { x: number; y: number } => {
      // Line: horizontal, centered
      const lineX = cx + (t - 0.5) * px(BAR_W, minDim);
      const lineY = cy;

      // Circle: parametric angle
      const angle = t * Math.PI * 2 - Math.PI / 2;
      const circR = px(CIRCLE_R, minDim);
      const circleX = cx + Math.cos(angle) * circR;
      const circleY = cy + Math.sin(angle) * circR;

      // Interpolate
      return {
        x: lineX + (circleX - lineX) * bend,
        y: lineY + (circleY - lineY) * bend,
      };
    };

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
        s.bend = 1;
        s.completed = true;
      }

      // ── Reduced motion ──────────────────────────────────
      if (p.reducedMotion) {
        const circR = px(CIRCLE_R, minDim);
        for (let gi = GLOW_LAYERS - 1; gi >= 0; gi--) {
          const gR = circR * (1.3 + gi * 0.4);
          const gA = ALPHA.glow.max * 0.12 * entrance / (gi + 1);
          const gg = ctx.createRadialGradient(cx, cy, circR * 0.5, cx, cy, gR);
          gg.addColorStop(0, rgba(s.primaryRgb, gA));
          gg.addColorStop(0.4, rgba(s.primaryRgb, gA * 0.3));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }
        ctx.beginPath();
        ctx.arc(cx, cy, circR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
        // Dot
        const dotX = cx + Math.cos(-Math.PI / 2) * circR;
        const dotY = cy + Math.sin(-Math.PI / 2) * circR;
        ctx.beginPath();
        ctx.arc(dotX, dotY, px(DOT_R, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
        ctx.fill();
        cb.onStateChange?.(1);
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ════════════════════════════════════════════════════
      // DOT TRAVEL + TRAIL
      // ════════════════════════════════════════════════════
      const orbitSpeed = DOT_SPEED * (1 + breath * BREATH_ORBIT);
      s.dotAngle = (s.dotAngle + orbitSpeed * ms) % 1;

      const dotPos = getPoint(s.dotAngle, s.bend, cx, cy, minDim);
      s.trail.push({ x: dotPos.x, y: dotPos.y });
      if (s.trail.length > TRAIL_LEN) s.trail.shift();

      // ── Completion tracking ─────────────────────────────
      if (s.bend >= 0.5 && !s.stepNotified) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }
      if (s.bend >= COMPLETE_THRESHOLD && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      if (s.completed) {
        s.completionGlow = Math.min(1, s.completionGlow + 0.005 * ms);
      }
      cb.onStateChange?.(s.completed ? 0.5 + s.completionGlow * 0.5 : s.bend * 0.5);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Background glow
      // ════════════════════════════════════════════════════
      if (s.bend > 0.3) {
        const glowIntensity = (s.bend - 0.3) / 0.7;
        for (let gi = GLOW_LAYERS - 1; gi >= 0; gi--) {
          const gR = px(CIRCLE_R * (1 + gi * 0.3), minDim) * (0.5 + glowIntensity * 0.5);
          const gA = ALPHA.glow.max * 0.04 * glowIntensity * entrance / (gi + 1);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(s.primaryRgb, gA));
          gg.addColorStop(0.4, rgba(s.primaryRgb, gA * 0.3));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Morphing bar/circle path
      // ════════════════════════════════════════════════════
      const segments = 60;
      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const pt = getPoint(t, s.bend, cx, cy, minDim);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * (0.08 + s.bend * 0.08) * entrance);
      ctx.lineWidth = px(STROKE.light, minDim);
      ctx.stroke();

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Tick marks
      // ════════════════════════════════════════════════════
      for (let i = 0; i < TICK_COUNT; i++) {
        const t = i / TICK_COUNT;
        const pt = getPoint(t, s.bend, cx, cy, minDim);

        // Tick direction: perpendicular to path
        const ptBefore = getPoint(Math.max(0, t - 0.01), s.bend, cx, cy, minDim);
        const ptAfter = getPoint(Math.min(1, t + 0.01), s.bend, cx, cy, minDim);
        const dx = ptAfter.x - ptBefore.x;
        const dy = ptAfter.y - ptBefore.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const tickL = px(TICK_LEN, minDim);

        ctx.beginPath();
        ctx.moveTo(pt.x - nx * tickL * 0.5, pt.y - ny * tickL * 0.5);
        ctx.lineTo(pt.x + nx * tickL * 0.5, pt.y + ny * tickL * 0.5);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Light trail
      // ════════════════════════════════════════════════════
      for (let i = 0; i < s.trail.length; i++) {
        const tp = s.trail[i];
        const t = i / s.trail.length;
        const tR = px(0.003 * t, minDim);

        if (tR > 0.2) {
          // Trail glow
          const tgR = tR * 2.5;
          const tg = ctx.createRadialGradient(tp.x, tp.y, 0, tp.x, tp.y, tgR);
          tg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.06 * t * entrance));
          tg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = tg;
          ctx.fillRect(tp.x - tgR, tp.y - tgR, tgR * 2, tgR * 2);

          ctx.beginPath();
          ctx.arc(tp.x, tp.y, tR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * t * entrance);
          ctx.fill();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Travelling dot
      // ════════════════════════════════════════════════════
      const dR = px(DOT_R, minDim);

      // Dot glow
      const dgR = dR * 4;
      const dg = ctx.createRadialGradient(dotPos.x, dotPos.y, 0, dotPos.x, dotPos.y, dgR);
      dg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.15 * entrance));
      dg.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.glow.max * 0.05 * entrance));
      dg.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = dg;
      ctx.fillRect(dotPos.x - dgR, dotPos.y - dgR, dgR * 2, dgR * 2);

      // Dot body
      const dotGrad = ctx.createRadialGradient(
        dotPos.x - dR * 0.2, dotPos.y - dR * 0.2, dR * 0.1,
        dotPos.x, dotPos.y, dR,
      );
      dotGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.4), ALPHA.content.max * 0.5 * entrance));
      dotGrad.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance));
      dotGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.1 * entrance));
      ctx.beginPath();
      ctx.arc(dotPos.x, dotPos.y, dR, 0, Math.PI * 2);
      ctx.fillStyle = dotGrad;
      ctx.fill();

      // Specular
      ctx.beginPath();
      ctx.ellipse(dotPos.x - dR * 0.2, dotPos.y - dR * 0.25, dR * 0.3, dR * 0.18, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.25 * entrance);
      ctx.fill();

      // ── Progress ring ──────────────────────────────────
      if (!s.completed && s.bend > 0.02) {
        const progR = px(SIZE.xs, minDim);
        ctx.beginPath();
        ctx.arc(cx, cy - px(CIRCLE_R + 0.06, minDim), progR, -Math.PI / 2, -Math.PI / 2 + s.bend * Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Drag right to bend ──────────────────────────────
    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      stateRef.current.lastX = e.clientX;
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('drag_snap');
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const dx = e.clientX - s.lastX;
      s.bend = Math.max(0, Math.min(1, s.bend + dx * DRAG_SENSITIVITY));
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
