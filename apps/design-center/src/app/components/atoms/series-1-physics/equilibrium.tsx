/**
 * ATOM 009: THE EQUILIBRIUM ENGINE
 * ==================================
 * Series 1 — Physics Engines · Position 9
 *
 * Restoring homeostasis. A precision spirit-level instrument
 * with a luminous bubble that responds to pointer tilt.
 * The user guides the bubble to dead center through pendulum
 * physics — mass, damping, overshoot. Breath steadies the hand.
 * At perfect equilibrium (0, 0), the instrument locks in golden
 * harmonic resonance.
 *
 * PHYSICS:
 *   - 2D pendulum with mass, gravity, and damping
 *   - Pointer position simulates device tilt (gyroscope proxy)
 *   - Bubble has inertia — overshoots if moved too fast
 *   - Breath amplitude reduces oscillation damping (calmer = steadier)
 *   - Concentric calibration rings with fine tick marks
 *   - Cross-hair alignment indicator
 *   - Equilibrium lock when bubble stays centered for threshold frames
 *
 * INTERACTION:
 *   Pointer position → tilt gravity vector
 *   Breath (passive)  → reduces dampening noise
 *   Observable         → bubble drifts toward equilibrium naturally
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: No bubble oscillation, instant positioning
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

/** Bubble mass (higher = more momentum, slower response) */
const BUBBLE_MASS = 0.8;
/** Gravity strength from pointer tilt */
const TILT_GRAVITY = 0.006;
/** Velocity damping per frame */
const DAMPING = 0.92;
/** Maximum bubble displacement from center (fraction of instrument radius) */
const MAX_DISPLACEMENT = 0.85;
/** Instrument radius as fraction of min dimension */
const INSTRUMENT_RADIUS_FRAC = 0.35;
/** Number of calibration rings */
const RING_COUNT = 6;
/** Tick marks per ring */
const TICKS_PER_RING = 36;
/** Frames the bubble must stay centered for equilibrium lock */
const LOCK_THRESHOLD_FRAMES = 90; // ~1.5s
/** Center tolerance for "locked" (fraction of instrument radius) */
const CENTER_TOLERANCE = 0.04;
/** Bubble visual radius */
const BUBBLE_RADIUS_FRAC = 0.08;
/** How much breath reduces noise */
const BREATH_STEADYING = 0.6;

// =====================================================================
// COLOR
// =====================================================================

const GOLD: RGB = [220, 190, 110];
const INSTRUMENT_BG: RGB = [15, 13, 22];
const RING_COLOR: RGB = [60, 55, 75];

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function EquilibriumAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  onHaptic,
  onStateChange,
  onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const callbacksRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onStateChange, onResolve]);

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    // Bubble physics (displacement from center, normalized -1 to 1)
    bx: 0.3,   // Start slightly off-center
    by: -0.2,
    bvx: 0,
    bvy: 0,
    // Tilt input (from pointer, normalized -1 to 1)
    tiltX: 0,
    tiltY: 0,
    // Lock state
    centeredFrames: 0,
    isLocked: false,
    lockGlow: 0,
    // Entrance
    entranceProgress: 0,
    frameCount: 0,
    // Noise (simulates micro-vibration / hand shake)
    noisePhase: 0,
    // Colors
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    // Proximity tracking for haptic snap feedback
    lastProximityZone: -1,
  });

  useEffect(() => {
    const s = stateRef.current;
    s.primaryRgb = parseColor(color);
    s.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  // ── Main render loop ──────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;

    let animId: number;
    const dpr = window.devicePixelRatio || 1;
    const s = stateRef.current;
    const minDim = Math.min(w, h);

    // ── Native pointer handlers ─────────────────────────
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      s.tiltX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      s.tiltY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const onLeave = () => {
      stateRef.current.tiltX = 0;
      stateRef.current.tiltY = 0;
    };

    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);

    const render = () => {
      const p = propsRef.current;
      const cb = callbacksRef.current;

      const cw = Math.round(w * dpr);
      const ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);
      s.frameCount++;

      // ── Entrance ──────────────────────────────────────
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const entrance = easeOutExpo(s.entranceProgress);

      const cx = w / 2;
      const cy = h / 2;
      const instR = minDim * INSTRUMENT_RADIUS_FRAC;
      const bubbleR = minDim * BUBBLE_RADIUS_FRAC;

      // ── Pendulum physics ──────────────────────────────
      if (p.reducedMotion) {
        // Direct positioning, no physics
        s.bx = s.tiltX * 0.3;
        s.by = s.tiltY * 0.3;
        s.bvx = 0;
        s.bvy = 0;
      } else {
        // Micro-noise (hand shake simulation)
        s.noisePhase += 0.07;
        const breathSteady = 1 - p.breathAmplitude * BREATH_STEADYING;
        const noise = breathSteady * 0.003;
        const nx = Math.sin(s.noisePhase * 2.3) * noise + Math.sin(s.noisePhase * 5.7) * noise * 0.5;
        const ny = Math.cos(s.noisePhase * 1.9) * noise + Math.cos(s.noisePhase * 4.3) * noise * 0.5;

        // Gravity from tilt
        const gx = (s.tiltX + nx) * TILT_GRAVITY / BUBBLE_MASS;
        const gy = (s.tiltY + ny) * TILT_GRAVITY / BUBBLE_MASS;

        // Apply forces
        s.bvx += gx;
        s.bvy += gy;

        // Damping
        s.bvx *= DAMPING;
        s.bvy *= DAMPING;

        // Integrate
        s.bx += s.bvx;
        s.by += s.bvy;

        // Clamp to instrument bounds (circular)
        const dist = Math.sqrt(s.bx * s.bx + s.by * s.by);
        if (dist > MAX_DISPLACEMENT) {
          const scale = MAX_DISPLACEMENT / dist;
          s.bx *= scale;
          s.by *= scale;
          // Bounce off edge
          s.bvx *= -0.3;
          s.bvy *= -0.3;
        }
      }

      // ── Equilibrium detection ─────────────────────────
      const bubbleDist = Math.sqrt(s.bx * s.bx + s.by * s.by);
      const bubbleSpeed = Math.sqrt(s.bvx * s.bvx + s.bvy * s.bvy);

      if (bubbleDist < CENTER_TOLERANCE && bubbleSpeed < 0.001) {
        s.centeredFrames++;
      } else {
        s.centeredFrames = Math.max(0, s.centeredFrames - 2);
      }

      if (s.centeredFrames >= LOCK_THRESHOLD_FRAMES && !s.isLocked) {
        s.isLocked = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      if (s.isLocked) {
        s.lockGlow = Math.min(1, s.lockGlow + 0.012);
        // Gently pull bubble to exact center
        s.bx *= 0.95;
        s.by *= 0.95;
      }

      // ── Proximity zone haptics ────────────────────────
      const proximityZone = bubbleDist < 0.08 ? 3 : bubbleDist < 0.2 ? 2 : bubbleDist < 0.5 ? 1 : 0;
      if (proximityZone > s.lastProximityZone && proximityZone >= 2) {
        cb.onHaptic('drag_snap');
      }
      s.lastProximityZone = proximityZone;

      // ── State reporting ───────────────────────────────
      // 1 = perfect center, 0 = maximum displacement
      const centeredness = 1 - Math.min(1, bubbleDist / MAX_DISPLACEMENT);
      cb.onStateChange?.(centeredness);

      // ══════════════════════════════════════════════════
      // RENDER
      // ═════════════════════════════════════════════════

      // Bubble position in pixels
      const bpx = cx + s.bx * instR;
      const bpy = cy + s.by * instR;

      // ── Background ────────────────────────────────────
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7);
      bgGrad.addColorStop(0, rgba(lerpColor(INSTRUMENT_BG, s.primaryRgb, 0.03), entrance * 0.03));
      bgGrad.addColorStop(0.5, rgba(INSTRUMENT_BG, entrance * 0.025));
      bgGrad.addColorStop(1, rgba([4, 3, 8], entrance * 0.02));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Instrument body ───────────────────────────────
      // Outer bezel
      ctx.beginPath();
      ctx.arc(cx, cy, instR + minDim * 0.012, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(lerpColor(RING_COLOR, s.primaryRgb, 0.15), 0.12 * entrance);
      ctx.lineWidth = minDim * 0.004;
      ctx.stroke();

      // Glass surface (subtle mound — visible but transparent, primaryRgb-tinted)
      const glassGrad = ctx.createRadialGradient(cx - instR * 0.2, cy - instR * 0.2, 0, cx, cy, instR);
      glassGrad.addColorStop(0, rgba(lerpColor([30, 26, 42], s.primaryRgb, 0.12), 0.09 * entrance));
      glassGrad.addColorStop(0.5, rgba(lerpColor([18, 15, 28], s.primaryRgb, 0.06), 0.07 * entrance));
      glassGrad.addColorStop(0.85, rgba(lerpColor([10, 8, 18], s.primaryRgb, 0.03), 0.05 * entrance));
      glassGrad.addColorStop(1, rgba([8, 6, 14], 0.03 * entrance));
      ctx.beginPath();
      ctx.arc(cx, cy, instR, 0, Math.PI * 2);
      ctx.fillStyle = glassGrad;
      ctx.fill();

      // ── Calibration rings ─────────────────────────────
      for (let ring = 1; ring <= RING_COUNT; ring++) {
        const rr = (ring / RING_COUNT) * instR;
        const ringAlpha = (ring === RING_COUNT ? 0.12 : 0.06) * entrance;
        const isCenter = ring <= 2;

        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(
          s.isLocked && isCenter ? lerpColor(GOLD, s.accentRgb, 0.3) :
          lerpColor(RING_COLOR, s.primaryRgb, isCenter ? 0.3 : 0.1),
          (ringAlpha + (s.isLocked && isCenter ? s.lockGlow * 0.15 : 0)),
        );
        ctx.lineWidth = isCenter ? 1 : 0.5;
        ctx.stroke();

        // Tick marks on outer rings
        if (ring >= 3) {
          const tickCount = ring === RING_COUNT ? TICKS_PER_RING : TICKS_PER_RING / 2;
          for (let t = 0; t < tickCount; t++) {
            const angle = (t / tickCount) * Math.PI * 2;
            const isCardinal = t % (tickCount / 4) === 0;
            const tickLen = isCardinal ? minDim * 0.01 : minDim * 0.005;
            const inner = rr - tickLen;
            const outer = rr;

            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
            ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
            ctx.strokeStyle = rgba(RING_COLOR, (isCardinal ? 0.15 : 0.06) * entrance);
            ctx.lineWidth = isCardinal ? minDim * 0.002 : minDim * 0.001;
            ctx.stroke();
          }
        }
      }

      // ── Cross-hairs ───────────────────────────────────
      const crossLen = instR * 0.15;
      const crossAlpha = (0.08 + (s.isLocked ? s.lockGlow * 0.3 : 0)) * entrance;
      const crossColor = s.isLocked ? lerpColor(GOLD, s.accentRgb, 0.3) : RING_COLOR;

      ctx.beginPath();
      ctx.moveTo(cx - crossLen, cy);
      ctx.lineTo(cx + crossLen, cy);
      ctx.moveTo(cx, cy - crossLen);
      ctx.lineTo(cx, cy + crossLen);
      ctx.strokeStyle = rgba(crossColor, crossAlpha);
      ctx.lineWidth = minDim * 0.0015;
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, minDim * 0.003, 0, Math.PI * 2);
      ctx.fillStyle = rgba(crossColor, crossAlpha * 1.5);
      ctx.fill();

      // ── Liquid surface effect ─────────────────────────
      // Subtle refraction highlight opposite the bubble position
      if (!p.reducedMotion) {
        const reflX = cx - s.bx * instR * 0.3;
        const reflY = cy - s.by * instR * 0.3;
        const reflR = instR * 0.4;
        const reflGrad = ctx.createRadialGradient(reflX, reflY, 0, reflX, reflY, reflR);
        reflGrad.addColorStop(0, rgba([255, 255, 255], 0.015 * entrance));
        reflGrad.addColorStop(1, rgba([255, 255, 255], 0));
        ctx.fillStyle = reflGrad;
        ctx.fillRect(reflX - reflR, reflY - reflR, reflR * 2, reflR * 2);
      }

      // ── Tilt gravity indicator ─────────────────────────
      // Shows the user which direction gravity is pulling
      const tiltMag = Math.sqrt(s.tiltX * s.tiltX + s.tiltY * s.tiltY);
      if (tiltMag > 0.05) {
        const tiltNx = s.tiltX / tiltMag;
        const tiltNy = s.tiltY / tiltMag;
        const arrowLen = instR * 0.3 * Math.min(1, tiltMag);
        const arrowAlpha = Math.min(0.2, tiltMag * 0.15) * entrance;

        // Draw 3 small gravity arrows around the instrument edge
        for (let i = -1; i <= 1; i++) {
          const perpX = -tiltNy * i * instR * 0.3;
          const perpY = tiltNx * i * instR * 0.3;
          const startX = cx + perpX - tiltNx * instR * 0.6;
          const startY = cy + perpY - tiltNy * instR * 0.6;
          const endX = startX + tiltNx * arrowLen;
          const endY = startY + tiltNy * arrowLen;

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          // Arrowhead
          const headLen = arrowLen * 0.3;
          const headAngle = Math.atan2(tiltNy, tiltNx);
          ctx.lineTo(
            endX - Math.cos(headAngle - 0.4) * headLen,
            endY - Math.sin(headAngle - 0.4) * headLen,
          );
          ctx.moveTo(endX, endY);
          ctx.lineTo(
            endX - Math.cos(headAngle + 0.4) * headLen,
            endY - Math.sin(headAngle + 0.4) * headLen,
          );
          ctx.strokeStyle = rgba(s.primaryRgb, arrowAlpha * (i === 0 ? 1 : 0.5));
          ctx.lineWidth = i === 0 ? 1.5 : 0.8;
          ctx.stroke();
        }
      }

      // ── The Bubble ────────────────────────────────────
      // Shadow beneath
      const shadowGrad = ctx.createRadialGradient(
        bpx + minDim * 0.003, bpy + minDim * 0.005, 0,
        bpx + minDim * 0.003, bpy + minDim * 0.005, bubbleR * 1.3,
      );
      shadowGrad.addColorStop(0, rgba([0, 0, 0], 0.12 * entrance));
      shadowGrad.addColorStop(1, rgba([0, 0, 0], 0));
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(bpx - bubbleR * 1.5, bpy - bubbleR * 1.5, bubbleR * 3, bubbleR * 3);

      // Bubble body — derived from primaryRgb, not hardcoded silver
      const bGrad = ctx.createRadialGradient(
        bpx - bubbleR * 0.25, bpy - bubbleR * 0.3, bubbleR * 0.1,
        bpx, bpy, bubbleR,
      );
      const bubbleBase = lerpColor(s.primaryRgb, [220, 225, 235], 0.35);
      const bColor = s.isLocked
        ? lerpColor(bubbleBase, GOLD, s.lockGlow * 0.6)
        : bubbleBase;
      bGrad.addColorStop(0, rgba(lerpColor(bColor, [255, 255, 255], 0.4), 0.5 * entrance));
      bGrad.addColorStop(0.35, rgba(lerpColor(bColor, [255, 255, 255], 0.15), 0.38 * entrance));
      bGrad.addColorStop(0.7, rgba(bColor, 0.28 * entrance));
      bGrad.addColorStop(1, rgba(lerpColor(bColor, s.primaryRgb, 0.4), 0.12 * entrance));

      ctx.beginPath();
      ctx.arc(bpx, bpy, bubbleR, 0, Math.PI * 2);
      ctx.fillStyle = bGrad;
      ctx.fill();

      // Bubble edge
      ctx.beginPath();
      ctx.arc(bpx, bpy, bubbleR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(lerpColor(bColor, [255, 255, 255], 0.2), 0.18 * entrance);
      ctx.lineWidth = minDim * 0.002;
      ctx.stroke();

      // Bubble specular highlight
      ctx.beginPath();
      ctx.ellipse(
        bpx - bubbleR * 0.2,
        bpy - bubbleR * 0.25,
        bubbleR * 0.35,
        bubbleR * 0.2,
        -0.3,
        0, Math.PI * 2,
      );
      ctx.fillStyle = rgba([255, 255, 255], 0.25 * entrance);
      ctx.fill();

      // Secondary specular (smaller, sharper)
      ctx.beginPath();
      ctx.ellipse(
        bpx - bubbleR * 0.12,
        bpy - bubbleR * 0.18,
        bubbleR * 0.12,
        bubbleR * 0.08,
        -0.2,
        0, Math.PI * 2,
      );
      ctx.fillStyle = rgba([255, 255, 255], 0.35 * entrance);
      ctx.fill();

      // Bubble glow halo — primaryRgb tinted
      const haloR = bubbleR * 2.5;
      const haloGrad = ctx.createRadialGradient(bpx, bpy, bubbleR * 0.5, bpx, bpy, haloR);
      haloGrad.addColorStop(0, rgba(lerpColor(bColor, s.primaryRgb, 0.3), 0.1 * entrance));
      haloGrad.addColorStop(0.4, rgba(s.primaryRgb, 0.04 * entrance));
      haloGrad.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = haloGrad;
      ctx.fillRect(bpx - haloR, bpy - haloR, haloR * 2, haloR * 2);

      // ── Lock state golden glow ────────────────────────
      if (s.lockGlow > 0) {
        // Golden radial pulse from center
        const lockR = instR * (0.5 + s.lockGlow * 0.5);
        const lockPulse = p.reducedMotion ? 1 : (0.85 + 0.15 * Math.sin(s.frameCount * 0.03));
        const lockGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, lockR);
        lockGrad.addColorStop(0, rgba(GOLD, s.lockGlow * 0.12 * lockPulse * entrance));
        lockGrad.addColorStop(0.5, rgba(lerpColor(GOLD, s.accentRgb, 0.3), s.lockGlow * 0.04 * lockPulse * entrance));
        lockGrad.addColorStop(1, rgba(GOLD, 0));
        ctx.fillStyle = lockGrad;
        ctx.fillRect(cx - lockR, cy - lockR, lockR * 2, lockR * 2);

        // Alignment cross intensifies
        ctx.beginPath();
        ctx.moveTo(cx - crossLen * 1.5, cy);
        ctx.lineTo(cx + crossLen * 1.5, cy);
        ctx.moveTo(cx, cy - crossLen * 1.5);
        ctx.lineTo(cx, cy + crossLen * 1.5);
        ctx.strokeStyle = rgba(GOLD, s.lockGlow * 0.25 * entrance);
        ctx.lineWidth = minDim * 0.002;
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
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
          cursor: 'none',
        }}
      />
    </div>
  );
}