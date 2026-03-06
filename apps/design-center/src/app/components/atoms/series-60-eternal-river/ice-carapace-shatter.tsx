import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, roundedRect, setupCanvas } from '../atom-utils';

export default function IceCarapaceShatterAtom({
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
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    pressure: 0,
    shattered: false,
    thaw: 0,
    warningFired: false,
    completionFired: false,
  });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { color, accentColor, phase, composed }; }, [color, accentColor, phase, composed]);
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

      if (!s.shattered) {
        s.pressure = Math.min(1, s.pressure + 0.0048);
        if (s.pressure > 0.72 && !s.warningFired) {
          s.warningFired = true;
          cb.onHaptic('error_boundary');
        }
      } else {
        s.thaw = Math.min(1, s.thaw + 0.025);
        if (s.thaw >= 1 && !s.completionFired) {
          s.completionFired = true;
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      }

      cb.onStateChange?.(s.shattered ? easeOutCubic(s.thaw) : s.pressure * 0.45);
      const ice = lerpColor([196, 226, 248], s.primaryRgb, 0.18);
      const red = lerpColor([255, 92, 84], s.accentRgb, 0.2);
      const water = lerpColor([82, 180, 255], s.primaryRgb, 0.24);

      roundedRect(ctx, w * 0.16, h * 0.24, w * 0.68, h * 0.48, minDim * 0.04);
      ctx.fillStyle = rgba(ice, (0.32 - s.thaw * 0.18) * entrance);
      ctx.fill();
      ctx.strokeStyle = rgba(ice, 0.4 * entrance);
      ctx.lineWidth = px(0.006, minDim);
      ctx.stroke();

      if (!s.shattered) {
        for (let i = 0; i < 5; i += 1) {
          ctx.strokeStyle = rgba(red, (0.05 + s.pressure * 0.16) * entrance);
          ctx.lineWidth = px(0.003, minDim);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(i * 1.15) * minDim * 0.12, cy + Math.sin(i * 1.15) * minDim * 0.12);
          ctx.stroke();
        }
      } else {
        for (let i = 0; i < 26; i += 1) {
          const t = i / 25;
          ctx.beginPath();
          ctx.arc(w * (0.2 + t * 0.6), h * (0.3 + s.thaw * 0.5 + Math.sin(t * 12 + Date.now() * 0.003) * 0.01), minDim * 0.007, 0, Math.PI * 2);
          ctx.fillStyle = rgba(water, (0.2 + s.thaw * 0.35) * entrance);
          ctx.fill();
        }
      }

      ctx.fillStyle = rgba(red, (0.12 + s.pressure * 0.28) * entrance);
      ctx.fillRect(w * 0.2, h * 0.8, w * 0.6 * s.pressure, minDim * 0.018);

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onDown = () => {
      const s = stateRef.current;
      if (s.shattered) return;
      if (s.pressure > 0.28) {
        s.shattered = true;
        callbacksRef.current.onHaptic('tap');
      }
    };

    raf = window.requestAnimationFrame(render);
    canvas.addEventListener('pointerdown', onDown);
    return () => {
      window.cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport.width, viewport.height]);

  return <div style={{ position: 'absolute', inset: 0 }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'manipulation' }} /></div>;
}
