import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.4;
const COMPLETE_T = 0.96;

type Point = { x: number; y: number; t: number };

export default function DropInOceanAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ color, accentColor, phase, composed });
  const dragRef = useRef<{ active: boolean; last: Point | null }>({ active: false, last: null });
  const stateRef = useRef({ entranceProgress: 0, primaryRgb: parseColor(color), accentRgb: parseColor(accentColor), dropY: 0.32, dissolve: 0, ripple: 0, thresholdFired: false, completionFired: false });

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
      if (!p.composed) drawAtmosphere(ctx, cx, h * 0.55, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.dissolve += (1 - s.dissolve) * 0.08;
      s.dissolve = clamp(s.dissolve, 0, 1);
      s.ripple += 0.02;

      const reveal = easeOutCubic(s.dissolve);
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) { s.thresholdFired = true; cb.onHaptic('step_advance'); }
      if (reveal >= COMPLETE_T && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const deep = lerpColor([4, 6, 10], primary, 0.12);
      const ocean = lerpColor(primary, [203, 230, 255], 0.34);
      const drop = lerpColor(accent, [244, 247, 255], 0.62);
      ctx.fillStyle = rgba(deep, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      const horizonY = h * (0.72 - reveal * 0.08);
      ctx.fillStyle = rgba(ocean, (0.14 + reveal * 0.46) * entrance);
      ctx.fillRect(0, horizonY, w, h - horizonY);

      const dropX = cx;
      const dropY = h * (s.dropY + reveal * 0.4);
      const size = minDim * (0.08 - reveal * 0.06);
      ctx.beginPath();
      ctx.moveTo(dropX, dropY - size);
      ctx.quadraticCurveTo(dropX + size, dropY - size * 0.1, dropX + size * 0.6, dropY + size * 0.8);
      ctx.quadraticCurveTo(dropX, dropY + size * 1.2, dropX - size * 0.6, dropY + size * 0.8);
      ctx.quadraticCurveTo(dropX - size, dropY - size * 0.1, dropX, dropY - size);
      ctx.fillStyle = rgba(drop, (0.22 + (1 - reveal) * 0.56) * entrance);
      ctx.fill();

      for (let i = 0; i < 3; i += 1) {
        const r = minDim * (0.08 + i * 0.05 + reveal * 0.18 + (s.ripple % 1) * 0.04);
        ctx.beginPath();
        ctx.arc(cx, horizonY, r, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(drop, Math.max(0, (0.24 - i * 0.06) * reveal) * entrance);
        ctx.lineWidth = px(0.004, minDim);
        ctx.stroke();
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getPoint = (e: PointerEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return { x: ((e.clientX - rect.left) / rect.width) * viewport.width, y: ((e.clientY - rect.top) / rect.height) * viewport.height, t: performance.now() };
    };
    const onDown = (e: PointerEvent) => { dragRef.current = { active: true, last: getPoint(e) }; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.active || !dragRef.current.last) return;
      const next = getPoint(e);
      const prev = dragRef.current.last;
      const dy = next.y - prev.y;
      const dt = Math.max(16, next.t - prev.t);
      const speed = Math.abs(dy) / dt;
      if (dy > 0 && speed > 0.8) {
        stateRef.current.dissolve = clamp(stateRef.current.dissolve + (dy / viewport.height) * 3.2, 0, 1);
        callbacksRef.current.onHaptic('swipe_commit');
      }
      dragRef.current.last = next;
    };
    const onUp = (e: PointerEvent) => { dragRef.current = { active: false, last: null }; canvas.releasePointerCapture(e.pointerId); };

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
