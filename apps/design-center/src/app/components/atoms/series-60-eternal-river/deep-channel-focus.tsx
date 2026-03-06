import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
type Point = { x: number; y: number };

export default function DeepChannelFocusAtom({
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
  const dragRef = useRef<{ active: boolean; last: Point | null; side: 'left' | 'right' | null }>({ active: false, last: null, side: null });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    leftBank: 0.18,
    rightBank: 0.82,
    stepFired: false,
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

      const width = s.rightBank - s.leftBank;
      const resolve = easeOutCubic(clamp((0.64 - width) / 0.42, 0, 1));
      cb.onStateChange?.(resolve);

      if (resolve >= 0.5 && !s.stepFired) {
        s.stepFired = true;
        cb.onHaptic('step_advance');
      }
      if (resolve >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const river = lerpColor([98, 196, 255], s.primaryRgb, 0.24);
      const core = lerpColor([240, 248, 255], s.primaryRgb, 0.5);
      const banks = lerpColor([26, 28, 34], s.primaryRgb, 0.14);

      ctx.fillStyle = rgba(banks, 0.98 * entrance);
      ctx.fillRect(0, 0, w * s.leftBank, h);
      ctx.fillRect(w * s.rightBank, 0, w * (1 - s.rightBank), h);

      for (let i = 0; i < 18; i += 1) {
        const x = w * (s.leftBank + width * (i / 17));
        const t = i / 17;
        ctx.strokeStyle = rgba(river, (0.06 + resolve * 0.22 + (1 - Math.abs(t - 0.5) * 1.7) * 0.06) * entrance);
        ctx.lineWidth = px(0.002 + resolve * 0.009 * (1 - Math.abs(t - 0.5)), minDim);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(cx, cy, minDim * (0.034 + resolve * 0.018), 0, Math.PI * 2);
      ctx.fillStyle = rgba(core, (0.26 + resolve * 0.4) * entrance);
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
      dragRef.current = { active: true, last: pt, side: pt.x < viewport.width / 2 ? 'left' : 'right' };
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('hold_start');
    };

    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag.active || !drag.last || !drag.side) return;
      const pt = getPoint(e);
      const dx = (pt.x - drag.last.x) / viewport.width;
      if (drag.side === 'left') stateRef.current.leftBank = clamp(stateRef.current.leftBank + Math.max(0, dx), 0.18, stateRef.current.rightBank - 0.18);
      if (drag.side === 'right') stateRef.current.rightBank = clamp(stateRef.current.rightBank + Math.min(0, dx), stateRef.current.leftBank + 0.18, 0.82);
      drag.last = pt;
    };

    const onUp = (e: PointerEvent) => {
      dragRef.current = { active: false, last: null, side: null };
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
