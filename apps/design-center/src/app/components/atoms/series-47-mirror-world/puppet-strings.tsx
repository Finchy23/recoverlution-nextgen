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

type Point = { x: number; y: number };

export default function PuppetStringsAtom({
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
  const dragRef = useRef({ dragging: false, swipeStart: null as Point | null });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    puppetX: viewport.width * 0.68,
    anchorX: viewport.width * 0.32,
    sever: 0,
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
      if (p.phase === 'resolve') s.sever += (1 - s.sever) * 0.08 * ms;
      s.revealFlash = Math.max(0, s.revealFlash - 0.02 * (p.reducedMotion ? 0.7 : 1));
      if (s.errorCooldown > 0) s.errorCooldown -= 1;

      const reveal = easeOutCubic(clamp(s.sever, 0, 1));
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
      const field = lerpColor(primary, accent, 0.18);
      const dense = lerpColor([5, 7, 13], primary, 0.1);
      const stringColor = lerpColor(primary, [246, 248, 255], 0.9);
      const puppet = lerpColor(accent, [255, 224, 204], 0.78);
      const self = lerpColor(primary, [246, 248, 255], 0.94);

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.9);
      bg.addColorStop(0, rgba(field, Math.min(0.15, (0.04 + reveal * 0.05) * entrance * boost)));
      bg.addColorStop(1, rgba(dense, Math.min(0.96, (0.24 + (1 - reveal) * 0.16) * entrance * boost)));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const puppetY = cy - minDim * 0.1;
      const selfY = cy + minDim * 0.12;
      const puppetX = s.puppetX + (w * 0.2 - s.puppetX) * reveal;
      const anchorX = s.anchorX + (w * 0.32 - s.anchorX) * reveal;

      if (reveal < 0.98) {
        ctx.beginPath();
        ctx.moveTo(anchorX, selfY);
        ctx.lineTo(puppetX, puppetY);
        ctx.strokeStyle = rgba(stringColor, Math.min(0.72, (0.14 + (1 - reveal) * 0.42) * entrance * boost));
        ctx.lineWidth = px(0.005, minDim);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(anchorX, selfY, minDim * 0.03 * (1 + breathAmplitude * 0.015), 0, Math.PI * 2);
      ctx.fillStyle = rgba(self, Math.min(0.94, (0.18 + reveal * 0.28 + (1 - reveal) * 0.3) * entrance * boost));
      ctx.fill();

      ctx.beginPath();
      ctx.arc(puppetX, puppetY, minDim * 0.028 * (1 + breathAmplitude * 0.015), 0, Math.PI * 2);
      ctx.fillStyle = rgba(puppet, Math.min(0.88, (0.16 + (1 - reveal) * 0.4) * entrance * boost));
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
      const minDim = Math.min(viewport.width, viewport.height);
      const puppetY = viewport.height * 0.5 - minDim * 0.1;
      if (Math.hypot(point.x - stateRef.current.puppetX, point.y - puppetY) < minDim * 0.09) {
        dragRef.current.dragging = true;
        canvas.setPointerCapture(e.pointerId);
      } else {
        dragRef.current.swipeStart = point;
        canvas.setPointerCapture(e.pointerId);
      }
    };

    const onMove = (e: PointerEvent) => {
      const point = getPoint(e);
      if (dragRef.current.dragging) {
        stateRef.current.puppetX = clamp(point.x, viewport.width * 0.52, viewport.width * 0.82);
        stateRef.current.anchorX = clamp(viewport.width - stateRef.current.puppetX, viewport.width * 0.18, viewport.width * 0.48);
        if (stateRef.current.errorCooldown === 0) {
          stateRef.current.errorCooldown = 18;
          callbacksRef.current.onHaptic('error_boundary');
        }
      }
    };

    const onUp = (e: PointerEvent) => {
      const point = getPoint(e);
      if (dragRef.current.swipeStart) {
        const start = dragRef.current.swipeStart;
        const dx = point.x - start.x;
        const dy = Math.abs(point.y - start.y);
        if (Math.abs(dx) > viewport.width * 0.18 && dy < viewport.height * 0.12) {
          stateRef.current.sever = Math.max(stateRef.current.sever, 1);
        }
      }
      dragRef.current.dragging = false;
      dragRef.current.swipeStart = null;
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
