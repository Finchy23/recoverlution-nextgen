/**
 * ATOM 630: THE INVINCIBLE MEMBRANE ENGINE
 * ==========================================
 * Series 63 — Elastic Yield · Position 10 (APEX)
 *
 * The apex: true invulnerability is infinite capacity to stretch.
 * The sharp spear pushes incredibly deep but the math holds. It
 * cannot pierce the fabric. It runs out of momentum and is gently
 * pushed back out by the unbroken yielding core.
 *
 * SIGNATURE TECHNIQUE: Stress Tensor Visualization
 *   - Membrane at rest: zero-stress cool blue mesh grid
 *   - Spear approach: threat stress builds (ambient red)
 *   - Impact: stress radiates from penetration point (red→white at tip)
 *   - Stretch: per-mesh-cell stress based on distance from deformation apex
 *   - Maximum stretch: membrane fabric at yield limit (white-hot at tip, cool at edges)
 *   - Expulsion: stress drains as geometry recovers (white→red→blue)
 *   - Final: pristine zero-stress membrane = unbreakable core
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + threat ambient gradient
 *   2. Stress field halo (deformation energy visualization)
 *   3. Membrane mesh grid with per-cell stress coloring
 *   4. Membrane deformation geometry (stretched cone)
 *   5. Spear with velocity trail + specular highlights
 *   6. Tension lines from tip to mesh anchors
 *   7. Energy field + recovery bloom particles
 *   8. Progress ring + seal stamp bloom
 *
 * PHYSICS:
 *   - Spear approaches at high velocity from left
 *   - Impact deforms membrane into deep cone shape
 *   - Stress = local curvature × stretch factor
 *   - Spear decelerates: F_resist = -k * stretch^2 (non-linear)
 *   - Momentum exhaustion → elastic restoring force pushes spear back
 *   - Membrane recovers to original zero-stress state
 *   - Breath modulates membrane shimmer + stress glow intensity
 *
 * INTERACTION:
 *   Observe → spear impact → impossible stretch → expulsion
 *   (entrance_land, step_advance, seal_stamp)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static membrane with faint stretch contour
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, GLOW, FONT_SIZE, motionScale, type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// STRESS TENSOR HELPER
// ═════════════════════════════════════════════════════════════════════

function stressHeat(s: number): RGB {
  if (s < 0.25) return lerpColor([50, 90, 200] as RGB, [60, 180, 130] as RGB, s / 0.25);
  if (s < 0.5) return lerpColor([60, 180, 130] as RGB, [220, 200, 50] as RGB, (s - 0.25) / 0.25);
  if (s < 0.75) return lerpColor([220, 200, 50] as RGB, [220, 80, 60] as RGB, (s - 0.5) / 0.25);
  return lerpColor([220, 80, 60] as RGB, [255, 240, 240] as RGB, (s - 0.75) / 0.25);
}

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Membrane radius (hero element) */
const MEMBRANE_R = SIZE.xl;
/** Membrane mesh grid resolution (per axis) */
const MESH_RES = 10;
/** Spear length as fraction of minDim */
const SPEAR_LEN = 0.18;
/** Spear start X (fraction from left) */
const SPEAR_START_X = -0.15;
/** Spear initial velocity (fraction per frame) */
const SPEAR_VX = 0.0055;
/** Membrane X position (center fraction) */
const MEMBRANE_CX_FRAC = 0.55;
/** Non-linear resistance coefficient */
const RESIST_K = 0.00015;
/** Maximum stretch depth (fraction of minDim) */
const MAX_STRETCH = 0.28;
/** Stretch at which momentum exhausts (fraction of max) */
const EXHAUST_THRESHOLD = 0.92;
/** Expulsion acceleration */
const EXPEL_ACCEL = 0.0002;
/** Expulsion initial speed */
const EXPEL_INIT = -0.002;
/** Membrane recovery speed */
const MEMBRANE_RECOVERY = 0.015;
/** Tension line count from tip to anchors */
const TENSION_LINE_COUNT = 8;
/** Progress ring radius */
const PROGRESS_RING_R = SIZE.md * 0.85;
/** Respawn delay */
const RESPAWN_DELAY = 120;
/** Bloom duration (seal stamp) */
const BLOOM_DURATION = 60;
/** Spear trail length */
const TRAIL_LEN = 10;
/** Specular intensity */
const SPECULAR_K = 0.3;
/** Breath shimmer */
const BREATH_SHIMMER = 0.12;
/** Recovery particle count */
const PARTICLE_COUNT = 30;
/** Particle lifetime */
const PARTICLE_LIFE = 50;
/** Stress field glow layers */
const FIELD_LAYERS = 4;

// ═════════════════════════════════════════════════════════════════════
// STATE INTERFACES
// ═════════════════════════════════════════════════════════════════════

interface RecoveryParticle {
  x: number; y: number;
  vx: number; vy: number;
  life: number;
  stress: number; // initial stress level → fades to zero
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function InvincibleMembraneAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    // Spear state
    spearX: SPEAR_START_X,
    spearVx: SPEAR_VX,
    // Phase
    approaching: true,
    impacting: false,
    stretch: 0,
    maxStretchReached: false,
    expelling: false,
    completed: false,
    respawnTimer: 0,
    lastTier: 0,
    // Trail
    trail: [] as { x: number }[],
    // Particles
    particles: [] as RecoveryParticle[],
    // Bloom
    bloomT: -1,
    // Membrane recovery (0 = stretched, 1 = recovered)
    recovery: 0,
  });

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const breath = p.breathAmplitude; s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      const memCx = w * MEMBRANE_CX_FRAC;
      const memR = px(MEMBRANE_R, minDim);
      const spearLen = minDim * SPEAR_LEN;
      const maxStretchPx = minDim * MAX_STRETCH;

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Atmosphere + threat ambient
      // ════════════════════════════════════════════════════
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      // Threat ambient (red from left during approach)
      if (s.approaching || s.impacting) {
        const threatIntensity = s.approaching ? 0.5 : (1 - s.stretch / MAX_STRETCH * 0.3);
        const tg = ctx.createLinearGradient(0, 0, w * 0.3, 0);
        tg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.min * 0.03 * threatIntensity * entrance));
        tg.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = tg; ctx.fillRect(0, 0, w, h);
      }

      // ── Reduced motion ─────────────────────────────────
      if (p.reducedMotion) {
        // Static membrane with faint stretch contour
        ctx.beginPath(); ctx.arc(memCx, cy, memR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(stressHeat(0.05), ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim); ctx.stroke();
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * entrance); ctx.fill();
        // Mesh grid
        for (let i = 0; i < MESH_RES; i++) {
          const t = (i + 1) / (MESH_RES + 1);
          const x = memCx - memR + t * memR * 2;
          ctx.beginPath(); ctx.moveTo(x, cy - memR); ctx.lineTo(x, cy + memR);
          ctx.strokeStyle = rgba(stressHeat(0.03), ALPHA.atmosphere.min * 0.5 * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
          const y = cy - memR + t * memR * 2;
          ctx.beginPath(); ctx.moveTo(memCx - memR, y); ctx.lineTo(memCx + memR, y);
          ctx.strokeStyle = rgba(stressHeat(0.03), ALPHA.atmosphere.min * 0.5 * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
        }
        // Subtle stretch contour
        ctx.beginPath(); ctx.arc(memCx - memR * 0.3, cy, memR * 0.15, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(stressHeat(0.2), ALPHA.atmosphere.min * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      // ── Physics ─────────────────────────────────────────
      if (!s.completed) {
        // Approach
        if (s.approaching) {
          s.spearX += s.spearVx;
          s.trail.push({ x: s.spearX });
          if (s.trail.length > TRAIL_LEN) s.trail.shift();

          if (s.spearX * w >= memCx - memR) {
            s.approaching = false;
            s.impacting = true;
            cb.onHaptic('entrance_land');
          }
        }

        // Impact + stretch
        if (s.impacting) {
          // Non-linear resistance: stronger the deeper it goes
          const resistForce = RESIST_K * s.stretch * s.stretch;
          s.spearVx = Math.max(0, s.spearVx - resistForce);
          s.spearX += s.spearVx * 0.3;
          s.stretch = Math.min(MAX_STRETCH, s.stretch + s.spearVx * 6);

          cb.onStateChange?.(s.stretch / MAX_STRETCH * 0.7);
          const tier = Math.floor(s.stretch / MAX_STRETCH * 5);
          if (tier > s.lastTier) { cb.onHaptic('step_advance'); s.lastTier = tier; }

          // Momentum exhaustion
          if (s.spearVx < 0.0002 || s.stretch >= MAX_STRETCH * EXHAUST_THRESHOLD) {
            s.impacting = false;
            s.expelling = true;
            s.maxStretchReached = true;
            s.spearVx = EXPEL_INIT;
            // Spawn recovery particles
            for (let i = 0; i < PARTICLE_COUNT; i++) {
              const angle = Math.random() * Math.PI * 2;
              const dist = memR * (0.3 + Math.random() * 0.7);
              s.particles.push({
                x: memCx - s.stretch * minDim * 0.3 + Math.cos(angle) * dist * 0.2,
                y: cy + Math.sin(angle) * dist * 0.3,
                vx: Math.cos(angle) * (0.3 + Math.random() * 0.8),
                vy: Math.sin(angle) * (0.3 + Math.random() * 0.8),
                life: PARTICLE_LIFE,
                stress: 0.5 + Math.random() * 0.5,
              });
            }
          }
        }

        // Expulsion
        if (s.expelling) {
          s.spearVx -= EXPEL_ACCEL; // accelerate backward (vx becomes more negative)
          s.spearX += s.spearVx;
          s.stretch = Math.max(0, s.stretch - MEMBRANE_RECOVERY);
          s.recovery = 1 - (s.stretch / MAX_STRETCH);

          if (s.spearX < SPEAR_START_X - 0.1) {
            s.completed = true;
            s.bloomT = 0;
            cb.onHaptic('seal_stamp');
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          }
        }
      }

      // Particle physics
      for (const pt of s.particles) {
        pt.x += pt.vx; pt.y += pt.vy;
        pt.vx *= 0.97; pt.vy *= 0.97;
        pt.life--;
        pt.stress = Math.max(0, pt.stress - 0.015);
      }
      s.particles = s.particles.filter(pt => pt.life > 0);

      // Bloom
      if (s.bloomT >= 0) { s.bloomT++; if (s.bloomT > BLOOM_DURATION) s.bloomT = -1; }

      // ── Derived values ──────────────────────────────────
      const stretchPx = s.stretch * minDim;
      const stretchFrac = s.stretch / MAX_STRETCH;
      const tipX = memCx - stretchPx * 0.8; // deformation tip position

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Stress field halo
      // ════════════════════════════════════════════════════
      if (stretchFrac > 0.05) {
        for (let layer = 0; layer < FIELD_LAYERS; layer++) {
          const layerR = memR * (1.2 + layer * 0.2 + stretchFrac * 0.5);
          const layerAlpha = ALPHA.glow.max * 0.03 * stretchFrac * (1 - layer / FIELD_LAYERS) * entrance;
          const fg = ctx.createRadialGradient(tipX, cy, memR * 0.2, tipX, cy, layerR);
          fg.addColorStop(0, rgba(stressHeat(stretchFrac * 0.8), layerAlpha));
          fg.addColorStop(0.5, rgba(stressHeat(stretchFrac * 0.4), layerAlpha * 0.4));
          fg.addColorStop(1, rgba(stressHeat(stretchFrac * 0.2), 0));
          ctx.fillStyle = fg;
          ctx.fillRect(tipX - layerR, cy - layerR, layerR * 2, layerR * 2);
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Membrane mesh grid with stress
      // ════════════════════════════════════════════════════
      // Draw the mesh grid on the membrane circle, deformed by stretch
      for (let row = 0; row <= MESH_RES; row++) {
        for (let col = 0; col <= MESH_RES; col++) {
          const u = col / MESH_RES; const v = row / MESH_RES;
          // Map to circle
          const nx = (u - 0.5) * 2; const ny = (v - 0.5) * 2;
          const dist = Math.sqrt(nx * nx + ny * ny);
          if (dist > 1.05) continue;

          const baseX = memCx + nx * memR;
          const baseY = cy + ny * memR;

          // Deformation: points closer to left edge get pushed further
          const deformFactor = Math.max(0, 1 - dist) * Math.max(0, 1 - (nx + 1) / 2 * 1.5);
          const defX = baseX - stretchPx * deformFactor * 0.6;
          const defY = baseY;

          // Stress = deformation amount
          const cellStress = deformFactor * stretchFrac;

          // Draw grid lines to neighbors
          if (col < MESH_RES) {
            const nu2 = (col + 1) / MESH_RES;
            const nx2 = (nu2 - 0.5) * 2;
            const dist2 = Math.sqrt(nx2 * nx2 + ny * ny);
            if (dist2 <= 1.05) {
              const bx2 = memCx + nx2 * memR;
              const df2 = Math.max(0, 1 - dist2) * Math.max(0, 1 - (nx2 + 1) / 2 * 1.5);
              const dx2 = bx2 - stretchPx * df2 * 0.6;
              const lineStress = (cellStress + df2 * stretchFrac) / 2;

              ctx.beginPath(); ctx.moveTo(defX, defY); ctx.lineTo(dx2, baseY);
              ctx.strokeStyle = rgba(
                stressHeat(lineStress),
                ALPHA.atmosphere.min * (0.3 + lineStress * 0.5) * entrance * (1 + breath * BREATH_SHIMMER * 0.3)
              );
              ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
            }
          }

          if (row < MESH_RES) {
            const nv2 = (row + 1) / MESH_RES;
            const ny2 = (nv2 - 0.5) * 2;
            const dist2 = Math.sqrt(nx * nx + ny2 * ny2);
            if (dist2 <= 1.05) {
              const by2 = cy + ny2 * memR;
              const df2 = Math.max(0, 1 - dist2) * Math.max(0, 1 - (nx + 1) / 2 * 1.5);
              const dy2 = by2;

              const lineStress = (cellStress + df2 * stretchFrac) / 2;
              ctx.beginPath(); ctx.moveTo(defX, defY); ctx.lineTo(defX - stretchPx * df2 * 0.6 + memCx + nx * memR - defX, dy2);
              ctx.strokeStyle = rgba(
                stressHeat(lineStress),
                ALPHA.atmosphere.min * (0.3 + lineStress * 0.5) * entrance
              );
              ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
            }
          }
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Membrane deformation cone
      // ════════════════════════════════════════════════════
      // The membrane outline (circle deformed into cone at stretch point)
      const segments = 48;
      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const angle = (Math.PI * 2 * i) / segments;
        let r = memR * (1 + breath * 0.02 * ms);

        // Deform toward spear direction (left side of membrane)
        if (stretchFrac > 0) {
          const angleFactor = Math.cos(angle - Math.PI); // -1 at right, +1 at left
          if (angleFactor > 0) {
            const coneDepth = stretchPx * angleFactor * 0.8;
            r += coneDepth * Math.pow(angleFactor, 1.5);
          }
        }

        const vx = memCx + Math.cos(angle) * r - (Math.cos(angle) < -0.3 ? stretchPx * 0.2 * Math.max(0, -Math.cos(angle) - 0.3) : 0);
        const vy = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);
      }
      ctx.closePath();

      // Fill with stress-based gradient
      const memGrad = ctx.createLinearGradient(tipX, cy, memCx + memR, cy);
      memGrad.addColorStop(0, rgba(stressHeat(stretchFrac * 0.7), ALPHA.background.min * (1 + stretchFrac * 3) * entrance));
      memGrad.addColorStop(0.4, rgba(stressHeat(stretchFrac * 0.3), ALPHA.background.min * entrance));
      memGrad.addColorStop(1, rgba(stressHeat(0.02), ALPHA.background.min * 0.5 * entrance));
      ctx.fillStyle = memGrad; ctx.fill();

      // Outline
      ctx.strokeStyle = rgba(
        stressHeat(stretchFrac * 0.3),
        ALPHA.content.max * (0.2 + stretchFrac * 0.15) * entrance
      );
      ctx.lineWidth = px(STROKE.light, minDim); ctx.stroke();

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Spear with trail + specular
      // ════════════════════════════════════════════════════
      if (!s.completed || s.expelling) {
        const sx = s.spearX * w;

        // Motion trail
        for (let i = 0; i < s.trail.length; i++) {
          const t = i / s.trail.length;
          const tx = s.trail[i].x * w;
          ctx.beginPath();
          ctx.moveTo(tx - spearLen * 0.3, cy);
          ctx.lineTo(tx, cy);
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.atmosphere.min * t * 0.5 * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim) * t; ctx.stroke();
        }

        // Spear body (tapered shaft)
        const shaftGrad = ctx.createLinearGradient(sx - spearLen, cy, sx, cy);
        shaftGrad.addColorStop(0, rgba(s.accentRgb, ALPHA.content.max * 0.5 * entrance));
        shaftGrad.addColorStop(0.8, rgba(s.accentRgb, ALPHA.content.max * 0.8 * entrance));
        shaftGrad.addColorStop(1, rgba(lerpColor(s.accentRgb, [255, 255, 255] as RGB, 0.3), ALPHA.content.max * entrance));
        ctx.beginPath();
        ctx.moveTo(sx - spearLen, cy - px(0.002, minDim));
        ctx.lineTo(sx - spearLen, cy + px(0.002, minDim));
        ctx.lineTo(sx, cy);
        ctx.closePath();
        ctx.fillStyle = shaftGrad; ctx.fill();

        // Spear tip (sharp diamond)
        const tipSize = px(0.012, minDim);
        ctx.beginPath();
        ctx.moveTo(sx + tipSize, cy);
        ctx.lineTo(sx, cy - tipSize * 0.5);
        ctx.lineTo(sx - tipSize * 0.3, cy);
        ctx.lineTo(sx, cy + tipSize * 0.5);
        ctx.closePath();
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * entrance);
        ctx.fill();

        // Specular on tip
        ctx.beginPath();
        ctx.arc(sx + tipSize * 0.3, cy - tipSize * 0.15, tipSize * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.glow.max * SPECULAR_K * entrance);
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 6: Tension lines from tip to anchors
      // ════════════════════════════════════════════════════
      if (stretchFrac > 0.1 && (s.impacting || s.expelling)) {
        const tensionAlpha = ALPHA.atmosphere.max * 0.2 * stretchFrac * entrance;
        for (let i = 0; i < TENSION_LINE_COUNT; i++) {
          const angle = (Math.PI * 2 * i) / TENSION_LINE_COUNT;
          // Anchor on membrane edge
          const anchorX = memCx + Math.cos(angle) * memR;
          const anchorY = cy + Math.sin(angle) * memR;

          ctx.beginPath(); ctx.moveTo(tipX, cy); ctx.lineTo(anchorX, anchorY);
          const lineStress = stretchFrac * (0.5 + 0.5 * Math.max(0, -Math.cos(angle)));
          ctx.strokeStyle = rgba(stressHeat(lineStress), tensionAlpha * (0.3 + lineStress * 0.7));
          ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
        }

        // Tip stress glow (hottest point)
        const tipGlowR = px(0.03, minDim) * stretchFrac;
        const tipGlow = ctx.createRadialGradient(tipX, cy, 0, tipX, cy, tipGlowR);
        tipGlow.addColorStop(0, rgba(stressHeat(stretchFrac), ALPHA.glow.max * 0.12 * stretchFrac * entrance));
        tipGlow.addColorStop(0.5, rgba(stressHeat(stretchFrac * 0.7), ALPHA.glow.min * 0.04 * entrance));
        tipGlow.addColorStop(1, rgba(stressHeat(stretchFrac * 0.3), 0));
        ctx.fillStyle = tipGlow;
        ctx.fillRect(tipX - tipGlowR, cy - tipGlowR, tipGlowR * 2, tipGlowR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 7: Recovery particles + energy field
      // ════════════════════════════════════════════════════
      for (const pt of s.particles) {
        const la = pt.life / PARTICLE_LIFE;
        const pc = stressHeat(pt.stress);
        ctx.beginPath(); ctx.arc(pt.x, pt.y, px(0.002, minDim) * la, 0, Math.PI * 2);
        ctx.fillStyle = rgba(pc, ALPHA.glow.max * 0.15 * la * entrance);
        ctx.fill();
      }

      // Recovery energy field (cool blue returning)
      if (s.expelling && s.recovery > 0.2) {
        const recR = memR * (0.8 + s.recovery * 0.4);
        const recGrad = ctx.createRadialGradient(memCx, cy, memR * 0.3, memCx, cy, recR);
        recGrad.addColorStop(0, rgba(stressHeat(0.05), ALPHA.glow.max * 0.06 * s.recovery * entrance * (1 + breath * BREATH_SHIMMER)));
        recGrad.addColorStop(0.6, rgba(stressHeat(0.02), ALPHA.glow.min * 0.03 * s.recovery * entrance));
        recGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = recGrad;
        ctx.fillRect(memCx - recR, cy - recR, recR * 2, recR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 8: Progress ring + seal stamp bloom
      // ════════════════════════════════════════════════════
      const progValue = s.impacting ? stretchFrac * 0.5
        : s.expelling ? 0.5 + s.recovery * 0.5
        : s.completed ? 1 : 0;

      if (progValue > 0) {
        const ringR = px(PROGRESS_RING_R, minDim);
        const ringAngle = progValue * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, -Math.PI / 2, -Math.PI / 2 + ringAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim); ctx.stroke();

        if (progValue > 0.1) {
          ctx.font = `${px(FONT_SIZE.xs, minDim)}px sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.min * entrance);
          ctx.fillText(`${Math.round(progValue * 100)}%`, cx, cy + ringR + px(0.025, minDim));
        }
      }

      // Seal stamp bloom (apex completion)
      if (s.bloomT >= 0 && s.bloomT < BLOOM_DURATION) {
        const bf = s.bloomT / BLOOM_DURATION;
        const bR = memR * (1.2 + bf * 1.0);
        const bAlpha = (1 - bf) * ALPHA.glow.max * 0.18 * entrance;
        const bGrad = ctx.createRadialGradient(memCx, cy, 0, memCx, cy, bR);
        bGrad.addColorStop(0, rgba(stressHeat(0.05), bAlpha));
        bGrad.addColorStop(0.3, rgba(s.primaryRgb, bAlpha * 0.6));
        bGrad.addColorStop(0.6, rgba(stressHeat(0.02), bAlpha * 0.3));
        bGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = bGrad;
        ctx.fillRect(memCx - bR, cy - bR, bR * 2, bR * 2);
      }

      // ── Respawn ────────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.spearX = SPEAR_START_X; s.spearVx = SPEAR_VX;
          s.approaching = true; s.impacting = false;
          s.stretch = 0; s.maxStretchReached = false;
          s.expelling = false; s.completed = false; s.lastTier = 0;
          s.trail = []; s.particles = []; s.bloomT = -1; s.recovery = 0;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(animId); };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} />
    </div>
  );
}
