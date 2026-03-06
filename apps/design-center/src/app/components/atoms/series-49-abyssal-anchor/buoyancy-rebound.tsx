import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STILL_MS = 3000;
const STEP_T = 0.44;
const COMPLETE_T = 0.985;

export default function BuoyancyReboundAtom({
  breathAmplitude,
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
  const propsRef = useRef({ breathAmplitude, color, accentColor, phase, composed });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    releasedAt: 0,
    waiting: false,
    ascent: 0,
    thresholdFired: false,
    completionFired: false,
  });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onResolve, onStateChange]);
  useEffect(() => {
    propsRef.current = { breathAmplitude, color, accentColor, phase, composed };
  }, [breathAmplitude, color, accentColor, phase, composed]);
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
      if (!p.composed) drawAtmosphere(ctx, cx, h * 0.78, w, h, minDim, s.primaryRgb, entrance);

      if (p.phase === 'resolve' && !s.waiting && s.ascent === 0) {
        s.waiting = true;
        s.releasedAt = performance.now();
      }
      if (s.waiting) {
        const waitP = clamp((performance.now() - s.releasedAt) / STILL_MS, 0, 1);
        if (waitP >= 1) {
          s.waiting = false;
          s.ascent = 0.001;
          cb.onHaptic('step_advance');
        }
      }
      if (s.ascent > 0) s.ascent = clamp(s.ascent + 0.028, 0, 1);

      const reveal = easeOutCubic(clamp(s.ascent, 0, 1));
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) s.thresholdFired = true;
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const trench = lerpColor([5, 7, 12], primary, 0.14);
      const floor = lerpColor([92, 104, 120], accent, 0.26);
      const node = lerpColor(primary, [244, 248, 255], 0.9);
      const buoy = lerpColor(accent, [255, 228, 194], 0.78);
      ctx.fillStyle = rgba(trench, 0.96 * entrance);
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = rgba(floor, 0.24 * entrance);
      ctx.fillRect(0, h * 0.86, w, h * 0.14);

      const nodeY = h * (0.86 - reveal * 0.72);
      const radius = minDim * (0.034 + breathAmplitude * 0.002 + reveal * 0.012);
      const glow = ctx.createRadialGradient(cx, nodeY, 0, cx, nodeY, minDim * 0.28);
      glow.addColorStop(0, rgba(buoy, (0.06 + reveal * 0.44) * entrance));
      glow.addColorStop(1, rgba(buoy, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(cx - minDim * 0.28, nodeY - minDim * 0.28, minDim * 0.56, minDim * 0.56);

      ctx.beginPath();
      ctx.arc(cx, nodeY, radius, 0, Math.PI * 2);
      ctx.fillStyle = rgba(node, (0.16 + reveal * 0.7) * entrance);
      ctx.fill();

      if (s.waiting) {
        const waitP = clamp((performance.now() - s.releasedAt) / STILL_MS, 0, 1);
        for (let i = 0; i < 3; i += 1) {
          const ring = clamp(waitP - i * 0.12, 0, 1);
          if (ring <= 0) continue;
          ctx.beginPath();
          ctx.arc(cx, h * 0.86, minDim * (0.05 + ring * 0.08), 0, Math.PI * 2);
          ctx.strokeStyle = rgba(node, (0.08 + ring * 0.1) * entrance);
          ctx.lineWidth = px(0.003, minDim);
          ctx.stroke();
        }
      }

      if (reveal > 0) {
        ctx.beginPath();
        ctx.moveTo(cx, h * 0.86);
        ctx.lineTo(cx, nodeY + radius * 0.4);
        ctx.strokeStyle = rgba(buoy, (0.04 + reveal * 0.18) * entrance);
        ctx.lineWidth = px(0.003, minDim);
        ctx.stroke();
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onDown = (e: PointerEvent) => {
      stateRef.current.waiting = false;
      stateRef.current.releasedAt = 0;
      stateRef.current.ascent = 0;
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('hold_start');
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.waiting = true;
      stateRef.current.releasedAt = performance.now();
      callbacksRef.current.onHaptic('hold_release');
      canvas.releasePointerCapture(e.pointerId);
    };

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

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} />
    </div>
  );
}
