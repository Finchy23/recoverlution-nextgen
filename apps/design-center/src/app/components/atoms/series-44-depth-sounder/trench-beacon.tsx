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

type Ring = { age: number; side: 'out' | 'return' };

export default function TrenchBeaconAtom({
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
    rings: [] as Ring[],
    sent: false,
    returnStarted: false,
    answered: 0,
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
      if (p.phase === 'resolve' && !s.sent) {
        s.sent = true;
        s.rings.push({ age: 0, side: 'out' });
      }

      s.rings = s.rings
        .map((ring) => ({ ...ring, age: ring.age + 0.025 * (p.reducedMotion ? 0.7 : 1) }))
        .filter((ring) => ring.age < 1.16);

      if (s.sent && !s.returnStarted && s.rings.some((ring) => ring.side === 'out' && ring.age > 0.58)) {
        s.returnStarted = true;
        s.rings.push({ age: 0, side: 'return' });
        cb.onHaptic('step_advance');
      }
      if (s.returnStarted) {
        s.answered = Math.min(1, s.answered + 0.02 * ms);
      }

      const reveal = easeOutCubic(clamp(s.answered, 0, 1));
      const solitude = 1 - reveal;
      const boost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));
      cb.onStateChange?.(reveal);

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.72;
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        s.revealFlash = 1;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const field = lerpColor(primary, accent, 0.14);
      const dense = lerpColor([2, 4, 8], primary, 0.06);
      const answer = lerpColor(primary, [244, 247, 255], 0.92);
      const ember = lerpColor(accent, [255, 236, 210], 0.6);

      const stage = ctx.createRadialGradient(cx, h * 0.86, 0, cx, h * 0.86, minDim * 1.04);
      stage.addColorStop(0, rgba(field, Math.min(0.14, (0.03 + reveal * 0.06) * entrance * boost)));
      stage.addColorStop(1, rgba(dense, Math.min(0.98, (0.28 + solitude * 0.28) * entrance * boost)));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const sourceX = cx;
      const sourceY = h * 0.82;
      const beaconX = w * (0.14 + reveal * 0.68);
      const beaconY = h * (0.24 + reveal * 0.02);

      for (const ring of s.rings) {
        const x = ring.side === 'out' ? sourceX : beaconX;
        const y = ring.side === 'out' ? sourceY : beaconY;
        const radius = minDim * (0.04 + ring.age * (ring.side === 'out' ? 1.12 : 0.86));
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(ring.side === 'out' ? ember : answer, Math.min(0.26, (0.18 * (1 - ring.age)) * entrance * boost));
        ctx.lineWidth = px(0.004, minDim);
        ctx.stroke();
      }

      const sourceGlow = ctx.createRadialGradient(sourceX, sourceY, 0, sourceX, sourceY, minDim * 0.18);
      sourceGlow.addColorStop(0, rgba(answer, Math.min(0.24, (0.05 + reveal * 0.12 + s.revealFlash * 0.04) * entrance * boost)));
      sourceGlow.addColorStop(1, rgba(answer, 0));
      ctx.fillStyle = sourceGlow;
      ctx.fillRect(sourceX - minDim * 0.18, sourceY - minDim * 0.18, minDim * 0.36, minDim * 0.36);
      ctx.beginPath();
      ctx.arc(sourceX, sourceY, px(0.028, minDim) * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(answer, Math.min(0.98, (0.24 + reveal * 0.46) * entrance * boost));
      ctx.fill();

      if (reveal > 0.08) {
        const beaconGlow = ctx.createRadialGradient(beaconX, beaconY, 0, beaconX, beaconY, minDim * 0.2);
        beaconGlow.addColorStop(0, rgba(answer, Math.min(0.24, (0.05 + reveal * 0.18) * entrance * boost)));
        beaconGlow.addColorStop(1, rgba(answer, 0));
        ctx.fillStyle = beaconGlow;
        ctx.fillRect(beaconX - minDim * 0.2, beaconY - minDim * 0.2, minDim * 0.4, minDim * 0.4);
        ctx.beginPath();
        ctx.arc(beaconX, beaconY, px(0.022, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(answer, Math.min(0.92, (0.18 + reveal * 0.58) * entrance * boost));
        ctx.fill();
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(beaconX, beaconY, 0, beaconX, beaconY, minDim * 0.46);
        flash.addColorStop(0, rgba(answer, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.62) * entrance));
        flash.addColorStop(1, rgba(answer, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(beaconX - minDim * 0.46, beaconY - minDim * 0.46, minDim * 0.92, minDim * 0.92);
      }

      ctx.restore();
      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);

    const onDown = () => {
      const s = stateRef.current;
      if (s.sent) return;
      s.sent = true;
      s.rings.push({ age: 0, side: 'out' });
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
