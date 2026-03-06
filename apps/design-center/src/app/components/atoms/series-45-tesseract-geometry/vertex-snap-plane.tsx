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
const STEP_T = 0.45;
const COMPLETE_T = 0.965;
const POINT_COUNT = 42;

type Particle = {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  gridX: number;
  gridY: number;
  delay: number;
  snapped: boolean;
};

function seeded(i: number) {
  const n = Math.sin(i * 127.1 + 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function buildParticles(width: number, height: number): Particle[] {
  const cols = 6;
  const rows = 7;
  const gridW = width * 0.42;
  const gridH = height * 0.46;
  const startX = width * 0.5 - gridW * 0.5;
  const startY = height * 0.5 - gridH * 0.5;
  const particles: Particle[] = [];

  for (let i = 0; i < POINT_COUNT; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    particles.push({
      x: 0,
      y: 0,
      baseX: width * (0.24 + seeded(i + 1) * 0.52),
      baseY: height * (0.18 + seeded(i + 51) * 0.46),
      gridX: startX + (col / (cols - 1)) * gridW,
      gridY: startY + (row / (rows - 1)) * gridH,
      delay: seeded(i + 101) * 0.1,
      snapped: false,
    });
  }
  return particles;
}

export default function VertexSnapPlaneAtom({
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
    particles: [] as Particle[],
    planeY: viewport.height * 0.84,
    dragging: false,
    targetProgress: 0,
    progress: 0,
    thresholdFired: false,
    completionFired: false,
    revealFlash: 0,
    lastSnapCount: 0,
  });

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    stateRef.current.particles = buildParticles(viewport.width, viewport.height);
    stateRef.current.planeY = viewport.height * 0.84;
    stateRef.current.targetProgress = 0;
    stateRef.current.progress = 0;
    stateRef.current.lastSnapCount = 0;
  }, [viewport.width, viewport.height]);

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
      if (p.phase === 'resolve') s.targetProgress = 1;

      if (!s.dragging) {
        const targetY = h * (0.84 - s.targetProgress * 0.6);
        s.planeY += (targetY - s.planeY) * 0.12 * ms;
      }

      s.progress = clamp((h * 0.84 - s.planeY) / (h * 0.6), 0, 1);
      const reveal = easeOutCubic(s.progress);
      const boost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));
      cb.onStateChange?.(reveal);

      const currentSnapCount = s.particles.filter((pt) => pt.baseY >= s.planeY - h * pt.delay * 0.06).length;
      if (currentSnapCount > s.lastSnapCount) {
        s.lastSnapCount = currentSnapCount;
        cb.onHaptic(currentSnapCount > POINT_COUNT * 0.85 ? 'completion' : 'drag_snap');
      }

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.7;
        cb.onHaptic('step_advance');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        s.revealFlash = 1;
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const field = lerpColor(primary, accent, 0.17);
      const dense = lerpColor([4, 5, 10], primary, 0.08);
      const line = lerpColor(primary, [245, 247, 255], 0.88);
      const ember = lerpColor(accent, [255, 242, 224], 0.8);

      const stage = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.96);
      stage.addColorStop(0, rgba(field, Math.min(0.15, (0.05 + reveal * 0.05) * entrance * boost)));
      stage.addColorStop(1, rgba(dense, Math.min(0.98, (0.28 + (1 - reveal) * 0.22) * entrance * boost)));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const gridAlpha = Math.min(0.22, (0.04 + reveal * 0.18) * entrance * boost);
      if (reveal > 0.08) {
        const gridW = w * 0.42;
        const gridH = h * 0.46;
        const gridX = cx - gridW * 0.5;
        const gridY = cy - gridH * 0.5;
        for (let i = 0; i < 6; i++) {
          const x = gridX + (i / 5) * gridW;
          ctx.beginPath();
          ctx.moveTo(x, gridY);
          ctx.lineTo(x, gridY + gridH);
          ctx.strokeStyle = rgba(line, gridAlpha);
          ctx.lineWidth = px(0.0026, minDim);
          ctx.stroke();
        }
        for (let i = 0; i < 7; i++) {
          const y = gridY + (i / 6) * gridH;
          ctx.beginPath();
          ctx.moveTo(gridX, y);
          ctx.lineTo(gridX + gridW, y);
          ctx.strokeStyle = rgba(line, gridAlpha);
          ctx.lineWidth = px(0.0026, minDim);
          ctx.stroke();
        }
      }

      for (let i = 0; i < s.particles.length; i++) {
        const pt = s.particles[i];
        const eligible = pt.baseY >= s.planeY - h * pt.delay * 0.06;
        const snap = eligible ? 1 : 0;
        pt.snapped = eligible;
        const wobble = (1 - snap) * (p.reducedMotion ? 0 : minDim * 0.01);
        const x = pt.baseX + Math.sin(i * 0.7 + progress * 8) * wobble + (pt.gridX - pt.baseX) * reveal * snap;
        const y = pt.baseY + Math.cos(i * 0.63 + progress * 7.2) * wobble + (pt.gridY - pt.baseY) * reveal * snap;
        ctx.beginPath();
        ctx.arc(x, y, minDim * (snap ? 0.007 : 0.0055), 0, Math.PI * 2);
        ctx.fillStyle = rgba(snap ? ember : line, Math.min(0.92, (0.18 + snap * 0.42 + reveal * 0.08) * entrance * boost));
        ctx.fill();
      }

      const planeGlow = ctx.createLinearGradient(0, s.planeY - minDim * 0.06, 0, s.planeY + minDim * 0.06);
      planeGlow.addColorStop(0, rgba(ember, 0));
      planeGlow.addColorStop(0.5, rgba(ember, Math.min(0.38, (0.12 + reveal * 0.14 + s.revealFlash * 0.04) * entrance * boost)));
      planeGlow.addColorStop(1, rgba(ember, 0));
      ctx.fillStyle = planeGlow;
      ctx.fillRect(cx - minDim * 0.44, s.planeY - minDim * 0.06, minDim * 0.88, minDim * 0.12);

      ctx.beginPath();
      ctx.roundRect(cx - minDim * 0.44, s.planeY - minDim * 0.014, minDim * 0.88, minDim * 0.028, minDim * 0.014);
      ctx.fillStyle = rgba(ember, Math.min(0.88, (0.16 + reveal * 0.22) * entrance * boost));
      ctx.fill();

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.54);
        flash.addColorStop(0, rgba(ember, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.64) * entrance));
        flash.addColorStop(1, rgba(ember, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.54, cy - minDim * 0.54, minDim * 1.08, minDim * 1.08);
      }

      ctx.restore();
      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);

    const getY = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return ((e.clientY - rect.top) / rect.height) * viewport.height;
    };

    const onDown = (e: PointerEvent) => {
      const y = getY(e);
      if (Math.abs(y - stateRef.current.planeY) > viewport.height * 0.08) return;
      stateRef.current.dragging = true;
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('drag_snap');
    };

    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.dragging) return;
      const y = getY(e);
      stateRef.current.planeY = clamp(y, viewport.height * 0.24, viewport.height * 0.84);
      stateRef.current.targetProgress = clamp((viewport.height * 0.84 - stateRef.current.planeY) / (viewport.height * 0.6), 0, 1);
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ns-resize' }} />
    </div>
  );
}
