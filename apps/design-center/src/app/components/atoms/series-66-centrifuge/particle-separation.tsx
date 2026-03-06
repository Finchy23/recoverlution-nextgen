/**
 * ATOM 655: THE PARTICLE SEPARATION ENGINE
 * ==========================================
 * Series 66 — The Centrifuge · Position 5
 *
 * Cure emotional enmeshment. Hold the centrifuge toggle — high-RPM
 * rotation forces muddy mixed fluid to stratify by atomic weight
 * into two perfectly clean distinct unmixed layers.
 *
 * SIGNATURE TECHNIQUE: Centrifugal force separation — visible
 * stratification of mixed particles into distinct colour bands.
 *
 * PHYSICS:
 *   - Vial of mixed muddy fluid (blended primary + accent particles)
 *   - Cannot distinguish own colour from contamination
 *   - Hold centrifuge toggle → high-RPM rotation
 *   - Heavier particles forced outward, lighter stay center
 *   - Muddy mess stratifies into 2 clean distinct layers
 *   - Boundary line sharpens as separation completes
 *
 * INTERACTION: Hold (centrifuge toggle) → stratification → clarity
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static separated layers
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE,
  PARTICLE_SIZE, motionScale, type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

const VIAL_WIDTH       = 0.15;
const VIAL_HEIGHT      = 0.6;
const PARTICLE_COUNT   = 60;
const SPIN_RATE        = 0.005;        // separation speed while holding
const BOUNDARY_SHARP   = 0.02;        // boundary sharpness threshold
const COMPLETION_SEP   = 0.9;          // separation needed to complete
const RESPAWN_DELAY    = 90;

// =====================================================================
// STATE
// =====================================================================

interface SepParticle {
  x: number; y: number;       // position within vial (0-1 normalized)
  weight: number;             // 0 = light (primary), 1 = heavy (accent)
  vx: number; vy: number;
}

interface SepState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  particles: SepParticle[];
  holding: boolean;
  rpm: number;
  separation: number;         // 0 = mixed, 1 = fully separated
  completed: boolean;
  respawnTimer: number;
  lastTier: number;
}

function makeParticles(): SepParticle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: 0.2 + Math.random() * 0.6,
    y: 0.1 + Math.random() * 0.8,
    weight: Math.random(),
    vx: 0, vy: 0,
  }));
}

function freshState(color: string, accent: string): SepState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accent),
    particles: makeParticles(),
    holding: false, rpm: 0, separation: 0,
    completed: false, respawnTimer: 0, lastTier: 0,
  };
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function ParticleSeparationAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef     = useRef({ onHaptic, onStateChange });
  const propsRef  = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef(freshState(color, accentColor));

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb  = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const render = () => {
      const s  = stateRef.current;
      const p  = propsRef.current;
      const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const breath = p.breathAmplitude;
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      const vialW = px(VIAL_WIDTH, minDim);
      const vialH = px(VIAL_HEIGHT, minDim);
      const vialX = cx - vialW / 2;
      const vialY = cy - vialH / 2;

      // ── LAYER 1: Atmosphere ─────────────────────────────────────
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      // ── PHYSICS ─────────────────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        if (s.holding) {
          s.rpm = Math.min(1, s.rpm + 0.01);
        } else {
          s.rpm *= 0.98;
        }

        // Centrifugal stratification: heavy particles pushed toward bottom
        if (s.rpm > 0.1) {
          for (const pt of s.particles) {
            const targetY = pt.weight; // heavy → bottom (1), light → top (0)
            pt.vy += (targetY - pt.y) * SPIN_RATE * s.rpm;
            pt.vy *= 0.92;
            pt.y += pt.vy;
            pt.y = Math.max(0.02, Math.min(0.98, pt.y));

            // Brownian wiggle
            pt.vx += (Math.random() - 0.5) * 0.002 * (1 - s.rpm);
            pt.vx *= 0.9;
            pt.x += pt.vx;
            pt.x = Math.max(0.05, Math.min(0.95, pt.x));
          }
        }

        // Measure separation quality
        let correctOrder = 0;
        const sorted = [...s.particles].sort((a, b) => a.y - b.y);
        for (let i = 0; i < sorted.length; i++) {
          if (sorted[i].weight < 0.5 && i < PARTICLE_COUNT / 2) correctOrder++;
          if (sorted[i].weight >= 0.5 && i >= PARTICLE_COUNT / 2) correctOrder++;
        }
        s.separation = correctOrder / PARTICLE_COUNT;
        cb.onStateChange?.(s.separation);

        const tier = Math.floor(s.separation * 5);
        if (tier > s.lastTier) {
          cb.onHaptic('step_advance');
          s.lastTier = tier;
        }

        if (s.separation >= COMPLETION_SEP) {
          s.completed = true;
          cb.onHaptic('completion');
          cb.onStateChange?.(1);
          s.respawnTimer = RESPAWN_DELAY;
        }
      }

      // ── LAYER 2: Vial structure ────────────────────────────────
      // Vial body (rounded rect outline)
      const vialR = px(0.015, minDim);
      ctx.beginPath();
      ctx.moveTo(vialX + vialR, vialY);
      ctx.lineTo(vialX + vialW - vialR, vialY);
      ctx.quadraticCurveTo(vialX + vialW, vialY, vialX + vialW, vialY + vialR);
      ctx.lineTo(vialX + vialW, vialY + vialH - vialR);
      ctx.quadraticCurveTo(vialX + vialW, vialY + vialH, vialX + vialW - vialR, vialY + vialH);
      ctx.lineTo(vialX + vialR, vialY + vialH);
      ctx.quadraticCurveTo(vialX, vialY + vialH, vialX, vialY + vialH - vialR);
      ctx.lineTo(vialX, vialY + vialR);
      ctx.quadraticCurveTo(vialX, vialY, vialX + vialR, vialY);
      ctx.closePath();
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
      ctx.lineWidth = px(STROKE.medium, minDim);
      ctx.stroke();

      // Vial background fill
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 1.5 * entrance);
      ctx.fill();

      // ── LAYER 3: Separation gradient ───────────────────────────
      if (s.separation > 0.3) {
        const sepAlpha = (s.separation - 0.3) * 0.3 * entrance;
        const midY = vialY + vialH * 0.5;

        // Top layer (primary)
        const topGrad = ctx.createLinearGradient(0, vialY, 0, midY);
        topGrad.addColorStop(0, rgba(s.primaryRgb, sepAlpha));
        topGrad.addColorStop(1, rgba(s.primaryRgb, sepAlpha * 0.3));
        ctx.fillStyle = topGrad;
        ctx.fillRect(vialX + 1, vialY + 1, vialW - 2, vialH / 2);

        // Bottom layer (accent)
        const botGrad = ctx.createLinearGradient(0, midY, 0, vialY + vialH);
        botGrad.addColorStop(0, rgba(s.accentRgb, sepAlpha * 0.3));
        botGrad.addColorStop(1, rgba(s.accentRgb, sepAlpha));
        ctx.fillStyle = botGrad;
        ctx.fillRect(vialX + 1, midY, vialW - 2, vialH / 2);
      }

      // ── LAYER 4: Boundary line ─────────────────────────────────
      if (s.separation > 0.5) {
        const boundaryY = vialY + vialH * 0.5;
        const sharpness = (s.separation - 0.5) * 2;
        ctx.beginPath();
        ctx.moveTo(vialX + 2, boundaryY);
        ctx.lineTo(vialX + vialW - 2, boundaryY);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * sharpness * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      // ── LAYER 5: Particles ─────────────────────────────────────
      for (const pt of s.particles) {
        const ptx = vialX + pt.x * vialW;
        const pty = vialY + pt.y * vialH;
        const ptColor = pt.weight < 0.5 ? s.primaryRgb : s.accentRgb;
        const ptSize = px(PARTICLE_SIZE.sm + pt.weight * 0.003, minDim);

        ctx.beginPath();
        ctx.arc(ptx, pty, ptSize, 0, Math.PI * 2);
        ctx.fillStyle = rgba(ptColor, ALPHA.content.max * 0.6 * entrance * ms);
        ctx.fill();
      }

      // ── LAYER 6: Spin motion indicators ────────────────────────
      if (s.rpm > 0.1) {
        const spinAlpha = s.rpm * ALPHA.atmosphere.min * 0.5 * entrance * ms;
        for (let i = 0; i < 4; i++) {
          const arcR = vialW / 2 + px(0.01 + i * 0.008, minDim);
          const arcAngle = s.frameCount * 0.08 * s.rpm + i * Math.PI / 2;
          ctx.beginPath();
          ctx.arc(cx, cy, arcR, arcAngle, arcAngle + Math.PI * 0.3);
          ctx.strokeStyle = rgba(s.primaryRgb, spinAlpha);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 7: Centrifuge toggle button ──────────────────────
      const btnR = px(0.03, minDim);
      const btnX = cx;
      const btnY = vialY + vialH + px(0.06, minDim);

      // Button glow
      if (s.holding) {
        const bGlow = ctx.createRadialGradient(btnX, btnY, 0, btnX, btnY, btnR * 3);
        bGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
        bGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = bGlow;
        ctx.fillRect(btnX - btnR * 3, btnY - btnR * 3, btnR * 6, btnR * 6);
      }

      ctx.beginPath();
      ctx.arc(btnX, btnY, btnR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, (s.holding ? ALPHA.content.max : ALPHA.atmosphere.max) * entrance);
      ctx.fill();
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
      ctx.lineWidth = px(STROKE.light, minDim);
      ctx.stroke();

      // Button label
      const bFontSize = Math.max(7, px(FONT_SIZE.xs, minDim));
      ctx.font = `${bFontSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = rgba(s.holding ? [255, 255, 255] as RGB : s.primaryRgb,
                           ALPHA.text.max * 0.6 * entrance);
      ctx.fillText('⟳', btnX, btnY);
      ctx.textBaseline = 'alphabetic';

      // ── LAYER 8: HUD ───────────────────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';
      const sepPct = Math.round(s.separation * 100);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.4 * entrance);
      ctx.fillText(`SEPARATION ${sepPct}%`, cx, vialY - px(0.025, minDim));

      if (!s.holding && !s.completed && s.rpm < 0.05) {
        const hintFont = Math.max(7, px(FONT_SIZE.xs, minDim));
        ctx.font = `${hintFont}px monospace`;
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.25 * entrance);
        ctx.fillText('HOLD TO SPIN', cx, btnY + btnR + px(0.025, minDim));
      }

      // ── Reduced motion ──────────────────────────────────────────
      if (p.reducedMotion) {
        const midY2 = vialY + vialH * 0.5;
        ctx.beginPath();
        ctx.moveTo(vialX + 2, midY2);
        ctx.lineTo(vialX + vialW - 2, midY2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      // ── Respawn ─────────────────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.particles = makeParticles(); s.rpm = 0; s.separation = 0;
          s.completed = false; s.lastTier = 0;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed) return;
      s.holding = true;
      cbRef.current.onHaptic('hold_start');
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.holding = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
