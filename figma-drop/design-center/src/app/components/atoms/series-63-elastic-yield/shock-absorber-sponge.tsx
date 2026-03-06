/**
 * ATOM 626: THE SHOCK ABSORBER ENGINE
 * =====================================
 * Series 63 — Elastic Yield · Position 6
 *
 * Cure deflecting valid feedback. Generate a porous soft-body sponge
 * instead of a rigid shield — the projectile slows frame by frame,
 * halts safely, and converts into usable power.
 *
 * SIGNATURE TECHNIQUE: Stress Tensor Visualization
 *   - Rigid shield shows catastrophic stress concentration on impact (instant red→white)
 *   - Sponge cells show localized stress absorption (traveling blue→yellow wave)
 *   - Per-cell stress coloring based on projectile proximity
 *   - Energy conversion visualized as stress → power gradient
 *   - Porous geometry deforms under load, each cell compressing independently
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + directional threat gradient
 *   2. Stress field beneath sponge (absorption heat map)
 *   3. Rigid shield shatter debris (failure state)
 *   4. Porous sponge body with per-cell stress coloring
 *   5. Projectile with motion trail + specular
 *   6. Energy conversion glow (absorbed power)
 *   7. Force direction arrows + stress flow indicators
 *   8. Progress ring + completion bloom
 *
 * PHYSICS:
 *   - Projectile approaches at constant speed
 *   - Shield: instant ricochet (stress exceeds yield instantly)
 *   - Sponge: gradual deceleration (stress distributed across cells)
 *   - Absorbed kinetic energy → glowing power conversion
 *   - Breath modulates sponge cell pulse + power glow
 *
 * INTERACTION:
 *   Tap → deploy sponge → projectile absorbed → power
 *   (error_boundary, tap, step_advance, completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static sponge with even stress, projectile halted inside
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

/** Map stress (0–1) → heat color: cool blue → green → yellow → red → white */
function stressHeat(s: number): RGB {
  if (s < 0.25) return lerpColor([50, 90, 200] as RGB, [60, 180, 130] as RGB, s / 0.25);
  if (s < 0.5) return lerpColor([60, 180, 130] as RGB, [220, 200, 50] as RGB, (s - 0.25) / 0.25);
  if (s < 0.75) return lerpColor([220, 200, 50] as RGB, [220, 80, 60] as RGB, (s - 0.5) / 0.25);
  return lerpColor([220, 80, 60] as RGB, [255, 240, 240] as RGB, (s - 0.75) / 0.25);
}

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Sponge position (center X fraction) */
const SPONGE_X_FRAC = 0.58;
/** Sponge width as fraction of minDim */
const SPONGE_W_FRAC = SIZE.md;
/** Sponge height as fraction of minDim */
const SPONGE_H_FRAC = SIZE.lg;
/** Sponge cell grid columns */
const CELL_COLS = 6;
/** Sponge cell grid rows */
const CELL_ROWS = 8;
/** Projectile speed (fraction per frame) */
const PROJ_SPEED = 0.0045;
/** Projectile radius */
const PROJ_R = 0.018;
/** User core position (fraction from left) */
const CORE_X_FRAC = 0.82;
/** Core radius */
const CORE_R = SIZE.md * 0.15;
/** Shield position */
const SHIELD_X_FRAC = 0.55;
/** Absorption deceleration factor */
const ABSORB_DECEL = 0.965;
/** Power conversion rate */
const POWER_CONV_RATE = 0.012;
/** Progress ring radius */
const PROGRESS_RING_R = SIZE.md * 0.85;
/** Ricochet speed (negative) */
const RICOCHET_SPEED = -0.012;
/** Shield fragment count */
const SHIELD_FRAG_COUNT = 12;
/** Fragment lifetime (frames) */
const FRAG_LIFE = 45;
/** Respawn delay */
const RESPAWN_DELAY = 100;
/** Stress wave speed through sponge */
const STRESS_WAVE_SPEED = 0.035;
/** Specular highlight intensity */
const SPECULAR_K = 0.28;
/** Breath glow modulation */
const BREATH_GLOW_MOD = 0.12;
/** Completion bloom duration (frames) */
const BLOOM_DURATION = 50;
/** Motion trail length */
const TRAIL_LEN = 8;
/** Arrow indicator count */
const ARROW_COUNT = 5;
/** Vignette alpha */
const VIGNETTE_ALPHA = 0.035;

// ═════════════════════════════════════════════════════════════════════
// STATE INTERFACES
// ═════════════════════════════════════════════════════════════════════

interface ShieldFrag {
  x: number; y: number;
  vx: number; vy: number;
  rot: number; rotV: number;
  size: number; life: number;
}

interface CellState {
  stress: number;
  compression: number; // 0 = normal, 1 = fully compressed
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function ShockAbsorberSpongeAtom({
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
    // Phase management
    spongeDeployed: false,
    shieldActive: true,
    shieldShattered: false,
    projX: 0.05,
    projVx: PROJ_SPEED,
    absorbing: false,
    absorbProgress: 0,
    power: 0,
    ricochet: false,
    completed: false,
    respawnTimer: 0,
    completions: 0,
    // Stress wave
    stressWaveT: -1,
    // Shield fragments
    frags: [] as ShieldFrag[],
    // Cell states
    cells: Array.from({ length: CELL_COLS * CELL_ROWS }, () => ({ stress: 0, compression: 0 })) as CellState[],
    // Trail
    trail: [] as { x: number; y: number }[],
    // Bloom
    bloomT: -1,
    // Step tier tracking
    lastTier: 0,
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

      const spongeX = w * SPONGE_X_FRAC;
      const spongeW = minDim * SPONGE_W_FRAC;
      const spongeH = minDim * SPONGE_H_FRAC;
      const projR = px(PROJ_R, minDim);
      const coreX = w * CORE_X_FRAC;
      const coreR = px(CORE_R, minDim);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Atmosphere + threat gradient
      // ════════════════════════════════════════════════════
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      // Directional threat gradient from left
      const threatGrad = ctx.createLinearGradient(0, 0, w * 0.4, 0);
      threatGrad.addColorStop(0, rgba(s.accentRgb, VIGNETTE_ALPHA * entrance * (s.completed ? 0 : 1)));
      threatGrad.addColorStop(1, rgba(s.accentRgb, 0));
      ctx.fillStyle = threatGrad; ctx.fillRect(0, 0, w, h);

      // ── Reduced motion ─────────────────────────────────
      if (p.reducedMotion) {
        // Static sponge with even stress distribution, projectile halted inside
        const sl = spongeX - spongeW / 2; const st = cy - spongeH / 2;
        const cellW = spongeW / CELL_COLS; const cellH = spongeH / CELL_ROWS;
        for (let r = 0; r < CELL_ROWS; r++) {
          for (let c = 0; c < CELL_COLS; c++) {
            const cx2 = sl + (c + 0.5) * cellW; const cy2 = st + (r + 0.5) * cellH;
            const stress = 0.15 + 0.1 * Math.sin(c * 0.5 + r * 0.3);
            const sc = stressHeat(stress);
            ctx.fillStyle = rgba(sc, ALPHA.content.max * 0.15 * entrance);
            ctx.fillRect(sl + c * cellW + 1, st + r * cellH + 1, cellW - 2, cellH - 2);
            ctx.beginPath(); ctx.arc(cx2, cy2, px(0.003, minDim), 0, Math.PI * 2);
            ctx.fillStyle = rgba(sc, ALPHA.content.max * 0.3 * entrance); ctx.fill();
          }
        }
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.strokeRect(sl, st, spongeW, spongeH);
        // Halted projectile inside
        ctx.beginPath(); ctx.arc(spongeX - spongeW * 0.1, cy, projR * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance); ctx.fill();
        // Power glow
        const pg = ctx.createRadialGradient(spongeX, cy, 0, spongeX, cy, spongeW);
        pg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.08 * entrance));
        pg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = pg; ctx.fillRect(sl - spongeW, st - spongeH, spongeW * 3, spongeH * 3);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      // ── Physics ─────────────────────────────────────────
      if (!s.completed) {
        // Projectile approach
        if (!s.absorbing && !s.ricochet) {
          s.projX += s.projVx;
          // Update trail
          s.trail.push({ x: s.projX, y: 0.5 });
          if (s.trail.length > TRAIL_LEN) s.trail.shift();

          const projPixX = s.projX * w;
          const hitX = s.spongeDeployed ? spongeX - spongeW / 2 : w * SHIELD_X_FRAC;

          if (projPixX >= hitX) {
            if (s.spongeDeployed) {
              // Sponge absorbs
              s.absorbing = true;
              s.absorbProgress = 0;
              s.stressWaveT = 0;
              cb.onHaptic('tap');
            } else {
              // Shield ricochet → shatter
              s.ricochet = true;
              s.shieldShattered = true;
              s.projVx = RICOCHET_SPEED;
              // Spawn fragments
              s.frags = [];
              for (let i = 0; i < SHIELD_FRAG_COUNT; i++) {
                const angle = (Math.PI * 2 * i) / SHIELD_FRAG_COUNT + Math.random() * 0.3;
                const speed = 0.003 + Math.random() * 0.005;
                s.frags.push({
                  x: hitX / w, y: 0.5,
                  vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                  rot: 0, rotV: (Math.random() - 0.5) * 0.15,
                  size: 0.005 + Math.random() * 0.008, life: FRAG_LIFE,
                });
              }
              cb.onHaptic('error_boundary');
            }
          }
        }

        // Absorption physics
        if (s.absorbing) {
          s.projVx *= ABSORB_DECEL;
          s.projX += s.projVx * 0.4;
          s.absorbProgress = Math.min(1, s.absorbProgress + POWER_CONV_RATE);
          s.power = easeOutCubic(s.absorbProgress);

          // Update cell stress based on projectile penetration depth
          const penetration = (s.projX * w - (spongeX - spongeW / 2)) / spongeW;
          for (let r = 0; r < CELL_ROWS; r++) {
            for (let c = 0; c < CELL_COLS; c++) {
              const cellFrac = c / CELL_COLS;
              const dist = Math.abs(cellFrac - penetration);
              const rowDist = Math.abs(r / CELL_ROWS - 0.5) * 2;
              const cellStress = Math.max(0, 1 - dist * 3 - rowDist * 0.3) * (1 - s.absorbProgress * 0.5);
              s.cells[r * CELL_COLS + c].stress = cellStress;
              s.cells[r * CELL_COLS + c].compression = cellStress * 0.4;
            }
          }

          cb.onStateChange?.(s.power);
          const tier = Math.floor(s.absorbProgress * 4);
          if (tier > s.lastTier) { cb.onHaptic('step_advance'); s.lastTier = tier; }

          if (s.absorbProgress >= 1) {
            s.completed = true;
            s.completions++;
            s.bloomT = 0;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          }
        }

        // Ricochet
        if (s.ricochet) {
          s.projX += s.projVx;
          if (s.projX < -0.15) {
            s.ricochet = false;
            s.projX = 0.05;
            s.projVx = PROJ_SPEED;
            s.shieldShattered = false;
            s.shieldActive = true;
            s.frags = [];
          }
        }

        // Fragment physics
        for (const f of s.frags) {
          f.x += f.vx; f.y += f.vy;
          f.vy += 0.0002; // gravity
          f.rot += f.rotV;
          f.life--;
        }
        s.frags = s.frags.filter(f => f.life > 0);

        // Stress wave
        if (s.stressWaveT >= 0) {
          s.stressWaveT += STRESS_WAVE_SPEED;
          if (s.stressWaveT > 1.5) s.stressWaveT = -1;
        }
      }

      // Bloom timer
      if (s.bloomT >= 0) {
        s.bloomT++;
        if (s.bloomT > BLOOM_DURATION) s.bloomT = -1;
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Stress field beneath sponge
      // ════════════════════════════════════════════════════
      if (s.spongeDeployed && s.absorbing) {
        const sl = spongeX - spongeW / 2; const st = cy - spongeH / 2;
        const fieldGrad = ctx.createRadialGradient(
          sl + spongeW * Math.min(1, s.absorbProgress), cy, 0,
          sl + spongeW * Math.min(1, s.absorbProgress), cy, spongeW * 0.6
        );
        const waveColor = stressHeat(0.3 + s.absorbProgress * 0.4);
        fieldGrad.addColorStop(0, rgba(waveColor, ALPHA.glow.max * 0.08 * entrance * (1 - s.absorbProgress)));
        fieldGrad.addColorStop(0.5, rgba(waveColor, ALPHA.glow.min * 0.04 * entrance));
        fieldGrad.addColorStop(1, rgba(waveColor, 0));
        ctx.fillStyle = fieldGrad;
        ctx.fillRect(sl - spongeW * 0.3, st - spongeH * 0.3, spongeW * 1.6, spongeH * 1.6);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Shield / shatter fragments
      // ════════════════════════════════════════════════════
      if (s.shieldActive && !s.spongeDeployed && !s.shieldShattered) {
        // Draw rigid shield
        const shX = w * SHIELD_X_FRAC;
        const shH = minDim * 0.18;
        ctx.beginPath();
        ctx.moveTo(shX, cy - shH); ctx.lineTo(shX, cy + shH);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.6 * entrance);
        ctx.lineWidth = px(STROKE.bold, minDim); ctx.stroke();
        // Shield stress indicator (solid red = will shatter)
        const shGlow = ctx.createLinearGradient(shX - px(0.02, minDim), 0, shX + px(0.02, minDim), 0);
        shGlow.addColorStop(0, rgba(stressHeat(0.9), 0));
        shGlow.addColorStop(0.5, rgba(stressHeat(0.9), ALPHA.glow.max * 0.06 * entrance));
        shGlow.addColorStop(1, rgba(stressHeat(0.9), 0));
        ctx.fillStyle = shGlow;
        ctx.fillRect(shX - px(0.02, minDim), cy - shH, px(0.04, minDim), shH * 2);
      }

      // Shatter fragments
      for (const f of s.frags) {
        const fx = f.x * w; const fy = f.y * h;
        const lifeAlpha = f.life / FRAG_LIFE;
        ctx.save();
        ctx.translate(fx, fy); ctx.rotate(f.rot);
        ctx.fillStyle = rgba(stressHeat(0.85), ALPHA.content.max * lifeAlpha * entrance);
        ctx.fillRect(-f.size * minDim / 2, -f.size * minDim / 4, f.size * minDim, f.size * minDim / 2);
        ctx.restore();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Porous sponge with per-cell stress
      // ════════════════════════════════════════════════════
      if (s.spongeDeployed) {
        const sl = spongeX - spongeW / 2; const st = cy - spongeH / 2;
        const cellW = spongeW / CELL_COLS; const cellH = spongeH / CELL_ROWS;

        // Sponge body background
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 2 * entrance);
        const bodyR = px(0.008, minDim);
        ctx.beginPath();
        ctx.roundRect(sl, st, spongeW, spongeH, bodyR);
        ctx.fill();

        // Per-cell rendering with stress coloring
        for (let r = 0; r < CELL_ROWS; r++) {
          for (let c = 0; c < CELL_COLS; c++) {
            const cell = s.cells[r * CELL_COLS + c];
            const cx2 = sl + (c + 0.5) * cellW;
            const cy2 = st + (r + 0.5) * cellH;
            const comp = cell.compression;

            // Cell fill with stress heat
            const sc = cell.stress > 0.05 ? stressHeat(cell.stress) : s.primaryRgb;
            const cellAlpha = ALPHA.content.max * (0.08 + cell.stress * 0.25) * entrance;
            ctx.fillStyle = rgba(sc, cellAlpha);
            const inset = 1 + comp * cellW * 0.15;
            ctx.fillRect(sl + c * cellW + inset, st + r * cellH + inset,
              cellW - inset * 2, cellH - inset * 2);

            // Pore (circular hole in center)
            const poreR = px(0.003, minDim) * (1 - comp * 0.5) * (1 + breath * BREATH_GLOW_MOD);
            ctx.beginPath(); ctx.arc(cx2, cy2, poreR, 0, Math.PI * 2);
            ctx.fillStyle = rgba(sc, ALPHA.atmosphere.min * (0.5 + cell.stress) * entrance);
            ctx.fill();
          }
        }

        // Sponge border
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.25 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.beginPath(); ctx.roundRect(sl, st, spongeW, spongeH, bodyR); ctx.stroke();

        // Stress wave ring (propagates through sponge on impact)
        if (s.stressWaveT >= 0 && s.stressWaveT < 1.2) {
          const waveR = s.stressWaveT * spongeW * 0.8;
          const waveAlpha = Math.max(0, 1 - s.stressWaveT / 1.2) * ALPHA.glow.max * 0.1 * entrance;
          ctx.beginPath(); ctx.arc(sl, cy, waveR, -Math.PI / 2, Math.PI / 2);
          ctx.strokeStyle = rgba(stressHeat(0.5 + s.stressWaveT * 0.3), waveAlpha);
          ctx.lineWidth = px(STROKE.light, minDim); ctx.stroke();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Projectile with motion trail + specular
      // ════════════════════════════════════════════════════
      if (!s.completed || s.bloomT >= 0) {
        const ppx = s.projX * w;

        // Motion trail
        if (s.trail.length > 1) {
          for (let i = 0; i < s.trail.length - 1; i++) {
            const t = i / s.trail.length;
            const tx = s.trail[i].x * w;
            ctx.beginPath(); ctx.arc(tx, cy, projR * (0.3 + t * 0.3), 0, Math.PI * 2);
            ctx.fillStyle = rgba(s.accentRgb, ALPHA.atmosphere.min * t * entrance);
            ctx.fill();
          }
        }

        if (!s.completed) {
          // Projectile diamond shape
          ctx.beginPath();
          ctx.moveTo(ppx + projR * 1.6, cy);
          ctx.lineTo(ppx, cy - projR);
          ctx.lineTo(ppx - projR * 0.8, cy);
          ctx.lineTo(ppx, cy + projR);
          ctx.closePath();

          // Multi-stop gradient fill
          const projGrad = ctx.createLinearGradient(ppx - projR, cy - projR, ppx + projR, cy + projR);
          projGrad.addColorStop(0, rgba(s.accentRgb, ALPHA.content.max * entrance));
          projGrad.addColorStop(0.6, rgba(lerpColor(s.accentRgb, [255, 255, 255] as RGB, SPECULAR_K), ALPHA.content.max * entrance));
          projGrad.addColorStop(1, rgba(s.accentRgb, ALPHA.content.max * 0.7 * entrance));
          ctx.fillStyle = projGrad; ctx.fill();

          // Specular highlight
          ctx.beginPath(); ctx.arc(ppx + projR * 0.4, cy - projR * 0.3, projR * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.glow.max * SPECULAR_K * entrance);
          ctx.fill();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 6: Energy conversion glow
      // ════════════════════════════════════════════════════
      if (s.power > 0 && s.spongeDeployed) {
        const powerGlow = ctx.createRadialGradient(
          spongeX, cy, 0,
          spongeX, cy, spongeW * (0.8 + s.power * 0.6)
        );
        const powerColor = lerpColor(s.accentRgb, s.primaryRgb, s.power);
        powerGlow.addColorStop(0, rgba(powerColor, ALPHA.glow.max * 0.12 * s.power * entrance * (1 + breath * BREATH_GLOW_MOD)));
        powerGlow.addColorStop(0.4, rgba(powerColor, ALPHA.glow.max * 0.06 * s.power * entrance));
        powerGlow.addColorStop(1, rgba(powerColor, 0));
        ctx.fillStyle = powerGlow;
        ctx.fillRect(spongeX - spongeW, cy - spongeH, spongeW * 2, spongeH * 2);
      }

      // Completion bloom
      if (s.bloomT >= 0 && s.bloomT < BLOOM_DURATION) {
        const bloomFrac = s.bloomT / BLOOM_DURATION;
        const bloomR = minDim * (0.1 + bloomFrac * 0.35);
        const bloomAlpha = (1 - bloomFrac) * ALPHA.glow.max * 0.15 * entrance;
        const bloomGrad = ctx.createRadialGradient(spongeX, cy, 0, spongeX, cy, bloomR);
        bloomGrad.addColorStop(0, rgba(s.primaryRgb, bloomAlpha));
        bloomGrad.addColorStop(0.5, rgba(s.primaryRgb, bloomAlpha * 0.4));
        bloomGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = bloomGrad;
        ctx.fillRect(spongeX - bloomR, cy - bloomR, bloomR * 2, bloomR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 7: Force direction arrows
      // ════════════════════════════════════════════════════
      if (s.absorbing && s.absorbProgress < 0.9) {
        const arrowAlpha = ALPHA.atmosphere.max * 0.3 * (1 - s.absorbProgress) * entrance;
        const sl = spongeX - spongeW / 2;
        for (let i = 0; i < ARROW_COUNT; i++) {
          const t = (i + 0.5) / ARROW_COUNT;
          const ay = cy - spongeH / 2 + t * spongeH;
          const ax = sl + s.absorbProgress * spongeW * 0.6 + Math.sin(s.frameCount * 0.05 + i) * minDim * 0.01;
          const arrowLen = px(0.012, minDim);
          // Arrow body
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + arrowLen, ay);
          ctx.strokeStyle = rgba(stressHeat(0.3 + s.absorbProgress * 0.4), arrowAlpha);
          ctx.lineWidth = px(STROKE.thin, minDim); ctx.stroke();
          // Arrow head
          ctx.beginPath();
          ctx.moveTo(ax + arrowLen, ay);
          ctx.lineTo(ax + arrowLen - px(0.004, minDim), ay - px(0.003, minDim));
          ctx.lineTo(ax + arrowLen - px(0.004, minDim), ay + px(0.003, minDim));
          ctx.closePath();
          ctx.fillStyle = rgba(stressHeat(0.3 + s.absorbProgress * 0.4), arrowAlpha);
          ctx.fill();
        }
      }

      // ── User core ─────────────────────────────────────
      const corePulse = 1 + breath * 0.08 + (s.completed ? Math.sin(s.frameCount * 0.06) * 0.03 : 0);
      ctx.beginPath(); ctx.arc(coreX, cy, coreR * corePulse, 0, Math.PI * 2);
      const coreGrad = ctx.createRadialGradient(coreX, cy, 0, coreX, cy, coreR * corePulse);
      coreGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * entrance));
      coreGrad.addColorStop(0.7, rgba(s.primaryRgb, ALPHA.content.max * 0.6 * entrance));
      coreGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.atmosphere.min * entrance));
      ctx.fillStyle = coreGrad; ctx.fill();

      // ════════════════════════════════════════════════════
      // RENDER LAYER 8: Progress ring
      // ════════════════════════════════════════════════════
      if (s.absorbProgress > 0) {
        const ringR = px(PROGRESS_RING_R, minDim);
        const ringAngle = s.absorbProgress * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, -Math.PI / 2, -Math.PI / 2 + ringAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim); ctx.stroke();

        // Progress text
        if (s.absorbProgress > 0.1) {
          const pct = Math.round(s.absorbProgress * 100);
          ctx.font = `${px(FONT_SIZE.xs, minDim)}px sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.min * entrance);
          ctx.fillText(`${pct}%`, cx, cy + ringR + px(0.025, minDim));
        }
      }

      // ── Respawn ────────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.spongeDeployed = false; s.shieldActive = true; s.shieldShattered = false;
          s.projX = 0.05; s.projVx = PROJ_SPEED;
          s.absorbing = false; s.absorbProgress = 0; s.power = 0;
          s.ricochet = false; s.completed = false; s.lastTier = 0;
          s.stressWaveT = -1; s.frags = []; s.trail = []; s.bloomT = -1;
          s.cells = Array.from({ length: CELL_COLS * CELL_ROWS }, () => ({ stress: 0, compression: 0 }));
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.spongeDeployed && !s.completed && !s.absorbing) {
        s.spongeDeployed = true;
        s.shieldActive = false;
        cbRef.current.onHaptic('tap');
        cbRef.current.onStateChange?.(0.15);
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
