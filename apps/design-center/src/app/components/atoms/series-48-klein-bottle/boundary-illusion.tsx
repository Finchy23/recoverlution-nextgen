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
const STEP_T = 0.46;
const COMPLETE_T = 0.965;

export default function BoundaryIllusionAtom({
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
  const draggingRef = useRef(false);
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    nodeX: viewport.width * 0.24,
    reveal: 0,
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
    let lastX = 0;
    let lastTime = 0;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (!draggingRef.current && p.phase === 'resolve') s.reveal += (1 - s.reveal) * 0.08;
      s.revealFlash = Math.max(0, s.revealFlash - 0.02);
      if (s.errorCooldown > 0) s.errorCooldown -= 1;

      const reveal = easeOutCubic(clamp(s.reveal, 0, 1));
      const boost = p.composed ? 1.18 : 1;
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.72;
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
      const cage = lerpColor(accent, [255, 176, 118], 0.56);
      const node = lerpColor(primary, [246, 248, 255], 0.94);

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.9);
      bg.addColorStop(0, rgba(field, Math.min(0.15, (0.04 + reveal * 0.05) * entrance * boost)));
      bg.addColorStop(1, rgba(dense, Math.min(0.96, (0.24 + (1 - reveal) * 0.16) * entrance * boost)));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 6; i++) {
        const x = w * (0.34 + i * 0.08);
        ctx.beginPath();
        ctx.moveTo(x, h * 0.3);
        ctx.lineTo(x, h * 0.7);
        ctx.strokeStyle = rgba(cage, Math.min(0.58, (0.16 + (1 - reveal) * 0.34) * entrance * boost));
        ctx.lineWidth = px(0.006, minDim);
        ctx.stroke();
      }

      const nodeX = s.nodeX + (w * 0.76 - s.nodeX) * reveal;
      ctx.beginPath();
      ctx.arc(nodeX, cy, minDim * 0.03 * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(node, Math.min(0.94, (0.18 + reveal * 0.34) * entrance * boost));
      ctx.fill();

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getX = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return ((e.clientX - rect.left) / rect.width) * viewport.width;
    };
    const onDown = (e: PointerEvent) => {
      const x = getX(e);
      if (Math.abs(x - stateRef.current.nodeX) < viewport.width * 0.08) {
        draggingRef.current = true;
        lastX = x;
        lastTime = performance.now();
        canvas.setPointerCapture(e.pointerId);
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const x = getX(e);
      const now = performance.now();
      const velocity = Math.abs((x - lastX) / Math.max(16, now - lastTime));
      lastX = x;
      lastTime = now;
      if (velocity > 1.1) {
        if (stateRef.current.errorCooldown === 0) {
          stateRef.current.errorCooldown = 18;
          callbacksRef.current.onHaptic('error_boundary');
        }
        return;
      }
      stateRef.current.nodeX = clamp(x, viewport.width * 0.24, viewport.width * 0.76);
      stateRef.current.reveal = clamp((stateRef.current.nodeX - viewport.width * 0.24) / (viewport.width * 0.52), 0, 1);
    };
    const onUp = (e: PointerEvent) => {
      draggingRef.current = false;
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
