import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, roundedRect, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.44;
const COMPLETE_T = 0.985;

export default function StructuralLoadAtom({
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
    progress: 0,
    thresholdFired: false,
    completionFired: false,
    landed: false,
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

      s.progress = clamp(s.progress + (p.phase === 'resolve' ? 0.012 : 0.009), 0, 1);
      const reveal = easeOutCubic(s.progress);
      cb.onStateChange?.(reveal);
      if (reveal >= 0.16 && !s.landed) {
        s.landed = true;
        cb.onHaptic('entrance_land');
      }
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
      const deep = lerpColor([5, 7, 12], primary, 0.12);
      const glass = lerpColor(primary, [214, 236, 255], 0.86);
      const steel = lerpColor(accent, [178, 194, 214], 0.48);
      const carbon = lerpColor([16, 18, 24], accent, 0.12);
      ctx.fillStyle = rgba(deep, 0.95 * entrance);
      ctx.fillRect(0, 0, w, h);

      const bridgeY = h * 0.64;
      const transform = clamp((reveal - 0.42) / 0.34, 0, 1);
      roundedRect(ctx, w * 0.18, bridgeY, w * 0.64, minDim * (0.03 + transform * 0.04), minDim * 0.015);
      ctx.fillStyle = rgba(lerpColor(glass, steel, transform), (0.16 + transform * 0.5) * entrance);
      ctx.fill();

      const blockY = h * (0.12 + Math.min(reveal, 0.52) * 1.04);
      roundedRect(ctx, cx - minDim * 0.11, blockY - minDim * 0.07, minDim * 0.22, minDim * 0.14, minDim * 0.02);
      ctx.fillStyle = rgba(carbon, (0.18 + (1 - transform) * 0.4) * entrance);
      ctx.fill();

      if (transform > 0) {
        for (let i = 0; i < 6; i += 1) {
          const x = w * 0.22 + i * w * 0.1;
          ctx.beginPath();
          ctx.moveTo(x, bridgeY + minDim * 0.01);
          ctx.lineTo(x + minDim * 0.04, bridgeY + minDim * 0.06);
          ctx.strokeStyle = rgba(steel, transform * 0.36 * entrance);
          ctx.lineWidth = px(0.003, minDim);
          ctx.stroke();
        }
      }

      const glow = ctx.createRadialGradient(cx, bridgeY, 0, cx, bridgeY, minDim * 0.4);
      glow.addColorStop(0, rgba(steel, transform * 0.2 * entrance));
      glow.addColorStop(1, rgba(steel, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(cx - minDim * 0.4, bridgeY - minDim * 0.4, minDim * 0.8, minDim * 0.8);

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    raf = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(raf);
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
