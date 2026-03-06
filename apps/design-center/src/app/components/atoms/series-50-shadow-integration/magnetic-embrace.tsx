import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.42;
const COMPLETE_T = 0.975;

type Point = { x: number; y: number };

export default function MagneticEmbraceAtom({
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
  const dragRef = useRef<{ active: boolean; offsetX: number; offsetY: number }>({ active: false, offsetX: 0, offsetY: 0 });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    shadowX: 0.32,
    shadowY: 0.54,
    merge: 0,
    targetMerge: 0,
    errorCooldown: 0,
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
      const { w, h, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, w * 0.6, h * 0.5, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.targetMerge = 1;
      s.merge += (s.targetMerge - s.merge) * 0.12;
      s.errorCooldown = Math.max(0, s.errorCooldown - 1);

      const reveal = easeOutCubic(clamp(s.merge, 0, 1));
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        cb.onHaptic('drag_snap');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const deep = lerpColor([5, 7, 12], primary, 0.14);
      const core = lerpColor(primary, [246, 248, 255], 0.94);
      const warm = lerpColor(accent, [255, 214, 186], 0.76);
      const shadowTone = lerpColor([6, 7, 10], primary, 0.08);
      ctx.fillStyle = rgba(deep, 0.95 * entrance);
      ctx.fillRect(0, 0, w, h);

      const coreX = w * 0.66;
      const coreY = h * 0.54;
      const sx = w * s.shadowX + (coreX - w * s.shadowX) * reveal;
      const sy = h * s.shadowY + (coreY - h * s.shadowY) * reveal;

      const glow = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, minDim * 0.34);
      glow.addColorStop(0, rgba(warm, (0.08 + reveal * 0.38) * entrance));
      glow.addColorStop(1, rgba(warm, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(coreX - minDim * 0.34, coreY - minDim * 0.34, minDim * 0.68, minDim * 0.68);

      ctx.beginPath();
      ctx.arc(coreX, coreY, minDim * (0.038 + reveal * 0.02 + breathAmplitude * 0.002), 0, Math.PI * 2);
      ctx.fillStyle = rgba(core, (0.2 + reveal * 0.68) * entrance);
      ctx.fill();

      if (reveal < 0.98) {
        ctx.beginPath();
        ctx.arc(sx, sy, minDim * (0.046 - reveal * 0.01), 0, Math.PI * 2);
        ctx.fillStyle = rgba(shadowTone, (0.2 + (1 - reveal) * 0.5) * entrance);
        ctx.fill();
        for (let i = 0; i < 7; i += 1) {
          const angle = (i / 7) * Math.PI * 2 + performance.now() * 0.002;
          const r = minDim * 0.05;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + Math.cos(angle) * r, sy + Math.sin(angle) * r);
          ctx.strokeStyle = rgba(shadowTone, 0.14 * entrance * (1 - reveal));
          ctx.lineWidth = px(0.0025, minDim);
          ctx.stroke();
        }
      }

      if (reveal < 0.92) {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(coreX, coreY);
        ctx.strokeStyle = rgba(warm, 0.1 * entrance * (1 - reveal));
        ctx.lineWidth = px(0.003, minDim);
        ctx.stroke();
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
      const pt = getPoint(e);
      const sx = viewport.width * stateRef.current.shadowX;
      const sy = viewport.height * stateRef.current.shadowY;
      if (Math.hypot(pt.x - sx, pt.y - sy) > Math.min(viewport.width, viewport.height) * 0.12) return;
      dragRef.current.active = true;
      dragRef.current.offsetX = sx - pt.x;
      dragRef.current.offsetY = sy - pt.y;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.active) return;
      const pt = getPoint(e);
      const nx = clamp((pt.x + dragRef.current.offsetX) / viewport.width, 0.12, 0.88);
      const ny = clamp((pt.y + dragRef.current.offsetY) / viewport.height, 0.2, 0.82);
      stateRef.current.shadowX = nx;
      stateRef.current.shadowY = ny;
      const coreX = 0.66;
      const dist = Math.hypot(nx - coreX, ny - 0.54);
      if (dist < 0.11) {
        stateRef.current.targetMerge = 1;
      } else if (nx < 0.18 && stateRef.current.errorCooldown === 0) {
        stateRef.current.errorCooldown = 20;
        callbacksRef.current.onHaptic('error_boundary');
        stateRef.current.shadowX = 0.28;
        stateRef.current.shadowY = 0.54;
      }
    };
    const onUp = (e: PointerEvent) => {
      dragRef.current.active = false;
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
