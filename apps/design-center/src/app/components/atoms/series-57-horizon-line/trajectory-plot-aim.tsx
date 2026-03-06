import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function TrajectoryPlotAimAtom({
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
  const dragRef = useRef<{ active: boolean; startX: number; startAngle: number }>({ active: false, startX: 0, startAngle: 0 });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    angle: 0.28,
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
      const { w, h, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, w * 0.5, h * 0.62, w, h, minDim, s.primaryRgb, entrance);

      const targetAngle = 0.61;
      const resolve = easeOutCubic(1 - clamp(Math.abs(s.angle - targetAngle) / 0.25, 0, 1));
      cb.onStateChange?.(resolve);
      if (resolve >= 0.98 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const bg = lerpColor([14, 14, 18], s.primaryRgb, 0.16);
      const line = lerpColor([178, 206, 255], s.primaryRgb, 0.28);
      const target = lerpColor([246, 222, 166], s.accentRgb, 0.34);
      const hazard = lerpColor([220, 88, 88], s.accentRgb, 0.12);
      ctx.fillStyle = rgba(bg, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      const originX = w * 0.16;
      const originY = h * 0.82;
      const targetX = w * 0.82;
      const targetY = h * 0.22;
      ctx.beginPath();
      ctx.arc(targetX, targetY, minDim * 0.028, 0, Math.PI * 2);
      ctx.fillStyle = rgba(target, 0.88 * entrance);
      ctx.fill();
      ctx.fillStyle = rgba(hazard, (1 - resolve) * 0.7 * entrance);
      ctx.fillRect(w * 0.48, h * 0.16, w * 0.05, h * 0.56);

      ctx.strokeStyle = rgba(line, (0.28 + resolve * 0.48) * entrance);
      ctx.lineWidth = px(0.005, minDim);
      ctx.setLineDash([px(0.02, minDim), px(0.014, minDim)]);
      ctx.beginPath();
      for (let i = 0; i <= 48; i += 1) {
        const t = i / 48;
        const x = originX + t * w * 0.7;
        const y = originY - (Math.sin(t * Math.PI * s.angle) * h * 0.55) - t * h * 0.1;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(originX, originY, minDim * 0.03, 0, Math.PI * 2);
      ctx.fillStyle = rgba(line, 0.8 * entrance);
      ctx.fill();

      const sliderY = h * 0.92;
      ctx.strokeStyle = rgba(line, 0.28 * entrance);
      ctx.lineWidth = px(0.006, minDim);
      ctx.beginPath();
      ctx.moveTo(w * 0.22, sliderY);
      ctx.lineTo(w * 0.78, sliderY);
      ctx.stroke();
      const knobX = w * (0.22 + s.angle * 0.56);
      ctx.beginPath();
      ctx.arc(knobX, sliderY, minDim * 0.026, 0, Math.PI * 2);
      ctx.fillStyle = rgba(target, 0.9 * entrance);
      ctx.fill();

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onDown = (e: PointerEvent) => {
      dragRef.current = { active: true, startX: e.clientX, startAngle: stateRef.current.angle };
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('drag_snap');
    };
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.active) return;
      const delta = (e.clientX - dragRef.current.startX) / viewport.width;
      stateRef.current.angle = clamp(dragRef.current.startAngle + delta, 0.08, 0.92);
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
