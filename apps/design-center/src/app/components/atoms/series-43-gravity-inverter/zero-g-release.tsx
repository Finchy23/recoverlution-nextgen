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
const STEP_T = 0.54;
const COMPLETE_T = 0.965;
const WEIGHT_COUNT = 10;

export default function ZeroGReleaseAtom({
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
    zeroG: 0,
    toggled: false,
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

    const weights = Array.from({ length: WEIGHT_COUNT }, (_, i) => ({
      x: 0.18 + (i % 5) * 0.16,
      y: 0.24 + Math.floor(i / 5) * 0.12,
      driftX: (i % 2 === 0 ? -1 : 1) * (0.03 + (i % 3) * 0.015),
      driftY: 0.12 + (i % 4) * 0.04,
    }));

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
      if (p.phase === 'resolve' && !s.toggled) s.toggled = true;
      if (s.toggled) s.zeroG = Math.min(1, s.zeroG + 0.022 * (p.reducedMotion ? 0.7 : 1));

      const reveal = easeOutCubic(clamp(s.zeroG, 0, 1));
      const burden = 1 - reveal;
      const boost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));
      cb.onStateChange?.(reveal);

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.78;
        cb.onHaptic('tap');
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
      const clarity = lerpColor(primary, [244, 247, 255], 0.9);
      const ember = lerpColor(accent, [255, 236, 210], 0.6);

      const stage = ctx.createRadialGradient(cx, cy + minDim * 0.08, 0, cx, cy + minDim * 0.08, minDim * 0.9);
      stage.addColorStop(0, rgba(field, Math.min(0.16, (0.04 + burden * 0.08 + reveal * 0.04) * entrance * boost)));
      stage.addColorStop(0.62, rgba(field, Math.min(0.08, (0.02 + burden * 0.03) * entrance * boost)));
      stage.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const dread = ctx.createLinearGradient(0, 0, 0, h);
      dread.addColorStop(0, rgba(threat, Math.min(0.28, (0.08 + burden * 0.16) * entrance * boost)));
      dread.addColorStop(0.7, rgba(dense, Math.min(0.18, (0.06 + burden * 0.1) * entrance * boost)));
      dread.addColorStop(1, rgba(dense, 0));
      ctx.fillStyle = dread;
      ctx.fillRect(0, 0, w, h);

      const nodeX = cx;
      const nodeY = h * 0.78;
      const nodeGlow = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, px(0.18, minDim));
      nodeGlow.addColorStop(0, rgba(clarity, Math.min(0.24, (0.04 + reveal * 0.16 + s.revealFlash * 0.05) * entrance * boost)));
      nodeGlow.addColorStop(1, rgba(clarity, 0));
      ctx.fillStyle = nodeGlow;
      ctx.fillRect(nodeX - minDim * 0.18, nodeY - minDim * 0.18, minDim * 0.36, minDim * 0.36);
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, px(0.028, minDim) * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(clarity, Math.min(0.98, (0.24 + reveal * 0.46) * entrance * boost));
      ctx.fill();

      for (const weight of weights) {
        const x = weight.x * w + reveal * weight.driftX * w;
        const y = weight.y * h - reveal * weight.driftY * h;
        const chainTopX = nodeX + (x - nodeX) * 0.3;
        const chainTopY = nodeY - minDim * 0.04;
        const slack = reveal * minDim * 0.06;
        ctx.beginPath();
        ctx.moveTo(chainTopX, chainTopY);
        ctx.quadraticCurveTo((chainTopX + x) * 0.5, (chainTopY + y) * 0.5 + slack, x, y);
        ctx.strokeStyle = rgba(ember, Math.min(0.22, (0.08 + burden * 0.1) * entrance * boost));
        ctx.lineWidth = px(0.0022, minDim);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, px(0.034, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(threat, Math.min(0.82, (0.22 + burden * 0.34) * entrance * boost));
        ctx.fill();
      }

      const toggleX = cx;
      const toggleY = h * 0.16;
      const trackW = minDim * 0.2;
      const knobX = toggleX - trackW * 0.26 + reveal * trackW * 0.52;
      ctx.beginPath();
      ctx.roundRect(toggleX - trackW * 0.5, toggleY - minDim * 0.032, trackW, minDim * 0.064, minDim * 0.032);
      ctx.fillStyle = rgba(clarity, Math.min(0.18, (0.04 + reveal * 0.12) * entrance * boost));
      ctx.fill();
      ctx.beginPath();
      ctx.arc(knobX, toggleY, minDim * 0.026, 0, Math.PI * 2);
      ctx.fillStyle = rgba(ember, Math.min(0.94, (0.2 + reveal * 0.54) * entrance * boost));
      ctx.fill();

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.54);
        flash.addColorStop(0, rgba(clarity, (s.revealFlash * 0.2 + Math.max(0, reveal - 0.9) * 0.62) * entrance));
        flash.addColorStop(1, rgba(clarity, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.54, cy - minDim * 0.54, minDim * 1.08, minDim * 1.08);
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
      const toggleY = viewport.height * 0.16;
      const toggleX = viewport.width * 0.5;
      if (!s.toggled && Math.abs(p.x - toggleX) < viewport.width * 0.14 && Math.abs(p.y - toggleY) < viewport.height * 0.08) {
        s.toggled = true;
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
