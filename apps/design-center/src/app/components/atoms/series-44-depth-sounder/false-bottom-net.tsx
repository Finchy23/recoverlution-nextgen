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

export default function FalseBottomNetAtom({
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
    progress: 0,
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
      s.progress = Math.min(1, s.progress + 0.012 * ms);
      if (p.phase === 'resolve') s.progress = 1;

      const reveal = easeOutCubic(clamp(s.progress, 0, 1));
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
      const field = lerpColor(primary, accent, 0.15);
      const dense = lerpColor([4, 5, 10], primary, 0.08);
      const safety = lerpColor(primary, [244, 247, 255], 0.88);
      const ember = lerpColor(accent, [255, 236, 210], 0.6);

      const stage = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.94);
      stage.addColorStop(0, rgba(field, Math.min(0.14, (0.04 + reveal * 0.05) * entrance * boost)));
      stage.addColorStop(1, rgba(dense, Math.min(0.94, (0.24 + (1 - reveal) * 0.18) * entrance * boost)));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const floorY = h * 0.68;
      const collapse = clamp((reveal - 0.18) / 0.3, 0, 1);
      const drop = clamp((reveal - 0.38) / 0.28, 0, 1);
      const catchT = clamp((reveal - 0.56) / 0.3, 0, 1);
      const nodeX = cx;
      const nodeY = floorY + drop * minDim * 0.16 - Math.sin(catchT * Math.PI) * minDim * 0.08 * (1 - catchT);

      ctx.beginPath();
      ctx.moveTo(w * 0.18, floorY);
      ctx.lineTo(w * (0.5 - 0.12 * collapse), floorY);
      ctx.moveTo(w * (0.5 + 0.12 * collapse), floorY);
      ctx.lineTo(w * 0.82, floorY);
      ctx.strokeStyle = rgba(ember, Math.min(0.24, (0.08 + (1 - drop) * 0.1) * entrance * boost));
      ctx.lineWidth = px(0.01, minDim);
      ctx.stroke();

      if (catchT > 0.02) {
        ctx.beginPath();
        const left = w * 0.34;
        const right = w * 0.66;
        const netY = floorY + minDim * 0.18;
        ctx.moveTo(left, netY);
        for (let i = 1; i <= 12; i++) {
          const t = i / 12;
          const x = left + (right - left) * t;
          const y = netY + Math.sin(t * Math.PI) * minDim * 0.08 * (1 - catchT * 0.25);
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba(safety, Math.min(0.34, (0.08 + catchT * 0.2) * entrance * boost));
        ctx.lineWidth = px(0.004, minDim);
        ctx.stroke();
      }

      const glow = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, minDim * 0.18);
      glow.addColorStop(0, rgba(safety, Math.min(0.24, (0.05 + reveal * 0.12 + s.revealFlash * 0.04) * entrance * boost)));
      glow.addColorStop(1, rgba(safety, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(nodeX - minDim * 0.18, nodeY - minDim * 0.18, minDim * 0.36, minDim * 0.36);
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, px(0.03, minDim) * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(safety, Math.min(0.98, (0.24 + reveal * 0.46) * entrance * boost));
      ctx.fill();

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, floorY + minDim * 0.14, 0, cx, floorY + minDim * 0.14, minDim * 0.46);
        flash.addColorStop(0, rgba(safety, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.62) * entrance));
        flash.addColorStop(1, rgba(safety, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.46, floorY - minDim * 0.26, minDim * 0.92, minDim * 0.92);
      }

      ctx.restore();
      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(animId);
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', pointerEvents: 'none' }} />
    </div>
  );
}
