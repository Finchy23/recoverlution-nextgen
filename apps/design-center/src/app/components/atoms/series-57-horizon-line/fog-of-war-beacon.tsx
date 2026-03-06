import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
type Point = { x: number; y: number };

export default function FogOfWarBeaconAtom({
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
    beaconY: 0.78,
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

      const resolve = easeOutCubic(clamp((0.78 - s.beaconY) / 0.56, 0, 1));
      cb.onStateChange?.(resolve);
      if (resolve >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const bg = lerpColor([12, 14, 20], s.primaryRgb, 0.14);
      const blueprint = lerpColor([112, 178, 246], s.primaryRgb, 0.24);
      const beacon = lerpColor([250, 223, 170], s.accentRgb, 0.28);
      const fog = lerpColor([28, 34, 44], s.primaryRgb, 0.06);
      ctx.fillStyle = rgba(bg, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      const gridTop = h * 0.18;
      const gridBottom = h * 0.82;
      for (let i = 0; i < 10; i += 1) {
        const y = gridTop + ((gridBottom - gridTop) * i) / 9;
        ctx.strokeStyle = rgba(blueprint, (0.04 + resolve * 0.18) * entrance);
        ctx.lineWidth = px(0.002, minDim);
        ctx.beginPath();
        ctx.moveTo(w * 0.2, y);
        ctx.lineTo(w * 0.8, y);
        ctx.stroke();
      }
      for (let i = 0; i < 8; i += 1) {
        const x = w * (0.2 + (0.6 * i) / 7);
        ctx.beginPath();
        ctx.moveTo(x, gridTop);
        ctx.lineTo(x, gridBottom);
        ctx.stroke();
      }

      const by = h * s.beaconY;
      const radius = minDim * (0.08 + resolve * 0.26);
      const fogGrad = ctx.createRadialGradient(cx, by, radius * 0.35, cx, by, radius);
      fogGrad.addColorStop(0, rgba(beacon, 0.36 * entrance));
      fogGrad.addColorStop(1, rgba(beacon, 0));
      ctx.fillStyle = fogGrad;
      ctx.beginPath();
      ctx.arc(cx, by, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, by, minDim * 0.04, 0, Math.PI * 2);
      ctx.fillStyle = rgba(beacon, 0.86 * entrance);
      ctx.fill();

      for (let i = 0; i < 18; i += 1) {
        const blockY = h * (0.14 + (i * 0.05) % 0.7);
        const alpha = blockY < by - radius ? 0.78 : 0.78 * clamp((blockY - (by - radius)) / (radius * 2), 0, 1);
        ctx.fillStyle = rgba(fog, alpha * entrance);
        ctx.fillRect(0, blockY, w, h * 0.06);
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getPoint = (e: PointerEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * viewport.width,
        y: ((e.clientY - rect.top) / rect.height) * viewport.height,
      };
    };

    const onDown = (e: PointerEvent) => {
      const pt = getPoint(e);
      const by = viewport.height * stateRef.current.beaconY;
      if (Math.hypot(pt.x - viewport.width / 2, pt.y - by) > viewport.height * 0.08) return;
      dragRef.current = { active: true, offsetY: pt.y - by };
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('drag_snap');
    };
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.active) return;
      const pt = getPoint(e);
      const nextY = clamp((pt.y - dragRef.current.offsetY) / viewport.height, 0.22, 0.78);
      stateRef.current.beaconY = nextY;
    };
    const onUp = (e: PointerEvent) => {
      dragRef.current.active = false;
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
