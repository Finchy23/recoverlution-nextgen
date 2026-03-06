/**
 * ATOM 260: THE SOUL SEAL
 * =========================
 * Series 26 — Identity Decoupling · Position 10 (Capstone)
 *
 * A single brilliant spark. No text, no UI. It pulses in exact
 * rhythm with your biometric pulse. Eternal, safe.
 *
 * SIGNATURE TECHNIQUE: Signed Distance Field Morphing
 *   - The spark is a perfect SDF circle — the simplest possible
 *     distance field, teaching that essence is formless
 *   - All previous identity shapes (shell, armor, text, cloak,
 *     contour, document, room, silhouette, costume) exist as
 *     ghost SDF outlines that dissolve one by one
 *   - Final state: single SDF point with infinite edge softness
 *     pulsing with breath — all identity SDFs collapsed to zero
 *   - SDF convergence animation: complex → simple → point → glow
 *
 * PHYSICS:
 *   - Single luminous spark at center
 *   - Breath coupling modulates: pulse size, glow warmth, ring drift
 *   - Hold to synchronize — spark matches your biometric rhythm
 *   - Surrounding ghost shapes dissolve during the hold
 *   - 8 render layers: atmosphere, convergence ghosts, outer glow,
 *     mid glow, core glow, spark body, specular, emanation rings
 *
 * INTERACTION:
 *   Hold to synchronize pulse (hold_start, hold_threshold, seal_stamp)
 *
 * RENDER: Canvas 2D with SDF convergence + pulse synchronization
 * REDUCED MOTION: Single glowing spark, breath-coupled
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, motionScale,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Spark core radius (fraction of minDim) */
const SPARK_R = 0.015;
/** Spark glow outer radius */
const SPARK_GLOW_R = 0.25;
/** Number of glow layers */
const GLOW_LAYERS = 8;
/** Biometric pulse BPM target */
const PULSE_BPM = 64;
/** Synchronization rate per frame while holding */
const SYNC_RATE = 0.003;
/** Emanation ring count */
const EMANATION_RINGS = 6;
/** Emanation ring max radius */
const EMANATION_MAX_R = 0.40;
/** Ghost SDF shape count (one per previous atom) */
const GHOST_SHAPE_COUNT = 9;
/** Ghost dissolve rate while holding */
const GHOST_DISSOLVE_RATE = 0.004;
/** Hold threshold for seal stamp (seconds ~3s at 60fps) */
const HOLD_THRESHOLD = 180;
/** Breath pulse amplitude */
const BREATH_PULSE_AMP = 0.15;

// ═════════════════════════════════════════════════════════════════════
// STATE INTERFACES
// ═════════════════════════════════════════════════════════════════════

interface GhostShape {
  /** Shape type: 0=circle, 1=rect, 2=text, 3=cloak, 4=contour, 5=diamond, 6=box, 7=silhouette, 8=costume */
  type: number;
  alpha: number;
  radius: number;
  angle: number;
}

// ═════════════════════════════════════════════════════════════════════
// RENDER HELPERS
// ═════════════════════════════════════════════════════════════════════

/** Draw a ghost SDF shape at given position */
function drawGhostShape(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, minDim: number,
  color: RGB, ghost: GhostShape, entrance: number,
) {
  const r = px(ghost.radius, minDim);
  const a = ALPHA.content.max * ghost.alpha * 0.08 * entrance;
  const lw = px(STROKE.hairline, minDim);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(ghost.angle);

  switch (ghost.type % 3) {
    case 0: // Circle (matryoshka shell)
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(color, a);
      ctx.lineWidth = lw;
      ctx.stroke();
      break;
    case 1: // Rounded rect (armor/document/room)
      ctx.beginPath();
      ctx.roundRect(-r * 0.8, -r * 1.1, r * 1.6, r * 2.2, r * 0.15);
      ctx.strokeStyle = rgba(color, a);
      ctx.lineWidth = lw;
      ctx.stroke();
      break;
    case 2: // Diamond
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.6, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(-r * 0.6, 0);
      ctx.closePath();
      ctx.strokeStyle = rgba(color, a);
      ctx.lineWidth = lw;
      ctx.stroke();
      break;
  }

  ctx.restore();
}

// ═════════════════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function SoulSealAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const initGhosts = (): GhostShape[] =>
    Array.from({ length: GHOST_SHAPE_COUNT }, (_, i) => ({
      type: i,
      alpha: 0.5 + Math.random() * 0.3,
      radius: 0.06 + i * 0.025,
      angle: (i / GHOST_SHAPE_COUNT) * Math.PI * 2 + Math.random() * 0.3,
    }));

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    pulsePhase: 0,
    syncProgress: 0,
    holding: false, holdFrames: 0,
    holdNotified: false, thresholdNotified: false,
    ghosts: initGhosts(),
    completed: false,
  });

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.reducedMotion || p.phase === 'resolve') {
        s.syncProgress = 1; s.completed = true;
        s.ghosts.forEach(g => { g.alpha = 0; });
      }

      // ── Breath coupling: pulse, glow warmth, ring drift ─────
      const breathMod = 1 + p.breathAmplitude * BREATH_PULSE_AMP;
      const breathWarmth = p.breathAmplitude * 0.2;
      const breathDrift = p.breathAmplitude * 0.005;

      // Biometric pulse
      const pulseInterval = 60 / PULSE_BPM;
      s.pulsePhase += (Math.PI * 2) / (pulseInterval * 60) * ms;
      const pulse = Math.pow(Math.max(0, Math.sin(s.pulsePhase)), 4);

      // Hold synchronization
      if (s.holding) {
        s.holdFrames += ms;
        s.syncProgress = Math.min(1, s.syncProgress + SYNC_RATE * ms);

        // Dissolve ghosts
        for (const g of s.ghosts) {
          g.alpha = Math.max(0, g.alpha - GHOST_DISSOLVE_RATE * ms);
          g.angle += 0.002 * ms; // Slow spin as they dissolve
          g.radius *= 0.999; // Shrink toward center
        }

        if (s.holdFrames >= HOLD_THRESHOLD && !s.thresholdNotified) {
          s.thresholdNotified = true;
          cb.onHaptic('hold_threshold');
        }
        if (s.syncProgress >= 1 && !s.completed) {
          s.completed = true;
          cb.onHaptic('seal_stamp');
        }
      }

      cb.onStateChange?.(s.syncProgress);

      // ═══════════════════════════════════════════════════════
      // LAYER 1: Ghost SDF shapes (convergence)
      // ═══════════════════════════════════════════════════════
      for (const g of s.ghosts) {
        if (g.alpha > 0.005) {
          drawGhostShape(ctx, cx, cy, minDim, s.accentRgb, g, entrance);
        }
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 2-4: Multi-layer glow field
      // ═══════════════════════════════════════════════════════
      const glowIntensity = 0.3 + s.syncProgress * 0.7;
      const warmColor = lerpColor(s.primaryRgb, [255, 240, 215] as RGB, breathWarmth * glowIntensity);

      for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
        const gR = px(SPARK_GLOW_R * (0.15 + glowIntensity * 0.85 + i * 0.08), minDim) * breathMod;
        const gA = ALPHA.glow.max * glowIntensity * 0.08 * entrance / (i + 1);
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
        gg.addColorStop(0, rgba(warmColor, gA * (1 + pulse * 0.3)));
        gg.addColorStop(0.15, rgba(warmColor, gA * 0.6));
        gg.addColorStop(0.35, rgba(s.primaryRgb, gA * 0.2));
        gg.addColorStop(0.6, rgba(s.primaryRgb, gA * 0.05));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 5: Spark body (the eternal point)
      // ═══════════════════════════════════════════════════════
      const sparkPx = px(SPARK_R * (1 + s.syncProgress * 0.5), minDim) * breathMod * (1 + pulse * 0.15);

      // Core gradient — 5 stops
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, sparkPx * 3);
      const coreA = ALPHA.content.max * (0.3 + glowIntensity * 0.5) * entrance;
      coreGrad.addColorStop(0, rgba([255, 255, 248] as RGB, coreA));
      coreGrad.addColorStop(0.1, rgba([255, 250, 235] as RGB, coreA * 0.8));
      coreGrad.addColorStop(0.3, rgba(warmColor, coreA * 0.4));
      coreGrad.addColorStop(0.6, rgba(s.primaryRgb, coreA * 0.1));
      coreGrad.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, sparkPx * 3, 0, Math.PI * 2);
      ctx.fill();

      // Hard bright center
      ctx.beginPath();
      ctx.arc(cx, cy, sparkPx * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = rgba([255, 255, 252] as RGB, ALPHA.content.max * 0.6 * glowIntensity * entrance * (1 + pulse * 0.2));
      ctx.fill();

      // ═══════════════════════════════════════════════════════
      // LAYER 6: Specular highlights
      // ═══════════════════════════════════════════════════════
      const specX = cx - sparkPx * 0.3;
      const specY = cy - sparkPx * 0.4;
      const specR = sparkPx * 0.25;
      const specGrad = ctx.createRadialGradient(specX, specY, 0, specX, specY, specR);
      specGrad.addColorStop(0, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.3 * glowIntensity * entrance));
      specGrad.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
      ctx.fillStyle = specGrad;
      ctx.beginPath();
      ctx.arc(specX, specY, specR, 0, Math.PI * 2);
      ctx.fill();

      // Secondary specular
      const spec2X = cx + sparkPx * 0.2;
      const spec2Y = cy + sparkPx * 0.3;
      const spec2R = sparkPx * 0.15;
      const spec2Grad = ctx.createRadialGradient(spec2X, spec2Y, 0, spec2X, spec2Y, spec2R);
      spec2Grad.addColorStop(0, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.12 * glowIntensity * entrance));
      spec2Grad.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
      ctx.fillStyle = spec2Grad;
      ctx.beginPath();
      ctx.arc(spec2X, spec2Y, spec2R, 0, Math.PI * 2);
      ctx.fill();

      // ═══════════════════════════════════════════════════════
      // LAYER 7: Emanation rings (breath-drifted)
      // ═══════════════════════════════════════════════════════
      const time = s.frameCount * 0.005;
      for (let i = 0; i < EMANATION_RINGS; i++) {
        const rPhase = (time * 0.015 + i / EMANATION_RINGS + breathDrift) % 1;
        const rR = px(SPARK_R * 2 + rPhase * EMANATION_MAX_R, minDim) * breathMod;
        const rA = ALPHA.content.max * 0.03 * (1 - rPhase) * glowIntensity * entrance;
        ctx.beginPath();
        ctx.arc(cx, cy, rR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, rA);
        ctx.lineWidth = px(STROKE.hairline, minDim) * (1 + (1 - rPhase) * 1.5);
        ctx.stroke();
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 8: Pulse heartbeat ring
      // ═══════════════════════════════════════════════════════
      if (s.syncProgress > 0.1) {
        const heartR = sparkPx * (4 + pulse * 2);
        ctx.beginPath();
        ctx.arc(cx, cy, heartR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(warmColor, ALPHA.content.max * 0.05 * pulse * s.syncProgress * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = () => {
      stateRef.current.holding = true;
      if (!stateRef.current.holdNotified) {
        stateRef.current.holdNotified = true;
        callbacksRef.current.onHaptic('hold_start');
      }
    };
    const onUp = () => { stateRef.current.holding = false; };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{
        display: 'block', width: '100%', height: '100%',
        touchAction: 'none', cursor: 'pointer',
      }} />
    </div>
  );
}
