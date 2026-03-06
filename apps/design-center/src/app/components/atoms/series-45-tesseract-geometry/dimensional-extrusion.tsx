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
const DRAG_THRESHOLD = 0.34;
const PINCH_ONE_THRESHOLD = 0.28;
const PINCH_TWO_THRESHOLD = 0.2;

type Point = { x: number; y: number };
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export default function DimensionalExtrusionAtom({
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
    stage: 0,
    pointers: {} as Record<number, Point>,
    dragStartY: 0,
    dragProgress: 0,
    pinchBaseline: 0,
    pinchCompression: 0,
    stageT: 0,
    revealFlash: 0,
    completionFired: false,
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

      if (p.phase === 'resolve' && s.stage < 3) {
        s.stage = 3;
        s.revealFlash = 1;
      }

      s.stageT += ((s.stage === 0 ? s.dragProgress : s.stage === 1 ? s.pinchCompression : s.stage === 2 ? s.pinchCompression : 1) - s.stageT) * 0.14 * ms;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));

      const overall = clamp((s.stage + s.stageT) / 3, 0, 1);
      const reveal = easeOutCubic(overall);
      const boost = p.composed ? 1.18 : 1;
      cb.onStateChange?.(reveal);

      if (reveal >= 0.965 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const field = lerpColor(primary, accent, 0.16);
      const dense = lerpColor([4, 5, 10], primary, 0.08);
      const line = lerpColor(primary, [246, 248, 255], 0.9);
      const ember = lerpColor(accent, [255, 243, 226], 0.82);

      const stageBg = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.96);
      stageBg.addColorStop(0, rgba(field, Math.min(0.15, (0.05 + reveal * 0.05) * entrance * boost)));
      stageBg.addColorStop(1, rgba(dense, Math.min(0.98, (0.28 + (1 - reveal) * 0.22) * entrance * boost)));
      ctx.fillStyle = stageBg;
      ctx.fillRect(0, 0, w, h);

      const towerW = minDim * 0.18;
      const towerH = minDim * 0.5;
      const squareSize = minDim * 0.18;
      const lineLen = minDim * 0.22;

      let bodyW = towerW;
      let bodyH = towerH;
      let radius = towerW * 0.18;
      let glowR = minDim * 0.38;

      if (s.stage === 0) {
        bodyH = towerH - (towerH - squareSize) * s.stageT;
        bodyW = towerW + (squareSize - towerW) * s.stageT;
        radius = towerW * 0.18 + (squareSize * 0.22 - towerW * 0.18) * s.stageT;
      } else if (s.stage === 1) {
        bodyW = squareSize - (squareSize - lineLen) * s.stageT;
        bodyH = squareSize - (squareSize - minDim * 0.016) * s.stageT;
        radius = minDim * 0.008;
      } else if (s.stage >= 2) {
        bodyW = lineLen - (lineLen - minDim * 0.018) * s.stageT;
        bodyH = minDim * 0.016 - (minDim * 0.016 - minDim * 0.018) * s.stageT;
        radius = minDim * 0.009;
        glowR = minDim * 0.24;
      }

      const innerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      innerGlow.addColorStop(0, rgba(ember, Math.min(0.18, (0.04 + reveal * 0.08 + s.revealFlash * 0.04) * entrance * boost)));
      innerGlow.addColorStop(1, rgba(ember, 0));
      ctx.fillStyle = innerGlow;
      ctx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);

      ctx.beginPath();
      ctx.roundRect(cx - bodyW * 0.5, cy - bodyH * 0.5, bodyW, bodyH, radius);
      ctx.fillStyle = rgba(ember, Math.min(0.12, (0.03 + reveal * 0.06) * entrance * boost));
      ctx.fill();
      ctx.strokeStyle = rgba(line, Math.min(0.9, (0.16 + reveal * 0.14) * entrance * boost));
      ctx.lineWidth = px(0.0054, minDim);
      ctx.stroke();

      if (s.stage < 2) {
        const guideAlpha = Math.min(0.22, (0.05 + reveal * 0.06) * entrance * boost);
        ctx.beginPath();
        ctx.moveTo(cx - bodyW * 0.42, cy);
        ctx.lineTo(cx + bodyW * 0.42, cy);
        ctx.strokeStyle = rgba(line, guideAlpha);
        ctx.lineWidth = px(0.0028, minDim);
        ctx.stroke();
      }

      if (s.stage === 0) {
        ctx.beginPath();
        ctx.arc(cx, cy - bodyH * 0.5 - minDim * 0.035, minDim * 0.022, 0, Math.PI * 2);
        ctx.fillStyle = rgba(ember, Math.min(0.84, (0.14 + s.dragProgress * 0.42) * entrance * boost));
        ctx.fill();
      }

      if (Object.keys(s.pointers).length >= 2 && s.stage >= 1) {
        const pts = Object.values(s.pointers);
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        ctx.lineTo(pts[1].x, pts[1].y);
        ctx.strokeStyle = rgba(ember, Math.min(0.2, (0.08 + reveal * 0.06) * entrance * boost));
        ctx.lineWidth = px(0.003, minDim);
        ctx.stroke();
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.52);
        flash.addColorStop(0, rgba(ember, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.62) * entrance));
        flash.addColorStop(1, rgba(ember, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.52, cy - minDim * 0.52, minDim * 1.04, minDim * 1.04);
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
      if (stateRef.current.stage === 0) {
        stateRef.current.dragStartY = p.y;
      } else if (Object.keys(stateRef.current.pointers).length >= 2) {
        const pts = Object.values(stateRef.current.pointers);
        stateRef.current.pinchBaseline = distance(pts[0], pts[1]);
      }
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!(e.pointerId in s.pointers)) return;
      const p = getPoint(e);
      s.pointers[e.pointerId] = p;

      if (s.stage === 0 && Object.keys(s.pointers).length === 1) {
        const delta = p.y - s.dragStartY;
        s.dragProgress = clamp(delta / (viewport.height * DRAG_THRESHOLD), 0, 1);
        if (s.dragProgress >= 1) {
          s.stage = 1;
          s.dragProgress = 0;
          s.stageT = 0;
          callbacksRef.current.onHaptic('drag_snap');
          callbacksRef.current.onHaptic('step_advance');
        }
      } else if ((s.stage === 1 || s.stage === 2) && Object.keys(s.pointers).length >= 2) {
        const pts = Object.values(s.pointers);
        const d = distance(pts[0], pts[1]);
        if (s.pinchBaseline === 0) s.pinchBaseline = d;
        const threshold = s.stage === 1 ? PINCH_ONE_THRESHOLD : PINCH_TWO_THRESHOLD;
        s.pinchCompression = clamp((s.pinchBaseline - d) / (Math.min(viewport.width, viewport.height) * threshold), 0, 1);
        if (s.pinchCompression >= 1) {
          if (s.stage === 1) {
            s.stage = 2;
            s.pinchCompression = 0;
            s.stageT = 0;
            s.pinchBaseline = 0;
            callbacksRef.current.onHaptic('drag_snap');
            callbacksRef.current.onHaptic('step_advance');
          } else {
            s.stage = 3;
            s.pinchCompression = 1;
            s.stageT = 1;
            s.pinchBaseline = 0;
            s.revealFlash = 1;
            callbacksRef.current.onHaptic('completion');
            callbacksRef.current.onResolve?.();
          }
        }
      }
    };

    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      delete s.pointers[e.pointerId];
      s.pinchBaseline = 0;
      if (s.stage === 0) s.dragProgress = s.dragProgress;
      else if (s.stage < 3) s.pinchCompression = s.pinchCompression;
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
