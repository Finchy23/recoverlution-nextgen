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
const STEP_T = 0.54;
const COMPLETE_T = 0.965;

type Point = { x: number; y: number };

export default function OuroborosPryAtom({
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
    grabbedHead: false,
    grabbedTail: false,
    headPointerId: -1,
    tailPointerId: -1,
    progress: 0,
    thresholdFired: false,
    completionFired: false,
    revealFlash: 0,
    errorCooldown: 0,
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
      if (p.phase === 'resolve' && (!s.grabbedHead || !s.grabbedTail)) {
        s.progress += (1 - s.progress) * 0.08;
      }
      if (s.errorCooldown > 0) s.errorCooldown--;

      const reveal = easeOutCubic(clamp(s.progress, 0, 1));
      const coil = 1 - reveal;
      const boost = p.composed ? 1.18 : 1;
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
      const field = lerpColor(primary, accent, 0.26);
      const threat = lerpColor([10, 9, 16], accent, 0.16);
      const dense = lerpColor([6, 7, 11], primary, 0.08);
      const clarity = lerpColor(primary, [244, 247, 255], 0.92);
      const ember = lerpColor(accent, [255, 235, 206], 0.62);

      const stage = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.78);
      stage.addColorStop(0, rgba(field, Math.min(0.18, (0.05 + coil * 0.08) * entrance * boost)));
      stage.addColorStop(0.62, rgba(field, Math.min(0.08, (0.02 + coil * 0.03) * entrance * boost)));
      stage.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const dread = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.92);
      dread.addColorStop(0, rgba(threat, Math.min(0.32, (0.1 + coil * 0.18) * entrance * boost)));
      dread.addColorStop(0.58, rgba(dense, Math.min(0.16, (0.05 + coil * 0.08) * entrance * boost)));
      dread.addColorStop(1, rgba(dense, 0));
      ctx.fillStyle = dread;
      ctx.fillRect(0, 0, w, h);

      const radius = minDim * 0.205;
      const openAngle = reveal * Math.PI * 0.9;
      const startAngle = -Math.PI * 0.38 + openAngle * 0.32;
      const endAngle = Math.PI * 1.62 - openAngle * 0.32;
      const headAngle = startAngle;
      const tailAngle = endAngle;

      const headX = cx + Math.cos(headAngle) * radius;
      const headY = cy + Math.sin(headAngle) * radius;
      const tailX = cx + Math.cos(tailAngle) * radius;
      const tailY = cy + Math.sin(tailAngle) * radius;

      const lineStartX = cx - minDim * 0.32;
      const lineEndX = cx + minDim * 0.32;
      const lineY = cy;

      const headTargetX = lineStartX;
      const headTargetY = lineY;
      const tailTargetX = lineEndX;
      const tailTargetY = lineY;

      const headDrawX = headX + (headTargetX - headX) * reveal;
      const headDrawY = headY + (headTargetY - headY) * reveal;
      const tailDrawX = tailX + (tailTargetX - tailX) * reveal;
      const tailDrawY = tailY + (tailTargetY - tailY) * reveal;

      const bodyGradient = ctx.createLinearGradient(headDrawX, headDrawY, tailDrawX, tailDrawY);
      bodyGradient.addColorStop(0, rgba(ember, Math.min(0.84, (0.28 + coil * 0.3 + reveal * 0.12) * entrance * boost)));
      bodyGradient.addColorStop(0.5, rgba(clarity, Math.min(0.3, (0.08 + reveal * 0.14) * entrance * boost)));
      bodyGradient.addColorStop(1, rgba(ember, Math.min(0.76, (0.24 + coil * 0.24 + reveal * 0.12) * entrance * boost)));

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = px(0.036, minDim);
      ctx.strokeStyle = bodyGradient;
      ctx.beginPath();
      if (reveal < 0.999) {
        const controlA1X = cx + radius * 0.92;
        const controlA1Y = cy - radius * 0.86;
        const controlA2X = cx + radius * 0.88;
        const controlA2Y = cy + radius * 0.92;
        const controlB1X = cx - radius * 0.9;
        const controlB1Y = cy + radius * 0.92;
        const controlB2X = cx - radius * 0.92;
        const controlB2Y = cy - radius * 0.84;
        ctx.moveTo(headDrawX, headDrawY);
        ctx.bezierCurveTo(
          controlA1X + (cx - controlA1X) * reveal,
          controlA1Y + (cy - controlA1Y) * reveal,
          controlA2X + (cx - controlA2X) * reveal,
          controlA2Y + (cy - controlA2Y) * reveal,
          tailDrawX,
          tailDrawY,
        );
        ctx.moveTo(tailDrawX, tailDrawY);
        ctx.bezierCurveTo(
          controlB1X + (cx - controlB1X) * reveal,
          controlB1Y + (cy - controlB1Y) * reveal,
          controlB2X + (cx - controlB2X) * reveal,
          controlB2Y + (cy - controlB2Y) * reveal,
          headDrawX,
          headDrawY,
        );
      } else {
        ctx.moveTo(lineStartX, lineY);
        ctx.lineTo(lineEndX, lineY);
      }
      ctx.stroke();

      ctx.lineWidth = px(0.011, minDim);
      ctx.strokeStyle = rgba(threat, Math.min(0.42, (0.16 + coil * 0.24) * entrance * boost));
      for (let i = 0; i < 18; i++) {
        const t = i / 17;
        const x = headDrawX + (tailDrawX - headDrawX) * t;
        const y = headDrawY + (tailDrawY - headDrawY) * t + Math.sin(t * Math.PI * 8 + s.frameCount * 0.04 * ms) * (1 - reveal) * minDim * 0.01;
        ctx.beginPath();
        ctx.moveTo(x - minDim * 0.008 * coil, y - minDim * 0.008 * coil);
        ctx.lineTo(x + minDim * 0.008 * coil, y + minDim * 0.008 * coil);
        ctx.stroke();
      }

      const markerR = px(0.04, minDim);
      const markerGlow = px(0.14, minDim);
      for (const marker of [
        { x: headDrawX, y: headDrawY, active: s.grabbedHead },
        { x: tailDrawX, y: tailDrawY, active: s.grabbedTail },
      ]) {
        const glow = ctx.createRadialGradient(marker.x, marker.y, 0, marker.x, marker.y, markerGlow);
        glow.addColorStop(0, rgba(ember, Math.min(0.28, (0.08 + (marker.active ? 0.12 : 0.04) + reveal * 0.06) * entrance * boost)));
        glow.addColorStop(1, rgba(ember, 0));
        ctx.fillStyle = glow;
        ctx.fillRect(marker.x - markerGlow, marker.y - markerGlow, markerGlow * 2, markerGlow * 2);
        ctx.beginPath();
        ctx.arc(marker.x, marker.y, markerR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(marker.active ? clarity : ember, Math.min(0.96, (0.28 + coil * 0.28 + reveal * 0.14) * entrance * boost));
        ctx.fill();
      }

      if (s.grabbedHead && s.pointers.has(s.headPointerId)) {
        const pt = s.pointers.get(s.headPointerId)!;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, px(0.055, minDim), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(clarity, Math.min(0.18, (0.08 + reveal * 0.06) * entrance * boost));
        ctx.lineWidth = px(0.0014, minDim);
        ctx.stroke();
      }
      if (s.grabbedTail && s.pointers.has(s.tailPointerId)) {
        const pt = s.pointers.get(s.tailPointerId)!;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, px(0.055, minDim), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(clarity, Math.min(0.18, (0.08 + reveal * 0.06) * entrance * boost));
        ctx.lineWidth = px(0.0014, minDim);
        ctx.stroke();
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.44);
        flash.addColorStop(0, rgba(clarity, (s.revealFlash * 0.24 + Math.max(0, reveal - 0.9) * 0.64) * entrance));
        flash.addColorStop(1, rgba(clarity, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.44, cy - minDim * 0.44, minDim * 0.88, minDim * 0.88);
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

    const grabRadius = Math.min(viewport.width, viewport.height) * 0.09;

    const computeEndpoints = () => {
      const cx = viewport.width * 0.5;
      const cy = viewport.height * 0.5;
      const radius = Math.min(viewport.width, viewport.height) * 0.205;
      return {
        head: { x: cx + Math.cos(-Math.PI * 0.38) * radius, y: cy + Math.sin(-Math.PI * 0.38) * radius },
        tail: { x: cx + Math.cos(Math.PI * 1.62) * radius, y: cy + Math.sin(Math.PI * 1.62) * radius },
      };
    };

    const updateProgress = () => {
      const s = stateRef.current;
      if (!s.grabbedHead || !s.grabbedTail || !s.pointers.has(s.headPointerId) || !s.pointers.has(s.tailPointerId)) return;
      const head = s.pointers.get(s.headPointerId)!;
      const tail = s.pointers.get(s.tailPointerId)!;
      const separation = Math.hypot(head.x - tail.x, head.y - tail.y);
      s.progress = clamp((separation - Math.min(viewport.width, viewport.height) * 0.22) / (Math.min(viewport.width, viewport.height) * 0.42), 0, 1);
    };

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      const point = getPoint(e);
      const { head, tail } = computeEndpoints();
      s.pointers.set(e.pointerId, point);

      const nearHead = Math.hypot(point.x - head.x, point.y - head.y) <= grabRadius && !s.grabbedHead;
      const nearTail = Math.hypot(point.x - tail.x, point.y - tail.y) <= grabRadius && !s.grabbedTail;

      if (nearHead) {
        s.grabbedHead = true;
        s.headPointerId = e.pointerId;
      } else if (nearTail) {
        s.grabbedTail = true;
        s.tailPointerId = e.pointerId;
      } else if (s.errorCooldown === 0) {
        s.errorCooldown = 18;
        callbacksRef.current.onHaptic('error_boundary');
      }

      if (s.grabbedHead && s.grabbedTail) callbacksRef.current.onHaptic('hold_start');
      updateProgress();
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.pointers.has(e.pointerId)) return;
      s.pointers.set(e.pointerId, getPoint(e));
      updateProgress();
    };

    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      s.pointers.delete(e.pointerId);
      if (e.pointerId === s.headPointerId) {
        s.grabbedHead = false;
        s.headPointerId = -1;
      }
      if (e.pointerId === s.tailPointerId) {
        s.grabbedTail = false;
        s.tailPointerId = -1;
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
