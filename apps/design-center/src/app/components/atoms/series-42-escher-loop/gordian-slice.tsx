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
} from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const FLASH_DECAY = 0.024;
const STEP_T = 0.6;
const COMPLETE_T = 0.965;

type TrailPoint = { x: number; y: number; t: number };

export default function GordianSliceAtom({
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
    trail: [] as TrailPoint[],
    swiping: false,
    sliceStrength: 0,
    knotTightness: 0,
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
      if (s.errorCooldown > 0) s.errorCooldown--;
      if (!s.swiping) s.knotTightness += (0 - s.knotTightness) * 0.08;
      if (p.phase === 'resolve' && !s.swiping) s.sliceStrength += (1 - s.sliceStrength) * 0.08;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const reveal = easeOutCubic(clamp(s.sliceStrength, 0, 1));
      const snarl = clamp(1 - reveal + s.knotTightness * 0.6, 0, 1.4);
      const boost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));
      cb.onStateChange?.(reveal);

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.78;
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
      const field = lerpColor(primary, accent, 0.24);
      const threat = lerpColor([10, 9, 16], accent, 0.18);
      const dense = lerpColor([5, 6, 11], primary, 0.12);
      const clarity = lerpColor(primary, [244, 247, 255], 0.92);
      const ember = lerpColor(accent, [255, 236, 210], 0.62);

      const stage = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.8);
      stage.addColorStop(0, rgba(field, Math.min(0.18, (0.05 + snarl * 0.07) * entrance * boost)));
      stage.addColorStop(0.62, rgba(field, Math.min(0.08, (0.02 + snarl * 0.03) * entrance * boost)));
      stage.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const dread = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.94);
      dread.addColorStop(0, rgba(threat, Math.min(0.36, (0.1 + snarl * 0.16) * entrance * boost)));
      dread.addColorStop(0.56, rgba(dense, Math.min(0.18, (0.05 + snarl * 0.08) * entrance * boost)));
      dread.addColorStop(1, rgba(dense, 0));
      ctx.fillStyle = dread;
      ctx.fillRect(0, 0, w, h);

      const strands = 90;
      for (let i = 0; i < strands; i++) {
        const t = i / strands;
        const ang = t * Math.PI * 2 + s.frameCount * 0.002 * ms;
        const radiusA = minDim * (0.07 + (i % 5) * 0.014 + s.knotTightness * 0.018);
        const radiusB = minDim * (0.16 + ((i * 7) % 11) * 0.01 + s.knotTightness * 0.03);
        const slicePush = reveal * minDim * 0.18 * (t < 0.5 ? -1 : 1);
        const x1 = cx + Math.cos(ang * 3.1) * radiusA + slicePush;
        const y1 = cy + Math.sin(ang * 2.4) * radiusA;
        const x2 = cx + Math.cos(ang + t * 5.2) * radiusB + slicePush;
        const y2 = cy + Math.sin(ang * 1.7 + t * 7.1) * radiusB;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(
          cx + Math.cos(ang * 1.3) * radiusB * 0.42 + slicePush * 0.5,
          cy + Math.sin(ang * 2.1) * radiusA * 0.9,
          cx + Math.cos(ang * 2.7) * radiusA * 0.7 + slicePush * 0.6,
          cy + Math.sin(ang * 1.5) * radiusB * 0.5,
          x2,
          y2,
        );
        ctx.strokeStyle = rgba(i % 3 === 0 ? ember : threat, Math.min(0.32, (0.08 + snarl * 0.14 + reveal * 0.06) * entrance * boost));
        ctx.lineWidth = px(0.002 + (i % 4) * 0.0005, minDim);
        ctx.stroke();
      }

      if (reveal > 0.06) {
        const splitGlow = ctx.createLinearGradient(cx - minDim * 0.28, cy, cx + minDim * 0.28, cy);
        splitGlow.addColorStop(0, rgba(clarity, 0));
        splitGlow.addColorStop(0.5, rgba(clarity, Math.min(0.26, reveal * 0.26 * entrance * boost)));
        splitGlow.addColorStop(1, rgba(clarity, 0));
        ctx.strokeStyle = splitGlow;
        ctx.lineWidth = px(0.01, minDim);
        ctx.beginPath();
        ctx.moveTo(cx - minDim * 0.3, cy);
        ctx.lineTo(cx + minDim * 0.3, cy);
        ctx.stroke();
      }

      if (s.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(s.trail[0].x, s.trail[0].y);
        for (let i = 1; i < s.trail.length; i++) ctx.lineTo(s.trail[i].x, s.trail[i].y);
        ctx.strokeStyle = rgba(clarity, Math.min(0.26, (0.06 + s.sliceStrength * 0.18) * entrance * boost));
        ctx.lineWidth = px(0.007, minDim);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.46);
        flash.addColorStop(0, rgba(clarity, (s.revealFlash * 0.24 + Math.max(0, reveal - 0.9) * 0.66) * entrance));
        flash.addColorStop(1, rgba(clarity, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.46, cy - minDim * 0.46, minDim * 0.92, minDim * 0.92);
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

    const assessTrail = (trail: TrailPoint[]) => {
      if (trail.length < 2) return { success: false, speed: 0, straightness: 0, crossedCenter: false };
      const start = trail[0];
      const end = trail[trail.length - 1];
      const dist = Math.hypot(end.x - start.x, end.y - start.y);
      let length = 0;
      let crossedCenter = false;
      for (let i = 1; i < trail.length; i++) {
        length += Math.hypot(trail[i].x - trail[i - 1].x, trail[i].y - trail[i - 1].y);
        const a = trail[i - 1];
        const b = trail[i];
        if ((a.x <= viewport.width * 0.5 && b.x >= viewport.width * 0.5) || (a.x >= viewport.width * 0.5 && b.x <= viewport.width * 0.5)) {
          const avgY = (a.y + b.y) * 0.5;
          if (Math.abs(avgY - viewport.height * 0.5) < Math.min(viewport.width, viewport.height) * 0.16) crossedCenter = true;
        }
      }
      const elapsed = Math.max(16, end.t - start.t);
      const speed = dist / elapsed;
      const straightness = length <= 0 ? 0 : dist / length;
      const success = speed > 1.35 && straightness > 0.9 && crossedCenter && dist > Math.min(viewport.width, viewport.height) * 0.36;
      return { success, speed, straightness, crossedCenter };
    };

    const onDown = (e: PointerEvent) => {
      stateRef.current.swiping = true;
      stateRef.current.trail = [{ ...getPoint(e), t: performance.now() }];
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.swiping) return;
      s.trail.push({ ...getPoint(e), t: performance.now() });
      if (s.trail.length > 18) s.trail.shift();
      s.knotTightness = clamp(s.knotTightness + 0.02, 0, 1);
    };

    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.swiping) return;
      s.swiping = false;
      const result = assessTrail(s.trail);
      if (result.success) {
        s.sliceStrength = 1;
      } else {
        s.knotTightness = clamp(s.knotTightness + 0.18, 0, 1);
        if (s.errorCooldown === 0) {
          s.errorCooldown = 16;
          callbacksRef.current.onHaptic('error_boundary');
        }
      }
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} />
    </div>
  );
}
