/**
 * ATOM 232: THE MUTUAL RESPIRATION ENGINE
 * =========================================
 * Series 24 — Net of Indra · Position 2
 *
 * You do not breathe the air — the air breathes you. Two luminous
 * circles begin with desynchronized rhythms. Breath brings them into
 * phase-locked harmony (Kuramoto coupling model).
 *
 * PHYSICS:
 *   - Two large oscillating circles (SIZE.md) left and right of center
 *   - Each has its own natural frequency (slightly different)
 *   - Breath amplitude drives the left circle; the right responds
 *   - Kuramoto coupling: sync strength increases as phase difference shrinks
 *   - Visual sync indicator: filament bridge glows when phases align
 *   - Each circle has inner ring structure, glow halo, and breath particles
 *   - At full sync: circles merge into one unified breathing organism
 *   - Particle field between circles shows the coupling force field
 *
 * INTERACTION:
 *   Breath (passive) → drives left oscillator, coupling syncs right
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static merged state with soft glow
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

/** Circle base radius */
const CIRCLE_R = SIZE.md;
/** Horizontal offset from center */
const CIRCLE_OFFSET = 0.18;
/** Left circle natural frequency */
const FREQ_LEFT = 0.025;
/** Right circle natural frequency (slightly faster) */
const FREQ_RIGHT = 0.031;
/** Kuramoto coupling strength */
const COUPLING_K = 0.012;
/** Phase-lock threshold (radians) for "synced" */
const SYNC_THRESHOLD = 0.15;
/** Frames of sync required for completion */
const SYNC_FRAMES = 180;
/** Breath drive strength on left oscillator */
const BREATH_DRIVE = 0.6;
/** Pulsation amplitude (fraction of radius) */
const PULSE_AMP = 0.12;
/** Inner ring count per circle */
const INNER_RINGS = 3;
/** Bridge filament particle count */
const BRIDGE_PARTICLES = 30;
/** Merge animation speed */
const MERGE_SPEED = 0.006;
/** Glow layers per circle */
const GLOW_LAYERS = 4;

// =====================================================================
// STATE TYPES
// =====================================================================

interface BridgeParticle {
  /** Position along bridge 0-1 */
  t: number;
  /** Vertical offset */
  yOff: number;
  /** Speed */
  speed: number;
  /** Size */
  size: number;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function MutualRespirationAtom({
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
    // Oscillator phases
    phaseLeft: 0,
    phaseRight: Math.PI * 0.7,  // start desynchronized
    // Sync tracking
    syncFrames: 0,
    completed: false,
    stepNotified: false,
    mergeProgress: 0,
    // Bridge particles
    bridgeParticles: Array.from({ length: BRIDGE_PARTICLES }, (): BridgeParticle => ({
      t: Math.random(),
      yOff: (Math.random() - 0.5) * 0.04,
      speed: 0.003 + Math.random() * 0.004,
      size: 0.001 + Math.random() * 0.002,
    })),
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

      // ── Reduced motion ──────────────────────────────────
      if (p.reducedMotion) {
        const mergedR = px(CIRCLE_R * 1.2, minDim);
        for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = mergedR * (2 + i * 3);
          const gA = ALPHA.glow.max * 0.2 * entrance / (i + 1);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(s.primaryRgb, gA));
          gg.addColorStop(0.3, rgba(s.primaryRgb, gA * 0.4));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }
        ctx.beginPath();
        ctx.arc(cx, cy, mergedR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.25 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
        cb.onStateChange?.(1);
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ═══════════════════════════════════════════════════
      // KURAMOTO OSCILLATOR PHYSICS
      // ═══════════════════════════════════════════════════
      if (p.phase === 'resolve') {
        s.phaseRight = s.phaseLeft;
        s.syncFrames = SYNC_FRAMES;
      }

      // Left oscillator — driven by breath
      const breathDrive = breath * BREATH_DRIVE;
      s.phaseLeft += (FREQ_LEFT + breathDrive * 0.01) * ms;

      // Right oscillator — Kuramoto coupled
      const phaseDiff = s.phaseLeft - s.phaseRight;
      const coupling = COUPLING_K * Math.sin(phaseDiff);
      s.phaseRight += (FREQ_RIGHT + coupling) * ms;

      // Sync detection
      const absDiff = Math.abs(Math.sin(s.phaseLeft) - Math.sin(s.phaseRight));
      const synced = absDiff < SYNC_THRESHOLD;

      if (synced) {
        s.syncFrames = Math.min(SYNC_FRAMES, s.syncFrames + ms);
      } else {
        s.syncFrames = Math.max(0, s.syncFrames - ms * 0.5);
      }

      if (s.syncFrames >= SYNC_FRAMES * 0.5 && !s.stepNotified) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }
      if (s.syncFrames >= SYNC_FRAMES && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      if (s.completed) {
        s.mergeProgress = Math.min(1, s.mergeProgress + MERGE_SPEED * ms);
      }

      const syncLevel = s.syncFrames / SYNC_FRAMES;
      cb.onStateChange?.(s.completed ? 0.5 + s.mergeProgress * 0.5 : syncLevel * 0.5);

      // Oscillator values
      const leftPulse = Math.sin(s.phaseLeft);
      const rightPulse = Math.sin(s.phaseRight);

      // Circle positions (merge toward center on completion)
      const mergeOffset = CIRCLE_OFFSET * (1 - s.mergeProgress);
      const leftCx = cx - px(mergeOffset, minDim);
      const rightCx = cx + px(mergeOffset, minDim);
      const baseR = px(CIRCLE_R, minDim);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Background coupling field
      // ════════════════════════════════════════════════════
      if (syncLevel > 0.1) {
        const fieldR = px(CIRCLE_OFFSET * 1.5, minDim);
        const fieldGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, fieldR);
        fieldGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.06 * syncLevel * entrance));
        fieldGrad.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.02 * syncLevel * entrance));
        fieldGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = fieldGrad;
        ctx.fillRect(cx - fieldR, cy - fieldR, fieldR * 2, fieldR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Bridge filament (between circles)
      // ════════════════════════════════════════════════════
      if (syncLevel > 0.05 && s.mergeProgress < 0.9) {
        // Bridge line
        ctx.beginPath();
        ctx.moveTo(leftCx + baseR, cy);
        ctx.lineTo(rightCx - baseR, cy);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * syncLevel * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();

        // Bridge particles
        for (const bp of s.bridgeParticles) {
          bp.t = (bp.t + bp.speed * ms * (1 + syncLevel)) % 1;
          const bpx = leftCx + baseR + bp.t * ((rightCx - baseR) - (leftCx + baseR));
          const bpy = cy + bp.yOff * minDim * syncLevel;
          const bpR = px(bp.size * syncLevel, minDim);

          if (bpR > 0.2) {
            ctx.beginPath();
            ctx.arc(bpx, bpy, bpR, 0, Math.PI * 2);
            ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * syncLevel * entrance);
            ctx.fill();
          }
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Circle rendering (both circles)
      // ════════════════════════════════════════════════════
      const circles = [
        { cx: leftCx, pulse: leftPulse, colorMix: 0 },
        { cx: rightCx, pulse: rightPulse, colorMix: 0.3 },
      ];

      for (const circle of circles) {
        const cCx = circle.cx;
        const pulse = circle.pulse;
        const circleR = baseR * (1 + pulse * PULSE_AMP);
        const circleColor = lerpColor(s.primaryRgb, s.accentRgb, circle.colorMix);

        // Shadow beneath circle
        const shadowR = circleR * 1.8;
        const shadowGrad = ctx.createRadialGradient(cCx, cy + circleR * 0.08, 0, cCx, cy, shadowR);
        shadowGrad.addColorStop(0, rgba([0, 0, 0] as RGB, 0.04 * entrance));
        shadowGrad.addColorStop(1, rgba([0, 0, 0] as RGB, 0));
        ctx.fillStyle = shadowGrad;
        ctx.fillRect(cCx - shadowR, cy - shadowR, shadowR * 2, shadowR * 2);

        // Multi-layer glow
        for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = circleR * (1.5 + i * 2);
          const gA = ALPHA.glow.max * (0.04 + syncLevel * 0.08) * entrance / (i + 1);
          const gg = ctx.createRadialGradient(cCx, cy, circleR * 0.3, cCx, cy, gR);
          gg.addColorStop(0, rgba(circleColor, gA));
          gg.addColorStop(0.4, rgba(circleColor, gA * 0.3));
          gg.addColorStop(1, rgba(circleColor, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(cCx - gR, cy - gR, gR * 2, gR * 2);
        }

        // Circle body (outer ring)
        ctx.beginPath();
        ctx.arc(cCx, cy, circleR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(circleColor, ALPHA.content.max * (0.15 + syncLevel * 0.15 + (0.5 + pulse * 0.5) * 0.1) * entrance);
        ctx.lineWidth = px(STROKE.light + STROKE.thin * syncLevel, minDim);
        ctx.stroke();

        // Inner rings
        for (let ri = 1; ri <= INNER_RINGS; ri++) {
          const ringR = circleR * (ri / (INNER_RINGS + 1));
          const ringPulse = Math.sin(s.phaseLeft * (circle.colorMix < 0.15 ? 1 : FREQ_RIGHT / FREQ_LEFT) + ri * 0.5);
          ctx.beginPath();
          ctx.arc(cCx, cy, ringR * (1 + ringPulse * 0.05), 0, Math.PI * 2);
          ctx.strokeStyle = rgba(circleColor, ALPHA.content.max * 0.06 * (0.5 + pulse * 0.5) * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }

        // Center dot
        const dotR = px(0.005 + pulse * 0.002, minDim);
        const dotGrad = ctx.createRadialGradient(cCx - dotR * 0.2, cy - dotR * 0.2, dotR * 0.1, cCx, cy, dotR);
        dotGrad.addColorStop(0, rgba(lerpColor(circleColor, [255, 255, 255] as RGB, 0.5), ALPHA.content.max * 0.4 * entrance));
        dotGrad.addColorStop(0.5, rgba(circleColor, ALPHA.content.max * 0.3 * entrance));
        dotGrad.addColorStop(1, rgba(circleColor, ALPHA.content.max * 0.08 * entrance));
        ctx.beginPath();
        ctx.arc(cCx, cy, dotR, 0, Math.PI * 2);
        ctx.fillStyle = dotGrad;
        ctx.fill();

        // Specular on center dot
        ctx.beginPath();
        ctx.ellipse(cCx - dotR * 0.2, cy - dotR * 0.25, dotR * 0.3, dotR * 0.18, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.2 * (0.5 + pulse * 0.5) * entrance);
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Sync halo rings (at high sync)
      // ════════════════════════════════════════════════════
      if (syncLevel > 0.5) {
        const haloIntensity = (syncLevel - 0.5) * 2;
        for (let i = 0; i < 3; i++) {
          const haloPhase = (time * 0.06 + i * 0.33) % 1;
          const haloR = px(CIRCLE_R * 0.5 + haloPhase * CIRCLE_R * 1.5, minDim);
          ctx.beginPath();
          ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.03 * (1 - haloPhase) * haloIntensity * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ── Progress ring ──────────────────────────────────
      if (!s.completed && syncLevel > 0.02) {
        const progR = px(SIZE.xs, minDim);
        ctx.beginPath();
        ctx.arc(cx, cy - px(CIRCLE_R + 0.06, minDim), progR, -Math.PI / 2, -Math.PI / 2 + syncLevel * Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => { cancelAnimationFrame(animId); };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }}
      />
    </div>
  );
}
