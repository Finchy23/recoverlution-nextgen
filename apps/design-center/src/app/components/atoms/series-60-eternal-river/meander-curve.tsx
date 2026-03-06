import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
type Point = { x: number; y: number };

function variation(points: Point[]) {
  if (points.length < 3) return 0;
  const xs = points.map(p => p.x);
  const min = Math.min(...xs);
  const max = Math.max(...xs);
  return max - min;
}

export default function MeanderCurveAtom({
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
  const pathRef = useRef<Point[]>([]);
  const drawingRef = useRef(false);
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    accepted: false,
    rejectedFlash: 0,
    flowProgress: 0,
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

    const rocks = [
      { x: 0.36, y: 0.34, r: 0.06 },
      { x: 0.66, y: 0.52, r: 0.05 },
      { x: 0.42, y: 0.72, r: 0.05 },
    ];

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (s.rejectedFlash > 0) s.rejectedFlash *= 0.9;
      if (s.accepted) {
        s.flowProgress = Math.min(1, s.flowProgress + 0.02);
        cb.onStateChange?.(s.flowProgress);
        if (s.flowProgress >= 1 && !s.completionFired) {
          s.completionFired = true;
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      } else {
        cb.onStateChange?.(variation(pathRef.current) / (viewport.width * 0.35));
      }

      const terrain = lerpColor([40, 40, 46], s.primaryRgb, 0.12);
      const rock = lerpColor([118, 120, 126], s.primaryRgb, 0.16);
      const river = lerpColor([102, 200, 255], s.primaryRgb, 0.24);
      const reject = lerpColor([255, 88, 80], s.accentRgb, 0.16);

      ctx.fillStyle = rgba(terrain, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      for (const rk of rocks) {
        ctx.beginPath();
        ctx.arc(w * rk.x, h * rk.y, minDim * rk.r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(rock, 0.4 * entrance);
        ctx.fill();
      }

      if (pathRef.current.length > 1) {
        ctx.beginPath();
        ctx.moveTo(pathRef.current[0].x, pathRef.current[0].y);
        for (let i = 1; i < pathRef.current.length; i += 1) ctx.lineTo(pathRef.current[i].x, pathRef.current[i].y);
        ctx.strokeStyle = rgba(s.accepted ? river : reject, (0.22 + s.rejectedFlash * 0.2 + (s.accepted ? 0.16 : 0)) * entrance);
        ctx.lineWidth = px(0.01, minDim);
        ctx.stroke();

        if (s.accepted) {
          const idx = Math.min(pathRef.current.length - 1, Math.floor(s.flowProgress * (pathRef.current.length - 1)));
          const pt = pathRef.current[idx];
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, minDim * 0.028, 0, Math.PI * 2);
          ctx.fillStyle = rgba(river, 0.8 * entrance);
          ctx.fill();
        }
      }

      ctx.fillStyle = rgba(reject, 0.12 * s.rejectedFlash * entrance);
      ctx.fillRect(0, 0, w, h);

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getPoint = (e: PointerEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return { x: ((e.clientX - rect.left) / rect.width) * viewport.width, y: ((e.clientY - rect.top) / rect.height) * viewport.height };
    };

    const onDown = (e: PointerEvent) => {
      if (stateRef.current.accepted) return;
      drawingRef.current = true;
      pathRef.current = [getPoint(e)];
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      if (!drawingRef.current || stateRef.current.accepted) return;
      const pt = getPoint(e);
      const last = pathRef.current[pathRef.current.length - 1];
      if (!last || Math.hypot(pt.x - last.x, pt.y - last.y) > viewport.width * 0.015) pathRef.current.push(pt);
    };

    const onUp = (e: PointerEvent) => {
      drawingRef.current = false;
      canvas.releasePointerCapture(e.pointerId);
      if (stateRef.current.accepted) return;
      const path = pathRef.current;
      const end = path[path.length - 1];
      const pathVar = variation(path);
      if (end && end.y > viewport.height * 0.8 && pathVar > viewport.width * 0.16) {
        stateRef.current.accepted = true;
        callbacksRef.current.onHaptic('drag_snap');
      } else {
        stateRef.current.rejectedFlash = 1;
        pathRef.current = [];
        callbacksRef.current.onHaptic('error_boundary');
      }
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

  return <div style={{ position: 'absolute', inset: 0 }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} /></div>;
}
