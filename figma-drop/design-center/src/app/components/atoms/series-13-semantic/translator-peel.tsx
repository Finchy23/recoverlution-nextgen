/**
 * ATOM 122: THE TRANSLATOR ENGINE
 * =================================
 * Series 13 — Semantic Translators · Position 2
 *
 * Layers of emotion: ANGER → FEAR → NEED FOR SAFETY.
 * Swipe/drag to peel each layer back like a page.
 *
 * PHYSICS: Z-depth page peeling, corner-curl, opacity stripping
 * INTERACTION: Swipe down to peel
 * RENDER: Canvas 2D
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB,
} from '../atom-utils';

const LAYERS = [
  { label: 'ANGER', colorShift: [200, 60, 50] as RGB },
  { label: 'FEAR', colorShift: [180, 120, 60] as RGB },
  { label: 'NEED FOR SAFETY', colorShift: [100, 180, 220] as RGB },
];

export default function TranslatorPeelAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    currentLayer: 0,
    peelProgress: 0,
    dragging: false, dragStartY: 0,
    completionFired: false,
  });

  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      const baseC = s.primaryRgb;

      // Background
      const glowR = minDim * (0.35 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const cardW = minDim * 0.45;
      const cardH = minDim * 0.2;
      const cardX = cx - cardW / 2;
      const cardY = cy - cardH / 2;

      // Draw layers from bottom to top
      for (let i = LAYERS.length - 1; i >= 0; i--) {
        if (i < s.currentLayer) continue;
        const layer = LAYERS[i];
        const isTopLayer = i === s.currentLayer;
        const peel = isTopLayer ? s.peelProgress : 0;

        const layerColor = lerpColor(baseC, layer.colorShift, 0.4);
        const alpha = (1 - peel) * ELEMENT_ALPHA.primary.max * (1 + (LAYERS.length - i) * 0.3) * entrance;

        if (alpha < 0.001) continue;

        // Card with peel effect
        const peelOffset = peel * cardH * 1.2;
        const peelAlpha = (1 - peel * 0.8);

        ctx.save();
        ctx.globalAlpha = peelAlpha;
        ctx.fillStyle = rgba(layerColor, alpha / peelAlpha);

        const r = minDim * 0.008;
        const cy2 = cardY - peelOffset;
        ctx.beginPath();
        ctx.moveTo(cardX + r, cy2);
        ctx.lineTo(cardX + cardW - r, cy2);
        ctx.quadraticCurveTo(cardX + cardW, cy2, cardX + cardW, cy2 + r);
        ctx.lineTo(cardX + cardW, cy2 + cardH - r);
        ctx.quadraticCurveTo(cardX + cardW, cy2 + cardH, cardX + cardW - r, cy2 + cardH);
        ctx.lineTo(cardX + r, cy2 + cardH);
        ctx.quadraticCurveTo(cardX, cy2 + cardH, cardX, cy2 + cardH - r);
        ctx.lineTo(cardX, cy2 + r);
        ctx.quadraticCurveTo(cardX, cy2, cardX + r, cy2);
        ctx.closePath();
        ctx.fill();

        // Text
        const fs = Math.max(10, minDim * 0.022);
        ctx.font = `600 ${fs}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba(layerColor, ELEMENT_ALPHA.text.max * entrance * (1 - peel));
        ctx.fillText(layer.label, cx, cy2 + cardH / 2);

        ctx.restore();
      }

      // Final revealed state glow
      if (s.currentLayer >= LAYERS.length - 1 && s.peelProgress >= 1) {
        const lastLayer = LAYERS[LAYERS.length - 1];
        const fgR = minDim * 0.12;
        const fGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, fgR);
        fGrad.addColorStop(0, rgba(lastLayer.colorShift, EMPHASIS_ALPHA.focal.min * entrance));
        fGrad.addColorStop(1, rgba(lastLayer.colorShift, 0));
        ctx.fillStyle = fGrad;
        ctx.fillRect(cx - fgR, cy - fgR, fgR * 2, fgR * 2);
      }

      // Prompt
      if (s.currentLayer < LAYERS.length - 1 || s.peelProgress < 1) {
        const pf = Math.max(8, minDim * 0.012);
        ctx.font = `${pf}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
        ctx.fillText('Swipe down to peel', cx, cy + cardH / 2 + minDim * 0.06);
      }

      if (s.currentLayer >= LAYERS.length - 1 && s.peelProgress >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      cb.onStateChange?.((s.currentLayer + s.peelProgress) / LAYERS.length);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      stateRef.current.dragStartY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const delta = (e.clientY - s.dragStartY) / viewport.height;
      if (delta > 0) {
        s.peelProgress = Math.min(1, s.peelProgress + delta * 2);
        s.dragStartY = e.clientY;
      }
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      s.dragging = false;
      canvas.releasePointerCapture(e.pointerId);
      if (s.peelProgress > 0.6) {
        s.peelProgress = 1;
        if (s.currentLayer < LAYERS.length - 1) {
          s.currentLayer++;
          s.peelProgress = 0;
          cbRef.current.onHaptic('swipe_commit');
        } else {
          cbRef.current.onHaptic('step_advance');
        }
      } else {
        s.peelProgress = 0;
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    return () => {
      cancelAnimationFrame(animId);
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