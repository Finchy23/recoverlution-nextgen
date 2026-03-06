import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
type Point = { x: number; y: number };

export default function UpstreamSwimAtom({
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
    nodeX: 0.5,
    nodeY: 0.76,
    energy: 1,
    released: false,
    velocity: 0.004,
    completionFired: false,
    warned: false,
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

      if (s.released) {
        s.velocity = Math.min(0.04, s.velocity + 0.0009);
        s.nodeY += s.velocity;
        s.energy = Math.min(1, s.energy + 0.012);
        if (s.nodeY > 1.1 && !s.completionFired) {
          s.completionFired = true;
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      } else {
        s.nodeY = clamp(s.nodeY + 0.0025, 0.12, 0.86);
        if (dragRef.current.active) {
          s.energy = clamp(s.energy - 0.0045, 0.06, 1);
        }
      }

      const resolve = s.released ? clamp((s.nodeY - 0.76) / 0.34, 0, 1) : 1 - s.energy;
      cb.onStateChange?.(resolve);
      if (s.energy < 0.42 && !s.warned && !s.released) {
        s.warned = true;
        cb.onHaptic('error_boundary');
      }

      const warning = clamp(1 - s.energy, 0, 1);
      const blue = lerpColor([110, 210, 255], s.primaryRgb, 0.25);
      const red = lerpColor([255, 82, 82], s.accentRgb, 0.2);
      const currentColor = lerpColor(red, blue, s.released ? 1 : 0.15);
      const nodeColor = lerpColor(red, blue, s.released ? 0.9 : 0.2 + s.energy * 0.5);

      for (let i = 0; i < 18; i += 1) {
        const x = w * (0.08 + i * 0.05);
        const shift = ((Date.now() * 0.0015 + i * 0.17) % 1) * h;
        ctx.strokeStyle = rgba(currentColor, (0.12 + (s.released ? 0.1 : warning * 0.18)) * entrance);
        ctx.lineWidth = px(0.003 + (s.released ? 0.002 : 0), minDim);
        ctx.beginPath();
        ctx.moveTo(x, shift - h * 0.14);
        ctx.lineTo(x, shift + h * 0.14);
        ctx.stroke();
      }

      ctx.strokeStyle = rgba(lerpColor(red, blue, s.energy), 0.35 * entrance);
      ctx.lineWidth = px(0.016, minDim);
      ctx.beginPath();
      ctx.arc(w * s.nodeX, h * s.nodeY, minDim * 0.07, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * s.energy);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(w * s.nodeX, h * s.nodeY, minDim * 0.04, 0, Math.PI * 2);
      ctx.fillStyle = rgba(nodeColor, (0.55 + s.energy * 0.25) * entrance);
      ctx.fill();

      if (!s.released) {
        ctx.fillStyle = rgba(red, (0.08 + warning * 0.22) * entrance);
        ctx.fillRect(0, 0, w, h);
      } else {
        const trail = ctx.createLinearGradient(0, h * 0.5, 0, h);
        trail.addColorStop(0, rgba(blue, 0));
        trail.addColorStop(1, rgba(blue, 0.22 * entrance));
        ctx.fillStyle = trail;
        ctx.fillRect(0, h * 0.4, w, h * 0.6);
      }

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
      if (stateRef.current.released) return;
      dragRef.current = { active: true, last: getPoint(e) };
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('hold_start');
    };

    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag.active || !drag.last || stateRef.current.released) return;
      const pt = getPoint(e);
      const dy = pt.y - drag.last.y;
      if (dy < 0) {
        stateRef.current.nodeY = clamp(stateRef.current.nodeY + dy / viewport.height, 0.12, 0.86);
        stateRef.current.energy = clamp(stateRef.current.energy - Math.abs(dy) / viewport.height * 0.9, 0.06, 1);
        if (Math.abs(dy) > viewport.height * 0.012) callbacksRef.current.onHaptic('error_boundary');
      }
      drag.last = pt;
    };

    const onUp = (e: PointerEvent) => {
      if (!stateRef.current.released) {
        stateRef.current.released = true;
        callbacksRef.current.onHaptic('hold_release');
      }
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

  return <div style={{ position: 'absolute', inset: 0 }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} /></div>;
}
