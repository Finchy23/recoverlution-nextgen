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
const STEP_T = 0.48;
const COMPLETE_T = 0.965;

type Point = { x: number; y: number };

export default function GlassCeilingFallAtom({
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
  const dragRef = useRef({ active: false, start: null as Point | null });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    flip: 0,
    errorCooldown: 0,
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

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.flip += (1 - s.flip) * 0.08;
      s.revealFlash = Math.max(0, s.revealFlash - 0.02);
      if (s.errorCooldown > 0) s.errorCooldown -= 1;

      const reveal = easeOutCubic(clamp(s.flip, 0, 1));
      const boost = p.composed ? 1.18 : 1;
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.72;
        cb.onHaptic('swipe_commit');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        s.revealFlash = 1;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const deep = lerpColor(primary, [5, 7, 18], 0.18);
      const sky = lerpColor(primary, [206, 236, 255], 0.76);
      const glass = lerpColor(accent, [255, 186, 128], 0.5);
      const node = lerpColor(primary, [246, 248, 255], 0.94);

      const skyAlpha = reveal;
      const deepAlpha = 1 - reveal;
      ctx.fillStyle = rgba(deep, Math.min(0.96, (0.24 + deepAlpha * 0.2) * entrance * boost));
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = rgba(sky, Math.min(0.92, (0.08 + skyAlpha * 0.52) * entrance * boost));
      ctx.fillRect(0, h * (1 - reveal), w, h * reveal);

      const ceilingY = h * (0.18 + reveal * 0.64);
      ctx.beginPath();
      ctx.moveTo(w * 0.18, ceilingY);
      ctx.lineTo(w * 0.82, ceilingY);
      ctx.strokeStyle = rgba(glass, Math.min(0.72, (0.14 + (1 - reveal) * 0.4) * entrance * boost));
      ctx.lineWidth = px(0.01, minDim);
      ctx.stroke();

      const nodeY = h * 0.32 + reveal * h * 0.34;
      ctx.beginPath();
      ctx.arc(cx, nodeY, minDim * 0.03 * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(node, Math.min(0.94, (0.18 + reveal * 0.34) * entrance * boost));
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
      dragRef.current.active = true;
      dragRef.current.start = getPoint(e);
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      if (!dragRef.current.active || !dragRef.current.start) return;
      const end = getPoint(e);
      const dy = end.y - dragRef.current.start.y;
      if (dy > viewport.height * 0.16) {
        stateRef.current.flip = Math.max(stateRef.current.flip, 1);
      } else if (dy < -viewport.height * 0.1 && stateRef.current.errorCooldown === 0) {
        stateRef.current.errorCooldown = 18;
        callbacksRef.current.onHaptic('error_boundary');
      }
      dragRef.current.active = false;
      dragRef.current.start = null;
      canvas.releasePointerCapture(e.pointerId);
    };

    raf = window.requestAnimationFrame(render);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    return () => {
      window.cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}
