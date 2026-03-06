import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, roundedRect, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function ChrysalisMeltAtom({
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
    melt: 0,
    completionFired: false,
  });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { color, accentColor, phase, composed }; }, [color, accentColor, phase, composed]);
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (holdRef.current) s.melt = clamp(s.melt + dt * 0.24, 0, 1);
      const resolve = easeOutCubic(s.melt);
      cb.onStateChange?.(resolve);
      if (resolve > 0.45 && resolve < 0.49) cb.onHaptic('hold_threshold');
      if (resolve >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const bg = lerpColor([14, 14, 18], s.primaryRgb, 0.16);
      const shell = lerpColor([118, 130, 154], s.primaryRgb, 0.18);
      const molten = lerpColor([248, 202, 146], s.accentRgb, 0.36);
      const wing = lerpColor([198, 220, 255], s.primaryRgb, 0.34);
      ctx.fillStyle = rgba(bg, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      const shellH = minDim * (0.42 - resolve * 0.2);
      roundedRect(ctx, cx - minDim * 0.12, cy - shellH / 2, minDim * 0.24, shellH, minDim * 0.1);
      ctx.fillStyle = rgba(shell, (0.34 + (1 - resolve) * 0.5) * entrance);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(cx, cy + minDim * 0.1, minDim * (0.12 + resolve * 0.08), minDim * (0.02 + resolve * 0.06), 0, 0, Math.PI * 2);
      ctx.fillStyle = rgba(molten, (resolve * 0.66) * entrance);
      ctx.fill();

      if (resolve > 0.55) {
        const wingSpan = minDim * (0.08 + (resolve - 0.55) * 0.5);
        ctx.beginPath();
        ctx.ellipse(cx - wingSpan * 0.72, cy - minDim * 0.04, wingSpan, wingSpan * 0.44, -0.6, 0, Math.PI * 2);
        ctx.fillStyle = rgba(wing, (resolve - 0.55) * 1.9 * entrance);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + wingSpan * 0.72, cy - minDim * 0.04, wingSpan, wingSpan * 0.44, 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onDown = (e: PointerEvent) => {
      holdRef.current = true;
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('hold_start');
    };
    const onUp = (e: PointerEvent) => { holdRef.current = false; canvas.releasePointerCapture(e.pointerId); };

    raf = window.requestAnimationFrame(render);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    return () => {
      window.cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return <div style={{ position: 'absolute', inset: 0 }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} /></div>;
}
