import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import {
  advanceEntrance,
  drawAtmosphere,
  easeOutCubic,
  lerpColor,
  parseColor,
  px,
  rgba,
  roundedRect,
  setupCanvas,
} from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.44;
const COMPLETE_T = 0.975;

type Point = { x: number; y: number };

export default function HeavyAnchorGroundAtom({
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
  const dragRef = useRef<{ active: boolean; pointerId: number | null }>({ active: false, pointerId: null });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    progress: 0,
    target: 0,
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
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.phase === 'resolve') s.target = 1;
      s.progress += (s.target - s.progress) * 0.14;
      const reveal = easeOutCubic(clamp(s.progress, 0, 1));
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
      const deep = lerpColor([6, 9, 16], primary, 0.18);
      const steel = lerpColor([90, 102, 120], accent, 0.32);
      const ember = lerpColor(accent, [255, 204, 170], 0.74);

      ctx.fillStyle = rgba(deep, 0.9 * entrance);
      ctx.fillRect(0, 0, w, h);

      const jitter = (1 - reveal) * minDim * 0.04;
      for (let i = 0; i < 40; i += 1) {
        const t = i / 39;
        const x = (t * w + Math.sin(performance.now() * 0.006 + i * 0.8) * jitter + w) % w;
        const y = (Math.cos(performance.now() * 0.005 + i * 1.1) * jitter + h * (0.16 + (i % 11) / 11 * 0.64));
        ctx.beginPath();
        ctx.arc(x, y, minDim * 0.004, 0, Math.PI * 2);
        ctx.fillStyle = rgba(ember, (0.04 + (1 - reveal) * 0.18) * entrance);
        ctx.fill();
      }

      const bedrockY = h * 0.86;
      ctx.fillStyle = rgba(steel, (0.14 + reveal * 0.3) * entrance);
      ctx.fillRect(0, bedrockY, w, h - bedrockY);

      const anchorY = h * (0.22 + reveal * 0.62);
      const ringR = minDim * 0.06;
      ctx.beginPath();
      ctx.arc(cx, anchorY - ringR * 0.55, ringR, Math.PI * 0.25, Math.PI * 1.75);
      ctx.strokeStyle = rgba(lerpColor(steel, ember, 0.35), (0.22 + reveal * 0.34) * entrance);
      ctx.lineWidth = px(0.012, minDim);
      ctx.stroke();

      roundedRect(ctx, cx - minDim * 0.08, anchorY - minDim * 0.01, minDim * 0.16, minDim * 0.16, minDim * 0.026);
      ctx.fillStyle = rgba(steel, (0.24 + reveal * 0.4) * entrance);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx, anchorY + minDim * 0.15);
      ctx.lineTo(cx - minDim * 0.12, anchorY + minDim * 0.26);
      ctx.lineTo(cx - minDim * 0.03, anchorY + minDim * 0.16);
      ctx.moveTo(cx, anchorY + minDim * 0.15);
      ctx.lineTo(cx + minDim * 0.12, anchorY + minDim * 0.26);
      ctx.lineTo(cx + minDim * 0.03, anchorY + minDim * 0.16);
      ctx.strokeStyle = rgba(steel, (0.26 + reveal * 0.4) * entrance);
      ctx.lineWidth = px(0.012, minDim);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.stroke();

      const calmGlow = ctx.createRadialGradient(cx, bedrockY, 0, cx, bedrockY, minDim * 0.3);
      calmGlow.addColorStop(0, rgba(ember, (0.04 + reveal * 0.18) * entrance));
      calmGlow.addColorStop(1, rgba(ember, 0));
      ctx.fillStyle = calmGlow;
      ctx.fillRect(cx - minDim * 0.3, bedrockY - minDim * 0.3, minDim * 0.6, minDim * 0.6);

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
      dragRef.current = { active: true, pointerId: e.pointerId };
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.active || dragRef.current.pointerId !== e.pointerId) return;
      const pt = getPoint(e);
      const next = clamp((pt.y - viewport.height * 0.2) / (viewport.height * 0.64), 0, 1);
      stateRef.current.target = Math.max(stateRef.current.target, next);
      if (next > 0.18) callbacksRef.current.onHaptic('drag_snap');
    };
    const onUp = (e: PointerEvent) => {
      if (dragRef.current.pointerId === e.pointerId) {
        dragRef.current = { active: false, pointerId: null };
        canvas.releasePointerCapture(e.pointerId);
      }
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
