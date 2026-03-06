/**
 * ATOM 621: THE TRAMPOLINE ENGINE
 * =================================
 * Series 63 — Elastic Yield · Position 1
 *
 * Cure the brittle ego. Drag the tensile slider from glass to
 * hyper-elastic rubber — weight bows the line deeply then
 * flawlessly rebounds into the sky.
 *
 * SIGNATURE TECHNIQUE: Stress Tensor Visualization
 *   - The elastic line is rendered with Von Mises stress coloring
 *   - Cool blue in relaxed zones, hot red/white at yield points
 *   - Impact creates visible stress wave propagation along the line
 *   - Glass shattering shows fracture mechanics (stress exceeding yield)
 *   - Rubber rebound shows elastic energy storage as heat map gradient
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + depth vignette
 *   2. Stress field background (heat map glow beneath line)
 *   3. Shadow beneath line + weight
 *   4. Elastic line body with per-segment stress coloring
 *   5. Stress tensor overlay (directional force indicators)
 *   6. Weight with specular + impact glow
 *   7. Shatter fragments / rebound trail
 *   8. Progress ring + slider
 *
 * PHYSICS:
 *   - Weight drops under gravity onto elastic line
 *   - Elasticity slider: glass (brittle, shatters) → rubber (bows, rebounds)
 *   - Stress = deformation × stiffness, visualised as color temperature
 *   - Breath modulates weight glow + stress field intensity
 *
 * INTERACTION:
 *   Scrub (tensile slider) → material shift → rebound
 *   (error_boundary, drag_snap, completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static bowed line with stress gradient, weight at rest
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, GLOW, FONT_SIZE, motionScale, type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// STRESS TENSOR HELPERS
// ═════════════════════════════════════════════════════════════════════

/** Map stress (0–1) to heat color: cool blue → green → yellow → red → white */
function stressToColor(stress: number, base: RGB, accent: RGB): RGB {
  if (stress < 0.25) {
    const t = stress / 0.25;
    return lerpColor([60, 100, 200] as RGB, [60, 180, 120] as RGB, t);
  } else if (stress < 0.5) {
    const t = (stress - 0.25) / 0.25;
    return lerpColor([60, 180, 120] as RGB, [220, 200, 60] as RGB, t);
  } else if (stress < 0.75) {
    const t = (stress - 0.5) / 0.25;
    return lerpColor([220, 200, 60] as RGB, accent, t);
  } else {
    const t = (stress - 0.75) / 0.25;
    return lerpColor(accent, [255, 240, 240] as RGB, t);
  }
}

/** Compute stress along elastic line at parametric position t (0–1) */
function lineStress(t: number, bowDepth: number, elasticity: number): number {
  // Stress peaks at center where deformation is greatest
  const deformation = Math.sin(t * Math.PI) * bowDepth;
  const stiffness = 1 - elasticity * 0.8; // glass = high stiffness, rubber = low
  return Math.min(1, deformation * stiffness * 3);
}

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Weight radius (hero element) */
const WEIGHT_R = SIZE.md * 0.18;
/** Line vertical position (fraction from top) */
const LINE_Y_FRAC = 0.55;
/** Line horizontal extent */
const LINE_EXTENT = 0.38;
/** Gravity acceleration per frame */
const GRAVITY = 0.00035;
/** Rebound gravity (weaker, for dramatic rise) */
const REBOUND_GRAVITY = 0.00006;
/** Max bow depth as fraction of minDim */
const MAX_BOW = 0.18;
/** Glass yield threshold (bow depth at which glass shatters) */
const GLASS_YIELD = 0.03;
/** Number of line segments for rendering */
const LINE_SEGMENTS = 48;
/** Shatter fragment count */
const FRAGMENT_COUNT = 16;
/** Fragment lifetime frames */
const FRAGMENT_LIFE = 50;
/** Stress field particle count */
const STRESS_PARTICLES = 80;
/** Progress ring radius */
const PROGRESS_RING_R = SIZE.md * 0.85;
/** Slider width fraction */
const SLIDER_W_FRAC = 0.35;
/** Respawn delay frames */
const RESPAWN_DELAY = 90;
/** Weight initial Y position */
const WEIGHT_START_Y = 0.12;
/** Auto-drop delay frames */
const AUTO_DROP_DELAY = 50;
/** Rebound launch speed multiplier */
const REBOUND_SPEED_K = 0.016;
/** Stress glow layers */
const STRESS_GLOW_LAYERS = 4;
/** Breath glow modulation */
const BREATH_GLOW_MOD = 0.15;
/** Vignette alpha */
const VIGNETTE_ALPHA = 0.04;
/** Specular intensity on weight */
const SPECULAR_K = 0.3;

// ═════════════════════════════════════════════════════════════════════
// STATE INTERFACE
// ═════════════════════════════════════════════════════════════════════

interface Fragment {
  x: number; y: number;
  vx: number; vy: number;
  len: number; angle: number;
  life: number;
}

interface StressParticle {
  x: number; y: number;
  vx: number; vy: number;
  stress: number; life: number;
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function TrampolineReboundAtom({
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
    elasticity: 0,       // 0 = glass, 1 = rubber
    weightY: WEIGHT_START_Y,
    weightVy: 0,
    weightDropped: false,
    shattered: false,
    rebounding: false,
    bowDepth: 0,         // 0–1, how much the line bows
    completed: false,
    respawnTimer: 0,
    dragging: false,
    fragments: [] as Fragment[],
    stressParticles: [] as StressParticle[],
    completions: 0,
    reboundTrail: [] as { x: number; y: number; alpha: number }[],
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
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const breath = p.breathAmplitude;
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Atmosphere + depth vignette
      // ════════════════════════════════════════════════════
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      // Subtle vignette darkening at edges
      const vigR = Math.max(w, h) * 0.8;
      const vig = ctx.createRadialGradient(cx, cy, minDim * 0.2, cx, cy, vigR);
      vig.addColorStop(0, rgba([0, 0, 0] as RGB, 0));
      vig.addColorStop(0.7, rgba([0, 0, 0] as RGB, 0));
      vig.addColorStop(1, rgba([0, 0, 0] as RGB, VIGNETTE_ALPHA * entrance));
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      const lineY = h * LINE_Y_FRAC;
      const lineLeft = cx - minDim * LINE_EXTENT;
      const lineRight = cx + minDim * LINE_EXTENT;
      const lineW = lineRight - lineLeft;
      const weightR = px(WEIGHT_R, minDim);

      // ── Reduced motion fallback ─────────────────────────
      if (p.reducedMotion) {
        // Static bowed line with stress gradient showing rubber state
        const staticBow = MAX_BOW * 0.6;
        for (let i = 0; i < LINE_SEGMENTS; i++) {
          const t0 = i / LINE_SEGMENTS; const t1 = (i + 1) / LINE_SEGMENTS;
          const x0 = lineLeft + t0 * lineW; const x1 = lineLeft + t1 * lineW;
          const bow0 = Math.sin(t0 * Math.PI) * staticBow * minDim;
          const bow1 = Math.sin(t1 * Math.PI) * staticBow * minDim;
          const stress0 = lineStress(t0, staticBow, 0.8);
          const sc = stressToColor(stress0, s.primaryRgb, s.accentRgb);
          ctx.beginPath();
          ctx.moveTo(x0, lineY + bow0); ctx.lineTo(x1, lineY + bow1);
          ctx.strokeStyle = rgba(sc, ALPHA.content.max * 0.3 * entrance);
          ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke();
        }
        // Static weight at bow center
        ctx.beginPath(); ctx.arc(cx, lineY + staticBow * minDim, weightR * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.fill();
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      // ── Weight physics ─────────────────────────────────
      if (!s.weightDropped && s.frameCount > AUTO_DROP_DELAY) {
        s.weightDropped = true;
        s.weightVy = 0;
      }

      if (s.weightDropped && !s.rebounding && !s.shattered) {
        s.weightVy += GRAVITY;
        s.weightY += s.weightVy;

        // Hit the line
        const weightYpx = s.weightY * h;
        if (weightYpx >= lineY - weightR * 0.5) {
          const impactSpeed = s.weightVy;

          if (s.elasticity < 0.3) {
            // ── GLASS: stress exceeds yield → shatter ─────
            if (s.bowDepth > GLASS_YIELD || impactSpeed > 0.002) {
              s.shattered = true;
              cb.onHaptic('error_boundary');
              // Generate fracture fragments
              s.fragments = [];
              for (let i = 0; i < FRAGMENT_COUNT; i++) {
                const fragT = Math.random();
                const fragX = lineLeft + fragT * lineW;
                const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8;
                s.fragments.push({
                  x: fragX, y: lineY,
                  vx: Math.cos(angle) * (1 + Math.random() * 3),
                  vy: Math.sin(angle) * (1 + Math.random() * 2) - 1,
                  len: minDim * (0.01 + Math.random() * 0.04),
                  angle: Math.random() * Math.PI * 2,
                  life: FRAGMENT_LIFE,
                });
              }
              // Spawn stress particles at impact
              for (let i = 0; i < 20; i++) {
                s.stressParticles.push({
                  x: cx, y: lineY,
                  vx: (Math.random() - 0.5) * 3,
                  vy: -Math.random() * 2,
                  stress: 0.8 + Math.random() * 0.2,
                  life: 30 + Math.random() * 20,
                });
              }
              s.respawnTimer = RESPAWN_DELAY;
            }
          } else {
            // ── RUBBER: bow absorbs energy ────────────────
            s.bowDepth = Math.min(1, s.bowDepth + 0.015 * (1 + impactSpeed * 50));
            // Spawn stress propagation particles along line
            if (s.bowDepth > 0.1 && s.stressParticles.length < STRESS_PARTICLES) {
              const spawnT = 0.3 + Math.random() * 0.4;
              s.stressParticles.push({
                x: lineLeft + spawnT * lineW,
                y: lineY + Math.sin(spawnT * Math.PI) * s.bowDepth * MAX_BOW * minDim,
                vx: (Math.random() - 0.5) * 1.5,
                vy: -Math.random() * 0.8,
                stress: s.bowDepth * 0.8,
                life: 20 + Math.random() * 15,
              });
            }
            if (s.bowDepth >= 0.75) {
              s.rebounding = true;
              s.weightVy = -(REBOUND_SPEED_K * s.elasticity);
              cb.onHaptic('drag_snap');
            }
          }
        }
      }

      if (s.rebounding) {
        s.weightVy += REBOUND_GRAVITY;
        s.weightY += s.weightVy;
        s.bowDepth = Math.max(0, s.bowDepth - 0.025);

        // Rebound trail
        s.reboundTrail.unshift({ x: cx, y: s.weightY * h, alpha: 1 });
        if (s.reboundTrail.length > 30) s.reboundTrail.length = 30;
        for (const rt of s.reboundTrail) rt.alpha *= 0.92;

        if (s.weightY < -0.15) {
          s.completed = true;
          s.completions++;
          cb.onHaptic('completion');
          cb.onStateChange?.(1);
          s.respawnTimer = RESPAWN_DELAY;
        }
      }

      // Shatter respawn
      if (s.shattered) {
        s.respawnTimer--;
        // Animate fragments
        for (const f of s.fragments) {
          f.x += f.vx; f.y += f.vy;
          f.vy += 0.08; f.life--;
          f.angle += 0.05;
        }
        s.fragments = s.fragments.filter(f => f.life > 0);
        if (s.respawnTimer <= 0) {
          s.shattered = false; s.weightDropped = false;
          s.weightY = WEIGHT_START_Y; s.weightVy = 0;
          s.bowDepth = 0; s.fragments = [];
          s.stressParticles = [];
        }
      }

      // Completed respawn
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.completed = false; s.rebounding = false;
          s.weightDropped = false; s.weightY = WEIGHT_START_Y;
          s.weightVy = 0; s.bowDepth = 0;
          s.reboundTrail = [];
        }
      }

      // Update stress particles
      for (const sp of s.stressParticles) {
        sp.x += sp.vx; sp.y += sp.vy;
        sp.vy += 0.02; sp.life--;
        sp.stress *= 0.97;
      }
      s.stressParticles = s.stressParticles.filter(sp => sp.life > 0);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Stress field heat map beneath line
      // ════════════════════════════════════════════════════
      if (s.bowDepth > 0.02 && !s.shattered) {
        for (let gi = STRESS_GLOW_LAYERS - 1; gi >= 0; gi--) {
          const peakStress = lineStress(0.5, s.bowDepth * MAX_BOW, s.elasticity);
          const sc = stressToColor(peakStress, s.primaryRgb, s.accentRgb);
          const gR = minDim * (0.08 + gi * 0.06) * (1 + breath * BREATH_GLOW_MOD);
          const gA = ALPHA.glow.max * 0.04 * s.bowDepth * entrance / (gi + 1);
          const bowCenter = lineY + Math.sin(0.5 * Math.PI) * s.bowDepth * MAX_BOW * minDim;
          const sg = ctx.createRadialGradient(cx, bowCenter, 0, cx, bowCenter, gR);
          sg.addColorStop(0, rgba(sc, gA));
          sg.addColorStop(0.4, rgba(lerpColor(sc, s.primaryRgb, 0.5), gA * 0.4));
          sg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = sg;
          ctx.fillRect(cx - gR, bowCenter - gR, gR * 2, gR * 2);
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Shadow beneath line
      // ════════════════════════════════════════════════════
      if (!s.shattered) {
        const shadowY = lineY + minDim * 0.008;
        ctx.beginPath();
        ctx.moveTo(lineLeft, shadowY);
        const bowPx = s.bowDepth * MAX_BOW * minDim;
        ctx.quadraticCurveTo(cx, shadowY + bowPx + 3, lineRight, shadowY);
        ctx.strokeStyle = rgba([0, 0, 0] as RGB, 0.035 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim) * 1.5;
        ctx.stroke();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Elastic line with stress tensor coloring
      // ════════════════════════════════════════════════════
      if (!s.shattered) {
        const bowPx = s.bowDepth * MAX_BOW * minDim;
        for (let i = 0; i < LINE_SEGMENTS; i++) {
          const t0 = i / LINE_SEGMENTS;
          const t1 = (i + 1) / LINE_SEGMENTS;
          const x0 = lineLeft + t0 * lineW;
          const x1 = lineLeft + t1 * lineW;
          const bow0 = Math.sin(t0 * Math.PI) * bowPx;
          const bow1 = Math.sin(t1 * Math.PI) * bowPx;

          // Per-segment stress → color
          const stress = lineStress((t0 + t1) / 2, s.bowDepth * MAX_BOW, s.elasticity);
          const sc = stressToColor(stress, s.primaryRgb, s.accentRgb);
          const lineAlpha = ALPHA.content.max * (0.15 + stress * 0.25) * entrance;

          ctx.beginPath();
          ctx.moveTo(x0, lineY + bow0);
          ctx.lineTo(x1, lineY + bow1);
          ctx.strokeStyle = rgba(sc, lineAlpha);
          ctx.lineWidth = px(STROKE.medium, minDim) * (1 + stress * 0.8);
          ctx.stroke();

          // Glow halo per segment (thicker at high-stress points)
          if (stress > 0.3) {
            const glowW = px(STROKE.bold, minDim) * stress * 2;
            ctx.beginPath();
            ctx.moveTo(x0, lineY + bow0);
            ctx.lineTo(x1, lineY + bow1);
            ctx.strokeStyle = rgba(sc, ALPHA.glow.max * 0.05 * stress * entrance);
            ctx.lineWidth = glowW;
            ctx.stroke();
          }
        }

        // End anchor dots
        for (const ax of [lineLeft, lineRight]) {
          ctx.beginPath(); ctx.arc(ax, lineY, px(0.005, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
          ctx.fill();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Stress tensor indicators + particles
      // ════════════════════════════════════════════════════
      // Directional force arrows at high-stress zones
      if (s.bowDepth > 0.15 && !s.shattered) {
        const bowPx = s.bowDepth * MAX_BOW * minDim;
        for (let i = 1; i < 5; i++) {
          const t = i / 5;
          const sx = lineLeft + t * lineW;
          const sy = lineY + Math.sin(t * Math.PI) * bowPx;
          const stress = lineStress(t, s.bowDepth * MAX_BOW, s.elasticity);
          if (stress < 0.2) continue;

          const arrowLen = minDim * 0.015 * stress;
          // Normal force (upward = stored elastic energy)
          const sc = stressToColor(stress, s.primaryRgb, s.accentRgb);
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx, sy - arrowLen);
          ctx.strokeStyle = rgba(sc, ALPHA.content.max * 0.12 * stress * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
          // Arrow head
          ctx.beginPath();
          ctx.moveTo(sx, sy - arrowLen);
          ctx.lineTo(sx - 2, sy - arrowLen + 4);
          ctx.lineTo(sx + 2, sy - arrowLen + 4);
          ctx.closePath();
          ctx.fillStyle = rgba(sc, ALPHA.content.max * 0.1 * stress * entrance);
          ctx.fill();
        }
      }

      // Stress particles
      for (const sp of s.stressParticles) {
        const sc = stressToColor(sp.stress, s.primaryRgb, s.accentRgb);
        const alpha = (sp.life / 40) * ALPHA.content.max * 0.15 * entrance;
        const r = px(0.003, minDim) * (0.5 + sp.stress * 0.5);
        ctx.beginPath(); ctx.arc(sp.x, sp.y, r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(sc, alpha);
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 6: Weight with specular + glow
      // ════════════════════════════════════════════════════
      if (s.weightDropped && !s.completed) {
        const wy = s.weightY * h;

        // Weight shadow
        ctx.beginPath();
        ctx.ellipse(cx + 2, wy + weightR * 0.8, weightR * 0.7, weightR * 0.15, 0, 0, Math.PI * 2);
        ctx.fillStyle = rgba([0, 0, 0] as RGB, 0.03 * entrance);
        ctx.fill();

        // Weight glow
        const wGlowR = weightR * 3.5;
        const wGlow = ctx.createRadialGradient(cx, wy, 0, cx, wy, wGlowR);
        wGlow.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.06 * (1 + breath * 0.2) * entrance));
        wGlow.addColorStop(0.3, rgba(s.accentRgb, ALPHA.glow.max * 0.02 * entrance));
        wGlow.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = wGlow;
        ctx.fillRect(cx - wGlowR, wy - wGlowR, wGlowR * 2, wGlowR * 2);

        // Weight body (5-stop gradient)
        const wBody = ctx.createRadialGradient(
          cx - weightR * 0.15, wy - weightR * 0.15, weightR * 0.05,
          cx, wy, weightR
        );
        const wA = ALPHA.content.max * 0.4 * entrance;
        wBody.addColorStop(0, rgba(lerpColor(s.accentRgb, [255, 255, 255] as RGB, 0.4), wA));
        wBody.addColorStop(0.2, rgba(lerpColor(s.accentRgb, [255, 255, 255] as RGB, 0.15), wA));
        wBody.addColorStop(0.5, rgba(s.accentRgb, wA * 0.85));
        wBody.addColorStop(0.8, rgba(lerpColor(s.accentRgb, [0, 0, 0] as RGB, 0.15), wA * 0.6));
        wBody.addColorStop(1, rgba(s.accentRgb, wA * 0.1));
        ctx.beginPath(); ctx.arc(cx, wy, weightR, 0, Math.PI * 2);
        ctx.fillStyle = wBody; ctx.fill();

        // Specular highlight
        ctx.beginPath();
        ctx.ellipse(cx - weightR * 0.2, wy - weightR * 0.25, weightR * 0.3, weightR * 0.15, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, SPECULAR_K * entrance);
        ctx.fill();
        // Secondary specular
        ctx.beginPath();
        ctx.ellipse(cx + weightR * 0.15, wy + weightR * 0.15, weightR * 0.12, weightR * 0.06, 0.5, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, SPECULAR_K * 0.3 * entrance);
        ctx.fill();
      } else if (!s.weightDropped && !s.completed) {
        // Weight waiting (pulse)
        const wy = s.weightY * h;
        const pulseR = weightR * (1 + 0.04 * Math.sin(s.frameCount * 0.04 * ms));
        const wPulse = ctx.createRadialGradient(cx, wy, 0, cx, wy, pulseR * 2);
        wPulse.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.04 * entrance));
        wPulse.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = wPulse;
        ctx.fillRect(cx - pulseR * 2, wy - pulseR * 2, pulseR * 4, pulseR * 4);
        ctx.beginPath(); ctx.arc(cx, wy, pulseR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.25 * entrance);
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 7: Shatter fragments / rebound trail
      // ════════════════════════════════════════════════════
      // Fragments (glass shatter)
      for (const f of s.fragments) {
        const fAlpha = (f.life / FRAGMENT_LIFE) * ALPHA.content.max * 0.35 * entrance;
        const stress = 0.7 + (1 - f.life / FRAGMENT_LIFE) * 0.3;
        const sc = stressToColor(stress, s.primaryRgb, s.accentRgb);
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.angle);
        ctx.beginPath();
        ctx.moveTo(-f.len / 2, 0);
        ctx.lineTo(f.len / 2, f.len * 0.1 * (Math.random() - 0.5));
        ctx.strokeStyle = rgba(sc, fAlpha);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
        ctx.restore();
      }

      // Rebound trail (rubber success)
      for (let ri = 0; ri < s.reboundTrail.length; ri++) {
        const rt = s.reboundTrail[ri];
        if (rt.alpha < 0.01) continue;
        const trailR = weightR * 0.5 * rt.alpha;
        const tg = ctx.createRadialGradient(rt.x, rt.y, 0, rt.x, rt.y, trailR);
        tg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.06 * rt.alpha * entrance));
        tg.addColorStop(0.5, rgba(lerpColor(s.accentRgb, [255, 255, 255] as RGB, 0.2), ALPHA.glow.max * 0.02 * rt.alpha * entrance));
        tg.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = tg;
        ctx.fillRect(rt.x - trailR, rt.y - trailR, trailR * 2, trailR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 8: Progress ring + slider
      // ════════════════════════════════════════════════════
      // Progress ring
      const ringR = px(PROGRESS_RING_R, minDim);
      ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.015 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
      const completionProg = s.completed ? 1 : Math.min(0.9, s.elasticity * 0.5 + s.bowDepth * 0.4);
      if (completionProg > 0.01) {
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * completionProg);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke();
      }

      // ── Slider ─────────────────────────────────────
      const sliderY = h * 0.88;
      const sliderW = minDim * SLIDER_W_FRAC;
      const sliderX = cx - sliderW / 2;
      const knobX = sliderX + sliderW * s.elasticity;

      // Slider track (with stress coloring)
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.5 * entrance);
      ctx.fillRect(sliderX, sliderY - px(STROKE.thin, minDim), sliderW, px(STROKE.light, minDim));

      // Filled portion with gradient from glass-blue to rubber-green
      const sliderGrad = ctx.createLinearGradient(sliderX, 0, sliderX + sliderW * s.elasticity, 0);
      sliderGrad.addColorStop(0, rgba([80, 120, 200] as RGB, ALPHA.content.max * 0.15 * entrance));
      sliderGrad.addColorStop(1, rgba([80, 200, 120] as RGB, ALPHA.content.max * 0.2 * entrance));
      ctx.fillStyle = sliderGrad;
      ctx.fillRect(sliderX, sliderY - px(STROKE.thin, minDim), sliderW * s.elasticity, px(STROKE.light, minDim));

      // Knob with specular
      const knobR = px(0.012, minDim);
      const knobGrad = ctx.createRadialGradient(knobX - knobR * 0.2, sliderY - knobR * 0.2, knobR * 0.1, knobX, sliderY, knobR);
      knobGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3), ALPHA.content.max * 0.35 * entrance));
      knobGrad.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.content.max * 0.25 * entrance));
      knobGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.1 * entrance));
      ctx.beginPath(); ctx.arc(knobX, sliderY, knobR, 0, Math.PI * 2);
      ctx.fillStyle = knobGrad; ctx.fill();
      // Knob specular
      ctx.beginPath();
      ctx.ellipse(knobX - knobR * 0.2, sliderY - knobR * 0.25, knobR * 0.25, knobR * 0.12, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.2 * entrance);
      ctx.fill();

      // Material label
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance);
      ctx.font = `${px(FONT_SIZE.xs, minDim)}px system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText('GLASS', sliderX, sliderY + px(0.025, minDim));
      ctx.textAlign = 'right';
      ctx.fillText('RUBBER', sliderX + sliderW, sliderY + px(0.025, minDim));

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const minD = Math.min(viewport.width, viewport.height);
      const slW = minD * SLIDER_W_FRAC / viewport.width;
      const slStart = 0.5 - slW / 2;
      s.elasticity = Math.max(0, Math.min(1, (mx - slStart) / slW));
      cbRef.current.onStateChange?.(s.elasticity * 0.5);
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.dragging = false;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ew-resize' }} />
    </div>
  );
}
