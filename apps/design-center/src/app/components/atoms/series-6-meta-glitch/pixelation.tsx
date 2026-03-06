/**
 * ATOM 058: THE PIXELATION ENGINE (Identity Resolution)
 * =====================================================
 * Series 6 — Meta-System & Glitch · Position 8
 *
 * The ego suffers because its identity is too rigid, too sharp,
 * too highly defined. This atom lowers the "resolution" of the
 * self, allowing for fluidity and reinvention.
 *
 * A sharp, high-fidelity identity statement is displayed. As the
 * user drags a slider, the "pixel size" increases from 1px to 50px,
 * turning a sharp, painful judgment into a soft, abstract, blurry
 * composition of mere color.
 *
 * PHYSICS:
 *   - Canvas mosaic filter: sample & fill blockSize x blockSize rects
 *   - Vertical drag maps to pixel size (1 → 50)
 *   - Composite canvas: text rendered sharp, then pixelated live
 *   - Breath modulates pixel shimmer
 *
 * REDUCED MOTION: Pixel size changes without shimmer animation
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const MIN_PIXEL = 1;
const MAX_PIXEL_FRAC = 0.1;   // max pixel size as fraction of minDim
const DRAG_SENSITIVITY = 0.5;

const BG_DARK: RGB = [5, 4, 7];
const TEXT_SHARP: RGB = [170, 160, 140];
const TEXT_DIM: RGB = [90, 85, 75];
const SLIDER_TRACK: RGB = [30, 28, 35];
const SLIDER_THUMB: RGB = [100, 110, 130];
const HINT_COL: RGB = [65, 60, 55];

const IDENTITY_LINES = [
  'I AM',
  'NOT ENOUGH',
];

export default function PixelationAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; },
    [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    pixelSize: MIN_PIXEL,
    targetPixelSize: MIN_PIXEL,
    dragging: false,
    dragStartY: 0,
    dragStartPixel: MIN_PIXEL,
    resolved: false,
    resolveAlpha: 0,
    frameCount: 0,
    lastSnapTier: 0,
  });

  useEffect(() => {
    const s = stateRef.current;
    s.primaryRgb = parseColor(color);
    s.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const s = stateRef.current;
    const minDim = Math.min(w, h);
    const dpr = window.devicePixelRatio || 1;

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.dragging = true;
      s.dragStartY = e.clientY;
      s.dragStartPixel = s.pixelSize;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const dy = s.dragStartY - e.clientY;
      const delta = dy * DRAG_SENSITIVITY;
      s.targetPixelSize = Math.max(MIN_PIXEL, Math.min(minDim * MAX_PIXEL_FRAC,
        s.dragStartPixel + delta));
      const tier = Math.floor(s.targetPixelSize / (minDim * MAX_PIXEL_FRAC / 5));
      if (tier !== s.lastSnapTier) {
        s.lastSnapTier = tier;
        cbRef.current.onHaptic('drag_snap');
      }
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      s.dragging = false;
      canvas.releasePointerCapture(e.pointerId);
      if (s.pixelSize > minDim * MAX_PIXEL_FRAC * 0.8 && !s.resolved) {
        s.resolved = true;
        cbRef.current.onHaptic('completion');
        cbRef.current.onResolve?.();
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    // Pre-allocate text composite canvas
    if (!textCanvasRef.current) {
      textCanvasRef.current = document.createElement('canvas');
    }
    const tCanvas = textCanvasRef.current;
    const tCtx = tCanvas.getContext('2d');
    if (!tCtx) return;

    let animId: number;

    const render = () => {
      const p = propsRef.current;
      const cb = cbRef.current;

      const cw = Math.round(w * dpr);
      const ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw; canvas.height = ch;
        tCanvas.width = cw; tCanvas.height = ch;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);
      s.frameCount++;

      // Entrance
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const ent = easeOutExpo(s.entranceProgress);

      // Smooth pixel size lerp
      const lerpRate = p.reducedMotion ? 0.3 : 0.08;
      s.pixelSize += (s.targetPixelSize - s.pixelSize) * lerpRate;

      cb.onStateChange?.(Math.min(1, s.pixelSize / (minDim * MAX_PIXEL_FRAC)));

      // Breath shimmer on pixel size
      const breathShimmer = p.reducedMotion ? 0 : Math.sin(s.frameCount * 0.03) * p.breathAmplitude * 2;
      const effectivePixel = Math.max(1, Math.round(s.pixelSize + breathShimmer));

      // ── Background ─────────────────────────────────────
      const bg = lerpColor(BG_DARK, s.primaryRgb, 0.005);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bg, ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(bg, ent * 0.015));
      bgGrad.addColorStop(1, rgba(bg, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Render text to composite canvas ────────────────
      tCtx.save();
      tCtx.scale(dpr, dpr);
      tCtx.clearRect(0, 0, w, h);

      const fontSize = Math.round(minDim * 0.08);
      tCtx.font = `700 ${fontSize}px -apple-system, 'Helvetica Neue', sans-serif`;
      tCtx.textAlign = 'center';
      tCtx.textBaseline = 'middle';

      const lineSpacing = fontSize * 1.4;
      const startY = h / 2 - (IDENTITY_LINES.length - 1) * lineSpacing / 2;

      for (let i = 0; i < IDENTITY_LINES.length; i++) {
        const tc = lerpColor(TEXT_SHARP, s.primaryRgb, 0.04);
        tCtx.fillStyle = rgba(tc, 0.10 * ent);
        tCtx.fillText(IDENTITY_LINES[i], w / 2, startY + i * lineSpacing);
      }
      tCtx.restore();

      // ── Pixelation pass ────────────────────────────────
      if (effectivePixel <= 1) {
        // No pixelation — draw text directly
        ctx.drawImage(tCanvas, 0, 0, cw, ch, 0, 0, w, h);
      } else {
        // Sample from text canvas and render mosaic blocks
        const imageData = tCtx.getImageData(0, 0, cw, ch);
        const data = imageData.data;
        const pxDpr = Math.round(effectivePixel * dpr);

        for (let y = 0; y < ch; y += pxDpr) {
          for (let x = 0; x < cw; x += pxDpr) {
            // Sample center pixel
            const sx = Math.min(cw - 1, x + Math.floor(pxDpr / 2));
            const sy = Math.min(ch - 1, y + Math.floor(pxDpr / 2));
            const idx = (sy * cw + sx) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];

            if (a > 2) {
              ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
              ctx.fillRect(x / dpr, y / dpr, effectivePixel, effectivePixel);
            }
          }
        }
      }

      // ── Slider track (right edge) ─────────────────────
      const trackX = w - minDim * 0.06;
      const trackTop = h * 0.2;
      const trackBottom = h * 0.8;
      const trackH = trackBottom - trackTop;
      const trackW = minDim * 0.004;

      const trkCol = lerpColor(SLIDER_TRACK, s.primaryRgb, 0.02);
      ctx.fillStyle = rgba(trkCol, 0.04 * ent);
      ctx.fillRect(trackX - trackW / 2, trackTop, trackW, trackH);

      // Thumb position
      const thumbT = (s.pixelSize - MIN_PIXEL) / (minDim * MAX_PIXEL_FRAC - MIN_PIXEL);
      const thumbY = trackBottom - thumbT * trackH;
      const thumbCol = lerpColor(SLIDER_THUMB, s.accentRgb, 0.06);
      ctx.beginPath();
      ctx.arc(trackX, thumbY, minDim * 0.012, 0, Math.PI * 2);
      ctx.fillStyle = rgba(thumbCol, 0.08 * ent);
      ctx.fill();

      // ── Labels ────────────────────────────────────────
      const labelSize = Math.round(minDim * 0.012);
      ctx.font = `300 ${labelSize}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      const lc = lerpColor(HINT_COL, s.primaryRgb, 0.03);

      ctx.fillStyle = rgba(lc, 0.03 * ent);
      ctx.fillText('sharp', trackX, trackBottom + minDim * 0.03);
      ctx.fillText('soft', trackX, trackTop - minDim * 0.015);

      // Drag hint
      if (s.pixelSize < 3 && s.frameCount > 120) {
        const hintSize = Math.round(minDim * 0.014);
        ctx.font = `300 ${hintSize}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        const hc = lerpColor(HINT_COL, s.primaryRgb, 0.03);
        ctx.fillStyle = rgba(hc, 0.03 * ent);
        ctx.fillText('drag up to soften', w / 2, h * 0.88);
      }

      // ── Resolve overlay ────────────────────────────────
      if (s.resolved) {
        s.resolveAlpha = Math.min(1, s.resolveAlpha + 0.004);
        if (s.resolveAlpha > 0.3) {
          const rs = Math.round(minDim * 0.018);
          ctx.font = `200 ${rs}px -apple-system, 'Helvetica Neue', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const rc = lerpColor(TEXT_DIM, s.accentRgb, 0.06);
          const ra = easeOutExpo((s.resolveAlpha - 0.3) / 0.7) * 0.06 * ent;
          ctx.fillStyle = rgba(rc, ra);
          ctx.fillText('just color', w / 2, h * 0.5);
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
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
      <canvas ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ns-resize' }} />
    </div>
  );
}