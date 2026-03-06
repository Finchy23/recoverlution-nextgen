/**
 * ATOM 685: THE UNFILLED SPACE ENGINE
 * ======================================
 * Series 69 — Minimum Effective Dose · Position 5
 *
 * Held silence is the ultimate leverage. The aggressive timer
 * pressures you to concede. Hands off. Let the timer run out.
 * No explosion. The opponent yields.
 *
 * PHYSICS:
 *   - Aggressive opponent node pulsing/vibrating at center-right
 *   - Countdown timer from 10, vibrating with intensity
 *   - "CONCEDE" zone pulses at bottom — swiping resets faster
 *   - Ignore everything: timer reaches zero, opponent shrinks + yields
 *   - Opponent node transitions from aggressive red to calm blue
 *   - Yield animation: opponent slowly deflates and moves downward
 *   - Different from S70's false-alarm: here the OPPONENT yields
 *
 * INTERACTION:
 *   Swipe concede zone → resets timer faster (error_boundary)
 *   Ignore entirely → timer reaches 0 → opponent yields (completion)
 *
 * RENDER: Canvas 2D with opponent deflation animation
 * REDUCED MOTION: Static peaceful scene with yielded opponent
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

const COUNTDOWN_START = 10;
const BASE_TICK = 0.007;
const SPEED_MULT = 1.8;
const CONCEDE_ZONE_Y = 0.85;
const SWIPE_MIN_DX = 0.08;
const OPPONENT_X = 0.62;
const OPPONENT_R = 0.08;
const OPPONENT_YIELD_SHRINK = 0.03;
const YIELD_SPEED = 0.01;
const CORE_X = 0.38;
const CORE_R = SIZE.md * 0.3;
const GLOW_LAYERS = 3;

export default function UnfilledSpaceSilenceAtom({
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
    countdown: COUNTDOWN_START as number,
    tickRate: BASE_TICK,
    resets: 0,
    yielded: false,
    yieldProgress: 0,
    swiping: false,
    swipeStartX: 0,
    stepNotified: false,
    completed: false,
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

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const time = s.frameCount * 0.012;

      if (p.reducedMotion) {
        // Yielded opponent + peaceful core
        const coreR = px(CORE_R, minDim);
        ctx.beginPath(); ctx.arc(CORE_X * w, cy, coreR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
        ctx.fill();
        const oR = px(OPPONENT_YIELD_SHRINK, minDim);
        ctx.beginPath(); ctx.arc(OPPONENT_X * w, cy + px(0.05, minDim), oR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
        ctx.fill();
        cb.onStateChange?.(1);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      if (p.phase === 'resolve') { s.countdown = 0; }

      // ── Countdown ─────────────────────────────────────────
      if (!s.yielded) {
        s.countdown = Math.max(0, s.countdown - s.tickRate * ms);
        if (s.countdown <= 4 && !s.stepNotified) {
          s.stepNotified = true;
          cb.onHaptic('step_advance');
        }
        if (s.countdown <= 0) {
          s.yielded = true;
          cb.onHaptic('completion');
        }
      }

      if (s.yielded) {
        s.yieldProgress = Math.min(1, s.yieldProgress + YIELD_SPEED * ms);
      }

      cb.onStateChange?.(s.yielded ? 0.5 + s.yieldProgress * 0.5 :
        (1 - s.countdown / COUNTDOWN_START) * 0.5);

      const urgency = s.yielded ? 0 : 1 - s.countdown / COUNTDOWN_START;

      // ── 1. Opponent node ──────────────────────────────────
      const oppX = OPPONENT_X * w;
      const oppYBase = cy;
      const oppYield = s.yieldProgress * px(0.08, minDim);
      const oppY = oppYBase + oppYield;
      const oppR = px(s.yielded
        ? OPPONENT_R * (1 - s.yieldProgress * 0.7)
        : OPPONENT_R * (1 + urgency * 0.15), minDim);
      const oppColor = s.yielded
        ? lerpColor(s.accentRgb, s.primaryRgb, s.yieldProgress)
        : s.accentRgb;

      // Opponent vibration
      const vib = s.yielded ? 0 : Math.sin(time * 8) * px(0.003 * urgency, minDim);

      // Glow
      const og = ctx.createRadialGradient(oppX + vib, oppY, 0, oppX + vib, oppY, oppR * 2);
      og.addColorStop(0, rgba(oppColor, ALPHA.glow.max * (s.yielded ? 0.05 : 0.15 * urgency) * entrance));
      og.addColorStop(1, rgba(oppColor, 0));
      ctx.fillStyle = og;
      ctx.fillRect(oppX + vib - oppR * 2, oppY - oppR * 2, oppR * 4, oppR * 4);

      ctx.beginPath();
      ctx.arc(oppX + vib, oppY, oppR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(oppColor, ALPHA.content.max * (s.yielded ? 0.1 + 0.1 * (1 - s.yieldProgress) : 0.35 + urgency * 0.15) * entrance);
      ctx.fill();

      // Aggression lines
      if (!s.yielded && urgency > 0.2) {
        for (let i = 0; i < 4; i++) {
          const la = (i / 4) * Math.PI * 2 + time * 2;
          const l1 = oppR * 1.2;
          const l2 = oppR * (1.5 + urgency * 0.5);
          ctx.beginPath();
          ctx.moveTo(oppX + vib + Math.cos(la) * l1, oppY + Math.sin(la) * l1);
          ctx.lineTo(oppX + vib + Math.cos(la) * l2, oppY + Math.sin(la) * l2);
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.1 * urgency * entrance);
          ctx.lineWidth = px(0.001, minDim);
          ctx.stroke();
        }
      }

      // ── 2. Your core ─────────────────────────────────────
      const coreX = CORE_X * w;
      const cR = px(CORE_R, minDim) * (1 + p.breathAmplitude * 0.04);
      const coreIntensity = s.yielded ? 0.5 + s.yieldProgress * 0.3 : 0.3;

      for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
        const gR = cR * (1.5 + i * 1.5 + (s.yielded ? s.yieldProgress * 2 : 0));
        const gg = ctx.createRadialGradient(coreX, cy, 0, coreX, cy, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * coreIntensity * 0.15 * entrance / (i + 1)));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(coreX - gR, cy - gR, gR * 2, gR * 2);
      }
      ctx.beginPath(); ctx.arc(coreX, cy, cR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * coreIntensity * entrance);
      ctx.fill();

      // ── 3. Countdown ring ─────────────────────────────────
      if (!s.yielded) {
        const cdownR = px(SIZE.xs, minDim);
        const cdownAngle = (s.countdown / COUNTDOWN_START) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy * 0.25, cdownR, -Math.PI / 2, -Math.PI / 2 + cdownAngle);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.25 * entrance);
        ctx.lineWidth = px(0.003, minDim);
        ctx.stroke();
      }

      // ── 4. Concede zone (trap) ────────────────────────────
      if (!s.yielded) {
        const czY = CONCEDE_ZONE_Y * h;
        const pulse = 0.5 + 0.5 * Math.sin(time * 3 * (1 + s.resets * 0.5));
        const czGrad = ctx.createLinearGradient(0, czY - px(0.03, minDim), 0, czY + px(0.03, minDim));
        czGrad.addColorStop(0, rgba(s.accentRgb, 0));
        czGrad.addColorStop(0.5, rgba(s.accentRgb, ALPHA.content.max * 0.04 * pulse * entrance));
        czGrad.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = czGrad;
        ctx.fillRect(0, czY - px(0.03, minDim), w, px(0.06, minDim));

        // Dashed line
        ctx.beginPath();
        ctx.moveTo(w * 0.25, czY);
        ctx.lineTo(w * 0.75, czY);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.08 * pulse * entrance);
        ctx.lineWidth = px(0.001, minDim);
        ctx.setLineDash([px(0.004, minDim), px(0.004, minDim)]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ── 5. Victory radiance ───────────────────────────────
      if (s.yielded && s.yieldProgress > 0.5) {
        for (let i = 0; i < 3; i++) {
          const rPhase = (time * 0.12 + i * 0.33) % 1;
          const rR = cR * (1 + rPhase * 3);
          ctx.beginPath();
          ctx.arc(coreX, cy, rR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.05 * (1 - rPhase) * entrance);
          ctx.lineWidth = px(0.001, minDim);
          ctx.stroke();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.yielded) return;
      const rect = canvas.getBoundingClientRect();
      const my = (e.clientY - rect.top) / rect.height;
      if (my > CONCEDE_ZONE_Y - 0.06) {
        s.swipeStartX = (e.clientX - rect.left) / rect.width;
        s.swiping = true;
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.swiping || s.yielded) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      if (Math.abs(mx - s.swipeStartX) > SWIPE_MIN_DX) {
        s.swiping = false;
        s.countdown = COUNTDOWN_START;
        s.resets++;
        s.tickRate = BASE_TICK * Math.pow(SPEED_MULT, s.resets);
        s.stepNotified = false;
        callbacksRef.current.onHaptic('error_boundary');
      }
    };
    const onUp = () => { stateRef.current.swiping = false; };

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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'default' }} />
    </div>
  );
}
