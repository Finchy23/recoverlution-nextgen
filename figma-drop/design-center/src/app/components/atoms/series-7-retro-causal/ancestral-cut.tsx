/**
 * ATOM 068: THE ANCESTRAL CUT ENGINE
 * =====================================
 * Series 7 — Retro-Causal · Position 8
 *
 * Generational trauma is a movie that has been playing for 200 years.
 * You are the first one with the power to cut the film and refuse
 * to greenlight the sequel. Swipe horizontally to sever the chain.
 *
 * PHYSICS:
 *   - Vertical chain of linked ovals extending top to bottom
 *   - Horizontal swipe across centre severs the chain
 *   - Top half retracts upward with spring physics
 *   - Bottom half dissolves into particles that evaporate
 *   - Clean blank slate remains at centre
 *
 * INTERACTION:
 *   Swipe (horizontal) → sever the chain
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Chain snaps instantly, no retraction/dissolve animation
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

const CHAIN_DARK: RGB = [70, 60, 55];
const CHAIN_HIGHLIGHT: RGB = [100, 90, 80];
const CUT_FLASH: RGB = [255, 250, 240];
const PARTICLE_COLOR: RGB = [90, 75, 65];
const CLEAN_GLOW: RGB = [180, 175, 190];
const BG_BASE: RGB = [18, 16, 24];

// =====================================================================
// CONSTANTS
// =====================================================================

const LINK_COUNT = 22;
const LINK_W_RATIO = 0.035;
const LINK_H_RATIO = 0.025;
const SWIPE_THRESHOLD_RATIO = 0.09; // of minDim
const SWIPE_VELOCITY = 1.5;
const PARTICLES_PER_LINK = 6;

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  alpha: number;
  size: number;
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function AncestralCutAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    entranceProgress: 0,
    state: 'intact' as 'intact' | 'cutting' | 'retracting' | 'complete',
    // Swipe tracking
    pointerStartX: 0,
    pointerStartY: 0,
    pointerStartTime: 0,
    isPointerDown: false,
    // Cut animation
    cutLineAlpha: 0,
    cutLineWidth: 0,
    // Top half retraction
    topOffset: 0,
    topVelocity: 0,
    // Bottom half particles
    particles: [] as Particle[],
    // Clean slate glow
    slateGlow: 0,
    resolved: false,
    frame: 0,
  });
  const propsRef = useRef({
    breathAmplitude, reducedMotion, phase, color, accentColor,
  });

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  // ── Render loop ───────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const s = stateRef.current;
      if (s.state !== 'intact') return;
      s.isPointerDown = true;
      s.pointerStartX = e.clientX;
      s.pointerStartY = e.clientY;
      s.pointerStartTime = performance.now();
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      const s = stateRef.current;
      if (!s.isPointerDown || s.state !== 'intact') { s.isPointerDown = false; return; }
      s.isPointerDown = false;

      const deltaX = Math.abs(e.clientX - s.pointerStartX);
      const deltaY = Math.abs(e.clientY - s.pointerStartY);
      const elapsed = (performance.now() - s.pointerStartTime) / 1000;
      const velocity = elapsed > 0 ? deltaX / elapsed / 60 : 0;

      const rect = canvas.getBoundingClientRect();
      const py = (e.clientY - rect.top) / rect.height * h;
      const inMiddle = py > h * 0.35 && py < h * 0.65;

      if (deltaX > SWIPE_THRESHOLD_RATIO * minDim && velocity > SWIPE_VELOCITY && deltaX > deltaY * 2 && inMiddle) {
        onHaptic('swipe_commit');

        if (propsRef.current.reducedMotion) {
          s.state = 'complete';
          s.slateGlow = 1;
          s.resolved = true;
          onHaptic('completion');
          onResolve?.();
        } else {
          s.state = 'cutting';
          s.cutLineAlpha = 0.12;
          s.cutLineWidth = 0;

          const cx = w / 2;
          const linkH = minDim * LINK_H_RATIO * 2;
          const midIndex = Math.floor(LINK_COUNT / 2);

          for (let i = midIndex; i < LINK_COUNT; i++) {
            const ly = (i - midIndex) * linkH + h / 2 + linkH;
            for (let p = 0; p < PARTICLES_PER_LINK; p++) {
              s.particles.push({
                x: cx + (Math.random() - 0.5) * minDim * LINK_W_RATIO * 3,
                y: ly + (Math.random() - 0.5) * linkH,
                vx: (Math.random() - 0.5) * minDim * 0.003,
                vy: Math.random() * minDim * 0.003 + minDim * 0.001,
                alpha: ELEMENT_ALPHA.primary.min + Math.random() * 0.02,
                size: minDim * 0.003 * (0.5 + Math.random()),
              });
            }
          }
        }
      }
    };

    canvas.addEventListener('pointerdown', onDown);
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

      const primaryRgb = parseColor(p.color);
      const bgCol = lerpColor(BG_BASE, primaryRgb, 0.03);
      const { cx, cy } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      // Background
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgCol, ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgCol, ent * 0.015));
      bgGrad.addColorStop(1, rgba(bgCol, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const linkW = minDim * LINK_W_RATIO;
      const linkH = minDim * LINK_H_RATIO;
      const linkSpacing = linkH * 2.2;
      const chainCol = lerpColor(CHAIN_DARK, primaryRgb, 0.04);
      const highlightCol = lerpColor(CHAIN_HIGHLIGHT, primaryRgb, 0.04);
      const midIndex = Math.floor(LINK_COUNT / 2);

      // Update animations
      if (s.state === 'cutting') {
        s.cutLineWidth = Math.min(w, s.cutLineWidth + w * 0.15);
        s.cutLineAlpha *= 0.92;
        if (s.cutLineAlpha < 0.005) {
          s.state = 'retracting';
          s.topVelocity = -minDim * 0.012;
        }
      }

      if (s.state === 'retracting') {
        // Top half spring retraction
        s.topVelocity -= minDim * 0.0006; // decelerate (spring)
        s.topOffset += s.topVelocity;
        if (s.topOffset < -h * 0.6) {
          s.topOffset = -h * 0.6;
        }

        // Particles
        for (const pt of s.particles) {
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.vy += minDim * 0.0001;
          pt.alpha *= 0.985;
        }
        s.particles = s.particles.filter(pt => pt.alpha > 0.001 && pt.y < h + minDim * 0.03);

        // Slate glow
        s.slateGlow = Math.min(1, s.slateGlow + 0.015);

        if (s.particles.length === 0 && !s.resolved) {
          s.state = 'complete';
          s.resolved = true;
          onHaptic('completion');
          onResolve?.();
        }
      }

      // State report
      const progress = s.state === 'complete' ? 1 : s.state === 'retracting' ? 0.5 : 0;
      onStateChange?.(progress);

      // ── Draw chain links ───────────────────────────────
      const drawLink = (lx: number, ly: number, horizontal: boolean, alpha: number) => {
        ctx.strokeStyle = rgba(chainCol, alpha);
        ctx.lineWidth = minDim * 0.002;
        ctx.beginPath();
        if (horizontal) {
          ctx.ellipse(lx, ly, linkW, linkH * 0.6, 0, 0, Math.PI * 2);
        } else {
          ctx.ellipse(lx, ly, linkH * 0.6, linkW, 0, 0, Math.PI * 2);
        }
        ctx.stroke();

        // Highlight
        ctx.strokeStyle = rgba(highlightCol, alpha * 0.4);
        ctx.lineWidth = minDim * 0.0006;
        ctx.beginPath();
        if (horizontal) {
          ctx.ellipse(lx, ly - linkH * 0.15, linkW * 0.7, linkH * 0.3, 0, Math.PI * 1.1, Math.PI * 1.9);
        } else {
          ctx.ellipse(lx - linkH * 0.15, ly, linkH * 0.3, linkW * 0.7, 0, -Math.PI * 0.4, Math.PI * 0.4);
        }
        ctx.stroke();
      };

      if (s.state === 'intact' || s.state === 'cutting') {
        // Full chain
        const chainAlpha = ELEMENT_ALPHA.primary.max * ent;
        for (let i = 0; i < LINK_COUNT; i++) {
          const ly = cy + (i - midIndex) * linkSpacing;
          if (ly > -linkW * 2 && ly < h + linkW * 2) {
            drawLink(cx, ly, i % 2 === 0, chainAlpha);
          }
        }
      } else if (s.state === 'retracting' || s.state === 'complete') {
        // Top half (retracting)
        const topAlpha = ELEMENT_ALPHA.primary.max * ent;
        for (let i = 0; i < midIndex; i++) {
          const ly = cy + (i - midIndex) * linkSpacing + s.topOffset;
          if (ly > -linkW * 2 && ly < h) {
            drawLink(cx, ly, i % 2 === 0, topAlpha);
          }
        }
      }

      // ── Bottom particles ───────────────────────────────
      if (s.state === 'retracting') {
        const ptCol = lerpColor(PARTICLE_COLOR, primaryRgb, 0.04);
        for (const pt of s.particles) {
          ctx.fillStyle = rgba(ptCol, pt.alpha * ent);
          ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
        }
      }

      // ── Cut line flash ─────────────────────────────────
      if (s.state === 'cutting' && s.cutLineAlpha > 0.001) {
        const flashCol = lerpColor(CUT_FLASH, primaryRgb, 0.03);
        ctx.strokeStyle = rgba(flashCol, s.cutLineAlpha * ent);
        ctx.lineWidth = Math.max(1, minDim * 0.003);
        ctx.beginPath();
        ctx.moveTo(cx - s.cutLineWidth / 2, cy);
        ctx.lineTo(cx + s.cutLineWidth / 2, cy);
        ctx.stroke();
      }

      // ── Clean slate glow ───────────────────────────────
      if (s.slateGlow > 0) {
        const glowCol = lerpColor(CLEAN_GLOW, primaryRgb, 0.05);
        const glowR = minDim * 0.08 * s.slateGlow;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
        grad.addColorStop(0, rgba(glowCol, ELEMENT_ALPHA.glow.max * ent * s.slateGlow * 0.5));
        grad.addColorStop(1, rgba(glowCol, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Horizontal clean line
        ctx.strokeStyle = rgba(glowCol, ELEMENT_ALPHA.secondary.max * ent * s.slateGlow);
        ctx.lineWidth = minDim * 0.0006;
        ctx.beginPath();
        ctx.moveTo(cx - minDim * 0.15, cy);
        ctx.lineTo(cx + minDim * 0.15, cy);
        ctx.stroke();
      }

      // ── Instruction ────────────────────────────────────
      if (s.state === 'intact') {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        const labelCol = lerpColor(CHAIN_HIGHLIGHT, primaryRgb, 0.05);
        ctx.fillStyle = rgba(labelCol, ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText('swipe across the chain to sever it', cx, h * 0.88);
      }

      ctx.restore();
    };

    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
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