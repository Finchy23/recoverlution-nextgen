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
const LOCK_STEP = 0.34;
const COMPLETE_T = 0.965;

type Point = { x: number; y: number };

type Ping = { x: number; y: number; age: number; strength: number };

export default function EcholocationPingAtom({
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
    pings: [] as Ping[],
    lockProgress: 0,
    rootReveal: 0,
    dragging: false,
    completionFired: false,
    thresholdFired: false,
    revealFlash: 0,
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

    const root = () => ({ x: viewport.width * 0.66, y: viewport.height * 0.38 });
    const center = () => ({ x: viewport.width * 0.5, y: viewport.height * 0.5 });

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.lockProgress = Math.max(s.lockProgress, 1);

      s.pings = s.pings
        .map((ring) => ({ ...ring, age: ring.age + 0.024 * (p.reducedMotion ? 0.7 : 1) }))
        .filter((ring) => ring.age < 1.12);

      if (!s.dragging) {
        s.rootReveal += (s.lockProgress - s.rootReveal) * 0.12 * ms;
      }

      const reveal = easeOutCubic(clamp(s.rootReveal, 0, 1));
      const hidden = 1 - reveal;
      const boost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));
      cb.onStateChange?.(reveal);

      if (reveal >= LOCK_STEP && !s.thresholdFired) {
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

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const field = lerpColor(primary, accent, 0.18);
      const dense = lerpColor([3, 5, 10], primary, 0.08);
      const echo = lerpColor(accent, [255, 237, 212], 0.58);
      const clarity = lerpColor(primary, [244, 247, 255], 0.92);

      const voidGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.96);
      voidGlow.addColorStop(0, rgba(field, Math.min(0.14, (0.03 + reveal * 0.06) * entrance * boost)));
      voidGlow.addColorStop(0.55, rgba(field, Math.min(0.06, (0.01 + reveal * 0.03) * entrance * boost)));
      voidGlow.addColorStop(1, rgba(dense, Math.min(0.9, (0.22 + hidden * 0.18) * entrance * boost)));
      ctx.fillStyle = voidGlow;
      ctx.fillRect(0, 0, w, h);

      const r = root();
      const c = center();
      const rootX = r.x + (c.x - r.x) * reveal;
      const rootY = r.y + (c.y - r.y) * reveal;

      for (const ring of s.pings) {
        const radius = minDim * (0.05 + ring.age * 0.82);
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(echo, Math.min(0.34, (0.22 * (1 - ring.age)) * entrance * ring.strength * boost));
        ctx.lineWidth = px(0.004, minDim);
        ctx.stroke();

        const distanceToRoot = Math.hypot(ring.x - rootX, ring.y - rootY);
        if (Math.abs(radius - distanceToRoot) < minDim * 0.03) {
          ctx.beginPath();
          ctx.arc(rootX, rootY, px(0.012, minDim) + radius * 0.03, 0, Math.PI * 2);
          ctx.fillStyle = rgba(clarity, Math.min(0.28, (0.08 + (1 - Math.abs(radius - distanceToRoot) / (minDim * 0.03)) * 0.2) * entrance * boost));
          ctx.fill();
        }
      }

      const traceGlow = ctx.createRadialGradient(rootX, rootY, 0, rootX, rootY, minDim * 0.18);
      traceGlow.addColorStop(0, rgba(clarity, Math.min(0.26, (0.04 + reveal * 0.16 + s.revealFlash * 0.05) * entrance * boost)));
      traceGlow.addColorStop(1, rgba(clarity, 0));
      ctx.fillStyle = traceGlow;
      ctx.fillRect(rootX - minDim * 0.18, rootY - minDim * 0.18, minDim * 0.36, minDim * 0.36);

      ctx.beginPath();
      ctx.arc(rootX, rootY, px(0.026, minDim) * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(clarity, Math.min(0.96, (0.12 + reveal * 0.7) * entrance * boost));
      ctx.fill();

      if (reveal > 0.18) {
        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.lineTo(c.x, c.y);
        ctx.strokeStyle = rgba(clarity, Math.min(0.18, (0.04 + reveal * 0.12) * entrance * boost));
        ctx.lineWidth = px(0.003, minDim);
        ctx.stroke();
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(rootX, rootY, 0, rootX, rootY, minDim * 0.48);
        flash.addColorStop(0, rgba(clarity, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.62) * entrance));
        flash.addColorStop(1, rgba(clarity, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(rootX - minDim * 0.48, rootY - minDim * 0.48, minDim * 0.96, minDim * 0.96);
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
      const rootPos = root();
      const centerPos = center();
      const revealedRoot = {
        x: rootPos.x + (centerPos.x - rootPos.x) * s.rootReveal,
        y: rootPos.y + (centerPos.y - rootPos.y) * s.rootReveal,
      };

      if (s.rootReveal > 0.34 && Math.hypot(point.x - revealedRoot.x, point.y - revealedRoot.y) < Math.min(viewport.width, viewport.height) * 0.1) {
        s.dragging = true;
        canvas.setPointerCapture(e.pointerId);
        return;
      }

      const proximity = 1 - clamp(Math.hypot(point.x - rootPos.x, point.y - rootPos.y) / (Math.min(viewport.width, viewport.height) * 0.7), 0, 1);
      s.pings.push({ x: point.x, y: point.y, age: 0, strength: 0.48 + proximity * 0.52 });
      s.lockProgress = clamp(s.lockProgress + (0.14 + proximity * 0.22), 0, 1);
      callbacksRef.current.onHaptic('tap');
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const point = getPoint(e);
      const centerPos = center();
      const distanceToCenter = Math.hypot(point.x - centerPos.x, point.y - centerPos.y);
      s.rootReveal = clamp(1 - distanceToCenter / (Math.min(viewport.width, viewport.height) * 0.42), s.rootReveal, 1);
    };

    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.dragging) {
        s.rootReveal = Math.max(s.rootReveal, 1);
        s.dragging = false;
        canvas.releasePointerCapture(e.pointerId);
      }
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
