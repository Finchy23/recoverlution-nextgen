import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
type Point = { x: number; y: number };

export default function SunsetAnomalyAtom({
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
  const dragRef = useRef<{ active: boolean; offsetY: number }>({ active: false, offsetY: 0 });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    sunY: 0.32,
    glitched: 0,
    released: 0,
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
      const { w, h, cx, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, h * 0.58, w, h, minDim, s.primaryRgb, entrance);

      if (!dragRef.current.active && s.released > 0 && s.released < 1) s.released = clamp(s.released + dt * 0.3, 0, 1);
      const resolve = easeOutCubic(s.released);
      cb.onStateChange?.(resolve);
      if (resolve >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const bg = lerpColor([14, 12, 18], s.primaryRgb, 0.18);
      const sky = lerpColor([248, 160, 124], s.accentRgb, 0.28);
      const night = lerpColor([180, 214, 255], s.primaryRgb, 0.3);
      ctx.fillStyle = rgba(resolve > 0.1 ? lerpColor(bg, [6, 8, 14], resolve * 0.8) : bg, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      const horizonY = h * 0.74;
      ctx.strokeStyle = rgba(sky, 0.2 * entrance);
      ctx.lineWidth = px(0.008, minDim);
      ctx.beginPath();
      ctx.moveTo(w * 0.12, horizonY);
      ctx.lineTo(w * 0.88, horizonY);
      ctx.stroke();

      const y = h * s.sunY;
      ctx.beginPath();
      ctx.arc(cx, y, minDim * 0.08, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.glitched > 0.05 ? [255, 92, 92] : sky, (0.42 + (1 - resolve) * 0.34) * entrance);
      ctx.fill();

      if (s.glitched > 0.1) {
        for (let i = 0; i < 8; i += 1) {
          const jitter = ((i % 2) * 2 - 1) * minDim * 0.02 * s.glitched;
          ctx.fillStyle = rgba([255, 88, 88], 0.08 * entrance);
          ctx.fillRect(w * 0.16 + jitter, h * (0.1 + i * 0.08), w * 0.68, h * 0.02);
        }
      }

      if (resolve > 0.15) {
        for (let i = 0; i < 44; i += 1) {
          const x = w * (0.12 + ((i * 0.073) % 0.76));
          const sy = h * (0.08 + ((i * 0.067) % 0.5));
          ctx.beginPath();
          ctx.arc(x, sy, minDim * 0.0035, 0, Math.PI * 2);
          ctx.fillStyle = rgba(night, resolve * 0.85 * entrance);
          ctx.fill();
        }
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getPoint = (e: PointerEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return { x: ((e.clientX - rect.left) / rect.width) * viewport.width, y: ((e.clientY - rect.top) / rect.height) * viewport.height };
    };
    const onDown = (e: PointerEvent) => {
      const pt = getPoint(e);
      if (Math.hypot(pt.x - viewport.width / 2, pt.y - viewport.height * stateRef.current.sunY) > viewport.height * 0.1) return;
      dragRef.current = { active: true, offsetY: pt.y - viewport.height * stateRef.current.sunY };
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.active) return;
      const pt = getPoint(e);
      const nextY = clamp((pt.y - dragRef.current.offsetY) / viewport.height, 0.18, 0.74);
      if (nextY < stateRef.current.sunY) {
        stateRef.current.glitched = clamp(stateRef.current.glitched + 0.1, 0, 1);
        callbacksRef.current.onHaptic('error_boundary');
      } else {
        stateRef.current.sunY = nextY;
      }
    };
    const onUp = (e: PointerEvent) => {
      dragRef.current.active = false;
      if (stateRef.current.glitched > 0.2 || stateRef.current.sunY > 0.6) {
        stateRef.current.released = Math.max(stateRef.current.released, 0.2);
        callbacksRef.current.onHaptic('hold_release');
      }
      canvas.releasePointerCapture(e.pointerId);
    };

    raf = window.requestAnimationFrame(render);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    return () => {
      window.cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return <div style={{ position: 'absolute', inset: 0 }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} /></div>;
}
