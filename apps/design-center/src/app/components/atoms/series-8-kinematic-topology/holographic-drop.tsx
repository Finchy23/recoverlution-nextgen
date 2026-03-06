/**
 * ATOM 080: THE HOLOGRAPHIC FRAGMENT ENGINE
 * ============================================
 * Series 8 — Kinematic Topology · Position 10
 *
 * The drop dies so the ocean can be born. Surrender ego to
 * integrate with the whole. A single water drop falls, impacts
 * a surface, and sends concentric ripples to infinity.
 *
 * PHYSICS:
 *   - Luminous drop falls from top of screen
 *   - Impact triggers expanding concentric ripples
 *   - Each ripple ring fades as it expands
 *   - Drop disappears on impact (ego dissolution)
 *   - Ripple rings keep expanding beyond viewport
 *
 * INTERACTION:
 *   Tap → release the drop
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Drop appears at impact, ripples shown statically
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, type RGB,
} from '../atom-utils';

const DROP_COLOR: RGB = [180, 200, 230];
const RIPPLE_COLOR: RGB = [140, 160, 200];
const SURFACE_COLOR: RGB = [60, 70, 100];
const GLOW_COLOR: RGB = [160, 180, 220];
const BG_BASE: RGB = [18, 16, 24];

const GRAVITY_RATIO = 0.0003; // multiplied by minDim per frame
const MAX_RIPPLES = 8;
const RIPPLE_EMIT_INTERVAL = 12;
const RIPPLE_SPEED_RATIO = 0.0036; // multiplied by minDim per frame

interface Ripple {
  radius: number;
  alpha: number;
  speed: number;
}

export default function HolographicDropAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    entranceProgress: 0,
    state: 'waiting' as 'waiting' | 'falling' | 'rippling' | 'complete',
    dropY: 0,
    dropVy: 0,
    dropAlpha: 1,
    surfaceY: 0,
    ripples: [] as Ripple[],
    rippleTimer: 0,
    ripplesEmitted: 0,
    impactGlow: 0,
    resolved: false,
    frame: 0,
  });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);

    // ── Native pointer handler ──────────────────────────
    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const s = stateRef.current;
      if (s.state !== 'waiting') return;
      s.surfaceY = h * 0.6;
      if (propsRef.current.reducedMotion) {
        s.state = 'rippling';
        s.dropY = s.surfaceY;
        s.dropAlpha = 0;
        s.impactGlow = 0.1;
        for (let i = 0; i < MAX_RIPPLES; i++) {
          s.ripples.push({ radius: minDim * 0.06 * (i + 1), alpha: 0.08 - i * 0.008, speed: RIPPLE_SPEED_RATIO * minDim });
        }
        s.ripplesEmitted = MAX_RIPPLES;
        onHaptic('tap');
      } else {
        s.state = 'falling';
        s.dropY = h * 0.08;
        s.dropVy = 0;
        onHaptic('tap');
      }
    };

    canvas.addEventListener('pointerdown', onDown);

    let raf: number;
    const render = () => {
      raf = requestAnimationFrame(render);
      const s = stateRef.current;
      const p = propsRef.current;
      s.frame++;

      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress;
      const ent = adv.entrance;

      const primaryRgb = parseColor(p.color);
      const { cx, cy } = setupCanvas(canvas, ctx, w, h);

      // Physics
      if (s.state === 'falling' && !p.reducedMotion) {
        const gravity = minDim * GRAVITY_RATIO;
        s.dropVy += gravity;
        s.dropY += s.dropVy;

        if (s.dropY >= s.surfaceY) {
          s.state = 'rippling';
          s.dropY = s.surfaceY;
          s.dropAlpha = 0;
          s.impactGlow = 0.12;
          onHaptic('entrance_land');
        }
      }

      if (s.state === 'rippling') {
        // Emit ripples
        s.rippleTimer++;
        const rippleSpeed = minDim * RIPPLE_SPEED_RATIO;
        if (s.rippleTimer >= RIPPLE_EMIT_INTERVAL && s.ripplesEmitted < MAX_RIPPLES) {
          s.ripples.push({ radius: 0, alpha: ELEMENT_ALPHA.primary.max, speed: rippleSpeed });
          s.ripplesEmitted++;
          s.rippleTimer = 0;
        }

        // Expand and fade ripples
        for (const r of s.ripples) {
          r.radius += r.speed;
          r.alpha *= 0.992;
        }
        s.ripples = s.ripples.filter(r => r.alpha > 0.002);

        s.impactGlow *= 0.98;

        if (s.ripplesEmitted >= MAX_RIPPLES && s.ripples.length === 0 && !s.resolved) {
          s.state = 'complete';
          s.resolved = true;
          onHaptic('completion');
          onResolve?.();
        }
      }

      const progress = s.state === 'complete' ? 1 :
        s.state === 'rippling' ? 0.3 + 0.7 * (s.ripplesEmitted / MAX_RIPPLES) :
        s.state === 'falling' ? 0.1 : 0;
      onStateChange?.(progress);

      // Background
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.015));
      bgGrad.addColorStop(1, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Surface line
      if (s.state !== 'waiting') {
        const surfCol = lerpColor(SURFACE_COLOR, primaryRgb, 0.04);
        ctx.strokeStyle = rgba(surfCol, ELEMENT_ALPHA.tertiary.max * ent);
        ctx.lineWidth = minDim * 0.0006;
        ctx.beginPath();
        ctx.moveTo(0, s.surfaceY);
        ctx.lineTo(w, s.surfaceY);
        ctx.stroke();
      }

      // Ripples
      const rippleCol = lerpColor(RIPPLE_COLOR, primaryRgb, 0.04);
      for (const r of s.ripples) {
        ctx.strokeStyle = rgba(rippleCol, r.alpha * ent);
        ctx.lineWidth = minDim * 0.0006;
        ctx.beginPath();
        ctx.ellipse(cx, s.surfaceY, r.radius, r.radius * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Impact glow
      if (s.impactGlow > 0.001) {
        const glowCol = lerpColor(GLOW_COLOR, primaryRgb, 0.04);
        const glowR = minDim * 0.06;
        const grad = ctx.createRadialGradient(cx, s.surfaceY, 0, cx, s.surfaceY, glowR);
        grad.addColorStop(0, rgba(glowCol, s.impactGlow * ent));
        grad.addColorStop(1, rgba(glowCol, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, s.surfaceY, glowR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Drop
      if (s.dropAlpha > 0.01) {
        const dropCol = lerpColor(DROP_COLOR, primaryRgb, 0.04);
        const dropR = minDim * 0.012;

        // Glow
        const dGlowR = dropR * 3;
        const dGrad = ctx.createRadialGradient(cx, s.dropY, 0, cx, s.dropY, dGlowR);
        dGrad.addColorStop(0, rgba(dropCol, ELEMENT_ALPHA.glow.max * ent * s.dropAlpha * 0.5));
        dGrad.addColorStop(1, rgba(dropCol, 0));
        ctx.fillStyle = dGrad;
        ctx.beginPath();
        ctx.arc(cx, s.dropY, dGlowR, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = rgba(dropCol, ELEMENT_ALPHA.primary.max * ent * s.dropAlpha);
        ctx.beginPath();
        ctx.arc(cx, s.dropY, dropR, 0, Math.PI * 2);
        ctx.fill();

        // Teardrop tail
        if (s.state === 'falling' && !p.reducedMotion) {
          ctx.fillStyle = rgba(dropCol, ELEMENT_ALPHA.secondary.max * ent * s.dropAlpha);
          ctx.beginPath();
          ctx.moveTo(cx - dropR * 0.5, s.dropY);
          ctx.lineTo(cx, s.dropY - dropR * 3);
          ctx.lineTo(cx + dropR * 0.5, s.dropY);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Instruction
      if (s.state === 'waiting') {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(DROP_COLOR, primaryRgb, 0.05), ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText('tap to release the drop', cx, h * 0.5);
      }

      // Resolution label
      if (s.state === 'complete') {
        ctx.font = `${Math.round(minDim * 0.013)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(RIPPLE_COLOR, primaryRgb, 0.05), ELEMENT_ALPHA.text.min * ent * 0.4);
        ctx.fillText('the drop becomes the ocean', cx, s.surfaceY + minDim * 0.08);
      }

      ctx.restore();
    };

    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport, onStateChange, onHaptic, onResolve]);

  return (
    <canvas ref={canvasRef}
      style={{ width: viewport.width, height: viewport.height, display: 'block', touchAction: 'none', cursor: 'pointer' }}
    />
  );
}