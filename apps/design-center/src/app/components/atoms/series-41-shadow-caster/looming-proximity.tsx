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
const COMPLETE_T = 0.965;
const PINCH_MIN = 24;
const PINCH_MAX = 240;

export default function LoomingProximityAtom({
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
    depth: 0,
    pointers: new Map<number, { x: number; y: number }>(),
    pinchActive: false,
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

      if (p.phase === 'resolve' && !s.pinchActive) s.depth += (1 - s.depth) * 0.08;

      const reveal = easeOutCubic(clamp(s.depth, 0, 1));
      const suffocation = 1 - reveal;
      const stageBoost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.65 : 1));
      cb.onStateChange?.(reveal);

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.8;
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
      const darkMass = lerpColor([4, 5, 8], primary, 0.04);
      const edge = lerpColor(accent, [220, 232, 255], 0.28);
      const air = lerpColor(primary, [238, 244, 255], 0.84);

      const suffocationVeil = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.9);
      suffocationVeil.addColorStop(0, rgba(darkMass, Math.min(0.56, (0.2 + suffocation * 0.26) * entrance * stageBoost)));
      suffocationVeil.addColorStop(0.6, rgba(darkMass, Math.min(0.3, (0.12 + suffocation * 0.18) * entrance * stageBoost)));
      suffocationVeil.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = suffocationVeil;
      ctx.fillRect(0, 0, w, h);

      const lightR = px(0.36 + reveal * 0.14, minDim);
      const light = ctx.createRadialGradient(cx, cy * 0.98, 0, cx, cy * 0.98, lightR * 1.8);
      light.addColorStop(0, rgba(air, Math.min(0.16, (0.02 + reveal * 0.16 + s.revealFlash * 0.08) * entrance * stageBoost)));
      light.addColorStop(1, rgba(air, 0));
      ctx.fillStyle = light;
      ctx.fillRect(0, 0, w, h);

      const massR = px(0.42 - reveal * 0.28, minDim);
      const massY = mix(cy * 0.94, cy * 0.58, reveal);
      const massGlow = ctx.createRadialGradient(cx, massY, 0, cx, massY, massR * 1.8);
      massGlow.addColorStop(0, rgba(darkMass, Math.min(0.72, (0.28 + suffocation * 0.34) * entrance * stageBoost)));
      massGlow.addColorStop(1, rgba(darkMass, 0));
      ctx.fillStyle = massGlow;
      ctx.fillRect(cx - massR * 2, massY - massR * 2, massR * 4, massR * 4);

      ctx.beginPath();
      ctx.arc(cx, massY, massR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(darkMass, Math.min(0.96, (0.44 + suffocation * 0.42) * entrance * stageBoost));
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, massY, massR * 1.02, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(edge, Math.min(0.18, (0.06 + reveal * 0.08) * entrance * stageBoost));
      ctx.lineWidth = px(0.0013, minDim);
      ctx.stroke();

      const apertureW = px(0.12 + reveal * 0.44, minDim);
      const apertureH = px(0.012 + reveal * 0.028, minDim);
      ctx.beginPath();
      ctx.ellipse(cx, cy * 1.02, apertureW, apertureH, 0, 0, Math.PI * 2);
      ctx.fillStyle = rgba(air, Math.min(0.2, (0.04 + reveal * 0.12) * entrance * stageBoost));
      ctx.fill();

      if (s.pointers.size >= 2) {
        const pts = [...s.pointers.values()];
        for (const pt of pts) {
          const ringR = px(0.04 + breathAmplitude * 0.003 * ms, minDim);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(air, Math.min(0.18, (0.08 + reveal * 0.06) * entrance * stageBoost));
          ctx.lineWidth = px(0.0012, minDim);
          ctx.stroke();
        }
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flashAlpha = (s.revealFlash * 0.24 + Math.max(0, reveal - 0.9) * 0.62) * entrance;
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.4);
        flash.addColorStop(0, rgba(air, flashAlpha));
        flash.addColorStop(1, rgba(air, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.4, cy - minDim * 0.4, minDim * 0.8, minDim * 0.8);
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

    const updateDepthFromPinch = () => {
      const pts = [...stateRef.current.pointers.values()];
      if (pts.length < 2) return;
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      stateRef.current.depth = clamp((d - PINCH_MIN) / (PINCH_MAX - PINCH_MIN), 0, 1);
    };

    const onDown = (e: PointerEvent) => {
      const p = getPoint(e);
      stateRef.current.pointers.set(e.pointerId, p);
      canvas.setPointerCapture(e.pointerId);
      if (stateRef.current.pointers.size === 2 && !stateRef.current.pinchActive) {
        stateRef.current.pinchActive = true;
        callbacksRef.current.onHaptic('hold_start');
      }
      updateDepthFromPinch();
    };

    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.pointers.has(e.pointerId)) return;
      stateRef.current.pointers.set(e.pointerId, getPoint(e));
      updateDepthFromPinch();
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
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'zoom-in' }}
      />
    </div>
  );
}
