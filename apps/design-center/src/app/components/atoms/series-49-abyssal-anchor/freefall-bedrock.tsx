import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import {
  advanceEntrance,
  drawAtmosphere,
  easeOutCubic,
  lerpColor,
  motionScale,
  parseColor,
  px,
  rgba,
  setupCanvas,
} from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.42;
const COMPLETE_T = 0.985;

type Point = { x: number; y: number };

export default function FreefallBedrockAtom({
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
  const pointerRef = useRef<{ active: boolean; point: Point | null }>({ active: false, point: null });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    fall: 0,
    velocity: 0,
    released: false,
    impacted: false,
    thresholdFired: false,
    completionFired: false,
    impactFlash: 0,
  });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onResolve, onStateChange]);
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
      const { w, h, cx, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = 0.7 + motionScale(p.reducedMotion) * 0.3;
      if (!p.composed) drawAtmosphere(ctx, cx, h * 0.3, w, h, minDim, s.primaryRgb, entrance);

      if (s.released && !s.impacted) {
        s.velocity += 0.012 * ms;
        s.fall += s.velocity;
      } else if (!s.released) {
        const holdTension = 0.018 * Math.sin(performance.now() * 0.024) * motionScale(p.reducedMotion);
        s.fall = clamp(s.fall + holdTension, -0.02, 0.035);
      }

      if (p.phase === 'resolve' && !s.released) {
        s.released = true;
        s.velocity = Math.max(s.velocity, 0.04);
        cb.onHaptic('hold_release');
      }

      if (s.fall >= 1 && !s.impacted) {
        s.fall = 1;
        s.impacted = true;
        s.impactFlash = 1;
        cb.onHaptic('completion');
      }
      s.impactFlash = Math.max(0, s.impactFlash - 0.03);

      const reveal = easeOutCubic(clamp(s.fall, 0, 1));
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        cb.onHaptic('step_advance');
      }
      if (reveal >= COMPLETE_T && s.impacted && !s.completionFired) {
        s.completionFired = true;
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const trench = lerpColor([4, 6, 12], primary, 0.14);
      const bedrock = lerpColor([86, 95, 112], accent, 0.38);
      const node = lerpColor(primary, [244, 247, 255], 0.9);
      const ember = lerpColor(accent, [255, 213, 168], 0.72);

      const trenchGrad = ctx.createLinearGradient(0, 0, 0, h);
      trenchGrad.addColorStop(0, rgba(lerpColor(trench, primary, 0.18), 0.26 * entrance));
      trenchGrad.addColorStop(0.62, rgba(trench, 0.7 * entrance));
      trenchGrad.addColorStop(1, rgba(lerpColor(trench, [0, 0, 0], 0.5), 0.96 * entrance));
      ctx.fillStyle = trenchGrad;
      ctx.fillRect(0, 0, w, h);

      const shaftW = minDim * 0.18;
      const shaftGrad = ctx.createLinearGradient(cx, 0, cx, h);
      shaftGrad.addColorStop(0, rgba(node, 0.12 * entrance));
      shaftGrad.addColorStop(1, rgba(node, 0));
      ctx.fillStyle = shaftGrad;
      ctx.fillRect(cx - shaftW * 0.5, 0, shaftW, h);

      const bedrockY = h * 0.88;
      ctx.fillStyle = rgba(bedrock, (0.22 + s.impactFlash * 0.3) * entrance);
      ctx.fillRect(0, bedrockY, w, h - bedrockY);
      ctx.fillStyle = rgba(lerpColor(bedrock, ember, 0.5), (0.3 + s.impactFlash * 0.5) * entrance);
      ctx.fillRect(0, bedrockY - px(0.008, minDim), w, px(0.012, minDim));

      const nodeY = h * (0.12 + reveal * 0.76);
      const radius = minDim * (0.042 - reveal * 0.008 + breathAmplitude * 0.0025);
      const glow = ctx.createRadialGradient(cx, nodeY, 0, cx, nodeY, minDim * 0.18);
      glow.addColorStop(0, rgba(ember, (0.12 + s.impactFlash * 0.22) * entrance));
      glow.addColorStop(1, rgba(ember, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(cx - minDim * 0.18, nodeY - minDim * 0.18, minDim * 0.36, minDim * 0.36);

      ctx.beginPath();
      ctx.arc(cx, nodeY, radius, 0, Math.PI * 2);
      ctx.fillStyle = rgba(node, (0.22 + reveal * 0.72) * entrance);
      ctx.fill();

      if (!s.impacted) {
        ctx.beginPath();
        ctx.moveTo(cx, nodeY + radius);
        ctx.lineTo(cx, bedrockY - px(0.02, minDim));
        ctx.strokeStyle = rgba(node, 0.08 * entrance * (1 - reveal));
        ctx.lineWidth = px(0.004, minDim);
        ctx.stroke();
      } else {
        for (let i = -3; i <= 3; i += 1) {
          const spread = i / 3;
          ctx.beginPath();
          ctx.moveTo(cx, bedrockY);
          ctx.lineTo(cx + spread * minDim * 0.12, bedrockY - minDim * 0.05 * s.impactFlash);
          ctx.strokeStyle = rgba(ember, s.impactFlash * 0.55 * entrance);
          ctx.lineWidth = px(0.003, minDim);
          ctx.stroke();
        }
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getPoint = (e: PointerEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * viewport.width,
        y: ((e.clientY - rect.top) / rect.height) * viewport.height,
      };
    };

    const onDown = (e: PointerEvent) => {
      const pt = getPoint(e);
      pointerRef.current = { active: true, point: pt };
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('hold_start');
    };

    const onUp = (e: PointerEvent) => {
      if (!pointerRef.current.active) return;
      pointerRef.current = { active: false, point: null };
      if (!stateRef.current.released) {
        stateRef.current.released = true;
        stateRef.current.velocity = Math.max(stateRef.current.velocity, 0.035);
        callbacksRef.current.onHaptic('hold_release');
      }
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} />
    </div>
  );
}
