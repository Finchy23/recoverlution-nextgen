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
  motionScale,
  type RGB,
} from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const FLASH_DECAY = 0.024;
const STEP_T = 0.56;
const COMPLETE_T = 0.96;

function rectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.beginPath();
  ctx.rect(x, y, w, h);
}

export default function DrosteRecursionAtom({
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

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onStateChange, onResolve]);

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    pointers: new Map<number, { x: number; y: number }>(),
    pinchActive: false,
    baseDist: 0,
    baseZoom: 1,
    zoom: 1,
    thresholdFired: false,
    completionFired: false,
    revealFlash: 0,
    errorCooldown: 0,
  });

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId = 0;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve' && !s.pinchActive) s.zoom += (0 - s.zoom) * 0.08;
      if (s.errorCooldown > 0) s.errorCooldown--;

      const reveal = easeOutCubic(clamp(1 - Math.max(0, s.zoom), 0, 1));
      const recursion = Math.max(0, s.zoom - 1);
      const boost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));
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
      if (recursion > 0.16 && s.errorCooldown === 0) {
        s.errorCooldown = 16;
        cb.onHaptic('error_boundary');
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const field = lerpColor(primary, accent, 0.24);
      const threat = lerpColor([10, 9, 16], accent, 0.16);
      const dense = lerpColor([5, 6, 11], primary, 0.08);
      const clarity = lerpColor(primary, [244, 247, 255], 0.92);
      const border = lerpColor(accent, [255, 236, 208], 0.58);

      const stage = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.76);
      stage.addColorStop(0, rgba(field, Math.min(0.16, (0.05 + (1 - reveal) * 0.08) * entrance * boost)));
      stage.addColorStop(0.6, rgba(field, Math.min(0.08, (0.02 + (1 - reveal) * 0.03) * entrance * boost)));
      stage.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const dread = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.92);
      dread.addColorStop(0, rgba(threat, Math.min(0.28, (0.08 + recursion * 0.18 + (1 - reveal) * 0.06) * entrance * boost)));
      dread.addColorStop(0.56, rgba(dense, Math.min(0.14, (0.04 + recursion * 0.08) * entrance * boost)));
      dread.addColorStop(1, rgba(dense, 0));
      ctx.fillStyle = dread;
      ctx.fillRect(0, 0, w, h);

      const borderInset = minDim * (0.08 + reveal * 0.02);
      ctx.strokeStyle = rgba(border, Math.min(0.28, (0.06 + reveal * 0.14 + s.revealFlash * 0.06) * entrance * boost));
      ctx.lineWidth = px(0.0032, minDim);
      rectPath(ctx, borderInset, borderInset, w - borderInset * 2, h - borderInset * 2);
      ctx.stroke();

      const levels = 8 + Math.floor(recursion * 12);
      const spin = recursion * 0.32;
      for (let i = 0; i < levels; i++) {
        const t = i / Math.max(1, levels - 1);
        const size = minDim * (0.62 - t * 0.44) / (1 + recursion * 0.4) + recursion * minDim * 0.05;
        const alpha = Math.max(0.02, (0.16 - t * 0.1 + recursion * 0.06) * entrance * boost);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((s.frameCount * 0.004 * ms + t * 0.6) * spin);
        ctx.strokeStyle = rgba(i % 2 === 0 ? clarity : threat, alpha);
        ctx.lineWidth = px(0.0016, minDim);
        ctx.strokeRect(-size * 0.5, -size * 0.38, size, size * 0.76);
        ctx.restore();
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.44);
        flash.addColorStop(0, rgba(clarity, (s.revealFlash * 0.24 + Math.max(0, reveal - 0.9) * 0.66) * entrance));
        flash.addColorStop(1, rgba(clarity, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.44, cy - minDim * 0.44, minDim * 0.88, minDim * 0.88);
      }

      ctx.restore();
      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);

    const getPoint = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * viewport.width,
        y: ((e.clientY - rect.top) / rect.height) * viewport.height,
      };
    };

    const distance = () => {
      const pts = [...stateRef.current.pointers.values()];
      if (pts.length < 2) return 0;
      return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    };

    const onDown = (e: PointerEvent) => {
      stateRef.current.pointers.set(e.pointerId, getPoint(e));
      canvas.setPointerCapture(e.pointerId);
      if (stateRef.current.pointers.size === 2) {
        stateRef.current.pinchActive = true;
        stateRef.current.baseDist = distance();
        stateRef.current.baseZoom = stateRef.current.zoom;
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.pointers.has(e.pointerId)) return;
      stateRef.current.pointers.set(e.pointerId, getPoint(e));
      if (stateRef.current.pointers.size >= 2 && stateRef.current.baseDist > 0) {
        const d = distance();
        const delta = (d - stateRef.current.baseDist) / 180;
        stateRef.current.zoom = clamp(stateRef.current.baseZoom + delta, 0, 1.45);
      }
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.pointers.delete(e.pointerId);
      if (stateRef.current.pointers.size < 2) stateRef.current.pinchActive = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    return () => {
      window.cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'zoom-in' }} />
    </div>
  );
}
