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

type Point = { x: number; y: number };

export default function BathysphereDiveAtom({
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
    depth: 0.18,
    dragging: false,
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
      if (p.phase === 'resolve') s.depth = Math.max(s.depth, 0.86);

      const reveal = easeOutCubic(clamp((s.depth - 0.18) / 0.68, 0, 1));
      const tension = 1 - reveal;
      const boost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));
      cb.onStateChange?.(reveal);

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.72;
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
      const surface = lerpColor(accent, [255, 212, 170], 0.4);
      const abyss = lerpColor(primary, [150, 214, 255], 0.3);
      const hull = lerpColor(primary, [244, 247, 255], 0.86);
      const threat = lerpColor([8, 8, 14], accent, 0.12);
      const ember = lerpColor(accent, [255, 236, 210], 0.6);

      const upper = ctx.createLinearGradient(0, 0, 0, h * 0.35);
      upper.addColorStop(0, rgba(surface, Math.min(0.14, (0.04 + tension * 0.08) * entrance * boost)));
      upper.addColorStop(1, rgba(surface, 0));
      ctx.fillStyle = upper;
      ctx.fillRect(0, 0, w, h * 0.35);

      const lower = ctx.createLinearGradient(0, h * 0.18, 0, h);
      lower.addColorStop(0, rgba(abyss, Math.min(0.06, (0.02 + reveal * 0.04) * entrance * boost)));
      lower.addColorStop(1, rgba(abyss, Math.min(0.2, (0.05 + reveal * 0.14) * entrance * boost)));
      ctx.fillStyle = lower;
      ctx.fillRect(0, h * 0.18, w, h * 0.82);

      const nodeX = cx;
      const nodeY = h * s.depth;
      const compress = 1 - reveal * 0.18;
      const sphereR = minDim * 0.085;
      const shellGlow = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, minDim * 0.2);
      shellGlow.addColorStop(0, rgba(hull, Math.min(0.22, (0.05 + reveal * 0.12 + s.revealFlash * 0.04) * entrance * boost)));
      shellGlow.addColorStop(1, rgba(hull, 0));
      ctx.fillStyle = shellGlow;
      ctx.fillRect(nodeX - minDim * 0.2, nodeY - minDim * 0.2, minDim * 0.4, minDim * 0.4);

      ctx.beginPath();
      ctx.ellipse(nodeX, nodeY, sphereR, sphereR * compress * (1 + breathAmplitude * 0.015), 0, 0, Math.PI * 2);
      ctx.fillStyle = rgba(threat, Math.min(0.88, (0.22 + reveal * 0.24) * entrance * boost));
      ctx.fill();
      ctx.lineWidth = px(0.008, minDim);
      ctx.strokeStyle = rgba(hull, Math.min(0.94, (0.18 + reveal * 0.52) * entrance * boost));
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(nodeX, nodeY, sphereR * 0.34, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(ember, Math.min(0.44, (0.1 + reveal * 0.18) * entrance * boost));
      ctx.lineWidth = px(0.004, minDim);
      ctx.stroke();

      for (let i = 0; i < 5; i++) {
        const r = minDim * (0.14 + i * 0.075);
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, r, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(hull, Math.min(0.12, (0.02 + reveal * 0.08) * entrance * boost * (1 - i * 0.16)));
        ctx.lineWidth = px(0.002, minDim);
        ctx.stroke();
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, minDim * 0.5);
        flash.addColorStop(0, rgba(hull, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.62) * entrance));
        flash.addColorStop(1, rgba(hull, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(nodeX - minDim * 0.5, nodeY - minDim * 0.5, minDim * 1, minDim * 1);
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
      const s = stateRef.current;
      const p = getPoint(e);
      const node = { x: viewport.width * 0.5, y: viewport.height * s.depth };
      if (Math.hypot(p.x - node.x, p.y - node.y) < Math.min(viewport.width, viewport.height) * 0.12) {
        s.dragging = true;
        canvas.setPointerCapture(e.pointerId);
        callbacksRef.current.onHaptic('drag_snap');
        callbacksRef.current.onHaptic('hold_start');
      }
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const p = getPoint(e);
      s.depth = clamp(p.y / viewport.height, 0.18, 0.86);
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
