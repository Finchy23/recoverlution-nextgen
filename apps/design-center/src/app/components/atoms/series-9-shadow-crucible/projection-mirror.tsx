/**
 * ATOM 083: THE PROJECTION ENGINE
 * ==================================
 * Series 9 — Shadow & Crucible · Position 3
 *
 * What you hate in them is a shadow in you. Scrub the mirror
 * to wipe away the distorted image and reveal your own reflection.
 *
 * PHYSICS:
 *   - Canvas shows sharp, angular, monstrous silhouette
 *   - Drag across surface accumulates a "wipe" mask
 *   - Under the mask: soft, round, human silhouette
 *   - Coverage >85% → resolution
 *
 * INTERACTION:
 *   Drag → scrub-to-reveal wipe
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Tap reveals in quadrants
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, MASK_WHITE, type RGB,
} from '../atom-utils';

const MONSTER_COLOR: RGB = [50, 40, 60];
const MONSTER_EDGE: RGB = [70, 55, 80];
const HUMAN_COLOR: RGB = [140, 130, 155];
const HUMAN_WARM: RGB = [220, 200, 170];
const BG_BASE: RGB = [18, 16, 24];

const GRID_SIZE = 10; // coverage sample grid step

export default function ProjectionMirrorAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({
    entranceProgress: 0,
    isDragging: false,
    lastX: 0, lastY: 0,
    coverage: 0,
    lastDetent: -1,
    resolved: false,
    frame: 0,
  });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  useEffect(() => {
    const mc = document.createElement('canvas');
    mc.width = Math.round(viewport.width);
    mc.height = Math.round(viewport.height);
    maskCanvasRef.current = mc;
    return () => { maskCanvasRef.current = null; };
  }, [viewport]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);

    // Wipe helper (inline)
    const addWipe = (x: number, y: number) => {
      const mc = maskCanvasRef.current;
      if (!mc) return;
      const mctx = mc.getContext('2d');
      if (!mctx) return;
      mctx.fillStyle = MASK_WHITE;
      mctx.beginPath();
      const r = minDim * 0.04;
      mctx.arc(x, y, r, 0, Math.PI * 2);
      mctx.fill();
    };

    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * w;
      const y = (e.clientY - rect.top) / rect.height * h;
      stateRef.current.isDragging = true;
      stateRef.current.lastX = x;
      stateRef.current.lastY = y;
      addWipe(x, y);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.isDragging) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * w;
      const y = (e.clientY - rect.top) / rect.height * h;
      const dx = x - s.lastX;
      const dy = y - s.lastY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const wipeR = minDim * 0.04;
      const steps = Math.max(1, Math.floor(dist / (wipeR * 0.5)));
      for (let i = 0; i <= steps; i++) {
        addWipe(s.lastX + dx * (i / steps), s.lastY + dy * (i / steps));
      }
      s.lastX = x;
      s.lastY = y;
      const detent = Math.floor(s.coverage * 4);
      if (detent !== s.lastDetent && detent > s.lastDetent) {
        s.lastDetent = detent;
        onHaptic('drag_snap');
      }
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      stateRef.current.isDragging = false;
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    const render = () => {
      raf = requestAnimationFrame(render);
      const s = stateRef.current;
      const p = propsRef.current;
      s.frame++;

      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress;
      const ent = adv.entrance;

      const primaryRgb = parseColor(p.color);
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.015));
      bgGrad.addColorStop(1, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Monster silhouette (sharp, angular)
      const monsterCol = lerpColor(MONSTER_COLOR, primaryRgb, 0.03);
      const monsterAlpha = ELEMENT_ALPHA.primary.max * ent;
      const mR = minDim * 0.15;

      // Read mask pixel data for coverage calculation (every N frames)
      const mc = maskCanvasRef.current;
      if (mc && s.frame % 10 === 0) {
        const mctx = mc.getContext('2d');
        if (mctx) {
          const silX = cx - mR * 1.4;
          const silY = cy - mR * 1.4;
          const silW = mR * 2.8;
          const silH = mR * 2.8;
          let wiped = 0;
          let total = 0;
          const step = GRID_SIZE;
          for (let sy = silY; sy < silY + silH; sy += step) {
            for (let sx = silX; sx < silX + silW; sx += step) {
              total++;
              const pixel = mctx.getImageData(Math.round(sx), Math.round(sy), 1, 1).data;
              if (pixel[0] > 128) wiped++;
            }
          }
          s.coverage = total > 0 ? wiped / total : 0;
        }
      }

      // Draw monster (fades out with coverage)
      ctx.fillStyle = rgba(monsterCol, monsterAlpha * Math.max(0, 1 - s.coverage * 1.5));
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const spike = i % 2 === 0 ? 1.4 : 0.7;
        const px = cx + Math.cos(a) * mR * spike;
        const py = cy + Math.sin(a) * mR * spike;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      // Human silhouette revealed (fades in with coverage)
      if (s.coverage > 0) {
        const humanCol = lerpColor(HUMAN_COLOR, primaryRgb, 0.04);
        const warmCol = lerpColor(HUMAN_WARM, primaryRgb, 0.04);
        const revealAlpha = Math.min(1, s.coverage * 2);

        // Soft radial body
        const humanGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, mR);
        humanGrad.addColorStop(0, rgba(warmCol, ELEMENT_ALPHA.primary.max * ent * revealAlpha));
        humanGrad.addColorStop(0.7, rgba(humanCol, ELEMENT_ALPHA.primary.min * ent * revealAlpha));
        humanGrad.addColorStop(1, rgba(humanCol, 0));
        ctx.fillStyle = humanGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, mR, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = rgba(warmCol, ELEMENT_ALPHA.primary.max * ent * revealAlpha * 0.8);
        ctx.beginPath();
        ctx.arc(cx, cy - mR * 0.4, mR * 0.25, 0, Math.PI * 2);
        ctx.fill();
      }

      onStateChange?.(s.coverage);

      if (s.coverage > 0.85 && !s.resolved) {
        s.resolved = true;
        onHaptic('completion');
        onResolve?.();
      }

      // Instruction
      if (s.coverage < 0.1 && !s.resolved) {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(MONSTER_EDGE, primaryRgb, 0.06), ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText('wipe the glass', cx, h * 0.9);
      }

      ctx.restore();
    };

    let raf = requestAnimationFrame(render);
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
      style={{ width: viewport.width, height: viewport.height, display: 'block', touchAction: 'none', cursor: 'crosshair' }}
    />
  );
}