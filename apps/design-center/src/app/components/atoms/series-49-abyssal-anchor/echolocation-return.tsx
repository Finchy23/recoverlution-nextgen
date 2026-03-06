import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.46;
const COMPLETE_T = 0.97;

type ReturnPulse = { x: number; y: number; delay: number };

export default function EcholocationReturnAtom({
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
    sentAt: 0,
    progress: 0,
    active: false,
    thresholdFired: false,
    completionFired: false,
  });
  const returnsRef = useRef<ReturnPulse[]>([]);

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
    returnsRef.current = Array.from({ length: 18 }, (_, i) => ({
      x: 0.18 + (i % 6) * 0.13,
      y: 0.18 + Math.floor(i / 6) * 0.12,
      delay: i * 90,
    }));
  }, []);

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
      if (!p.composed) drawAtmosphere(ctx, cx, h * 0.76, w, h, minDim, s.primaryRgb, entrance);

      if (p.phase === 'resolve' && !s.active) {
        s.active = true;
        s.sentAt = performance.now();
      }
      if (s.active) {
        s.progress = clamp((performance.now() - s.sentAt) / 2200, 0, 1);
      }
      const reveal = easeOutCubic(s.progress);
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        cb.onHaptic('step_advance');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const deep = lerpColor([4, 6, 10], primary, 0.12);
      const warm = lerpColor(accent, [255, 216, 186], 0.78);
      const cool = lerpColor(primary, [236, 246, 255], 0.9);

      ctx.fillStyle = rgba(deep, 0.95 * entrance);
      ctx.fillRect(0, 0, w, h);

      const baseY = h * 0.84;
      ctx.beginPath();
      ctx.arc(cx, baseY, minDim * 0.03, 0, Math.PI * 2);
      ctx.fillStyle = rgba(cool, (0.18 + reveal * 0.46) * entrance);
      ctx.fill();

      if (s.active) {
        const pulseP = clamp(reveal * 1.18, 0, 1);
        for (let i = 0; i < 4; i += 1) {
          const ring = clamp(pulseP - i * 0.16, 0, 1);
          if (ring <= 0) continue;
          ctx.beginPath();
          ctx.arc(cx, baseY - ring * h * 0.62, minDim * (0.04 + ring * 0.1), 0, Math.PI * 2);
          ctx.strokeStyle = rgba(cool, (0.14 + ring * 0.22) * entrance);
          ctx.lineWidth = px(0.004, minDim);
          ctx.stroke();
        }

        const now = performance.now() - s.sentAt;
        for (const pulse of returnsRef.current) {
          if (now < 900 + pulse.delay) continue;
          const local = clamp((now - 900 - pulse.delay) / 900, 0, 1);
          const x = w * pulse.x;
          const y = h * pulse.y + local * h * 0.5;
          ctx.beginPath();
          ctx.arc(x, y, minDim * (0.007 + local * 0.008), 0, Math.PI * 2);
          ctx.fillStyle = rgba(warm, (0.14 + (1 - local) * 0.34) * entrance);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(x, y - minDim * 0.02);
          ctx.lineTo(x, y + minDim * 0.02);
          ctx.strokeStyle = rgba(warm, 0.24 * entrance * (1 - local));
          ctx.lineWidth = px(0.002, minDim);
          ctx.stroke();
        }
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onDown = (e: PointerEvent) => {
      if (stateRef.current.active) return;
      stateRef.current.active = true;
      stateRef.current.sentAt = performance.now();
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('tap');
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
