/**
 * ATOM 628: THE IMPACT RADIUS ENGINE
 * ====================================
 * Series 63 — Elastic Yield · Position 8
 *
 * Cure emotional bottling. Pinch-out to remove the rigid box walls
 * and expand into infinite elastic field — the bomb detonates
 * harmlessly as a beautiful dissipating ripple across vast space.
 *
 * SIGNATURE TECHNIQUE: Stress Tensor Visualization
 *   - Box walls show stress concentration: pressure builds (blue→red→white)
 *   - Wall corners are hottest (maximum stress concentration)
 *   - Bomb node trembles with internal stress (pulsing red core)
 *   - Expansion: stress drains from walls as field opens
 *   - Detonation in open field: stress ripple dissipates radially
 *   - Final state: zero-stress infinite field with cool-blue afterglow
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + pressure ambient
 *   2. Stress field halo (pressure visualization around box)
 *   3. Box walls with per-segment stress coloring
 *   4. Bomb node with internal stress glow + ticking
 *   5. Expansion field (elastic space opening)
 *   6. Detonation ripple cascade (multi-ring dissipation)
 *   7. Corner stress indicators + force arrows
 *   8. Progress ring + completion bloom
 *
 * PHYSICS:
 *   - Box confines bomb; pressure builds over time
 *   - Per-wall-segment stress based on proximity to bomb
 *   - Drag outward to expand box → infinite field
 *   - Detonation energy inversely proportional to available volume
 *   - Multiple ripple rings propagate with decreasing amplitude
 *   - Breath modulates pressure pulse + ripple shimmer
 *
 * INTERACTION:
 *   Drag outward (expand) → remove walls → safe detonation
 *   (hold_start, step_advance, completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static open field with gentle ripple
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
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

/** Box initial half-size as fraction of minDim */
const BOX_HALF = SIZE.md;
/** Bomb radius (hero element) */
const BOMB_R = SIZE.md * 0.15;
/** Wall segment count per side */
const WALL_SEGS = 8;
/** Pressure build rate (per frame) */
const PRESSURE_RATE = 0.001;
/** Max pressure before auto-detonate in box */
const MAX_PRESSURE = 0.95;
/** Expansion drag multiplier */
const EXPAND_DRAG_K = 3.5;
/** Detonation trigger expansion threshold */
const DETONATE_THRESHOLD = 0.85;
/** Ripple ring count */
const RIPPLE_RINGS = 5;
/** Ripple propagation speed */
const RIPPLE_SPEED = 0.006;
/** Ripple ring spacing (fraction) */
const RIPPLE_SPACING = 0.12;
/** Corner stress indicator radius */
const CORNER_DOT_R = 0.005;
/** Progress ring radius */
const PROGRESS_RING_R = SIZE.md * 0.85;
/** Respawn delay */
const RESPAWN_DELAY = 110;
/** Bloom duration */
const BLOOM_DURATION = 60;
/** Ticking frequency multiplier */
const TICK_FREQ = 0.25;
/** Breath pressure mod */
const BREATH_PRESSURE_MOD = 0.15;
/** Stress field glow layers */
const FIELD_LAYERS = 3;
/** Force arrow count per wall */
const ARROWS_PER_WALL = 3;
/** Box shatter fragment count */
const BOX_FRAG_COUNT = 16;
/** Fragment life */
const FRAG_LIFE = 35;

// ═════════════════════════════════════════════════════════════════════
// STATE INTERFACES
// ═════════════════════════════════════════════════════════════════════

interface RippleRing {
  r: number;       // current radius fraction (0–∞)
  alpha: number;   // current opacity
  born: number;    // frame when born
}

interface BoxFrag {
  x: number; y: number;
  vx: number; vy: number;
  size: number; rot: number; rotV: number;
  life: number;
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function ImpactRadiusReleaseAtom({
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
    // Core state
    expand: 0,
    pressure: 0.1,
    detonated: false,
    boxShattered: false,
    completed: false,
    respawnTimer: 0,
    lastTier: 0,
    // Interaction
    dragging: false,
    dragStartDist: 0,
    // Ripples
    ripples: [] as RippleRing[],
    // Bloom
    bloomT: -1,
    // Box fragments
    frags: [] as BoxFrag[],
    // Afterglow
    afterglowAlpha: 0,
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

      const boxHalf = minDim * BOX_HALF * (1 - s.expand);
      const bombR = px(BOMB_R, minDim);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Atmosphere + pressure ambient
      // ════════════════════════════════════════════════════
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      // Pressure ambient (reddens as pressure builds)
      if (s.pressure > 0.3 && !s.detonated) {
        const presGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, boxHalf * 1.5);
        presGrad.addColorStop(0, rgba(stressHeat(s.pressure * 0.7), ALPHA.glow.min * 0.04 * entrance));
        presGrad.addColorStop(1, rgba(stressHeat(s.pressure * 0.7), 0));
        ctx.fillStyle = presGrad; ctx.fillRect(0, 0, w, h);
      }

      // ── Reduced motion ─────────────────────────────────
      if (p.reducedMotion) {
        // Open field with gentle ripple
        const ripR = minDim * 0.2;
        ctx.beginPath(); ctx.arc(cx, cy, ripR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.12 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, ripR * 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(stressHeat(0.05), ALPHA.content.max * 0.08 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
        // Cool afterglow
        const ag = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.3);
        ag.addColorStop(0, rgba(stressHeat(0.05), ALPHA.glow.max * 0.06 * entrance));
        ag.addColorStop(1, rgba(stressHeat(0.05), 0));
        ctx.fillStyle = ag; ctx.fillRect(cx - minDim * 0.3, cy - minDim * 0.3, minDim * 0.6, minDim * 0.6);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      // ── Physics ─────────────────────────────────────────
      if (!s.completed) {
        // Pressure builds while boxed
        if (!s.detonated && s.expand < DETONATE_THRESHOLD) {
          s.pressure = Math.min(MAX_PRESSURE, s.pressure + PRESSURE_RATE);
        }

        // Auto-detonate if box at max pressure
        if (!s.detonated && s.pressure >= MAX_PRESSURE && s.expand < 0.3) {
          // Catastrophic shatter (failure case — box was too rigid)
          s.boxShattered = true;
          s.detonated = true;
          // Spawn box fragments
          for (let i = 0; i < BOX_FRAG_COUNT; i++) {
            const angle = (Math.PI * 2 * i) / BOX_FRAG_COUNT;
            s.frags.push({
              x: cx + Math.cos(angle) * boxHalf,
              y: cy + Math.sin(angle) * boxHalf,
              vx: Math.cos(angle) * (2 + Math.random() * 3),
              vy: Math.sin(angle) * (2 + Math.random() * 3),
              size: 0.006 + Math.random() * 0.01,
              rot: 0, rotV: (Math.random() - 0.5) * 0.2,
              life: FRAG_LIFE,
            });
          }
          cb.onHaptic('error_boundary');
          s.respawnTimer = 80;
        }

        // Safe detonation when expanded enough
        if (!s.detonated && s.expand >= DETONATE_THRESHOLD) {
          s.detonated = true;
          // Spawn ripple rings
          for (let i = 0; i < RIPPLE_RINGS; i++) {
            s.ripples.push({ r: 0, alpha: 1, born: s.frameCount + i * 8 });
          }
          cb.onHaptic('step_advance');
        }

        // Ripple propagation
        let allDissipated = true;
        for (const rip of s.ripples) {
          if (s.frameCount >= rip.born) {
            rip.r += RIPPLE_SPEED;
            rip.alpha = Math.max(0, 1 - rip.r * 1.5);
            if (rip.alpha > 0.01) allDissipated = false;
          } else {
            allDissipated = false;
          }
        }

        if (s.detonated && !s.boxShattered && s.ripples.length > 0 && allDissipated) {
          s.completed = true;
          s.bloomT = 0;
          s.afterglowAlpha = 1;
          cb.onHaptic('completion');
          cb.onStateChange?.(1);
          s.respawnTimer = RESPAWN_DELAY;
        }

        // Failed shatter respawn
        if (s.boxShattered) {
          s.respawnTimer--;
          if (s.respawnTimer <= 0) {
            s.expand = 0; s.pressure = 0.1; s.detonated = false;
            s.boxShattered = false; s.frags = []; s.ripples = [];
          }
        }

        // Fragment physics
        for (const f of s.frags) {
          f.x += f.vx; f.y += f.vy; f.rot += f.rotV; f.life--;
        }
        s.frags = s.frags.filter(f => f.life > 0);
      }

      // Bloom
      if (s.bloomT >= 0) { s.bloomT++; if (s.bloomT > BLOOM_DURATION) s.bloomT = -1; }
      // Afterglow fade
      if (s.afterglowAlpha > 0) s.afterglowAlpha = Math.max(0, s.afterglowAlpha - 0.005);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Stress field halo around box
      // ════════════════════════════════════════════════════
      if (s.expand < 0.9 && !s.detonated) {
        const confined = 1 - s.expand;
        for (let layer = 0; layer < FIELD_LAYERS; layer++) {
          const layerR = boxHalf * (1.1 + layer * 0.15);
          const layerAlpha = ALPHA.glow.max * 0.03 * s.pressure * confined * (1 - layer / FIELD_LAYERS) * entrance;
          const fg = ctx.createRadialGradient(cx, cy, boxHalf * 0.8, cx, cy, layerR);
          fg.addColorStop(0, rgba(stressHeat(s.pressure * 0.8), layerAlpha));
          fg.addColorStop(1, rgba(stressHeat(s.pressure * 0.8), 0));
          ctx.fillStyle = fg;
          ctx.fillRect(cx - layerR, cy - layerR, layerR * 2, layerR * 2);
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Box walls with per-segment stress
      // ════════════════════════════════════════════════════
      if (s.expand < 0.95 && !s.boxShattered) {
        const wallAlpha = (1 - s.expand) * entrance;
        const halfS = boxHalf;

        // Four walls, each with stress-colored segments
        const walls = [
          { x1: cx - halfS, y1: cy - halfS, x2: cx + halfS, y2: cy - halfS }, // top
          { x1: cx + halfS, y1: cy - halfS, x2: cx + halfS, y2: cy + halfS }, // right
          { x1: cx + halfS, y1: cy + halfS, x2: cx - halfS, y2: cy + halfS }, // bottom
          { x1: cx - halfS, y1: cy + halfS, x2: cx - halfS, y2: cy - halfS }, // left
        ];

        for (const wall of walls) {
          for (let seg = 0; seg < WALL_SEGS; seg++) {
            const t0 = seg / WALL_SEGS; const t1 = (seg + 1) / WALL_SEGS;
            const sx = wall.x1 + (wall.x2 - wall.x1) * t0;
            const sy = wall.y1 + (wall.y2 - wall.y1) * t0;
            const ex = wall.x1 + (wall.x2 - wall.x1) * t1;
            const ey = wall.y1 + (wall.y2 - wall.y1) * t1;

            // Stress based on proximity to center of segment from bomb
            const segMidX = (sx + ex) / 2; const segMidY = (sy + ey) / 2;
            const distFromBomb = Math.sqrt((segMidX - cx) ** 2 + (segMidY - cy) ** 2);
            const maxDist = halfS * Math.SQRT2;
            const segStress = s.pressure * (1 - distFromBomb / maxDist * 0.3);

            ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey);
            ctx.strokeStyle = rgba(stressHeat(segStress), ALPHA.content.max * 0.4 * wallAlpha);
            ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke();
          }
        }

        // Corner stress dots (hottest points)
        const corners = [
          [cx - halfS, cy - halfS], [cx + halfS, cy - halfS],
          [cx + halfS, cy + halfS], [cx - halfS, cy + halfS],
        ];
        for (const [cornX, cornY] of corners) {
          const cornerStress = Math.min(1, s.pressure * 1.2);
          const dotR = px(CORNER_DOT_R, minDim) * (1 + cornerStress * 0.5);
          ctx.beginPath(); ctx.arc(cornX, cornY, dotR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(stressHeat(cornerStress), ALPHA.content.max * 0.4 * wallAlpha);
          ctx.fill();
          // Corner stress glow
          const cg = ctx.createRadialGradient(cornX, cornY, 0, cornX, cornY, dotR * 3);
          cg.addColorStop(0, rgba(stressHeat(cornerStress), ALPHA.glow.max * 0.08 * wallAlpha));
          cg.addColorStop(1, rgba(stressHeat(cornerStress), 0));
          ctx.fillStyle = cg;
          ctx.fillRect(cornX - dotR * 3, cornY - dotR * 3, dotR * 6, dotR * 6);
        }
      }

      // Box fragments
      for (const f of s.frags) {
        const la = f.life / FRAG_LIFE;
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.rot);
        ctx.fillStyle = rgba(stressHeat(0.9), ALPHA.content.max * la * entrance);
        ctx.fillRect(-f.size * minDim / 2, -f.size * minDim / 4, f.size * minDim, f.size * minDim / 2);
        ctx.restore();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Bomb node with stress glow
      // ════════════════════════════════════════════════════
      if (!s.detonated) {
        // Ticking vibration
        const tickAmp = s.pressure * px(0.004, minDim) * (1 - s.expand);
        const tickOff = Math.sin(s.frameCount * TICK_FREQ * ms) * tickAmp;

        // Internal stress glow
        const bGlowR = bombR * (2 + s.pressure * 1.5);
        const bGlow = ctx.createRadialGradient(cx + tickOff, cy, bombR * 0.5, cx + tickOff, cy, bGlowR);
        bGlow.addColorStop(0, rgba(stressHeat(s.pressure), ALPHA.glow.max * 0.1 * s.pressure * entrance));
        bGlow.addColorStop(0.5, rgba(stressHeat(s.pressure * 0.6), ALPHA.glow.min * 0.04 * entrance));
        bGlow.addColorStop(1, rgba(stressHeat(s.pressure * 0.3), 0));
        ctx.fillStyle = bGlow;
        ctx.fillRect(cx - bGlowR, cy - bGlowR, bGlowR * 2, bGlowR * 2);

        // Bomb body
        const pulseFactor = 1 + breath * BREATH_PRESSURE_MOD + Math.sin(s.frameCount * 0.1) * 0.02 * s.pressure;
        ctx.beginPath(); ctx.arc(cx + tickOff, cy, bombR * pulseFactor, 0, Math.PI * 2);
        const bombGrad = ctx.createRadialGradient(cx + tickOff, cy, 0, cx + tickOff, cy, bombR * pulseFactor);
        bombGrad.addColorStop(0, rgba(stressHeat(s.pressure * 0.9), ALPHA.content.max * entrance));
        bombGrad.addColorStop(0.6, rgba(s.accentRgb, ALPHA.content.max * 0.8 * entrance));
        bombGrad.addColorStop(1, rgba(s.accentRgb, ALPHA.content.max * 0.5 * entrance));
        ctx.fillStyle = bombGrad; ctx.fill();

        // Specular
        ctx.beginPath();
        ctx.arc(cx + tickOff - bombR * 0.2, cy - bombR * 0.2, bombR * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.glow.max * 0.2 * entrance);
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Expansion field
      // ════════════════════════════════════════════════════
      if (s.expand > 0.1 && s.expand < 1) {
        const fieldR = minDim * (0.15 + s.expand * 0.35);
        const fieldGrad = ctx.createRadialGradient(cx, cy, boxHalf, cx, cy, fieldR);
        const coolStress = Math.max(0, 0.3 - s.expand * 0.3);
        fieldGrad.addColorStop(0, rgba(stressHeat(coolStress), ALPHA.glow.min * 0.04 * entrance));
        fieldGrad.addColorStop(0.6, rgba(stressHeat(coolStress * 0.5), ALPHA.glow.min * 0.02 * entrance));
        fieldGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = fieldGrad;
        ctx.fillRect(cx - fieldR, cy - fieldR, fieldR * 2, fieldR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 6: Detonation ripple cascade
      // ════════════════════════════════════════════════════
      for (const rip of s.ripples) {
        if (s.frameCount < rip.born || rip.alpha <= 0) continue;
        const ripR = rip.r * minDim * 0.5;
        if (ripR < 1) continue;

        // Multi-width ring for visual richness
        ctx.beginPath(); ctx.arc(cx, cy, ripR, 0, Math.PI * 2);
        const ripStress = Math.max(0, 0.4 - rip.r * 0.3);
        ctx.strokeStyle = rgba(
          lerpColor(s.primaryRgb, stressHeat(ripStress), 0.3),
          ALPHA.content.max * rip.alpha * 0.3 * entrance
        );
        ctx.lineWidth = px(STROKE.light, minDim) * (1 + (1 - rip.alpha) * 2); ctx.stroke();

        // Inner thin ring
        if (ripR > minDim * 0.03) {
          ctx.beginPath(); ctx.arc(cx, cy, ripR * 0.85, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * rip.alpha * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
        }
      }

      // Afterglow
      if (s.afterglowAlpha > 0) {
        const agR = minDim * 0.25;
        const ag = ctx.createRadialGradient(cx, cy, 0, cx, cy, agR);
        ag.addColorStop(0, rgba(stressHeat(0.05), ALPHA.glow.max * 0.08 * s.afterglowAlpha * entrance));
        ag.addColorStop(1, rgba(stressHeat(0.05), 0));
        ctx.fillStyle = ag; ctx.fillRect(cx - agR, cy - agR, agR * 2, agR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 7: Force arrows on walls
      // ════════════════════════════════════════════════════
      if (s.pressure > 0.2 && s.expand < 0.8 && !s.detonated) {
        const arrowAlpha = ALPHA.atmosphere.max * 0.25 * s.pressure * (1 - s.expand) * entrance;
        const arrowLen = px(0.012, minDim);
        // Arrows pointing outward from bomb center toward walls
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 * i) / 8;
          const startR = bombR * 1.5;
          const ax = cx + Math.cos(angle) * startR;
          const ay = cy + Math.sin(angle) * startR;
          const aex = cx + Math.cos(angle) * (startR + arrowLen);
          const aey = cy + Math.sin(angle) * (startR + arrowLen);

          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(aex, aey);
          ctx.strokeStyle = rgba(stressHeat(s.pressure * 0.6), arrowAlpha);
          ctx.lineWidth = px(STROKE.thin, minDim); ctx.stroke();

          // Arrowhead
          const headLen = px(0.004, minDim);
          const perpAngle = angle + Math.PI / 2;
          ctx.beginPath();
          ctx.moveTo(aex, aey);
          ctx.lineTo(aex - Math.cos(angle) * headLen + Math.cos(perpAngle) * headLen * 0.5,
                     aey - Math.sin(angle) * headLen + Math.sin(perpAngle) * headLen * 0.5);
          ctx.lineTo(aex - Math.cos(angle) * headLen - Math.cos(perpAngle) * headLen * 0.5,
                     aey - Math.sin(angle) * headLen - Math.sin(perpAngle) * headLen * 0.5);
          ctx.closePath();
          ctx.fillStyle = rgba(stressHeat(s.pressure * 0.6), arrowAlpha);
          ctx.fill();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 8: Progress ring + completion bloom
      // ════════════════════════════════════════════════════
      if (s.expand > 0) {
        const ringR = px(PROGRESS_RING_R, minDim);
        const progValue = s.detonated ? (s.completed ? 1 : 0.8 + s.ripples.filter(r => r.alpha <= 0.01).length / s.ripples.length * 0.2) : s.expand * 0.8;
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

      // Completion bloom
      if (s.bloomT >= 0 && s.bloomT < BLOOM_DURATION) {
        const bf = s.bloomT / BLOOM_DURATION;
        const bR = minDim * (0.15 + bf * 0.3);
        const bAlpha = (1 - bf) * ALPHA.glow.max * 0.12 * entrance;
        const bGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, bR);
        bGrad.addColorStop(0, rgba(s.primaryRgb, bAlpha));
        bGrad.addColorStop(0.5, rgba(stressHeat(0.05), bAlpha * 0.4));
        bGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = bGrad;
        ctx.fillRect(cx - bR, cy - bR, bR * 2, bR * 2);
      }

      // ── Respawn ────────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.expand = 0; s.pressure = 0.1; s.detonated = false;
          s.boxShattered = false; s.completed = false; s.lastTier = 0;
          s.ripples = []; s.bloomT = -1; s.frags = [];
          s.afterglowAlpha = 0;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed || s.detonated) return;
      s.dragging = true;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      s.dragStartDist = Math.sqrt(mx * mx + my * my);
      canvas.setPointerCapture(e.pointerId);
      cbRef.current.onHaptic('hold_start');
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      const dist = Math.sqrt(mx * mx + my * my);
      const delta = dist - s.dragStartDist;
      const prevExpand = s.expand;
      s.expand = Math.max(0, Math.min(1, delta * EXPAND_DRAG_K));
      // Pressure drops as expansion increases
      s.pressure = Math.max(0.05, s.pressure * (1 - (s.expand - prevExpand) * 2));
      cbRef.current.onStateChange?.(s.expand * 0.8);
      const tier = Math.floor(s.expand * 4);
      if (tier > s.lastTier) { cbRef.current.onHaptic('step_advance'); s.lastTier = tier; }
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}
