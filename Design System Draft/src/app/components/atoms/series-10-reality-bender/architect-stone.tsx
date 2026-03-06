/**
 * ATOM 097: THE ARCHITECT ENGINE
 * Series 10 — Reality Bender · Position 7
 * Drag the impossibly heavy cornerstone into place. High friction. Zero rebound.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, ELEMENT_ALPHA, type RGB } from '../atom-utils';

const STONE_COLOR: RGB = [90, 85, 100];
const STONE_HIGHLIGHT: RGB = [120, 115, 135];
const TARGET_COLOR: RGB = [70, 65, 85];
const SEAL_GLOW: RGB = [200, 180, 140];
const BG_BASE: RGB = [18, 16, 24];
const FRICTION = 0.15; // lerp factor (very slow)

export default function ArchitectStoneAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    entranceProgress: 0, stoneX: 0, stoneY: 0,
    targetPointerX: 0, targetPointerY: 0,
    isDragging: false, dragOffX: 0, dragOffY: 0,
    targetX: 0, targetY: 0,
    placed: false, sealGlow: 0,
    resolved: false, frame: 0,
  });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  useEffect(() => {
    const s = stateRef.current;
    s.stoneX = viewport.width * 0.2; s.stoneY = viewport.height * 0.3;
    s.targetX = viewport.width * 0.65; s.targetY = viewport.height * 0.65;
  }, [viewport]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);

    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const s = stateRef.current; if (s.placed) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;
      const stoneR = minDim * 0.06;
      if (Math.abs(px - s.stoneX) < stoneR && Math.abs(py - s.stoneY) < stoneR) {
        s.isDragging = true;
        s.dragOffX = px - s.stoneX; s.dragOffY = py - s.stoneY;
        s.targetPointerX = px; s.targetPointerY = py;
        onHaptic('hold_start');
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.isDragging) return;
      const rect = canvas.getBoundingClientRect();
      s.targetPointerX = (e.clientX - rect.left) / rect.width * w - s.dragOffX;
      s.targetPointerY = (e.clientY - rect.top) / rect.height * h - s.dragOffY;
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      const s = stateRef.current; s.isDragging = false;
      const d = Math.sqrt((s.stoneX - s.targetX) ** 2 + (s.stoneY - s.targetY) ** 2);
      if (d < minDim * 0.05 && !s.placed) {
        s.placed = true;
        s.stoneX = s.targetX; s.stoneY = s.targetY;
        onHaptic('seal_stamp'); onHaptic('completion');
        s.resolved = true; onResolve?.();
      }
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let raf = 0;

    const render = () => {
      raf = requestAnimationFrame(render);
      const s = stateRef.current; const p = propsRef.current; s.frame++;
      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress; const ent = adv.entrance;

      // High-friction drag (stone lags behind pointer)
      if (s.isDragging) {
        const friction = p.reducedMotion ? 0.5 : FRICTION;
        s.stoneX += (s.targetPointerX - s.stoneX) * friction;
        s.stoneY += (s.targetPointerY - s.stoneY) * friction;
      }

      if (s.placed) s.sealGlow = Math.min(1, s.sealGlow + 0.015);

      const dist = Math.sqrt((s.stoneX - s.targetX) ** 2 + (s.stoneY - s.targetY) ** 2);
      onStateChange?.(s.placed ? 1 : Math.max(0, 1 - dist / (minDim * 0.4)));

      const primaryRgb = parseColor(p.color);
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.015));
      bgGrad.addColorStop(1, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const stoneSize = minDim * 0.06;

      // Target zone
      if (!s.placed) {
        const tgtCol = lerpColor(TARGET_COLOR, primaryRgb, 0.04);
        const dashLen = minDim * 0.005;
        ctx.setLineDash([dashLen, dashLen]);
        ctx.strokeStyle = rgba(tgtCol, ELEMENT_ALPHA.secondary.min * ent);
        ctx.lineWidth = minDim * 0.0006;
        ctx.strokeRect(s.targetX - stoneSize / 2, s.targetY - stoneSize / 2, stoneSize, stoneSize);
        ctx.setLineDash([]);
      }

      // Seal glow
      if (s.sealGlow > 0) {
        const gCol = lerpColor(SEAL_GLOW, primaryRgb, 0.04);
        const gr = stoneSize * 2 * s.sealGlow;
        const grad = ctx.createRadialGradient(s.stoneX, s.stoneY, 0, s.stoneX, s.stoneY, gr);
        grad.addColorStop(0, rgba(gCol, ELEMENT_ALPHA.glow.max * ent * s.sealGlow * 0.4));
        grad.addColorStop(1, rgba(gCol, 0));
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(s.stoneX, s.stoneY, gr, 0, Math.PI * 2); ctx.fill();
      }

      // Stone block
      const stoneCol = lerpColor(STONE_COLOR, primaryRgb, 0.04);
      ctx.fillStyle = rgba(stoneCol, ELEMENT_ALPHA.primary.max * ent);
      ctx.fillRect(s.stoneX - stoneSize / 2, s.stoneY - stoneSize / 2, stoneSize, stoneSize);

      // Highlight edge
      const hlCol = lerpColor(STONE_HIGHLIGHT, primaryRgb, 0.04);
      ctx.strokeStyle = rgba(hlCol, ELEMENT_ALPHA.secondary.max * ent);
      ctx.lineWidth = minDim * 0.0006;
      ctx.strokeRect(s.stoneX - stoneSize / 2, s.stoneY - stoneSize / 2, stoneSize, stoneSize);

      if (!s.placed) {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(STONE_HIGHLIGHT, primaryRgb, 0.06), ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText('drag the cornerstone into place', cx, h * 0.9);
      }
      ctx.restore();
    };
    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport, onStateChange, onHaptic, onResolve]);

  return (
    <canvas ref={canvasRef}
      style={{ width: viewport.width, height: viewport.height, display: 'block', touchAction: 'none', cursor: 'grab' }}
    />
  );
}