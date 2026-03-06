import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function HorizonMergePresentAtom({
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
    merge: 0,
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
      if (!p.composed) drawAtmosphere(ctx, cx, h * 0.54, w, h, minDim, s.primaryRgb, entrance);

      if (holdRef.current) s.merge = clamp(s.merge + dt * 0.48, 0, 1);
      else s.merge = clamp(s.merge - dt * 0.14, 0, 1);
      const resolve = easeOutCubic(s.merge);
      cb.onStateChange?.(resolve);
      if (resolve > 0.4 && resolve < 0.44) cb.onHaptic('hold_threshold');
      if (resolve >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('seal_stamp');
        cb.onResolve?.();
      }

      const bg = lerpColor([10, 12, 16], s.primaryRgb, 0.16);
      const horizon = lerpColor([248, 218, 156], s.accentRgb, 0.34);
      const node = lerpColor([200, 220, 255], s.primaryRgb, 0.34);
      ctx.fillStyle = rgba(bg, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      const horizonY = h * (0.22 + resolve * 0.42);
      ctx.strokeStyle = rgba(horizon, (0.18 + resolve * 0.62) * entrance);
      ctx.lineWidth = px(0.01, minDim);
      ctx.beginPath();
      ctx.moveTo(w * 0.14, horizonY);
      ctx.lineTo(w * 0.86, horizonY);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy + h * 0.18, minDim * 0.05, 0, Math.PI * 2);
      ctx.fillStyle = rgba(node, (0.34 + resolve * 0.36) * entrance);
      ctx.fill();

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * viewport.width;
      const y = ((e.clientY - rect.top) / rect.height) * viewport.height;
      if (Math.hypot(x - viewport.width / 2, y - (viewport.height * 0.68)) > viewport.height * 0.1) {
        callbacksRef.current.onHaptic('error_boundary');
        return;
      }
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
