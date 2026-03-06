/**
 * ATOM 121: THE SUBTEXT SCANNER ENGINE
 * ======================================
 * Series 13 — Semantic Translators · Position 1
 *
 * A harsh text message sits on screen. Drag a "Thermal Lens"
 * over it — cold words melt, revealing vulnerable truth beneath.
 *
 * PHYSICS: Thermal imaging, layer masking, infrared glow interpolation
 * INTERACTION: Drag lens over text
 * RENDER: Canvas 2D
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB,
} from '../atom-utils';

const SURFACE_TEXT = "You never listen to me.";
const HIDDEN_TEXT = "I feel invisible.";

export default function SubtextScannerAtom({
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
    lensX: -1, lensY: -1, lensActive: false,
    revealProgress: 0,
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
      const warmC: RGB = lerpColor(accentC, [220, 80, 60], 0.4);

      const lensR = minDim * 0.12;

      // Check if lens is near center text
      if (s.lensActive) {
        const dx = s.lensX - cx;
        const dy = s.lensY - cy;
        if (dx * dx + dy * dy < lensR * lensR * 2) {
          s.revealProgress = Math.min(1, s.revealProgress + 0.006);
        }
      }

      const reveal = easeOutCubic(s.revealProgress);

      // Background
      const glowR = minDim * (0.35 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Surface text (fades as revealed)
      const surfaceAlpha = (1 - reveal) * ELEMENT_ALPHA.text.max * entrance;
      const surfFs = Math.max(10, minDim * 0.022);
      ctx.font = `600 ${surfFs}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = rgba(baseC, surfaceAlpha);
      ctx.fillText(SURFACE_TEXT, cx, cy);

      // Hidden text (appears as revealed)
      const hiddenAlpha = reveal * ELEMENT_ALPHA.text.max * 1.5 * entrance;
      ctx.font = `${surfFs}px -apple-system, sans-serif`;
      ctx.fillStyle = rgba(warmC, hiddenAlpha);
      ctx.fillText(HIDDEN_TEXT, cx, cy);

      // Warm glow behind hidden text
      if (reveal > 0.1) {
        const hGlowR = minDim * 0.15 * reveal;
        const hGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, hGlowR);
        hGrad.addColorStop(0, rgba(warmC, EMPHASIS_ALPHA.focal.min * entrance * reveal));
        hGrad.addColorStop(1, rgba(warmC, 0));
        ctx.fillStyle = hGrad;
        ctx.fillRect(cx - hGlowR, cy - hGlowR, hGlowR * 2, hGlowR * 2);
      }

      // Thermal lens
      if (s.lensActive) {
        const lGrad = ctx.createRadialGradient(s.lensX, s.lensY, 0, s.lensX, s.lensY, lensR);
        lGrad.addColorStop(0, rgba(warmC, ELEMENT_ALPHA.primary.max * entrance));
        lGrad.addColorStop(0.5, rgba(warmC, ELEMENT_ALPHA.secondary.max * entrance));
        lGrad.addColorStop(1, rgba(warmC, 0));
        ctx.fillStyle = lGrad;
        ctx.fillRect(s.lensX - lensR, s.lensY - lensR, lensR * 2, lensR * 2);

        ctx.beginPath();
        ctx.arc(s.lensX, s.lensY, lensR * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(warmC, ELEMENT_ALPHA.primary.max * entrance);
        ctx.lineWidth = minDim * 0.001;
        ctx.stroke();
      }

      // Prompt
      if (s.revealProgress < 0.05) {
        const pf = Math.max(8, minDim * 0.013);
        ctx.font = `${pf}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance * (0.5 + Math.sin(s.frameCount * 0.03 * ms) * 0.3));
        ctx.fillText('Drag to scan beneath', cx, cy + minDim * 0.12);
      }

      if (s.revealProgress >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      cb.onStateChange?.(s.revealProgress);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      stateRef.current.lensActive = true;
      const rect = canvas.getBoundingClientRect();
      stateRef.current.lensX = (e.clientX - rect.left) / rect.width * viewport.width;
      stateRef.current.lensY = (e.clientY - rect.top) / rect.height * viewport.height;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.lensActive) return;
      const rect = canvas.getBoundingClientRect();
      stateRef.current.lensX = (e.clientX - rect.left) / rect.width * viewport.width;
      stateRef.current.lensY = (e.clientY - rect.top) / rect.height * viewport.height;
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.lensActive = false;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'none' }} />
    </div>
  );
}