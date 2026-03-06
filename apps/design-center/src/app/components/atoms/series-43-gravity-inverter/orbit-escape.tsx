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
const ESCAPE_GATE_ANGLE = -Math.PI * 0.46;
const ESCAPE_GATE_WIDTH = 0.24;

type Point = { x: number; y: number };

export default function OrbitEscapeAtom({
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
    orbitAngle: -Math.PI * 0.2,
    orbitRadius: 0.34,
    grabbed: false,
    startPoint: null as Point | null,
    launched: false,
    launch: 0,
    launchAngle: 0,
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

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (!s.launched) {
        s.orbitAngle += 0.028 * ms;
        s.orbitRadius = Math.max(0.12, s.orbitRadius - 0.00028 * ms);
      } else {
        s.launch = Math.min(1, s.launch + 0.02 * (p.reducedMotion ? 0.7 : 1));
      }
      if (p.phase === 'resolve' && !s.launched) {
        s.launched = true;
        s.launchAngle = s.orbitAngle + Math.PI * 0.5;
      }

      const reveal = easeOutCubic(clamp(s.launch, 0, 1));
      const trap = 1 - reveal;
      const boost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));
      cb.onStateChange?.(reveal);

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.76;
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
      const field = lerpColor(primary, accent, 0.22);
      const threat = lerpColor([8, 8, 14], accent, 0.18);
      const dense = lerpColor([4, 5, 10], primary, 0.08);
      const clarity = lerpColor(primary, [244, 247, 255], 0.92);
      const ember = lerpColor(accent, [255, 236, 210], 0.62);

      const stage = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.92);
      stage.addColorStop(0, rgba(field, Math.min(0.16, (0.04 + trap * 0.08 + reveal * 0.04) * entrance * boost)));
      stage.addColorStop(0.62, rgba(field, Math.min(0.08, (0.02 + trap * 0.03) * entrance * boost)));
      stage.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const eventHorizon = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.42);
      eventHorizon.addColorStop(0, rgba([0, 0, 0], 1));
      eventHorizon.addColorStop(0.36, rgba(threat, Math.min(0.42, (0.1 + trap * 0.18) * entrance * boost)));
      eventHorizon.addColorStop(1, rgba(dense, 0));
      ctx.fillStyle = eventHorizon;
      ctx.fillRect(cx - minDim * 0.42, cy - minDim * 0.42, minDim * 0.84, minDim * 0.84);

      for (let i = 0; i < 4; i++) {
        const r = minDim * (0.12 + i * 0.055) * trap;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(r, 1), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(ember, Math.min(0.14, (0.04 + trap * 0.1) * entrance * boost * (1 - i * 0.16)));
        ctx.lineWidth = px(0.003, minDim);
        ctx.stroke();
      }

      const gateProximity = 1 - clamp(Math.abs(normalizeAngle(s.orbitAngle - ESCAPE_GATE_ANGLE)) / 0.9, 0, 1);
      const windowStart = ESCAPE_GATE_ANGLE - ESCAPE_GATE_WIDTH;
      const windowEnd = ESCAPE_GATE_ANGLE + ESCAPE_GATE_WIDTH;
      ctx.beginPath();
      ctx.arc(cx, cy, minDim * s.orbitRadius, windowStart, windowEnd);
      ctx.strokeStyle = rgba(clarity, Math.min(0.34, (0.05 + trap * 0.08 + gateProximity * 0.16) * entrance * boost));
      ctx.lineWidth = px(0.01, minDim);
      ctx.stroke();

      const orbitX = s.launched ? cx + Math.cos(s.launchAngle) * (minDim * (0.22 + reveal * 0.62)) : cx + Math.cos(s.orbitAngle) * (minDim * s.orbitRadius);
      const orbitY = s.launched ? cy + Math.sin(s.launchAngle) * (minDim * (0.22 + reveal * 0.62)) : cy + Math.sin(s.orbitAngle) * (minDim * s.orbitRadius);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(orbitX, orbitY);
      ctx.strokeStyle = rgba(ember, Math.min(0.18, (0.06 + trap * 0.08) * entrance * boost));
      ctx.lineWidth = px(0.002, minDim);
      ctx.stroke();

      const nodeGlow = ctx.createRadialGradient(orbitX, orbitY, 0, orbitX, orbitY, px(0.18, minDim));
      nodeGlow.addColorStop(0, rgba(clarity, Math.min(0.24, (0.04 + reveal * 0.18 + s.revealFlash * 0.05) * entrance * boost)));
      nodeGlow.addColorStop(1, rgba(clarity, 0));
      ctx.fillStyle = nodeGlow;
      ctx.fillRect(orbitX - minDim * 0.18, orbitY - minDim * 0.18, minDim * 0.36, minDim * 0.36);
      ctx.beginPath();
      ctx.arc(orbitX, orbitY, px(0.028, minDim) * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(clarity, Math.min(0.98, (0.24 + reveal * 0.48 + trap * 0.08) * entrance * boost));
      ctx.fill();

      if (s.launched) {
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(s.launchAngle) * minDim * 0.12, cy + Math.sin(s.launchAngle) * minDim * 0.12);
        ctx.lineTo(orbitX, orbitY);
        ctx.strokeStyle = rgba(clarity, Math.min(0.24, (0.04 + reveal * 0.18) * entrance * boost));
        ctx.lineWidth = px(0.008, minDim);
        ctx.stroke();
      }

      const gateRadius = minDim * (s.orbitRadius + 0.075);
      const gateX = cx + Math.cos(ESCAPE_GATE_ANGLE) * gateRadius;
      const gateY = cy + Math.sin(ESCAPE_GATE_ANGLE) * gateRadius;
      ctx.beginPath();
      ctx.arc(gateX, gateY, px(0.012, minDim) * (1 + gateProximity * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = rgba(ember, Math.min(0.72, (0.14 + gateProximity * 0.44) * entrance * boost));
      ctx.fill();

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(orbitX, orbitY, 0, orbitX, orbitY, minDim * 0.48);
        flash.addColorStop(0, rgba(clarity, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.64) * entrance));
        flash.addColorStop(1, rgba(clarity, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(orbitX - minDim * 0.48, orbitY - minDim * 0.48, minDim * 0.96, minDim * 0.96);
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

    const normalizeAngle = (a: number) => {
      let v = a;
      while (v > Math.PI) v -= Math.PI * 2;
      while (v < -Math.PI) v += Math.PI * 2;
      return v;
    };

    const onDown = (e: PointerEvent) => {
      const p = getPoint(e);
      const s = stateRef.current;
      const cx = viewport.width * 0.5;
      const cy = viewport.height * 0.5;
      const orbitX = cx + Math.cos(s.orbitAngle) * (Math.min(viewport.width, viewport.height) * s.orbitRadius);
      const orbitY = cy + Math.sin(s.orbitAngle) * (Math.min(viewport.width, viewport.height) * s.orbitRadius);
      if (Math.hypot(p.x - orbitX, p.y - orbitY) < viewport.width * 0.1 && !s.launched) {
        s.grabbed = true;
        s.startPoint = p;
        canvas.setPointerCapture(e.pointerId);
      }
    };

    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.grabbed || !s.startPoint || s.launched) {
        s.grabbed = false;
        s.startPoint = null;
        canvas.releasePointerCapture(e.pointerId);
        return;
      }
      const end = getPoint(e);
      const swipeAngle = Math.atan2(end.y - s.startPoint.y, end.x - s.startPoint.x);
      const tangentAngle = s.orbitAngle + Math.PI * 0.5;
      const angleError = Math.abs(normalizeAngle(swipeAngle - tangentAngle));
      const gateError = Math.abs(normalizeAngle(s.orbitAngle - ESCAPE_GATE_ANGLE));
      if (angleError < 0.45 && gateError < ESCAPE_GATE_WIDTH) {
        s.launched = true;
        s.launchAngle = tangentAngle;
      } else if (s.errorCooldown === 0) {
        s.errorCooldown = 20;
        callbacksRef.current.onHaptic('error_boundary');
      }
      s.grabbed = false;
      s.startPoint = null;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    return () => {
      window.cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
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
