import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.46;
const COMPLETE_T = 0.985;

type Shard = { x: number; y: number; vx: number; vy: number; size: number; hue: number };

export default function BedrockScatterAtom({
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
  const shardsRef = useRef<Shard[]>([]);
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
    shardsRef.current = Array.from({ length: 24 }, (_, i) => ({
      x: 0,
      y: 0,
      vx: Math.cos((i / 24) * Math.PI * 2) * (0.6 + (i % 5) * 0.12),
      vy: -1.8 - (i % 7) * 0.16,
      size: 0.012 + (i % 4) * 0.004,
      hue: i / 24,
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
      if (!p.composed) drawAtmosphere(ctx, cx, h * 0.52, w, h, minDim, s.primaryRgb, entrance);

      s.progress = clamp(s.progress + (p.phase === 'resolve' ? 0.01 : 0.0085), 0, 1);
      const reveal = easeOutCubic(s.progress);
      cb.onStateChange?.(reveal);
      if (reveal >= 0.12 && !s.landed) {
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
      const deep = lerpColor([5, 7, 12], primary, 0.15);
      const base = lerpColor([76, 88, 108], accent, 0.24);
      const glow = lerpColor(accent, [255, 214, 186], 0.68);
      ctx.fillStyle = rgba(deep, 0.94 * entrance);
      ctx.fillRect(0, 0, w, h);

      const structureY = h * (0.24 + Math.min(reveal, 0.22) * 2.6);
      const collapseStart = 0.24;
      const fuseStart = 0.56;
      const collapse = clamp((reveal - collapseStart) / (fuseStart - collapseStart), 0, 1);
      const fuse = clamp((reveal - fuseStart) / (1 - fuseStart), 0, 1);

      if (fuse < 0.96) {
        const columns = 4;
        const rows = 4;
        for (let y = 0; y < rows; y += 1) {
          for (let x = 0; x < columns; x += 1) {
            const idx = y * columns + x;
            const shard = shardsRef.current[idx];
            const ox = (x - 1.5) * minDim * 0.085;
            const oy = (y - 1.5) * minDim * 0.06;
            const sx = cx + ox + shard.vx * minDim * collapse * 0.18;
            const sy = structureY + oy + (shard.vy * collapse + collapse * collapse * 2.4) * minDim * 0.08;
            const size = minDim * shard.size * (1 - fuse * 0.4);
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(collapse * (idx % 5) * 0.3);
            ctx.fillStyle = rgba(lerpColor(base, glow, shard.hue * 0.3), (0.18 + (1 - fuse) * 0.42) * entrance);
            ctx.fillRect(-size * 0.7, -size * 0.7, size * 1.4, size * 1.4);
            ctx.restore();
          }
        }
      }

      const floorY = h * 0.82;
      const slabH = minDim * (0.03 + fuse * 0.09);
      ctx.fillStyle = rgba(lerpColor(base, glow, fuse * 0.22), (0.1 + fuse * 0.5) * entrance);
      ctx.fillRect(w * (0.18 - fuse * 0.1), floorY - slabH * 0.5, w * (0.64 + fuse * 0.2), slabH);
      ctx.fillStyle = rgba(glow, fuse * 0.26 * entrance);
      ctx.fillRect(w * (0.16 - fuse * 0.08), floorY - slabH * 0.12, w * (0.68 + fuse * 0.16), slabH * 0.1);

      const halo = ctx.createRadialGradient(cx, floorY, 0, cx, floorY, minDim * 0.42);
      halo.addColorStop(0, rgba(glow, fuse * 0.18 * entrance));
      halo.addColorStop(1, rgba(glow, 0));
      ctx.fillStyle = halo;
      ctx.fillRect(cx - minDim * 0.42, floorY - minDim * 0.42, minDim * 0.84, minDim * 0.84);

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
