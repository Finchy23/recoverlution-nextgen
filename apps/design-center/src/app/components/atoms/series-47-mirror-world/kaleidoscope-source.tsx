import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import {
  advanceEntrance,
  drawAtmosphere,
  easeOutCubic,
  lerpColor,
  motionScale,
  parseColor,
  px,
  rgba,
  setupCanvas,
} from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.44;
const COMPLETE_T = 0.965;

export default function KaleidoscopeSourceAtom({
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
  const activePointersRef = useRef(new Map<number, { x: number; y: number }>());
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    converge: 0,
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
    const shards = Array.from({ length: 18 }, (_, i) => ({
      angle: (i / 18) * Math.PI * 2,
      radius: 0.18 + (i % 4) * 0.05,
      size: 0.026 + (i % 3) * 0.012,
    }));

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const pointers = Array.from(activePointersRef.current.values());
      if (pointers.length >= 2) {
        const meanDistance =
          pointers.reduce((sum, pt) => sum + Math.hypot(pt.x - cx, pt.y - cy), 0) / pointers.length;
        const closeness = clamp(1 - meanDistance / (minDim * 0.36), 0, 1);
        s.converge += (closeness - s.converge) * 0.16 * ms;
      } else if (pointers.length === 1) {
        const pt = pointers[0];
        const closeness = clamp(1 - Math.hypot(pt.x - cx, pt.y - cy) / (minDim * 0.24), 0, 1);
        s.converge += (closeness * 0.6 - s.converge) * 0.1 * ms;
      } else if (p.phase === 'resolve') {
        s.converge += (1 - s.converge) * 0.08 * ms;
      } else {
        s.converge *= 0.94;
      }

      s.revealFlash = Math.max(0, s.revealFlash - 0.02 * (p.reducedMotion ? 0.7 : 1));

      const reveal = easeOutCubic(clamp(s.converge, 0, 1));
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
      const dense = lerpColor([5, 7, 13], primary, 0.1);
      const shardA = lerpColor(primary, [246, 248, 255], 0.9);
      const shardB = lerpColor(accent, [255, 224, 206], 0.76);
      const source = lerpColor(shardA, shardB, 0.5);

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.9);
      bg.addColorStop(0, rgba(field, Math.min(0.15, (0.04 + reveal * 0.05) * entrance * boost)));
      bg.addColorStop(1, rgba(dense, Math.min(0.96, (0.24 + (1 - reveal) * 0.16) * entrance * boost)));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      for (const shard of shards) {
        const currentRadius = shard.radius * (1 - reveal) * minDim;
        const x = cx + Math.cos(shard.angle) * currentRadius;
        const y = cy + Math.sin(shard.angle) * currentRadius;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(shard.angle + reveal * Math.PI * 0.2);
        ctx.beginPath();
        ctx.moveTo(0, -minDim * shard.size);
        ctx.lineTo(minDim * shard.size * 0.8, 0);
        ctx.lineTo(0, minDim * shard.size);
        ctx.lineTo(-minDim * shard.size * 0.3, 0);
        ctx.closePath();
        ctx.fillStyle = rgba(shard.angle % 0.6 < 0.3 ? shardA : shardB, Math.min(0.88, (0.16 + (1 - reveal) * 0.4 + reveal * 0.18) * entrance * boost));
        ctx.fill();
        ctx.restore();
      }

      ctx.beginPath();
      ctx.arc(cx, cy, minDim * (0.024 + reveal * 0.022) * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(source, Math.min(0.96, (0.12 + reveal * 0.78 + s.revealFlash * 0.06) * entrance * boost));
      ctx.fill();

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getPoint = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * viewport.width,
        y: ((e.clientY - rect.top) / rect.height) * viewport.height,
      };
    };

    const onDown = (e: PointerEvent) => {
      activePointersRef.current.set(e.pointerId, getPoint(e));
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('hold_start');
    };
    const onMove = (e: PointerEvent) => {
      if (!activePointersRef.current.has(e.pointerId)) return;
      activePointersRef.current.set(e.pointerId, getPoint(e));
    };
    const onUp = (e: PointerEvent) => {
      activePointersRef.current.delete(e.pointerId);
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
