/**
 * ATOM 359: THE KINETIC BATTERY ENGINE
 * Series 36 — Friction Spark · Position 9
 *
 * Prove the body generates its own energy from void.
 * Stark empty battery outline. Rhythmic taps fill with
 * dense liquid light. Human body generating from nothing.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale } from '../atom-utils';

const BATTERY_W = 0.22;
const BATTERY_H = 0.45;
const MAX_TAPS = 12;

export default function KineticBatteryAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    taps: 0, fillLevel: 0, full: false, fullAnim: 0, completed: false,
    ripple: 0,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;
    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion); s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.taps = MAX_TAPS;

      const target = Math.min(1, s.taps / MAX_TAPS);
      s.fillLevel += (target - s.fillLevel) * 0.03 * ms;
      if (target >= 1 && !s.full) { s.full = true; cb.onHaptic('completion'); }
      if (s.full) s.fullAnim = Math.min(1, s.fullAnim + 0.01 * ms);
      s.ripple = Math.max(0, s.ripple - 0.02);
      cb.onStateChange?.(s.full ? 0.5 + s.fullAnim * 0.5 : s.fillLevel * 0.5);

      const bW = minDim * BATTERY_W;
      const bH = minDim * BATTERY_H;
      const bL = cx - bW / 2;
      const bT = cy - bH / 2;
      const capH = px(0.015, minDim);
      const capW = bW * 0.4;

      // Battery cap (positive terminal)
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance);
      ctx.fillRect(cx - capW / 2, bT - capH, capW, capH);

      // Battery outline — thick
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance);
      ctx.lineWidth = px(0.003, minDim);
      ctx.strokeRect(bL, bT, bW, bH);

      // Liquid light fill
      const fillH = bH * s.fillLevel;
      const fillY = bT + bH - fillH;
      if (s.fillLevel > 0.01) {
        const lg = ctx.createLinearGradient(cx, fillY, cx, bT + bH);
        lg.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance));
        lg.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance));
        lg.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance));
        ctx.fillStyle = lg;
        ctx.fillRect(bL + px(0.002, minDim), fillY, bW - px(0.004, minDim), fillH);

        // Surface wave
        if (s.ripple > 0) {
          ctx.beginPath();
          for (let x = bL; x <= bL + bW; x += 2) {
            const wave = Math.sin((x - bL) / bW * Math.PI * 4 + s.frameCount * 0.1) * px(0.003, minDim) * s.ripple;
            if (x === bL) ctx.moveTo(x, fillY + wave); else ctx.lineTo(x, fillY + wave);
          }
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * s.ripple * entrance);
          ctx.lineWidth = px(0.001, minDim); ctx.stroke();
        }
      }

      // Level indicators
      for (let i = 1; i <= 4; i++) {
        const lY = bT + bH * (1 - i / 4);
        ctx.beginPath(); ctx.moveTo(bL - px(0.005, minDim), lY); ctx.lineTo(bL, lY);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.1 * entrance);
        ctx.lineWidth = px(0.0005, minDim); ctx.stroke();
      }

      // Full state — radiant glow
      if (s.full) {
        const gR = minDim * 0.25 * s.fullAnim;
        const fg = ctx.createRadialGradient(cx, cy, bW * 0.3, cx, cy, gR);
        fg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * s.fullAnim * entrance));
        fg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = fg; ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = () => {
      const s = stateRef.current; if (s.taps < MAX_TAPS) { s.taps++; s.ripple = 1; callbacksRef.current.onHaptic('tap'); }
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
