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
const STEP_T = 0.56;
const COMPLETE_T = 0.965;
const REQUIRED_POINTERS = 4;

type Point = { x: number; y: number };

export default function TesseractUnfoldAtom({
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
    pointers: new Map<number, Point>(),
    unfold: 0,
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
      if (p.phase === 'resolve' && s.pointers.size < REQUIRED_POINTERS) s.unfold += (1 - s.unfold) * 0.08;

      const reveal = easeOutCubic(clamp(s.unfold, 0, 1));
      const complexity = 1 - reveal;
      const boost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));
      cb.onStateChange?.(reveal);

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.78;
        cb.onHaptic('swipe_commit');
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
      const threat = lerpColor([10, 9, 16], accent, 0.18);
      const dense = lerpColor([6, 7, 12], primary, 0.1);
      const clarity = lerpColor(primary, [244, 247, 255], 0.92);
      const ember = lerpColor(accent, [255, 236, 210], 0.62);

      const stage = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.78);
      stage.addColorStop(0, rgba(field, Math.min(0.16, (0.05 + complexity * 0.08) * entrance * boost)));
      stage.addColorStop(0.64, rgba(field, Math.min(0.08, (0.02 + complexity * 0.03) * entrance * boost)));
      stage.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const dread = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.92);
      dread.addColorStop(0, rgba(threat, Math.min(0.34, (0.1 + complexity * 0.18) * entrance * boost)));
      dread.addColorStop(0.56, rgba(dense, Math.min(0.16, (0.05 + complexity * 0.08) * entrance * boost)));
      dread.addColorStop(1, rgba(dense, 0));
      ctx.fillStyle = dread;
      ctx.fillRect(0, 0, w, h);

      const size = minDim * 0.17;
      const rotation = s.frameCount * 0.02 * ms * complexity;
      const depth = minDim * 0.12 * complexity;
      const offsets = [
        { x: 0, y: 0 },
        { x: depth, y: -depth * 0.62 },
      ];

      const drawSquare = (ox: number, oy: number, side: number, alpha: number) => {
        ctx.save();
        ctx.translate(cx + ox, cy + oy);
        ctx.rotate(rotation);
        ctx.strokeStyle = rgba(clarity, alpha);
        ctx.lineWidth = px(0.0032, minDim);
        ctx.strokeRect(-side, -side, side * 2, side * 2);
        ctx.restore();
      };

      drawSquare(offsets[0].x, offsets[0].y, size, Math.min(0.44, (0.16 + complexity * 0.18) * entrance * boost));
      drawSquare(offsets[1].x, offsets[1].y, size, Math.min(0.38, (0.12 + complexity * 0.18) * entrance * boost));

      if (complexity > 0.01) {
        const corners = [
          [-size, -size],
          [size, -size],
          [size, size],
          [-size, size],
        ];
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        for (const [dx, dy] of corners) {
          ctx.beginPath();
          ctx.moveTo(dx, dy);
          ctx.lineTo(dx + depth, dy - depth * 0.62);
          ctx.strokeStyle = rgba(ember, Math.min(0.34, (0.1 + complexity * 0.16) * entrance * boost));
          ctx.lineWidth = px(0.0024, minDim);
          ctx.stroke();
        }
        ctx.restore();
      }

      const netCell = minDim * 0.09;
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
      const flatAlpha = Math.min(0.64, (0.12 + reveal * 0.42 + s.revealFlash * 0.08) * entrance * boost);
      ctx.strokeStyle = rgba(clarity, flatAlpha);
      ctx.lineWidth = px(0.003, minDim);
      for (const cell of cells) {
        const x = cell.x * netCell * 2.02 * reveal;
        const y = cell.y * netCell * 2.02 * reveal;
        ctx.strokeRect(x - netCell, y - netCell, netCell * 2, netCell * 2);
      }
      ctx.beginPath();
      ctx.arc(0, 0, netCell * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = rgba(ember, Math.min(0.28, (0.06 + reveal * 0.18) * entrance * boost));
      ctx.fill();
      ctx.restore();

      if (s.pointers.size > 0) {
        for (const pt of s.pointers.values()) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, px(0.038 + breathAmplitude * 0.01, minDim), 0, Math.PI * 2);
          ctx.strokeStyle = rgba(ember, Math.min(0.16, (0.06 + reveal * 0.08) * entrance * boost));
          ctx.lineWidth = px(0.0012, minDim);
          ctx.stroke();
        }
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.46);
        flash.addColorStop(0, rgba(clarity, (s.revealFlash * 0.24 + Math.max(0, reveal - 0.9) * 0.64) * entrance));
        flash.addColorStop(1, rgba(clarity, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.46, cy - minDim * 0.46, minDim * 0.92, minDim * 0.92);
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

    const updateUnfold = () => {
      const s = stateRef.current;
      if (s.pointers.size < REQUIRED_POINTERS) return;
      const pts = [...s.pointers.values()];
      const cx = viewport.width * 0.5;
      const cy = viewport.height * 0.5;
      const avg = pts.reduce((sum, pt) => sum + Math.hypot(pt.x - cx, pt.y - cy), 0) / pts.length;
      s.unfold = clamp((avg - Math.min(viewport.width, viewport.height) * 0.12) / (Math.min(viewport.width, viewport.height) * 0.24), 0, 1);
    };

    const onDown = (e: PointerEvent) => {
      stateRef.current.pointers.set(e.pointerId, getPoint(e));
      if (stateRef.current.pointers.size === REQUIRED_POINTERS) callbacksRef.current.onHaptic('hold_start');
      updateUnfold();
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.pointers.has(e.pointerId)) return;
      stateRef.current.pointers.set(e.pointerId, getPoint(e));
      updateUnfold();
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.pointers.delete(e.pointerId);
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'zoom-out' }} />
    </div>
  );
}
