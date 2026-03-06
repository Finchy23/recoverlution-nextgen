import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, roundedRect, setupCanvas } from '../atom-utils';

export default function RigidBoulderLiquefyAtom({
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
    fluid: false,
    merge: 0,
    stress: 0,
    completionFired: false,
  });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { color, accentColor, phase, composed }; }, [color, accentColor, phase, composed]);
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

      if (!s.fluid) {
        s.stress = Math.min(1, s.stress + 0.0045);
      } else {
        s.merge = Math.min(1, s.merge + 0.018);
        if (s.merge >= 1 && !s.completionFired) {
          s.completionFired = true;
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      }

      const resolve = s.fluid ? easeOutCubic(s.merge) : 0;
      cb.onStateChange?.(resolve);
      const river = lerpColor([110, 210, 255], s.primaryRgb, 0.22);
      const rock = lerpColor([110, 118, 132], s.primaryRgb, 0.14);
      const crack = lerpColor([255, 94, 84], s.accentRgb, 0.25);

      for (let i = 0; i < 20; i += 1) {
        const y = h * ((Date.now() * 0.00018 + i * 0.06) % 1);
        ctx.strokeStyle = rgba(river, (0.08 + (s.fluid ? 0.12 : 0.03)) * entrance);
        ctx.lineWidth = px(0.002 + (s.fluid ? 0.002 : 0), minDim);
        ctx.beginPath();
        ctx.moveTo(w * 0.08, y);
        ctx.lineTo(w * 0.92, y + h * 0.08);
        ctx.stroke();
      }

      const shake = s.fluid ? 0 : Math.sin(Date.now() * 0.025) * s.stress * minDim * 0.005;
      const boulderW = minDim * (0.22 - s.merge * 0.08);
      const boulderH = minDim * (0.18 - s.merge * 0.12);
      const bx = cx - boulderW / 2 + shake;
      const by = cy - boulderH / 2;
      roundedRect(ctx, bx, by, boulderW, boulderH, minDim * 0.03);
      ctx.fillStyle = rgba(rock, 0.95 * entrance);
      ctx.fill();

      if (!s.fluid) {
        for (let i = 0; i < 4; i += 1) {
          ctx.strokeStyle = rgba(crack, (0.08 + s.stress * 0.18) * entrance);
          ctx.lineWidth = px(0.003, minDim);
          ctx.beginPath();
          ctx.moveTo(cx + shake, by + boulderH * (0.15 + i * 0.18));
          ctx.lineTo(cx + shake + (i % 2 === 0 ? -1 : 1) * boulderW * 0.18, by + boulderH * (0.25 + i * 0.15));
          ctx.stroke();
        }
      }

      if (s.fluid) {
        for (let i = 0; i < 30; i += 1) {
          const t = i / 29;
          const x = cx + (t - 0.5) * minDim * 0.4;
          const y = cy + easeOutCubic(s.merge) * h * 0.34 + Math.sin(t * Math.PI * 4 + Date.now() * 0.003) * minDim * 0.01;
          ctx.beginPath();
          ctx.arc(x, y, minDim * (0.008 + (1 - t) * 0.004), 0, Math.PI * 2);
          ctx.fillStyle = rgba(river, (0.2 + 0.5 * (1 - t)) * entrance);
          ctx.fill();
        }
      }

      ctx.fillStyle = rgba(lerpColor(crack, river, s.fluid ? 1 : 0), (0.18 + (s.fluid ? 0.1 : s.stress * 0.12)) * entrance);
      ctx.fillRect(0, 0, w, h);

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onDown = () => {
      if (stateRef.current.fluid) return;
      stateRef.current.fluid = true;
      callbacksRef.current.onHaptic('tap');
    };

    raf = window.requestAnimationFrame(render);
    canvas.addEventListener('pointerdown', onDown);
    return () => {
      window.cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport.width, viewport.height]);

  return <div style={{ position: 'absolute', inset: 0 }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'manipulation' }} /></div>;
}
