import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
type Point = { x: number; y: number };

export default function DelayedYieldHarvestAtom({
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
  const dragRef = useRef<{ active: boolean; offsetX: number }>({ active: false, offsetX: 0 });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    sunX: 0.16,
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
      if (!p.composed) drawAtmosphere(ctx, cx, h * 0.6, w, h, minDim, s.primaryRgb, entrance);

      const resolve = easeOutCubic(clamp((s.sunX - 0.16) / 0.66, 0, 1));
      cb.onStateChange?.(resolve);
      if (resolve >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const bg = lerpColor([16, 18, 22], s.primaryRgb, 0.14);
      const soil = lerpColor([58, 42, 30], s.accentRgb, 0.1);
      const stem = lerpColor([132, 210, 146], s.primaryRgb, 0.22);
      const bloom = lerpColor([246, 223, 164], s.accentRgb, 0.34);
      ctx.fillStyle = rgba(bg, 0.96 * entrance);
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = rgba(soil, 0.78 * entrance);
      ctx.fillRect(0, h * 0.76, w, h * 0.24);

      const sunY = h * (0.18 + (1 - resolve) * 0.08);
      const sunX = w * s.sunX;
      const sunR = minDim * 0.05;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(bloom, (0.4 + resolve * 0.42) * entrance);
      ctx.fill();

      const plantH = minDim * (0.04 + resolve * 0.26);
      ctx.strokeStyle = rgba(stem, (0.42 + resolve * 0.4) * entrance);
      ctx.lineWidth = px(0.008, minDim);
      ctx.beginPath();
      ctx.moveTo(cx, h * 0.76);
      ctx.bezierCurveTo(cx - minDim * 0.04, h * 0.74, cx + minDim * 0.03, h * 0.7, cx, h * 0.76 - plantH);
      ctx.stroke();

      const petalCount = 4 + Math.floor(resolve * 6);
      const bloomY = h * 0.76 - plantH;
      for (let i = 0; i < petalCount; i += 1) {
        const a = (i / petalCount) * Math.PI * 2;
        const pxr = minDim * (0.018 + resolve * 0.022);
        ctx.beginPath();
        ctx.ellipse(cx + Math.cos(a) * pxr, bloomY + Math.sin(a) * pxr, pxr * 1.3, pxr * 0.72, a, 0, Math.PI * 2);
        ctx.fillStyle = rgba(bloom, (0.26 + resolve * 0.52) * entrance);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(cx, bloomY, minDim * (0.014 + resolve * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(lerpColor([250, 245, 210], bloom, 0.5), 0.92 * entrance);
      ctx.fill();

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getPoint = (e: PointerEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return { x: ((e.clientX - rect.left) / rect.width) * viewport.width, y: ((e.clientY - rect.top) / rect.height) * viewport.height };
    };
    const onDown = (e: PointerEvent) => {
      const pt = getPoint(e);
      const sx = viewport.width * stateRef.current.sunX;
      const sy = viewport.height * (0.18 + (1 - easeOutCubic(clamp((stateRef.current.sunX - 0.16) / 0.66, 0, 1))) * 0.08);
      if (Math.hypot(pt.x - sx, pt.y - sy) > viewport.height * 0.08) return;
      dragRef.current = { active: true, offsetX: pt.x - sx };
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('drag_snap');
    };
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.active) return;
      const pt = getPoint(e);
      stateRef.current.sunX = clamp((pt.x - dragRef.current.offsetX) / viewport.width, 0.16, 0.82);
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
