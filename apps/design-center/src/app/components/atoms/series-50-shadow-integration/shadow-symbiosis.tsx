import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.46;
const COMPLETE_T = 0.975;

export default function ShadowSymbiosisAtom({
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
  const pointersRef = useRef(new Map<number, number>());
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    fuse: 0,
    thresholdFired: false,
    completionFired: false,
    errorCooldown: 0,
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
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const positions = Array.from(pointersRef.current.values()).sort((a, b) => a - b);
      if (positions.length >= 2) {
        const spread = clamp((positions[positions.length - 1] - positions[0]) / (w * 0.7), 0, 1);
        s.fuse += ((1 - spread) - s.fuse) * 0.16;
      } else if (p.phase === 'resolve') {
        s.fuse += (1 - s.fuse) * 0.08;
      } else {
        s.fuse += (0 - s.fuse) * 0.08;
      }
      s.errorCooldown = Math.max(0, s.errorCooldown - 1);

      const reveal = easeOutCubic(clamp(s.fuse, 0, 1));
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        cb.onHaptic('hold_threshold');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const deep = lerpColor([5, 7, 12], primary, 0.12);
      const light = lerpColor(primary, [244, 247, 255], 0.92);
      const dark = lerpColor([10, 12, 16], accent, 0.18);
      const field = lerpColor(accent, [255, 214, 186], 0.68);
      ctx.fillStyle = rgba(deep, 0.95 * entrance);
      ctx.fillRect(0, 0, w, h);

      const orbitR = minDim * (0.16 - reveal * 0.07);
      const spin = performance.now() * 0.0028;
      const leftX = cx + Math.cos(spin) * orbitR;
      const leftY = cy + Math.sin(spin) * orbitR * 0.66;
      const rightX = cx + Math.cos(spin + Math.PI) * orbitR;
      const rightY = cy + Math.sin(spin + Math.PI) * orbitR * 0.66;

      if (reveal < 0.95) {
        ctx.beginPath();
        ctx.arc(leftX, leftY, minDim * 0.05, 0, Math.PI * 2);
        ctx.fillStyle = rgba(light, (0.18 + (1 - reveal) * 0.52) * entrance);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rightX, rightY, minDim * 0.05, 0, Math.PI * 2);
        ctx.fillStyle = rgba(dark, (0.18 + (1 - reveal) * 0.52) * entrance);
        ctx.fill();
      }

      const orbitGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.36);
      orbitGlow.addColorStop(0, rgba(field, (0.04 + reveal * 0.28) * entrance));
      orbitGlow.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = orbitGlow;
      ctx.fillRect(cx - minDim * 0.36, cy - minDim * 0.36, minDim * 0.72, minDim * 0.72);

      if (reveal >= 0.3) {
        ctx.beginPath();
        ctx.arc(cx, cy, minDim * (0.06 + reveal * 0.08), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(field, (0.08 + reveal * 0.3) * entrance);
        ctx.lineWidth = px(0.005, minDim);
        ctx.stroke();
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getX = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return ((e.clientX - rect.left) / rect.width) * viewport.width;
    };
    const onDown = (e: PointerEvent) => {
      pointersRef.current.set(e.pointerId, getX(e));
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!pointersRef.current.has(e.pointerId)) return;
      pointersRef.current.set(e.pointerId, getX(e));
    };
    const onUp = (e: PointerEvent) => {
      pointersRef.current.delete(e.pointerId);
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
