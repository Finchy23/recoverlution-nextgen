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
const HIT_R = 0.11;
const TAPS_REQUIRED = 7;

export default function LuminousCoreAtom({
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
    taps: 0,
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

      if (phase === 'resolve' && s.taps < TAPS_REQUIRED) s.taps = Math.min(TAPS_REQUIRED, s.taps + 1);

      const reveal = easeOutCubic(clamp(s.taps / TAPS_REQUIRED, 0, 1));
      const darkness = 1 - reveal;
      const stageBoost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.65 : 1));
      cb.onStateChange?.(reveal);

      if (reveal >= 0.56 && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.8;
        cb.onHaptic('step_advance');
      }
      if (reveal >= 0.999 && !s.completionFired) {
        s.completionFired = true;
        s.revealFlash = 1;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const field = lerpColor(primary, accent, 0.2);
      const inner = lerpColor(accent, [255, 220, 176], 0.5);
      const outer = lerpColor(primary, [244, 247, 255], 0.9);
      const dark = lerpColor([2, 3, 6], primary, 0.02);

      ctx.fillStyle = rgba(dark, Math.min(0.82, (0.26 + darkness * 0.5) * entrance * stageBoost));
      ctx.fillRect(0, 0, w, h);

      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * (0.1 + reveal * 0.66));
      halo.addColorStop(0, rgba(outer, Math.min(0.22, (0.02 + reveal * 0.2 + s.revealFlash * 0.08) * entrance * stageBoost)));
      halo.addColorStop(0.52, rgba(inner, Math.min(0.16, (0.02 + reveal * 0.12) * entrance * stageBoost)));
      halo.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);

      const nodeR = px(0.046 + reveal * 0.034 + breathAmplitude * 0.004 * ms, minDim);
      const ringCount = 3;
      for (let i = 0; i < ringCount; i++) {
        const t = i / (ringCount - 1 || 1);
        const ringR = nodeR * (1.4 + t * (2.4 + reveal * 2.8));
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(outer, Math.min(0.18, (0.02 + reveal * 0.08) * entrance * stageBoost * (0.8 - t * 0.22)));
        ctx.lineWidth = px(0.0011, minDim);
        ctx.stroke();
      }

      const nodeGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, nodeR * 4.2);
      nodeGlow.addColorStop(0, rgba(inner, Math.min(0.46, (0.08 + reveal * 0.28 + s.revealFlash * 0.12) * entrance * stageBoost)));
      nodeGlow.addColorStop(0.55, rgba(outer, Math.min(0.18, (0.04 + reveal * 0.12) * entrance * stageBoost)));
      nodeGlow.addColorStop(1, rgba(outer, 0));
      ctx.fillStyle = nodeGlow;
      ctx.fillRect(cx - nodeR * 4.4, cy - nodeR * 4.4, nodeR * 8.8, nodeR * 8.8);

      ctx.beginPath();
      ctx.arc(cx, cy, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(outer, Math.min(0.98, (0.22 + reveal * 0.74) * entrance * stageBoost));
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, nodeR * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = rgba([255, 250, 240], Math.min(1, (0.52 + reveal * 0.34) * entrance * stageBoost));
      ctx.fill();

      const shadowR = px(0.34 - reveal * 0.28, minDim);
      if (shadowR > px(0.03, minDim)) {
        ctx.beginPath();
        ctx.arc(cx, cy + px(0.016, minDim), shadowR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(dark, Math.min(0.34, (0.12 + darkness * 0.18) * entrance * stageBoost));
        ctx.lineWidth = px(0.02 - reveal * 0.014, minDim);
        ctx.stroke();
      }

      if (s.taps > 0) {
        const tickCount = TAPS_REQUIRED;
        const arcR = nodeR * 2.2;
        for (let i = 0; i < tickCount; i++) {
          const a = -Math.PI / 2 + (i / tickCount) * Math.PI * 2;
          const ix = cx + Math.cos(a) * arcR;
          const iy = cy + Math.sin(a) * arcR;
          ctx.beginPath();
          ctx.arc(ix, iy, px(0.006, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(outer, i < s.taps ? Math.min(0.8, (0.28 + reveal * 0.3) * entrance * stageBoost) : 0.08 * entrance);
          ctx.fill();
        }
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flashAlpha = (s.revealFlash * 0.24 + Math.max(0, reveal - 0.9) * 0.62) * entrance;
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.44);
        flash.addColorStop(0, rgba(outer, flashAlpha));
        flash.addColorStop(1, rgba(outer, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.44, cy - minDim * 0.44, minDim * 0.88, minDim * 0.88);
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
      const hit = Math.min(viewport.width, viewport.height) * HIT_R;
      if (Math.hypot(p.x - viewport.width / 2, p.y - viewport.height / 2) > hit) return;
      stateRef.current.taps = Math.min(TAPS_REQUIRED, stateRef.current.taps + 1);
      stateRef.current.revealFlash = 0.5;
      callbacksRef.current.onHaptic('tap');
    };

    canvas.addEventListener('pointerdown', onDown);
    return () => {
      window.cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }}
      />
    </div>
  );
}
