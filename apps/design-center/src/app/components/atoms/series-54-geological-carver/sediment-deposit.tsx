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
type Grain = { x: number; y: number; r: number };

export default function SedimentDepositAtom({
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
    grains: [] as Grain[],
    completionFired: false,
    steps: [false, false],
  });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onStateChange, onResolve]);
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

      const fill = easeOutCubic(clamp(s.grains.length / 44, 0, 1));
      cb.onStateChange?.(fill);
      if (fill >= 0.33 && !s.steps[0]) {
        s.steps[0] = true;
        cb.onHaptic('step_advance');
      }
      if (fill >= 0.66 && !s.steps[1]) {
        s.steps[1] = true;
        cb.onHaptic('step_advance');
      }
      if (fill >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const bed = lerpColor([30, 25, 22], s.primaryRgb, 0.08);
      const sand = lerpColor([168, 138, 104], s.accentRgb, 0.24);
      const rock = lerpColor([104, 90, 76], s.primaryRgb, 0.16);
      const light = lerpColor([250, 244, 232], s.primaryRgb, 0.44);

      ctx.fillStyle = rgba(bed, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      const slabH = minDim * (0.08 + fill * 0.34);
      roundedRect(ctx, w * 0.18, h * 0.82 - slabH, w * 0.64, slabH, minDim * 0.028);
      const slabGrad = ctx.createLinearGradient(0, h * 0.82 - slabH, 0, h * 0.82);
      slabGrad.addColorStop(0, rgba(sand, 0.95 * entrance));
      slabGrad.addColorStop(1, rgba(rock, 0.98 * entrance));
      ctx.fillStyle = slabGrad;
      ctx.fill();

      for (const grain of s.grains) {
        ctx.beginPath();
        ctx.arc(grain.x, grain.y, grain.r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(lerpColor(sand, light, Math.random() * 0.25), 0.85 * entrance);
        ctx.fill();
      }

      ctx.fillStyle = rgba(light, 0.18 * entrance);
      ctx.font = `${px(0.023, minDim)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`${s.grains.length}`, cx, h * 0.92);

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * viewport.width;
      const s = stateRef.current;
      if (s.grains.length >= 44) return;
      const level = hLevel(s.grains.length, viewport.height, viewport.width);
      s.grains.push({
        x: clamp(x, viewport.width * 0.22, viewport.width * 0.78),
        y: level.y,
        r: level.r,
      });
      callbacksRef.current.onHaptic('tap');
    };

    const hLevel = (count: number, vh: number, vw: number) => {
      const row = Math.floor(count / 8);
      const col = count % 8;
      return {
        y: vh * 0.78 - row * vh * 0.028 + (col % 2) * vh * 0.004,
        r: Math.max(2, Math.min(vw, vh) * 0.008),
      };
    };

    raf = window.requestAnimationFrame(render);
    canvas.addEventListener('pointerdown', onDown);
    return () => {
      window.cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'manipulation' }} />
    </div>
  );
}
