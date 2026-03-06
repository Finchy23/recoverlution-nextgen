import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import {
  advanceEntrance,
  drawAtmosphere,
  easeOutCubic,
  lerpColor,
  motionScale,
  parseColor,
  px,
  rgba,
  setupCanvas,
} from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.48;
const COMPLETE_T = 0.965;

export default function UndertowSurrenderAtom({
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
  const activeRef = useRef(false);
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    stamina: 1,
    surrender: 0,
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
      const ms = motionScale(p.reducedMotion);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (!activeRef.current || p.phase === 'resolve') s.surrender += (1 - s.surrender) * 0.06 * ms;
      else s.surrender *= 0.9;
      s.revealFlash = Math.max(0, s.revealFlash - 0.02 * (p.reducedMotion ? 0.7 : 1));
      if (s.errorCooldown > 0) s.errorCooldown -= 1;

      const reveal = easeOutCubic(clamp(s.surrender, 0, 1));
      const boost = p.composed ? 1.18 : 1;
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.72;
        cb.onHaptic('hold_release');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        s.revealFlash = 1;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const deep = lerpColor(primary, [4, 10, 24], 0.28);
      const current = lerpColor(accent, [40, 120, 255], 0.38);
      const shore = lerpColor(primary, [220, 244, 255], 0.7);
      const node = lerpColor(primary, [246, 248, 255], 0.94);

      ctx.fillStyle = rgba(deep, Math.min(0.96, 0.3 * entrance * boost));
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 8; i++) {
        const y = h * (0.16 + i * 0.08);
        ctx.beginPath();
        ctx.moveTo(w * 0.12, y);
        ctx.bezierCurveTo(w * 0.32, y - minDim * 0.04, w * 0.68, y + minDim * 0.04, w * 0.88, y);
        ctx.strokeStyle = rgba(current, Math.min(0.56, (0.12 + (1 - reveal) * 0.24) * entrance * boost));
        ctx.lineWidth = px(0.008, minDim);
        ctx.stroke();
      }

      const nodeX = cx + reveal * w * 0.24;
      const nodeY = cy + (1 - reveal) * minDim * 0.08;
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, minDim * 0.03 * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(node, Math.min(0.94, (0.18 + reveal * 0.3) * entrance * boost));
      ctx.fill();

      ctx.beginPath();
      ctx.arc(w * 0.16, h * 0.14, minDim * 0.06, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(node, Math.min(0.42, (0.12 + s.stamina * 0.24) * entrance * boost));
      ctx.lineWidth = px(0.008, minDim);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w * 0.16, h * 0.14, minDim * 0.06, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * s.stamina);
      ctx.strokeStyle = rgba(shore, Math.min(0.86, (0.12 + s.stamina * 0.42) * entrance * boost));
      ctx.lineWidth = px(0.008, minDim);
      ctx.stroke();

      if (reveal > 0.2) {
        ctx.fillStyle = rgba(shore, Math.min(0.42, (0.08 + reveal * 0.24 + s.revealFlash * 0.04) * entrance * boost));
        ctx.fillRect(w * 0.72, h * 0.74, w * 0.18, h * 0.08);
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onDown = (e: PointerEvent) => {
      activeRef.current = true;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = () => {
      if (!activeRef.current) return;
      stateRef.current.stamina = Math.max(0, stateRef.current.stamina - 0.02);
      stateRef.current.surrender = Math.max(0, stateRef.current.surrender - 0.03);
      if (stateRef.current.errorCooldown === 0) {
        stateRef.current.errorCooldown = 18;
        callbacksRef.current.onHaptic('error_boundary');
      }
    };
    const onUp = (e: PointerEvent) => {
      activeRef.current = false;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}
