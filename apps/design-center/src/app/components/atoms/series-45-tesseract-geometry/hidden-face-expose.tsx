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
const HOLD_LOCK_MS = 520;

type Point = { x: number; y: number };

export default function HiddenFaceExposeAtom({
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
    pointers: {} as Record<number, Point>,
    lockCandidateStart: 0,
    locked: false,
    lockFlash: 0,
    targetExpose: 0,
    expose: 0,
    rotation: 0.72,
    dragPointerId: -1,
    lastDragX: 0,
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
      if (p.phase === 'resolve') {
        s.locked = true;
        s.targetExpose = 1;
      }

      const pointerCount = Object.keys(s.pointers).length;
      if (!s.locked) {
        if (pointerCount >= 2) {
          s.locked = true;
          s.lockFlash = 1;
          cb.onHaptic('hold_start');
        } else if (pointerCount === 1 && s.lockCandidateStart > 0) {
          const heldMs = performance.now() - s.lockCandidateStart;
          if (heldMs >= HOLD_LOCK_MS) {
            s.locked = true;
            s.lockFlash = 1;
            cb.onHaptic('hold_start');
          }
        }
      }

      s.lockFlash = Math.max(0, s.lockFlash - 0.03 * (p.reducedMotion ? 0.7 : 1));
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));

      if (!s.locked) {
        const evade = 0.01 + (1 - s.expose) * 0.02;
        s.rotation += evade * ms;
        if (s.rotation > 1.36) s.rotation = 0.64;
      } else {
        s.rotation += (0.18 - s.rotation) * 0.12 * ms;
      }

      s.expose += (s.targetExpose - s.expose) * 0.12 * ms;
      const reveal = easeOutCubic(clamp(s.expose, 0, 1));
      const hidden = 1 - reveal;
      const boost = p.composed ? 1.18 : 1;
      cb.onStateChange?.(reveal);

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.72;
        cb.onHaptic('drag_snap');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        s.revealFlash = 1;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const field = lerpColor(primary, accent, 0.16);
      const dense = lerpColor([4, 5, 10], primary, 0.08);
      const face = lerpColor(primary, [246, 248, 255], 0.82);
      const edge = lerpColor(accent, [255, 244, 224], 0.74);
      const hiddenFace = lerpColor([10, 12, 18], primary, 0.16);
      const exposedFace = lerpColor(accent, [255, 247, 239], 0.88);

      const stage = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.96);
      stage.addColorStop(0, rgba(field, Math.min(0.15, (0.05 + reveal * 0.05) * entrance * boost)));
      stage.addColorStop(1, rgba(dense, Math.min(0.98, (0.28 + hidden * 0.22) * entrance * boost)));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const bodyW = minDim * 0.22;
      const bodyH = minDim * 0.28;
      const depth = minDim * (0.14 - reveal * 0.06);
      const angle = s.rotation;
      const frontAlpha = Math.min(0.8, (0.12 + reveal * 0.16 + hidden * 0.12) * entrance * boost);
      const sideAlpha = Math.min(0.68, (0.1 + hidden * 0.18 + reveal * 0.12) * entrance * boost);

      const dx = Math.cos(angle) * depth;
      const dy = -Math.sin(angle) * depth * 0.58;

      const front = [
        { x: cx - bodyW * 0.5, y: cy - bodyH * 0.5 },
        { x: cx + bodyW * 0.5, y: cy - bodyH * 0.5 },
        { x: cx + bodyW * 0.5, y: cy + bodyH * 0.5 },
        { x: cx - bodyW * 0.5, y: cy + bodyH * 0.5 },
      ];
      const back = front.map((p2) => ({ x: p2.x + dx, y: p2.y + dy }));

      const sideFill = ctx.createLinearGradient(back[1].x, back[1].y, front[1].x, front[1].y);
      sideFill.addColorStop(0, rgba(hiddenFace, Math.min(0.9, (0.18 + hidden * 0.28) * entrance * boost)));
      sideFill.addColorStop(1, rgba(exposedFace, Math.min(0.18, reveal * 0.1 * entrance * boost)));

      ctx.beginPath();
      ctx.moveTo(front[1].x, front[1].y);
      ctx.lineTo(back[1].x, back[1].y);
      ctx.lineTo(back[2].x, back[2].y);
      ctx.lineTo(front[2].x, front[2].y);
      ctx.closePath();
      ctx.fillStyle = sideFill;
      ctx.fill();
      ctx.strokeStyle = rgba(edge, sideAlpha);
      ctx.lineWidth = px(0.0042, minDim);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(front[0].x, front[0].y);
      ctx.lineTo(front[1].x, front[1].y);
      ctx.lineTo(front[2].x, front[2].y);
      ctx.lineTo(front[3].x, front[3].y);
      ctx.closePath();
      ctx.fillStyle = rgba(face, Math.min(0.18, (0.04 + reveal * 0.08) * entrance * boost));
      ctx.fill();
      ctx.strokeStyle = rgba(face, frontAlpha);
      ctx.lineWidth = px(0.0052, minDim);
      ctx.stroke();

      const hiddenLight = ctx.createRadialGradient(back[1].x, cy, 0, back[1].x, cy, minDim * 0.34);
      hiddenLight.addColorStop(0, rgba(exposedFace, Math.min(0.28, (0.02 + reveal * 0.24 + s.revealFlash * 0.05) * entrance * boost)));
      hiddenLight.addColorStop(1, rgba(exposedFace, 0));
      ctx.fillStyle = hiddenLight;
      ctx.fillRect(cx - minDim * 0.4, cy - minDim * 0.36, minDim * 0.8, minDim * 0.72);

      if (s.locked) {
        const lockRing = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.3);
        lockRing.addColorStop(0, rgba(edge, Math.min(0.1, (0.02 + s.lockFlash * 0.08) * entrance * boost)));
        lockRing.addColorStop(1, rgba(edge, 0));
        ctx.fillStyle = lockRing;
        ctx.fillRect(cx - minDim * 0.3, cy - minDim * 0.3, minDim * 0.6, minDim * 0.6);

        ctx.beginPath();
        ctx.arc(cx - bodyW * 0.42, cy, minDim * 0.018, 0, Math.PI * 2);
        ctx.arc(cx + bodyW * 0.42, cy, minDim * 0.018, 0, Math.PI * 2);
        ctx.fillStyle = rgba(edge, Math.min(0.74, (0.14 + reveal * 0.22 + s.lockFlash * 0.1) * entrance * boost));
        ctx.fill();
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(back[1].x, cy, 0, back[1].x, cy, minDim * 0.48);
        flash.addColorStop(0, rgba(exposedFace, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.64) * entrance));
        flash.addColorStop(1, rgba(exposedFace, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.48, cy - minDim * 0.48, minDim * 0.96, minDim * 0.96);
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
      stateRef.current.pointers[e.pointerId] = p;
      if (Object.keys(stateRef.current.pointers).length === 1) {
        stateRef.current.lockCandidateStart = performance.now();
        stateRef.current.dragPointerId = e.pointerId;
        stateRef.current.lastDragX = p.x;
      } else if (Object.keys(stateRef.current.pointers).length >= 3) {
        stateRef.current.dragPointerId = e.pointerId;
        stateRef.current.lastDragX = p.x;
      }
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!(e.pointerId in s.pointers)) return;
      const p = getPoint(e);
      s.pointers[e.pointerId] = p;
      if (!s.locked) return;
      const activePointers = Object.keys(s.pointers).length;
      if (e.pointerId === s.dragPointerId || activePointers >= 3) {
        const dx = p.x - s.lastDragX;
        s.lastDragX = p.x;
        s.targetExpose = clamp(s.targetExpose + dx / (viewport.width * 0.42), 0, 1);
      }
    };

    const onUp = (e: PointerEvent) => {
      delete stateRef.current.pointers[e.pointerId];
      if (stateRef.current.dragPointerId === e.pointerId) stateRef.current.dragPointerId = -1;
      if (Object.keys(stateRef.current.pointers).length === 0) stateRef.current.lockCandidateStart = 0;
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
