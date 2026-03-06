/**
 * ATOM 125: THE HEADLINE REWRITE ENGINE
 * =======================================
 * Series 13 — Semantic Translators · Position 5
 *
 * Massive red bold headline. Drag "Objectivity Slider" to thin out
 * font weight, desaturate color, morph text to boring fact.
 *
 * PHYSICS: Typography weight interpolation, font transitions, spatial compression
 * INTERACTION: Drag slider
 * RENDER: Canvas 2D
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB,
} from '../atom-utils';

const HEADLINE = "EVERYONE HATES ME";
const REALITY = "One person disagreed.";

export default function HeadlineRewriteAtom({
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
    objectivity: 0, // 0=headline, 1=reality
    dragging: false,
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
      const accentC = s.accentRgb;
      const redC: RGB = lerpColor(accentC, [220, 50, 40], 0.3);
      const greyC: RGB = lerpColor(baseC, [140, 140, 145], 0.4);
      const obj = s.objectivity;

      // Background
      const glowR = minDim * (0.35 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Text interpolation
      const fontSize = Math.max(10, minDim * (0.04 - obj * 0.02));
      const weight = Math.round(900 - obj * 500);
      const textColor = lerpColor(redC, greyC, obj);

      ctx.font = `${weight} ${fontSize}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = rgba(textColor, ELEMENT_ALPHA.text.max * (2 - obj) * entrance);

      // Crossfade text
      if (obj < 0.5) {
        ctx.fillText(HEADLINE, cx, cy);
      } else {
        ctx.fillText(REALITY, cx, cy);
      }

      // Slider track
      const sliderY = cy + minDim * 0.15;
      const sliderW = minDim * 0.4;
      const sliderLeft = cx - sliderW / 2;

      ctx.beginPath();
      ctx.moveTo(sliderLeft, sliderY);
      ctx.lineTo(sliderLeft + sliderW, sliderY);
      ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * entrance);
      ctx.lineWidth = minDim * 0.002;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Handle
      const handleX = sliderLeft + sliderW * obj;
      const handleR = minDim * 0.015;
      const handleColor = lerpColor(redC, accentC, obj);
      ctx.beginPath();
      ctx.arc(handleX, sliderY, handleR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(handleColor, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.fill();

      // Labels
      const lfs = Math.max(7, minDim * 0.01);
      ctx.font = `${lfs}px -apple-system, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillStyle = rgba(redC, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText('Drama', sliderLeft, sliderY + minDim * 0.03);
      ctx.textAlign = 'right';
      ctx.fillStyle = rgba(greyC, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText('Reality', sliderLeft + sliderW, sliderY + minDim * 0.03);

      if (obj >= 0.95 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      cb.onStateChange?.(obj);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * viewport.width;
      const minDim2 = Math.min(viewport.width, viewport.height);
      const sliderW = minDim2 * 0.4;
      const sliderLeft = viewport.width / 2 - sliderW / 2;
      s.objectivity = Math.max(0, Math.min(1, (px - sliderLeft) / sliderW));
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
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ew-resize' }} />
    </div>
  );
}