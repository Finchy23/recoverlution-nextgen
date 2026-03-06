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

function polylineLength(points: [number, number][]) {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  }
  return len;
}

function pointAlong(points: [number, number][], t: number): [number, number] {
  if (points.length === 0) return [0, 0];
  const total = polylineLength(points);
  if (total <= 0) return points[0];
  let target = total * clamp(t, 0, 1);
  for (let i = 1; i < points.length; i++) {
    const seg = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    if (target <= seg) {
      const lt = seg === 0 ? 0 : target / seg;
      return [
        points[i - 1][0] + (points[i][0] - points[i - 1][0]) * lt,
        points[i - 1][1] + (points[i][1] - points[i - 1][1]) * lt,
      ];
    }
    target -= seg;
  }
  return points[points.length - 1];
}

export default function ClosedCircuitDrainAtom({
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
    drawing: false,
    path: [] as [number, number][],
    grounded: false,
    drainProgress: 0,
    revealFlash: 0,
    dragCommitted: false,
    completionFired: false,
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

      if (s.grounded) {
        s.drainProgress = Math.min(1, s.drainProgress + 0.016 * (p.reducedMotion ? 0.7 : 1));
        if (s.drainProgress >= 1 && !s.completionFired) {
          s.completionFired = true;
          s.revealFlash = 1;
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      }

      const reveal = easeOutCubic(s.drainProgress);
      const circuit = 1 - reveal;
      const boost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));
      cb.onStateChange?.(reveal);

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const field = lerpColor(primary, accent, 0.24);
      const threat = lerpColor([10, 9, 16], accent, 0.16);
      const dense = lerpColor([4, 6, 10], primary, 0.1);
      const clarity = lerpColor(primary, [244, 247, 255], 0.92);
      const current = lerpColor(accent, [255, 236, 210], 0.6);

      const stage = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.74);
      stage.addColorStop(0, rgba(field, Math.min(0.16, (0.04 + circuit * 0.08) * entrance * boost)));
      stage.addColorStop(0.6, rgba(field, Math.min(0.08, (0.02 + circuit * 0.03) * entrance * boost)));
      stage.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const trackR = minDim * 0.22;
      ctx.beginPath();
      ctx.arc(cx, cy, trackR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(threat, Math.min(0.32, (0.12 + circuit * 0.2) * entrance * boost));
      ctx.lineWidth = px(0.016, minDim);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, trackR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(dense, Math.min(0.5, (0.18 + circuit * 0.22) * entrance * boost));
      ctx.lineWidth = px(0.008, minDim);
      ctx.stroke();

      const pulseT = s.grounded ? Math.max(0, 1 - s.drainProgress) : (s.frameCount * 0.012 * ms) % 1;
      const pulsePos: [number, number] = [cx + Math.cos(pulseT * Math.PI * 2 - Math.PI * 0.5) * trackR, cy + Math.sin(pulseT * Math.PI * 2 - Math.PI * 0.5) * trackR];

      const pulseGlow = ctx.createRadialGradient(pulsePos[0], pulsePos[1], 0, pulsePos[0], pulsePos[1], px(0.15, minDim));
      pulseGlow.addColorStop(0, rgba(current, Math.min(0.42, (0.16 + circuit * 0.2 + s.revealFlash * 0.08) * entrance * boost)));
      pulseGlow.addColorStop(1, rgba(current, 0));
      ctx.fillStyle = pulseGlow;
      ctx.fillRect(pulsePos[0] - minDim * 0.15, pulsePos[1] - minDim * 0.15, minDim * 0.3, minDim * 0.3);
      ctx.beginPath();
      ctx.arc(pulsePos[0], pulsePos[1], px(0.024, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(current, Math.min(0.96, (0.3 + circuit * 0.54) * entrance * boost));
      ctx.fill();

      if (s.path.length > 1) {
        ctx.beginPath();
        ctx.moveTo(s.path[0][0], s.path[0][1]);
        for (let i = 1; i < s.path.length; i++) ctx.lineTo(s.path[i][0], s.path[i][1]);
        ctx.strokeStyle = rgba(clarity, Math.min(0.28, (0.08 + reveal * 0.18) * entrance * boost));
        ctx.lineWidth = px(0.006, minDim);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        if (s.grounded) {
          const head = pointAlong(s.path, reveal);
          const drainGlow = ctx.createRadialGradient(head[0], head[1], 0, head[0], head[1], px(0.18, minDim));
          drainGlow.addColorStop(0, rgba(current, Math.min(0.4, (0.12 + reveal * 0.16) * entrance * boost)));
          drainGlow.addColorStop(1, rgba(current, 0));
          ctx.fillStyle = drainGlow;
          ctx.fillRect(head[0] - minDim * 0.18, head[1] - minDim * 0.18, minDim * 0.36, minDim * 0.36);
          ctx.beginPath();
          ctx.arc(head[0], head[1], px(0.026, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(current, Math.min(0.98, (0.24 + reveal * 0.5) * entrance * boost));
          ctx.fill();
        }
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.44);
        flash.addColorStop(0, rgba(clarity, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.62) * entrance));
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

    const onDown = (e: PointerEvent) => {
      const p = getPoint(e);
      const cx = viewport.width * 0.5;
      const cy = viewport.height * 0.5;
      const r = Math.min(viewport.width, viewport.height) * 0.22;
      const d = Math.abs(Math.hypot(p.x - cx, p.y - cy) - r);
      if (d > Math.min(viewport.width, viewport.height) * 0.06 || stateRef.current.grounded) return;
      stateRef.current.drawing = true;
      stateRef.current.path = [p];
      if (!stateRef.current.dragCommitted) {
        stateRef.current.dragCommitted = true;
        callbacksRef.current.onHaptic('drag_snap');
      }
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.drawing) return;
      const p = getPoint(e);
      s.path.push([p.x, p.y]);
      if (!s.grounded && (p.x < 0 || p.x > viewport.width || p.y < 0 || p.y > viewport.height || p.x < 8 || p.x > viewport.width - 8 || p.y < 8 || p.y > viewport.height - 8)) {
        s.grounded = true;
      }
    };

    const onUp = (e: PointerEvent) => {
      if (!stateRef.current.drawing) return;
      stateRef.current.drawing = false;
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
