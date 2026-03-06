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
const FLASH_DECAY = 0.022;
const STEP_T = 0.56;
const COMPLETE_T = 0.965;
const SLAB_HEIGHT = 0.22;
const NODE_R = 0.026;
const FALLBACK_PULL = 220;

function floorQuad(cx: number, y: number, w: number, h: number, depth: number): [number, number][] {
  return [
    [cx - w * 0.38, y],
    [cx + w * 0.38, y],
    [cx + w * 0.5, y + h * depth],
    [cx - w * 0.5, y + h * depth],
  ];
}

function fillPath(ctx: CanvasRenderingContext2D, points: [number, number][], color: RGB, alpha: number) {
  if (alpha <= 0) return;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = rgba(color, alpha);
  ctx.fill();
}

export default function ParadigmFlipAtom({
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
    flipProgress: 0,
    dragging: false,
    startY: 0,
    startProgress: 0,
    holdStarted: false,
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
      if (p.phase === 'resolve' && !s.dragging) s.flipProgress += (1 - s.flipProgress) * 0.08;

      const reveal = easeOutCubic(clamp(s.flipProgress, 0, 1));
      const burden = 1 - reveal;
      const boost = p.composed ? 1.2 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));
      cb.onStateChange?.(reveal);

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.75;
        cb.onHaptic('hold_threshold');
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
      const threat = lerpColor([8, 8, 14], accent, 0.16);
      const dense = lerpColor([5, 6, 10], primary, 0.08);
      const floorColor = lerpColor(primary, [244, 247, 255], 0.82);
      const ember = lerpColor(accent, [255, 236, 210], 0.6);

      const stage = ctx.createRadialGradient(cx, cy + minDim * 0.08, 0, cx, cy + minDim * 0.08, minDim * 0.9);
      stage.addColorStop(0, rgba(field, Math.min(0.16, (0.05 + burden * 0.07 + reveal * 0.04) * entrance * boost)));
      stage.addColorStop(0.6, rgba(field, Math.min(0.08, (0.02 + burden * 0.03) * entrance * boost)));
      stage.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const dread = ctx.createLinearGradient(0, 0, 0, h);
      dread.addColorStop(0, rgba(threat, Math.min(0.34, (0.1 + burden * 0.18) * entrance * boost)));
      dread.addColorStop(0.5, rgba(dense, Math.min(0.16, (0.05 + burden * 0.08) * entrance * boost)));
      dread.addColorStop(1, rgba(dense, 0));
      ctx.fillStyle = dread;
      ctx.fillRect(0, 0, w, h);

      const slabH = h * SLAB_HEIGHT;
      const slabTop = -slabH * (0.04 + reveal * 0.02);
      const slabY = slabTop + (h * 0.84 - slabTop) * reveal;
      const slabDepth = 0.055 + reveal * 0.05;
      const topWidth = w * (0.92 - reveal * 0.22);
      const bottomWidth = w * (0.98 - reveal * 0.02);

      const topFace: [number, number][] = reveal < 0.995
        ? [
            [cx - topWidth * 0.5, slabY],
            [cx + topWidth * 0.5, slabY],
            [cx + bottomWidth * 0.5, slabY + slabH],
            [cx - bottomWidth * 0.5, slabY + slabH],
          ]
        : floorQuad(cx, slabY, w, h, slabDepth);
      fillPath(ctx, topFace, threat, Math.min(0.82, (0.28 + burden * 0.4 + reveal * 0.1) * entrance * boost));

      const slabGlow = ctx.createLinearGradient(0, slabY, 0, slabY + slabH + minDim * 0.2);
      slabGlow.addColorStop(0, rgba(ember, Math.min(0.14, (0.04 + reveal * 0.08) * entrance * boost)));
      slabGlow.addColorStop(1, rgba(ember, 0));
      ctx.fillStyle = slabGlow;
      ctx.fillRect(cx - bottomWidth * 0.55, slabY - minDim * 0.04, bottomWidth * 1.1, slabH + minDim * 0.24);

      if (reveal > 0.18) {
        const floor = floorQuad(cx, slabY, w, h, slabDepth);
        fillPath(ctx, floor, floorColor, Math.min(0.24, (0.04 + reveal * 0.18) * entrance * boost));
      }

      const nodeX = cx;
      const nodeStartY = h * 0.84;
      const nodeTargetY = slabY - minDim * 0.03;
      const nodeY = nodeStartY + (nodeTargetY - nodeStartY) * reveal;
      const nodeR = px(NODE_R, minDim) * (1 + breathAmplitude * 0.02);

      const nodeGlow = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, px(0.15, minDim));
      nodeGlow.addColorStop(0, rgba(floorColor, Math.min(0.24, (0.06 + reveal * 0.12 + s.revealFlash * 0.04) * entrance * boost)));
      nodeGlow.addColorStop(1, rgba(floorColor, 0));
      ctx.fillStyle = nodeGlow;
      ctx.fillRect(nodeX - minDim * 0.16, nodeY - minDim * 0.16, minDim * 0.32, minDim * 0.32);
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(floorColor, Math.min(0.96, (0.26 + burden * 0.22 + reveal * 0.46) * entrance * boost));
      ctx.fill();

      if (burden > 0.04) {
        for (let i = 0; i < 7; i++) {
          const t = i / 6;
          const y = nodeY - minDim * (0.03 + t * 0.07);
          const width = minDim * (0.04 + (1 - t) * 0.09 * burden);
          ctx.beginPath();
          ctx.moveTo(nodeX - width, y);
          ctx.lineTo(nodeX + width, y);
          ctx.strokeStyle = rgba(accent, Math.min(0.18, (0.03 + burden * 0.12) * entrance * boost * (1 - t * 0.12)));
          ctx.lineWidth = px(0.0018, minDim);
          ctx.stroke();
        }
      }

      if (reveal > 0.06) {
        const guide = ctx.createLinearGradient(cx, h * 0.18, cx, h * 0.82);
        guide.addColorStop(0, rgba(floorColor, 0));
        guide.addColorStop(0.5, rgba(floorColor, Math.min(0.14, (0.03 + reveal * 0.1) * entrance * boost)));
        guide.addColorStop(1, rgba(floorColor, 0));
        ctx.strokeStyle = guide;
        ctx.lineWidth = px(0.0022, minDim);
        ctx.beginPath();
        ctx.moveTo(cx, h * 0.18);
        ctx.lineTo(cx, h * 0.82);
        ctx.stroke();
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, slabY + slabH * 0.2, 0, cx, slabY + slabH * 0.2, minDim * 0.52);
        flash.addColorStop(0, rgba(floorColor, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.62) * entrance));
        flash.addColorStop(1, rgba(floorColor, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.52, slabY - minDim * 0.2, minDim * 1.04, minDim * 1.04);
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
      const s = stateRef.current;
      if (p.y < viewport.height * 0.28 || s.completionFired) return;
      s.dragging = true;
      s.startY = p.y;
      s.startProgress = s.flipProgress;
      if (!s.holdStarted) {
        s.holdStarted = true;
        callbacksRef.current.onHaptic('hold_start');
      }
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const p = getPoint(e);
      const delta = (s.startY - p.y) / FALLBACK_PULL;
      s.flipProgress = clamp(s.startProgress + delta, 0, 1);
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.dragging = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    const readOrientation = () => {
      const angle = typeof window !== 'undefined' && 'screen' in window && window.screen.orientation
        ? window.screen.orientation.angle
        : 0;
      const s = stateRef.current;
      if (!s.dragging) {
        const target = angle === 180 ? 1 : 0;
        s.flipProgress += (target - s.flipProgress) * 0.08;
      }
    };

    const orientationHandler = () => {
      readOrientation();
      if (!stateRef.current.holdStarted) {
        stateRef.current.holdStarted = true;
        callbacksRef.current.onHaptic('hold_start');
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('orientationchange', orientationHandler);
      if (window.screen?.orientation?.addEventListener) {
        window.screen.orientation.addEventListener('change', orientationHandler);
      }
    }

    return () => {
      window.cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      if (typeof window !== 'undefined') {
        window.removeEventListener('orientationchange', orientationHandler);
        if (window.screen?.orientation?.removeEventListener) {
          window.screen.orientation.removeEventListener('change', orientationHandler);
        }
      }
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
