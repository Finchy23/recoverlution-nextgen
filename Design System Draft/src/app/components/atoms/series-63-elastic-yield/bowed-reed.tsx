/**
 * ATOM 622: THE BOWED REED ENGINE
 * =================================
 * Series 63 — Elastic Yield · Position 2
 *
 * Prove humility survives the hurricane. The rigid oak snaps in half.
 * Switch to the flexible reed — it bows flat against the floor then
 * naturally stands right back up when the storm passes.
 *
 * SIGNATURE TECHNIQUE: Stress Tensor Visualization
 *   - Oak trunk shows stress concentration at snap point (red hot zone)
 *   - When stress exceeds yield → fracture with visible stress release
 *   - Reed shows distributed stress along its entire length (cool gradient)
 *   - Bowing reed displays stress flowing smoothly downward (no concentration)
 *   - Recovery shows stress dissipating from tip to root
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + storm sky gradient
 *   2. Wind field visualization (stress lines)
 *   3. Ground plane with stress reflection
 *   4. Tree/reed body with per-segment stress coloring
 *   5. Stress tensor force arrows (wind direction indicators)
 *   6. Crown/tip with specular + stress glow
 *   7. Fracture particles / recovery bloom
 *   8. Progress ring
 *
 * PHYSICS:
 *   - Hurricane wind builds gradually (0→1)
 *   - Oak: rigid → stress concentrates at midpoint → snaps
 *   - Reed: flexible → stress distributes evenly → survives
 *   - Tap to switch from oak to reed before/after snap
 *   - Breath modulates reed tip glow + wind particle drift
 *
 * INTERACTION:
 *   Tap → switch oak→reed (tap, error_boundary, step_advance, completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static reed standing with calm stress gradient
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, GLOW, FONT_SIZE, motionScale, type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// STRESS HELPERS
// ═════════════════════════════════════════════════════════════════════

/** Map stress (0–1) to heat color for material visualization */
function stressHeat(stress: number, cool: RGB, hot: RGB): RGB {
  if (stress < 0.4) return lerpColor(cool, [100, 200, 160] as RGB, stress / 0.4);
  if (stress < 0.7) return lerpColor([100, 200, 160] as RGB, [220, 180, 60] as RGB, (stress - 0.4) / 0.3);
  return lerpColor([220, 180, 60] as RGB, hot, (stress - 0.7) / 0.3);
}

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Tree/reed height */
const PLANT_H = SIZE.lg * 0.65;
/** Oak trunk width */
const OAK_W = 0.008;
/** Reed width */
const REED_W = 0.003;
/** Wind build rate per frame */
const WIND_BUILD_RATE = 0.003;
/** Wind decay rate after storm */
const WIND_DECAY_RATE = 0.005;
/** Oak snap threshold */
const OAK_SNAP_THRESHOLD = 0.7;
/** Reed bow rate (follows wind) */
const REED_BOW_K = 1.2;
/** Reed recovery rate */
const REED_RECOVERY_RATE = 0.008;
/** Ground Y position fraction */
const GROUND_Y_FRAC = 0.78;
/** Wind particle count max */
const WIND_PARTICLE_MAX = 60;
/** Wind streak length multiplier */
const WIND_STREAK_LEN = 0.035;
/** Storm pass delay ms */
const STORM_PASS_DELAY = 1200;
/** Crown radius */
const CROWN_R = 0.035;
/** Stress arrow count */
const STRESS_ARROW_COUNT = 8;
/** Reed segments for rendering */
const REED_SEGMENTS = 24;
/** Fracture fragment count */
const FRACTURE_FRAGMENTS = 20;
/** Fragment lifetime */
const FRAGMENT_LIFE = 55;
/** Progress ring radius */
const PROGRESS_RING_R = SIZE.md * 0.85;
/** Respawn delay */
const RESPAWN_DELAY = 100;
/** Storm sky glow layers */
const SKY_GLOW_LAYERS = 3;
/** Breath tip glow mod */
const BREATH_TIP_MOD = 0.12;

// ═════════════════════════════════════════════════════════════════════
// STATE
// ═════════════════════════════════════════════════════════════════════

interface FractureFrag {
  x: number; y: number; vx: number; vy: number;
  len: number; angle: number; rotV: number; life: number;
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function BowedReedAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    mode: 'oak' as 'oak' | 'reed',
    windForce: 0,
    oakSnapped: false,
    reedBow: 0,
    stormPassed: false,
    reedRecovery: 0,
    completed: false,
    respawnTimer: 0,
    fragments: [] as FractureFrag[],
    stormPassTimeout: 0 as number,
    stepNotified: false,
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
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const breath = p.breathAmplitude; s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Atmosphere + storm sky gradient
      // ════════════════════════════════════════════════════
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      // Storm sky darkening
      if (s.windForce > 0.1) {
        for (let si = 0; si < SKY_GLOW_LAYERS; si++) {
          const stormR = Math.max(w, h) * (0.5 + si * 0.3);
          const stormA = s.windForce * 0.02 * entrance / (si + 1);
          const sg = ctx.createRadialGradient(w * 0.3, h * 0.2, 0, w * 0.3, h * 0.2, stormR);
          sg.addColorStop(0, rgba(s.accentRgb, stormA));
          sg.addColorStop(0.4, rgba(lerpColor(s.accentRgb, [20, 15, 30] as RGB, 0.5), stormA * 0.5));
          sg.addColorStop(1, rgba([20, 15, 30] as RGB, 0));
          ctx.fillStyle = sg; ctx.fillRect(0, 0, w, h);
        }
      }

      const groundY = h * GROUND_Y_FRAC;
      const treeH = px(PLANT_H, minDim);

      // ── Reduced motion fallback ─────────────────────────
      if (p.reducedMotion) {
        // Static reed standing with gentle stress gradient
        for (let i = 0; i < REED_SEGMENTS; i++) {
          const t0 = i / REED_SEGMENTS; const t1 = (i + 1) / REED_SEGMENTS;
          const y0 = groundY - t0 * treeH; const y1 = groundY - t1 * treeH;
          const stress = t0 * 0.2; // very low stress = calm
          const sc = stressHeat(stress, s.primaryRgb, s.accentRgb);
          ctx.beginPath(); ctx.moveTo(cx, y0); ctx.lineTo(cx, y1);
          ctx.strokeStyle = rgba(sc, ALPHA.content.max * 0.25 * entrance);
          ctx.lineWidth = px(REED_W, minDim); ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(cx, groundY - treeH, px(0.005, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.fill();
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      // ── Wind physics ───────────────────────────────────
      if (!s.completed) {
        if (!s.stormPassed) {
          s.windForce = Math.min(1, s.windForce + WIND_BUILD_RATE);

          if (s.mode === 'oak' && s.windForce > OAK_SNAP_THRESHOLD && !s.oakSnapped) {
            s.oakSnapped = true;
            cb.onHaptic('error_boundary');
            // Generate fracture fragments
            const snapY = groundY - treeH * 0.5;
            for (let i = 0; i < FRACTURE_FRAGMENTS; i++) {
              s.fragments.push({
                x: cx + (Math.random() - 0.3) * minDim * 0.03,
                y: snapY + (Math.random() - 0.5) * treeH * 0.2,
                vx: 1 + Math.random() * 3,
                vy: -1 + Math.random() * 2,
                len: minDim * (0.005 + Math.random() * 0.02),
                angle: Math.random() * Math.PI * 2,
                rotV: (Math.random() - 0.5) * 0.2,
                life: FRAGMENT_LIFE,
              });
            }
          }

          if (s.mode === 'reed') {
            s.reedBow = Math.min(1, s.windForce * REED_BOW_K);
            if (!s.stepNotified && s.reedBow > 0.5) {
              s.stepNotified = true;
              cb.onHaptic('step_advance');
            }
          }

          if (s.windForce >= 1 && !s.stormPassTimeout) {
            s.stormPassTimeout = window.setTimeout(() => {
              stateRef.current.stormPassed = true;
              stateRef.current.stormPassTimeout = 0;
            }, STORM_PASS_DELAY);
          }
        } else {
          s.windForce = Math.max(0, s.windForce - WIND_DECAY_RATE);
          if (s.mode === 'reed') {
            s.reedBow = Math.max(0, s.reedBow - REED_RECOVERY_RATE);
            s.reedRecovery = 1 - s.reedBow;
            if (s.reedBow <= 0.03 && !s.completed) {
              s.completed = true;
              cb.onHaptic('completion');
              cb.onStateChange?.(1);
              s.respawnTimer = RESPAWN_DELAY;
            }
          }
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Wind field stress lines
      // ════════════════════════════════════════════════════
      if (s.windForce > 0.05 && ms > 0) {
        const pCount = Math.floor(s.windForce * WIND_PARTICLE_MAX);
        for (let i = 0; i < pCount; i++) {
          const seed = (s.frameCount * 2.7 + i * 137.5) % 1;
          const px2 = ((s.frameCount * 3 + i * 137) % (w + 200)) - 100;
          const py = h * 0.1 + ((i * 97 + s.frameCount * 0.5) % (h * 0.65));
          const len = minDim * WIND_STREAK_LEN * s.windForce * (0.5 + seed * 0.5);
          // Wind stress color (stronger = hotter)
          const wStress = s.windForce * (0.3 + seed * 0.4);
          const wc = stressHeat(wStress, s.primaryRgb, s.accentRgb);
          ctx.beginPath();
          ctx.moveTo(px2, py);
          ctx.lineTo(px2 + len, py + len * 0.08 * Math.sin(py * 0.01));
          ctx.strokeStyle = rgba(wc, ALPHA.atmosphere.min * s.windForce * 0.6 * entrance);
          ctx.lineWidth = px(0.001 + wStress * 0.001, minDim);
          ctx.stroke();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Ground plane with stress reflection
      // ════════════════════════════════════════════════════
      ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(w, groundY);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 1.5 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();

      // Ground stress glow where tree meets ground
      const groundGlowR = px(0.04, minDim);
      const gg = ctx.createRadialGradient(cx, groundY, 0, cx, groundY, groundGlowR);
      const groundStress = s.mode === 'oak' ? s.windForce * 0.8 : s.windForce * 0.3;
      const gsc = stressHeat(groundStress, s.primaryRgb, s.accentRgb);
      gg.addColorStop(0, rgba(gsc, ALPHA.glow.max * 0.04 * groundStress * entrance));
      gg.addColorStop(1, rgba(gsc, 0));
      ctx.fillStyle = gg; ctx.fillRect(cx - groundGlowR, groundY - groundGlowR * 0.5, groundGlowR * 2, groundGlowR);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Tree/reed with stress tensor coloring
      // ════════════════════════════════════════════════════
      if (s.mode === 'oak') {
        if (s.oakSnapped) {
          // ── Snapped oak: two halves with stress at snap point ──
          const snapY = groundY - treeH * 0.5;
          const snapStress = 1.0; // max stress at fracture
          const snapColor = stressHeat(snapStress, s.primaryRgb, s.accentRgb);

          // Lower half (rooted)
          for (let i = 0; i < 8; i++) {
            const t0 = i / 8; const t1 = (i + 1) / 8;
            const y0 = groundY - t0 * treeH * 0.5;
            const y1 = groundY - t1 * treeH * 0.5;
            const segStress = t1 * 0.5 + 0.4; // increases toward snap
            const sc = stressHeat(segStress, s.primaryRgb, s.accentRgb);
            ctx.beginPath(); ctx.moveTo(cx, y0); ctx.lineTo(cx, y1);
            ctx.strokeStyle = rgba(sc, ALPHA.content.max * 0.4 * entrance);
            ctx.lineWidth = px(OAK_W * (1 - t0 * 0.3), minDim);
            ctx.stroke();
          }
          // Snap point glow
          const spGR = px(0.025, minDim);
          const spG = ctx.createRadialGradient(cx, snapY, 0, cx, snapY, spGR);
          spG.addColorStop(0, rgba(snapColor, ALPHA.glow.max * 0.1 * entrance));
          spG.addColorStop(0.5, rgba(snapColor, ALPHA.glow.max * 0.03 * entrance));
          spG.addColorStop(1, rgba(snapColor, 0));
          ctx.fillStyle = spG; ctx.fillRect(cx - spGR, snapY - spGR, spGR * 2, spGR * 2);

          // Upper half (fallen)
          const fallAngle = Math.min(1, (s.frameCount % 200) / 30) * Math.PI * 0.35;
          const endX = cx + Math.sin(fallAngle) * treeH * 0.4;
          const endY = snapY - Math.cos(fallAngle) * treeH * 0.4;
          ctx.beginPath(); ctx.moveTo(cx, snapY); ctx.lineTo(endX, endY);
          ctx.strokeStyle = rgba(stressHeat(0.6, s.primaryRgb, s.accentRgb), ALPHA.content.max * 0.3 * entrance);
          ctx.lineWidth = px(OAK_W * 0.7, minDim); ctx.stroke();

          // Fallen crown
          const crR = px(CROWN_R * 0.8, minDim);
          ctx.beginPath(); ctx.arc(endX, endY, crR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.15 * entrance);
          ctx.fill();
        } else {
          // ── Standing oak (bending under wind) ──────────
          const bend = s.windForce * minDim * 0.04;
          const segments = 12;
          for (let i = 0; i < segments; i++) {
            const t0 = i / segments; const t1 = (i + 1) / segments;
            const x0 = cx + bend * t0 * t0;
            const y0 = groundY - t0 * treeH;
            const x1 = cx + bend * t1 * t1;
            const y1 = groundY - t1 * treeH;
            // Stress concentrates at mid-trunk under wind
            const segStress = s.windForce * Math.sin(t0 * Math.PI) * 0.9;
            const sc = stressHeat(segStress, s.primaryRgb, s.accentRgb);
            ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
            ctx.strokeStyle = rgba(sc, ALPHA.content.max * (0.2 + segStress * 0.3) * entrance);
            ctx.lineWidth = px(OAK_W * (1 - t0 * 0.4), minDim);
            ctx.stroke();
          }
          // Crown
          const crownX = cx + bend; const crownY = groundY - treeH;
          const crR = px(CROWN_R, minDim);
          const crGrad = ctx.createRadialGradient(crownX - crR * 0.2, crownY - crR * 0.2, crR * 0.05, crownX, crownY, crR);
          crGrad.addColorStop(0, rgba(lerpColor(s.accentRgb, [255, 255, 255] as RGB, 0.2), ALPHA.content.max * 0.3 * entrance));
          crGrad.addColorStop(0.5, rgba(s.accentRgb, ALPHA.content.max * 0.25 * entrance));
          crGrad.addColorStop(1, rgba(s.accentRgb, ALPHA.content.max * 0.05 * entrance));
          ctx.beginPath(); ctx.arc(crownX, crownY, crR, 0, Math.PI * 2);
          ctx.fillStyle = crGrad; ctx.fill();
          // Specular on crown
          ctx.beginPath();
          ctx.ellipse(crownX - crR * 0.2, crownY - crR * 0.25, crR * 0.25, crR * 0.12, -0.3, 0, Math.PI * 2);
          ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.15 * entrance); ctx.fill();
        }
      } else {
        // ── Reed with distributed stress ───────────────
        const bowAngle = s.reedBow * Math.PI * 0.45;
        for (let i = 0; i < REED_SEGMENTS; i++) {
          const t0 = i / REED_SEGMENTS; const t1 = (i + 1) / REED_SEGMENTS;
          const angle0 = bowAngle * t0 * t0; // quadratic bow curve
          const angle1 = bowAngle * t1 * t1;
          const len0 = treeH * t0; const len1 = treeH * t1;
          const x0 = cx + Math.sin(angle0) * len0;
          const y0 = groundY - Math.cos(angle0) * len0;
          const x1 = cx + Math.sin(angle1) * len1;
          const y1 = groundY - Math.cos(angle1) * len1;

          // Distributed stress (lower at root, higher at mid, drops at tip)
          const segStress = s.windForce * Math.sin(t0 * Math.PI * 0.8) * 0.5;
          const sc = stressHeat(segStress, s.primaryRgb, s.accentRgb);

          ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
          ctx.strokeStyle = rgba(sc, ALPHA.content.max * (0.15 + segStress * 0.2) * entrance);
          ctx.lineWidth = px(REED_W * (1.2 - t0 * 0.6), minDim);
          ctx.stroke();

          // Subtle glow on stressed segments
          if (segStress > 0.2) {
            ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
            ctx.strokeStyle = rgba(sc, ALPHA.glow.max * 0.03 * segStress * entrance);
            ctx.lineWidth = px(REED_W * 4, minDim);
            ctx.stroke();
          }
        }
        // Tip glow
        const tipAngle = bowAngle;
        const tipX = cx + Math.sin(tipAngle) * treeH;
        const tipY = groundY - Math.cos(tipAngle) * treeH;
        const tipR = px(0.006, minDim) * (1 + breath * BREATH_TIP_MOD);
        const tipGlowR = tipR * 4;
        const tg = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, tipGlowR);
        tg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.06 * entrance));
        tg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.02 * entrance));
        tg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = tg; ctx.fillRect(tipX - tipGlowR, tipY - tipGlowR, tipGlowR * 2, tipGlowR * 2);
        ctx.beginPath(); ctx.arc(tipX, tipY, tipR, 0, Math.PI * 2);
        const tipGrad = ctx.createRadialGradient(tipX - tipR * 0.2, tipY - tipR * 0.2, tipR * 0.1, tipX, tipY, tipR);
        tipGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.4), ALPHA.content.max * 0.4 * entrance));
        tipGrad.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance));
        tipGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.1 * entrance));
        ctx.fillStyle = tipGrad; ctx.fill();
        // Tip specular
        ctx.beginPath();
        ctx.ellipse(tipX - tipR * 0.2, tipY - tipR * 0.25, tipR * 0.3, tipR * 0.15, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.2 * entrance); ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Stress tensor force arrows
      // ════════════════════════════════════════════════════
      if (s.windForce > 0.2) {
        for (let ai = 0; ai < STRESS_ARROW_COUNT; ai++) {
          const t = (ai + 0.5) / STRESS_ARROW_COUNT;
          const arrowY = groundY - t * treeH * 0.8;
          const arrowX = cx - minDim * 0.06;
          const arrowLen = minDim * 0.015 * s.windForce;
          const arrowStress = s.windForce * Math.sin(t * Math.PI) * 0.6;
          const ac = stressHeat(arrowStress, s.primaryRgb, s.accentRgb);
          const arrowAlpha = ALPHA.content.max * 0.08 * s.windForce * entrance;
          ctx.beginPath();
          ctx.moveTo(arrowX, arrowY);
          ctx.lineTo(arrowX + arrowLen, arrowY);
          ctx.strokeStyle = rgba(ac, arrowAlpha);
          ctx.lineWidth = px(STROKE.thin, minDim); ctx.stroke();
          // Arrow head
          ctx.beginPath();
          ctx.moveTo(arrowX + arrowLen, arrowY);
          ctx.lineTo(arrowX + arrowLen - 3, arrowY - 2);
          ctx.lineTo(arrowX + arrowLen - 3, arrowY + 2);
          ctx.closePath();
          ctx.fillStyle = rgba(ac, arrowAlpha); ctx.fill();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 7: Fracture particles / recovery bloom
      // ════════════════════════════════════════════════════
      // Fracture fragments
      for (const f of s.fragments) {
        f.x += f.vx * ms; f.y += f.vy * ms;
        f.vy += 0.06; f.angle += f.rotV * ms; f.life--;
        const fAlpha = (f.life / FRAGMENT_LIFE) * ALPHA.content.max * 0.3 * entrance;
        const fStress = 0.6 + (1 - f.life / FRAGMENT_LIFE) * 0.4;
        const fc = stressHeat(fStress, s.primaryRgb, s.accentRgb);
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.angle);
        ctx.beginPath(); ctx.moveTo(-f.len / 2, 0); ctx.lineTo(f.len / 2, 0);
        ctx.strokeStyle = rgba(fc, fAlpha);
        ctx.lineWidth = px(STROKE.thin, minDim); ctx.stroke();
        ctx.restore();
      }
      s.fragments = s.fragments.filter(f => f.life > 0);

      // Recovery bloom when reed stands back up
      if (s.reedRecovery > 0.8 && s.mode === 'reed') {
        const bloomIntensity = (s.reedRecovery - 0.8) / 0.2;
        const bloomR = px(GLOW.md * 0.3, minDim);
        const bloom = ctx.createRadialGradient(cx, groundY - treeH * 0.7, 0, cx, groundY - treeH * 0.7, bloomR);
        bloom.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.2), ALPHA.glow.max * 0.06 * bloomIntensity * entrance));
        bloom.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.02 * bloomIntensity * entrance));
        bloom.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = bloom;
        ctx.fillRect(cx - bloomR, groundY - treeH * 0.7 - bloomR, bloomR * 2, bloomR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 8: Progress ring
      // ════════════════════════════════════════════════════
      const ringR = px(PROGRESS_RING_R, minDim);
      ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.015 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
      const prog = s.completed ? 1 : s.mode === 'reed' ?
        (s.stormPassed ? 0.5 + s.reedRecovery * 0.5 : s.windForce * 0.3 + 0.2) :
        s.windForce * 0.15;
      if (prog > 0.01) {
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke();
      }

      // ── Respawn ────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.mode = 'oak'; s.windForce = 0; s.oakSnapped = false;
          s.reedBow = 0; s.stormPassed = false; s.reedRecovery = 0;
          s.completed = false; s.fragments = []; s.stepNotified = false;
        }
      }

      cb.onStateChange?.(s.completed ? 1 : prog);
      ctx.restore(); animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handler ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.mode === 'oak' && !s.completed) {
        s.mode = 'reed';
        s.oakSnapped = false;
        s.windForce = Math.max(s.windForce, 0.1);
        s.fragments = [];
        cbRef.current.onHaptic('tap');
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      if (stateRef.current.stormPassTimeout) clearTimeout(stateRef.current.stormPassTimeout);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
