import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import {
  advanceEntrance,
  drawAtmosphere,
  easeOutCubic,
  lerpColor,
  parseColor,
  px,
  rgba,
  setupCanvas,
} from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function ThermalExpansionRestAtom({
  color,
  accentColor,
  viewport,
  phase,
  composed,
  onHaptic,
  onStateChange,
  onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ color, accentColor, phase, composed });
  const holdRef = useRef(false);
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    heat: 0,
    stress: 0,
    cycles: 0,
    completionFired: false,
  });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => {
    propsRef.current = { color, accentColor, phase, composed };
  }, [color, accentColor, phase, composed]);
  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (holdRef.current) {
        s.heat = clamp(s.heat + 0.012, 0, 1);
      } else {
        if (s.heat > 0.62) {
          s.stress = clamp(s.stress + s.heat * 0.012, 0, 1);
        }
        s.heat = clamp(s.heat - 0.018, 0, 1);
      }

      const resolved = easeOutCubic(clamp((s.cycles + s.stress) / 3, 0, 1));
      cb.onStateChange?.(resolved);
      if (resolved >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const rock = lerpColor([72, 66, 61], s.primaryRgb, 0.12);
      const glow = lerpColor([255, 120, 74], s.accentRgb, 0.22);
      const crack = lerpColor([232, 238, 250], s.primaryRgb, 0.72);
      const heat = s.heat;
      const split = Math.max(0, resolved - 0.74) / 0.26;
      const push = minDim * 0.12 * split;

      ctx.fillStyle = rgba(rock, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      ctx.beginPath();
      ctx.arc(cx - push, cy, minDim * (0.24 + heat * 0.018), 0, Math.PI * 2);
      ctx.fillStyle = rgba(lerpColor(rock, glow, heat * 0.8), 0.96 * entrance);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + push, cy, minDim * (0.24 + heat * 0.018), 0, Math.PI * 2);
      ctx.fill();

      if (resolved > 0.2) {
        ctx.strokeStyle = rgba(crack, resolved * 0.9 * entrance);
        ctx.lineWidth = px(0.009, minDim);
        ctx.beginPath();
        ctx.moveTo(cx, cy - minDim * 0.19);
        ctx.lineTo(cx - minDim * 0.03, cy - minDim * 0.08);
        ctx.lineTo(cx + minDim * 0.02, cy + minDim * 0.02);
        ctx.lineTo(cx - minDim * 0.05, cy + minDim * 0.16);
        ctx.stroke();
      }

      ctx.fillStyle = rgba(crack, 0.18 * entrance);
      ctx.font = `${px(0.022, minDim)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(holdRef.current ? 'heat' : 'rest', cx, h * 0.9);

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onDown = () => {
      holdRef.current = true;
      callbacksRef.current.onHaptic('hold_start');
    };
    const onUp = () => {
      const s = stateRef.current;
      holdRef.current = false;
      callbacksRef.current.onHaptic('hold_release');
      if (s.heat > 0.8) {
        s.cycles += 1;
        callbacksRef.current.onHaptic('step_advance');
      }
    };

    raf = window.requestAnimationFrame(render);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('pointerleave', onUp);
    return () => {
      window.cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointerleave', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} />
    </div>
  );
}
