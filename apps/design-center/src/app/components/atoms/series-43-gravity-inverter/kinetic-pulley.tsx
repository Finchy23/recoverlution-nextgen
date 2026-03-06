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
const STEP_T = 0.58;
const COMPLETE_T = 0.965;

type Point = { x: number; y: number };

export default function KineticPulleyAtom({
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
    path: [] as Point[],
    hookedPulley: false,
    hookedWeight: false,
    launch: 0,
    weightY: 0.12,
    weightV: 0.0028,
    thresholdFired: false,
    completionFired: false,
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

      if (!s.hookedWeight) {
        s.weightY = Math.min(0.82, s.weightY + s.weightV * ms);
      } else {
        s.launch = Math.min(1, s.launch + 0.02 * (p.reducedMotion ? 0.7 : 1));
      }
      if (p.phase === 'resolve' && !s.hookedWeight) {
        s.hookedPulley = true;
        s.hookedWeight = true;
      }

      const reveal = easeOutCubic(clamp(s.launch, 0, 1));
      const burden = 1 - reveal;
      const boost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));
      cb.onStateChange?.(reveal);

      if (s.hookedWeight && reveal >= STEP_T && !s.thresholdFired) {
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
      const field = lerpColor(primary, accent, 0.24);
      const threat = lerpColor([8, 8, 14], accent, 0.18);
      const dense = lerpColor([5, 6, 10], primary, 0.08);
      const clarity = lerpColor(primary, [244, 247, 255], 0.92);
      const ember = lerpColor(accent, [255, 236, 210], 0.58);

      const stage = ctx.createRadialGradient(cx, cy + minDim * 0.05, 0, cx, cy + minDim * 0.05, minDim * 0.88);
      stage.addColorStop(0, rgba(field, Math.min(0.16, (0.05 + burden * 0.08 + reveal * 0.04) * entrance * boost)));
      stage.addColorStop(0.62, rgba(field, Math.min(0.08, (0.02 + burden * 0.03) * entrance * boost)));
      stage.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const dread = ctx.createLinearGradient(0, 0, 0, h);
      dread.addColorStop(0, rgba(threat, Math.min(0.3, (0.08 + burden * 0.18) * entrance * boost)));
      dread.addColorStop(0.6, rgba(dense, Math.min(0.16, (0.05 + burden * 0.08) * entrance * boost)));
      dread.addColorStop(1, rgba(dense, 0));
      ctx.fillStyle = dread;
      ctx.fillRect(0, 0, w, h);

      const nodeX = cx;
      const nodeStartY = h * 0.84;
      const nodeY = nodeStartY - reveal * h * 0.56;
      const nodeR = px(0.026, minDim) * (1 + breathAmplitude * 0.02);
      const pulleyX = cx;
      const pulleyY = h * 0.16;
      const weightX = cx + minDim * 0.22;
      const weightY = h * s.weightY;
      const weightR = px(0.06, minDim);

      const pulleyGlow = ctx.createRadialGradient(pulleyX, pulleyY, 0, pulleyX, pulleyY, px(0.16, minDim));
      pulleyGlow.addColorStop(0, rgba(clarity, Math.min(0.18, (0.04 + Number(s.hookedPulley) * 0.08 + reveal * 0.06) * entrance * boost)));
      pulleyGlow.addColorStop(1, rgba(clarity, 0));
      ctx.fillStyle = pulleyGlow;
      ctx.fillRect(pulleyX - minDim * 0.16, pulleyY - minDim * 0.16, minDim * 0.32, minDim * 0.32);
      ctx.beginPath();
      ctx.arc(pulleyX, pulleyY, px(0.038, minDim), 0, Math.PI * 2);
      ctx.strokeStyle = rgba(clarity, Math.min(0.24, (0.08 + burden * 0.08) * entrance * boost));
      ctx.lineWidth = px(0.004, minDim);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(weightX, weightY, weightR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(threat, Math.min(0.84, (0.22 + burden * 0.44) * entrance * boost));
      ctx.fill();
      ctx.beginPath();
      ctx.arc(weightX, weightY, weightR * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = rgba(ember, Math.min(0.16, (0.04 + Number(s.hookedWeight) * 0.1) * entrance * boost));
      ctx.fill();

      if (s.path.length > 1) {
        ctx.beginPath();
        ctx.moveTo(s.path[0].x, s.path[0].y);
        for (let i = 1; i < s.path.length; i++) ctx.lineTo(s.path[i].x, s.path[i].y);
        ctx.strokeStyle = rgba(clarity, Math.min(0.26, (0.08 + Number(s.hookedPulley) * 0.08 + reveal * 0.08) * entrance * boost));
        ctx.lineWidth = px(0.005, minDim);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }

      if (s.hookedPulley) {
        ctx.beginPath();
        ctx.moveTo(nodeX, nodeY);
        ctx.lineTo(pulleyX, pulleyY);
        ctx.lineTo(weightX, weightY);
        ctx.strokeStyle = rgba(ember, Math.min(0.24, (0.08 + Number(s.hookedWeight) * 0.12 + reveal * 0.06) * entrance * boost));
        ctx.lineWidth = px(0.0036, minDim);
        ctx.stroke();
      }

      const nodeGlow = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, px(0.18, minDim));
      nodeGlow.addColorStop(0, rgba(clarity, Math.min(0.22, (0.06 + reveal * 0.12 + s.revealFlash * 0.04) * entrance * boost)));
      nodeGlow.addColorStop(1, rgba(clarity, 0));
      ctx.fillStyle = nodeGlow;
      ctx.fillRect(nodeX - minDim * 0.18, nodeY - minDim * 0.18, minDim * 0.36, minDim * 0.36);
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(clarity, Math.min(0.98, (0.24 + reveal * 0.5 + burden * 0.12) * entrance * boost));
      ctx.fill();

      if (s.hookedWeight) {
        const launchBeam = ctx.createLinearGradient(nodeX, nodeY, pulleyX, pulleyY);
        launchBeam.addColorStop(0, rgba(clarity, Math.min(0.24, (0.04 + reveal * 0.18) * entrance * boost)));
        launchBeam.addColorStop(1, rgba(ember, 0));
        ctx.strokeStyle = launchBeam;
        ctx.lineWidth = px(0.012, minDim);
        ctx.beginPath();
        ctx.moveTo(nodeX, nodeY);
        ctx.lineTo(pulleyX, pulleyY);
        ctx.stroke();
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, minDim * 0.46);
        flash.addColorStop(0, rgba(clarity, (s.revealFlash * 0.24 + Math.max(0, reveal - 0.9) * 0.64) * entrance));
        flash.addColorStop(1, rgba(clarity, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(nodeX - minDim * 0.46, nodeY - minDim * 0.46, minDim * 0.92, minDim * 0.92);
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
      const s = stateRef.current;
      const p = getPoint(e);
      const nodeX = viewport.width * 0.5;
      const nodeY = viewport.height * 0.84 - easeOutCubic(clamp(s.launch, 0, 1)) * viewport.height * 0.56;
      if (Math.hypot(p.x - nodeX, p.y - nodeY) > viewport.width * 0.12 || s.hookedWeight) return;
      s.drawing = true;
      s.path = [p];
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.drawing || s.hookedWeight) return;
      const p = getPoint(e);
      s.path.push(p);
      if (s.path.length > 40) s.path.shift();
      const pulleyX = viewport.width * 0.5;
      const pulleyY = viewport.height * 0.16;
      const weightX = viewport.width * 0.5 + Math.min(viewport.width, viewport.height) * 0.22;
      const weightY = viewport.height * s.weightY;
      if (!s.hookedPulley && Math.hypot(p.x - pulleyX, p.y - pulleyY) < viewport.width * 0.1) {
        s.hookedPulley = true;
        callbacksRef.current.onHaptic('drag_snap');
      } else if (s.hookedPulley && Math.hypot(p.x - weightX, p.y - weightY) < viewport.width * 0.12) {
        s.hookedWeight = true;
        s.launch = 0.08;
      }
    };

    const onUp = (e: PointerEvent) => {
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
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }}
      />
    </div>
  );
}
