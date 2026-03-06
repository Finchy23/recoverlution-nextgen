/**
 * ATOM 096: THE POSSIBILITY PRISM ENGINE
 * Series 10 — Reality Bender · Position 6
 * Drag a prism into a white beam to split it into a spectrum of possibilities.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, ELEMENT_ALPHA, type RGB } from '../atom-utils';

const BEAM_WHITE: RGB = [230, 230, 240];
const PRISM_COLOR: RGB = [140, 140, 170];
const SPECTRUM: RGB[] = [
  [220, 60, 60], [220, 140, 40], [220, 200, 60],
  [60, 180, 80], [60, 120, 200], [100, 60, 180], [160, 60, 160],
];
const BG_BASE: RGB = [18, 16, 24];

export default function PossibilityPrismAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    entranceProgress: 0, prismX: 0, prismY: 0,
    isDragging: false, dragOffX: 0, dragOffY: 0,
    splitT: 0, resolved: false, frame: 0,
  });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  useEffect(() => {
    stateRef.current.prismX = viewport.width * 0.7;
    stateRef.current.prismY = viewport.height * 0.5;
  }, [viewport]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);

    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const s = stateRef.current; const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;
      const d = Math.sqrt((px - s.prismX) ** 2 + (py - s.prismY) ** 2);
      if (d < minDim * 0.08) {
        s.isDragging = true;
        s.dragOffX = px - s.prismX; s.dragOffY = py - s.prismY;
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.isDragging) return;
      const rect = canvas.getBoundingClientRect();
      s.prismX = (e.clientX - rect.left) / rect.width * w - s.dragOffX;
      s.prismY = (e.clientY - rect.top) / rect.height * h - s.dragOffY;
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      stateRef.current.isDragging = false;
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

      const primaryRgb = parseColor(p.color);
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.015));
      bgGrad.addColorStop(1, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Beam source (left side)
      const beamOriginX = w * 0.05;
      const beamY = h * 0.5;
      const beamCol = lerpColor(BEAM_WHITE, primaryRgb, 0.03);

      // Check if prism is in the beam path
      const inBeam = Math.abs(s.prismY - beamY) < minDim * 0.06 && s.prismX > w * 0.2 && s.prismX < w * 0.8;
      const targetSplit = inBeam ? 1 : 0;
      s.splitT += (targetSplit - s.splitT) * (p.reducedMotion ? 0.3 : 0.04);

      if (inBeam && s.splitT > 0.5 && !s.resolved) {
        s.resolved = true; onHaptic('step_advance'); onHaptic('completion'); onResolve?.();
      }
      onStateChange?.(s.splitT);

      // White beam (before prism)
      const beamEndX = inBeam ? s.prismX - minDim * 0.04 : w * 0.95;
      ctx.strokeStyle = rgba(beamCol, ELEMENT_ALPHA.primary.max * ent * (1 - s.splitT * 0.3));
      ctx.lineWidth = Math.max(1, minDim * 0.003);
      ctx.beginPath();
      ctx.moveTo(beamOriginX, beamY);
      ctx.lineTo(beamEndX, beamY);
      ctx.stroke();

      // Spectral beams (after prism)
      if (s.splitT > 0.05) {
        const spectrumStart = s.prismX + minDim * 0.04;
        for (let i = 0; i < SPECTRUM.length; i++) {
          const angle = ((i - 3) / 3) * 0.15 * s.splitT;
          const endX = w * 0.95;
          const endY = beamY + Math.tan(angle) * (endX - spectrumStart);
          const specCol = lerpColor(SPECTRUM[i], primaryRgb, 0.05);
          ctx.strokeStyle = rgba(specCol, ELEMENT_ALPHA.primary.max * ent * s.splitT);
          ctx.lineWidth = minDim * 0.0012;
          ctx.beginPath();
          ctx.moveTo(spectrumStart, beamY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      }

      // Prism (triangle)
      const prismR = minDim * 0.04;
      const prismCol = lerpColor(PRISM_COLOR, primaryRgb, 0.04);
      ctx.fillStyle = rgba(prismCol, ELEMENT_ALPHA.primary.max * ent * 0.8);
      ctx.beginPath();
      ctx.moveTo(s.prismX, s.prismY - prismR);
      ctx.lineTo(s.prismX - prismR * 0.87, s.prismY + prismR * 0.5);
      ctx.lineTo(s.prismX + prismR * 0.87, s.prismY + prismR * 0.5);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = rgba(prismCol, ELEMENT_ALPHA.secondary.max * ent);
      ctx.lineWidth = minDim * 0.0006; ctx.stroke();

      if (!s.resolved) {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(PRISM_COLOR, primaryRgb, 0.06), ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText('drag the prism into the light', cx, h * 0.9);
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