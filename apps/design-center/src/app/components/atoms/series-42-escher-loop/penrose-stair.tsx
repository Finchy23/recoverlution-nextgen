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
const FLASH_DECAY = 0.022;
const STEP_T = 0.52;
const COMPLETE_T = 0.965;
const PULL_MIN = 70;
const PULL_MAX = 360;
const TRACE_SPEED = 0.0042;

function stairPath(cx: number, cy: number, r: number, flatten: number): [number, number][] {
  const left = cx - r;
  const right = cx + r;
  const top = cy - r * 0.74;
  const bottom = cy + r * 0.74;
  const step = r * 0.16;
  const raised = r * 0.24 * (1 - flatten);

  const loop: [number, number][] = [
    [left, bottom],
    [left + step * 0.9, bottom - step * 0.45],
    [left + step * 1.55, bottom - step * 0.85],
    [cx - step * 0.4, cy + step * 0.08],
    [cx + step * 0.08, cy - step * 0.18],
    [right - step * 1.75, cy - step * 0.46],
    [right - step * 1.1, top + step * 0.86],
    [right, top],
    [right - step * 0.8, top - raised],
    [cx + step * 0.06, cy - r * 0.92],
    [left + step * 1.4, top - step * 0.45],
    [left, cy - step * 0.42],
    [left + step * 0.62, cy - step * 0.06],
    [cx - step * 0.12, cy + step * 0.22],
    [right - step * 1.3, bottom - step * 0.86],
    [right, bottom],
    [right - step * 1.15, bottom + raised * 0.68],
    [cx + step * 0.1, cy + r * 0.94],
    [left + step * 1.2, bottom + step * 0.34],
  ];

  const lineY = cy + r * 0.18;
  return loop.map(([x, y], i) => {
    const t = i / (loop.length - 1);
    const lineX = left + (right - left) * t;
    return [x + (lineX - x) * flatten, y + (lineY - y) * flatten];
  });
}

function drawPolyline(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  color: RGB,
  alpha: number,
  width: number,
) {
  if (alpha <= 0 || points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.strokeStyle = rgba(color, alpha);
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
}

function pointAt(points: [number, number][], t: number): [number, number] {
  if (points.length === 0) return [0, 0];
  const segs = points.length - 1;
  const scaled = clamp(t, 0, 0.999999) * segs;
  const i = Math.floor(scaled);
  const lt = scaled - i;
  const a = points[i];
  const b = points[Math.min(points.length - 1, i + 1)];
  return [a[0] + (b[0] - a[0]) * lt, a[1] + (b[1] - a[1]) * lt];
}

export default function PenroseStairAtom({
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
    traceT: 0,
    stepCount: 0,
    pointers: new Map<number, { x: number; y: number }>(),
    pullProgress: 0,
    pinchActive: false,
    thresholdFired: false,
    completionFired: false,
    revealFlash: 0,
    lastDistance: 0,
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

      if (!p.reducedMotion && s.pullProgress < COMPLETE_T) {
        const speed = TRACE_SPEED * (1 - s.pullProgress * 0.72);
        const prevBand = Math.floor(s.traceT * 10);
        s.traceT = (s.traceT + speed) % 1;
        const nextBand = Math.floor(s.traceT * 10);
        if (nextBand !== prevBand && !s.pinchActive) cb.onHaptic('step_advance');
      }

      if (p.phase === 'resolve' && !s.pinchActive) s.pullProgress += (1 - s.pullProgress) * 0.08;

      const reveal = easeOutCubic(clamp(s.pullProgress, 0, 1));
      const loopMass = 1 - reveal;
      const boost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.65 : 1));
      cb.onStateChange?.(reveal);

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.75;
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
      const field = lerpColor(primary, accent, 0.26);
      const threat = lerpColor([7, 7, 13], accent, 0.14);
      const dense = lerpColor([5, 5, 10], primary, 0.08);
      const clarity = lerpColor(primary, [243, 247, 255], 0.9);
      const stepGlow = lerpColor(accent, [255, 236, 208], 0.5);

      const stage = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.72);
      stage.addColorStop(0, rgba(field, Math.min(0.18, (0.05 + loopMass * 0.08 + reveal * 0.03) * entrance * boost)));
      stage.addColorStop(0.58, rgba(field, Math.min(0.08, (0.02 + loopMass * 0.03) * entrance * boost)));
      stage.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const dread = ctx.createRadialGradient(cx, cy - minDim * 0.04, 0, cx, cy - minDim * 0.04, minDim * 0.94);
      dread.addColorStop(0, rgba(threat, Math.min(0.34, (0.1 + loopMass * 0.18) * entrance * boost)));
      dread.addColorStop(0.48, rgba(dense, Math.min(0.24, (0.06 + loopMass * 0.14) * entrance * boost)));
      dread.addColorStop(1, rgba(dense, 0));
      ctx.fillStyle = dread;
      ctx.fillRect(0, 0, w, h);

      const ringR = minDim * 0.34;
      const path = stairPath(cx, cy + minDim * 0.01, ringR, reveal);

      // Stair glow underlay
      drawPolyline(ctx, path, threat, Math.min(0.26, (0.09 + loopMass * 0.12) * entrance * boost), px(0.05, minDim));
      drawPolyline(ctx, path, dense, Math.min(0.52, (0.18 + loopMass * 0.22) * entrance * boost), px(0.032, minDim));
      drawPolyline(ctx, path, clarity, Math.min(0.22, (0.04 + reveal * 0.08) * entrance * boost), px(0.0056, minDim));

      // Stair risers / impossible increments.
      for (let i = 0; i < 10; i++) {
        const t0 = i / 10;
        const t1 = t0 + 0.045;
        const a = pointAt(path, t0);
        const b = pointAt(path, t1);
        const riseX = (a[0] + b[0]) * 0.5;
        const riseY = (a[1] + b[1]) * 0.5;
        const dirX = b[0] - a[0];
        const dirY = b[1] - a[1];
        const len = Math.max(1, Math.hypot(dirX, dirY));
        const nx = -dirY / len;
        const ny = dirX / len;
        const rise = px(0.022 * (1 - reveal * 0.82), minDim);
        drawPolyline(
          ctx,
          [
            [riseX - nx * rise, riseY - ny * rise],
            [riseX + nx * rise, riseY + ny * rise],
          ],
          stepGlow,
          Math.min(0.24, (0.06 + loopMass * 0.1) * entrance * boost),
          px(0.0021, minDim),
        );
      }

      // Tracer / footsteps.
      const walker = pointAt(path, s.traceT);
      const next = pointAt(path, (s.traceT + 0.02) % 1);
      const dx = next[0] - walker[0];
      const dy = next[1] - walker[1];
      const len = Math.max(1, Math.hypot(dx, dy));
      const nx = -dy / len;
      const ny = dx / len;
      const footSpread = px(0.012 + loopMass * 0.006, minDim);
      const footLen = px(0.024 + loopMass * 0.01, minDim);
      const wobble = Math.sin(s.frameCount * 0.12 * ms) * px(0.003, minDim);
      for (const sign of [-1, 1]) {
        const fx = walker[0] + nx * footSpread * sign;
        const fy = walker[1] + ny * footSpread * sign;
        ctx.beginPath();
        ctx.ellipse(fx, fy, footLen * 0.42, footLen * 0.18, Math.atan2(dy, dx) + wobble * 0.02, 0, Math.PI * 2);
        ctx.fillStyle = rgba(stepGlow, Math.min(0.9, (0.22 + loopMass * 0.42 + s.revealFlash * 0.12) * entrance * boost));
        ctx.fill();
      }

      const walkerGlow = ctx.createRadialGradient(walker[0], walker[1], 0, walker[0], walker[1], px(0.14, minDim));
      walkerGlow.addColorStop(0, rgba(stepGlow, Math.min(0.24, (0.08 + loopMass * 0.1) * entrance * boost)));
      walkerGlow.addColorStop(1, rgba(stepGlow, 0));
      ctx.fillStyle = walkerGlow;
      ctx.fillRect(walker[0] - minDim * 0.14, walker[1] - minDim * 0.14, minDim * 0.28, minDim * 0.28);

      // Tear handles / witness points.
      const leftHandle: [number, number] = [cx - ringR * (0.9 - reveal * 0.3), cy + minDim * 0.03];
      const rightHandle: [number, number] = [cx + ringR * (0.9 - reveal * 0.3), cy - minDim * 0.03];
      for (const [hx, hy] of [leftHandle, rightHandle]) {
        const halo = ctx.createRadialGradient(hx, hy, 0, hx, hy, px(0.12, minDim));
        halo.addColorStop(0, rgba(clarity, Math.min(0.18, (0.04 + loopMass * 0.05 + breathAmplitude * 0.04 * ms) * entrance * boost)));
        halo.addColorStop(1, rgba(clarity, 0));
        ctx.fillStyle = halo;
        ctx.fillRect(hx - minDim * 0.12, hy - minDim * 0.12, minDim * 0.24, minDim * 0.24);
        ctx.beginPath();
        ctx.arc(hx, hy, px(0.038 + breathAmplitude * 0.005 * ms, minDim), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(clarity, Math.min(0.22, (0.06 + loopMass * 0.06) * entrance * boost));
        ctx.lineWidth = px(0.0013, minDim);
        ctx.stroke();
      }

      // Active pulls.
      const pts = [...s.pointers.values()];
      if (pts.length >= 2) {
        for (const pt of pts.slice(0, 2)) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, px(0.048 + breathAmplitude * 0.005 * ms, minDim), 0, Math.PI * 2);
          ctx.strokeStyle = rgba(stepGlow, Math.min(0.18, (0.08 + reveal * 0.06) * entrance * boost));
          ctx.lineWidth = px(0.0012, minDim);
          ctx.stroke();
        }
        drawPolyline(ctx, [pts[0] as [number, number], pts[1] as [number, number]], stepGlow, Math.min(0.16, (0.06 + reveal * 0.06) * entrance * boost), px(0.0014, minDim));
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flashAlpha = (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.7) * entrance;
        const flash = ctx.createRadialGradient(cx, cy + minDim * 0.08, 0, cx, cy + minDim * 0.08, minDim * 0.42);
        flash.addColorStop(0, rgba(clarity, flashAlpha));
        flash.addColorStop(1, rgba(clarity, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.42, cy - minDim * 0.34, minDim * 0.84, minDim * 0.84);
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

    const updatePull = () => {
      const pts = [...stateRef.current.pointers.values()];
      if (pts.length < 2) return;
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      stateRef.current.pullProgress = clamp((d - PULL_MIN) / (PULL_MAX - PULL_MIN), 0, 1);
      stateRef.current.lastDistance = d;
    };

    const onDown = (e: PointerEvent) => {
      const p = getPoint(e);
      stateRef.current.pointers.set(e.pointerId, p);
      canvas.setPointerCapture(e.pointerId);
      if (stateRef.current.pointers.size === 2 && !stateRef.current.pinchActive) {
        stateRef.current.pinchActive = true;
        callbacksRef.current.onHaptic('hold_start');
      }
      updatePull();
    };

    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.pointers.has(e.pointerId)) return;
      stateRef.current.pointers.set(e.pointerId, getPoint(e));
      updatePull();
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
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }}
      />
    </div>
  );
}
