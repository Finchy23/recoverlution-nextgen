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
const IMPACT_T = 0.34;
const STEP_T = 0.58;
const COMPLETE_T = 0.965;

export default function ArchimedesLiftAtom({
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
    progress: 0,
    impactFired: false,
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
      s.progress = Math.min(1, s.progress + 0.008 * (p.reducedMotion ? 0.7 : 1));
      if (p.phase === 'resolve') s.progress += (1 - s.progress) * 0.08;

      const reveal = easeOutCubic(clamp(s.progress, 0, 1));
      const dropT = clamp(reveal / IMPACT_T, 0, 1);
      const displacementT = reveal < IMPACT_T ? 0 : easeOutCubic((reveal - IMPACT_T) / (1 - IMPACT_T));
      const boost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));
      cb.onStateChange?.(reveal);

      if (reveal >= IMPACT_T && !s.impactFired) {
        s.impactFired = true;
        s.revealFlash = 0.7;
        cb.onHaptic('entrance_land');
      }
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.82;
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
      const field = lerpColor(primary, accent, 0.22);
      const fluidDark = lerpColor([7, 10, 18], accent, 0.1);
      const fluidDense = lerpColor(primary, accent, 0.34);
      const clarity = lerpColor(primary, [244, 247, 255], 0.92);
      const ember = lerpColor(accent, [255, 236, 210], 0.56);
      const threat = lerpColor([8, 8, 14], accent, 0.18);

      const stage = ctx.createRadialGradient(cx, cy + minDim * 0.1, 0, cx, cy + minDim * 0.1, minDim * 0.88);
      stage.addColorStop(0, rgba(field, Math.min(0.16, (0.05 + (1 - reveal) * 0.08 + reveal * 0.04) * entrance * boost)));
      stage.addColorStop(0.62, rgba(field, Math.min(0.08, (0.02 + (1 - reveal) * 0.03) * entrance * boost)));
      stage.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const baseSurfaceY = h * 0.64;
      const displacedY = baseSurfaceY - displacementT * h * 0.14;

      const fluid = ctx.createLinearGradient(0, displacedY - minDim * 0.02, 0, h);
      fluid.addColorStop(0, rgba(fluidDense, Math.min(0.24, (0.04 + displacementT * 0.18) * entrance * boost)));
      fluid.addColorStop(1, rgba(fluidDark, Math.min(0.5, (0.18 + (1 - reveal) * 0.18) * entrance * boost)));
      ctx.fillStyle = fluid;
      ctx.fillRect(0, displacedY - minDim * 0.02, w, h - displacedY + minDim * 0.02);

      ctx.beginPath();
      ctx.moveTo(w * 0.12, displacedY);
      ctx.quadraticCurveTo(cx, displacedY - minDim * 0.05 * displacementT, w * 0.88, displacedY);
      ctx.strokeStyle = rgba(clarity, Math.min(0.26, (0.06 + displacementT * 0.16) * entrance * boost));
      ctx.lineWidth = px(0.004, minDim);
      ctx.stroke();

      const blockX = cx + minDim * 0.18;
      const blockStartY = h * 0.12;
      const blockImpactY = displacedY - minDim * 0.06;
      const blockY = dropT < 1 ? blockStartY + (blockImpactY - blockStartY) * easeOutCubic(dropT) : blockImpactY + displacementT * minDim * 0.03;
      const blockSize = minDim * 0.16;

      const dread = ctx.createRadialGradient(blockX, blockY, 0, blockX, blockY, minDim * 0.56);
      dread.addColorStop(0, rgba(threat, Math.min(0.22, (0.06 + (1 - reveal) * 0.14) * entrance * boost)));
      dread.addColorStop(1, rgba(threat, 0));
      ctx.fillStyle = dread;
      ctx.fillRect(blockX - minDim * 0.56, blockY - minDim * 0.56, minDim * 1.12, minDim * 1.12);
      ctx.fillStyle = rgba(threat, Math.min(0.84, (0.22 + (1 - reveal) * 0.4) * entrance * boost));
      ctx.fillRect(blockX - blockSize * 0.5, blockY - blockSize * 0.5, blockSize, blockSize);

      if (reveal >= IMPACT_T) {
        const splashW = minDim * (0.08 + displacementT * 0.2);
        for (let i = 0; i < 6; i++) {
          const side = i < 3 ? -1 : 1;
          const t = (i % 3) / 2;
          ctx.beginPath();
          ctx.arc(blockX + side * splashW * (0.4 + t * 0.6), displacedY - minDim * 0.02 * (1 + t), minDim * (0.008 + t * 0.004), 0, Math.PI * 2);
          ctx.fillStyle = rgba(ember, Math.min(0.22, (0.04 + displacementT * 0.16) * entrance * boost));
          ctx.fill();
        }
      }

      const nodeX = cx - minDim * 0.18;
      const nodeY = displacedY - minDim * (0.02 + displacementT * 0.18);
      const nodeGlow = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, px(0.18, minDim));
      nodeGlow.addColorStop(0, rgba(clarity, Math.min(0.24, (0.05 + displacementT * 0.16 + s.revealFlash * 0.05) * entrance * boost)));
      nodeGlow.addColorStop(1, rgba(clarity, 0));
      ctx.fillStyle = nodeGlow;
      ctx.fillRect(nodeX - minDim * 0.18, nodeY - minDim * 0.18, minDim * 0.36, minDim * 0.36);
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, px(0.028, minDim) * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(clarity, Math.min(0.98, (0.22 + displacementT * 0.5) * entrance * boost));
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

    return () => {
      window.cancelAnimationFrame(animId);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} />
    </div>
  );
}
