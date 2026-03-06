import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor,
  lerpColor,
  rgba,
  easeOutCubic,
  setupCanvas,
  advanceEntrance,
  drawAtmosphere,
  px,
} from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.44;
const COMPLETE_T = 0.965;

type Point = { x: number; y: number };

export default function MaculaPeripheralAtom({
  breathAmplitude,
  reducedMotion,
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
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    probe: { x: viewport.width * 0.82, y: viewport.height * 0.5 },
    dragging: false,
    reveal: 0,
    thresholdFired: false,
    completionFired: false,
    revealFlash: 0,
  });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);
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

    const target = () => ({ x: viewport.width * 0.5, y: viewport.height * 0.46 });

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      const t = target();
      const targetDist = Math.hypot(s.probe.x - t.x, s.probe.y - t.y);
      const centerDist = Math.hypot(s.probe.x - cx, s.probe.y - cy);
      const edgeBias = clamp(centerDist / (minDim * 0.42), 0, 1);
      const inverse = 1 - clamp(targetDist / (minDim * 0.34), 0, 1);
      const nextReveal = inverse * edgeBias;
      s.reveal += (Math.max(p.phase === 'resolve' ? 1 : 0, nextReveal) - s.reveal) * 0.14;
      s.revealFlash = Math.max(0, s.revealFlash - 0.02);

      const reveal = easeOutCubic(clamp(s.reveal, 0, 1));
      const directSuppression = 1 - clamp(1 - centerDist / (minDim * 0.14), 0, 1);
      const visibility = reveal * directSuppression;
      const boost = p.composed ? 1.18 : 1;
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.7;
        cb.onHaptic('step_advance');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        s.revealFlash = 1;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const field = lerpColor(primary, accent, 0.16);
      const dense = lerpColor([5, 7, 13], primary, 0.1);
      const clarity = lerpColor(primary, [246, 248, 255], 0.94);
      const ember = lerpColor(accent, [255, 236, 210], 0.76);

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.84);
      bg.addColorStop(0, rgba(field, Math.min(0.14, (0.04 + reveal * 0.05) * entrance * boost)));
      bg.addColorStop(1, rgba(dense, Math.min(0.96, (0.24 + (1 - reveal) * 0.16) * entrance * boost)));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const hush = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.18);
      hush.addColorStop(0, rgba([0, 0, 0], Math.min(0.96, (0.34 + directSuppression * 0.4) * entrance)));
      hush.addColorStop(1, rgba([0, 0, 0], 0));
      ctx.fillStyle = hush;
      ctx.fillRect(cx - minDim * 0.18, cy - minDim * 0.18, minDim * 0.36, minDim * 0.36);

      const glow = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, minDim * 0.22);
      glow.addColorStop(0, rgba(clarity, (0.08 + visibility * 0.38 + s.revealFlash * 0.08) * entrance));
      glow.addColorStop(1, rgba(clarity, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(t.x - minDim * 0.22, t.y - minDim * 0.22, minDim * 0.44, minDim * 0.44);

      ctx.beginPath();
      ctx.arc(t.x, t.y, minDim * 0.032 * (1 + breathAmplitude * 0.03), 0, Math.PI * 2);
      ctx.fillStyle = rgba(clarity, Math.min(0.92, (0.06 + visibility * 0.78) * entrance * boost));
      ctx.fill();

      ctx.beginPath();
      ctx.arc(s.probe.x, s.probe.y, minDim * 0.09, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(ember, Math.min(0.54, (0.12 + reveal * 0.28) * entrance * boost));
      ctx.lineWidth = px(0.004, minDim);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(s.probe.x, s.probe.y, minDim * 0.015, 0, Math.PI * 2);
      ctx.fillStyle = rgba(ember, Math.min(0.84, (0.18 + reveal * 0.38) * entrance * boost));
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
      stateRef.current.dragging = true;
      stateRef.current.probe = getPoint(e);
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.dragging) return;
      stateRef.current.probe = getPoint(e);
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.dragging = false;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} />
    </div>
  );
}
