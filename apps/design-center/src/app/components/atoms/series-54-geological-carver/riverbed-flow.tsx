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
type Point = { x: number; y: number };

export default function RiverbedFlowAtom({
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
  const dragRef = useRef<{ active: boolean; last: Point | null }>({ active: false, last: null });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    mode: 'boulder' as 'boulder' | 'water',
    energy: 1,
    progress: 0,
    path: [] as Point[],
    completionFired: false,
    switchPulse: 0,
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

      s.switchPulse *= 0.92;
      const resolved = easeOutCubic(s.progress);
      cb.onStateChange?.(resolved);
      if (resolved >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const earth = lerpColor([36, 32, 29], s.primaryRgb, 0.08);
      const ridge = lerpColor([125, 104, 82], s.accentRgb, 0.18);
      const water = lerpColor([74, 185, 255], s.accentRgb, 0.45);
      const foam = lerpColor([240, 248, 255], s.primaryRgb, 0.6);
      const boulder = lerpColor([132, 124, 118], s.primaryRgb, 0.14);

      ctx.fillStyle = rgba(earth, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 5; i += 1) {
        ctx.fillStyle = rgba(ridge, (0.06 + i * 0.02) * entrance);
        ctx.beginPath();
        ctx.moveTo(0, h * (0.28 + i * 0.1));
        for (let x = 0; x <= w; x += w / 7) {
          const y = h * (0.28 + i * 0.1) + Math.sin(x / w * Math.PI * 2 + i) * minDim * 0.03;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();
      }

      if (s.path.length > 1) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = rgba(water, (0.24 + resolved * 0.7) * entrance);
        ctx.lineWidth = minDim * (0.015 + resolved * 0.05);
        ctx.beginPath();
        ctx.moveTo(s.path[0].x, s.path[0].y);
        for (const pt of s.path.slice(1)) ctx.lineTo(pt.x, pt.y);
        ctx.stroke();

        ctx.strokeStyle = rgba(foam, (0.1 + resolved * 0.22) * entrance);
        ctx.lineWidth = minDim * (0.006 + resolved * 0.018);
        ctx.stroke();
      }

      roundedRect(ctx, w * 0.08, h * 0.08, w * 0.28, h * 0.08, minDim * 0.018);
      ctx.fillStyle = rgba(lerpColor(earth, [0, 0, 0], 0.4), 0.55 * entrance);
      ctx.fill();
      roundedRect(ctx, w * 0.095, h * 0.095, w * 0.125, h * 0.05, minDim * 0.014);
      ctx.fillStyle = rgba(s.mode === 'boulder' ? boulder : ridge, 0.9 * entrance);
      ctx.fill();
      roundedRect(ctx, w * 0.225, h * 0.095, w * 0.12, h * 0.05, minDim * 0.014);
      ctx.fillStyle = rgba(s.mode === 'water' ? water : ridge, 0.9 * entrance);
      ctx.fill();

      ctx.fillStyle = rgba(foam, 0.7 * entrance);
      ctx.font = `${px(0.018, minDim)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('boulder', w * 0.157, h * 0.127);
      ctx.fillText('water', w * 0.285, h * 0.127);

      if (s.mode === 'boulder') {
        const bx = w * 0.5 + Math.sin(s.switchPulse * 6) * minDim * 0.01;
        const by = h * 0.72;
        ctx.beginPath();
        ctx.arc(bx, by, minDim * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = rgba(boulder, (0.86 + s.switchPulse * 0.1) * entrance);
        ctx.fill();
        ctx.strokeStyle = rgba(lerpColor([255, 98, 76], s.accentRgb, 0.2), (0.2 + (1 - s.energy) * 0.55) * entrance);
        ctx.lineWidth = px(0.008, minDim);
        ctx.stroke();
      }

      ctx.fillStyle = rgba(foam, 0.16 * entrance);
      ctx.font = `${px(0.022, minDim)}px Inter, sans-serif`;
      ctx.fillText(s.mode === 'boulder' ? 'switch to water' : 'let the bed form itself', cx, h * 0.92);

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

    const inSwitch = (pt: Point) =>
      pt.x >= viewport.width * 0.08 &&
      pt.x <= viewport.width * 0.36 &&
      pt.y >= viewport.height * 0.08 &&
      pt.y <= viewport.height * 0.16;

    const onDown = (e: PointerEvent) => {
      const pt = getPoint(e);
      if (inSwitch(pt)) {
        stateRef.current.mode = pt.x < viewport.width * 0.22 ? 'boulder' : 'water';
        stateRef.current.switchPulse = 1;
        callbacksRef.current.onHaptic('tap');
        return;
      }
      dragRef.current = { active: true, last: pt };
      if (stateRef.current.mode === 'boulder') callbacksRef.current.onHaptic('drag_snap');
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.active || !dragRef.current.last) return;
      const pt = getPoint(e);
      const s = stateRef.current;
      const dx = pt.x - dragRef.current.last.x;
      const dy = pt.y - dragRef.current.last.y;
      const dist = Math.hypot(dx, dy);
      if (s.mode === 'boulder') {
        s.energy = clamp(s.energy - dist / viewport.width * 0.35, 0, 1);
        if (dist > viewport.width * 0.025) callbacksRef.current.onHaptic('error_boundary');
      } else {
        s.path.push(pt);
        if (s.path.length > 56) s.path.shift();
        const last2 = s.path[s.path.length - 2];
        const last3 = s.path[s.path.length - 3];
        let curvature = 0;
        if (last2 && last3) {
          const a1 = Math.atan2(last2.y - last3.y, last2.x - last3.x);
          const a2 = Math.atan2(pt.y - last2.y, pt.x - last2.x);
          curvature = Math.abs(a2 - a1);
        }
        s.progress = clamp(s.progress + dist / viewport.width * 0.22 + curvature * 0.02, 0, 1);
        if (s.progress >= 0.35 && s.progress < 0.38) callbacksRef.current.onHaptic('step_advance');
        if (s.progress >= 0.7 && s.progress < 0.73) callbacksRef.current.onHaptic('step_advance');
      }
      dragRef.current.last = pt;
    };

    const onUp = (e: PointerEvent) => {
      dragRef.current = { active: false, last: null };
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
    <div style={{ position: 'absolute', inset: 0 }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} />
    </div>
  );
}
