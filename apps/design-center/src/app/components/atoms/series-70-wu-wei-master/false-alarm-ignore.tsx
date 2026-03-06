/**
 * ATOM 695: THE FALSE ALARM ENGINE
 * ==================================
 * Series 70 — Wu Wei Master · Position 5
 *
 * Manufactured urgency is a lie. The defuse slider resets the bomb
 * faster each time. Let the timer hit zero. No explosion. The urgency
 * blinks out of existence.
 *
 * PHYSICS:
 *   - Massive terrifying countdown number rendered huge at center
 *   - Countdown from 10, vibrating with increasing intensity
 *   - Pulsing "DEFUSE" zone at bottom — swiping resets to 10
 *     but timer now ticks 2x faster each reset
 *   - After 3 resets, timer ticks impossibly fast (visual panic)
 *   - Doing nothing: timer reaches 0, no explosion
 *   - At zero: number simply fades to nothing — was never real
 *   - Peace glow emerges where panic was
 *
 * INTERACTION:
 *   Swipe defuse zone → resets timer faster (error_boundary)
 *   Ignore entirely → timer reaches 0 → nothing → sovereignty
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static peace glow, timer at "0"
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, FONT_SIZE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

const COUNTDOWN_START = 10;
const BASE_TICK_RATE = 0.008;        // countdown per frame
const SPEED_MULTIPLIER = 2.0;        // each reset doubles speed
const DEFUSE_ZONE_Y = 0.85;
const DEFUSE_ZONE_H = 0.12;
const SWIPE_MIN_DX = 0.1;
const VIBRATION_BASE = 0.002;
const VIBRATION_URGENCY = 0.015;
const NUMBER_SIZE = 0.18;            // huge countdown display
const FADE_SPEED = 0.015;
const GLOW_LAYERS = 4;

export default function FalseAlarmIgnoreAtom({
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
    tickRate: BASE_TICK_RATE,
    resets: 0,
    reached0: false,
    fadeProgress: 0,
    swipeStartX: 0,
    swipeStartY: 0,
    swiping: false,
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

      const time = s.frameCount * 0.015;

      if (p.reducedMotion) {
        // Static peace
        const cR = px(SIZE.md * 0.4, minDim);
        const pg = ctx.createRadialGradient(cx, cy, 0, cx, cy, cR * 3);
        pg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.25 * entrance));
        pg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = pg;
        ctx.fillRect(cx - cR * 3, cy - cR * 3, cR * 6, cR * 6);
        cb.onStateChange?.(1);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      if (p.phase === 'resolve') { s.countdown = 0; }

      // ── Countdown physics ─────────────────────────────────
      if (!s.reached0) {
        s.countdown = Math.max(0, s.countdown - s.tickRate * ms);

        if (s.countdown <= 5 && !s.stepNotified) {
          s.stepNotified = true;
          cb.onHaptic('step_advance');
        }

        if (s.countdown <= 0) {
          s.reached0 = true;
          // NO explosion — just silence
          cb.onHaptic('completion');
        }
      }

      if (s.reached0) {
        s.fadeProgress = Math.min(1, s.fadeProgress + FADE_SPEED * ms);
      }

      cb.onStateChange?.(s.reached0 ? 0.5 + s.fadeProgress * 0.5 :
        (1 - s.countdown / COUNTDOWN_START) * 0.5);

      const urgency = s.reached0 ? 0 : 1 - s.countdown / COUNTDOWN_START;

      // ── 1. Urgency screen glow ────────────────────────────
      if (urgency > 0.3 && !s.reached0) {
        const urgGlow = ALPHA.glow.max * 0.06 * (urgency - 0.3) / 0.7 * entrance;
        const ug = ctx.createRadialGradient(cx, cy, px(0.1, minDim), cx, cy, px(0.5, minDim));
        ug.addColorStop(0, rgba(s.accentRgb, urgGlow));
        ug.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = ug;
        ctx.fillRect(0, 0, w, h);
      }

      // ── 2. Countdown number ───────────────────────────────
      if (!s.reached0 || s.fadeProgress < 1) {
        const displayNum = Math.ceil(s.countdown);
        const numStr = String(displayNum);

        // Vibration
        const vibAmp = px((VIBRATION_BASE + urgency * VIBRATION_URGENCY) * (s.reached0 ? 0 : 1), minDim);
        const vibX = Math.sin(time * 8) * vibAmp;
        const vibY = Math.cos(time * 9.3) * vibAmp;

        const fontSize = px(NUMBER_SIZE, minDim);
        const numAlpha = ALPHA.content.max * (s.reached0 ? (1 - s.fadeProgress) : (0.3 + urgency * 0.4)) * entrance;
        const numColor = s.reached0
          ? lerpColor(s.accentRgb, s.primaryRgb, s.fadeProgress)
          : lerpColor(s.primaryRgb, s.accentRgb, urgency);

        // Number glow
        const numGlowR = fontSize * 1.5;
        const ng = ctx.createRadialGradient(cx + vibX, cy + vibY, 0, cx + vibX, cy + vibY, numGlowR);
        ng.addColorStop(0, rgba(numColor, numAlpha * 0.3));
        ng.addColorStop(1, rgba(numColor, 0));
        ctx.fillStyle = ng;
        ctx.fillRect(cx + vibX - numGlowR, cy + vibY - numGlowR, numGlowR * 2, numGlowR * 2);

        // Number — rendered as large circle with smaller interior to avoid font
        // (Using arc-based number representation for canvas purity)
        const numR = fontSize * 0.5;
        ctx.beginPath();
        ctx.arc(cx + vibX, cy + vibY, numR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(numColor, numAlpha * 0.15);
        ctx.fill();

        // Inner intensity ring proportional to countdown
        const innerAngle = (s.countdown / COUNTDOWN_START) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx + vibX, cy + vibY, numR * 0.8, -Math.PI / 2, -Math.PI / 2 + innerAngle);
        ctx.strokeStyle = rgba(numColor, numAlpha);
        ctx.lineWidth = px(0.006, minDim);
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(cx + vibX, cy + vibY, px(0.008, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(numColor, numAlpha * 0.8);
        ctx.fill();
      }

      // ── 3. Defuse zone (trap) ─────────────────────────────
      if (!s.reached0) {
        const dzY = DEFUSE_ZONE_Y * h;
        const dzH = DEFUSE_ZONE_H * h;
        const pulse = 0.5 + 0.5 * Math.sin(time * 4 * (1 + s.resets));

        // Defuse bar
        const dzGrad = ctx.createLinearGradient(0, dzY, 0, dzY + dzH);
        dzGrad.addColorStop(0, rgba(s.accentRgb, ALPHA.content.max * 0.04 * pulse * entrance));
        dzGrad.addColorStop(0.5, rgba(s.accentRgb, ALPHA.content.max * 0.08 * pulse * entrance));
        dzGrad.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = dzGrad;
        ctx.fillRect(0, dzY, w, dzH);

        // Defuse indicator line
        ctx.beginPath();
        ctx.moveTo(w * 0.2, dzY + dzH * 0.5);
        ctx.lineTo(w * 0.8, dzY + dzH * 0.5);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.12 * pulse * entrance);
        ctx.lineWidth = px(0.002, minDim);
        ctx.setLineDash([px(0.005, minDim), px(0.005, minDim)]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ── 4. Peace emergence ────────────────────────────────
      if (s.reached0 && s.fadeProgress > 0.2) {
        const peaceIntensity = (s.fadeProgress - 0.2) / 0.8;
        const peaceR = px(SIZE.md * peaceIntensity, minDim);

        for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = peaceR * (1.5 + i * 1.2);
          const gA = ALPHA.glow.max * 0.15 * peaceIntensity * entrance / (i + 1);
          const pg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          pg.addColorStop(0, rgba(s.primaryRgb, gA));
          pg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = pg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }

        ctx.beginPath();
        ctx.arc(cx, cy, peaceR * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * peaceIntensity * entrance);
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Swipe on defuse zone = reset (counterproductive)
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.reached0) return;
      const rect = canvas.getBoundingClientRect();
      const my = (e.clientY - rect.top) / rect.height;
      if (my > DEFUSE_ZONE_Y - DEFUSE_ZONE_H * 0.5) {
        s.swipeStartX = (e.clientX - rect.left) / rect.width;
        s.swipeStartY = my;
        s.swiping = true;
      }
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.swiping || s.reached0) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const dx = Math.abs(mx - s.swipeStartX);

      if (dx > SWIPE_MIN_DX) {
        s.swiping = false;
        s.countdown = COUNTDOWN_START;
        s.resets++;
        s.tickRate = BASE_TICK_RATE * Math.pow(SPEED_MULTIPLIER, s.resets);
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
