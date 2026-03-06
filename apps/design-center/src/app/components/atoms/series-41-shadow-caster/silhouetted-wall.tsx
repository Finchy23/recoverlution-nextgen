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

const NODE_START = { x: 0.16, y: 0.68 };
const NODE_END = { x: 0.84, y: 0.68 };
const WALL_X = 0.52;
const WALL_W = 0.22;
const HIT_R = 0.09;
const COMPLETE_T = 0.965;
const FLASH_DECAY = 0.026;

export default function SilhouettedWallAtom({
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

      if (p.phase === 'resolve' && !s.dragging) {
        s.progress += (1 - s.progress) * 0.08;
      }

      const reveal = easeOutCubic(clamp(s.progress, 0, 1));
      const nodeX = mix(NODE_START.x * w, NODE_END.x * w, reveal);
      const nodeY = mix(NODE_START.y * h, NODE_END.y * h, reveal);
      const wallX = WALL_X * w;
      const wallW = px(WALL_W, minDim);
      const wallLeft = wallX - wallW / 2;
      const wallRight = wallX + wallW / 2;
      const insideWall = nodeX > wallLeft && nodeX < wallRight;
      const afterWall = nodeX >= wallRight;
      const stageBoost = p.composed ? 1.18 : 1;
      const opacityMass = 1 - reveal;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.65 : 1));
      cb.onStateChange?.(reveal);

      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        s.revealFlash = 1;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const field = lerpColor(primary, accent, 0.22);
      const nodeColor = lerpColor(primary, [245, 248, 255], 0.92);
      const wallColor = lerpColor([4, 4, 7], primary, 0.04);
      const wallEdge = lerpColor(accent, [220, 230, 255], 0.35);
      const safeGlow = lerpColor(primary, [234, 242, 255], 0.86);

      const stage = ctx.createRadialGradient(cx, nodeY, 0, cx, nodeY, minDim * 0.72);
      stage.addColorStop(0, rgba(field, Math.min(0.16, (0.04 + opacityMass * 0.06 + reveal * 0.05) * entrance * stageBoost)));
      stage.addColorStop(0.62, rgba(field, Math.min(0.08, (0.018 + opacityMass * 0.03) * entrance * stageBoost)));
      stage.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const corridor = ctx.createLinearGradient(0, 0, w, 0);
      corridor.addColorStop(0, rgba(wallColor, Math.min(0.16, (0.03 + opacityMass * 0.05) * entrance * stageBoost)));
      corridor.addColorStop(0.46, rgba(wallColor, Math.min(0.24, (0.08 + opacityMass * 0.14) * entrance * stageBoost)));
      corridor.addColorStop(0.54, rgba(wallColor, Math.min(0.26, (0.1 + opacityMass * 0.16) * entrance * stageBoost)));
      corridor.addColorStop(1, rgba(wallColor, Math.min(0.12, (0.03 + opacityMass * 0.04) * entrance * stageBoost)));
      ctx.fillStyle = corridor;
      ctx.fillRect(0, 0, w, h);

      const barrierGrad = ctx.createLinearGradient(wallLeft, 0, wallRight, 0);
      barrierGrad.addColorStop(0, rgba(wallEdge, Math.min(0.08, (0.03 + opacityMass * 0.03) * entrance * stageBoost)));
      barrierGrad.addColorStop(0.1, rgba(wallColor, Math.min(0.62, (0.16 + opacityMass * 0.34) * entrance * stageBoost)));
      barrierGrad.addColorStop(0.5, rgba(wallColor, Math.min(0.78, (0.26 + opacityMass * 0.42) * entrance * stageBoost)));
      barrierGrad.addColorStop(0.9, rgba(wallColor, Math.min(0.62, (0.16 + opacityMass * 0.34) * entrance * stageBoost)));
      barrierGrad.addColorStop(1, rgba(wallEdge, Math.min(0.08, (0.03 + opacityMass * 0.03) * entrance * stageBoost)));
      ctx.fillStyle = barrierGrad;
      ctx.fillRect(wallLeft, px(0.14, minDim), wallW, h - px(0.28, minDim));

      ctx.fillStyle = rgba(wallEdge, Math.min(0.18, (0.06 + (insideWall ? 0.1 : 0)) * entrance * stageBoost));
      ctx.fillRect(wallLeft - px(0.004, minDim), px(0.14, minDim), px(0.003, minDim), h - px(0.28, minDim));
      ctx.fillRect(wallRight + px(0.001, minDim), px(0.14, minDim), px(0.003, minDim), h - px(0.28, minDim));

      if (insideWall || afterWall) {
        const breachAlpha = insideWall ? 0.18 : 0.1;
        const breach = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, minDim * 0.22);
        breach.addColorStop(0, rgba(safeGlow, breachAlpha * entrance * stageBoost));
        breach.addColorStop(1, rgba(safeGlow, 0));
        ctx.fillStyle = breach;
        ctx.fillRect(nodeX - minDim * 0.24, nodeY - minDim * 0.24, minDim * 0.48, minDim * 0.48);
      }

      ctx.beginPath();
      ctx.moveTo(NODE_START.x * w, nodeY);
      ctx.lineTo(NODE_END.x * w, nodeY);
      ctx.strokeStyle = rgba(safeGlow, Math.min(0.1, (0.03 + reveal * 0.04) * entrance * stageBoost));
      ctx.lineWidth = px(0.001, minDim);
      ctx.stroke();

      const pulse = 0.5 + 0.5 * Math.sin(s.frameCount * 0.04 * ms);
      const nodeR = px(0.036 + breathAmplitude * 0.004 * ms, minDim);
      const nodeGlow = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, nodeR * 3.6);
      nodeGlow.addColorStop(0, rgba(nodeColor, Math.min(0.42, (0.16 + pulse * 0.06 + s.revealFlash * 0.1) * entrance * stageBoost)));
      nodeGlow.addColorStop(1, rgba(nodeColor, 0));
      ctx.fillStyle = nodeGlow;
      ctx.fillRect(nodeX - nodeR * 4, nodeY - nodeR * 4, nodeR * 8, nodeR * 8);
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(nodeColor, Math.min(0.96, (0.36 + reveal * 0.42) * entrance * stageBoost));
      ctx.fill();
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, nodeR * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = rgba([255, 253, 248], Math.min(1, (0.72 + reveal * 0.18) * entrance * stageBoost));
      ctx.fill();

      if (insideWall) {
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, nodeR * 1.8, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(safeGlow, Math.min(0.14, (0.06 + pulse * 0.04) * entrance * stageBoost));
        ctx.lineWidth = px(0.0011, minDim);
        ctx.stroke();
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flashAlpha = (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.6) * entrance;
        const corona = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, minDim * 0.24);
        corona.addColorStop(0, rgba(safeGlow, flashAlpha));
        corona.addColorStop(1, rgba(safeGlow, 0));
        ctx.fillStyle = corona;
        ctx.fillRect(nodeX - minDim * 0.24, nodeY - minDim * 0.24, minDim * 0.48, minDim * 0.48);
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
      const nodeX = mix(NODE_START.x * viewport.width, NODE_END.x * viewport.width, s.progress);
      const nodeY = mix(NODE_START.y * viewport.height, NODE_END.y * viewport.height, s.progress);
      const hit = Math.min(viewport.width, viewport.height) * HIT_R;
      if (Math.hypot(p.x - nodeX, p.y - nodeY) > hit) return;
      s.dragging = true;
      callbacksRef.current.onHaptic('hold_start');
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const p = getPoint(e);
      s.progress = clamp((p.x / viewport.width - NODE_START.x) / (NODE_END.x - NODE_START.x), 0, 1);
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
