import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
type Point = { x: number; y: number };

export default function CataractPlungeAtom({
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
  const dragRef = useRef<{ active: boolean; last: Point | null }>({ active: false, last: null });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    nodeX: 0.3,
    nodeY: 0.14,
    plunge: false,
    fallVelocity: 0.008,
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

      if (!s.plunge) {
        s.nodeY = Math.min(0.46, s.nodeY + 0.0035);
        if (s.nodeY >= 0.43 && Math.abs(s.nodeX - 0.5) > 0.08 && !s.warningFired) {
          s.warningFired = true;
          cb.onHaptic('error_boundary');
        }
        if (s.nodeY >= 0.45 && Math.abs(s.nodeX - 0.5) <= 0.08) {
          s.plunge = true;
          cb.onHaptic('drag_snap');
        }
      } else {
        s.fallVelocity = Math.min(0.04, s.fallVelocity + 0.0012);
        s.nodeY += s.fallVelocity;
        s.nodeX += (0.5 - s.nodeX) * 0.08;
        if (s.nodeY > 1.08 && !s.completionFired) {
          s.completionFired = true;
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      }

      cb.onStateChange?.(s.plunge ? clamp((s.nodeY - 0.45) / 0.52, 0, 1) : clamp((0.45 - s.nodeY) / 0.32, 0, 0.4));
      const water = lerpColor([102, 184, 255], s.primaryRgb, 0.22);
      const voidRgb = lerpColor([10, 12, 20], s.primaryRgb, 0.1);
      const glow = lerpColor([244, 250, 255], s.primaryRgb, 0.55);

      ctx.fillStyle = rgba(voidRgb, 0.96 * entrance);
      ctx.fillRect(0, h * 0.48, w, h * 0.52);

      for (let i = 0; i < 16; i += 1) {
        const x = w * (0.08 + i * 0.055);
        ctx.strokeStyle = rgba(water, (0.12 + (s.plunge ? 0.08 : 0)) * entrance);
        ctx.lineWidth = px(0.003 + (s.plunge ? 0.001 : 0), minDim);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + (0.5 - x / w) * w * 0.16, h * 0.48);
        ctx.stroke();
      }

      ctx.strokeStyle = rgba(glow, 0.16 * entrance);
      ctx.lineWidth = px(0.01, minDim);
      ctx.beginPath();
      ctx.moveTo(0, h * 0.48);
      ctx.lineTo(w, h * 0.48);
      ctx.stroke();

      if (s.plunge) {
        const shaft = ctx.createLinearGradient(cx, h * 0.48, cx, h);
        shaft.addColorStop(0, rgba(glow, 0.26 * entrance));
        shaft.addColorStop(1, rgba(water, 0));
        ctx.fillStyle = shaft;
        ctx.fillRect(cx - minDim * 0.12, h * 0.48, minDim * 0.24, h * 0.52);
      }

      ctx.beginPath();
      ctx.arc(w * s.nodeX, h * s.nodeY, minDim * (s.plunge ? 0.03 : 0.038), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.plunge ? glow : water, 0.78 * entrance);
      ctx.fill();

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getPoint = (e: PointerEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return { x: ((e.clientX - rect.left) / rect.width) * viewport.width, y: ((e.clientY - rect.top) / rect.height) * viewport.height };
    };

    const onDown = (e: PointerEvent) => {
      if (stateRef.current.plunge) return;
      dragRef.current = { active: true, last: getPoint(e) };
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag.active || !drag.last || stateRef.current.plunge) return;
      const pt = getPoint(e);
      stateRef.current.nodeX = clamp(stateRef.current.nodeX + (pt.x - drag.last.x) / viewport.width, 0.18, 0.82);
      drag.last = pt;
    };

    const onUp = (e: PointerEvent) => {
      dragRef.current = { active: false, last: null };
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
