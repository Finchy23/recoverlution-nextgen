/**
 * ATOM 249: THE WEIGHT OF OPPOSITES ENGINE
 * ==========================================
 * Series 25 — Dialectical Engine · Position 9
 *
 * A gyroscope weighted on one side crashes. You need your darkness to
 * balance your light. The physics of angular momentum teaches: only
 * perfect counterweight creates the humming blur of stability.
 *
 * SIGNATURE TECHNIQUE: Interference Fringes + Superposition
 *   - The spinning gyro ring emits wavefronts from its light and dark sides
 *   - Balanced spin → constructive interference creates a visible standing
 *     wave pattern around the gyro (beauty from balance)
 *   - Imbalanced → destructive interference (wobble + visual chaos)
 *   - At completion: full interference pattern forms a stable halo
 *   - Motion blur at high speed with directional smear
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + balance glow field
 *   2. Interference fringe halo (from light/dark sides)
 *   3. Gyro ring shadow
 *   4. Gyro ring body with thickness/depth gradient
 *   5. Light/dark weight indicators with specular
 *   6. Wobble-dependent atmospheric haze
 *   7. Motion blur at speed + stability glow
 *   8. Progress ring
 *
 * PHYSICS:
 *   - Gyroscope ring with angular momentum
 *   - Two weights (light/dark) on opposite sides
 *   - Drag to position dark weight; when counterbalanced → stable spin
 *   - Wobble amplitude from center-of-mass offset
 *   - Breath modulates spin speed subtly
 *
 * INTERACTION:
 *   Drag dark weight position → balance (drag_snap, error_boundary, completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Balanced gyro with stable fringe halo, static
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

/** Gyro ring radius */
const GYRO_R = SIZE.lg * 0.38;
/** Ring thickness (viewport fraction) */
const RING_THICKNESS = 0.018;
/** Weight indicator radius */
const WEIGHT_R = 0.022;
/** Light weight fixed position (radians, top) */
const LIGHT_POS = -Math.PI / 2;
/** Spin speed (radians/frame) */
const SPIN_SPEED = 0.06;
/** Balance threshold (radians from opposite) */
const BALANCE_THRESHOLD = 0.15;
/** Frames balanced for completion */
const BALANCE_FRAMES = 80;
/** Wobble amplitude from imbalance */
const WOBBLE_K = 0.08;
/** Wobble damping */
const WOBBLE_DAMP = 0.95;
/** Glow layers */
const GLOW_LAYERS = 5;
/** Fringe ring count in halo */
const FRINGE_RINGS = 16;
/** Fringe wavelength */
const FRINGE_LAMBDA = 0.015;
/** Motion blur sample count */
const MOTION_BLUR_SAMPLES = 5;
/** Progress ring radius */
const PROGRESS_RING_R = SIZE.md * 0.85;
/** Breath spin modulation */
const BREATH_SPIN_MOD = 0.01;
/** Haze layers for wobble */
const HAZE_LAYERS = 3;
/** Stability aura layers when balanced */
const STABILITY_AURA_LAYERS = 4;
/** Fresnel rim highlight offset */
const FRESNEL_RIM_OFFSET = 0.002;
/** Completion bloom expansion */
const BLOOM_EXPANSION = 1.8;
/** Subsurface scatter intensity */
const SUBSURFACE_INTENSITY = 0.12;

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function WeightOfOppositesAtom({
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
    darkPos: Math.PI / 4, // dark weight angular position (relative, draggable)
    spinAngle: 0, wobbleX: 0, wobbleY: 0, wobbleVx: 0, wobbleVy: 0,
    dragging: false, dragNotified: false, errorNotified: false,
    balanceFrames: 0, completed: false,
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
      const ms = motionScale(p.reducedMotion); s.frameCount++;
      const time = s.frameCount * 0.012;
      const breath = p.breathAmplitude;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.reducedMotion || p.phase === 'resolve') {
        s.darkPos = LIGHT_POS + Math.PI; s.completed = true; s.balanceFrames = BALANCE_FRAMES + 1;
        s.wobbleX = 0; s.wobbleY = 0;
      }

      // ── Physics ────────────────────────────────────────────
      s.spinAngle += (SPIN_SPEED + Math.sin(time * 0.3) * BREATH_SPIN_MOD * breath) * ms;

      // Imbalance: how far is dark from being opposite light?
      const idealDark = LIGHT_POS + Math.PI;
      let angleDiff = s.darkPos - idealDark;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      const imbalance = Math.abs(angleDiff) / Math.PI; // 0=balanced, 1=max
      const balance = 1 - imbalance;

      // Wobble from imbalance
      const wobbleForceAngle = s.spinAngle + s.darkPos;
      s.wobbleVx += Math.cos(wobbleForceAngle) * WOBBLE_K * imbalance * ms;
      s.wobbleVy += Math.sin(wobbleForceAngle) * WOBBLE_K * imbalance * ms;
      s.wobbleVx *= WOBBLE_DAMP; s.wobbleVy *= WOBBLE_DAMP;
      s.wobbleX += s.wobbleVx * ms; s.wobbleY += s.wobbleVy * ms;
      s.wobbleX *= 0.98; s.wobbleY *= 0.98;

      // Balance tracking
      if (balance > 0.9) s.balanceFrames += ms;
      else s.balanceFrames = Math.max(0, s.balanceFrames - 2);

      // Haptics
      if (imbalance > 0.7 && !s.errorNotified) {
        s.errorNotified = true; cb.onHaptic('error_boundary');
        setTimeout(() => { stateRef.current.errorNotified = false; }, 800);
      }
      if (s.balanceFrames > BALANCE_FRAMES && !s.completed) {
        s.completed = true; cb.onHaptic('completion');
      }
      cb.onStateChange?.(s.completed ? 1 : balance * 0.95);

      const gyroCx = cx + s.wobbleX * minDim;
      const gyroCy = cy + s.wobbleY * minDim;
      const rPx = px(GYRO_R, minDim);
      const breathMod = 1 + breath * 0.03;

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Balance glow field
      // ════════════════════════════════════════════════════
      for (let gi = GLOW_LAYERS - 1; gi >= 0; gi--) {
        const gR = px(GLOW.md * (0.2 + balance * 0.5 + gi * 0.1), minDim) * breathMod;
        const gA = ALPHA.glow.max * (0.01 + balance * 0.06) * entrance / (gi + 1);
        const gg = ctx.createRadialGradient(gyroCx, gyroCy, 0, gyroCx, gyroCy, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, gA));
        gg.addColorStop(0.3, rgba(s.primaryRgb, gA * 0.4));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg; ctx.fillRect(gyroCx - gR, gyroCy - gR, gR * 2, gR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Interference fringe halo (SIGNATURE)
      // ════════════════════════════════════════════════════
      if (balance > 0.3) {
        const fringeIntensity = (balance - 0.3) / 0.7;
        const lambda = px(FRINGE_LAMBDA, minDim);
        // Light and dark sides as wave sources
        const lightAngle = s.spinAngle + LIGHT_POS;
        const darkAngle = s.spinAngle + s.darkPos;
        const src1x = gyroCx + Math.cos(lightAngle) * rPx;
        const src1y = gyroCy + Math.sin(lightAngle) * rPx;
        const src2x = gyroCx + Math.cos(darkAngle) * rPx;
        const src2y = gyroCy + Math.sin(darkAngle) * rPx;

        for (let ri = 0; ri < FRINGE_RINGS; ri++) {
          const t = ri / FRINGE_RINGS;
          const fR = rPx * (0.6 + t * 1.2);
          const pts = 32;
          for (let pi = 0; pi < pts; pi++) {
            const pa = (pi / pts) * Math.PI * 2;
            const fpx = gyroCx + Math.cos(pa) * fR;
            const fpy = gyroCy + Math.sin(pa) * fR;
            const d1 = Math.hypot(fpx - src1x, fpy - src1y);
            const d2 = Math.hypot(fpx - src2x, fpy - src2y);
            const phaseDiff = ((d1 - d2) / lambda + time * 0.2) * Math.PI;
            const intensity = Math.pow(Math.cos(phaseDiff), 2);
            const fA = ALPHA.glow.max * 0.025 * intensity * fringeIntensity * entrance;
            if (fA < 0.001) continue;
            const dotR = px(0.002, minDim) * (0.4 + intensity * 0.6);
            ctx.beginPath(); ctx.arc(fpx, fpy, dotR, 0, Math.PI * 2);
            ctx.fillStyle = rgba(lerpColor(s.primaryRgb, s.accentRgb, intensity), fA);
            ctx.fill();
          }
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Gyro ring shadow
      // ════════════════════════════════════════════════════
      ctx.beginPath();
      ctx.arc(gyroCx + 2, gyroCy + 3, rPx, 0, Math.PI * 2);
      ctx.strokeStyle = rgba([0, 0, 0] as RGB, 0.04 * entrance);
      ctx.lineWidth = px(RING_THICKNESS * 1.3, minDim);
      ctx.stroke();

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Gyro ring body
      // ════════════════════════════════════════════════════
      // Motion blur: draw multiple faded copies for speed effect
      const blurCount = balance > 0.7 ? MOTION_BLUR_SAMPLES : 1;
      for (let bi = 0; bi < blurCount; bi++) {
        const blurAngle = s.spinAngle - bi * SPIN_SPEED * 0.8;
        const blurAlpha = 1 / (bi + 1);
        // Ring with gradient showing light/dark distribution
        const ringW = px(RING_THICKNESS, minDim);
        for (let ai = 0; ai < 36; ai++) {
          const a0 = blurAngle + (ai / 36) * Math.PI * 2;
          const a1 = a0 + Math.PI * 2 / 36 + 0.02;
          // Side coloring: gradient from light to dark around ring
          const sideAngle = a0 - s.spinAngle;
          const lightDist = Math.abs(Math.cos((sideAngle - LIGHT_POS) / 2));
          const segColor = lerpColor(s.accentRgb, s.primaryRgb, lightDist);
          const segA = ALPHA.content.max * (0.08 + balance * 0.15) * entrance * blurAlpha;
          ctx.beginPath();
          ctx.arc(gyroCx, gyroCy, rPx, a0, a1);
          ctx.strokeStyle = rgba(segColor, segA);
          ctx.lineWidth = ringW;
          ctx.stroke();
        }
      }

      // Ring edge highlight
      ctx.beginPath(); ctx.arc(gyroCx, gyroCy, rPx + px(RING_THICKNESS * 0.5, minDim), 0, Math.PI * 2);
      ctx.strokeStyle = rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.2), ALPHA.content.max * 0.03 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Weight indicators with specular
      // ════════════════════════════════════════════════════
      const weights = [
        { angle: s.spinAngle + LIGHT_POS, rgb: lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3), label: 'light' },
        { angle: s.spinAngle + s.darkPos, rgb: lerpColor(s.accentRgb, [0, 0, 0] as RGB, 0.2), label: 'dark' },
      ];
      for (const wt of weights) {
        const wx = gyroCx + Math.cos(wt.angle) * rPx;
        const wy = gyroCy + Math.sin(wt.angle) * rPx;
        const wtR = px(WEIGHT_R, minDim);
        // Glow
        const wgR = wtR * 3;
        const wg = ctx.createRadialGradient(wx, wy, 0, wx, wy, wgR);
        wg.addColorStop(0, rgba(wt.rgb, ALPHA.glow.max * 0.06 * entrance));
        wg.addColorStop(1, rgba(wt.rgb, 0));
        ctx.fillStyle = wg; ctx.fillRect(wx - wgR, wy - wgR, wgR * 2, wgR * 2);
        // Body
        const wGrad = ctx.createRadialGradient(wx - wtR * 0.2, wy - wtR * 0.2, wtR * 0.05, wx, wy, wtR);
        const wA = ALPHA.content.max * 0.35 * entrance;
        wGrad.addColorStop(0, rgba(lerpColor(wt.rgb, [255, 255, 255] as RGB, 0.35), wA));
        wGrad.addColorStop(0.4, rgba(wt.rgb, wA * 0.85));
        wGrad.addColorStop(0.8, rgba(wt.rgb, wA * 0.5));
        wGrad.addColorStop(1, rgba(wt.rgb, wA * 0.15));
        ctx.beginPath(); ctx.arc(wx, wy, wtR, 0, Math.PI * 2);
        ctx.fillStyle = wGrad; ctx.fill();
        // Specular
        ctx.beginPath();
        ctx.ellipse(wx - wtR * 0.2, wy - wtR * 0.3, wtR * 0.3, wtR * 0.15, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.18 * entrance); ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 6: Wobble-dependent atmospheric haze
      // ════════════════════════════════════════════════════
      if (imbalance > 0.2) {
        const hazeIntensity = (imbalance - 0.2) / 0.8;
        for (let hi = 0; hi < HAZE_LAYERS; hi++) {
          const hazeAngle = s.spinAngle * 2 + hi * Math.PI * 2 / HAZE_LAYERS;
          const hx = gyroCx + Math.cos(hazeAngle) * rPx * 0.3 * hazeIntensity;
          const hy = gyroCy + Math.sin(hazeAngle) * rPx * 0.3 * hazeIntensity;
          const hR = rPx * 0.8;
          const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, hR);
          hg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.02 * hazeIntensity * entrance));
          hg.addColorStop(1, rgba(s.accentRgb, 0));
          ctx.fillStyle = hg; ctx.fillRect(hx - hR, hy - hR, hR * 2, hR * 2);
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 6b: Stability aura (balanced state)
      // ════════════════════════════════════════════════════
      if (balance > 0.7) {
        const auraIntensity = (balance - 0.7) / 0.3;
        for (let ai = 0; ai < STABILITY_AURA_LAYERS; ai++) {
          const auraR = rPx * (1.3 + ai * 0.25) * (1 + breath * 0.04);
          const auraA = ALPHA.glow.max * 0.03 * auraIntensity * entrance / (ai + 1);
          const aura = ctx.createRadialGradient(gyroCx, gyroCy, rPx * 0.8, gyroCx, gyroCy, auraR);
          aura.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.15), auraA));
          aura.addColorStop(0.3, rgba(s.primaryRgb, auraA * 0.6));
          aura.addColorStop(0.7, rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.3), auraA * 0.2));
          aura.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = aura; ctx.fillRect(gyroCx - auraR, gyroCy - auraR, auraR * 2, auraR * 2);
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 7: Fresnel rim + completion bloom
      // ════════════════════════════════════════════════════
      // Fresnel inner + outer rim highlights on ring
      const innerRimR = rPx - px(RING_THICKNESS * 0.5, minDim);
      const outerRimR = rPx + px(RING_THICKNESS * 0.5, minDim);
      for (const rimR of [innerRimR, outerRimR]) {
        ctx.beginPath(); ctx.arc(gyroCx, gyroCy, rimR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(
          lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.35),
          ALPHA.content.max * 0.025 * entrance * (0.6 + balance * 0.4)
        );
        ctx.lineWidth = px(FRESNEL_RIM_OFFSET, minDim);
        ctx.stroke();
      }

      // Completion bloom
      if (s.completed) {
        const bloomPhase = Math.min(1, (s.balanceFrames - BALANCE_FRAMES) / 40);
        const bloomR = rPx * BLOOM_EXPANSION * (1 + bloomPhase * 0.3);
        const bloomA = ALPHA.glow.max * 0.06 * bloomPhase * entrance;
        const bloom = ctx.createRadialGradient(gyroCx, gyroCy, rPx * 0.3, gyroCx, gyroCy, bloomR);
        bloom.addColorStop(0, rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.5), bloomA));
        bloom.addColorStop(0.3, rgba(s.primaryRgb, bloomA * 0.5));
        bloom.addColorStop(0.6, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.1), bloomA * 0.2));
        bloom.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = bloom; ctx.fillRect(gyroCx - bloomR, gyroCy - bloomR, bloomR * 2, bloomR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 8: Progress ring
      // ════════════════════════════════════════════════════
      const ringR = px(PROGRESS_RING_R, minDim);
      ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.015 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
      const prog = s.completed ? 1 : Math.min(1, s.balanceFrames / BALANCE_FRAMES);
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
      stateRef.current.dragging = true;
      if (!stateRef.current.dragNotified) {
        stateRef.current.dragNotified = true;
        callbacksRef.current.onHaptic('drag_snap');
      }
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      // Map pointer angle to dark weight position (relative to spin)
      const pointerAngle = Math.atan2(my, mx);
      s.darkPos = pointerAngle - s.spinAngle;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ew-resize' }} />
    </div>
  );
}