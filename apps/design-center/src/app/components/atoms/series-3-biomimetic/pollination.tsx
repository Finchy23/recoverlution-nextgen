/**
 * ATOM 029: THE POLLINATION ENGINE
 * ==================================
 * Series 3 — Biomimetic Algorithms · Position 9
 *
 * Good ideas are sterile alone — they need to cross-pollinate to
 * survive. Drag a glowing pollen particle across the screen. As
 * it moves it sheds spores. Where spores collide with idle seed
 * nodes, sudden, beautiful geometric blooms erupt — intricate
 * radial symmetry flowers unique to each collision. All nodes
 * pollinated → completion.
 *
 * PHYSICS:
 *   - 7 seed nodes (idle thoughts) scattered across viewport
 *   - User drags a pollen source; it sheds spore particles
 *   - Spore collision with seed → procedural geometric bloom
 *   - Each bloom: unique petal count, radial symmetry, growth arc
 *   - Wind drift on spores (breath modulates wind)
 *   - Bloom expansion: organic growth easing
 *
 * HAPTIC JOURNEY:
 *   Drag pollen   → tap (scatter)
 *   Spore collision→ drag_snap (burst bloom)
 *   All bloomed    → completion
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: No spore trail, instant bloom growth
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, easeOutCubic, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const SEED_COUNT = 7;
const SPORE_EMIT_RATE = 3;   // spores per frame while dragging
const SPORE_MAX = 200;
const SPORE_LIFETIME = 120;  // frames
const COLLISION_RADIUS_FRAC = 0.036;
const BLOOM_DURATION = 90;   // frames
const POLLEN_RADIUS_FRAC = 0.016;
const SEED_RADIUS_FRAC = 0.02;
const BLOOM_MAX_RADIUS_FRAC = 0.06;

// =====================================================================
// DATA STRUCTURES
// =====================================================================

interface SeedNode {
  x: number;
  y: number;
  /** Has this seed been pollinated? */
  bloomed: boolean;
  /** Bloom progress 0–1 */
  bloomProgress: number;
  /** Unique bloom parameters */
  petalCount: number;
  petalCurve: number;    // curvature of petals
  innerRatio: number;    // inner radius as fraction of outer
  rotationOffset: number;
  /** Idle shimmer phase */
  shimmerPhase: number;
}

interface Spore {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;  // frames remaining
  size: number;
  alpha: number;
}

// =====================================================================
// COLOR
// =====================================================================

// Palette
const POLLEN_CORE: RGB = [220, 190, 80];
const POLLEN_GLOW: RGB = [200, 180, 60];
const SPORE_COLOR: RGB = [200, 185, 90];
const SEED_DORMANT: RGB = [60, 70, 55];
const SEED_DORMANT_EDGE: RGB = [80, 90, 70];
const BLOOM_PETAL: RGB = [160, 200, 90];
const BLOOM_CENTER: RGB = [220, 195, 80];
const BLOOM_OUTER: RGB = [110, 175, 70];

// =====================================================================
// GENERATION
// =====================================================================

function createSeeds(w: number, h: number): SeedNode[] {
  const seeds: SeedNode[] = [];
  const margin = Math.min(w, h) * 0.1;

  for (let i = 0; i < SEED_COUNT; i++) {
    let x: number, y: number;
    let attempts = 0;
    do {
      x = margin + Math.random() * (w - margin * 2);
      y = margin + Math.random() * (h - margin * 2);
      attempts++;
    } while (
      attempts < 200 &&
      seeds.some(s => Math.hypot(s.x - x, s.y - y) < Math.min(w, h) * 0.12)
    );

    seeds.push({
      x, y,
      bloomed: false,
      bloomProgress: 0,
      petalCount: 5 + Math.floor(Math.random() * 5), // 5–9
      petalCurve: 0.3 + Math.random() * 0.5,
      innerRatio: 0.2 + Math.random() * 0.25,
      rotationOffset: Math.random() * Math.PI * 2,
      shimmerPhase: Math.random() * Math.PI * 2,
    });
  }
  return seeds;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function PollinationAtom({
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
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; },
    [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    seeds: [] as SeedNode[],
    spores: [] as Spore[],
    // Pollen (user-dragged)
    isDragging: false,
    pollenX: 0,
    pollenY: 0,
    prevPollenX: 0,
    prevPollenY: 0,
    // Counts
    bloomedCount: 0,
    resolved: false,
    // Entrance
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
    const seedR = minDim * SEED_RADIUS_FRAC;
    const bloomMaxR = minDim * BLOOM_MAX_RADIUS_FRAC;

    if (!s.initialized) {
      s.seeds = createSeeds(w, h);
      s.initialized = true;
    }

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const p = propsRef.current;
      const cb = cbRef.current;

      const cw = Math.round(w * dpr);
      const ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
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

      // ── Spore emission ───────────────────────────────
      if (s.isDragging && s.spores.length < SPORE_MAX) {
        const dx = s.pollenX - s.prevPollenX;
        const dy = s.pollenY - s.prevPollenY;
        const speed = Math.hypot(dx, dy);
        const emitCount = Math.min(SPORE_EMIT_RATE, SPORE_MAX - s.spores.length);

        for (let i = 0; i < emitCount; i++) {
          const windX = p.breathAmplitude * (Math.random() - 0.5) * 2;
          s.spores.push({
            x: s.pollenX + (Math.random() - 0.5) * minDim * 0.016,
            y: s.pollenY + (Math.random() - 0.5) * minDim * 0.016,
            vx: (Math.random() - 0.5) * minDim * 0.003 + windX + dx * 0.05,
            vy: (Math.random() - 0.5) * minDim * 0.003 + dy * 0.05 - minDim * 0.0006,
            life: SPORE_LIFETIME,
            size: minDim * (0.002 + Math.random() * 0.004),
            alpha: 0.3 + Math.random() * 0.4,
          });
        }
      }

      // ── Spore physics + collision ─────────────────────
      for (let i = s.spores.length - 1; i >= 0; i--) {
        const sp = s.spores[i];
        sp.x += sp.vx * (p.reducedMotion ? 0.4 : 1);
        sp.y += sp.vy * (p.reducedMotion ? 0.4 : 1);
        sp.vy += 0.008; // gentle gravity
        // Wind
        sp.vx += (Math.random() - 0.5) * 0.05;
        sp.life--;

        if (sp.life <= 0 || sp.x < -20 || sp.x > w + 20 || sp.y > h + 20) {
          s.spores.splice(i, 1);
          continue;
        }

        // Collision with unbloomed seeds
        for (const seed of s.seeds) {
          if (seed.bloomed) continue;
          const d = Math.hypot(sp.x - seed.x, sp.y - seed.y);
          if (d < COLLISION_RADIUS_FRAC * minDim + seedR) {
            seed.bloomed = true;
            s.bloomedCount++;
            s.spores.splice(i, 1);
            cb.onHaptic('drag_snap');

            if (s.bloomedCount >= SEED_COUNT && !s.resolved) {
              s.resolved = true;
              cb.onHaptic('completion');
              cb.onResolve?.();
            }
            break;
          }
        }
      }

      // ── Bloom growth ──────────────────────────────────
      for (const seed of s.seeds) {
        if (seed.bloomed && seed.bloomProgress < 1) {
          seed.bloomProgress = Math.min(1, seed.bloomProgress + (p.reducedMotion ? 0.05 : 0.012));
        }
      }

      cb.onStateChange?.(s.bloomedCount / SEED_COUNT);

      // ══════════════════════════════════════════════════
      // RENDER
      // ═════════════════════════════════════════════════

      // Background
      const bgBase = lerpColor([4, 6, 3], s.primaryRgb, 0.02);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgBase, entrance * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgBase, entrance * 0.015));
      bgGrad.addColorStop(1, rgba(bgBase, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Gentle green atmosphere
      const atmGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.4);
      atmGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [10, 15, 8], 0.8), 0.025 * entrance));
      atmGrad.addColorStop(1, rgba(bgBase, 0));
      ctx.fillStyle = atmGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Seeds / Blooms ────────────────────────────────
      for (const seed of s.seeds) {
        if (seed.bloomed && seed.bloomProgress > 0) {
          drawBloom(ctx, seed, bloomMaxR, s, entrance, p.reducedMotion);
        } else {
          // Dormant seed
          const shimmer = p.reducedMotion ? 0.5 :
            0.4 + 0.6 * (0.5 + 0.5 * Math.sin(s.frameCount * 0.015 + seed.shimmerPhase));
          const sdColor = lerpColor(SEED_DORMANT, s.primaryRgb, 0.08);
          const sdAlpha = shimmer * 0.2 * entrance;

          // Glow
          const glowR = seedR * 3;
          const glowGrad = ctx.createRadialGradient(seed.x, seed.y, 0, seed.x, seed.y, glowR);
          glowGrad.addColorStop(0, rgba(lerpColor(SEED_DORMANT_EDGE, s.primaryRgb, 0.1), sdAlpha * 0.2));
          glowGrad.addColorStop(1, rgba(SEED_DORMANT, 0));
          ctx.fillStyle = glowGrad;
          ctx.fillRect(seed.x - glowR, seed.y - glowR, glowR * 2, glowR * 2);

          // Seed body
          ctx.beginPath();
          ctx.arc(seed.x, seed.y, seedR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(sdColor, sdAlpha);
          ctx.fill();
          ctx.strokeStyle = rgba(lerpColor(SEED_DORMANT_EDGE, s.primaryRgb, 0.06), sdAlpha * 0.5);
          ctx.lineWidth = minDim * 0.001;
          ctx.stroke();
        }
      }

      // ── Spores ────────────────────────────────────────
      for (const sp of s.spores) {
        const lifeFrac = sp.life / SPORE_LIFETIME;
        const spColor = lerpColor(SPORE_COLOR, s.accentRgb, 0.12);
        const spAlpha = sp.alpha * lifeFrac * entrance;

        if (sp.size > minDim * 0.003) {
          const glowR = sp.size * 2;
          const glowGrad = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, glowR);
          glowGrad.addColorStop(0, rgba(spColor, spAlpha * 0.15));
          glowGrad.addColorStop(1, rgba(spColor, 0));
          ctx.fillStyle = glowGrad;
          ctx.fillRect(sp.x - glowR, sp.y - glowR, glowR * 2, glowR * 2);
        }

        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = rgba(spColor, spAlpha);
        ctx.fill();
      }

      // ── Pollen source (when dragging) ─────────────────
      if (s.isDragging) {
        const plColor = lerpColor(POLLEN_CORE, s.accentRgb, 0.12);
        const plGlowR = minDim * POLLEN_RADIUS_FRAC * 3;
        const plGrad = ctx.createRadialGradient(
          s.pollenX, s.pollenY, 0,
          s.pollenX, s.pollenY, plGlowR,
        );
        plGrad.addColorStop(0, rgba(plColor, 0.2 * entrance));
        plGrad.addColorStop(0.4, rgba(lerpColor(POLLEN_GLOW, s.accentRgb, 0.1), 0.06 * entrance));
        plGrad.addColorStop(1, rgba(plColor, 0));
        ctx.fillStyle = plGrad;
        ctx.fillRect(s.pollenX - plGlowR, s.pollenY - plGlowR, plGlowR * 2, plGlowR * 2);

        ctx.beginPath();
        ctx.arc(s.pollenX, s.pollenY, minDim * POLLEN_RADIUS_FRAC * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = rgba(plColor, 0.3 * entrance);
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      s.isDragging = true;
      s.pollenX = (e.clientX - rect.left) / rect.width * w;
      s.pollenY = (e.clientY - rect.top) / rect.height * h;
      s.prevPollenX = s.pollenX;
      s.prevPollenY = s.pollenY;
      cbRef.current.onHaptic('tap');
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      if (!s.isDragging) return;
      s.prevPollenX = s.pollenX;
      s.prevPollenY = s.pollenY;
      s.pollenX = (e.clientX - rect.left) / rect.width * w;
      s.pollenY = (e.clientY - rect.top) / rect.height * h;
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.isDragging = false;
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

// =====================================================================
// BLOOM RENDERER
// =====================================================================

function drawBloom(
  ctx: CanvasRenderingContext2D,
  seed: SeedNode,
  maxR: number,
  state: { frameCount: number; primaryRgb: [number, number, number]; accentRgb: [number, number, number] },
  entrance: number,
  reducedMotion: boolean,
) {
  const t = easeOutCubic(seed.bloomProgress);
  const r = maxR * t;
  if (r < 1) return;

  const { x, y, petalCount, petalCurve, innerRatio, rotationOffset } = seed;
  const innerR = r * innerRatio;
  const rotation = reducedMotion ? rotationOffset :
    rotationOffset + state.frameCount * 0.001;

  const petalColor = lerpColor(BLOOM_PETAL, state.accentRgb, 0.12);
  const outerColor = lerpColor(BLOOM_OUTER, state.primaryRgb, 0.1);
  const centerColor = lerpColor(BLOOM_CENTER, state.accentRgb, 0.1);
  const alpha = t * 0.3 * entrance;

  // Bloom glow
  const glowR = r * 2;
  const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, glowR);
  glowGrad.addColorStop(0, rgba(petalColor, alpha * 0.15));
  glowGrad.addColorStop(0.5, rgba(petalColor, alpha * 0.03));
  glowGrad.addColorStop(1, rgba(petalColor, 0));
  ctx.fillStyle = glowGrad;
  ctx.fillRect(x - glowR, y - glowR, glowR * 2, glowR * 2);

  // Petals
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2;
    const nextAngle = ((i + 1) / petalCount) * Math.PI * 2;
    const midAngle = (angle + nextAngle) / 2;

    // Outer petal point
    const ox = Math.cos(angle) * r;
    const oy = Math.sin(angle) * r;

    // Control point (curve)
    const cx = Math.cos(midAngle) * r * (1 + petalCurve * 0.3);
    const cy = Math.sin(midAngle) * r * (1 + petalCurve * 0.3);

    // Inner point
    const ix = Math.cos(midAngle) * innerR;
    const iy = Math.sin(midAngle) * innerR;

    ctx.beginPath();
    ctx.moveTo(ix, iy);
    ctx.quadraticCurveTo(cx, cy, ox, oy);
    ctx.quadraticCurveTo(
      Math.cos(angle) * r * 0.6, Math.sin(angle) * r * 0.6,
      ix, iy,
    );
    ctx.fillStyle = rgba(
      lerpColor(petalColor, outerColor, i / petalCount * 0.3),
      alpha * 0.8,
    );
    ctx.fill();
  }

  // Center
  ctx.beginPath();
  ctx.arc(0, 0, innerR * 0.8, 0, Math.PI * 2);
  ctx.fillStyle = rgba(centerColor, alpha);
  ctx.fill();

  // Center specular
  ctx.beginPath();
  ctx.arc(-innerR * 0.15, -innerR * 0.15, innerR * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = rgba([255, 255, 255], alpha * 0.3);
  ctx.fill();

  ctx.restore();
}