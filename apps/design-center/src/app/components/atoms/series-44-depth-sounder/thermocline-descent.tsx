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
const THERMO_Y = 0.54;

type Point = { x: number; y: number };

export default function ThermoclineDescentAtom({
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
    y: 0.22,
    dragging: false,
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
      const { w, h, cx, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      if (s.errorCooldown > 0) s.errorCooldown--;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, h * 0.5, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.y = Math.max(s.y, 0.84);

      const reveal = easeOutCubic(clamp((s.y - 0.22) / 0.62, 0, 1));
      const tension = 1 - reveal;
      const boost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));
      cb.onStateChange?.(reveal);

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.72;
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
      const warm = lerpColor(accent, [255, 208, 162], 0.42);
      const cold = lerpColor(primary, [180, 224, 255], 0.46);
      const clarity = lerpColor(primary, [244, 247, 255], 0.9);
      const threat = lerpColor([8, 8, 14], accent, 0.12);

      const upper = ctx.createLinearGradient(0, 0, 0, h * THERMO_Y);
      upper.addColorStop(0, rgba(warm, Math.min(0.16, (0.04 + tension * 0.08) * entrance * boost)));
      upper.addColorStop(1, rgba(warm, Math.min(0.08, (0.02 + tension * 0.04) * entrance * boost)));
      ctx.fillStyle = upper;
      ctx.fillRect(0, 0, w, h * THERMO_Y);

      const lower = ctx.createLinearGradient(0, h * THERMO_Y, 0, h);
      lower.addColorStop(0, rgba(cold, Math.min(0.08, (0.02 + reveal * 0.06) * entrance * boost)));
      lower.addColorStop(1, rgba(cold, Math.min(0.18, (0.04 + reveal * 0.12) * entrance * boost)));
      ctx.fillStyle = lower;
      ctx.fillRect(0, h * THERMO_Y, w, h * (1 - THERMO_Y));

      const bandY = h * THERMO_Y;
      const bandGlow = ctx.createLinearGradient(0, bandY - minDim * 0.06, 0, bandY + minDim * 0.06);
      bandGlow.addColorStop(0, rgba(threat, 0));
      bandGlow.addColorStop(0.5, rgba(clarity, Math.min(0.22, (0.06 + tension * 0.12) * entrance * boost)));
      bandGlow.addColorStop(1, rgba(threat, 0));
      ctx.fillStyle = bandGlow;
      ctx.fillRect(0, bandY - minDim * 0.06, w, minDim * 0.12);

      const nodeX = cx;
      const nodeY = h * s.y;
      const nodeGlow = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, minDim * 0.18);
      nodeGlow.addColorStop(0, rgba(clarity, Math.min(0.24, (0.06 + reveal * 0.12 + s.revealFlash * 0.04) * entrance * boost)));
      nodeGlow.addColorStop(1, rgba(clarity, 0));
      ctx.fillStyle = nodeGlow;
      ctx.fillRect(nodeX - minDim * 0.18, nodeY - minDim * 0.18, minDim * 0.36, minDim * 0.36);

      ctx.beginPath();
      ctx.arc(nodeX, nodeY, px(0.03, minDim) * (1 - Math.max(0, 0.12 - Math.abs(s.y - THERMO_Y)) * 0.8 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(clarity, Math.min(0.96, (0.24 + reveal * 0.46) * entrance * boost));
      ctx.fill();

      if (Math.abs(s.y - THERMO_Y) < 0.1) {
        for (let i = 0; i < 6; i++) {
          const x = cx + (i - 2.5) * minDim * 0.045;
          ctx.beginPath();
          ctx.moveTo(x, bandY - minDim * 0.04);
          ctx.lineTo(x + Math.sin(i + s.y * 18) * minDim * 0.012, bandY + minDim * 0.04);
          ctx.strokeStyle = rgba(accent, Math.min(0.18, (0.04 + (0.1 - Math.abs(s.y - THERMO_Y)) * 1.2) * entrance * boost));
          ctx.lineWidth = px(0.002, minDim);
          ctx.stroke();
        }
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, minDim * 0.44);
        flash.addColorStop(0, rgba(clarity, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.62) * entrance));
        flash.addColorStop(1, rgba(clarity, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(nodeX - minDim * 0.44, nodeY - minDim * 0.44, minDim * 0.88, minDim * 0.88);
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
      const p = getPoint(e);
      const s = stateRef.current;
      const nodeY = viewport.height * s.y;
      const nodeX = viewport.width * 0.5;
      if (Math.hypot(p.x - nodeX, p.y - nodeY) < Math.min(viewport.width, viewport.height) * 0.11) {
        s.dragging = true;
        canvas.setPointerCapture(e.pointerId);
        callbacksRef.current.onHaptic('drag_snap');
      }
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const p = getPoint(e);
      let targetY = clamp(p.y / viewport.height, 0.16, 0.84);
      const deltaToBand = Math.abs(targetY - THERMO_Y);
      if (deltaToBand < 0.08 && targetY > s.y) {
        targetY = s.y + (targetY - s.y) * 0.18;
        if (s.errorCooldown === 0) {
          s.errorCooldown = 14;
          callbacksRef.current.onHaptic('hold_threshold');
        }
      }
      if (targetY > THERMO_Y + 0.04) {
        targetY = s.y + (targetY - s.y) * 1.08;
      }
      s.y = clamp(targetY, 0.16, 0.84);
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.dragging = false;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}
