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
const HOLD_MS = 2200;
const FLASH_DECAY = 0.022;
const STEP_T = 0.5;
const COMPLETE_T = 0.96;

function drawCube(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  offsetX: number,
  offsetY: number,
  color: RGB,
  alpha: number,
  width: number,
) {
  const front = [
    [cx - size, cy - size],
    [cx + size, cy - size],
    [cx + size, cy + size],
    [cx - size, cy + size],
  ] as [number, number][];
  const back = front.map(([x, y]) => [x + offsetX, y + offsetY] as [number, number]);

  ctx.strokeStyle = rgba(color, alpha);
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  for (const poly of [front, back]) {
    ctx.beginPath();
    ctx.moveTo(poly[0][0], poly[0][1]);
    for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0], poly[i][1]);
    ctx.closePath();
    ctx.stroke();
  }

  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(front[i][0], front[i][1]);
    ctx.lineTo(back[i][0], back[i][1]);
    ctx.stroke();
  }
}

export default function NeckerCubeAtom({
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
    holding: false,
    holdStart: 0,
    acceptance: 0,
    forcing: 0,
    thresholdFired: false,
    completionFired: false,
    revealFlash: 0,
    anchor: { x: 0, y: 0 },
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

      if (s.holding) {
        const heldMs = performance.now() - s.holdStart;
        s.acceptance = clamp(heldMs / HOLD_MS, 0, 1);
      } else if (p.phase === 'resolve') {
        s.acceptance += (1 - s.acceptance) * 0.08;
      } else {
        s.acceptance *= 0.985;
      }
      s.forcing *= 0.94;

      const reveal = easeOutCubic(clamp(s.acceptance, 0, 1));
      const tension = 1 - reveal;
      const boost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));
      cb.onStateChange?.(reveal);

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.75;
        cb.onHaptic('hold_start');
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
      const threat = lerpColor([11, 10, 18], accent, 0.14);
      const clarity = lerpColor(primary, [244, 247, 255], 0.92);
      const bilateral = lerpColor(accent, [255, 235, 208], 0.55);

      const stage = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.66);
      stage.addColorStop(0, rgba(field, Math.min(0.16, (0.05 + tension * 0.08) * entrance * boost)));
      stage.addColorStop(0.62, rgba(field, Math.min(0.08, (0.02 + tension * 0.03) * entrance * boost)));
      stage.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const dread = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.82);
      dread.addColorStop(0, rgba(threat, Math.min(0.24, (0.08 + tension * 0.12 + s.forcing * 0.12) * entrance * boost)));
      dread.addColorStop(0.56, rgba(threat, Math.min(0.12, (0.03 + tension * 0.06) * entrance * boost)));
      dread.addColorStop(1, rgba(threat, 0));
      ctx.fillStyle = dread;
      ctx.fillRect(0, 0, w, h);

      const cubeSize = minDim * 0.16;
      const flip = 0.5 + 0.5 * Math.sin(s.frameCount * 0.03 * ms + breathAmplitude * 2);
      const orientA = 1 - reveal * 0.78;
      const orientB = reveal;
      const jitter = s.forcing * minDim * 0.01;

      drawCube(ctx, cx, cy, cubeSize, cubeSize * 0.52 + jitter, -cubeSize * 0.34, threat, Math.min(0.62, (0.18 + orientA * 0.36 + s.forcing * 0.2) * entrance * boost * (0.55 + 0.45 * flip)), px(0.0022, minDim));
      drawCube(ctx, cx, cy, cubeSize, -cubeSize * 0.52 - jitter, -cubeSize * 0.34, primary, Math.min(0.72, (0.08 + orientB * 0.52) * entrance * boost * (0.55 + 0.45 * (1 - flip))), px(0.0022, minDim));

      if (reveal > 0.18) {
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.34);
        glow.addColorStop(0, rgba(bilateral, Math.min(0.18, (0.04 + reveal * 0.08 + s.revealFlash * 0.08) * entrance * boost)));
        glow.addColorStop(1, rgba(bilateral, 0));
        ctx.fillStyle = glow;
        ctx.fillRect(cx - minDim * 0.34, cy - minDim * 0.34, minDim * 0.68, minDim * 0.68);
      }

      ctx.beginPath();
      ctx.arc(cx, cy, px(0.05 + breathAmplitude * 0.008 * ms, minDim), 0, Math.PI * 2);
      ctx.strokeStyle = rgba(clarity, Math.min(0.22, (0.08 + reveal * 0.08) * entrance * boost));
      ctx.lineWidth = px(0.0012, minDim);
      ctx.stroke();

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.38);
        flash.addColorStop(0, rgba(clarity, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.62) * entrance));
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
      if (Math.hypot(p.x - viewport.width * 0.5, p.y - viewport.height * 0.5) > Math.min(viewport.width, viewport.height) * 0.22) return;
      stateRef.current.holding = true;
      stateRef.current.holdStart = performance.now();
      stateRef.current.anchor = p;
      callbacksRef.current.onHaptic('hold_start');
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.holding) return;
      const p = getPoint(e);
      const drift = Math.hypot(p.x - s.anchor.x, p.y - s.anchor.y);
      if (drift > Math.min(viewport.width, viewport.height) * 0.06) {
        s.forcing = clamp(s.forcing + 0.18, 0, 1);
        s.acceptance *= 0.94;
        callbacksRef.current.onHaptic('error_boundary');
        s.anchor = p;
      }
    };

    const onUp = (e: PointerEvent) => {
      if (!stateRef.current.holding) return;
      stateRef.current.holding = false;
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
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }}
      />
    </div>
  );
}
