import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function ParallaxScrollDepthAtom({
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
  const dragRef = useRef<{ active: boolean; startY: number; startFocus: number }>({ active: false, startY: 0, startFocus: 0 });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    focus: 0,
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

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, h * 0.58, w, h, minDim, s.primaryRgb, entrance);

      const resolve = easeOutCubic(s.focus);
      cb.onStateChange?.(resolve);
      if (resolve >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const bg = lerpColor([10, 12, 16], s.primaryRgb, 0.14);
      const near = lerpColor([240, 108, 88], s.accentRgb, 0.16);
      const far = lerpColor([200, 220, 255], s.primaryRgb, 0.34);
      ctx.fillStyle = rgba(bg, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      const monolithW = w * (0.16 + resolve * 0.16);
      const monolithH = h * (0.24 + resolve * 0.32);
      ctx.fillStyle = rgba(far, (0.15 + resolve * 0.45) * entrance);
      ctx.fillRect(cx - monolithW / 2, h * 0.26, monolithW, monolithH);

      for (let i = 0; i < 14; i += 1) {
        const x = w * ((i * 0.077 + 0.12 + resolve * 0.02) % 1);
        const y = h * (0.18 + ((i * 0.09) % 0.56));
        const speedBlur = 1 - resolve;
        ctx.fillStyle = rgba(near, (0.12 + speedBlur * 0.45) * entrance);
        ctx.fillRect(x, y, minDim * (0.02 + (i % 3) * 0.01), minDim * (0.008 + speedBlur * 0.02));
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onDown = (e: PointerEvent) => {
      dragRef.current = { active: true, startY: e.clientY, startFocus: stateRef.current.focus };
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('hold_start');
    };
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.active) return;
      const delta = (dragRef.current.startY - e.clientY) / viewport.height;
      const next = clamp(dragRef.current.startFocus + delta * 1.4, 0, 1);
      if (Math.abs(next - stateRef.current.focus) > 0.08) callbacksRef.current.onHaptic('drag_snap');
      stateRef.current.focus = next;
    };
    const onUp = (e: PointerEvent) => { dragRef.current.active = false; canvas.releasePointerCapture(e.pointerId); };

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
