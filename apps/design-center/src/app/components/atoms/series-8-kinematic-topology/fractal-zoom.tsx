/**
 * ATOM 072: THE FRACTAL ZOOM ENGINE
 * ====================================
 * Series 8 — Kinematic Topology · Position 2
 *
 * No matter how deep you go into a problem, or how far out you
 * zoom, the architecture remains consistent. You cannot fall out
 * of the system. This atom renders a progressive Mandelbrot set
 * that loops infinitely.
 *
 * PHYSICS:
 *   - Progressive Mandelbrot rendering (4 scanlines/frame)
 *   - Tap to zoom into centre
 *   - When zoom > threshold, seamlessly reset (infinite loop)
 *   - Depth colouring via lerpColor palette
 *   - Max 64 iterations for performance
 *
 * INTERACTION:
 *   Tap → zoom deeper into fractal
 *   reducedMotion: static fractal, tap cycles 3 preset zoom levels
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static fractal, tap cycles between pre-computed levels
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, type RGB,
} from '../atom-utils';

// =====================================================================
// PALETTE
// =====================================================================

const FRACTAL_DARK: RGB = [10, 8, 20];
const FRACTAL_MID: RGB = [60, 40, 120];
const FRACTAL_BRIGHT: RGB = [140, 100, 200];
const FRACTAL_HOT: RGB = [200, 140, 80];
const BG_BASE: RGB = [18, 16, 24];

// =====================================================================
// CONSTANTS
// =====================================================================

const MAX_ITER = 64;
const ZOOM_SPEED = 0.003;
const ZOOM_RESET_THRESHOLD = 500;
const SCANLINES_PER_FRAME = 6;

// Pre-computed interesting coordinates for zoom centres
const ZOOM_CENTRES = [
  { x: -0.7435669, y: 0.1314023 },
  { x: -0.16, y: 1.0405 },
  { x: -0.745428, y: 0.113009 },
];

// =====================================================================
// COMPONENT
// =====================================================================

export default function FractalZoomAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fractalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({
    entranceProgress: 0,
    zoom: 1,
    centreX: -0.5,
    centreY: 0,
    targetZoom: 1,
    zoomCentreIdx: 0,
    currentScanline: 0,
    needsRedraw: true,
    loops: 0,
    reducedLevel: 0,
    frame: 0,
  });
  const propsRef = useRef({
    breathAmplitude, reducedMotion, phase, color, accentColor,
  });

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  // Offscreen fractal canvas
  useEffect(() => {
    fractalCanvasRef.current = document.createElement('canvas');
    return () => { fractalCanvasRef.current = null; };
  }, []);

  // ── Render loop ───────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── Native pointer handler ──────────────────────────
    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const s = stateRef.current;
      if (propsRef.current.reducedMotion) {
        s.reducedLevel = (s.reducedLevel + 1) % 3;
        s.zoom = [1, 20, 200][s.reducedLevel];
        s.needsRedraw = true;
        s.currentScanline = 0;
        onHaptic('step_advance');
        return;
      }
      s.targetZoom *= 2;
      s.needsRedraw = true;
      s.currentScanline = 0;
      onHaptic('step_advance');
    };

    canvas.addEventListener('pointerdown', onDown);

    const fractalCanvas = fractalCanvasRef.current;
    if (!fractalCanvas) return;
    const fctx = fractalCanvas.getContext('2d');
    if (!fctx) return;

    let raf = 0;

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

      // Ensure fractal canvas matches
      const fW = Math.round(w * 0.5); // render at half res for performance
      const fH = Math.round(h * 0.5);
      if (fractalCanvas.width !== fW || fractalCanvas.height !== fH) {
        fractalCanvas.width = fW;
        fractalCanvas.height = fH;
        s.needsRedraw = true;
        s.currentScanline = 0;
      }

      // Zoom animation
      if (!p.reducedMotion) {
        s.zoom += (s.targetZoom - s.zoom) * 0.02;

        // Auto-zoom (slow continuous)
        s.targetZoom *= (1 + ZOOM_SPEED);

        // Reset loop
        if (s.zoom > ZOOM_RESET_THRESHOLD) {
          s.zoom = 1;
          s.targetZoom = 1;
          s.zoomCentreIdx = (s.zoomCentreIdx + 1) % ZOOM_CENTRES.length;
          s.loops++;
          s.needsRedraw = true;
          s.currentScanline = 0;
          onHaptic('step_advance');
        }
      }

      // Progressive fractal rendering
      if (s.currentScanline < fH) {
        const centre = ZOOM_CENTRES[s.zoomCentreIdx];
        const zoomLevel = s.zoom;
        const rangeX = 3 / zoomLevel;
        const rangeY = (3 * fH / fW) / zoomLevel;
        const minX = centre.x - rangeX / 2;
        const minY = centre.y - rangeY / 2;

        const endLine = Math.min(fH, s.currentScanline + SCANLINES_PER_FRAME);

        const imageData = fctx.createImageData(fW, endLine - s.currentScanline);
        const data = imageData.data;

        for (let py = s.currentScanline; py < endLine; py++) {
          for (let px = 0; px < fW; px++) {
            const x0 = minX + (px / fW) * rangeX;
            const y0 = minY + (py / fH) * rangeY;

            let x = 0, y = 0;
            let iter = 0;
            while (x * x + y * y <= 4 && iter < MAX_ITER) {
              const xtemp = x * x - y * y + x0;
              y = 2 * x * y + y0;
              x = xtemp;
              iter++;
            }

            const idx = ((py - s.currentScanline) * fW + px) * 4;
            if (iter === MAX_ITER) {
              // Inside set
              const col = lerpColor(FRACTAL_DARK, primaryRgb, 0.02);
              data[idx] = col[0];
              data[idx + 1] = col[1];
              data[idx + 2] = col[2];
              data[idx + 3] = Math.round(ELEMENT_ALPHA.primary.max * ent * 255);
            } else {
              // Outside — colour by iteration
              const t = iter / MAX_ITER;
              let col: RGB;
              if (t < 0.33) {
                col = lerpColor(
                  lerpColor(FRACTAL_DARK, primaryRgb, 0.03),
                  lerpColor(FRACTAL_MID, primaryRgb, 0.04),
                  t / 0.33,
                );
              } else if (t < 0.66) {
                col = lerpColor(
                  lerpColor(FRACTAL_MID, primaryRgb, 0.04),
                  lerpColor(FRACTAL_BRIGHT, primaryRgb, 0.04),
                  (t - 0.33) / 0.33,
                );
              } else {
                col = lerpColor(
                  lerpColor(FRACTAL_BRIGHT, primaryRgb, 0.04),
                  lerpColor(FRACTAL_HOT, primaryRgb, 0.05),
                  (t - 0.66) / 0.34,
                );
              }
              data[idx] = col[0];
              data[idx + 1] = col[1];
              data[idx + 2] = col[2];
              data[idx + 3] = Math.round((ELEMENT_ALPHA.primary.min + t * (ELEMENT_ALPHA.primary.max - ELEMENT_ALPHA.primary.min)) * ent * 255);
            }
          }
        }

        fctx.putImageData(imageData, 0, s.currentScanline);
        s.currentScanline = endLine;
      }

      // Draw fractal to main canvas (scaled up)
      const bgCol = lerpColor(BG_BASE, primaryRgb, 0.02);
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgCol, ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgCol, ent * 0.015));
      bgGrad.addColorStop(1, rgba(bgCol, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(fractalCanvas, 0, 0, w, h);

      // Report
      onStateChange?.(Math.min(1, s.zoom / ZOOM_RESET_THRESHOLD));

      // Label
      if (s.loops > 0 || s.zoom > 10) {
        const labelAlpha = ELEMENT_ALPHA.text.min * ent * 0.5;
        ctx.font = `${Math.round(minDim * 0.013)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(FRACTAL_BRIGHT, primaryRgb, 0.05), labelAlpha);
        ctx.fillText('the structure repeats', cx, h * 0.92);
      }

      ctx.restore();
    };

    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport, onStateChange, onHaptic]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: viewport.width,
        height: viewport.height,
        display: 'block',
        touchAction: 'none',
        cursor: 'zoom-in',
      }}
    />
  );
}