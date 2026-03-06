/**
 * ATOM 123: THE "YET" APPEND ENGINE
 * ====================================
 * Series 13 — Semantic Translators · Position 3
 *
 * "I am not strong enough." — drag the golden ", YET." to the end.
 * Period becomes comma, sentence illuminates.
 *
 * PHYSICS: Magnetic text docking, typographical expansion, illumination
 * INTERACTION: Drag the word into position
 * RENDER: Canvas 2D
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB,
} from '../atom-utils';

export default function YetAppendAtom({
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
    yetX: 0, yetY: 0,
    dragging: false,
    snapped: false,
    snapAnim: 0,
    completionFired: false,
  });

  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    // Init yet position
    const s = stateRef.current;
    s.yetX = viewport.width * 0.5;
    s.yetY = viewport.height * 0.7;

    const SENTENCE = "I am not strong enough";
    const SNAP_DIST = Math.min(viewport.width, viewport.height) * 0.06;

    const render = () => {
      const s2 = stateRef.current;
      const p = propsRef.current;
      const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s2.frameCount++;

      const { progress, entrance } = advanceEntrance(s2.entranceProgress, p.phase);
      s2.entranceProgress = progress;

      const baseC = s2.primaryRgb;
      const accentC = s2.accentRgb;
      const goldC: RGB = lerpColor(accentC, [255, 210, 80], 0.5);

      if (s2.snapped) s2.snapAnim = Math.min(1, s2.snapAnim + 0.025);
      const sa = easeOutCubic(s2.snapAnim);

      // Background
      const ms = motionScale(p.reducedMotion);
      const glowR = minDim * (0.35 + p.breathAmplitude * 0.03 * ms + sa * 0.1) * entrance;
      const bgC = lerpColor(baseC, goldC, sa * 0.3);
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(bgC, ELEMENT_ALPHA.glow.max * (1 + sa) * entrance));
      bgGrad.addColorStop(1, rgba(bgC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Main sentence
      const fs = Math.max(11, minDim * 0.024);
      ctx.font = `${fs}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const sentenceColor = lerpColor(baseC, goldC, sa * 0.6);
      ctx.fillStyle = rgba(sentenceColor, ELEMENT_ALPHA.text.max * (1 + sa) * entrance);

      const suffix = s2.snapped ? ', yet.' : '.';
      ctx.fillText(SENTENCE + suffix, cx, cy);

      // Measure sentence end for snap target
      const textMetrics = ctx.measureText(SENTENCE + '.');
      const snapTargetX = cx + textMetrics.width / 2 + minDim * 0.02;
      const snapTargetY = cy;

      // Draw the draggable "YET" word
      if (!s2.snapped) {
        const yetFs = Math.max(12, minDim * 0.028);
        ctx.font = `600 ${yetFs}px -apple-system, sans-serif`;

        // Pulsing glow
        const pulse = 0.5 + Math.sin(s2.frameCount * 0.04 * ms) * 0.3;
        const yetGlowR = minDim * 0.04;
        const yGrad = ctx.createRadialGradient(s2.yetX, s2.yetY, 0, s2.yetX, s2.yetY, yetGlowR);
        yGrad.addColorStop(0, rgba(goldC, ELEMENT_ALPHA.glow.max * pulse * entrance));
        yGrad.addColorStop(1, rgba(goldC, 0));
        ctx.fillStyle = yGrad;
        ctx.fillRect(s2.yetX - yetGlowR, s2.yetY - yetGlowR, yetGlowR * 2, yetGlowR * 2);

        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(goldC, EMPHASIS_ALPHA.focal.max * entrance);
        ctx.fillText(', YET.', s2.yetX, s2.yetY);
      }

      // Illumination glow when snapped
      if (sa > 0.5) {
        const illR = minDim * 0.2 * (sa - 0.5) * 2;
        const illGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, illR);
        illGrad.addColorStop(0, rgba(goldC, EMPHASIS_ALPHA.focal.max * entrance * (sa - 0.5) * 2));
        illGrad.addColorStop(1, rgba(goldC, 0));
        ctx.fillStyle = illGrad;
        ctx.fillRect(cx - illR, cy - illR, illR * 2, illR * 2);
      }

      if (s2.snapAnim >= 1 && !s2.completionFired) {
        s2.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      cb.onStateChange?.(s2.snapped ? sa : 0);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s3 = stateRef.current;
      if (s3.snapped) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * viewport.width;
      const py = (e.clientY - rect.top) / rect.height * viewport.height;
      const dx = px - s3.yetX;
      const dy = py - s3.yetY;
      const minDim2 = Math.min(viewport.width, viewport.height);
      if (dx * dx + dy * dy < (minDim2 * 0.06) * (minDim2 * 0.06)) {
        s3.dragging = true;
        canvas.setPointerCapture(e.pointerId);
      }
    };
    const onMove = (e: PointerEvent) => {
      const s3 = stateRef.current;
      if (!s3.dragging) return;
      const rect = canvas.getBoundingClientRect();
      s3.yetX = (e.clientX - rect.left) / rect.width * viewport.width;
      s3.yetY = (e.clientY - rect.top) / rect.height * viewport.height;
    };
    const onUp = (e: PointerEvent) => {
      const s3 = stateRef.current;
      s3.dragging = false;
      canvas.releasePointerCapture(e.pointerId);

      // Check snap distance to end of sentence
      const cx2 = viewport.width / 2;
      const cy2 = viewport.height / 2;
      const fs2 = Math.max(11, Math.min(viewport.width, viewport.height) * 0.024);
      // Approximate snap target
      const snapX = cx2 + Math.min(viewport.width, viewport.height) * 0.15;
      const dx = s3.yetX - snapX;
      const dy = s3.yetY - cy2;
      if (dx * dx + dy * dy < SNAP_DIST * SNAP_DIST) {
        s3.snapped = true;
        cbRef.current.onHaptic('drag_snap');
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