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

function roundedPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export default function OrthographicShiftAtom({
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
    targetShift: 0,
    shift: 0,
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
      if (p.phase === 'resolve') s.targetShift = 1;

      s.shift += (s.targetShift - s.shift) * 0.11 * ms;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));

      const reveal = easeOutCubic(clamp(s.shift, 0, 1));
      const distortion = 1 - reveal;
      const boost = p.composed ? 1.18 : 1;
      cb.onStateChange?.(reveal);

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.7;
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
      const field = lerpColor(primary, accent, 0.14);
      const dense = lerpColor([4, 5, 10], primary, 0.08);
      const line = lerpColor(primary, [246, 248, 255], 0.92);
      const ember = lerpColor(accent, [255, 240, 216], 0.66);
      const stage = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.98);
      stage.addColorStop(0, rgba(field, Math.min(0.16, (0.04 + reveal * 0.06) * entrance * boost)));
      stage.addColorStop(1, rgba(dense, Math.min(0.98, (0.28 + distortion * 0.22) * entrance * boost)));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const stack = [
        { z: 0.14, lane: -1 },
        { z: 0.38, lane: 0 },
        { z: 0.68, lane: 1 },
      ];

      for (let i = 0; i < stack.length; i++) {
        const layer = stack[i];
        const perspectiveScale = 1.7 - layer.z * 1.05;
        const orthoScale = 0.82;
        const scale = perspectiveScale * distortion + orthoScale * reveal;
        const panelW = minDim * 0.34 * scale;
        const panelH = minDim * 0.2 * scale;
        const dxPerspective = layer.lane * minDim * 0.18 * (1 + (1 - layer.z) * 0.55);
        const dxOrtho = layer.lane * minDim * 0.22;
        const dx = dxPerspective * distortion + dxOrtho * reveal;
        const dyPerspective = (layer.z - 0.4) * minDim * 0.44;
        const dyOrtho = (i - 1) * minDim * 0.22;
        const dy = dyPerspective * distortion + dyOrtho * reveal;
        const skew = layer.lane * distortion * minDim * 0.09;

        ctx.save();
        ctx.translate(cx + dx, cy + dy);
        ctx.beginPath();
        ctx.moveTo(-panelW * 0.5 + skew, -panelH * 0.5);
        ctx.lineTo(panelW * 0.5 + skew, -panelH * 0.5);
        ctx.lineTo(panelW * 0.5 - skew, panelH * 0.5);
        ctx.lineTo(-panelW * 0.5 - skew, panelH * 0.5);
        ctx.closePath();
        ctx.strokeStyle = rgba(line, Math.min(0.88, (0.12 + (1 - layer.z) * 0.24 + reveal * 0.18) * entrance * boost));
        ctx.lineWidth = px(0.0052 - i * 0.0007, minDim);
        ctx.stroke();

        const fill = ctx.createLinearGradient(-panelW * 0.5, 0, panelW * 0.5, 0);
        fill.addColorStop(0, rgba(ember, Math.min(0.12, (0.03 + reveal * 0.05) * entrance * boost)));
        fill.addColorStop(1, rgba(line, Math.min(0.08, (0.02 + reveal * 0.04) * entrance * boost)));
        ctx.fillStyle = fill;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-panelW * 0.16, -panelH * 0.28);
        ctx.lineTo(panelW * 0.18, -panelH * 0.28);
        ctx.moveTo(-panelW * 0.16, 0);
        ctx.lineTo(panelW * 0.08, 0);
        ctx.moveTo(-panelW * 0.16, panelH * 0.28);
        ctx.lineTo(panelW * 0.22, panelH * 0.28);
        ctx.strokeStyle = rgba(line, Math.min(0.38, (0.05 + reveal * 0.14) * entrance * boost));
        ctx.lineWidth = px(0.0026, minDim);
        ctx.stroke();
        ctx.restore();
      }

      const railAlpha = Math.min(0.28, (0.06 + reveal * 0.12) * entrance * boost);
      for (let i = -1; i <= 1; i++) {
        const x = cx + i * minDim * 0.22;
        ctx.beginPath();
        ctx.moveTo(x, cy - minDim * 0.32);
        ctx.lineTo(x, cy + minDim * 0.32);
        ctx.strokeStyle = rgba(line, railAlpha);
        ctx.lineWidth = px(0.0026, minDim);
        ctx.stroke();
      }

      const toggleW = minDim * 0.2;
      const toggleH = minDim * 0.07;
      const toggleX = cx - toggleW * 0.5;
      const toggleY = cy + minDim * 0.34;
      roundedPanel(ctx, toggleX, toggleY, toggleW, toggleH, toggleH * 0.5);
      ctx.fillStyle = rgba(line, Math.min(0.1, (0.03 + reveal * 0.05) * entrance * boost));
      ctx.fill();
      ctx.strokeStyle = rgba(line, Math.min(0.34, (0.08 + reveal * 0.12) * entrance * boost));
      ctx.lineWidth = px(0.003, minDim);
      ctx.stroke();

      const knobX = toggleX + toggleH * 0.5 + reveal * (toggleW - toggleH);
      ctx.beginPath();
      ctx.arc(knobX, toggleY + toggleH * 0.5, toggleH * 0.32, 0, Math.PI * 2);
      ctx.fillStyle = rgba(ember, Math.min(0.88, (0.14 + reveal * 0.54 + s.revealFlash * 0.08) * entrance * boost));
      ctx.fill();

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.52);
        flash.addColorStop(0, rgba(line, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.62) * entrance));
        flash.addColorStop(1, rgba(line, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.52, cy - minDim * 0.52, minDim * 1.04, minDim * 1.04);
      }

      ctx.restore();
      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * viewport.width;
      const y = ((e.clientY - rect.top) / rect.height) * viewport.height;
      const minDim = Math.min(viewport.width, viewport.height);
      const toggleW = minDim * 0.2;
      const toggleH = minDim * 0.07;
      const toggleX = viewport.width * 0.5 - toggleW * 0.5;
      const toggleY = viewport.height * 0.5 + minDim * 0.34;
      const inside = x >= toggleX && x <= toggleX + toggleW && y >= toggleY && y <= toggleY + toggleH;
      if (!inside) return;
      stateRef.current.targetShift = 1;
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
