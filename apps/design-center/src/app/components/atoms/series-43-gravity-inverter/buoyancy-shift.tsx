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
const STEP_T = 0.54;
const COMPLETE_T = 0.965;
const NODE_R = 0.024;

export default function BuoyancyShiftAtom({
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
    density: 0,
    draggingSlider: false,
    sliderCommit: false,
    thresholdFired: false,
    completionFired: false,
    revealFlash: 0,
    draggingNode: false,
    nodeErrorSent: false,
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
      if (p.phase === 'resolve' && !s.draggingSlider) s.density += (1 - s.density) * 0.08;

      const reveal = easeOutCubic(clamp(s.density, 0, 1));
      const sink = 1 - reveal;
      const boost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));
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
      const field = lerpColor(primary, accent, 0.2);
      const fluidDark = lerpColor([8, 12, 22], accent, 0.1);
      const fluidDense = lerpColor(primary, accent, 0.36);
      const surfaceLight = lerpColor(primary, [244, 248, 255], 0.88);
      const ember = lerpColor(accent, [255, 238, 214], 0.56);
      const threat = lerpColor([8, 9, 16], accent, 0.18);

      const surfaceY = h * 0.22;
      const fluidTop = h * 0.32;
      const nodeY = h * (0.82 - reveal * 0.5);
      const nodeX = cx;
      const nodeR = px(NODE_R, minDim) * (1 + breathAmplitude * 0.02);

      const stage = ctx.createRadialGradient(cx, cy + minDim * 0.1, 0, cx, cy + minDim * 0.1, minDim * 0.84);
      stage.addColorStop(0, rgba(field, Math.min(0.16, (0.04 + sink * 0.08 + reveal * 0.04) * entrance * boost)));
      stage.addColorStop(0.62, rgba(field, Math.min(0.08, (0.02 + sink * 0.03) * entrance * boost)));
      stage.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const surfaceGlow = ctx.createLinearGradient(0, 0, 0, fluidTop);
      surfaceGlow.addColorStop(0, rgba(surfaceLight, Math.min(0.24, (0.05 + reveal * 0.16) * entrance * boost)));
      surfaceGlow.addColorStop(1, rgba(surfaceLight, 0));
      ctx.fillStyle = surfaceGlow;
      ctx.fillRect(0, 0, w, fluidTop + minDim * 0.05);

      const fluid = ctx.createLinearGradient(0, fluidTop, 0, h);
      fluid.addColorStop(0, rgba(fluidDense, Math.min(0.22, (0.04 + reveal * 0.18) * entrance * boost)));
      fluid.addColorStop(1, rgba(fluidDark, Math.min(0.5, (0.16 + sink * 0.22 + reveal * 0.12) * entrance * boost)));
      ctx.fillStyle = fluid;
      ctx.fillRect(0, fluidTop, w, h - fluidTop);

      const pressure = ctx.createRadialGradient(cx, h * 0.86, 0, cx, h * 0.86, minDim * 0.72);
      pressure.addColorStop(0, rgba(threat, Math.min(0.32, (0.1 + sink * 0.18) * entrance * boost)));
      pressure.addColorStop(0.66, rgba(fluidDark, Math.min(0.18, (0.05 + sink * 0.08) * entrance * boost)));
      pressure.addColorStop(1, rgba(fluidDark, 0));
      ctx.fillStyle = pressure;
      ctx.fillRect(0, fluidTop, w, h - fluidTop);

      const rippleW = minDim * (0.2 + reveal * 0.12);
      ctx.beginPath();
      ctx.ellipse(nodeX, nodeY + nodeR * 1.25, rippleW * 0.5, minDim * 0.024, 0, 0, Math.PI * 2);
      ctx.fillStyle = rgba(fluidDark, Math.min(0.26, (0.08 + sink * 0.1) * entrance * boost));
      ctx.fill();

      const nodeGlow = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, px(0.16, minDim));
      nodeGlow.addColorStop(0, rgba(ember, Math.min(0.22, (0.06 + reveal * 0.14 + s.revealFlash * 0.05) * entrance * boost)));
      nodeGlow.addColorStop(1, rgba(ember, 0));
      ctx.fillStyle = nodeGlow;
      ctx.fillRect(nodeX - minDim * 0.16, nodeY - minDim * 0.16, minDim * 0.32, minDim * 0.32);
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(surfaceLight, Math.min(0.98, (0.28 + reveal * 0.46 + sink * 0.14) * entrance * boost));
      ctx.fill();

      for (let i = 0; i < 6; i++) {
        const t = i / 5;
        const bubbleX = nodeX + Math.sin(s.frameCount * 0.025 * ms + i * 1.4) * minDim * (0.01 + t * 0.012);
        const bubbleY = nodeY + nodeR * 1.2 + t * minDim * 0.08 - reveal * t * minDim * 0.08;
        const bubbleR = minDim * (0.004 + t * 0.003);
        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, bubbleR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(surfaceLight, Math.min(0.16, (0.03 + reveal * 0.1) * entrance * boost));
        ctx.lineWidth = px(0.0014, minDim);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.moveTo(w * 0.16, surfaceY);
      ctx.quadraticCurveTo(cx, surfaceY - minDim * 0.024 * reveal, w * 0.84, surfaceY);
      ctx.strokeStyle = rgba(surfaceLight, Math.min(0.22, (0.04 + reveal * 0.14) * entrance * boost));
      ctx.lineWidth = px(0.003, minDim);
      ctx.stroke();

      const trackY = h * 0.9;
      const trackW = w * 0.44;
      const trackX = cx - trackW * 0.5;
      const knobX = trackX + trackW * reveal;
      ctx.beginPath();
      ctx.moveTo(trackX, trackY);
      ctx.lineTo(trackX + trackW, trackY);
      ctx.strokeStyle = rgba(primary, Math.min(0.2, (0.06 + entrance * 0.1) * boost));
      ctx.lineWidth = px(0.008, minDim);
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(trackX, trackY);
      ctx.lineTo(knobX, trackY);
      ctx.strokeStyle = rgba(surfaceLight, Math.min(0.32, (0.08 + reveal * 0.18) * entrance * boost));
      ctx.lineWidth = px(0.008, minDim);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(knobX, trackY, px(0.022, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(surfaceLight, Math.min(0.96, (0.22 + reveal * 0.52) * entrance * boost));
      ctx.fill();

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, surfaceY, 0, cx, surfaceY, minDim * 0.48);
        flash.addColorStop(0, rgba(surfaceLight, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.62) * entrance));
        flash.addColorStop(1, rgba(surfaceLight, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.5, surfaceY - minDim * 0.22, minDim, minDim * 0.64);
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
      const s = stateRef.current;
      const trackY = viewport.height * 0.9;
      const trackW = viewport.width * 0.44;
      const trackX = viewport.width * 0.5 - trackW * 0.5;
      const knobX = trackX + trackW * s.density;
      const nodeY = viewport.height * (0.82 - easeOutCubic(clamp(s.density, 0, 1)) * 0.5);
      if (Math.hypot(p.x - knobX, p.y - trackY) < viewport.width * 0.08) {
        s.draggingSlider = true;
        if (!s.sliderCommit) {
          s.sliderCommit = true;
          callbacksRef.current.onHaptic('drag_snap');
        }
        canvas.setPointerCapture(e.pointerId);
        return;
      }
      if (Math.hypot(p.x - viewport.width * 0.5, p.y - nodeY) < viewport.width * 0.12) {
        s.draggingNode = true;
        s.nodeErrorSent = false;
        canvas.setPointerCapture(e.pointerId);
      }
    };

    const onMove = (e: PointerEvent) => {
      const p = getPoint(e);
      const s = stateRef.current;
      if (s.draggingSlider) {
        const trackW = viewport.width * 0.44;
        const trackX = viewport.width * 0.5 - trackW * 0.5;
        s.density = clamp((p.x - trackX) / trackW, 0, 1);
        return;
      }
      if (s.draggingNode && p.y < viewport.height * 0.62 && s.density < 0.46 && !s.nodeErrorSent) {
        s.nodeErrorSent = true;
        callbacksRef.current.onHaptic('error_boundary');
      }
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.draggingSlider = false;
      stateRef.current.draggingNode = false;
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
