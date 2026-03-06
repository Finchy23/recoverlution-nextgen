import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function TacticalRetreatFlankAtom({
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
    retreat: 0,
    completionFired: false,
  });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { color, accentColor, phase, composed }; }, [color, accentColor, phase, composed]);
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      s.retreat = clamp(s.retreat + dt * 0.18, 0, 1);
      const resolve = easeOutCubic(s.retreat);
      cb.onStateChange?.(resolve);
      if (resolve > 0.2 && resolve < 0.24) cb.onHaptic('entrance_land');
      if (resolve > 0.62 && resolve < 0.66) cb.onHaptic('step_advance');
      if (resolve >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const base = lerpColor([10, 12, 16], s.primaryRgb, 0.14);
      const wall = lerpColor([162, 68, 68], s.accentRgb, 0.16);
      const route = lerpColor([248, 222, 166], s.accentRgb, 0.34);
      const node = lerpColor([200, 220, 255], s.primaryRgb, 0.32);
      ctx.fillStyle = rgba(base, 0.97 * entrance);
      ctx.fillRect(0, 0, w, h);

      const fov = 0.18 + resolve * 0.3;
      const leftRoute = w * (0.06 + resolve * 0.1);
      const rightRoute = w * (0.94 - resolve * 0.1);
      const wallX = w * (0.5 + resolve * 0.12);
      ctx.fillStyle = rgba(wall, 0.78 * entrance);
      ctx.fillRect(wallX, h * 0.18, w * 0.18, h * 0.64);
      ctx.strokeStyle = rgba(route, (0.08 + resolve * 0.65) * entrance);
      ctx.lineWidth = px(0.012, minDim);
      ctx.beginPath();
      ctx.moveTo(leftRoute, h * 0.74);
      ctx.lineTo(w * 0.22, h * (0.42 + fov));
      ctx.lineTo(w * 0.32, h * 0.22);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rightRoute, h * 0.76);
      ctx.lineTo(w * 0.78, h * (0.44 + fov));
      ctx.lineTo(w * 0.68, h * 0.24);
      ctx.stroke();

      const nodeX = cx - resolve * w * 0.22;
      ctx.beginPath();
      ctx.arc(nodeX, cy, minDim * 0.04, 0, Math.PI * 2);
      ctx.fillStyle = rgba(node, (0.38 + resolve * 0.3) * entrance);
      ctx.fill();

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    raf = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(raf);
  }, [viewport.width, viewport.height]);

  return <div style={{ position: 'absolute', inset: 0 }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} /></div>;
}
