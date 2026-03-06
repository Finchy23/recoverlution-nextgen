import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.44;
const COMPLETE_T = 0.975;

type Point = { x: number; y: number };

export default function MycelialRevivalAtom({
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
  const pointerRef = useRef<Point | null>(null);
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    depth: 0,
    link: 0,
    thresholdFired: false,
    completionFired: false,
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

    const topNode = { x: 0.5, y: 0.24 };
    const rootNode = { x: 0.5, y: 0.78 };

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, w * 0.5, h * 0.5, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') {
        s.depth += (1 - s.depth) * 0.06;
        s.link += (1 - s.link) * 0.08;
      }

      const reveal = easeOutCubic(clamp((s.depth + s.link) * 0.5, 0, 1));
      cb.onStateChange?.(reveal);
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
      const deep = lerpColor([5, 7, 12], primary, 0.14);
      const root = lerpColor([16, 18, 22], accent, 0.18);
      const life = lerpColor(accent, [186, 255, 220], 0.7);
      const node = lerpColor(primary, [244, 248, 255], 0.94);
      ctx.fillStyle = rgba(deep, 0.95 * entrance);
      ctx.fillRect(0, 0, w, h);

      const depthAlpha = s.depth;
      for (let i = 0; i < 7; i += 1) {
        const spread = (i - 3) / 3;
        ctx.beginPath();
        ctx.moveTo(w * rootNode.x, h * rootNode.y);
        ctx.bezierCurveTo(
          w * (0.5 + spread * 0.08),
          h * (0.68 + depthAlpha * 0.08),
          w * (0.5 + spread * 0.18),
          h * (0.82 + depthAlpha * 0.03),
          w * (0.5 + spread * 0.22),
          h * (0.92),
        );
        ctx.strokeStyle = rgba(lerpColor(root, life, s.link * 0.5), (0.08 + depthAlpha * 0.32) * entrance);
        ctx.lineWidth = px(0.005, minDim);
        ctx.stroke();
      }

      if (pointerRef.current && s.depth > 0.3) {
        const tx = w * topNode.x;
        const ty = h * topNode.y;
        const rx = w * rootNode.x;
        const ry = h * rootNode.y;
        const dTop = Math.hypot(pointerRef.current.x - tx, pointerRef.current.y - ty);
        const dRoot = Math.hypot(pointerRef.current.x - rx, pointerRef.current.y - ry);
        if (dTop < minDim * 0.1 || dRoot < minDim * 0.1) {
          s.link = clamp(s.link + 0.018, 0, 1);
        }
      }

      if (s.link > 0) {
        ctx.beginPath();
        ctx.moveTo(w * rootNode.x, h * rootNode.y);
        ctx.lineTo(w * topNode.x, h * topNode.y);
        ctx.strokeStyle = rgba(life, (0.1 + s.link * 0.5) * entrance);
        ctx.lineWidth = px(0.008, minDim);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(w * topNode.x, h * topNode.y, minDim * 0.038, 0, Math.PI * 2);
      ctx.fillStyle = rgba(node, (0.12 + s.link * 0.64) * entrance);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w * rootNode.x, h * rootNode.y, minDim * 0.03, 0, Math.PI * 2);
      ctx.fillStyle = rgba(root, (0.16 + s.depth * 0.4) * entrance);
      ctx.fill();

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
    const onDown = (e: PointerEvent) => {
      pointerRef.current = getPoint(e);
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('drag_snap');
    };
    const onMove = (e: PointerEvent) => {
      pointerRef.current = getPoint(e);
      const depth = clamp((pointerRef.current.y - viewport.height * 0.28) / (viewport.height * 0.44), 0, 1);
      stateRef.current.depth = Math.max(stateRef.current.depth, depth);
    };
    const onUp = (e: PointerEvent) => {
      pointerRef.current = null;
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
