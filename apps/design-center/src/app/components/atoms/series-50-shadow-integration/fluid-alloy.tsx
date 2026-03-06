import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.44;
const COMPLETE_T = 0.97;

export default function FluidAlloyAtom({
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
  const tiltRef = useRef({ x: 0, y: 0 });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    merge: 0,
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
    const onOrientation = (event: DeviceOrientationEvent) => {
      const beta = typeof event.beta === 'number' ? event.beta : 0;
      const gamma = typeof event.gamma === 'number' ? event.gamma : 0;
      tiltRef.current.x = clamp(gamma / 30, -1, 1);
      tiltRef.current.y = clamp(beta / 45, -1, 1);
    };
    window.addEventListener('deviceorientation', onOrientation);
    return () => window.removeEventListener('deviceorientation', onOrientation);
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
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const leftX = cx - minDim * 0.16 + tiltRef.current.x * minDim * 0.11;
      const rightX = cx + minDim * 0.16 + tiltRef.current.x * minDim * 0.11;
      const y = cy + tiltRef.current.y * minDim * 0.08;
      const dist = Math.abs(rightX - leftX);
      const target = clamp(1 - dist / (minDim * 0.32), 0, 1);
      if (p.phase === 'resolve') s.merge += (1 - s.merge) * 0.08;
      else s.merge += (target - s.merge) * 0.12;

      const reveal = easeOutCubic(clamp(s.merge, 0, 1));
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
      const deep = lerpColor([5, 7, 12], primary, 0.14);
      const bright = lerpColor(primary, [244, 247, 255], 0.92);
      const dark = lerpColor([10, 11, 14], primary, 0.08);
      const alloy = lerpColor(accent, [196, 205, 220], 0.5);
      ctx.fillStyle = rgba(deep, 0.94 * entrance);
      ctx.fillRect(0, 0, w, h);

      const lx = leftX + (cx - leftX) * reveal;
      const rx = rightX + (cx - rightX) * reveal;
      const blobR = minDim * 0.12;
      if (reveal < 0.9) {
        ctx.beginPath();
        ctx.arc(lx, y, blobR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(bright, (0.2 + (1 - reveal) * 0.5) * entrance);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rx, y, blobR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(dark, (0.2 + (1 - reveal) * 0.5) * entrance);
        ctx.fill();
      }

      const stripeCount = 16;
      const radius = minDim * (0.11 + reveal * 0.04);
      for (let i = 0; i < stripeCount; i += 1) {
        const t = i / stripeCount;
        const angle = t * Math.PI * 2 + performance.now() * 0.0014;
        const sx = cx + Math.cos(angle) * radius;
        const sy = y + Math.sin(angle) * radius * 0.72;
        ctx.beginPath();
        ctx.moveTo(cx - radius, sy);
        ctx.lineTo(cx + radius, sy + Math.sin(angle) * minDim * 0.03);
        const tone = t % 0.25 < 0.125 ? bright : alloy;
        ctx.strokeStyle = rgba(tone, reveal * 0.5 * entrance);
        ctx.lineWidth = px(0.004, minDim);
        ctx.stroke();
      }

      const glow = ctx.createRadialGradient(cx, y, 0, cx, y, minDim * 0.34);
      glow.addColorStop(0, rgba(alloy, (0.06 + reveal * 0.34) * entrance));
      glow.addColorStop(1, rgba(alloy, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(cx - minDim * 0.34, y - minDim * 0.34, minDim * 0.68, minDim * 0.68);

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      tiltRef.current.x = clamp(nx, -1, 1);
      tiltRef.current.y = clamp(ny, -1, 1);
    };

    raf = window.requestAnimationFrame(render);
    canvas.addEventListener('pointermove', onMove);
    return () => {
      window.cancelAnimationFrame(raf);
      canvas.removeEventListener('pointermove', onMove);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
