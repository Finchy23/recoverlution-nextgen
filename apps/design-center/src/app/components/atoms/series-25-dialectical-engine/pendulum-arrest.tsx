/**
 * ATOM 245: THE PENDULUM ARREST ENGINE
 * =======================================
 * Series 25 — Dialectical Engine · Position 5
 *
 * Mania and depression are a pendulum. Apply friction to the fulcrum —
 * not the weight — to arrest the swing. The physics teaches: you don't
 * stop extremes by fighting the extremes, but by steadying the center.
 *
 * SIGNATURE TECHNIQUE: Interference Fringes + Superposition
 *   - The pendulum's left/right extremes emit opposing wavefronts
 *   - At center (arrested), the two wave sources superpose perfectly:
 *     constructive at center creates a standing-wave pattern
 *   - Wide swing → destructive interference everywhere (chaos)
 *   - Arrested center → beautiful concentric fringe rings (peace)
 *   - The interference pattern IS the reward for finding stillness
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + fulcrum glow field
 *   2. Interference fringe field from pendulum extremes
 *   3. Pendulum arm shadow + stretch shadow
 *   4. Pendulum arm with gradient + fulcrum glass surface
 *   5. Pendulum weight with multi-stop gradient + specular
 *   6. Energy arc visualization
 *   7. Arrest glow + standing wave fringes
 *   8. Progress ring
 *
 * PHYSICS:
 *   - Simple pendulum with gravity + damping
 *   - Hold center → apply friction to fulcrum → dampen swing
 *   - Amplitude decreases with friction → balance reached
 *   - Energy visualization: kinetic arc at extremes fades as arrested
 *   - Breath couples to gentle pendulum sway when arrested
 *
 * INTERACTION:
 *   Hold center/fulcrum → apply friction (hold_start, hold_threshold, completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Arrested pendulum with standing-wave fringes, static
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, GLOW, motionScale, type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Pendulum arm length (viewport fraction) */
const ARM_LENGTH = SIZE.lg * 0.65;
/** Pendulum weight radius */
const WEIGHT_R = SIZE.md * 0.18;
/** Gravity acceleration */
const GRAVITY = 0.0008;
/** Natural damping (very low — barely stops on its own) */
const NATURAL_DAMP = 0.9995;
/** Applied friction when holding center */
const FRICTION_DAMP = 0.97;
/** Initial swing amplitude (radians) */
const INITIAL_ANGLE = Math.PI * 0.35;
/** Arrested threshold (radians) */
const ARREST_THRESHOLD = 0.015;
/** Frames arrested for completion */
const ARREST_FRAMES = 80;
/** Fulcrum radius */
const FULCRUM_R = 0.012;
/** Fulcrum hold target radius */
const FULCRUM_HIT_R = 0.06;
/** Glow layers */
const GLOW_LAYERS = 6;
/** Interference fringe rings */
const FRINGE_RINGS = 24;
/** Fringe wavelength */
const FRINGE_LAMBDA = 0.02;
/** Energy arc segments */
const ENERGY_ARC_SEGS = 30;
/** Arm width */
const ARM_W = 0.003;
/** Progress ring radius */
const PROGRESS_RING_R = SIZE.md * 0.85;
/** Breath sway when arrested */
const BREATH_SWAY = 0.008;
/** Standing wave ring count at arrest */
const STANDING_WAVE_RINGS = 10;

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function PendulumArrestAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    angle: INITIAL_ANGLE, angVel: 0,
    holding: false, holdNotified: false, thresholdNotified: false,
    arrestFrames: 0, completed: false, maxAmplitude: INITIAL_ANGLE,
  });

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    // Fulcrum position (top center)
    const fulcrumX = 0.5;
    const fulcrumY = 0.28;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion); s.frameCount++;
      const time = s.frameCount * 0.012;
      const breath = p.breathAmplitude;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.reducedMotion || p.phase === 'resolve') {
        s.angle = 0; s.angVel = 0; s.completed = true; s.arrestFrames = ARREST_FRAMES + 1;
      }

      // ── Pendulum physics ────────────────────────────────
      const damp = s.holding ? FRICTION_DAMP : NATURAL_DAMP;
      s.angVel += -GRAVITY * Math.sin(s.angle) * ms;
      s.angVel *= damp;
      s.angle += s.angVel * ms;

      // Breath sway when near arrested
      const amplitude = Math.abs(s.angle);
      if (amplitude < ARREST_THRESHOLD * 3) {
        s.angle += Math.sin(time * 0.4) * BREATH_SWAY * breath * (1 - amplitude / (ARREST_THRESHOLD * 3));
      }

      s.maxAmplitude = Math.max(amplitude, s.maxAmplitude * 0.998);
      const arrestProgress = Math.max(0, 1 - amplitude / INITIAL_ANGLE);

      // Arrest detection
      if (amplitude < ARREST_THRESHOLD) s.arrestFrames += ms;
      else s.arrestFrames = Math.max(0, s.arrestFrames - 2);

      // Haptics
      if (s.holding && !s.holdNotified) { s.holdNotified = true; cb.onHaptic('hold_start'); }
      if (s.arrestFrames > ARREST_FRAMES * 0.5 && !s.thresholdNotified) {
        s.thresholdNotified = true; cb.onHaptic('hold_threshold');
      }
      if (s.arrestFrames > ARREST_FRAMES && !s.completed) {
        s.completed = true; cb.onHaptic('completion');
      }

      cb.onStateChange?.(s.completed ? 1 : arrestProgress * 0.95);

      // Pendulum positions
      const armLen = px(ARM_LENGTH, minDim);
      const fxPx = fulcrumX * w; const fyPx = fulcrumY * h;
      const weightX = fxPx + Math.sin(s.angle) * armLen;
      const weightY = fyPx + Math.cos(s.angle) * armLen;
      const wR = px(WEIGHT_R, minDim);
      const breathMod = 1 + breath * 0.05;

      // Extreme positions for interference sources
      const leftX = fxPx - Math.sin(INITIAL_ANGLE) * armLen;
      const leftY = fyPx + Math.cos(INITIAL_ANGLE) * armLen;
      const rightX = fxPx + Math.sin(INITIAL_ANGLE) * armLen;
      const rightY = fyPx + Math.cos(INITIAL_ANGLE) * armLen;

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Fulcrum glow field
      // ════════════════════════════════════════════════════
      for (let gi = GLOW_LAYERS - 1; gi >= 0; gi--) {
        const gR = px(GLOW.md * (0.2 + arrestProgress * 0.5 + gi * 0.1), minDim) * breathMod;
        const gA = ALPHA.glow.max * (0.01 + arrestProgress * 0.06) * entrance / (gi + 1);
        const gg = ctx.createRadialGradient(fxPx, fyPx, 0, fxPx, fyPx, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, gA));
        gg.addColorStop(0.3, rgba(s.primaryRgb, gA * 0.4));
        gg.addColorStop(0.7, rgba(s.primaryRgb, gA * 0.1));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(fxPx - gR, fyPx - gR, gR * 2, gR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Interference fringe field (SIGNATURE)
      // ════════════════════════════════════════════════════
      const lambda = px(FRINGE_LAMBDA, minDim);
      const fringeIntensity = arrestProgress;
      if (fringeIntensity > 0.1) {
        for (let ri = 0; ri < FRINGE_RINGS; ri++) {
          const t = ri / FRINGE_RINGS;
          const ringR = armLen * 0.15 + t * armLen * 0.9;
          const pts = 36;
          for (let pi = 0; pi < pts; pi++) {
            const pa = (pi / pts) * Math.PI * 2;
            const fpx = weightX + Math.cos(pa) * ringR;
            const fpy = weightY + Math.sin(pa) * ringR;
            // Interference from left and right extreme ghost positions
            const d1 = Math.hypot(fpx - leftX, fpy - leftY);
            const d2 = Math.hypot(fpx - rightX, fpy - rightY);
            const phaseDiff = ((d1 - d2) / lambda + time * 0.2) * Math.PI;
            const intensity = Math.pow(Math.cos(phaseDiff), 2);
            const fA = ALPHA.glow.max * 0.03 * intensity * fringeIntensity * entrance;
            if (fA < 0.001) continue;
            const dotR = px(0.002, minDim) * (0.4 + intensity * 0.8);
            ctx.beginPath(); ctx.arc(fpx, fpy, dotR, 0, Math.PI * 2);
            ctx.fillStyle = rgba(lerpColor(s.primaryRgb, s.accentRgb, intensity), fA);
            ctx.fill();
          }
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Pendulum arm shadow
      // ════════════════════════════════════════════════════
      ctx.beginPath();
      ctx.moveTo(fxPx + 2, fyPx + 3);
      ctx.lineTo(weightX + 2, weightY + 3);
      ctx.strokeStyle = rgba([0, 0, 0] as RGB, 0.04 * entrance);
      ctx.lineWidth = px(ARM_W * 1.5, minDim);
      ctx.lineCap = 'round'; ctx.stroke();

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Pendulum arm + fulcrum
      // ════════════════════════════════════════════════════
      // Arm gradient
      const armGrad = ctx.createLinearGradient(fxPx, fyPx, weightX, weightY);
      const armA = ALPHA.content.max * (0.12 + arrestProgress * 0.15) * entrance;
      armGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.25), armA));
      armGrad.addColorStop(0.5, rgba(s.primaryRgb, armA * 0.8));
      armGrad.addColorStop(1, rgba(s.primaryRgb, armA * 0.5));
      ctx.beginPath();
      ctx.moveTo(fxPx, fyPx);
      ctx.lineTo(weightX, weightY);
      ctx.strokeStyle = armGrad;
      ctx.lineWidth = px(ARM_W, minDim);
      ctx.lineCap = 'round'; ctx.stroke();

      // Fulcrum glass surface
      const fR = px(FULCRUM_R, minDim);
      const fGrad = ctx.createRadialGradient(fxPx - fR * 0.2, fyPx - fR * 0.2, fR * 0.1, fxPx, fyPx, fR);
      fGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.5), ALPHA.content.max * 0.35 * entrance));
      fGrad.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.content.max * 0.25 * entrance));
      fGrad.addColorStop(0.7, rgba(s.primaryRgb, ALPHA.content.max * 0.12 * entrance));
      fGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.05 * entrance));
      ctx.beginPath(); ctx.arc(fxPx, fyPx, fR, 0, Math.PI * 2);
      ctx.fillStyle = fGrad; ctx.fill();
      // Fulcrum specular
      ctx.beginPath();
      ctx.ellipse(fxPx - fR * 0.2, fyPx - fR * 0.25, fR * 0.35, fR * 0.18, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.2 * entrance);
      ctx.fill();
      // Holding indicator
      if (s.holding) {
        const holdR = fR * (2 + Math.sin(time * 2) * 0.3);
        const hg = ctx.createRadialGradient(fxPx, fyPx, fR, fxPx, fyPx, holdR);
        hg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.08 * entrance));
        hg.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = hg;
        ctx.fillRect(fxPx - holdR, fyPx - holdR, holdR * 2, holdR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Pendulum weight with specular
      // ════════════════════════════════════════════════════
      // Weight shadow
      const shadowR = wR * 2;
      const shadowGrad = ctx.createRadialGradient(weightX, weightY + wR * 0.3, 0, weightX, weightY + wR * 0.3, shadowR);
      shadowGrad.addColorStop(0, rgba([0, 0, 0] as RGB, 0.05 * entrance));
      shadowGrad.addColorStop(1, rgba([0, 0, 0] as RGB, 0));
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(weightX - shadowR, weightY - shadowR, shadowR * 2, shadowR * 2);

      // Weight body (5-stop gradient)
      const wGrad = ctx.createRadialGradient(
        weightX - wR * 0.2, weightY - wR * 0.2, wR * 0.05,
        weightX, weightY, wR,
      );
      const wA = ALPHA.content.max * (0.2 + arrestProgress * 0.25) * entrance;
      wGrad.addColorStop(0, rgba(lerpColor(s.accentRgb, [255, 255, 255] as RGB, 0.4), wA));
      wGrad.addColorStop(0.25, rgba(s.accentRgb, wA * 0.9));
      wGrad.addColorStop(0.5, rgba(s.accentRgb, wA * 0.7));
      wGrad.addColorStop(0.8, rgba(lerpColor(s.accentRgb, [0, 0, 0] as RGB, 0.1), wA * 0.4));
      wGrad.addColorStop(1, rgba(s.accentRgb, wA * 0.1));
      ctx.beginPath(); ctx.arc(weightX, weightY, wR, 0, Math.PI * 2);
      ctx.fillStyle = wGrad; ctx.fill();

      // Weight edge
      ctx.beginPath(); ctx.arc(weightX, weightY, wR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(lerpColor(s.accentRgb, [255, 255, 255] as RGB, 0.15), ALPHA.content.max * 0.06 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();

      // Weight specular
      ctx.beginPath();
      ctx.ellipse(weightX - wR * 0.2, weightY - wR * 0.3, wR * 0.3, wR * 0.15, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.2 * entrance);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(weightX + wR * 0.1, weightY + wR * 0.15, wR * 0.1, wR * 0.05, 0.4, 0, Math.PI * 2);
      ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.08 * entrance);
      ctx.fill();

      // ════════════════════════════════════════════════════
      // RENDER LAYER 6: Energy arc visualization
      // ════════════════════════════════════════════════════
      if (amplitude > ARREST_THRESHOLD * 2) {
        const arcAlpha = Math.min(1, amplitude / INITIAL_ANGLE) * 0.8;
        ctx.beginPath();
        for (let ai = 0; ai <= ENERGY_ARC_SEGS; ai++) {
          const t = ai / ENERGY_ARC_SEGS;
          const arcAngle = -s.maxAmplitude + t * s.maxAmplitude * 2;
          const arcX = fxPx + Math.sin(arcAngle) * armLen;
          const arcY = fyPx + Math.cos(arcAngle) * armLen;
          if (ai === 0) ctx.moveTo(arcX, arcY);
          else ctx.lineTo(arcX, arcY);
        }
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.04 * arcAlpha * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 7: Arrest standing-wave fringes
      // ════════════════════════════════════════════════════
      if (arrestProgress > 0.7) {
        const standingIntensity = (arrestProgress - 0.7) / 0.3;
        for (let si = 0; si < STANDING_WAVE_RINGS; si++) {
          const t = si / STANDING_WAVE_RINGS;
          const sr = armLen * (0.1 + t * 0.5);
          const standing = Math.pow(Math.cos(t * Math.PI * 3 + time * 0.5), 2);
          ctx.beginPath();
          ctx.arc(fxPx, fyPx + armLen * 0.5, sr, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(
            lerpColor(s.primaryRgb, [255, 255, 255] as RGB, standing * 0.3),
            ALPHA.glow.max * 0.025 * standing * standingIntensity * entrance,
          );
          ctx.lineWidth = px(STROKE.hairline, minDim) * (0.5 + standing);
          ctx.stroke();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 8: Progress ring
      // ════════════════════════════════════════════════════
      const ringR = px(PROGRESS_RING_R, minDim);
      ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.015 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
      const prog = s.completed ? 1 : Math.min(1, s.arrestFrames / ARREST_FRAMES);
      if (prog > 0.01) {
        ctx.beginPath(); ctx.arc(cx, cy, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke();
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    // ── Pointer handlers ──────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      if (Math.hypot(mx - fulcrumX, my - fulcrumY) < FULCRUM_HIT_R) {
        s.holding = true;
      }
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.holding = false;
      stateRef.current.holdNotified = false;
      canvas.releasePointerCapture(e.pointerId);
    };

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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
