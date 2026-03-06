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
  setupCanvas,
} from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.44;
const COMPLETE_T = 0.975;

type Point = { x: number; y: number; t: number };

export default function NonNewtonianShieldAtom({
  breathAmplitude,
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
  const propsRef = useRef({ breathAmplitude, color, accentColor, phase, composed });
  const dragRef = useRef<{ active: boolean; last: Point | null }>({ active: false, last: null });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    nodeX: 0.24,
    progress: 0,
    shieldPhase: 0,
    errorFlash: 0,
    thresholdFired: false,
    completionFired: false,
  });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => {
    propsRef.current = { breathAmplitude, color, accentColor, phase, composed };
  }, [breathAmplitude, color, accentColor, phase, composed]);
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
      const { w, h, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, w * 0.5, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.progress += (1 - s.progress) * 0.08;
      s.errorFlash = Math.max(0, s.errorFlash - 0.03);
      s.shieldPhase += 0.014;

      const reveal = easeOutCubic(clamp(s.progress, 0, 1));
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        cb.onHaptic('drag_snap');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const deep = lerpColor([5, 7, 12], primary, 0.12);
      const node = lerpColor(primary, [245, 247, 255], 0.92);
      const fluid = lerpColor(accent, [194, 224, 255], 0.56);
      const hard = lerpColor(accent, [132, 142, 156], 0.3);
      const shieldX = w * 0.52;
      const nodeX = w * (s.nodeX + reveal * 0.34);

      ctx.fillStyle = rgba(deep, 0.95 * entrance);
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 18; i += 1) {
        const y = h * 0.22 + i * h * 0.032;
        const wave = Math.sin(s.shieldPhase * 6 + i * 0.7) * minDim * 0.01 * (1 - s.errorFlash);
        ctx.beginPath();
        ctx.moveTo(shieldX - minDim * 0.018 + wave, y);
        ctx.lineTo(shieldX + minDim * 0.018 + wave, y);
        ctx.strokeStyle = rgba(lerpColor(hard, fluid, 1 - s.errorFlash), (0.18 + (1 - s.errorFlash) * 0.3 + s.errorFlash * 0.16) * entrance);
        ctx.lineWidth = px(0.006 + s.errorFlash * 0.004, minDim);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(nodeX, cy, minDim * (0.03 + breathAmplitude * 0.002), 0, Math.PI * 2);
      ctx.fillStyle = rgba(node, (0.2 + reveal * 0.64) * entrance);
      ctx.fill();

      if (reveal > 0) {
        const wake = ctx.createLinearGradient(nodeX, 0, shieldX + minDim * 0.08, 0);
        wake.addColorStop(0, rgba(fluid, 0));
        wake.addColorStop(1, rgba(fluid, (0.08 + reveal * 0.22) * entrance));
        ctx.fillStyle = wake;
        ctx.fillRect(nodeX, cy - minDim * 0.08, shieldX - nodeX + minDim * 0.08, minDim * 0.16);
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getPoint = (e: PointerEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * viewport.width,
        y: ((e.clientY - rect.top) / rect.height) * viewport.height,
        t: performance.now(),
      };
    };

    const onDown = (e: PointerEvent) => {
      dragRef.current = { active: true, last: getPoint(e) };
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.active || !dragRef.current.last) return;
      const next = getPoint(e);
      const prev = dragRef.current.last;
      const dx = next.x - prev.x;
      const dt = Math.max(16, next.t - prev.t);
      const speed = Math.abs(dx) / dt;
      if (speed > 1.1) {
        stateRef.current.errorFlash = 1;
        callbacksRef.current.onHaptic('error_boundary');
      } else if (dx > 0) {
        const gain = clamp(dx / viewport.width, 0, 0.03);
        stateRef.current.progress = clamp(stateRef.current.progress + gain * 3.2, 0, 1);
        stateRef.current.nodeX = clamp(stateRef.current.nodeX + gain * 1.4, 0.24, 0.58);
      }
      dragRef.current.last = next;
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
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} />
    </div>
  );
}
