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
  roundedRect,
} from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.5;
const COMPLETE_T = 0.965;

export default function RedactionBurnAtom({
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
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    burn: 0,
    holding: false,
    thresholdFired: false,
    completionFired: false,
    revealFlash: 0,
  });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);
  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (s.holding || p.phase === 'resolve') s.burn = Math.min(1, s.burn + 0.02 * ms);
      else s.burn = Math.max(0, s.burn - 0.01 * ms);
      s.revealFlash = Math.max(0, s.revealFlash - 0.02 * (p.reducedMotion ? 0.7 : 1));

      const reveal = easeOutCubic(clamp(s.burn, 0, 1));
      const boost = p.composed ? 1.18 : 1;
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.7;
        cb.onHaptic('hold_threshold');
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
      const ember = lerpColor(accent, [255, 168, 110], 0.6);
      const truth = lerpColor(primary, [243, 247, 255], 0.94);

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.82);
      bg.addColorStop(0, rgba(field, Math.min(0.16, (0.04 + reveal * 0.06) * entrance * boost)));
      bg.addColorStop(1, rgba(dense, Math.min(0.96, (0.22 + (1 - reveal) * 0.16) * entrance * boost)));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const lineY = cy;
      ctx.beginPath();
      ctx.moveTo(w * 0.22, lineY);
      ctx.lineTo(w * (0.22 + reveal * 0.56), lineY);
      ctx.strokeStyle = rgba(truth, Math.min(0.92, (0.1 + reveal * 0.76) * entrance * boost));
      ctx.lineWidth = px(0.018, minDim);
      ctx.stroke();

      const bars = [
        { x: w * 0.24, y: cy - minDim * 0.11, w: w * 0.52, h: minDim * 0.07 },
        { x: w * 0.3, y: cy - minDim * 0.015, w: w * 0.4, h: minDim * 0.07 },
        { x: w * 0.2, y: cy + minDim * 0.08, w: w * 0.58, h: minDim * 0.07 },
      ];

      for (const bar of bars) {
        const remaining = 1 - reveal;
        const currentW = bar.w * remaining;
        if (currentW > 1) {
          roundedRect(ctx, bar.x, bar.y, currentW, bar.h, minDim * 0.012);
          ctx.fillStyle = rgba([4, 4, 7], Math.min(0.96, (0.32 + remaining * 0.54) * entrance * boost));
          ctx.fill();

          const heat = ctx.createLinearGradient(bar.x, 0, bar.x + bar.w, 0);
          heat.addColorStop(0, rgba(ember, 0));
          heat.addColorStop(reveal, rgba(ember, Math.min(0.9, (0.16 + reveal * 0.52 + s.revealFlash * 0.1) * entrance)));
          heat.addColorStop(Math.min(1, reveal + 0.08), rgba(ember, 0));
          ctx.fillStyle = heat;
          ctx.fillRect(bar.x, bar.y, bar.w, bar.h);
        }
      }

      if (s.holding || reveal > 0.15) {
        ctx.beginPath();
        ctx.arc(cx, cy, minDim * (0.08 + reveal * 0.16), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(ember, Math.min(0.4, (0.08 + reveal * 0.22) * entrance * boost));
        ctx.lineWidth = px(0.004, minDim);
        ctx.stroke();
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onDown = (e: PointerEvent) => {
      stateRef.current.holding = true;
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('hold_start');
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.holding = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    raf = window.requestAnimationFrame(render);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    return () => {
      window.cancelAnimationFrame(raf);
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
