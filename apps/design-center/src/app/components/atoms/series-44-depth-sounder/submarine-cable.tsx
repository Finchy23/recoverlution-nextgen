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
const STEP_T = 0.52;
const COMPLETE_T = 0.965;

type Point = { x: number; y: number };

export default function SubmarineCableAtom({
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
    cable: 0,
    grounded: false,
    settle: 0,
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

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.grounded = true;

      if (s.grounded) s.settle = Math.min(1, s.settle + 0.025 * ms);
      const reveal = easeOutCubic(clamp(s.settle, 0, 1));
      const drift = 1 - reveal;
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
      const field = lerpColor(primary, accent, 0.16);
      const dense = lerpColor([4, 5, 10], primary, 0.08);
      const bedrock = lerpColor([28, 36, 46], primary, 0.22);
      const clarity = lerpColor(primary, [244, 247, 255], 0.92);
      const ember = lerpColor(accent, [255, 236, 210], 0.6);

      const stage = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.96);
      stage.addColorStop(0, rgba(field, Math.min(0.16, (0.04 + reveal * 0.05) * entrance * boost)));
      stage.addColorStop(0.55, rgba(field, Math.min(0.06, (0.015 + reveal * 0.03) * entrance * boost)));
      stage.addColorStop(1, rgba(dense, Math.min(0.94, (0.24 + drift * 0.18) * entrance * boost)));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const nodeX = cx;
      const nodeY = h * (0.34 + reveal * 0.22 + Math.sin(progress * Math.PI * 6) * 0.004 * drift);
      const cableBottomY = h * (0.92 - reveal * 0.1);
      const cableY = nodeY + (cableBottomY - nodeY) * s.cable;

      ctx.beginPath();
      ctx.moveTo(nodeX, nodeY);
      ctx.lineTo(nodeX, cableY);
      ctx.strokeStyle = rgba(ember, Math.min(0.3, (0.08 + s.cable * 0.16) * entrance * boost));
      ctx.lineWidth = px(0.008, minDim);
      ctx.stroke();

      const coilY = h * 0.84;
      ctx.beginPath();
      ctx.roundRect(cx - minDim * 0.085, coilY - minDim * 0.03, minDim * 0.17, minDim * 0.06, minDim * 0.02);
      ctx.fillStyle = rgba(bedrock, Math.min(0.72, (0.18 + 0.28 * (1 - s.cable)) * entrance * boost));
      ctx.fill();

      if (s.cable > 0.98) {
        ctx.beginPath();
        ctx.roundRect(cx - minDim * 0.18, h * 0.9, minDim * 0.36, minDim * 0.045, minDim * 0.02);
        ctx.fillStyle = rgba(bedrock, Math.min(0.88, (0.26 + reveal * 0.32) * entrance * boost));
        ctx.fill();
      }

      const nodeGlow = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, minDim * 0.18);
      nodeGlow.addColorStop(0, rgba(clarity, Math.min(0.24, (0.05 + reveal * 0.12 + s.revealFlash * 0.05) * entrance * boost)));
      nodeGlow.addColorStop(1, rgba(clarity, 0));
      ctx.fillStyle = nodeGlow;
      ctx.fillRect(nodeX - minDim * 0.18, nodeY - minDim * 0.18, minDim * 0.36, minDim * 0.36);

      ctx.beginPath();
      ctx.arc(nodeX, nodeY, px(0.03, minDim) * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(clarity, Math.min(0.98, (0.24 + reveal * 0.46) * entrance * boost));
      ctx.fill();

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, cableBottomY, 0, cx, cableBottomY, minDim * 0.46);
        flash.addColorStop(0, rgba(clarity, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.62) * entrance));
        flash.addColorStop(1, rgba(clarity, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.46, cableBottomY - minDim * 0.46, minDim * 0.92, minDim * 0.92);
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
      const point = getPoint(e);
      if (s.grounded) return;
      if (point.y > viewport.height * 0.78) {
        s.cable = clamp(s.cable + 0.14, 0, 1);
        callbacksRef.current.onHaptic('tap');
        if (s.cable >= 0.98) s.grounded = true;
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    return () => {
      window.cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
