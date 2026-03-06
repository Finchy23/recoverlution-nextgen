/**
 * ATOM 388: THE ESCAPEMENT TICK ENGINE
 * ======================================
 * Series 39 — Momentum Wheel · Position 8
 *
 * Cure the manic Day 1 burnout. Slide the escapement into place
 * to regulate explosive energy into steady rhythmic ticks.
 *
 * PHYSICS:
 *   - Massive fully wound spiral spring coiled at center
 *   - Before regulation: spring vibrates wildly, energy radiates chaotically
 *   - User drags the escapement gear from left edge toward center
 *   - Once engaged: spring unwinds in measured, rhythmic ticks
 *   - Each tick advances the output wheel by one precise notch
 *   - Energy output becomes perfectly metered and sustainable
 *   - Breath modulates the tick rhythm slightly (wider = calmer ticks)
 *
 * INTERACTION:
 *   Drag (horizontal) → slides escapement gear into engagement position
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static engaged escapement with metered output visible
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

/** Spring center position */
const SPRING_CX_FRAC = 0.38;
/** Spring radius (hero element) */
const SPRING_R_FRAC = SIZE.md;
/** Spring coil count */
const SPRING_COILS = 6;
/** Spring coil resolution */
const COIL_SEGMENTS = 60;
/** Escapement gear radius */
const GEAR_R_FRAC = 0.035;
/** Gear teeth count */
const GEAR_TEETH = 8;
/** Engagement X position (fraction of w) */
const ENGAGE_X_FRAC = 0.42;
/** Starting X for escapement */
const START_X_FRAC = 0.12;
/** Engagement snap threshold */
const ENGAGE_THRESHOLD = 0.04;
/** Wild vibration amplitude (pre-engagement) */
const WILD_AMP = 0.015;
/** Wild vibration frequency */
const WILD_FREQ = 0.35;
/** Tick rate (radians per tick) */
const TICK_ADVANCE = Math.PI / 4;
/** Tick interval (frames between ticks) */
const TICK_INTERVAL_BASE = 45;
/** Breath tick modulation */
const BREATH_TICK_FACTOR = 0.15;
/** Output tick marks area */
const OUTPUT_X_FRAC = 0.65;
/** Max output ticks displayed */
const MAX_TICKS = 16;
/** Output tick spacing */
const TICK_SPACING_FRAC = 0.022;
/** Spring wind level (unwinds as ticks happen) */
const WIND_PER_TICK = 0.04;
/** Completion tick count */
const COMPLETION_TICKS = 16;
/** Energy ray count (wild state) */
const WILD_RAY_COUNT = 12;

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function EscapementTickAtom({
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
    gearX: START_X_FRAC,
    dragging: false,
    engaged: false,
    engageAnim: 0,
    windLevel: 1.0,        // 1 = fully wound, 0 = unwound
    tickCount: 0,
    tickTimer: 0,
    tickFlash: 0,          // visual flash on tick
    escapementAngle: 0,
    completed: false,
    completionAnim: 0,
    // Output positions for tick marks
    outputTicks: [] as number[],
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
      if (p.phase === 'resolve' && !s.engaged) {
        s.gearX = ENGAGE_X_FRAC;
        s.engaged = true;
      }

      // ── Engagement detection ────────────────────────
      if (!s.engaged && Math.abs(s.gearX - ENGAGE_X_FRAC) < ENGAGE_THRESHOLD) {
        s.engaged = true;
        s.gearX = ENGAGE_X_FRAC;
        cb.onHaptic('drag_snap');
      }
      if (s.engaged) {
        s.engageAnim = Math.min(1, s.engageAnim + 0.012 * ms);
      }

      // ── Tick physics (when engaged) ─────────────────
      if (s.engaged && s.windLevel > 0 && !s.completed) {
        const tickInterval = TICK_INTERVAL_BASE * (1 + breath * BREATH_TICK_FACTOR);
        s.tickTimer += ms;

        if (s.tickTimer >= tickInterval) {
          s.tickTimer = 0;
          s.tickCount++;
          s.tickFlash = 1;
          s.windLevel = Math.max(0, s.windLevel - WIND_PER_TICK);
          s.escapementAngle += TICK_ADVANCE;
          s.outputTicks.push(s.frameCount);
          if (s.outputTicks.length > MAX_TICKS) s.outputTicks.shift();
          cb.onHaptic('step_advance');
        }
      }

      // ── Tick flash decay ────────────────────────────
      if (s.tickFlash > 0) s.tickFlash = Math.max(0, s.tickFlash - 0.06);

      // ── Completion ──────────────────────────────────
      if (s.tickCount >= COMPLETION_TICKS && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      if (s.completed) {
        s.completionAnim = Math.min(1, s.completionAnim + 0.008 * ms);
      }

      cb.onStateChange?.(s.completed
        ? 0.5 + s.completionAnim * 0.5
        : s.engaged ? (s.tickCount / COMPLETION_TICKS) * 0.5 : 0);

      const springCx = SPRING_CX_FRAC * w;
      const springR = px(SPRING_R_FRAC, minDim);

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        // Static spring
        ctx.beginPath();
        for (let i = 0; i <= COIL_SEGMENTS; i++) {
          const t = i / COIL_SEGMENTS;
          const a = t * Math.PI * 2 * SPRING_COILS;
          const r = springR * (0.3 + t * 0.5);
          const sx = springCx + Math.cos(a) * r;
          const sy = cy + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();

        // Engaged gear
        const gearPx = ENGAGE_X_FRAC * w;
        ctx.beginPath();
        ctx.arc(gearPx, cy, px(GEAR_R_FRAC, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.35 * entrance);
        ctx.fill();

        // Output ticks
        for (let i = 0; i < 8; i++) {
          const tx = OUTPUT_X_FRAC * w + i * px(TICK_SPACING_FRAC, minDim);
          ctx.beginPath();
          ctx.moveTo(tx, cy - px(0.02, minDim));
          ctx.lineTo(tx, cy + px(0.02, minDim));
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.25 * entrance);
          ctx.lineWidth = px(STROKE.medium, minDim);
          ctx.stroke();
        }

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      const wildActive = !s.engaged;
      const wildOff = wildActive
        ? Math.sin(s.frameCount * WILD_FREQ) * px(WILD_AMP, minDim)
        : 0;
      const wildOffY = wildActive
        ? Math.cos(s.frameCount * WILD_FREQ * 1.3) * px(WILD_AMP * 0.7, minDim)
        : 0;

      // ── Wild energy rays (pre-engagement) ───────────
      if (wildActive) {
        for (let i = 0; i < WILD_RAY_COUNT; i++) {
          const a = (i / WILD_RAY_COUNT) * Math.PI * 2 + s.frameCount * 0.08;
          const innerR = springR * 0.6;
          const outerR = springR * (1.1 + Math.sin(s.frameCount * 0.15 + i) * 0.3);
          const rayAlpha = ALPHA.content.max * 0.08 * entrance;

          ctx.beginPath();
          ctx.moveTo(
            springCx + wildOff + Math.cos(a) * innerR,
            cy + wildOffY + Math.sin(a) * innerR,
          );
          ctx.lineTo(
            springCx + wildOff + Math.cos(a) * outerR,
            cy + wildOffY + Math.sin(a) * outerR,
          );
          ctx.strokeStyle = rgba(s.accentRgb, rayAlpha);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }
      }

      // ── Spring coil ─────────────────────────────────
      const springColor = s.engaged ? s.primaryRgb : s.accentRgb;
      const coilAlpha = ALPHA.content.max * (0.15 + (s.engaged ? 0.1 : 0)) * entrance;

      ctx.beginPath();
      for (let i = 0; i <= COIL_SEGMENTS; i++) {
        const t = i / COIL_SEGMENTS;
        const a = t * Math.PI * 2 * SPRING_COILS * s.windLevel;
        const r = springR * (0.15 + t * 0.65) * (0.5 + s.windLevel * 0.5);
        const sx = springCx + wildOff + Math.cos(a) * r;
        const sy = cy + wildOffY + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = rgba(springColor, coilAlpha);
      ctx.lineWidth = px(STROKE.light, minDim);
      ctx.stroke();

      // ── Spring center hub ───────────────────────────
      const hubR = px(0.015, minDim);
      const hubGlow = ctx.createRadialGradient(
        springCx + wildOff, cy + wildOffY, 0,
        springCx + wildOff, cy + wildOffY, hubR * 4,
      );
      hubGlow.addColorStop(0, rgba(springColor, ALPHA.glow.max * 0.2 * entrance));
      hubGlow.addColorStop(1, rgba(springColor, 0));
      ctx.fillStyle = hubGlow;
      ctx.fillRect(springCx + wildOff - hubR * 4, cy + wildOffY - hubR * 4, hubR * 8, hubR * 8);

      ctx.beginPath();
      ctx.arc(springCx + wildOff, cy + wildOffY, hubR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(springColor, ALPHA.content.max * 0.4 * entrance);
      ctx.fill();

      // ── Escapement gear ─────────────────────────────
      const gearPxX = s.gearX * w;
      const gearR = px(GEAR_R_FRAC, minDim);
      const gearColor = s.engaged ? s.primaryRgb : s.accentRgb;

      // Gear teeth
      for (let i = 0; i < GEAR_TEETH; i++) {
        const a = s.escapementAngle + (i / GEAR_TEETH) * Math.PI * 2;
        const toothInner = gearR * 0.7;
        const toothOuter = gearR * 1.3;
        ctx.beginPath();
        ctx.moveTo(
          gearPxX + Math.cos(a - 0.15) * toothInner,
          cy + Math.sin(a - 0.15) * toothInner,
        );
        ctx.lineTo(
          gearPxX + Math.cos(a) * toothOuter,
          cy + Math.sin(a) * toothOuter,
        );
        ctx.lineTo(
          gearPxX + Math.cos(a + 0.15) * toothInner,
          cy + Math.sin(a + 0.15) * toothInner,
        );
        ctx.strokeStyle = rgba(gearColor, ALPHA.content.max * 0.25 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
      }

      // Gear body
      ctx.beginPath();
      ctx.arc(gearPxX, cy, gearR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(gearColor, ALPHA.content.max * 0.35 * entrance);
      ctx.fill();

      // Gear center
      ctx.beginPath();
      ctx.arc(gearPxX, cy, gearR * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = rgba(
        lerpColor(gearColor, [255, 255, 255] as RGB, 0.3),
        ALPHA.content.max * 0.2 * entrance,
      );
      ctx.fill();

      // ── Connection line (spring to gear) ────────────
      if (s.engaged) {
        ctx.beginPath();
        ctx.moveTo(springCx + springR * 0.6, cy);
        ctx.lineTo(gearPxX - gearR * 1.3, cy);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.12 * s.engageAnim * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
      }

      // ── Output tick marks ───────────────────────────
      const outputX = OUTPUT_X_FRAC * w;
      for (let i = 0; i < s.outputTicks.length; i++) {
        const tx = outputX + i * px(TICK_SPACING_FRAC, minDim);
        const age = (s.frameCount - s.outputTicks[i]) / 30;
        const tickAlpha = Math.min(1, age) * ALPHA.content.max * 0.25 * entrance;
        const tickH = px(0.025, minDim);

        ctx.beginPath();
        ctx.moveTo(tx, cy - tickH);
        ctx.lineTo(tx, cy + tickH);
        ctx.strokeStyle = rgba(s.primaryRgb, tickAlpha);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      // ── Tick flash ──────────────────────────────────
      if (s.tickFlash > 0.01) {
        const flashR = px(0.08, minDim);
        const fg = ctx.createRadialGradient(gearPxX, cy, 0, gearPxX, cy, flashR);
        fg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * s.tickFlash * entrance));
        fg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = fg;
        ctx.fillRect(gearPxX - flashR, cy - flashR, flashR * 2, flashR * 2);
      }

      // ── Wind level indicator ────────────────────────
      if (s.engaged) {
        const windBarX = springCx - springR * 0.1;
        const windBarH = springR * 1.4;
        const windBarW = px(0.004, minDim);
        const windBarTop = cy - windBarH / 2;

        // Background
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.background.max * 0.8 * entrance);
        ctx.fillRect(windBarX, windBarTop, windBarW, windBarH);

        // Fill
        const fillH = windBarH * s.windLevel;
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.fillRect(windBarX, windBarTop + windBarH - fillH, windBarW, fillH);
      }

      // ── Completion glow ─────────────────────────────
      if (s.completed) {
        const cR = px(GLOW.md, minDim) * easeOutCubic(s.completionAnim);
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, cR);
        cg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.12 * s.completionAnim * entrance));
        cg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = cg;
        ctx.fillRect(cx - cR, cy - cR, cR * 2, cR * 2);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.engaged) return;

      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;

      // Check if near gear
      if (Math.abs(mx - s.gearX) < 0.08) {
        s.dragging = true;
        canvas.setPointerCapture(e.pointerId);
      }
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || s.engaged) return;

      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      s.gearX = Math.max(START_X_FRAC, Math.min(ENGAGE_X_FRAC + 0.05, mx));
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
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
          cursor: 'ew-resize',
        }}
      />
    </div>
  );
}
