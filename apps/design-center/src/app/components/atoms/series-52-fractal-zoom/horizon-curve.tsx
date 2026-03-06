import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.44;
const COMPLETE_T = 0.97;

export default function HorizonCurveAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ color, accentColor, phase, composed });
  const holdRef = useRef(false);
  const stateRef = useRef({ entranceProgress: 0, primaryRgb: parseColor(color), accentRgb: parseColor(accentColor), reveal: 0, thresholdFired: false, completionFired: false });

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
      if (!p.composed) drawAtmosphere(ctx, cx, h * 0.48, w, h, minDim, s.primaryRgb, entrance);
      if (holdRef.current || p.phase === 'resolve') s.reveal += (1 - s.reveal) * 0.05;

      const reveal = easeOutCubic(clamp(s.reveal, 0, 1));
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) { s.thresholdFired = true; cb.onHaptic('step_advance'); }
      if (reveal >= COMPLETE_T && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const deep = lerpColor([3, 5, 9], primary, 0.1);
      const line = lerpColor(primary, [245, 247, 255], 0.88);
      const sphere = lerpColor(accent, [210, 232, 255], 0.42);
      ctx.fillStyle = rgba(deep, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      const horizonY = h * 0.64;
      ctx.beginPath();
      ctx.moveTo(w * 0.14, horizonY);
      ctx.quadraticCurveTo(cx, horizonY - minDim * 0.22 * reveal, w * 0.86, horizonY);
      ctx.strokeStyle = rgba(line, (0.22 + reveal * 0.6) * entrance);
      ctx.lineWidth = px(0.012, minDim);
      ctx.stroke();

      if (reveal > 0.12) {
        ctx.beginPath();
        ctx.arc(cx, horizonY + minDim * 0.04, minDim * 0.28 * reveal, Math.PI, Math.PI * 2);
        ctx.strokeStyle = rgba(sphere, reveal * 0.72 * entrance);
        ctx.lineWidth = px(0.008, minDim);
        ctx.stroke();
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onDown = (e: PointerEvent) => { holdRef.current = true; canvas.setPointerCapture(e.pointerId); callbacksRef.current.onHaptic('hold_start'); };
    const onUp = (e: PointerEvent) => { holdRef.current = false; canvas.releasePointerCapture(e.pointerId); };

    raf = window.requestAnimationFrame(render);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    return () => {
      window.cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return <div style={{ position: 'absolute', inset: 0 }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} /></div>;
}
