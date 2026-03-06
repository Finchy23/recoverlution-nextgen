/**
 * ATOM 623: THE SLINGSHOT COMEBACK ENGINE
 * =========================================
 * Series 63 — Elastic Yield · Position 3
 *
 * Prove setbacks store energy. Being dragged backward stores
 * terrifying potential energy in a visible tension line. Let go —
 * stored kinetic tension launches you forward at blinding speed.
 *
 * SIGNATURE TECHNIQUE: Stress Tensor Visualization
 *   - Tension line rendered with stress gradient: cool at origin → hot at node
 *   - Energy stored = visible heat intensity on the tension band
 *   - As pullback increases, stress heat map radiates outward from line
 *   - On release, stress energy converts to kinetic trail (heat transfers to motion)
 *   - Impact of stored energy visible as trailing thermal wake
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + vignette
 *   2. Stress field glow (radial heat beneath tension line)
 *   3. Energy storage meter (potential energy bar)
 *   4. Tension line with per-segment stress coloring
 *   5. Force direction indicators (stress arrows)
 *   6. Node with specular + stored energy glow
 *   7. Speed lines / kinetic energy wake on launch
 *   8. Progress ring
 *
 * PHYSICS:
 *   - Oppressive force auto-drags node backward
 *   - Tension line shows stored potential energy via stress heat map
 *   - Release converts all potential → kinetic
 *   - Breath modulates node glow + stress shimmer
 *
 * INTERACTION:
 *   Observe (auto-pullback) → tap/release to launch
 *   (step_advance, hold_release, completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static tension line with energy stored, node at rest
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, GLOW, motionScale, type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// STRESS HELPER
// ═════════════════════════════════════════════════════════════════════

/** Map tension (0–1) to stress heat color */
function tensionColor(t: number, base: RGB, hot: RGB): RGB {
  if (t < 0.3) return lerpColor([60, 100, 200] as RGB, base, t / 0.3);
  if (t < 0.6) return lerpColor(base, [220, 200, 60] as RGB, (t - 0.3) / 0.3);
  if (t < 0.85) return lerpColor([220, 200, 60] as RGB, hot, (t - 0.6) / 0.25);
  return lerpColor(hot, [255, 240, 240] as RGB, (t - 0.85) / 0.15);
}

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Node radius (hero element) */
const NODE_R = SIZE.md * 0.14;
/** Pullback rate per frame */
const PULLBACK_RATE = 0.002;
/** Maximum pullback distance (fraction of viewport width) */
const MAX_PULLBACK = 0.35;
/** Launch speed base */
const LAUNCH_SPEED_BASE = 0.012;
/** Launch speed pullback multiplier */
const LAUNCH_SPEED_K = 0.028;
/** Launch deceleration */
const LAUNCH_DECEL = 0.995;
/** Tension line segments */
const TENSION_SEGMENTS = 32;
/** Stress glow layers beneath line */
const STRESS_GLOW_LAYERS = 5;
/** Speed line count */
const SPEED_LINE_COUNT = 8;
/** Wake particle count */
const WAKE_PARTICLES = 40;
/** Progress ring radius */
const PROGRESS_RING_R = SIZE.md * 0.85;
/** Origin marker radius */
const ORIGIN_R = 0.006;
/** Respawn delay */
const RESPAWN_DELAY = 90;
/** Minimum pullback to release */
const MIN_PULLBACK = 0.2;
/** Breath node glow mod */
const BREATH_NODE_MOD = 0.12;
/** Step advance tiers */
const STEP_TIERS = 5;
/** Energy meter height */
const ENERGY_METER_H = 0.25;
/** Specular intensity */
const SPECULAR_K = 0.28;

// ═════════════════════════════════════════════════════════════════════
// STATE
// ═════════════════════════════════════════════════════════════════════

interface WakeParticle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  stress: number;
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function SlingshotComebackAtom({
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
    nodeX: 0.5,
    originX: 0.5,
    pullback: 0,
    pulling: true,
    launched: false,
    launchVx: 0,
    completed: false,
    respawnTimer: 0,
    lastTier: 0,
    wake: [] as WakeParticle[],
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
      // RENDER LAYER 1: Atmosphere + vignette
      // ════════════════════════════════════════════════════
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const vigR = Math.max(w, h) * 0.8;
      const vig = ctx.createRadialGradient(cx, cy, minDim * 0.15, cx, cy, vigR);
      vig.addColorStop(0, rgba([0, 0, 0] as RGB, 0));
      vig.addColorStop(0.7, rgba([0, 0, 0] as RGB, 0));
      vig.addColorStop(1, rgba([0, 0, 0] as RGB, 0.035 * entrance));
      ctx.fillStyle = vig; ctx.fillRect(0, 0, w, h);

      const nodeR = px(NODE_R, minDim);

      // ── Reduced motion fallback ─────────────────────────
      if (p.reducedMotion) {
        const staticPull = 0.6;
        const staticNX = (0.5 - staticPull * MAX_PULLBACK) * w;
        const originPx = 0.5 * w;
        // Static tension line with stress
        for (let i = 0; i < TENSION_SEGMENTS; i++) {
          const t0 = i / TENSION_SEGMENTS; const t1 = (i + 1) / TENSION_SEGMENTS;
          const x0 = staticNX + t0 * (originPx - staticNX);
          const x1 = staticNX + t1 * (originPx - staticNX);
          const stress = (1 - t0) * staticPull;
          const tc = tensionColor(stress, s.primaryRgb, s.accentRgb);
          ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x1, cy);
          ctx.strokeStyle = rgba(tc, ALPHA.content.max * 0.2 * entrance);
          ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(staticNX, cy, nodeR * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.25 * entrance);
        ctx.fill();
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      // ── Pullback physics ───────────────────────────────
      if (!s.completed) {
        if (s.pulling && !s.launched) {
          s.pullback = Math.min(1, s.pullback + PULLBACK_RATE);
          s.nodeX = s.originX - s.pullback * MAX_PULLBACK;
          cb.onStateChange?.(s.pullback * 0.5);
          const tier = Math.floor(s.pullback * STEP_TIERS);
          if (tier > s.lastTier) { cb.onHaptic('step_advance'); s.lastTier = tier; }
        }

        if (s.launched) {
          const prevX = s.nodeX;
          s.nodeX += s.launchVx;
          s.launchVx *= LAUNCH_DECEL;
          // Spawn wake particles
          if (s.launchVx > 0.003 && s.wake.length < WAKE_PARTICLES) {
            s.wake.push({
              x: s.nodeX * w, y: cy + (Math.random() - 0.5) * nodeR * 2,
              vx: -Math.random() * 1.5, vy: (Math.random() - 0.5) * 0.5,
              life: 25 + Math.random() * 15, maxLife: 40,
              stress: Math.min(1, s.launchVx * 30),
            });
          }
          if (s.nodeX > 1.2) {
            s.completed = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          }
        }
      }

      // Update wake particles
      for (const wp of s.wake) {
        wp.x += wp.vx * ms; wp.y += wp.vy * ms;
        wp.life--; wp.stress *= 0.96;
      }
      s.wake = s.wake.filter(wp => wp.life > 0);

      const originPx = s.originX * w;
      const nx = s.nodeX * w;

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Stress field glow beneath tension line
      // ════════════════════════════════════════════════════
      if (s.pulling && !s.launched && s.pullback > 0.05) {
        for (let gi = STRESS_GLOW_LAYERS - 1; gi >= 0; gi--) {
          const gR = minDim * (0.04 + gi * 0.03) * s.pullback;
          const gMidX = (nx + originPx) / 2;
          const gA = ALPHA.glow.max * 0.03 * s.pullback * entrance / (gi + 1);
          const peakStress = s.pullback * 0.8;
          const sc = tensionColor(peakStress, s.primaryRgb, s.accentRgb);
          const sg = ctx.createRadialGradient(gMidX, cy, 0, gMidX, cy, gR);
          sg.addColorStop(0, rgba(sc, gA));
          sg.addColorStop(0.5, rgba(lerpColor(sc, s.primaryRgb, 0.5), gA * 0.4));
          sg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = sg; ctx.fillRect(gMidX - gR, cy - gR, gR * 2, gR * 2);
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Energy storage meter
      // ════════════════════════════════════════════════════
      if (s.pulling && !s.launched && s.pullback > 0.01) {
        const meterX = w * 0.08;
        const meterH = h * ENERGY_METER_H;
        const meterY = cy - meterH / 2;
        const meterW = px(STROKE.medium, minDim);
        // Background track
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.5 * entrance);
        ctx.fillRect(meterX - meterW / 2, meterY, meterW, meterH);
        // Filled portion with stress gradient
        const filledH = meterH * s.pullback;
        const fillY = meterY + meterH - filledH;
        const mGrad = ctx.createLinearGradient(0, meterY + meterH, 0, fillY);
        mGrad.addColorStop(0, rgba([60, 100, 200] as RGB, ALPHA.content.max * 0.12 * entrance));
        mGrad.addColorStop(0.5, rgba([220, 200, 60] as RGB, ALPHA.content.max * 0.15 * entrance));
        mGrad.addColorStop(1, rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance));
        ctx.fillStyle = mGrad;
        ctx.fillRect(meterX - meterW, fillY, meterW * 2, filledH);
        // Glow at top of fill
        const mGlowR = px(0.015, minDim);
        const mg = ctx.createRadialGradient(meterX, fillY, 0, meterX, fillY, mGlowR);
        const msc = tensionColor(s.pullback * 0.8, s.primaryRgb, s.accentRgb);
        mg.addColorStop(0, rgba(msc, ALPHA.glow.max * 0.06 * s.pullback * entrance));
        mg.addColorStop(1, rgba(msc, 0));
        ctx.fillStyle = mg; ctx.fillRect(meterX - mGlowR, fillY - mGlowR, mGlowR * 2, mGlowR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Tension line with stress coloring
      // ════════════════════════════════════════════════════
      if (s.pulling && !s.launched && s.pullback > 0.01) {
        // Shadow
        ctx.beginPath(); ctx.moveTo(nx, cy + 2); ctx.lineTo(originPx, cy + 2);
        ctx.strokeStyle = rgba([0, 0, 0] as RGB, 0.025 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim) * 1.3; ctx.stroke();

        // Stress-colored segments
        for (let i = 0; i < TENSION_SEGMENTS; i++) {
          const t0 = i / TENSION_SEGMENTS; const t1 = (i + 1) / TENSION_SEGMENTS;
          const x0 = nx + t0 * (originPx - nx);
          const x1 = nx + t1 * (originPx - nx);
          // Stress peaks at node (pulled end), drops toward origin
          const stress = (1 - t0) * s.pullback;
          const tc = tensionColor(stress, s.primaryRgb, s.accentRgb);
          const segW = px(STROKE.thin + stress * STROKE.medium, minDim);

          ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x1, cy);
          ctx.strokeStyle = rgba(tc, ALPHA.content.max * (0.15 + stress * 0.25) * entrance);
          ctx.lineWidth = segW; ctx.stroke();

          // Glow on high-stress segments
          if (stress > 0.4) {
            ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x1, cy);
            ctx.strokeStyle = rgba(tc, ALPHA.glow.max * 0.04 * stress * entrance);
            ctx.lineWidth = segW * 3; ctx.stroke();
          }
        }

        // Vibration effect on line at high tension
        if (s.pullback > 0.5) {
          const vibAmp = minDim * 0.003 * (s.pullback - 0.5) * 2;
          for (let i = 0; i < TENSION_SEGMENTS; i++) {
            const t = i / TENSION_SEGMENTS;
            const lx = nx + t * (originPx - nx);
            const vibY = cy + Math.sin(t * Math.PI * 4 + s.frameCount * 0.3) * vibAmp * Math.sin(t * Math.PI);
            const stress = (1 - t) * s.pullback;
            const tc = tensionColor(stress, s.primaryRgb, s.accentRgb);
            ctx.beginPath(); ctx.arc(lx, vibY, px(0.001, minDim), 0, Math.PI * 2);
            ctx.fillStyle = rgba(tc, ALPHA.content.max * 0.06 * entrance);
            ctx.fill();
          }
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Force direction indicators
      // ════════════════════════════════════════════════════
      if (s.pulling && !s.launched && s.pullback > 0.15) {
        // Opposing force arrows (showing the drag-back)
        const arrowCount = 4;
        for (let ai = 0; ai < arrowCount; ai++) {
          const t = (ai + 0.5) / arrowCount;
          const ax = nx + t * (originPx - nx);
          const aStress = (1 - t) * s.pullback * 0.6;
          const ac = tensionColor(aStress, s.primaryRgb, s.accentRgb);
          const aLen = minDim * 0.012 * s.pullback;
          const aAlpha = ALPHA.content.max * 0.06 * s.pullback * entrance;
          // Left-pointing arrow (drag direction)
          ctx.beginPath(); ctx.moveTo(ax, cy - minDim * 0.02);
          ctx.lineTo(ax - aLen, cy - minDim * 0.02);
          ctx.strokeStyle = rgba(ac, aAlpha);
          ctx.lineWidth = px(STROKE.thin, minDim); ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(ax - aLen, cy - minDim * 0.02);
          ctx.lineTo(ax - aLen + 3, cy - minDim * 0.02 - 2);
          ctx.lineTo(ax - aLen + 3, cy - minDim * 0.02 + 2);
          ctx.closePath();
          ctx.fillStyle = rgba(ac, aAlpha); ctx.fill();
        }
        // Right-pointing arrow at origin (stored energy direction)
        const storedColor = tensionColor(s.pullback * 0.9, s.primaryRgb, s.accentRgb);
        const sLen = minDim * 0.02 * s.pullback;
        ctx.beginPath(); ctx.moveTo(originPx, cy + minDim * 0.02);
        ctx.lineTo(originPx + sLen, cy + minDim * 0.02);
        ctx.strokeStyle = rgba(storedColor, ALPHA.content.max * 0.08 * s.pullback * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim); ctx.stroke();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 6: Node with specular + energy glow
      // ════════════════════════════════════════════════════
      // Origin marker
      ctx.beginPath(); ctx.arc(originPx, cy, px(ORIGIN_R, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.12 * entrance);
      ctx.fill();

      if (!s.completed) {
        // Node shadow
        ctx.beginPath();
        ctx.ellipse(nx + 2, cy + nodeR * 0.7, nodeR * 0.6, nodeR * 0.12, 0, 0, Math.PI * 2);
        ctx.fillStyle = rgba([0, 0, 0] as RGB, 0.025 * entrance);
        ctx.fill();

        // Node glow (stress-colored when pulling)
        const glowStress = s.pulling ? s.pullback * 0.7 : Math.min(1, s.launchVx * 25);
        const glowColor = s.pulling
          ? tensionColor(glowStress, s.primaryRgb, s.accentRgb)
          : s.primaryRgb;
        const nGlowR = nodeR * (3.5 + breath * BREATH_NODE_MOD * 3);
        const nGlow = ctx.createRadialGradient(nx, cy, 0, nx, cy, nGlowR);
        nGlow.addColorStop(0, rgba(glowColor, ALPHA.glow.max * 0.07 * entrance));
        nGlow.addColorStop(0.3, rgba(glowColor, ALPHA.glow.max * 0.03 * entrance));
        nGlow.addColorStop(1, rgba(glowColor, 0));
        ctx.fillStyle = nGlow; ctx.fillRect(nx - nGlowR, cy - nGlowR, nGlowR * 2, nGlowR * 2);

        // Node body (5-stop gradient)
        const nBody = ctx.createRadialGradient(
          nx - nodeR * 0.15, cy - nodeR * 0.15, nodeR * 0.05,
          nx, cy, nodeR * (1 + breath * 0.08)
        );
        const nA = ALPHA.content.max * 0.4 * entrance;
        nBody.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.4), nA));
        nBody.addColorStop(0.2, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.15), nA));
        nBody.addColorStop(0.5, rgba(s.primaryRgb, nA * 0.85));
        nBody.addColorStop(0.8, rgba(lerpColor(s.primaryRgb, [0, 0, 0] as RGB, 0.1), nA * 0.6));
        nBody.addColorStop(1, rgba(s.primaryRgb, nA * 0.1));
        ctx.beginPath(); ctx.arc(nx, cy, nodeR * (1 + breath * 0.08), 0, Math.PI * 2);
        ctx.fillStyle = nBody; ctx.fill();

        // Specular highlight
        ctx.beginPath();
        ctx.ellipse(nx - nodeR * 0.2, cy - nodeR * 0.25, nodeR * 0.3, nodeR * 0.15, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, SPECULAR_K * entrance);
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 7: Speed lines + wake particles
      // ════════════════════════════════════════════════════
      if (s.launched && s.launchVx > 0.003 && !s.completed) {
        // Speed lines
        for (let i = 0; i < SPEED_LINE_COUNT; i++) {
          const seed = (i * 137.5) % 1;
          const lineX = nx - minDim * 0.02 * (i + 1) * (0.5 + seed * 0.5);
          const lineY = cy + (i - SPEED_LINE_COUNT / 2) * px(0.008, minDim);
          const lineLen = minDim * 0.02 * s.launchVx * 30 * (0.5 + seed * 0.5);
          const speedStress = Math.min(1, s.launchVx * 30);
          const slc = tensionColor(speedStress * 0.5, s.primaryRgb, s.accentRgb);
          ctx.beginPath(); ctx.moveTo(lineX, lineY);
          ctx.lineTo(lineX - lineLen, lineY);
          ctx.strokeStyle = rgba(slc, ALPHA.atmosphere.min * entrance * (1 - i / SPEED_LINE_COUNT * 0.5));
          ctx.lineWidth = px(0.001, minDim); ctx.stroke();
        }
      }

      // Wake particles
      for (const wp of s.wake) {
        const wAlpha = (wp.life / wp.maxLife) * ALPHA.content.max * 0.12 * entrance;
        const wc = tensionColor(wp.stress, s.primaryRgb, s.accentRgb);
        const wr = px(0.003, minDim) * (wp.life / wp.maxLife);
        ctx.beginPath(); ctx.arc(wp.x, wp.y, wr, 0, Math.PI * 2);
        ctx.fillStyle = rgba(wc, wAlpha); ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 8: Progress ring
      // ════════════════════════════════════════════════════
      const ringR = px(PROGRESS_RING_R, minDim);
      ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.015 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
      const prog = s.completed ? 1 : s.pullback * 0.5;
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
          s.nodeX = 0.5; s.pullback = 0; s.pulling = true;
          s.launched = false; s.launchVx = 0;
          s.completed = false; s.lastTier = 0; s.wake = [];
        }
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handler ─────────────────────────
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.pulling && s.pullback > MIN_PULLBACK && !s.launched) {
        s.launched = true;
        s.pulling = false;
        s.launchVx = LAUNCH_SPEED_BASE + s.pullback * LAUNCH_SPEED_K;
        cbRef.current.onHaptic('hold_release');
      }
    };

    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    return () => {
      cancelAnimationFrame(animId);
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
