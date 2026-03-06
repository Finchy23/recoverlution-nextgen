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
const STEP_T = 0.48;
const COMPLETE_T = 0.978;

export default function CompressionForgeAtom({
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
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    pressure: 0,
    thresholdFired: false,
    completionFired: false,
    flash: 0,
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
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = 0.75 + motionScale(p.reducedMotion) * 0.25;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const points = Array.from(pointersRef.current.values());
      if (points.length >= 2) {
        const a = points[0];
        const b = points[1];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        const next = clamp(1 - dist / (minDim * 0.48), 0, 1);
        s.pressure += (next - s.pressure) * 0.18 * ms;
      } else if (p.phase === 'resolve') {
        s.pressure += (1 - s.pressure) * 0.08 * ms;
      } else {
        s.pressure += (0 - s.pressure) * 0.08 * ms;
      }
      s.flash = Math.max(0, s.flash - 0.03);

      const reveal = easeOutCubic(clamp(s.pressure, 0, 1));
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        cb.onHaptic('hold_threshold');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        s.flash = 1;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const deep = lerpColor([4, 6, 12], primary, 0.14);
      const carbon = lerpColor([18, 22, 30], primary, 0.06);
      const ember = lerpColor(accent, [255, 176, 108], 0.82);
      const diamond = lerpColor(primary, [235, 246, 255], 0.94);

      ctx.fillStyle = rgba(deep, 0.94 * entrance);
      ctx.fillRect(0, 0, w, h);

      const forgeY = h * 0.68;
      const heat = clamp((reveal - 0.24) / 0.76, 0, 1);
      const glow = ctx.createRadialGradient(cx, forgeY, 0, cx, forgeY, minDim * 0.32);
      glow.addColorStop(0, rgba(ember, (0.04 + heat * 0.3 + s.flash * 0.18) * entrance));
      glow.addColorStop(1, rgba(ember, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(cx - minDim * 0.32, forgeY - minDim * 0.32, minDim * 0.64, minDim * 0.64);

      const size = minDim * (0.12 - reveal * 0.03);
      if (reveal < 0.94) {
        ctx.save();
        ctx.translate(cx, forgeY);
        ctx.rotate(reveal * 0.24);
        ctx.fillStyle = rgba(lerpColor(carbon, ember, heat * 0.34), (0.24 + heat * 0.4) * entrance);
        ctx.fillRect(-size, -size, size * 2, size * 2);
        ctx.restore();
      }

      if (reveal < 0.96) {
        const sparkCount = Math.round(6 + heat * 18);
        for (let i = 0; i < sparkCount; i += 1) {
          const angle = (i / sparkCount) * Math.PI * 2 + performance.now() * 0.0022;
          const orbit = size * (1.1 + heat * 0.85);
          const sx = cx + Math.cos(angle) * orbit;
          const sy = forgeY + Math.sin(angle) * orbit * 0.72;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + Math.cos(angle) * minDim * 0.02, sy + Math.sin(angle) * minDim * 0.02);
          ctx.strokeStyle = rgba(ember, (0.08 + heat * 0.48) * entrance);
          ctx.lineWidth = px(0.0022, minDim);
          ctx.stroke();
        }
      }

      if (reveal >= 0.9) {
        const lattice = clamp((reveal - 0.9) / 0.1, 0, 1);
        const r = minDim * (0.14 + lattice * 0.02);
        ctx.save();
        ctx.translate(cx, forgeY);
        ctx.rotate(Math.PI / 4);
        ctx.strokeStyle = rgba(diamond, (0.18 + lattice * 0.72 + s.flash * 0.18) * entrance);
        ctx.lineWidth = px(0.0045, minDim);
        for (let i = -2; i <= 2; i += 1) {
          ctx.beginPath();
          ctx.moveTo(-r, (i / 2) * r * 0.55);
          ctx.lineTo(r, (i / 2) * r * 0.55);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo((i / 2) * r * 0.55, -r);
          ctx.lineTo((i / 2) * r * 0.55, r);
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getPoint = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * viewport.width,
        y: ((e.clientY - rect.top) / rect.height) * viewport.height,
      };
    };
    const onDown = (e: PointerEvent) => {
      pointersRef.current.set(e.pointerId, getPoint(e));
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('hold_start');
    };
    const onMove = (e: PointerEvent) => {
      if (!pointersRef.current.has(e.pointerId)) return;
      pointersRef.current.set(e.pointerId, getPoint(e));
    };
    const onUp = (e: PointerEvent) => {
      pointersRef.current.delete(e.pointerId);
      canvas.releasePointerCapture(e.pointerId);
    };

    raf = window.requestAnimationFrame(render);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    return () => {
      window.cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
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
