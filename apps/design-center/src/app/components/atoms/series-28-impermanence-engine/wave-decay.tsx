/**
 * ATOM 274: THE WAVE DECAY ENGINE
 * ==================================
 * Series 28 — Impermanence Engine · Position 4
 *
 * Stop striking the bell. Let the echo naturally fade to silence.
 * Every tap restarts the pain — the waveform spikes.
 * Leave it alone → beautiful natural decay to flat silence.
 *
 * SIGNATURE TECHNIQUE: Fabric/Cloth Simulation + Entropy Rendering
 *   - Waveform rendered as undulating cloth ribbon (vertical fibers)
 *   - Each tap sets cloth fibers vibrating at high amplitude
 *   - Natural decay: fibers gradually lose energy, drape flat
 *   - Entropy arc: high-energy oscillation → natural entropic decay
 *   - Bell body as resonating fabric membrane that ripples on strike
 *
 * PHYSICS:
 *   - Cloth ribbon: 60 vertical fiber points across viewport
 *   - Tap → all fibers spike to maximum displacement (strike!)
 *   - Without tapping → exponential amplitude decay per fiber
 *   - Frequency drops during decay (deeper, slower oscillation)
 *   - Bell membrane rendered as circular cloth with radial ripples
 *   - 8 render layers: atmosphere, bell glow, bell membrane, waveform
 *     shadow, cloth ribbon body, fiber stress dots, specular, silence indicator
 *
 * INTERACTION:
 *   Tap → spike amplitude (resets progress)
 *   Don't tap for ~5s → natural decay → completion
 *
 * RENDER: Canvas 2D with cloth-ribbon waveform + bell membrane
 * REDUCED MOTION: Static flat line (silence achieved)
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, GLOW, motionScale,
  easeOutCubic,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Number of fiber points in the cloth ribbon */
const FIBER_COUNT = 64;
/** Maximum waveform displacement (fraction of viewport height) */
const MAX_AMPLITUDE = 0.22;
/** Amplitude decay rate per frame (exponential factor) */
const DECAY_RATE = 0.993;
/** Frequency decay rate per frame */
const FREQ_DECAY = 0.9997;
/** Initial oscillation frequency */
const INITIAL_FREQ = 6.0;
/** Silence threshold for completion */
const SILENCE_THRESHOLD = 0.008;
/** Frames of silence needed for completion */
const SILENCE_FRAMES = 60;
/** Bell membrane radius (fraction of minDim) */
const BELL_R = 0.16;
/** Bell membrane position Y (fraction of viewport height) */
const BELL_Y = 0.28;
/** Bell ripple count on strike */
const BELL_RIPPLES = 5;
/** Cloth ribbon Y center (fraction of viewport height) */
const RIBBON_Y = 0.58;
/** Ribbon thickness (fraction of minDim) */
const RIBBON_THICK = 0.025;
/** Fiber stress glow threshold */
const STRESS_THRESHOLD = 0.3;
/** Breath coupling to fiber flutter */
const BREATH_FLUTTER = 0.003;
/** Bell membrane glow layers */
const BELL_GLOW_LAYERS = 4;

// ═════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═════════════════════════════════════════════════════════════════════

interface FiberPoint {
  /** Current Y displacement from center */
  displacement: number;
  /** Previous displacement for verlet */
  prevDisplacement: number;
  /** Individual phase offset */
  phaseOffset: number;
  /** Damping factor (slight variation per fiber) */
  damping: number;
}

export default function WaveDecayAtom({
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
    amplitude: 0.5,
    frequency: INITIAL_FREQ,
    silenceCount: 0,
    completed: false,
    tapNotified: false,
    bellRipple: 0,
    fibers: Array.from({ length: FIBER_COUNT }, (_, i) => ({
      displacement: 0,
      prevDisplacement: 0,
      phaseOffset: (i / FIBER_COUNT) * Math.PI * 2,
      damping: DECAY_RATE + (Math.random() - 0.5) * 0.003,
    })) as FiberPoint[],
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
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;
      const time = s.frameCount * 0.015;
      const breath = (p.breathAmplitude ?? 0) * BREATH_FLUTTER;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.reducedMotion) {
        s.amplitude = 0; s.completed = true;
      }
      if (p.phase === 'resolve') { s.amplitude = 0; s.completed = true; }

      // ── Decay physics ──────────────────────────────────────────
      s.amplitude *= Math.pow(DECAY_RATE, ms);
      s.frequency *= Math.pow(FREQ_DECAY, ms);
      s.bellRipple *= 0.96;

      if (s.amplitude < SILENCE_THRESHOLD) {
        s.silenceCount += ms;
        if (s.silenceCount >= SILENCE_FRAMES && !s.completed) {
          s.completed = true;
          cb.onHaptic('completion');
        }
      } else {
        s.silenceCount = 0;
      }

      // Update cloth fibers
      for (let i = 0; i < FIBER_COUNT; i++) {
        const f = s.fibers[i];
        const frac = i / (FIBER_COUNT - 1);
        const wave = Math.sin(time * s.frequency + f.phaseOffset) * s.amplitude;
        const breathMod = Math.sin(time + frac * 4) * breath;
        const target = (wave + breathMod) * MAX_AMPLITUDE;
        // Verlet-like spring toward target
        const vel = f.displacement - f.prevDisplacement;
        f.prevDisplacement = f.displacement;
        f.displacement += vel * 0.8 + (target - f.displacement) * 0.15 * ms;
        f.displacement *= f.damping;
      }

      cb.onStateChange?.(s.completed ? 1 : 1 - Math.min(1, s.amplitude / 0.5));

      // ── 1. Bell membrane glow ──────────────────────────────────
      const bellCx = cx;
      const bellCy = BELL_Y * h;
      const bellR = px(BELL_R, minDim);

      for (let i = BELL_GLOW_LAYERS - 1; i >= 0; i--) {
        const gR = bellR * (1.5 + i * 1.2 + s.bellRipple * 2);
        const gA = ALPHA.glow.max * 0.06 * entrance * (s.amplitude * 2 + 0.1) / (i + 1);
        const gg = ctx.createRadialGradient(bellCx, bellCy, 0, bellCx, bellCy, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, gA));
        gg.addColorStop(0.4, rgba(s.primaryRgb, gA * 0.3));
        gg.addColorStop(0.7, rgba(s.primaryRgb, gA * 0.08));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(bellCx - gR, bellCy - gR, gR * 2, gR * 2);
      }

      // ── 2. Bell membrane (circular cloth with ripples) ─────────
      // Outer bell shape
      const bellGrad = ctx.createRadialGradient(
        bellCx - bellR * 0.15, bellCy - bellR * 0.15, 0, bellCx, bellCy, bellR);
      bellGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.28 * entrance));
      bellGrad.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.content.max * 0.20 * entrance));
      bellGrad.addColorStop(0.6, rgba(s.primaryRgb, ALPHA.content.max * 0.12 * entrance));
      bellGrad.addColorStop(0.85, rgba(s.primaryRgb, ALPHA.content.max * 0.05 * entrance));
      bellGrad.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.beginPath();
      ctx.arc(bellCx, bellCy, bellR, 0, Math.PI * 2);
      ctx.fillStyle = bellGrad;
      ctx.fill();

      // Bell edge
      ctx.beginPath();
      ctx.arc(bellCx, bellCy, bellR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.14 * entrance);
      ctx.lineWidth = px(STROKE.thin, minDim);
      ctx.stroke();

      // Ripple rings on bell membrane
      if (s.bellRipple > 0.01) {
        for (let r = 0; r < BELL_RIPPLES; r++) {
          const ripplePhase = (s.bellRipple * 3 + r * 0.2) % 1;
          const rippleR = bellR * (0.2 + ripplePhase * 0.8);
          const rippleA = ALPHA.content.max * 0.06 * (1 - ripplePhase) * s.bellRipple * entrance;
          ctx.beginPath();
          ctx.arc(bellCx, bellCy, rippleR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.accentRgb, rippleA);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // Bell specular
      const bSpecR = bellR * 0.2;
      const bSpecG = ctx.createRadialGradient(
        bellCx - bellR * 0.25, bellCy - bellR * 0.25, 0,
        bellCx - bellR * 0.25, bellCy - bellR * 0.25, bSpecR);
      bSpecG.addColorStop(0, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.14 * entrance));
      bSpecG.addColorStop(0.5, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.04 * entrance));
      bSpecG.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
      ctx.fillStyle = bSpecG;
      ctx.beginPath();
      ctx.arc(bellCx - bellR * 0.25, bellCy - bellR * 0.25, bSpecR, 0, Math.PI * 2);
      ctx.fill();

      // ── 3. Waveform ribbon shadow ──────────────────────────────
      const ribbonCy = RIBBON_Y * h;
      const ribbonThick = px(RIBBON_THICK, minDim);
      ctx.beginPath();
      const shadowOff = px(0.005, minDim);
      for (let i = 0; i < FIBER_COUNT; i++) {
        const frac = i / (FIBER_COUNT - 1);
        const fx = w * 0.06 + frac * w * 0.88;
        const fy = ribbonCy + s.fibers[i].displacement * h + shadowOff;
        if (i === 0) ctx.moveTo(fx, fy);
        else ctx.lineTo(fx, fy);
      }
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.03 * entrance);
      ctx.lineWidth = ribbonThick * 1.2;
      ctx.lineCap = 'round';
      ctx.stroke();

      // ── 4. Cloth ribbon body (waveform) ────────────────────────
      // Top edge
      ctx.beginPath();
      for (let i = 0; i < FIBER_COUNT; i++) {
        const frac = i / (FIBER_COUNT - 1);
        const fx = w * 0.06 + frac * w * 0.88;
        const fy = ribbonCy + s.fibers[i].displacement * h - ribbonThick * 0.5;
        if (i === 0) ctx.moveTo(fx, fy);
        else ctx.lineTo(fx, fy);
      }
      // Bottom edge (reverse)
      for (let i = FIBER_COUNT - 1; i >= 0; i--) {
        const frac = i / (FIBER_COUNT - 1);
        const fx = w * 0.06 + frac * w * 0.88;
        const fy = ribbonCy + s.fibers[i].displacement * h + ribbonThick * 0.5;
        ctx.lineTo(fx, fy);
      }
      ctx.closePath();

      const ribbonGrad = ctx.createLinearGradient(0, ribbonCy - MAX_AMPLITUDE * h, 0, ribbonCy + MAX_AMPLITUDE * h);
      const ribbonCol = lerpColor(s.primaryRgb, s.accentRgb, s.amplitude * 0.4);
      ribbonGrad.addColorStop(0, rgba(ribbonCol, ALPHA.content.max * 0.08 * entrance));
      ribbonGrad.addColorStop(0.3, rgba(ribbonCol, ALPHA.content.max * 0.22 * entrance));
      ribbonGrad.addColorStop(0.5, rgba(ribbonCol, ALPHA.content.max * 0.28 * entrance));
      ribbonGrad.addColorStop(0.7, rgba(ribbonCol, ALPHA.content.max * 0.22 * entrance));
      ribbonGrad.addColorStop(1, rgba(ribbonCol, ALPHA.content.max * 0.08 * entrance));
      ctx.fillStyle = ribbonGrad;
      ctx.fill();

      // Ribbon center line
      ctx.beginPath();
      for (let i = 0; i < FIBER_COUNT; i++) {
        const frac = i / (FIBER_COUNT - 1);
        const fx = w * 0.06 + frac * w * 0.88;
        const fy = ribbonCy + s.fibers[i].displacement * h;
        if (i === 0) ctx.moveTo(fx, fy);
        else ctx.lineTo(fx, fy);
      }
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.18 * entrance);
      ctx.lineWidth = px(STROKE.light, minDim);
      ctx.stroke();

      // ── 5. Fiber stress dots ───────────────────────────────────
      for (let i = 0; i < FIBER_COUNT; i++) {
        const absDisp = Math.abs(s.fibers[i].displacement);
        if (absDisp > STRESS_THRESHOLD * MAX_AMPLITUDE) {
          const frac = i / (FIBER_COUNT - 1);
          const fx = w * 0.06 + frac * w * 0.88;
          const fy = ribbonCy + s.fibers[i].displacement * h;
          const stress = absDisp / MAX_AMPLITUDE;
          const dotR = px(0.004 + stress * 0.005, minDim);
          const dotG = ctx.createRadialGradient(fx, fy, 0, fx, fy, dotR);
          dotG.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.1 * stress * entrance));
          dotG.addColorStop(1, rgba(s.accentRgb, 0));
          ctx.fillStyle = dotG;
          ctx.fillRect(fx - dotR, fy - dotR, dotR * 2, dotR * 2);
        }
      }

      // ── 6. Vertical fiber threads (cloth texture) ──────────────
      for (let i = 0; i < FIBER_COUNT; i += 4) {
        const frac = i / (FIBER_COUNT - 1);
        const fx = w * 0.06 + frac * w * 0.88;
        const fy = ribbonCy + s.fibers[i].displacement * h;
        ctx.beginPath();
        ctx.moveTo(fx, fy - ribbonThick * 0.5);
        ctx.lineTo(fx, fy + ribbonThick * 0.5);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.05 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ── 7. Ribbon specular highlights ──────────────────────────
      ctx.beginPath();
      for (let i = 0; i < FIBER_COUNT; i++) {
        const frac = i / (FIBER_COUNT - 1);
        const fx = w * 0.06 + frac * w * 0.88;
        const fy = ribbonCy + s.fibers[i].displacement * h - ribbonThick * 0.35;
        if (i === 0) ctx.moveTo(fx, fy);
        else ctx.lineTo(fx, fy);
      }
      ctx.strokeStyle = rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.06 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim);
      ctx.stroke();

      // ── 8. Silence / completion indicator ──────────────────────
      if (s.completed) {
        // Peaceful flat-line glow
        const flatY = ribbonCy;
        const flatG = ctx.createLinearGradient(w * 0.06, 0, w * 0.94, 0);
        flatG.addColorStop(0, rgba(s.primaryRgb, 0));
        flatG.addColorStop(0.2, rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance));
        flatG.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.content.max * 0.10 * entrance));
        flatG.addColorStop(0.8, rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance));
        flatG.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.beginPath();
        ctx.moveTo(w * 0.06, flatY);
        ctx.lineTo(w * 0.94, flatY);
        ctx.strokeStyle = flatG;
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();

        // Peace rings
        for (let i = 0; i < 3; i++) {
          const rPhase = (time * 0.04 + i * 0.33) % 1;
          const rR = px(0.05 + rPhase * 0.2, minDim);
          ctx.beginPath();
          ctx.arc(cx, ribbonCy, rR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.03 * (1 - rPhase) * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // Amplitude indicator (thin arc below bell)
      if (s.amplitude > 0.01) {
        const ampArc = Math.min(1, s.amplitude * 2) * Math.PI;
        ctx.beginPath();
        ctx.arc(bellCx, bellCy, bellR * 1.15, Math.PI / 2 - ampArc / 2, Math.PI / 2 + ampArc / 2);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.10 * s.amplitude * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer events ─────────────────────────────────────
    const onDown = () => {
      const s = stateRef.current;
      s.amplitude = 0.8;
      s.frequency = INITIAL_FREQ;
      s.bellRipple = 1;
      s.silenceCount = 0;
      s.completed = false;
      // Re-energize all fibers
      for (const f of s.fibers) {
        f.displacement = 0;
        f.prevDisplacement = 0;
      }
      callbacksRef.current.onHaptic('tap');
    };

    canvas.addEventListener('pointerdown', onDown);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
