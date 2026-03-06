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
const STEP_T = 0.54;
const COMPLETE_T = 0.97;

function drawRibbon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  width: number,
  rotation: number,
  colorA: RGB,
  colorB: RGB,
  alpha: number,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  for (let pass = 0; pass < 2; pass++) {
    const start = pass === 0 ? -Math.PI * 0.05 : Math.PI * 0.95;
    const end = pass === 0 ? Math.PI * 0.95 : Math.PI * 1.95;
    ctx.beginPath();
    for (let i = 0; i <= 80; i++) {
      const t = start + ((end - start) * i) / 80;
      const twist = Math.sin(t * 0.5);
      const x = Math.cos(t) * rx;
      const y = Math.sin(t) * ry;
      const nx = -Math.sin(t);
      const ny = Math.cos(t);
      const half = width * (0.38 + 0.34 * Math.abs(twist));
      const ox = nx * half * (pass === 0 ? 1 : -1);
      const oy = ny * half * (pass === 0 ? 1 : -1);
      if (i === 0) ctx.moveTo(x + ox, y + oy);
      else ctx.lineTo(x + ox, y + oy);
    }
    for (let i = 80; i >= 0; i--) {
      const t = start + ((end - start) * i) / 80;
      const twist = Math.sin(t * 0.5);
      const x = Math.cos(t) * rx;
      const y = Math.sin(t) * ry;
      const nx = -Math.sin(t);
      const ny = Math.cos(t);
      const half = width * (0.38 + 0.34 * Math.abs(twist));
      const ox = nx * half * (pass === 0 ? -1 : 1);
      const oy = ny * half * (pass === 0 ? -1 : 1);
      ctx.lineTo(x + ox, y + oy);
    }
    ctx.closePath();
    const grad = ctx.createLinearGradient(-rx, 0, rx, 0);
    grad.addColorStop(0, rgba(pass === 0 ? colorA : colorB, alpha * 0.85));
    grad.addColorStop(0.5, rgba(lerpColor(colorA, colorB, 0.5), alpha));
    grad.addColorStop(1, rgba(pass === 0 ? colorB : colorA, alpha * 0.85));
    ctx.fillStyle = grad;
    ctx.fill();
  }

  ctx.restore();
}

export default function MobiusSliceAtom({
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
    dragging: false,
    seamProgress: 0,
    thresholdFired: false,
    completionFired: false,
    revealFlash: 0,
    dragCommitted: false,
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
      if (p.phase === 'resolve' && !s.dragging) s.seamProgress += (1 - s.seamProgress) * 0.08;

      const reveal = easeOutCubic(clamp(s.seamProgress, 0, 1));
      const loopMass = 1 - reveal;
      const boost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.65 : 1));
      cb.onStateChange?.(reveal);

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.8;
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
      const field = lerpColor(primary, accent, 0.24);
      const threat = lerpColor([10, 9, 16], accent, 0.14);
      const dense = lerpColor([5, 6, 11], primary, 0.08);
      const clarity = lerpColor(primary, [244, 247, 255], 0.92);
      const blade = lerpColor(accent, [255, 239, 210], 0.64);

      const stage = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.74);
      stage.addColorStop(0, rgba(field, Math.min(0.16, (0.05 + loopMass * 0.08) * entrance * boost)));
      stage.addColorStop(0.62, rgba(field, Math.min(0.08, (0.02 + loopMass * 0.03) * entrance * boost)));
      stage.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const dread = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.92);
      dread.addColorStop(0, rgba(threat, Math.min(0.28, (0.1 + loopMass * 0.14) * entrance * boost)));
      dread.addColorStop(0.55, rgba(dense, Math.min(0.18, (0.06 + loopMass * 0.1) * entrance * boost)));
      dread.addColorStop(1, rgba(dense, 0));
      ctx.fillStyle = dread;
      ctx.fillRect(0, 0, w, h);

      const rx = minDim * 0.24;
      const ry = minDim * 0.17;
      const ribbonW = minDim * 0.092;
      const rotation = Math.sin(s.frameCount * 0.01 * ms) * 0.18 * loopMass;
      const split = reveal * minDim * 0.24;

      if (reveal < 0.98) {
        drawRibbon(ctx, cx, cy, rx, ry, ribbonW, rotation, threat, clarity, Math.min(0.9, (0.26 + loopMass * 0.44) * entrance * boost));
      }

      if (reveal > 0.08) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawRibbon(ctx, cx - split, cy, rx * (0.92 + reveal * 0.05), ry * (0.96 + reveal * 0.05), ribbonW * (0.92 - reveal * 0.1), -0.12 * loopMass, primary, clarity, Math.min(0.72, reveal * 0.56 * entrance * boost));
        drawRibbon(ctx, cx + split, cy, rx * (0.92 + reveal * 0.05), ry * (0.96 + reveal * 0.05), ribbonW * (0.92 - reveal * 0.1), 0.12 * loopMass, accent, clarity, Math.min(0.72, reveal * 0.56 * entrance * boost));
        ctx.restore();
      }

      const seamTop = cy - minDim * 0.24;
      const seamBottom = cy + minDim * 0.24;
      const bladeY = seamTop + (seamBottom - seamTop) * reveal;
      const seamGlow = ctx.createLinearGradient(cx, seamTop, cx, seamBottom);
      seamGlow.addColorStop(0, rgba(blade, 0));
      seamGlow.addColorStop(Math.max(0, reveal - 0.12), rgba(blade, Math.min(0.18, (0.06 + reveal * 0.06) * entrance * boost)));
      seamGlow.addColorStop(Math.min(1, reveal + 0.05), rgba(blade, Math.min(0.32, (0.14 + reveal * 0.1 + s.revealFlash * 0.08) * entrance * boost)));
      seamGlow.addColorStop(1, rgba(blade, 0));
      ctx.strokeStyle = seamGlow;
      ctx.lineWidth = px(0.005, minDim);
      ctx.beginPath();
      ctx.moveTo(cx, seamTop);
      ctx.lineTo(cx, bladeY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx, seamTop - px(0.02, minDim));
      ctx.lineTo(cx - px(0.018, minDim), seamTop + px(0.02, minDim));
      ctx.lineTo(cx + px(0.018, minDim), seamTop + px(0.02, minDim));
      ctx.closePath();
      ctx.fillStyle = rgba(blade, Math.min(0.94, (0.16 + reveal * 0.42) * entrance * boost));
      ctx.fill();

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.38);
        flash.addColorStop(0, rgba(clarity, (s.revealFlash * 0.2 + Math.max(0, reveal - 0.9) * 0.6) * entrance));
        flash.addColorStop(1, rgba(clarity, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.38, cy - minDim * 0.38, minDim * 0.76, minDim * 0.76);
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
      if (Math.abs(p.x - viewport.width * 0.5) > viewport.width * 0.12) return;
      stateRef.current.dragging = true;
      if (!stateRef.current.dragCommitted) {
        stateRef.current.dragCommitted = true;
        callbacksRef.current.onHaptic('drag_snap');
      }
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const p = getPoint(e);
      const top = viewport.height * 0.28;
      const bottom = viewport.height * 0.72;
      s.seamProgress = clamp((p.y - top) / (bottom - top), 0, 1);
    };

    const onUp = (e: PointerEvent) => {
      if (!stateRef.current.dragging) return;
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
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ns-resize' }}
      />
    </div>
  );
}
