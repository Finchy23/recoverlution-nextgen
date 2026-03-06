/**
 * ATOM 071: THE OVERVIEW ENGINE
 * ===============================
 * Series 8 — Kinematic Topology · Position 1
 *
 * From orbit, borders and deadlines disappear. Pull the camera
 * back until the crisis shrinks from a massive wall of text into
 * a single pixel floating as a marble in the cosmos.
 *
 * PHYSICS:
 *   - 5 zoom regimes with distinct visual content
 *   - Exponential zoom curve: first zoom is fast, later is vast
 *   - Crossfade between regime renderings
 *   - Background: claustrophobic grey → pure black
 *   - Final marble: tiny radial gradient with atmospheric glow
 *
 * INTERACTION:
 *   Drag (vertical) or Pinch → zoom out exponentially
 *   Tap (reducedMotion) → cycle discrete zoom levels
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Tap cycles through 5 regimes discretely
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

const TEXT_PANIC: RGB = [200, 70, 70];
const PARAGRAPH_BG: RGB = [80, 70, 90];
const PAGE_COLOR: RGB = [100, 95, 110];
const CONTINENT: RGB = [90, 130, 160];
const MARBLE_BLUE: RGB = [100, 160, 220];
const MARBLE_GLOW: RGB = [140, 190, 240];
const COSMOS_BG: RGB = [4, 3, 8];
const CLOSE_BG: RGB = [35, 30, 45];
const BG_BASE: RGB = [18, 16, 24];

// =====================================================================
// ZOOM REGIME LABELS
// =====================================================================

const REGIME_LABELS = [
  '', // 0: close — text fills screen
  '', // 1: paragraph view
  '', // 2: page view
  '', // 3: continent
  'the marble', // 4: orbital
];

// =====================================================================
// COMPONENT
// =====================================================================

export default function OverviewEffectAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    entranceProgress: 0,
    zoomT: 0, // 0 = closest, 1 = orbital
    targetZoomT: 0,
    regime: 0,
    isDragging: false,
    dragStartY: 0,
    dragStartT: 0,
    lastRegime: 0,
    resolved: false,
    frame: 0,
  });
  const propsRef = useRef({
    breathAmplitude, reducedMotion, phase, color, accentColor,
  });

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  // ── Pointer handlers ──────────────────────────────────────

  // ── Render loop ───────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const s = stateRef.current;
      if (propsRef.current.reducedMotion) {
        s.regime = Math.min(4, s.regime + 1);
        s.targetZoomT = s.regime / 4;
        onHaptic('step_advance');
        if (s.regime >= 4 && !s.resolved) {
          s.resolved = true;
          onHaptic('completion');
          onResolve?.();
        }
        return;
      }
      s.isDragging = true;
      s.dragStartY = e.clientY;
      s.dragStartT = s.zoomT;
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.isDragging) return;
      const deltaY = s.dragStartY - e.clientY;
      const range = h * 0.5;
      const rawT = s.dragStartT + deltaY / range;
      s.targetZoomT = Math.max(0, Math.min(1, rawT));
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      const s = stateRef.current;
      s.isDragging = false;
      if (s.targetZoomT > 0.9 && !s.resolved) {
        s.targetZoomT = 1;
        s.resolved = true;
        onHaptic('completion');
        onResolve?.();
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let raf = 0;

    const render = () => {
      raf = requestAnimationFrame(render);
      const s = stateRef.current;
      const p = propsRef.current;
      s.frame++;

      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress;
      const ent = adv.entrance;

      // Zoom smoothing
      const zLerp = p.reducedMotion ? 0.3 : 0.04;
      s.zoomT += (s.targetZoomT - s.zoomT) * zLerp;

      // Current regime (0-4)
      const currentRegime = Math.min(4, Math.floor(s.zoomT * 5));
      if (currentRegime !== s.lastRegime) {
        s.lastRegime = currentRegime;
        s.regime = currentRegime;
        if (!p.reducedMotion) onHaptic('step_advance');
      }

      onStateChange?.(s.zoomT);

      const primaryRgb = parseColor(p.color);
      const { cx, cy, minDim } = setupCanvas(canvas, ctx, w, h);

      // Background — transitions from claustrophobic grey to OLED black
      const bgCol = lerpColor(
        lerpColor(CLOSE_BG, primaryRgb, 0.03),
        lerpColor(COSMOS_BG, primaryRgb, 0.01),
        s.zoomT,
      );
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgCol, ent * 0.03 + s.zoomT * 0.02));
      bgGrad.addColorStop(0.6, rgba(bgCol, (ent * 0.03 + s.zoomT * 0.02) * 0.5));
      bgGrad.addColorStop(1, rgba(bgCol, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const t = s.zoomT;

      // ── Regime 0: PANIC TEXT (close) ───────────────────
      if (t < 0.3) {
        const rAlpha = ELEMENT_ALPHA.text.max * ent * Math.max(0, 1 - t / 0.25);
        const textCol = lerpColor(TEXT_PANIC, primaryRgb, 0.06);
        ctx.fillStyle = rgba(textCol, rAlpha);

        const words = ['DEADLINE', 'CRISIS', 'PANIC', 'URGENT', 'FAILURE', 'LATE', 'BROKEN', 'HELP'];
        const fontSize = Math.round(minDim * 0.045 * (1 - t));
        ctx.font = `700 ${Math.max(4, fontSize)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';

        for (let i = 0; i < words.length; i++) {
          const row = Math.floor(i / 2);
          const col = i % 2;
          const wx = cx + (col - 0.5) * minDim * 0.3 * (1 - t);
          const wy = cy + (row - 1.5) * minDim * 0.08 * (1 - t);
          ctx.fillText(words[i], wx, wy);
        }
      }

      // ── Regime 1: PARAGRAPH (shrinking block) ──────────
      if (t > 0.1 && t < 0.5) {
        const rAlpha = ELEMENT_ALPHA.primary.max * ent *
          Math.min(1, (t - 0.1) / 0.1) * Math.max(0, 1 - (t - 0.3) / 0.15);
        const blockScale = Math.max(0.1, 1 - (t - 0.1) * 3);
        const bw = minDim * 0.6 * blockScale;
        const bh = minDim * 0.3 * blockScale;
        const blockCol = lerpColor(PARAGRAPH_BG, primaryRgb, 0.04);
        ctx.fillStyle = rgba(blockCol, rAlpha);
        ctx.fillRect(cx - bw / 2, cy - bh / 2, bw, bh);

        // Line suggestions
        ctx.fillStyle = rgba(blockCol, rAlpha * 0.4);
        for (let i = 0; i < 5; i++) {
          const lw = bw * (0.5 + Math.sin(i * 2.3) * 0.3);
          ctx.fillRect(cx - lw / 2, cy - bh / 2 + bh * 0.15 + i * bh * 0.14, lw, bh * 0.04);
        }
      }

      // ── Regime 2: PAGE (small rect) ────────────────────
      if (t > 0.3 && t < 0.7) {
        const rAlpha = ELEMENT_ALPHA.primary.min * ent *
          Math.min(1, (t - 0.3) / 0.1) * Math.max(0, 1 - (t - 0.5) / 0.15);
        const pageScale = Math.max(0.05, 1 - (t - 0.3) * 4);
        const pw = minDim * 0.12 * pageScale;
        const ph = minDim * 0.16 * pageScale;
        const pageCol = lerpColor(PAGE_COLOR, primaryRgb, 0.04);
        ctx.fillStyle = rgba(pageCol, rAlpha);
        ctx.fillRect(cx - pw / 2, cy - ph / 2, pw, ph);
      }

      // ── Regime 3: CONTINENT (organic shape) ────────────
      if (t > 0.55 && t < 0.9) {
        const rAlpha = ELEMENT_ALPHA.primary.min * ent *
          Math.min(1, (t - 0.55) / 0.1) * Math.max(0, 1 - (t - 0.75) / 0.12);
        const contScale = Math.max(0.02, 1 - (t - 0.55) * 5);
        const contR = minDim * 0.04 * contScale;
        const contCol = lerpColor(CONTINENT, primaryRgb, 0.05);
        ctx.fillStyle = rgba(contCol, rAlpha);
        ctx.beginPath();
        // Organic continent blob
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const noise = 0.7 + Math.sin(i * 3.7) * 0.3;
          const px = cx + Math.cos(angle) * contR * noise;
          const py = cy + Math.sin(angle) * contR * noise;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      }

      // ── Regime 4: MARBLE (tiny blue dot in void) ───────
      if (t > 0.75) {
        const rAlpha = Math.min(1, (t - 0.75) / 0.15);
        const marbleR = minDim * 0.008;
        const marbleCol = lerpColor(MARBLE_BLUE, primaryRgb, 0.05);
        const glowCol = lerpColor(MARBLE_GLOW, primaryRgb, 0.04);

        // Atmospheric glow ring
        const glowR = marbleR * 5;
        const breathPulse = p.reducedMotion ? 0 : p.breathAmplitude * glowR * 0.15;
        const aGrad = ctx.createRadialGradient(cx, cy, marbleR, cx, cy, glowR + breathPulse);
        aGrad.addColorStop(0, rgba(glowCol, ELEMENT_ALPHA.glow.max * ent * rAlpha * 0.3));
        aGrad.addColorStop(1, rgba(glowCol, 0));
        ctx.fillStyle = aGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, glowR + breathPulse, 0, Math.PI * 2);
        ctx.fill();

        // Marble core
        const cGrad = ctx.createRadialGradient(cx - marbleR * 0.3, cy - marbleR * 0.3, 0, cx, cy, marbleR);
        cGrad.addColorStop(0, rgba(glowCol, ELEMENT_ALPHA.primary.max * ent * rAlpha));
        cGrad.addColorStop(1, rgba(marbleCol, ELEMENT_ALPHA.primary.min * ent * rAlpha));
        ctx.fillStyle = cGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, marbleR, 0, Math.PI * 2);
        ctx.fill();

        // Stars (tiny dots)
        if (!p.reducedMotion) {
          const starCol = lerpColor(MARBLE_GLOW, primaryRgb, 0.03);
          for (let i = 0; i < 20; i++) {
            const sx = cx + Math.sin(i * 7.3 + 1.2) * minDim * 0.4;
            const sy = cy + Math.cos(i * 5.1 + 2.7) * minDim * 0.35;
            const sa = ELEMENT_ALPHA.tertiary.min * ent * rAlpha * (0.5 + Math.sin(s.frame * 0.02 + i) * 0.5);
            ctx.fillStyle = rgba(starCol, sa);
            const starSz = minDim * 0.002;
            ctx.fillRect(sx, sy, starSz, starSz);
          }
        }
      }

      // ── Label ──────────────────────────────────────────
      if (t > 0.85) {
        const labelAlpha = ELEMENT_ALPHA.text.min * ent * Math.min(1, (t - 0.85) / 0.1) * 0.6;
        const labelCol = lerpColor(MARBLE_GLOW, primaryRgb, 0.05);
        ctx.font = `${Math.round(minDim * 0.014)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(labelCol, labelAlpha);
        ctx.fillText('from here, you cannot see your deadline', cx, cy + minDim * 0.08);
      }

      // ── Instruction ────────────────────────────────────
      if (t < 0.1 && !s.resolved) {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        const instrCol = lerpColor(TEXT_PANIC, primaryRgb, 0.06);
        ctx.fillStyle = rgba(instrCol, ELEMENT_ALPHA.text.min * ent * 0.6);
        ctx.fillText(
          p.reducedMotion ? 'tap to zoom out' : 'drag up to zoom out',
          cx, h * 0.9,
        );
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
    <canvas
      ref={canvasRef}
      style={{
        width: viewport.width,
        height: viewport.height,
        display: 'block',
        touchAction: 'none',
      }}
    />
  );
}