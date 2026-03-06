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
const STEP_T = 0.46;
const COMPLETE_T = 0.965;

type DragMode = 'none' | 'left' | 'right' | 'center';

export default function TetheredAvatarAtom({
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
  const dragModeRef = useRef<DragMode>('none');
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    collapse: 0,
    chaos: 0,
    centerGrab: 0.5,
    thresholdFired: false,
    completionFired: false,
    revealFlash: 0,
    errorCooldown: 0,
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

      if (dragModeRef.current === 'center') {
        s.collapse += (1 - s.collapse) * 0.16 * ms;
        s.chaos += (0 - s.chaos) * 0.14 * ms;
      } else if (p.phase === 'resolve') {
        s.collapse += (1 - s.collapse) * 0.1 * ms;
      } else {
        s.collapse += (0 - s.collapse) * 0.08 * ms;
        s.chaos *= 0.9;
      }

      s.revealFlash = Math.max(0, s.revealFlash - 0.02 * (p.reducedMotion ? 0.7 : 1));
      if (s.errorCooldown > 0) s.errorCooldown -= 1;

      const reveal = easeOutCubic(clamp(s.collapse, 0, 1));
      const boost = p.composed ? 1.18 : 1;
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.72;
        cb.onHaptic('drag_snap');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        s.revealFlash = 1;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const field = lerpColor(primary, accent, 0.18);
      const dense = lerpColor([5, 7, 13], primary, 0.1);
      const rod = lerpColor(primary, [244, 247, 255], 0.84);
      const nodeA = lerpColor(primary, [246, 248, 255], 0.92);
      const nodeB = lerpColor(accent, [255, 225, 205], 0.76);
      const unified = lerpColor(nodeA, nodeB, 0.5);

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.9);
      bg.addColorStop(0, rgba(field, Math.min(0.15, (0.04 + reveal * 0.05) * entrance * boost)));
      bg.addColorStop(1, rgba(dense, Math.min(0.96, (0.24 + (1 - reveal) * 0.16) * entrance * boost)));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const baseSpan = minDim * 0.26;
      const span = baseSpan * (1 - reveal);
      const chaosOffset = s.chaos * minDim * 0.07;
      const leftX = cx - span - chaosOffset;
      const rightX = cx + span + chaosOffset;
      const handleX = cx + (s.centerGrab - 0.5) * minDim * 0.16 * (1 - reveal);

      ctx.beginPath();
      ctx.moveTo(leftX, cy);
      ctx.lineTo(rightX, cy);
      ctx.strokeStyle = rgba(rod, Math.min(0.68, (0.12 + (1 - reveal) * 0.34 + reveal * 0.16) * entrance * boost));
      ctx.lineWidth = px(0.01, minDim);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(leftX, cy, minDim * 0.03 * (1 + breathAmplitude * 0.015), 0, Math.PI * 2);
      ctx.fillStyle = rgba(lerpColor(nodeA, unified, reveal), Math.min(0.94, (0.18 + (1 - reveal) * 0.38 + reveal * 0.28) * entrance * boost));
      ctx.fill();

      ctx.beginPath();
      ctx.arc(rightX, cy, minDim * 0.03 * (1 + breathAmplitude * 0.015), 0, Math.PI * 2);
      ctx.fillStyle = rgba(lerpColor(nodeB, unified, reveal), Math.min(0.88, (0.16 + (1 - reveal) * 0.4 + reveal * 0.24) * entrance * boost));
      ctx.fill();

      ctx.beginPath();
      ctx.arc(handleX, cy, minDim * 0.022 * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(unified, Math.min(0.9, (0.16 + reveal * 0.42 + s.revealFlash * 0.06) * entrance * boost));
      ctx.fill();

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getPoint = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * viewport.width,
        y: ((e.clientY - rect.top) / rect.height) * viewport.height,
      };
    };

    const onDown = (e: PointerEvent) => {
      const point = getPoint(e);
      const cx = viewport.width * 0.5;
      const cy = viewport.height * 0.5;
      const minDim = Math.min(viewport.width, viewport.height);
      const baseSpan = minDim * 0.26;
      const leftX = cx - baseSpan * (1 - stateRef.current.collapse);
      const rightX = cx + baseSpan * (1 - stateRef.current.collapse);
      if (Math.hypot(point.x - cx, point.y - cy) < minDim * 0.08) {
        dragModeRef.current = 'center';
        canvas.setPointerCapture(e.pointerId);
        return;
      }
      if (Math.hypot(point.x - leftX, point.y - cy) < minDim * 0.08) dragModeRef.current = 'left';
      else if (Math.hypot(point.x - rightX, point.y - cy) < minDim * 0.08) dragModeRef.current = 'right';
      else return;
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const mode = dragModeRef.current;
      if (mode === 'none') return;
      const point = getPoint(e);
      const cx = viewport.width * 0.5;
      if (mode === 'center') {
        stateRef.current.centerGrab = clamp(point.x / viewport.width, 0.38, 0.62);
        return;
      }
      stateRef.current.chaos = clamp(stateRef.current.chaos + 0.12, 0, 1);
      if (stateRef.current.errorCooldown === 0) {
        stateRef.current.errorCooldown = 18;
        callbacksRef.current.onHaptic('error_boundary');
      }
      const direction = mode === 'left' ? -1 : 1;
      stateRef.current.centerGrab = clamp(0.5 + ((point.x - cx) / viewport.width) * 0.12 * direction, 0.38, 0.62);
    };

    const onUp = (e: PointerEvent) => {
      if (dragModeRef.current === 'none') return;
      dragModeRef.current = 'none';
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
