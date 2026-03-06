import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.44;
const COMPLETE_T = 0.975;

type ShapeNode = { x: number; y: number; angle: number; hue: number };

export default function ChimeraFusionAtom({
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
  const dragRef = useRef(false);
  const shapesRef = useRef<ShapeNode[]>([]);
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    fuse: 0,
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
    shapesRef.current = Array.from({ length: 5 }, (_, i) => ({
      x: 0.2 + i * 0.15,
      y: 0.34 + (i % 2) * 0.18,
      angle: i * 0.7,
      hue: i / 5,
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
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      s.fuse = clamp(s.fuse + (p.phase === 'resolve' ? 0.012 : 0), 0, 1);
      const reveal = easeOutCubic(s.fuse);
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
      const bright = lerpColor(primary, [246, 248, 255], 0.9);
      const alloy = lerpColor(accent, [255, 214, 186], 0.72);
      ctx.fillStyle = rgba(deep, 0.95 * entrance);
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < shapesRef.current.length; i += 1) {
        const shape = shapesRef.current[i];
        const x = w * shape.x + (cx - w * shape.x) * reveal;
        const y = h * shape.y + (cy - h * shape.y) * reveal;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(shape.angle + reveal * 1.2);
        ctx.strokeStyle = rgba(lerpColor(bright, alloy, shape.hue * 0.9), (0.14 + (1 - reveal) * 0.34) * entrance);
        ctx.lineWidth = px(0.006, minDim);
        if (i === 0) {
          ctx.strokeRect(-minDim * 0.05, -minDim * 0.05, minDim * 0.1, minDim * 0.1);
        } else if (i === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, minDim * 0.06, 0, Math.PI * 2);
          ctx.stroke();
        } else if (i === 2) {
          ctx.beginPath();
          ctx.moveTo(0, -minDim * 0.07);
          ctx.lineTo(minDim * 0.06, minDim * 0.05);
          ctx.lineTo(-minDim * 0.06, minDim * 0.05);
          ctx.closePath();
          ctx.stroke();
        } else if (i === 3) {
          ctx.beginPath();
          ctx.moveTo(-minDim * 0.07, 0);
          ctx.lineTo(0, -minDim * 0.07);
          ctx.lineTo(minDim * 0.07, 0);
          ctx.lineTo(0, minDim * 0.07);
          ctx.closePath();
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.ellipse(0, 0, minDim * 0.08, minDim * 0.04, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      if (reveal > 0.5) {
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.34);
        glow.addColorStop(0, rgba(alloy, (reveal - 0.5) * 0.4 * entrance));
        glow.addColorStop(1, rgba(alloy, 0));
        ctx.fillStyle = glow;
        ctx.fillRect(cx - minDim * 0.34, cy - minDim * 0.34, minDim * 0.68, minDim * 0.68);
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onDown = (e: PointerEvent) => {
      dragRef.current = true;
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('drag_snap');
    };
    const onMove = () => {
      if (!dragRef.current) return;
      stateRef.current.fuse = clamp(stateRef.current.fuse + 0.018, 0, 1);
    };
    const onUp = (e: PointerEvent) => {
      dragRef.current = false;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
