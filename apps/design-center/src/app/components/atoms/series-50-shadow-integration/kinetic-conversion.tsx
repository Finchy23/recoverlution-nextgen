import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.42;
const COMPLETE_T = 0.98;

type Point = { x: number; y: number };

export default function KineticConversionAtom({
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
  const dragRef = useRef(false);
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    coreX: 0.5,
    coreY: 0.26,
    launch: 0,
    ignited: false,
    thresholdFired: false,
    completionFired: false,
  });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onResolve, onStateChange]);
  useEffect(() => {
    propsRef.current = { color, accentColor, phase, composed };
  }, [color, accentColor, phase, composed]);
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
      const { w, h, cx, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, h * 0.54, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve' && s.ignited) s.launch += (1 - s.launch) * 0.08;
      if (s.ignited) s.launch = clamp(s.launch + 0.03, 0, 1);

      const reveal = easeOutCubic(clamp(s.launch, 0, 1));
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        cb.onHaptic('swipe_commit');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const deep = lerpColor([5, 7, 12], primary, 0.14);
      const dark = lerpColor([8, 10, 14], accent, 0.18);
      const fuel = lerpColor(accent, [255, 196, 132], 0.8);
      const core = lerpColor(primary, [246, 248, 255], 0.92);
      ctx.fillStyle = rgba(deep, 0.95 * entrance);
      ctx.fillRect(0, 0, w, h);

      const massY = h * 0.74;
      ctx.beginPath();
      ctx.arc(cx, massY, minDim * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = rgba(dark, (0.22 + (1 - reveal) * 0.4) * entrance);
      ctx.fill();

      const coreX = w * s.coreX;
      const coreY = h * (s.coreY - reveal * 0.28);
      ctx.beginPath();
      ctx.arc(coreX, coreY, minDim * 0.034, 0, Math.PI * 2);
      ctx.fillStyle = rgba(core, (0.18 + reveal * 0.66) * entrance);
      ctx.fill();

      if (s.ignited) {
        for (let i = 0; i < 9; i += 1) {
          const x = cx + (i - 4) * minDim * 0.02;
          ctx.beginPath();
          ctx.moveTo(x, massY - minDim * 0.02);
          ctx.lineTo(x, massY + minDim * (0.04 + reveal * 0.16));
          ctx.strokeStyle = rgba(fuel, (0.12 + (1 - reveal) * 0.44) * entrance);
          ctx.lineWidth = px(0.004, minDim);
          ctx.stroke();
        }
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
      dragRef.current = true;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current || stateRef.current.ignited) return;
      const pt = getPoint(e);
      stateRef.current.coreX = clamp(pt.x / viewport.width, 0.2, 0.8);
      stateRef.current.coreY = clamp(pt.y / viewport.height, 0.2, 0.78);
      if (pt.y / viewport.height > 0.62) {
        stateRef.current.ignited = true;
        callbacksRef.current.onHaptic('drag_snap');
      }
    };
    const onUp = (e: PointerEvent) => {
      dragRef.current = false;
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

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} />
    </div>
  );
}
