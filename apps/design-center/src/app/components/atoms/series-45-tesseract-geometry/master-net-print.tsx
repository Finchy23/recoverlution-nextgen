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
const HOLD_RATE = 0.022;
const RELEASE_RATE = 0.012;
const STEP_T = 0.52;
const COMPLETE_T = 0.965;

export default function MasterNetPrintAtom({
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
    frame: 0,
    holding: false,
    stamp: 0,
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

    const drawRotatingCube = (
      cx: number,
      cy: number,
      size: number,
      depth: number,
      angle: number,
      stroke: string,
      width: number,
    ) => {
      const corners = [
        [-size, -size],
        [size, -size],
        [size, size],
        [-size, size],
      ] as const;

      const project = (x: number, y: number, z: number) => {
        const rx = x * Math.cos(angle) - z * Math.sin(angle);
        const rz = x * Math.sin(angle) + z * Math.cos(angle);
        const scale = 1 + rz / (depth * 2.8);
        return {
          x: cx + rx * scale,
          y: cy + y * scale * (1 - rz / (depth * 6)),
        };
      };

      const front = corners.map(([x, y]) => project(x, y, -depth));
      const back = corners.map(([x, y]) => project(x, y, depth));

      ctx.beginPath();
      ctx.moveTo(front[0].x, front[0].y);
      for (let i = 1; i < front.length; i++) ctx.lineTo(front[i].x, front[i].y);
      ctx.closePath();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(back[0].x, back[0].y);
      for (let i = 1; i < back.length; i++) ctx.lineTo(back[i].x, back[i].y);
      ctx.closePath();
      ctx.stroke();

      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(front[i].x, front[i].y);
        ctx.lineTo(back[i].x, back[i].y);
        ctx.stroke();
      }
    };

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frame += 1;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.holding = true;

      if (s.holding) s.stamp = Math.min(1, s.stamp + HOLD_RATE * ms);
      else s.stamp = Math.max(0, s.stamp - RELEASE_RATE * ms);

      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));
      const reveal = easeOutCubic(clamp(s.stamp, 0, 1));
      const boost = p.composed ? 1.18 : 1;
      cb.onStateChange?.(reveal);

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.8;
        cb.onHaptic('hold_threshold');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        s.revealFlash = 1;
        cb.onHaptic('seal_stamp');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const field = lerpColor(primary, accent, 0.16);
      const dense = lerpColor([4, 5, 10], primary, 0.08);
      const line = lerpColor(primary, [246, 248, 255], 0.9);
      const ember = lerpColor(accent, [255, 242, 226], 0.84);
      const stageBg = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.96);
      stageBg.addColorStop(0, rgba(field, Math.min(0.15, (0.05 + reveal * 0.05) * entrance * boost)));
      stageBg.addColorStop(1, rgba(dense, Math.min(0.98, (0.28 + (1 - reveal) * 0.24) * entrance * boost)));
      ctx.fillStyle = stageBg;
      ctx.fillRect(0, 0, w, h);

      const spin = (1 - reveal) * (s.frame * 0.042);
      const depth = minDim * (0.13 - reveal * 0.1);
      const cubeSize = minDim * 0.16;

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.46);
      glow.addColorStop(0, rgba(ember, Math.min(0.18, (0.04 + reveal * 0.08 + s.revealFlash * 0.05) * entrance * boost)));
      glow.addColorStop(1, rgba(ember, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(cx - minDim * 0.46, cy - minDim * 0.46, minDim * 0.92, minDim * 0.92);

      for (let i = 0; i < 3; i++) {
        const layerT = i / 2;
        const size = cubeSize * (1 - layerT * 0.22);
        const d = depth * (1 - layerT * 0.24);
        const alpha = Math.min(0.86, (0.14 + (1 - reveal) * 0.22 + reveal * 0.1) * entrance * boost * (1 - layerT * 0.08));
        drawRotatingCube(cx, cy, size, d, spin + i * 0.8, rgba(i % 2 === 0 ? line : ember, alpha), px(0.0046 - layerT * 0.0008, minDim));
      }

      const netCell = minDim * 0.085;
      const cells = [
        { x: 0, y: 0 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: 2, y: 0 },
      ];
      ctx.save();
      ctx.translate(cx, cy);
      const flatAlpha = Math.min(0.88, (0.08 + reveal * 0.7 + s.revealFlash * 0.06) * entrance * boost);
      ctx.strokeStyle = rgba(line, flatAlpha);
      ctx.lineWidth = px(0.0038, minDim);
      for (const cell of cells) {
        const x = cell.x * netCell * 2.02;
        const y = cell.y * netCell * 2.02;
        const revealScale = 0.28 + reveal * 0.72;
        ctx.strokeRect((x - netCell) * revealScale, (y - netCell) * revealScale, netCell * 2 * revealScale, netCell * 2 * revealScale);
      }
      ctx.restore();

      const palmAlpha = Math.min(0.2, (s.holding ? 0.08 + reveal * 0.08 : 0) * entrance * boost);
      if (palmAlpha > 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, minDim * 0.22, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(ember, palmAlpha);
        ctx.lineWidth = px(0.0024, minDim);
        ctx.stroke();
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.56);
        flash.addColorStop(0, rgba(ember, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.66) * entrance));
        flash.addColorStop(1, rgba(ember, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.56, cy - minDim * 0.56, minDim * 1.12, minDim * 1.12);
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
      const inCore = Math.abs(p.x - viewport.width * 0.5) < viewport.width * 0.24 && Math.abs(p.y - viewport.height * 0.5) < viewport.height * 0.24;
      if (!inCore) return;
      stateRef.current.holding = true;
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('hold_start');
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.holding = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    return () => {
      window.cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
