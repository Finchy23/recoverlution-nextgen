import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.44;
const COMPLETE_T = 0.98;

export default function PendulumWeightAtom({
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
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    sync: 0,
    wobble: 0.9,
    thresholdFired: false,
    completionFired: false,
  });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onStateChange, onResolve]);
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
      if (!p.composed) drawAtmosphere(ctx, cx, h * 0.38, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.sync += (1 - s.sync) * 0.08;
      s.wobble += (0 - s.wobble) * 0.03;

      const reveal = easeOutCubic(clamp(s.sync, 0, 1));
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        cb.onHaptic('tap');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const t = performance.now() * 0.0015;
      const angle = Math.sin(t) * (0.8 - reveal * 0.45 + s.wobble * 0.2);
      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const deep = lerpColor([5, 7, 12], primary, 0.12);
      const weight = lerpColor([84, 94, 112], accent, 0.28);
      const calm = lerpColor(accent, [255, 214, 186], 0.72);
      ctx.fillStyle = rgba(deep, 0.95 * entrance);
      ctx.fillRect(0, 0, w, h);

      const pivotX = cx;
      const pivotY = h * 0.18;
      const length = minDim * 0.32;
      const bobX = pivotX + Math.sin(angle) * length;
      const bobY = pivotY + Math.cos(angle) * length;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.strokeStyle = rgba(weight, (0.18 + reveal * 0.28) * entrance);
      ctx.lineWidth = px(0.006, minDim);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(bobX, bobY, minDim * 0.05, 0, Math.PI * 2);
      ctx.fillStyle = rgba(lerpColor(weight, calm, reveal), (0.2 + reveal * 0.42) * entrance);
      ctx.fill();

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * viewport.width;
      const phaseValue = Math.abs(Math.sin(performance.now() * 0.0015));
      if (phaseValue < 0.16) {
        stateRef.current.sync = clamp(stateRef.current.sync + 0.26, 0, 1);
      } else {
        stateRef.current.wobble = 1;
        callbacksRef.current.onHaptic('error_boundary');
      }
      canvas.setPointerCapture(e.pointerId);
      canvas.releasePointerCapture(e.pointerId);
    };

    raf = window.requestAnimationFrame(render);
    canvas.addEventListener('pointerdown', onDown);
    return () => {
      window.cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} />
    </div>
  );
}
