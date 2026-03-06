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
const FLASH_DECAY = 0.022;
const STEP_T = 0.5;
const COMPLETE_T = 0.965;

type Point = { x: number; y: number };

const lerpPoint = (a: Point, b: Point, t: number): Point => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

function distanceToSegment(p: Point, a: Point, b: Point) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / l2, 0, 1);
  const proj = { x: a.x + dx * t, y: a.y + dy * t };
  return Math.hypot(p.x - proj.x, p.y - proj.y);
}

export default function BlindNavigationAtom({
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
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    dragging: false,
    lastPoint: null as Point | null,
    progress: 0,
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

    const path = () => {
      const w = viewport.width;
      const h = viewport.height;
      return [
        { x: w * 0.2, y: h * 0.78 },
        { x: w * 0.28, y: h * 0.62 },
        { x: w * 0.44, y: h * 0.58 },
        { x: w * 0.58, y: h * 0.44 },
        { x: w * 0.74, y: h * 0.38 },
        { x: w * 0.82, y: h * 0.22 },
      ];
    };

    const pointOnPath = (progress: number) => {
      const pts = path();
      const segs = pts.length - 1;
      const scaled = clamp(progress, 0, 0.9999) * segs;
      const index = Math.floor(scaled);
      const local = scaled - index;
      return lerpPoint(pts[index], pts[index + 1], local);
    };

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      if (s.errorCooldown > 0) s.errorCooldown--;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.progress = Math.max(s.progress, 1);

      const reveal = easeOutCubic(clamp(s.progress, 0, 1));
      const hidden = 1 - reveal;
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

      const pts = path();
      const node = pointOnPath(s.progress);
      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const field = lerpColor(primary, accent, 0.16);
      const dense = lerpColor([4, 5, 10], primary, 0.08);
      const track = lerpColor(primary, [244, 247, 255], 0.86);
      const ember = lerpColor(accent, [255, 236, 210], 0.6);

      const darkness = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, minDim * 0.84);
      darkness.addColorStop(0, rgba(field, Math.min(0.16, (0.05 + reveal * 0.06) * entrance * boost)));
      darkness.addColorStop(0.26, rgba(field, Math.min(0.08, (0.02 + reveal * 0.03) * entrance * boost)));
      darkness.addColorStop(1, rgba(dense, Math.min(0.96, (0.28 + hidden * 0.18) * entrance * boost)));
      ctx.fillStyle = darkness;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.beginPath();
      ctx.arc(node.x, node.y, minDim * 0.2, 0, Math.PI * 2);
      ctx.clip();

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.strokeStyle = rgba(track, Math.min(0.26, (0.08 + reveal * 0.12) * entrance * boost));
      ctx.lineWidth = px(0.014, minDim);
      ctx.lineCap = 'round';
      ctx.stroke();

      const beacon = pts[pts.length - 1];
      const beaconGlow = ctx.createRadialGradient(beacon.x, beacon.y, 0, beacon.x, beacon.y, minDim * 0.16);
      beaconGlow.addColorStop(0, rgba(track, Math.min(0.26, (0.06 + reveal * 0.1) * entrance * boost)));
      beaconGlow.addColorStop(1, rgba(track, 0));
      ctx.fillStyle = beaconGlow;
      ctx.fillRect(beacon.x - minDim * 0.16, beacon.y - minDim * 0.16, minDim * 0.32, minDim * 0.32);
      ctx.restore();

      const fogRing = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, minDim * 0.24);
      fogRing.addColorStop(0, rgba(ember, Math.min(0.12, (0.03 + reveal * 0.06 + s.revealFlash * 0.03) * entrance * boost)));
      fogRing.addColorStop(1, rgba(ember, 0));
      ctx.fillStyle = fogRing;
      ctx.fillRect(node.x - minDim * 0.24, node.y - minDim * 0.24, minDim * 0.48, minDim * 0.48);

      ctx.beginPath();
      ctx.arc(node.x, node.y, px(0.028, minDim) * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(track, Math.min(0.98, (0.24 + reveal * 0.48) * entrance * boost));
      ctx.fill();

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, minDim * 0.42);
        flash.addColorStop(0, rgba(track, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.62) * entrance));
        flash.addColorStop(1, rgba(track, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(node.x - minDim * 0.42, node.y - minDim * 0.42, minDim * 0.84, minDim * 0.84);
      }

      ctx.restore();
      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);

    const getPoint = (e: PointerEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * viewport.width,
        y: ((e.clientY - rect.top) / rect.height) * viewport.height,
      };
    };

    const onDown = (e: PointerEvent) => {
      const point = getPoint(e);
      const s = stateRef.current;
      const node = pointOnPath(s.progress);
      if (Math.hypot(point.x - node.x, point.y - node.y) < Math.min(viewport.width, viewport.height) * 0.11) {
        s.dragging = true;
        s.lastPoint = point;
        canvas.setPointerCapture(e.pointerId);
        callbacksRef.current.onHaptic('drag_snap');
      }
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || !s.lastPoint) return;
      const point = getPoint(e);
      const delta = Math.hypot(point.x - s.lastPoint.x, point.y - s.lastPoint.y);
      const speedPenalty = delta / Math.min(viewport.width, viewport.height);
      const nextProgress = clamp(s.progress + (point.y < s.lastPoint.y ? 0.014 : -0.01), 0, 1);
      const pathPts = path();
      const candidate = pointOnPath(nextProgress);
      let corridor = Infinity;
      for (let i = 0; i < pathPts.length - 1; i++) {
        corridor = Math.min(corridor, distanceToSegment(point, pathPts[i], pathPts[i + 1]));
      }
      if (corridor < Math.min(viewport.width, viewport.height) * 0.08 && speedPenalty < 0.065) {
        s.progress = nextProgress;
      } else if (s.errorCooldown === 0) {
        s.errorCooldown = 18;
        callbacksRef.current.onHaptic('error_boundary');
      }
      s.lastPoint = point;
    };

    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      s.dragging = false;
      s.lastPoint = null;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}
