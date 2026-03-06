/**
 * ATOM 376: THE DECANT ENGINE
 * =============================
 * Series 38 — Magnetic Sieve · Position 6
 *
 * Cure the belief that a little ego mixed in ruins everything.
 * Carefully tilt to pour off the toxic layer and save the pure liquid.
 *
 * PHYSICS:
 *   - Digital beaker filled with two separated liquid layers
 *   - Top layer: toxic (accent-colored), lighter density
 *   - Bottom layer: pure (primary-colored), heavier density
 *   - User drags left/right to tilt the beaker
 *   - Toxic liquid spills over the rim first
 *   - Must stop at the exact threshold before pure liquid spills
 *   - Over-tilt causes error — pure liquid lost
 *   - Breath steadies the tilt control sensitivity
 *
 * INTERACTION:
 *   Drag (horizontal) → tilts the beaker left/right
 *   Breath (passive)  → reduces tilt sensitivity (steadier hand)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static beaker with toxic layer partially poured off
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Beaker width as fraction of minDim */
const BEAKER_W_FRAC = 0.30;
/** Beaker height as fraction of minDim */
const BEAKER_H_FRAC = 0.50;
/** Beaker wall thickness */
const WALL_THICK_FRAC = 0.004;
/** Total liquid fill (fraction of beaker height) */
const LIQUID_FILL = 0.80;
/** Toxic layer thickness (fraction of total liquid) */
const TOXIC_RATIO = 0.35;
/** Maximum beaker tilt angle (radians) */
const MAX_TILT = 0.65;
/** Tilt sensitivity (radians per px of drag) */
const TILT_SENSITIVITY = 0.004;
/** Tilt return spring when not dragging */
const TILT_RETURN = 0.03;
/** Tilt velocity damping */
const TILT_DAMPING = 0.88;
/** Angle at which toxic starts spilling */
const SPILL_ANGLE_TOXIC = 0.25;
/** Angle at which pure starts spilling (DANGER) */
const SPILL_ANGLE_PURE = 0.52;
/** Spill rate (fraction of liquid per frame at max tilt) */
const SPILL_RATE = 0.004;
/** Drip particle count per frame during spill */
const DRIP_RATE = 2;
/** Max drip particles */
const MAX_DRIPS = 60;
/** Breath steadying factor */
const BREATH_STEADY_FACTOR = 0.4;
/** Completion threshold (fraction of toxic removed) */
const COMPLETION_TOXIC_REMOVED = 0.90;

// =====================================================================
// STATE TYPES
// =====================================================================

interface Drip {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  toxic: boolean;
  radius: number;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function DecantPourAtom({
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
    tiltAngle: 0,
    tiltVelocity: 0,
    toxicRemaining: 1.0,    // 1 = full, 0 = empty
    pureRemaining: 1.0,
    drips: [] as Drip[],
    dragging: false,
    dragStartX: 0,
    dragBaseAngle: 0,
    completed: false,
    completionAnim: 0,
    spilledPure: false,
    errorFlash: 0,
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

      // ── Atmosphere ──────────────────────────────────
      if (!p.composed) {
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      }

      // ── Resolve phase ───────────────────────────────
      if (p.phase === 'resolve' && s.toxicRemaining > 0.1) {
        s.tiltAngle = 0.35;
      }

      // ── Tilt physics ────────────────────────────────
      if (!s.dragging) {
        // Spring return to center
        s.tiltVelocity += -s.tiltAngle * TILT_RETURN;
        s.tiltVelocity *= TILT_DAMPING;
        s.tiltAngle += s.tiltVelocity * ms;
      }
      s.tiltAngle = Math.max(-MAX_TILT, Math.min(MAX_TILT, s.tiltAngle));

      // ── Spill physics ───────────────────────────────
      const absTilt = Math.abs(s.tiltAngle);
      const spillDir = s.tiltAngle > 0 ? 1 : -1;

      if (absTilt > SPILL_ANGLE_TOXIC && s.toxicRemaining > 0 && !p.reducedMotion) {
        const spillPower = (absTilt - SPILL_ANGLE_TOXIC) / (MAX_TILT - SPILL_ANGLE_TOXIC);
        const amount = SPILL_RATE * spillPower * ms;
        s.toxicRemaining = Math.max(0, s.toxicRemaining - amount);

        // Spawn drip particles
        if (s.frameCount % 2 === 0 && s.drips.length < MAX_DRIPS) {
          for (let i = 0; i < DRIP_RATE; i++) {
            s.drips.push({
              x: cx + spillDir * px(BEAKER_W_FRAC * 0.5, minDim),
              y: cy - px(BEAKER_H_FRAC * 0.15, minDim),
              vx: spillDir * (1 + Math.random() * 2),
              vy: -1 + Math.random() * 0.5,
              life: 1,
              toxic: true,
              radius: 0.003 + Math.random() * 0.005,
            });
          }
        }
      }

      if (absTilt > SPILL_ANGLE_PURE && s.toxicRemaining <= 0.05 && s.pureRemaining > 0 && !p.reducedMotion) {
        const spillPower = (absTilt - SPILL_ANGLE_PURE) / (MAX_TILT - SPILL_ANGLE_PURE);
        const amount = SPILL_RATE * spillPower * 0.5 * ms;
        s.pureRemaining = Math.max(0, s.pureRemaining - amount);

        if (!s.spilledPure) {
          s.spilledPure = true;
          s.errorFlash = 1;
          cb.onHaptic('error_boundary');
        }
      }

      // ── Drip physics ────────────────────────────────
      for (let i = s.drips.length - 1; i >= 0; i--) {
        const d = s.drips[i];
        d.vy += 0.15 * ms;
        d.x += d.vx * ms;
        d.y += d.vy * ms;
        d.life -= 0.015;
        if (d.life <= 0 || d.y > h * 1.1) {
          s.drips.splice(i, 1);
        }
      }

      // ── Error flash decay ───────────────────────────
      if (s.errorFlash > 0) {
        s.errorFlash = Math.max(0, s.errorFlash - 0.03);
      }

      // ── Completion check ────────────────────────────
      const toxicRemoved = 1 - s.toxicRemaining;
      if (toxicRemoved >= COMPLETION_TOXIC_REMOVED && s.pureRemaining > 0.8 && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      if (s.completed) {
        s.completionAnim = Math.min(1, s.completionAnim + 0.008 * ms);
      }

      cb.onStateChange?.(s.completed
        ? 0.5 + s.completionAnim * 0.5
        : Math.min(0.5, toxicRemoved * 0.5));

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        const bW = px(BEAKER_W_FRAC, minDim);
        const bH = px(BEAKER_H_FRAC, minDim);
        const bx = cx - bW / 2;
        const by = cy - bH * 0.3;

        // Beaker outline
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(WALL_THICK_FRAC, minDim);
        ctx.strokeRect(bx, by, bW, bH);

        // Pure liquid (bottom)
        const pureH = bH * LIQUID_FILL * (1 - TOXIC_RATIO);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.fillRect(bx, by + bH - pureH, bW, pureH);

        // Small toxic residue
        const toxH = bH * LIQUID_FILL * TOXIC_RATIO * 0.1;
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.15 * entrance);
        ctx.fillRect(bx, by + bH - pureH - toxH, bW, toxH);

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ── Draw beaker (rotated) ───────────────────────
      const bW = px(BEAKER_W_FRAC, minDim);
      const bH = px(BEAKER_H_FRAC, minDim);

      ctx.save();
      ctx.translate(cx, cy + bH * 0.1);
      ctx.rotate(s.tiltAngle);

      // Beaker body glow
      const beakerGlow = ctx.createRadialGradient(0, 0, bW * 0.3, 0, 0, bH * 0.8);
      beakerGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.08 * entrance));
      beakerGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = beakerGlow;
      ctx.fillRect(-bH, -bH, bH * 2, bH * 2);

      // Beaker walls
      const wallX = -bW / 2;
      const wallY = -bH * 0.4;
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.18 * entrance);
      ctx.lineWidth = px(WALL_THICK_FRAC, minDim);

      // Left wall
      ctx.beginPath();
      ctx.moveTo(wallX, wallY);
      ctx.lineTo(wallX - bW * 0.05, wallY + bH);
      ctx.stroke();

      // Right wall
      ctx.beginPath();
      ctx.moveTo(-wallX, wallY);
      ctx.lineTo(-wallX + bW * 0.05, wallY + bH);
      ctx.stroke();

      // Bottom
      ctx.beginPath();
      ctx.moveTo(wallX - bW * 0.05, wallY + bH);
      ctx.lineTo(-wallX + bW * 0.05, wallY + bH);
      ctx.stroke();

      // ── Draw liquid layers ──────────────────────────
      const totalLiquidH = bH * LIQUID_FILL;
      const pureH = totalLiquidH * (1 - TOXIC_RATIO) * s.pureRemaining;
      const toxicH = totalLiquidH * TOXIC_RATIO * s.toxicRemaining;
      const liquidBottom = wallY + bH;

      // Pure liquid (bottom layer)
      if (pureH > 0.5) {
        const pureTop = liquidBottom - pureH;
        const pureGrad = ctx.createLinearGradient(0, pureTop, 0, liquidBottom);
        pureGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance));
        pureGrad.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.content.max * 0.25 * entrance));
        pureGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.35 * entrance));
        ctx.fillStyle = pureGrad;

        // Trapezoidal shape matching beaker walls
        const topW = bW + (pureTop - wallY) / bH * bW * 0.1;
        const botW = bW + bW * 0.1;
        ctx.beginPath();
        ctx.moveTo(-topW / 2, pureTop);
        ctx.lineTo(topW / 2, pureTop);
        ctx.lineTo(botW / 2, liquidBottom);
        ctx.lineTo(-botW / 2, liquidBottom);
        ctx.closePath();
        ctx.fill();

        // Pure liquid glow
        const pGlowR = pureH * 0.8;
        const pGlow = ctx.createRadialGradient(0, liquidBottom - pureH * 0.4, 0, 0, liquidBottom - pureH * 0.4, pGlowR);
        pGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.15 * (1 + s.completionAnim * 0.3) * entrance));
        pGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = pGlow;
        ctx.fillRect(-pGlowR, liquidBottom - pureH - pGlowR * 0.5, pGlowR * 2, pGlowR * 2);
      }

      // Toxic liquid (top layer)
      if (toxicH > 0.5) {
        const toxicTop = liquidBottom - pureH - toxicH;
        const toxicGrad = ctx.createLinearGradient(0, toxicTop, 0, toxicTop + toxicH);
        toxicGrad.addColorStop(0, rgba(s.accentRgb, ALPHA.content.max * 0.15 * entrance));
        toxicGrad.addColorStop(0.5, rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance));
        toxicGrad.addColorStop(1, rgba(s.accentRgb, ALPHA.content.max * 0.12 * entrance));
        ctx.fillStyle = toxicGrad;

        const topW = bW + (toxicTop - wallY) / bH * bW * 0.1;
        const botW = bW + (toxicTop + toxicH - wallY) / bH * bW * 0.1;
        ctx.beginPath();
        ctx.moveTo(-topW / 2, toxicTop);
        ctx.lineTo(topW / 2, toxicTop);
        ctx.lineTo(botW / 2, toxicTop + toxicH);
        ctx.lineTo(-botW / 2, toxicTop + toxicH);
        ctx.closePath();
        ctx.fill();

        // Separation line between layers
        ctx.beginPath();
        const sepW = bW + (toxicTop + toxicH - wallY) / bH * bW * 0.1;
        ctx.moveTo(-sepW / 2, toxicTop + toxicH);
        ctx.lineTo(sepW / 2, toxicTop + toxicH);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.5 * entrance);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();
      }

      // Rim highlight
      ctx.beginPath();
      ctx.moveTo(wallX, wallY);
      ctx.lineTo(-wallX, wallY);
      ctx.strokeStyle = rgba(
        lerpColor(s.primaryRgb, [255, 255, 255], 0.2),
        ALPHA.content.max * 0.12 * entrance,
      );
      ctx.lineWidth = px(0.002, minDim);
      ctx.stroke();

      ctx.restore(); // End beaker rotation

      // ── Draw drip particles ─────────────────────────
      for (const d of s.drips) {
        const dR = px(d.radius, minDim);
        const dColor = d.toxic ? s.accentRgb : s.primaryRgb;

        // Drip glow
        const dgR = dR * 3;
        const dg = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, dgR);
        dg.addColorStop(0, rgba(dColor, ALPHA.glow.max * 0.3 * d.life * entrance));
        dg.addColorStop(1, rgba(dColor, 0));
        ctx.fillStyle = dg;
        ctx.fillRect(d.x - dgR, d.y - dgR, dgR * 2, dgR * 2);

        // Drip body
        ctx.beginPath();
        ctx.arc(d.x, d.y, dR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(dColor, ALPHA.content.max * 0.4 * d.life * entrance);
        ctx.fill();
      }

      // ── Error flash ─────────────────────────────────
      if (s.errorFlash > 0) {
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.08 * s.errorFlash * entrance);
        ctx.fillRect(0, 0, w, h);
      }

      // ── Tilt indicator ──────────────────────────────
      if (s.dragging) {
        const indicY = h * 0.9;
        const indicW = minDim * 0.15;
        const tiltFrac = s.tiltAngle / MAX_TILT;

        // Tilt bar background
        ctx.beginPath();
        ctx.moveTo(cx - indicW, indicY);
        ctx.lineTo(cx + indicW, indicY);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * entrance);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();

        // Tilt position dot
        ctx.beginPath();
        ctx.arc(cx + tiltFrac * indicW, indicY, px(0.005, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.fill();

        // Danger zones
        const dangerFrac = SPILL_ANGLE_PURE / MAX_TILT;
        ctx.beginPath();
        ctx.moveTo(cx + dangerFrac * indicW, indicY - px(0.005, minDim));
        ctx.lineTo(cx + dangerFrac * indicW, indicY + px(0.005, minDim));
        ctx.moveTo(cx - dangerFrac * indicW, indicY - px(0.005, minDim));
        ctx.lineTo(cx - dangerFrac * indicW, indicY + px(0.005, minDim));
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.dragging = true;
      s.dragStartX = e.clientX;
      s.dragBaseAngle = s.tiltAngle;
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const p = propsRef.current;

      const dx = e.clientX - s.dragStartX;
      const breathSteady = 1 - p.breathAmplitude * BREATH_STEADY_FACTOR;
      s.tiltAngle = s.dragBaseAngle + dx * TILT_SENSITIVITY * breathSteady;
      s.tiltAngle = Math.max(-MAX_TILT, Math.min(MAX_TILT, s.tiltAngle));
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
