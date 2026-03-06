/**
 * ATOM 357: THE HEAT SINK ENGINE
 * Series 36 — Friction Spark · Position 7
 *
 * Cure red-lining burnout. Blindingly hot over-active UI.
 * Press all fingers flat to absorb excess energy,
 * cooling to sustainable warm glow.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale } from '../atom-utils';

const HEAT_MAX = 1.0;
const COOL_RATE = 0.003;
const SUSTAINABLE_TEMP = 0.25;

export default function HeatSinkAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    temperature: HEAT_MAX, holding: false,
    cooled: false, coolAnim: 0, completed: false,
    heatWaves: Array.from({ length: 12 }, (_, i) => ({ y: i * 0.08, speed: 0.5 + Math.random() * 1 })),
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

      if (s.holding) s.temperature = Math.max(SUSTAINABLE_TEMP, s.temperature - COOL_RATE * ms);
      if (p.phase === 'resolve') s.temperature = SUSTAINABLE_TEMP;
      if (s.temperature <= SUSTAINABLE_TEMP + 0.02 && !s.cooled) { s.cooled = true; cb.onHaptic('completion'); }
      if (s.cooled) s.coolAnim = Math.min(1, s.coolAnim + 0.01 * ms);
      cb.onStateChange?.(s.cooled ? 0.5 + s.coolAnim * 0.5 : (1 - s.temperature) * 0.5);

      // Screen-filling heat overlay — intense at high temp, gentle at low
      const heatIntensity = s.temperature;
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.atmosphere.max * heatIntensity * 0.15 * entrance);
      ctx.fillRect(0, 0, w, h);

      // Heat waves — distortion lines that slow/vanish as temp drops
      for (const hw of s.heatWaves) {
        hw.y += hw.speed * 0.003 * s.temperature * ms;
        if (hw.y > 1) hw.y = 0;
        ctx.beginPath();
        for (let x = 0; x < w; x += 3) {
          const waveAmp = px(0.008 * s.temperature, minDim);
          const yy = hw.y * h + Math.sin(x * 0.02 + s.frameCount * 0.03 * s.temperature) * waveAmp;
          if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        }
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.06 * s.temperature * entrance);
        ctx.lineWidth = px(0.001, minDim); ctx.stroke();
      }

      // Central radial heat
      const hR = minDim * (0.2 + s.temperature * 0.2);
      const hg = ctx.createRadialGradient(cx, cy, 0, cx, cy, hR);
      hg.addColorStop(0, rgba(s.cooled ? s.primaryRgb : s.accentRgb,
        ALPHA.glow.max * (s.cooled ? 0.25 : 0.4 * s.temperature) * entrance));
      hg.addColorStop(1, rgba(s.cooled ? s.primaryRgb : s.accentRgb, 0));
      ctx.fillStyle = hg; ctx.fillRect(cx - hR, cy - hR, hR * 2, hR * 2);

      // Temperature gauge — vertical bar on right
      const gaugeX = w * 0.92; const gaugeT = h * 0.15; const gaugeB = h * 0.85;
      const gaugeH = gaugeB - gaugeT;
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
      ctx.lineWidth = px(0.001, minDim);
      ctx.strokeRect(gaugeX, gaugeT, px(0.006, minDim), gaugeH);
      // Fill level
      const fillH = gaugeH * s.temperature;
      ctx.fillStyle = rgba(s.temperature > 0.6 ? s.accentRgb : s.primaryRgb,
        ALPHA.content.max * 0.3 * entrance);
      ctx.fillRect(gaugeX, gaugeB - fillH, px(0.006, minDim), fillH);
      // Sustainable zone marker
      const sustainY = gaugeB - gaugeH * SUSTAINABLE_TEMP;
      ctx.beginPath(); ctx.moveTo(gaugeX - px(0.003, minDim), sustainY);
      ctx.lineTo(gaugeX + px(0.012, minDim), sustainY);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.25 * entrance);
      ctx.stroke();

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = () => { stateRef.current.holding = true; callbacksRef.current.onHaptic('hold_start'); };
    const onUp = () => { stateRef.current.holding = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
