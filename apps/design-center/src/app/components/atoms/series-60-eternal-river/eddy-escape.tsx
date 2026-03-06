import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
type Point = { x: number; y: number };

export default function EddyEscapeAtom({
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
    angle: 0,
    escaped: false,
    nodeX: 0.28,
    nodeY: 0.52,
    currentY: 0.52,
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

      const eddyCx = w * 0.28;
      const eddyCy = cy;
      const eddyR = minDim * 0.16;
      s.angle += 0.04;

      if (!s.escaped) {
        s.nodeX = 0.28 + Math.cos(s.angle) * 0.1 * (minDim / w);
        s.nodeY = 0.52 + Math.sin(s.angle) * 0.12 * (minDim / h);
      } else {
        s.currentY += 0.012;
        s.nodeX += (0.66 - s.nodeX) * 0.035;
        s.nodeY = s.currentY;
        if (s.nodeY > 1.08 && !s.completionFired) {
          s.completionFired = true;
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      }

      cb.onStateChange?.(s.escaped ? clamp((s.nodeY - 0.52) / 0.5, 0, 1) : 0);
      const safe = lerpColor([146, 182, 220], s.primaryRgb, 0.18);
      const current = lerpColor([92, 210, 255], s.primaryRgb, 0.24);
      const accent = lerpColor([255, 166, 84], s.accentRgb, 0.2);

      for (let i = 0; i < 5; i += 1) {
        ctx.strokeStyle = rgba(safe, (0.08 + i * 0.02) * entrance);
        ctx.lineWidth = px(0.003, minDim);
        ctx.beginPath();
        ctx.arc(eddyCx, eddyCy, eddyR * (0.45 + i * 0.12), 0, Math.PI * 2);
        ctx.stroke();
      }

      for (let i = 0; i < 16; i += 1) {
        const x = w * (0.54 + i * 0.025);
        const y = h * ((Date.now() * 0.00022 + i * 0.07) % 1);
        ctx.strokeStyle = rgba(current, (0.16 + (s.escaped ? 0.08 : 0)) * entrance);
        ctx.lineWidth = px(0.003 + (s.escaped ? 0.002 : 0), minDim);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + h * 0.12);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(w * s.nodeX, h * s.nodeY, minDim * 0.04, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.escaped ? current : accent, 0.75 * entrance);
      ctx.fill();

      if (!s.escaped) {
        ctx.strokeStyle = rgba(accent, 0.18 * entrance);
        ctx.lineWidth = px(0.01, minDim);
        ctx.beginPath();
        ctx.arc(eddyCx, eddyCy, eddyR * 1.08, -0.1, Math.PI * 1.55);
        ctx.stroke();
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
      if (stateRef.current.escaped) return;
      dragRef.current = { active: true, last: getPoint(e) };
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      const s = stateRef.current;
      if (!drag.active || !drag.last || s.escaped) return;
      const pt = getPoint(e);
      const dx = (pt.x - drag.last.x) / viewport.width;
      s.nodeX = clamp(s.nodeX + dx, 0.18, 0.72);
      if (s.nodeX > 0.46) {
        s.escaped = true;
        s.currentY = s.nodeY;
        callbacksRef.current.onHaptic('swipe_commit');
      }
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
