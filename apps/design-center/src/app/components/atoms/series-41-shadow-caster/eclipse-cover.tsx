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
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const SELF_START = { x: 0.26, y: 0.76 };
const THREAT = { x: 0.66, y: 0.28 };
const HIT_R = 0.11;
const SNAP_T = 0.72;
const COMPLETE_T = 0.965;
const FLASH_DECAY = 0.024;

export default function EclipseCoverAtom({
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
    progress: 0,
    dragging: false,
    snapped: false,
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

      if (p.phase === 'resolve' && !s.dragging) s.progress += (1 - s.progress) * 0.08;

      const reveal = easeOutCubic(clamp(s.progress, 0, 1));
      const selfX = mix(SELF_START.x * w, THREAT.x * w, reveal);
      const selfY = mix(SELF_START.y * h, THREAT.y * h, reveal);
      const threatX = THREAT.x * w;
      const threatY = THREAT.y * h;
      const stageBoost = p.composed ? 1.18 : 1;
      const mass = reveal;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.65 : 1));
      cb.onStateChange?.(reveal);

      if (reveal >= SNAP_T && !s.snapped) {
        s.snapped = true;
        callbacksRef.current.onHaptic('drag_snap');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        s.revealFlash = 1;
        callbacksRef.current.onHaptic('completion');
        callbacksRef.current.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const field = lerpColor(primary, accent, 0.24);
      const threatColor = lerpColor(accent, [255, 232, 198], 0.46);
      const coronaColor = lerpColor(primary, [240, 246, 255], 0.92);
      const selfCore = lerpColor(primary, [250, 252, 255], 0.72);
      const selfEdge = lerpColor(accent, [224, 234, 255], 0.42);

      const stage = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.74);
      stage.addColorStop(0, rgba(field, Math.min(0.16, (0.04 + mass * 0.07) * entrance * stageBoost)));
      stage.addColorStop(0.62, rgba(field, Math.min(0.08, (0.02 + mass * 0.03) * entrance * stageBoost)));
      stage.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const sky = ctx.createRadialGradient(threatX, threatY, 0, threatX, threatY, minDim * 0.82);
      sky.addColorStop(0, rgba(threatColor, Math.min(0.12, (0.04 + (1 - mass) * 0.04) * entrance * stageBoost)));
      sky.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      const threatR = px(0.1, minDim);
      const threatGlow = ctx.createRadialGradient(threatX, threatY, 0, threatX, threatY, threatR * 3.6);
      threatGlow.addColorStop(0, rgba(threatColor, Math.min(0.52, (0.22 + (1 - mass) * 0.26) * entrance * stageBoost)));
      threatGlow.addColorStop(0.5, rgba(threatColor, Math.min(0.18, (0.08 + (1 - mass) * 0.08) * entrance * stageBoost)));
      threatGlow.addColorStop(1, rgba(threatColor, 0));
      ctx.fillStyle = threatGlow;
      ctx.fillRect(threatX - threatR * 4, threatY - threatR * 4, threatR * 8, threatR * 8);

      const eclipseCover = Math.max(0, (reveal - 0.52) / 0.48);
      ctx.beginPath();
      ctx.arc(threatX, threatY, threatR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(threatColor, Math.min(0.98, (0.48 + (1 - eclipseCover) * 0.4) * entrance * stageBoost));
      ctx.fill();

      const selfR = px(mix(0.048, 0.12, reveal) + breathAmplitude * 0.004 * ms, minDim);
      const selfGlow = ctx.createRadialGradient(selfX, selfY, 0, selfX, selfY, selfR * 3.4);
      selfGlow.addColorStop(0, rgba(coronaColor, Math.min(0.22, (0.06 + mass * 0.14 + s.revealFlash * 0.08) * entrance * stageBoost)));
      selfGlow.addColorStop(1, rgba(coronaColor, 0));
      ctx.fillStyle = selfGlow;
      ctx.fillRect(selfX - selfR * 4, selfY - selfR * 4, selfR * 8, selfR * 8);

      ctx.beginPath();
      ctx.arc(selfX, selfY, selfR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(selfCore, Math.min(0.96, (0.22 + mass * 0.72) * entrance * stageBoost));
      ctx.fill();

      ctx.beginPath();
      ctx.arc(selfX, selfY, selfR * 1.18, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(selfEdge, Math.min(0.26, (0.08 + mass * 0.12) * entrance * stageBoost));
      ctx.lineWidth = px(0.0014, minDim);
      ctx.stroke();

      if (reveal > 0.7) {
        const totality = Math.max(0, (reveal - 0.7) / 0.3);
        const ringR = selfR * (1.05 + totality * 0.12);
        ctx.beginPath();
        ctx.arc(selfX, selfY, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(coronaColor, Math.min(0.44, (0.16 + totality * 0.22 + s.revealFlash * 0.08) * entrance * stageBoost));
        ctx.lineWidth = px(0.004 + totality * 0.002, minDim);
        ctx.stroke();
      }

      if (reveal > 0.2) {
        ctx.beginPath();
        ctx.moveTo(SELF_START.x * w, SELF_START.y * h);
        ctx.quadraticCurveTo(cx, h * 0.58, threatX, threatY);
        ctx.strokeStyle = rgba(coronaColor, Math.min(0.1, (0.03 + reveal * 0.05) * entrance * stageBoost));
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flashAlpha = (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.6) * entrance;
        const flash = ctx.createRadialGradient(threatX, threatY, 0, threatX, threatY, minDim * 0.28);
        flash.addColorStop(0, rgba(coronaColor, flashAlpha));
        flash.addColorStop(1, rgba(coronaColor, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(threatX - minDim * 0.28, threatY - minDim * 0.28, minDim * 0.56, minDim * 0.56);
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
      const s = stateRef.current;
      const p = getPoint(e);
      const selfX = mix(SELF_START.x * viewport.width, THREAT.x * viewport.width, s.progress);
      const selfY = mix(SELF_START.y * viewport.height, THREAT.y * viewport.height, s.progress);
      const hit = Math.min(viewport.width, viewport.height) * HIT_R;
      if (Math.hypot(p.x - selfX, p.y - selfY) > hit) return;
      s.dragging = true;
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const p = getPoint(e);
      const nx = clamp((p.x / viewport.width - SELF_START.x) / (THREAT.x - SELF_START.x), 0, 1);
      const ny = clamp((SELF_START.y - p.y / viewport.height) / (SELF_START.y - THREAT.y), 0, 1);
      s.progress = clamp(nx * 0.5 + ny * 0.68, 0, 1);
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
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }}
      />
    </div>
  );
}
