import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.46;
const COMPLETE_T = 0.97;

type Point = { x: number; y: number };

export default function BenthicLightAtom({
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
    reveal: 0,
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

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.reveal += (1 - s.reveal) * 0.06;

      const reveal = easeOutCubic(clamp(s.reveal, 0, 1));
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
      const dark = lerpColor([4, 6, 12], primary, 0.14);
      const silt = lerpColor([38, 44, 52], primary, 0.18);
      const light = lerpColor(accent, [172, 255, 228], 0.72);
      ctx.fillStyle = rgba(dark, 0.96 * entrance);
      ctx.fillRect(0, 0, w, h);

      const sourceY = h * 0.68;
      const glow = ctx.createRadialGradient(cx, sourceY, 0, cx, sourceY, minDim * 0.38);
      glow.addColorStop(0, rgba(light, (0.04 + reveal * 0.46) * entrance));
      glow.addColorStop(1, rgba(light, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(cx - minDim * 0.38, sourceY - minDim * 0.38, minDim * 0.76, minDim * 0.76);

      const wipe = pointerRef.current;
      if (wipe) {
        const dx = wipe.x - cx;
        const dy = wipe.y - sourceY;
        const local = clamp(1 - Math.hypot(dx, dy) / (minDim * 0.34), 0, 1) * 0.022;
        s.reveal = clamp(s.reveal + local, 0, 1);
      }

      const cols = 18;
      const rows = 12;
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const pxX = ((x + 0.5) / cols) * w;
          const pxY = h * 0.46 + ((y + 0.5) / rows) * h * 0.42;
          const dist = Math.hypot(pxX - cx, pxY - sourceY);
          const clear = clamp(1 - dist / (minDim * (0.16 + reveal * 0.46)), 0, 1);
          const alpha = (0.16 + (1 - clear) * 0.44) * entrance * (1 - reveal * 0.35);
          ctx.beginPath();
          ctx.arc(pxX, pxY, minDim * 0.012, 0, Math.PI * 2);
          ctx.fillStyle = rgba(silt, alpha);
          ctx.fill();
        }
      }

      for (let i = 0; i < 18; i += 1) {
        const t = i / 18;
        const angle = t * Math.PI * 2 + performance.now() * 0.0016;
        const r = minDim * (0.03 + reveal * 0.1 + (i % 4) * 0.012);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * r, sourceY + Math.sin(angle) * r * 0.68, minDim * 0.006, 0, Math.PI * 2);
        ctx.fillStyle = rgba(light, (0.06 + reveal * 0.38) * entrance);
        ctx.fill();
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
      pointerRef.current = getPoint(e);
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('drag_snap');
    };
    const onMove = (e: PointerEvent) => {
      if (!pointerRef.current) return;
      pointerRef.current = getPoint(e);
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
