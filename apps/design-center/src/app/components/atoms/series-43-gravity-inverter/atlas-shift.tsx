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
const STEP_T = 0.54;
const COMPLETE_T = 0.965;
const SUPPORT_ZONE = 0.11;
const PINCH_SPAN = 0.34;

type Point = { x: number; y: number };

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export default function AtlasShiftAtom({
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
    anchorPointerId: null as number | null,
    pointers: {} as Record<number, Point>,
    holdCharge: 0,
    pinchBaseline: 0,
    targetReveal: 0,
    reveal: 0,
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

    const getSupportPoint = () => ({
      x: viewport.width * 0.5,
      y: viewport.height * 0.82,
    });

    const getPointerList = (s: typeof stateRef.current) =>
      Object.values(s.pointers).filter(Boolean);

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

      const pointers = getPointerList(s);
      if (s.holding && !s.completionFired) {
        s.holdCharge = Math.min(1, s.holdCharge + 0.016 * ms);
      } else {
        s.holdCharge = Math.max(0, s.holdCharge - 0.02 * ms);
      }

      if (pointers.length >= 2 && s.holding) {
        const pinchDistance = distance(pointers[0], pointers[1]);
        if (s.pinchBaseline === 0) s.pinchBaseline = pinchDistance;
        const pinchProgress = clamp((pinchDistance - s.pinchBaseline) / (minDim * PINCH_SPAN), 0, 1);
        s.targetReveal = Math.max(s.targetReveal, pinchProgress);
      } else {
        s.pinchBaseline = 0;
      }

      if (p.phase === 'resolve') s.targetReveal = 1;
      s.reveal += (Math.max(s.targetReveal, s.holdCharge * 0.18) - s.reveal) * 0.12 * ms;

      const reveal = easeOutCubic(clamp(s.reveal, 0, 1));
      const burden = 1 - reveal;
      const boost = p.composed ? 1.2 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));
      cb.onStateChange?.(reveal);

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.74;
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
      const dense = lerpColor([4, 5, 10], primary, 0.08);
      const titan = lerpColor(primary, [244, 247, 255], 0.88);
      const ember = lerpColor(accent, [255, 236, 210], 0.62);

      const stage = ctx.createRadialGradient(cx, cy + minDim * 0.04, 0, cx, cy + minDim * 0.04, minDim * 0.96);
      stage.addColorStop(0, rgba(field, Math.min(0.18, (0.05 + burden * 0.08 + reveal * 0.05) * entrance * boost)));
      stage.addColorStop(0.62, rgba(field, Math.min(0.08, (0.02 + burden * 0.03) * entrance * boost)));
      stage.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const strain = ctx.createLinearGradient(0, 0, 0, h);
      strain.addColorStop(0, rgba(threat, Math.min(0.36, (0.1 + burden * 0.18) * entrance * boost)));
      strain.addColorStop(0.55, rgba(dense, Math.min(0.16, (0.04 + burden * 0.08) * entrance * boost)));
      strain.addColorStop(1, rgba(dense, 0));
      ctx.fillStyle = strain;
      ctx.fillRect(0, 0, w, h);

      const supportX = cx;
      const supportY = h * 0.82;
      const worldY = h * (0.04 + reveal * 0.28);
      const worldR = minDim * (0.56 - reveal * 0.18);
      const pillarTopY = supportY - minDim * (0.06 + reveal * 0.27);
      const pillarWidth = minDim * (0.028 + reveal * 0.05);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI * reveal);
      const frameAlpha = Math.min(0.18, (0.04 + reveal * 0.12) * entrance * boost);
      for (let i = 0; i < 3; i++) {
        const r = minDim * (0.22 + i * 0.11);
        ctx.beginPath();
        ctx.arc(0, minDim * 0.06, r, Math.PI * 0.12, Math.PI * 0.88);
        ctx.strokeStyle = rgba(titan, frameAlpha * (1 - i * 0.2));
        ctx.lineWidth = px(0.003, minDim);
        ctx.stroke();
      }
      ctx.restore();

      const worldGradient = ctx.createRadialGradient(cx, worldY - worldR * 0.2, 0, cx, worldY, worldR);
      worldGradient.addColorStop(0, rgba(ember, Math.min(0.2, (0.04 + reveal * 0.08) * entrance * boost)));
      worldGradient.addColorStop(0.48, rgba(lerpColor(threat, field, reveal), Math.min(0.82, (0.24 + burden * 0.3 + reveal * 0.22) * entrance * boost)));
      worldGradient.addColorStop(1, rgba(dense, Math.min(0.96, (0.36 + burden * 0.34) * entrance * boost)));
      ctx.beginPath();
      ctx.arc(cx, worldY, worldR, 0, Math.PI * 2);
      ctx.fillStyle = worldGradient;
      ctx.fill();

      const worldHalo = ctx.createRadialGradient(cx, worldY, 0, cx, worldY, worldR * 1.22);
      worldHalo.addColorStop(0, rgba(titan, Math.min(0.18, (0.03 + reveal * 0.1 + s.revealFlash * 0.03) * entrance * boost)));
      worldHalo.addColorStop(1, rgba(titan, 0));
      ctx.fillStyle = worldHalo;
      ctx.fillRect(cx - worldR * 1.22, worldY - worldR * 1.22, worldR * 2.44, worldR * 2.44);

      if (reveal > 0.08) {
        ctx.strokeStyle = rgba(titan, Math.min(0.22, (0.04 + reveal * 0.14) * entrance * boost));
        ctx.lineWidth = px(0.0022, minDim);
        for (let i = -2; i <= 2; i++) {
          const latR = worldR * (0.24 + Math.abs(i) * 0.12);
          ctx.beginPath();
          ctx.ellipse(cx, worldY + i * worldR * 0.12, worldR * 0.82, latR * 0.18, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.ellipse(cx + i * worldR * 0.14, worldY, worldR * 0.12, worldR * 0.82, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      const capY = worldY + worldR * (0.86 - reveal * 0.56);
      const capW = minDim * (0.34 - reveal * 0.08);
      const capH = minDim * (0.05 + burden * 0.04);
      ctx.beginPath();
      ctx.roundRect(cx - capW * 0.5, capY - capH * 0.5, capW, capH, capH * 0.5);
      ctx.fillStyle = rgba(threat, Math.min(0.84, (0.18 + burden * 0.42) * entrance * boost));
      ctx.fill();

      const pillarGradient = ctx.createLinearGradient(0, supportY, 0, pillarTopY);
      pillarGradient.addColorStop(0, rgba(titan, Math.min(0.82, (0.18 + reveal * 0.42) * entrance * boost)));
      pillarGradient.addColorStop(1, rgba(ember, Math.min(0.92, (0.18 + reveal * 0.52) * entrance * boost)));
      ctx.beginPath();
      ctx.moveTo(supportX - pillarWidth * 0.6, supportY);
      ctx.lineTo(supportX + pillarWidth * 0.6, supportY);
      ctx.lineTo(supportX + pillarWidth * 0.34, pillarTopY);
      ctx.lineTo(supportX - pillarWidth * 0.34, pillarTopY);
      ctx.closePath();
      ctx.fillStyle = pillarGradient;
      ctx.fill();

      const supportGlow = ctx.createRadialGradient(supportX, supportY, 0, supportX, supportY, px(0.18, minDim));
      supportGlow.addColorStop(0, rgba(titan, Math.min(0.24, (0.06 + reveal * 0.12 + s.revealFlash * 0.04) * entrance * boost)));
      supportGlow.addColorStop(1, rgba(titan, 0));
      ctx.fillStyle = supportGlow;
      ctx.fillRect(supportX - minDim * 0.18, supportY - minDim * 0.18, minDim * 0.36, minDim * 0.36);
      ctx.beginPath();
      ctx.arc(supportX, supportY, px(0.028, minDim) * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(titan, Math.min(0.98, (0.24 + reveal * 0.46 + burden * 0.08) * entrance * boost));
      ctx.fill();

      const guideOpacity = Math.min(0.22, (0.05 + s.holdCharge * 0.12 + reveal * 0.06) * entrance * boost);
      for (const dir of [-1, 1]) {
        const guideX = supportX + dir * minDim * (0.12 + reveal * 0.12);
        ctx.beginPath();
        ctx.moveTo(guideX, supportY - minDim * 0.02);
        ctx.lineTo(guideX + dir * minDim * 0.06, supportY - minDim * 0.08);
        ctx.strokeStyle = rgba(ember, guideOpacity);
        ctx.lineWidth = px(0.004, minDim);
        ctx.stroke();
      }

      if (pointers.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(pointers[0].x, pointers[0].y);
        ctx.lineTo(pointers[1].x, pointers[1].y);
        ctx.strokeStyle = rgba(titan, Math.min(0.18, (0.04 + reveal * 0.12) * entrance * boost));
        ctx.lineWidth = px(0.003, minDim);
        ctx.stroke();
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, worldY, 0, cx, worldY, minDim * 0.62);
        flash.addColorStop(0, rgba(titan, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.64) * entrance));
        flash.addColorStop(1, rgba(titan, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.62, worldY - minDim * 0.62, minDim * 1.24, minDim * 1.24);
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

    const isSupportHit = (point: Point) => {
      const support = getSupportPoint();
      return Math.hypot(point.x - support.x, point.y - support.y) < Math.min(viewport.width, viewport.height) * SUPPORT_ZONE;
    };

    const onDown = (e: PointerEvent) => {
      const point = getPoint(e);
      const s = stateRef.current;
      s.pointers[e.pointerId] = point;
      canvas.setPointerCapture(e.pointerId);

      if (!s.holding && isSupportHit(point)) {
        s.holding = true;
        s.anchorPointerId = e.pointerId;
        callbacksRef.current.onHaptic('hold_start');
      }
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!(e.pointerId in s.pointers)) return;
      s.pointers[e.pointerId] = getPoint(e);
    };

    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      delete s.pointers[e.pointerId];
      if (s.anchorPointerId === e.pointerId) {
        s.holding = false;
        s.anchorPointerId = null;
      }
      if (Object.keys(s.pointers).length < 2) {
        s.pinchBaseline = 0;
      }
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
