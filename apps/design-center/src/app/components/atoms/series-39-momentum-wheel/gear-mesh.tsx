/**
 * ATOM 383: THE GEAR MESH ENGINE
 * ================================
 * Series 39 — Momentum Wheel · Position 3
 *
 * Cure forcing new habits into misaligned routines. Align the
 * gear teeth and the entire machine turns with silent ease.
 *
 * PHYSICS:
 *   - Two massive gears side by side, teeth out of phase
 *   - When misaligned: grinding sparks, visual vibration, red accent
 *   - User vertically drags the right gear to align tooth phase
 *   - Alignment snaps into sweet spot — grinding vanishes
 *   - Perfectly meshed: both gears turn smoothly, green glow
 *   - Breath modulates the rotation speed of the aligned state
 *
 * INTERACTION:
 *   Drag (vertical on right gear) → adjusts tooth phase alignment
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static aligned gears with smooth glow
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Gear radius (each gear) */
const GEAR_R_FRAC = 0.22;
/** Number of teeth per gear */
const TOOTH_COUNT = 16;
/** Tooth height (fraction of gear radius) */
const TOOTH_HEIGHT = 0.12;
/** Tooth width (fraction of circumference per tooth) */
const TOOTH_WIDTH_FRAC = 0.4;
/** Gap between gear centers (fraction of minDim) */
const GEAR_GAP = 0.01;
/** Alignment threshold (fraction of tooth pitch) */
const ALIGN_THRESHOLD = 0.08;
/** Misalignment shake amplitude */
const SHAKE_AMP = 0.003;
/** Rotation speed when aligned (rad/frame) */
const ALIGNED_SPEED = 0.015;
/** Grinding spark rate (per frame when misaligned) */
const SPARK_RATE = 0.15;
/** Max sparks alive */
const MAX_SPARKS = 30;
/** Drag sensitivity (phase offset per pixel) */
const DRAG_SENSITIVITY = 0.008;
/** Breath speed modulation in aligned state */
const BREATH_SPEED_FACTOR = 0.2;
/** Completion hold frames (must stay aligned) */
const ALIGN_FRAMES_TARGET = 90;

// =====================================================================
// STATE TYPES
// =====================================================================

interface GrindSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function GearMeshAtom({
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
    leftAngle: 0,
    rightPhaseOffset: 0.3,   // user-adjustable phase offset (0 = aligned)
    aligned: false,
    alignFrames: 0,
    completed: false,
    completionAnim: 0,
    sparks: [] as GrindSpark[],
    dragging: false,
    dragStartY: 0,
    dragStartOffset: 0,
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

    /** Draw a gear at position */
    function drawGear(
      ctx: CanvasRenderingContext2D,
      cx: number, cy: number,
      radius: number, angle: number,
      teeth: number, minDim: number,
      rgb: RGB, alpha: number,
      clockwise: boolean,
    ) {
      const toothH = radius * TOOTH_HEIGHT;
      const innerR = radius - toothH;
      const toothAngle = (Math.PI * 2) / teeth;
      const toothW = toothAngle * TOOTH_WIDTH_FRAC;

      ctx.beginPath();
      for (let i = 0; i < teeth; i++) {
        const baseAngle = angle + i * toothAngle;

        // Inner arc (between teeth)
        ctx.arc(cx, cy, innerR, baseAngle + toothW, baseAngle + toothAngle, false);

        // Tooth (outer arc)
        ctx.arc(cx, cy, radius, baseAngle + toothAngle, baseAngle + toothAngle + toothW, false);
      }
      ctx.closePath();
      ctx.strokeStyle = rgba(rgb, alpha);
      ctx.lineWidth = px(STROKE.light, minDim);
      ctx.stroke();

      // Hub circle
      const hubR = radius * 0.15;
      ctx.beginPath();
      ctx.arc(cx, cy, hubR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(rgb, alpha * 0.8);
      ctx.fill();

      // Hub center dot
      ctx.beginPath();
      ctx.arc(cx, cy, hubR * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = rgba(lerpColor(rgb, [255, 255, 255] as RGB, 0.3), alpha * 0.5);
      ctx.fill();
    }

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

      // ── Atmosphere ──────────────────────────────────
      if (!p.composed) {
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      }

      // ── Resolve phase ───────────────────────────────
      if (p.phase === 'resolve') {
        s.rightPhaseOffset *= 0.95;
      }

      // ── Gear geometry ───────────────────────────────
      const gearR = px(GEAR_R_FRAC, minDim);
      const gapPx = px(GEAR_GAP, minDim);
      const leftCx = cx - gearR - gapPx;
      const rightCx = cx + gearR + gapPx;

      // ── Alignment check ─────────────────────────────
      const toothPitch = (Math.PI * 2) / TOOTH_COUNT;
      const normalizedOffset = ((s.rightPhaseOffset % toothPitch) + toothPitch) % toothPitch;
      const halfPitch = toothPitch / 2;
      const alignError = Math.min(normalizedOffset, toothPitch - normalizedOffset);
      s.aligned = alignError < toothPitch * ALIGN_THRESHOLD;

      // ── Rotation ────────────────────────────────────
      const speed = s.aligned
        ? ALIGNED_SPEED * (1 + breath * BREATH_SPEED_FACTOR)
        : ALIGNED_SPEED * 0.3;
      s.leftAngle += speed * ms;

      // ── Alignment tracking ──────────────────────────
      if (s.aligned) {
        s.alignFrames++;
        if (s.alignFrames >= ALIGN_FRAMES_TARGET && !s.completed) {
          s.completed = true;
          cb.onHaptic('completion');
        }
      } else {
        s.alignFrames = Math.max(0, s.alignFrames - 2);
      }
      if (s.completed) {
        s.completionAnim = Math.min(1, s.completionAnim + 0.008 * ms);
      }

      cb.onStateChange?.(s.completed
        ? 0.5 + s.completionAnim * 0.5
        : s.aligned ? Math.min(0.5, s.alignFrames / ALIGN_FRAMES_TARGET * 0.5) : 0);

      // ── Spark physics ───────────────────────────────
      if (!s.aligned && !p.reducedMotion && Math.random() < SPARK_RATE && s.sparks.length < MAX_SPARKS) {
        const contactX = cx;
        const contactY = cy + (Math.random() - 0.5) * gearR * 0.5;
        s.sparks.push({
          x: contactX,
          y: contactY,
          vx: (Math.random() - 0.5) * 4,
          vy: -1 - Math.random() * 3,
          life: 1,
        });
      }
      for (let i = s.sparks.length - 1; i >= 0; i--) {
        const sp = s.sparks[i];
        sp.x += sp.vx * ms;
        sp.y += sp.vy * ms;
        sp.vy += 0.08 * ms;
        sp.life -= 0.025;
        if (sp.life <= 0) s.sparks.splice(i, 1);
      }

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        drawGear(ctx, leftCx, cy, gearR, 0, TOOTH_COUNT, minDim,
          s.primaryRgb, ALPHA.content.max * 0.3 * entrance, true);
        drawGear(ctx, rightCx, cy, gearR, halfPitch, TOOTH_COUNT, minDim,
          s.primaryRgb, ALPHA.content.max * 0.3 * entrance, false);

        // Aligned glow
        const aGlowR = gearR * 1.5;
        const ag = ctx.createRadialGradient(cx, cy, 0, cx, cy, aGlowR);
        ag.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * entrance));
        ag.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = ag;
        ctx.fillRect(cx - aGlowR, cy - aGlowR, aGlowR * 2, aGlowR * 2);

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      // ── Misalignment shake ──────────────────────────
      let shakeX = 0, shakeY = 0;
      if (!s.aligned) {
        shakeX = Math.sin(s.frameCount * 0.8) * px(SHAKE_AMP, minDim);
        shakeY = Math.cos(s.frameCount * 1.1) * px(SHAKE_AMP, minDim);
      }

      // ── Alignment glow (behind gears) ───────────────
      if (s.aligned) {
        const meshGlowR = gearR * (1.2 + s.completionAnim * 0.5);
        const mg = ctx.createRadialGradient(cx, cy, 0, cx, cy, meshGlowR);
        mg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * entrance));
        mg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * entrance));
        mg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = mg;
        ctx.fillRect(cx - meshGlowR, cy - meshGlowR, meshGlowR * 2, meshGlowR * 2);
      }

      // ── Draw left gear ──────────────────────────────
      const leftColor = s.aligned ? s.primaryRgb : s.accentRgb;
      const leftAlpha = ALPHA.content.max * (s.aligned ? 0.3 : 0.2) * entrance;
      drawGear(ctx, leftCx + shakeX, cy + shakeY, gearR,
        s.leftAngle, TOOTH_COUNT, minDim, leftColor, leftAlpha, true);

      // ── Draw right gear (counter-rotating) ──────────
      const rightAngle = -s.leftAngle + s.rightPhaseOffset;
      const rightColor = s.aligned ? s.primaryRgb : s.accentRgb;
      drawGear(ctx, rightCx - shakeX, cy - shakeY, gearR,
        rightAngle, TOOTH_COUNT, minDim, rightColor, leftAlpha, false);

      // ── Grinding zone indicator ─────────────────────
      if (!s.aligned) {
        // Vibration lines at contact point
        for (let i = 0; i < 3; i++) {
          const vy = cy + (i - 1) * px(0.012, minDim);
          const vLen = px(0.02, minDim);
          const vOff = Math.sin(s.frameCount * 0.5 + i) * px(0.004, minDim);
          ctx.beginPath();
          ctx.moveTo(cx - vLen + vOff, vy);
          ctx.lineTo(cx + vLen + vOff, vy);
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.15 * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }
      }

      // ── Draw sparks ─────────────────────────────────
      for (const sp of s.sparks) {
        const spR = px(0.003 * sp.life, minDim);
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, spR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          lerpColor(s.accentRgb, [255, 255, 255] as RGB, 0.5),
          ALPHA.content.max * sp.life * 0.5 * entrance,
        );
        ctx.fill();
      }

      // ── Alignment progress arc ──────────────────────
      if (s.aligned && !s.completed) {
        const progAngle = (s.alignFrames / ALIGN_FRAMES_TARGET) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, gearR * 0.15, -Math.PI / 2, -Math.PI / 2 + progAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.25 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;

      // Only drag the right gear
      if (mx > 0.4) {
        s.dragging = true;
        s.dragStartY = e.clientY;
        s.dragStartOffset = s.rightPhaseOffset;
        canvas.setPointerCapture(e.pointerId);
        callbacksRef.current.onHaptic('drag_snap');
      }
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;

      const dy = e.clientY - s.dragStartY;
      s.rightPhaseOffset = s.dragStartOffset + dy * DRAG_SENSITIVITY;
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
          cursor: 'ns-resize',
        }}
      />
    </div>
  );
}
