import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor,
  lerpColor,
  rgba,
  easeOutCubic,
  setupCanvas,
  advanceEntrance,
  drawAtmosphere,
  px,
} from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.44;
const COMPLETE_T = 0.965;

type Point = { x: number; y: number };

export default function CamouflageParallaxAtom({
  breathAmplitude,
  reducedMotion,
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
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    tiltX: 0,
    tiltY: 0,
    reveal: 0,
    thresholdFired: false,
    completionFired: false,
    revealFlash: 0,
  });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);
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

    const cells = Array.from({ length: 36 }, (_, i) => ({
      x: (i % 6) - 2.5,
      y: Math.floor(i / 6) - 2.5,
    }));
    const hidden = { x: 0.5, y: -0.5 };

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.reveal = Math.max(s.reveal, 1);
      else {
        const depth = Math.min(1, Math.hypot(s.tiltX, s.tiltY) / 0.34);
        s.reveal += (depth - s.reveal) * 0.1;
      }
      s.revealFlash = Math.max(0, s.revealFlash - 0.02);

      const reveal = easeOutCubic(clamp(s.reveal, 0, 1));
      const boost = p.composed ? 1.18 : 1;
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.72;
        cb.onHaptic('step_advance');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        s.revealFlash = 1;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const field = lerpColor(primary, accent, 0.18);
      const dense = lerpColor([5, 6, 12], primary, 0.1);
      const pattern = lerpColor(primary, [245, 247, 255], 0.86);
      const anomaly = lerpColor(accent, [255, 232, 208], 0.78);

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.84);
      bg.addColorStop(0, rgba(field, Math.min(0.14, (0.04 + reveal * 0.06) * entrance * boost)));
      bg.addColorStop(1, rgba(dense, Math.min(0.96, (0.24 + (1 - reveal) * 0.14) * entrance * boost)));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const spacing = minDim * 0.11;
      const bgOffsetX = s.tiltX * minDim * 0.16;
      const bgOffsetY = s.tiltY * minDim * 0.16;
      for (const cell of cells) {
        const isHidden = cell.x === hidden.x && cell.y === hidden.y;
        const fx = cx + cell.x * spacing + bgOffsetX;
        const fy = cy + cell.y * spacing + bgOffsetY;
        const depthLiftX = isHidden ? s.tiltX * minDim * 0.28 : 0;
        const depthLiftY = isHidden ? s.tiltY * minDim * 0.28 : 0;
        ctx.beginPath();
        ctx.arc(fx + depthLiftX, fy + depthLiftY, minDim * 0.022 * (isHidden ? 1.18 : 1), 0, Math.PI * 2);
        ctx.fillStyle = rgba(isHidden ? anomaly : pattern, Math.min(0.88, (0.16 + (isHidden ? reveal * 0.52 : 0.2)) * entrance * boost));
        ctx.fill();
      }

      if (reveal > 0.12) {
        const ringX = cx + hidden.x * spacing + s.tiltX * minDim * 0.44;
        const ringY = cy + hidden.y * spacing + s.tiltY * minDim * 0.44;
        ctx.beginPath();
        ctx.arc(ringX, ringY, minDim * (0.05 + reveal * 0.04), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(anomaly, Math.min(0.46, (0.08 + reveal * 0.24 + s.revealFlash * 0.06) * entrance * boost));
        ctx.lineWidth = px(0.004, minDim);
        ctx.stroke();
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const updateTiltFromPoint = (point: Point) => {
      const nx = (point.x / viewport.width - 0.5) * 2;
      const ny = (point.y / viewport.height - 0.5) * 2;
      stateRef.current.tiltX = clamp(nx * 0.18, -0.18, 0.18);
      stateRef.current.tiltY = clamp(ny * 0.18, -0.18, 0.18);
    };

    const getPoint = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * viewport.width,
        y: ((e.clientY - rect.top) / rect.height) * viewport.height,
      };
    };

    const onMove = (e: PointerEvent) => updateTiltFromPoint(getPoint(e));
    const onLeave = () => {
      stateRef.current.tiltX *= 0.5;
      stateRef.current.tiltY *= 0.5;
    };

    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      stateRef.current.tiltX = clamp(e.gamma / 90, -0.2, 0.2);
      stateRef.current.tiltY = clamp(e.beta / 180, -0.2, 0.2);
    };

    raf = window.requestAnimationFrame(render);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    window.addEventListener('deviceorientation', onOrientation);
    return () => {
      window.cancelAnimationFrame(raf);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('deviceorientation', onOrientation);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'move' }} />
    </div>
  );
}
