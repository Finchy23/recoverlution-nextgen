/**
 * ATOM 210: THE OBSERVER SEAL
 * =============================
 * Series 21 — Metacognitive Mirror · Position 10 (Capstone)
 *
 * I am the Witness. The observer of the panic is completely free from
 * the panic. Hold the center of a raging vortex — the eye of the storm.
 *
 * PHYSICS:
 *   - Violent vortex of particles swirls around the screen
 *   - Dead center: a perfectly still point
 *   - Hold the center → vortex rages but center stays zero
 *   - The longer you hold, the wider the calm eye expands
 *   - Resolution: vast silent eye, storm relegated to the rim
 *
 * INTERACTION:
 *   Hold center → anchors the witness point, eye expands
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static eye-of-storm state
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const VORTEX_PARTICLE_COUNT = 60;
const EYE_EXPAND_RATE = 0.004;
const EYE_CONTRACT_RATE = 0.006;
const CENTER_HIT_RADIUS = 0.08; // fraction of minDim

interface VortexParticle {
  angle: number;
  radius: number; // normalized distance from center
  speed: number;  // angular velocity
  size: number;
  layer: number;  // 0 = inner, 1 = mid, 2 = outer
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function ObserverSealAtom({
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
    // Eye expansion: 0 = tiny center, 1 = vast calm eye
    eyeSize: 0,
    holding: false,
    holdingCenter: false,
    holdNotified: false,
    thresholdNotified: false,
    completed: false,
    // Vortex
    particles: [] as VortexParticle[],
    initialized: false,
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

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      // ── Init particles ────────────────────────────────
      if (!s.initialized) {
        s.particles = [];
        for (let i = 0; i < VORTEX_PARTICLE_COUNT; i++) {
          const layer = i < 20 ? 0 : i < 40 ? 1 : 2;
          s.particles.push({
            angle: Math.random() * Math.PI * 2,
            radius: 0.08 + Math.random() * 0.35,
            speed: (0.015 + Math.random() * 0.02) * (layer === 0 ? 1.5 : layer === 1 ? 1 : 0.7),
            size: 0.002 + Math.random() * 0.003,
            layer,
          });
        }
        s.initialized = true;
      }

      // ── Eye expansion physics ─────────────────────────
      if ((s.holdingCenter || p.phase === 'resolve') && !s.completed) {
        s.eyeSize = Math.min(1, s.eyeSize + EYE_EXPAND_RATE);
      } else if (!s.completed && !s.holdingCenter) {
        s.eyeSize = Math.max(0, s.eyeSize - EYE_CONTRACT_RATE);
      }

      if (s.eyeSize >= 0.5 && !s.thresholdNotified) {
        s.thresholdNotified = true;
        cb.onHaptic('hold_threshold');
      }
      if (s.eyeSize >= 0.95 && !s.completed) {
        s.completed = true;
        cb.onHaptic('seal_stamp');
      }
      cb.onStateChange?.(s.eyeSize);

      const eye = s.eyeSize;
      // Minimum radius that's clear (the eye of the storm)
      const eyeRadius = px(0.03 + eye * 0.2, minDim);

      // ── Draw vortex particles ─────────────────────────
      for (const pt of s.particles) {
        if (!p.reducedMotion) {
          pt.angle += pt.speed * ms * (1 + (1 - eye) * 0.5);
        }

        // Push particles outward as eye expands
        const minR = eyeRadius / minDim + 0.02;
        const effectiveR = Math.max(minR, pt.radius) + eye * 0.1;
        const ptX = cx + Math.cos(pt.angle) * effectiveR * minDim;
        const ptY = cy + Math.sin(pt.angle) * effectiveR * minDim;

        const ptR = px(pt.size, minDim);
        const layerAlpha = pt.layer === 0 ? 0.8 : pt.layer === 1 ? 0.5 : 0.3;
        const ptAlpha = ALPHA.content.max * layerAlpha * entrance * (0.5 + (1 - eye) * 0.5);
        const ptColor = pt.layer === 2 ? s.primaryRgb : lerpColor(s.accentRgb, s.primaryRgb, pt.layer * 0.5);

        // Particle trail
        const trailLen = px(0.008 * (1 - eye * 0.5), minDim);
        const trailX = ptX - Math.cos(pt.angle) * trailLen;
        const trailY = ptY - Math.sin(pt.angle) * trailLen;
        ctx.beginPath();
        ctx.moveTo(trailX, trailY);
        ctx.lineTo(ptX, ptY);
        ctx.strokeStyle = rgba(ptColor, ptAlpha * 0.5);
        ctx.lineWidth = ptR;
        ctx.stroke();

        // Particle dot
        ctx.beginPath();
        ctx.arc(ptX, ptY, ptR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(ptColor, ptAlpha);
        ctx.fill();
      }

      // ── Vortex ring structure ─────────────────────────
      const ringAlpha = ALPHA.atmosphere.min * 0.5 * entrance;
      for (let r = 0; r < 3; r++) {
        const ringR = eyeRadius + px(0.05 + r * 0.08, minDim);
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.accentRgb, ringAlpha * (0.3 - r * 0.08));
        ctx.lineWidth = px(0.0005, minDim);
        ctx.stroke();
      }

      // ── Eye of the storm (center calm) ────────────────
      // Radiant calm glow
      const calmGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, eyeRadius);
      calmGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * (0.1 + eye * 0.5) * entrance));
      calmGlow.addColorStop(0.7, rgba(s.primaryRgb, ALPHA.glow.min * eye * entrance));
      calmGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = calmGlow;
      ctx.fillRect(cx - eyeRadius, cy - eyeRadius, eyeRadius * 2, eyeRadius * 2);

      // Center witness dot
      const witnessR = px(0.006 + eye * 0.004, minDim);
      const witnessPulse = 1 + breath * 0.08;
      ctx.beginPath();
      ctx.arc(cx, cy, witnessR * witnessPulse, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
      ctx.fill();

      // Seal ring (appears at completion)
      if (s.completed) {
        const sealR = px(0.025, minDim);
        const sealAlpha = ALPHA.content.max * 0.5 * entrance;
        ctx.beginPath();
        ctx.arc(cx, cy, sealR * (1 + breath * 0.03), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, sealAlpha);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Pointer handlers ──────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      const dist = Math.sqrt(mx * mx + my * my);

      s.holding = true;
      s.holdingCenter = dist < CENTER_HIT_RADIUS;

      if (s.holdingCenter && !s.holdNotified) {
        s.holdNotified = true;
        callbacksRef.current.onHaptic('hold_start');
      }
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.holding) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      const dist = Math.sqrt(mx * mx + my * my);
      s.holdingCenter = dist < CENTER_HIT_RADIUS + 0.03; // slight forgiveness
    };

    const onUp = () => {
      const s = stateRef.current;
      s.holding = false;
      s.holdingCenter = false;
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
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }}
      />
    </div>
  );
}
