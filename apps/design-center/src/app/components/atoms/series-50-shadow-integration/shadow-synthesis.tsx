import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, motionScale, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.42;
const COMPLETE_T = 0.99;

type Shadow = { orbit: number; radius: number; speed: number; size: number };

export default function ShadowSynthesisAtom({
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
  const propsRef = useRef({ breathAmplitude, reducedMotion, color, accentColor, phase, composed });
  const holdRef = useRef(false);
  const shadowsRef = useRef<Shadow[]>([]);
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    absorb: 0,
    thresholdFired: false,
    completionFired: false,
  });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onResolve, onStateChange]);
  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, color, accentColor, phase, composed };
  }, [breathAmplitude, reducedMotion, color, accentColor, phase, composed]);
  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);
  useEffect(() => {
    shadowsRef.current = Array.from({ length: 18 }, (_, i) => ({
      orbit: (i / 18) * Math.PI * 2,
      radius: 0.14 + (i % 6) * 0.045,
      speed: 0.004 + (i % 5) * 0.0015,
      size: 0.018 + (i % 4) * 0.006,
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
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = 0.75 + motionScale(p.reducedMotion) * 0.25;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (holdRef.current || p.phase === 'resolve') s.absorb = clamp(s.absorb + 0.009 * ms, 0, 1);
      else s.absorb = clamp(s.absorb - 0.004 * ms, 0, 1);

      const reveal = easeOutCubic(s.absorb);
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        cb.onHaptic('step_advance');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('seal_stamp');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const deep = lerpColor([5, 7, 12], primary, 0.14);
      const core = lerpColor(primary, [246, 249, 255], 0.94);
      const unified = lerpColor(accent, [255, 223, 194], 0.78);
      const shadow = lerpColor([10, 12, 16], primary, 0.08);
      ctx.fillStyle = rgba(deep, 0.96 * entrance);
      ctx.fillRect(0, 0, w, h);

      for (const entity of shadowsRef.current) {
        entity.orbit += entity.speed * ms;
        const radius = minDim * entity.radius * (1 - reveal * 0.9);
        const x = cx + Math.cos(entity.orbit) * radius;
        const y = cy + Math.sin(entity.orbit) * radius * 0.66;
        const size = minDim * entity.size * (1 - reveal * 0.72);
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = rgba(shadow, (0.16 + (1 - reveal) * 0.34) * entrance);
        ctx.fill();
      }

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.42);
      glow.addColorStop(0, rgba(unified, (0.06 + reveal * 0.4) * entrance));
      glow.addColorStop(1, rgba(unified, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(cx - minDim * 0.42, cy - minDim * 0.42, minDim * 0.84, minDim * 0.84);

      ctx.beginPath();
      ctx.arc(cx, cy, minDim * (0.04 + reveal * 0.06 + breathAmplitude * 0.002), 0, Math.PI * 2);
      ctx.fillStyle = rgba(core, (0.2 + reveal * 0.72) * entrance);
      ctx.fill();

      if (reveal > 0.8) {
        ctx.beginPath();
        ctx.arc(cx, cy, minDim * (0.1 + reveal * 0.12), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(unified, (reveal - 0.8) * 1.4 * entrance);
        ctx.lineWidth = px(0.012, minDim);
        ctx.stroke();
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onDown = (e: PointerEvent) => {
      holdRef.current = true;
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('hold_start');
    };
    const onUp = (e: PointerEvent) => {
      holdRef.current = false;
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
