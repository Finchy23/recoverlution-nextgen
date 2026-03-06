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
const FLASH_DECAY = 0.024;
const STEP_T = 0.4;
const COMPLETE_T = 0.965;

export default function MagneticFloorAtom({
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
    repulse: 0,
    tapped: false,
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
      if (p.phase === 'resolve' && !s.tapped) s.tapped = true;
      if (s.tapped) s.repulse = Math.min(1, s.repulse + 0.022 * (p.reducedMotion ? 0.7 : 1));

      const reveal = easeOutCubic(clamp(s.repulse, 0, 1));
      const burden = 1 - reveal;
      const boost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));
      cb.onStateChange?.(reveal);

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.8;
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
      const clarity = lerpColor(primary, [244, 247, 255], 0.92);
      const ember = lerpColor(accent, [255, 236, 210], 0.62);

      const stage = ctx.createRadialGradient(cx, cy + minDim * 0.06, 0, cx, cy + minDim * 0.06, minDim * 0.84);
      stage.addColorStop(0, rgba(field, Math.min(0.16, (0.04 + burden * 0.08 + reveal * 0.04) * entrance * boost)));
      stage.addColorStop(0.62, rgba(field, Math.min(0.08, (0.02 + burden * 0.03) * entrance * boost)));
      stage.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const nodeX = cx;
      const nodeY = h * 0.72;
      const nodeR = px(0.028, minDim) * (1 + breathAmplitude * 0.02);
      const weightStartY = nodeY - minDim * 0.18;
      const weightX = cx;
      const weightY = weightStartY - reveal * minDim * 0.62;
      const weightR = px(0.09, minDim);

      const dread = ctx.createRadialGradient(weightX, weightStartY, 0, weightX, weightStartY, minDim * 0.72);
      dread.addColorStop(0, rgba(threat, Math.min(0.28, (0.08 + burden * 0.18) * entrance * boost)));
      dread.addColorStop(0.58, rgba(dense, Math.min(0.14, (0.05 + burden * 0.08) * entrance * boost)));
      dread.addColorStop(1, rgba(dense, 0));
      ctx.fillStyle = dread;
      ctx.fillRect(0, 0, w, h);

      if (!s.tapped) {
        const pulse = 0.5 + 0.5 * Math.sin(s.frameCount * 0.04 * ms);
        for (let i = 0; i < 3; i++) {
          const r = nodeR * (1.8 + i * 0.9 + pulse * 0.2);
          ctx.beginPath();
          ctx.arc(nodeX, nodeY, r, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(clarity, Math.min(0.14, (0.03 + pulse * 0.08) * entrance * boost * (1 - i * 0.24)));
          ctx.lineWidth = px(0.002, minDim);
          ctx.stroke();
        }
      }

      if (s.tapped) {
        for (let i = 0; i < 4; i++) {
          const r = minDim * (0.08 + reveal * (0.08 + i * 0.05));
          ctx.beginPath();
          ctx.arc(nodeX, nodeY, r, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(ember, Math.min(0.2, (0.04 + reveal * 0.16) * entrance * boost * (1 - i * 0.16)));
          ctx.lineWidth = px(0.003, minDim);
          ctx.stroke();
        }
      }

      ctx.beginPath();
      ctx.arc(weightX, weightY, weightR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(threat, Math.min(0.82, (0.22 + burden * 0.4) * entrance * boost));
      ctx.fill();
      ctx.beginPath();
      ctx.arc(weightX, weightY, weightR * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = rgba(ember, Math.min(0.14, (0.03 + reveal * 0.1) * entrance * boost));
      ctx.fill();

      const nodeGlow = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, px(0.18, minDim));
      nodeGlow.addColorStop(0, rgba(clarity, Math.min(0.26, (0.04 + reveal * 0.16 + s.revealFlash * 0.05) * entrance * boost)));
      nodeGlow.addColorStop(1, rgba(clarity, 0));
      ctx.fillStyle = nodeGlow;
      ctx.fillRect(nodeX - minDim * 0.18, nodeY - minDim * 0.18, minDim * 0.36, minDim * 0.36);
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(clarity, Math.min(0.98, (0.24 + reveal * 0.48 + burden * 0.08) * entrance * boost));
      ctx.fill();

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, minDim * 0.48);
        flash.addColorStop(0, rgba(clarity, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.64) * entrance));
        flash.addColorStop(1, rgba(clarity, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(nodeX - minDim * 0.48, nodeY - minDim * 0.48, minDim * 0.96, minDim * 0.96);
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
      const nodeX = viewport.width * 0.5;
      const nodeY = viewport.height * 0.72;
      if (Math.hypot(p.x - nodeX, p.y - nodeY) < viewport.width * 0.1 && !s.tapped) {
        s.tapped = true;
        return;
      }
      if (!s.tapped && p.y < nodeY - viewport.height * 0.08 && s.errorCooldown === 0) {
        s.errorCooldown = 24;
        callbacksRef.current.onHaptic('error_boundary');
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
