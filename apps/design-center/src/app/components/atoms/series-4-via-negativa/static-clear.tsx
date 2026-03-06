/**
 * ATOM 036: THE STATIC CLEAR ENGINE (Signal vs. Noise)
 * =====================================================
 * Series 4 — Via Negativa · Position 6
 *
 * Anxiety is just static. The true signal — the Sovereign
 * Mind — is always underneath it, waiting for the interference
 * to be cleared. This atom proves it physically.
 *
 * The screen is covered in visual TV-style static — chaotic,
 * agitated, dense white noise that obscures everything. But
 * beneath it lies a perfect, calm, warm gradient — the signal
 * that was always there. The user physically swipes across
 * the screen like a windshield wiper, clearing the static
 * to reveal the calm underneath.
 *
 * ARCHITECTURE:
 *   - Pre-allocated half-res noise canvas (regenerated every N frames)
 *   - Pre-allocated composite canvas (noise × mask → masked static)
 *   - Offscreen mask canvas (white = static visible, user erases to clear)
 *   - Pipeline: signal on main → masked noise composited on top
 *   - Track cleared percentage via grid sampling on mask
 *   - At 80% clear: remaining static auto-dissolves
 *
 * HAPTIC JOURNEY:
 *   Swipe → swipe_commit (static crackle under finger)
 *   50% cleared → step_advance (static weakens)
 *   80% cleared → completion (static auto-dissolves)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Slower static refresh, wider clear brush
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const BRUSH_RADIUS_FRAC = 0.055;
const AUTO_DISSOLVE_THRESHOLD = 0.80;
const DISSOLVE_SPEED = 0.012;
const STATIC_DENSITY = 0.35;
const NOISE_REFRESH_RATE = 2;
const SAMPLE_GRID = 20;
const STEP_THRESHOLD = 0.50;

// =====================================================================
// COLOR
// =====================================================================

// Palette
const BG_DARK: RGB = [45, 40, 55];
const BG_LIGHT: RGB = [55, 50, 45];
const BG_MID: RGB = [40, 38, 35];
const BG_GLOW: RGB = [120, 110, 100];

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function StaticClearAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  onHaptic,
  onStateChange,
  onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** Mask: white where static shows, transparent where cleared */
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  /** Half-res noise source */
  const noiseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  /** Full-res composite: noise × mask */
  const compositeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const noiseDataRef = useRef<ImageData | null>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; },
    [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    clearedFraction: 0,
    stepFired: false,
    resolved: false,
    autoDissolving: false,
    autoDissolveAlpha: 1,
    scrubFrames: 0,
    lastHapticFrame: 0,
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    initialized: false,
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
    const fullW = Math.round(w * dpr);
    const fullH = Math.round(h * dpr);

    // Half-res noise dimensions
    const noiseW = Math.round(w * 0.5);
    const noiseH = Math.round(h * 0.5);

    // ── Pre-allocate offscreen canvases ──────────────────
    if (!maskCanvasRef.current) maskCanvasRef.current = document.createElement('canvas');
    if (!noiseCanvasRef.current) noiseCanvasRef.current = document.createElement('canvas');
    if (!compositeCanvasRef.current) compositeCanvasRef.current = document.createElement('canvas');

    const maskCanvas = maskCanvasRef.current;
    const noiseCanvas = noiseCanvasRef.current;
    const compCanvas = compositeCanvasRef.current;

    // Size mask and composite at full resolution
    if (maskCanvas.width !== fullW || maskCanvas.height !== fullH || !s.initialized) {
      maskCanvas.width = fullW;
      maskCanvas.height = fullH;
      const mCtx = maskCanvas.getContext('2d')!;
      mCtx.fillStyle = 'white';
      mCtx.fillRect(0, 0, fullW, fullH);
    }

    if (compCanvas.width !== fullW || compCanvas.height !== fullH) {
      compCanvas.width = fullW;
      compCanvas.height = fullH;
    }

    // Size noise at half resolution
    if (noiseCanvas.width !== noiseW || noiseCanvas.height !== noiseH) {
      noiseCanvas.width = noiseW;
      noiseCanvas.height = noiseH;
    }

    if (!noiseDataRef.current || noiseDataRef.current.width !== noiseW) {
      noiseDataRef.current = new ImageData(noiseW, noiseH);
    }

    s.initialized = true;
    const noiseData = noiseDataRef.current;
    const noiseCtx = noiseCanvas.getContext('2d')!;
    const compCtx = compCanvas.getContext('2d')!;

    // Sample grid for cleared %
    const samplePoints: { x: number; y: number }[] = [];
    for (let gx = 0; gx < SAMPLE_GRID; gx++) {
      for (let gy = 0; gy < SAMPLE_GRID; gy++) {
        samplePoints.push({
          x: Math.round(((gx + 0.5) / SAMPLE_GRID) * fullW),
          y: Math.round(((gy + 0.5) / SAMPLE_GRID) * fullH),
        });
      }
    }

    let animId: number;

    const render = () => {
      const p = propsRef.current;
      const cb = cbRef.current;

      if (canvas.width !== fullW || canvas.height !== fullH) {
        canvas.width = fullW;
        canvas.height = fullH;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);
      s.frameCount++;

      // ── Entrance ──────────────────────────────────────
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const entrance = easeOutExpo(s.entranceProgress);

      // ── Cleared % (every 15 frames) ───────────────────
      if (s.frameCount % 15 === 0) {
        const maskCtx = maskCanvas.getContext('2d');
        if (maskCtx) {
          let clearedCount = 0;
          for (const sp of samplePoints) {
            const pixel = maskCtx.getImageData(sp.x, sp.y, 1, 1).data;
            if (pixel[3] < 30) clearedCount++;
          }
          s.clearedFraction = clearedCount / samplePoints.length;

          if (s.clearedFraction >= STEP_THRESHOLD && !s.stepFired) {
            s.stepFired = true;
            cb.onHaptic('step_advance');
          }
          if (s.clearedFraction >= AUTO_DISSOLVE_THRESHOLD && !s.autoDissolving) {
            s.autoDissolving = true;
          }
        }
      }

      // Auto-dissolve
      if (s.autoDissolving) {
        s.autoDissolveAlpha = Math.max(0, s.autoDissolveAlpha - DISSOLVE_SPEED);
        if (s.autoDissolveAlpha <= 0.01 && !s.resolved) {
          s.resolved = true;
          s.autoDissolveAlpha = 0;
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      }

      const effectiveClear = Math.max(
        s.clearedFraction,
        s.autoDissolving ? (1 - s.autoDissolveAlpha) : 0,
      );
      cb.onStateChange?.(effectiveClear);

      // ══════════════════════════════════════════════════
      // SIGNAL LAYER (calm gradient beneath the static)
      // ══════════════════════════════════════════════════

      // ── Background ────────────────────────────────────
      const sigTop = lerpColor(BG_DARK, s.primaryRgb, 0.005);
      const sigBot = lerpColor(BG_DARK, s.primaryRgb, 0.008);
      const sigGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      sigGrad.addColorStop(0, rgba(sigTop, entrance * 0.04));
      sigGrad.addColorStop(0.6, rgba(sigBot, entrance * 0.02));
      sigGrad.addColorStop(1, rgba(sigTop, 0));
      ctx.fillStyle = sigGrad;
      ctx.fillRect(0, 0, w, h);

      // Center warmth glow
      const sigGlowR = minDim * 0.35;
      const sigGlowColor = lerpColor(BG_GLOW, s.accentRgb, 0.1);
      const sigGlowAlpha = 0.02 * entrance * (0.8 + effectiveClear * 0.2);
      const gGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, sigGlowR);
      gGrad.addColorStop(0, rgba(sigGlowColor, sigGlowAlpha));
      gGrad.addColorStop(0.5, rgba(sigGlowColor, sigGlowAlpha * 0.3));
      gGrad.addColorStop(1, rgba(sigGlowColor, 0));
      ctx.fillStyle = gGrad;
      ctx.fillRect(0, 0, w, h);

      // Revelation brightening
      if (effectiveClear > 0.3) {
        const revAlpha = (effectiveClear - 0.3) * 0.02 * entrance;
        const revPulse = p.reducedMotion ? 1 : (0.9 + 0.1 * Math.sin(s.frameCount * 0.01));
        ctx.fillStyle = rgba(sigGlowColor, revAlpha * revPulse);
        ctx.fillRect(0, 0, w, h);
      }

      // ══════════════════════════════════════════════════
      // STATIC LAYER (noise × mask → composited on top)
      // ══════════════════════════════════════════════════

      if (s.autoDissolveAlpha > 0.01) {
        // Step 1: Generate noise into half-res buffer
        const refreshRate = p.reducedMotion ? NOISE_REFRESH_RATE * 3 : NOISE_REFRESH_RATE;
        if (s.frameCount % refreshRate === 0) {
          const data = noiseData.data;
          const staticEnergy = 1 - effectiveClear * 0.4;
          const density = STATIC_DENSITY * staticEnergy;
          const alphaScale = s.autoDissolveAlpha;

          for (let i = 0; i < data.length; i += 4) {
            if (Math.random() < density) {
              const bright = 80 + Math.random() * 100 * staticEnergy;
              data[i] = Math.round(bright * 0.95 + s.primaryRgb[0] * 0.05);
              data[i + 1] = Math.round(bright * 0.93 + s.primaryRgb[1] * 0.07);
              data[i + 2] = Math.round(bright * 0.92 + s.primaryRgb[2] * 0.08);
              data[i + 3] = Math.round(200 * staticEnergy * alphaScale);
            } else {
              const dark = 10 + Math.random() * 25;
              data[i] = Math.round(dark + s.primaryRgb[0] * 0.02);
              data[i + 1] = Math.round(dark + s.primaryRgb[1] * 0.02);
              data[i + 2] = Math.round(dark + s.primaryRgb[2] * 0.02);
              data[i + 3] = Math.round(140 * staticEnergy * alphaScale);
            }
          }
          noiseCtx.putImageData(noiseData, 0, 0);
        }

        // Step 2: Composite noise × mask on the composite canvas
        compCtx.clearRect(0, 0, fullW, fullH);
        // Draw noise (upscaled from half-res)
        compCtx.save();
        compCtx.imageSmoothingEnabled = false;
        compCtx.drawImage(noiseCanvas, 0, 0, fullW, fullH);
        // Apply mask: keep noise only where mask is opaque (white)
        compCtx.globalCompositeOperation = 'destination-in';
        compCtx.drawImage(maskCanvas, 0, 0);
        compCtx.restore();

        // Step 3: Draw masked noise onto main canvas
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(compCanvas, 0, 0, w, h);
        ctx.restore();

        // Subtle CRT scan lines
        if (!p.reducedMotion && s.autoDissolveAlpha > 0.1) {
          const scanAlpha = 0.015 * s.autoDissolveAlpha * entrance;
          const scanColor = lerpColor([0, 0, 0], s.primaryRgb, 0.01);
          const scanSpacing = Math.max(2, Math.round(minDim * 0.006));
          for (let y = 0; y < h; y += scanSpacing) {
            ctx.fillStyle = rgba(scanColor, scanAlpha);
            ctx.fillRect(0, y, w, 1);
          }
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    // ── Clear helper (inline) ───────────────────────────
    const clearAt = (px: number, py: number) => {
      const maskCtx = maskCanvasRef.current?.getContext('2d');
      if (!maskCtx) return;
      const brushR = (propsRef.current.reducedMotion ? BRUSH_RADIUS_FRAC * 1.5 : BRUSH_RADIUS_FRAC) * minDim * dpr;
      maskCtx.save();
      maskCtx.globalCompositeOperation = 'destination-out';
      maskCtx.beginPath();
      maskCtx.arc(px * dpr, py * dpr, brushR, 0, Math.PI * 2);
      maskCtx.fill();
      maskCtx.restore();

      const s = stateRef.current;
      s.scrubFrames++;
      if (s.scrubFrames - s.lastHapticFrame > 6) {
        s.lastHapticFrame = s.scrubFrames;
        cbRef.current.onHaptic('swipe_commit');
      }
    };

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      s.isDrawing = true;
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;
      s.lastX = px;
      s.lastY = py;
      clearAt(px, py);
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      if (!s.isDrawing) return;
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;
      const dx = px - s.lastX;
      const dy = py - s.lastY;
      const dist = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.ceil(dist / (minDim * BRUSH_RADIUS_FRAC * 0.4)));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        clearAt(s.lastX + dx * t, s.lastY + dy * t);
      }
      s.lastX = px;
      s.lastY = py;
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.isDrawing = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

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
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
          cursor: 'crosshair',
        }}
      />
    </div>
  );
}