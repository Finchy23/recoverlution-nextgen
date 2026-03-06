/**
 * ATOM 023: THE COMPOSTING ENGINE
 * =================================
 * Series 3 — Biomimetic Algorithms · Position 3
 *
 * To utterly destroy the concept of a "mistake." In nature,
 * there is no trash; there is only fertiliser. This atom lets
 * the user physically transmute shame and regret into the exact
 * fuel needed for the next growth cycle.
 *
 * 7 abstract leaf-like forms float gently — fragile, grey,
 * brittle. Dead. Tap a leaf → it DECOMPOSES. It fractures into
 * dozens of particles that settle downward, shifting color:
 * dead grey → rich amber → warm brown → vibrant nitrogen-green.
 * Particles settle at the bottom, forming a growing bed of
 * rich, glowing soil.
 *
 * As more leaves compost, the soil rises. Tiny green sprouts
 * emerge. At full resolution (all composted): the soil erupts
 * with life. What was dead is now the foundation of everything new.
 *
 * PHYSICS:
 *   - 7 procedural leaf forms (organic Bezier shapes)
 *   - Tap → decomposition: leaf → ~35 particles with gravity
 *   - Chromatic shift: grey → amber → brown → green
 *   - Particle settling with slight horizontal scatter
 *   - Soil bed: accumulating particles at bottom
 *   - Sprout generation after 3+ leaves composted
 *   - Warm rising nutrient glow from soil
 *
 * HAPTIC JOURNEY:
 *   Tap leaf → crumbling dissolution (tap)
 *   Each leaf composted → step_advance
 *   All composted → completion + warm rising glow
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Instant decomposition, no floating, static sprouts
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, easeOutCubic, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

/** Number of leaf forms */
const LEAF_COUNT = 7;
/** Particles per decomposed leaf */
const PARTICLES_PER_LEAF = 35;
/** Gravity on compost particles */
const GRAVITY = 0.025;
/** Horizontal scatter on decomposition */
const SCATTER_X = 1.8;
/** Soil line as fraction from bottom */
const SOIL_LINE_FRAC = 0.18;
/** Sprout count per composted leaf (after threshold) */
const SPROUTS_PER_LEAF = 2;
/** Leaves composted before sprouts start */
const SPROUT_THRESHOLD = 3;
/** Max sprout height as fraction of viewport height */
const MAX_SPROUT_HEIGHT_FRAC = 0.06;
/** Leaf float speed */
const FLOAT_SPEED = 0.003;
/** Leaf size as fraction of min dimension */
const LEAF_SIZE_FRAC = 0.05;

// =====================================================================
// LEAF FORM
// =====================================================================

interface LeafForm {
  /** Center position (normalized 0–1) */
  cx: number;
  cy: number;
  /** Size */
  size: number;
  /** Rotation */
  rotation: number;
  /** Float phase */
  floatPhase: number;
  floatSpeed: number;
  /** Whether composted */
  composted: boolean;
  /** Decomposition progress 0–1 */
  decompProgress: number;
  /** Visual alpha (fades during decomposition) */
  alpha: number;
  /** Leaf shape seed (for Bezier variance) */
  shapeSeed: number;
}

function createLeaves(): LeafForm[] {
  const leaves: LeafForm[] = [];
  for (let i = 0; i < LEAF_COUNT; i++) {
    // Distribute across the upper viewport
    const col = i % 3;
    const row = Math.floor(i / 3);
    leaves.push({
      cx: 0.2 + col * 0.3 + (Math.random() - 0.5) * 0.12,
      cy: 0.12 + row * 0.2 + (Math.random() - 0.5) * 0.06,
      size: 0.8 + Math.random() * 0.4,
      rotation: (Math.random() - 0.5) * 0.8,
      floatPhase: Math.random() * Math.PI * 2,
      floatSpeed: FLOAT_SPEED + Math.random() * FLOAT_SPEED,
      composted: false,
      decompProgress: 0,
      alpha: 1,
      shapeSeed: Math.random(),
    });
  }
  return leaves;
}

// =====================================================================
// COMPOST PARTICLE
// =====================================================================

interface CompostParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 0→1 chromatic shift progress (grey→amber→brown→green) */
  chromaProgress: number;
  chromaSpeed: number;
  /** Size */
  size: number;
  /** Whether settled on soil */
  settled: boolean;
  /** Brightness */
  brightness: number;
}

// =====================================================================
// SPROUT
// =====================================================================

interface Sprout {
  x: number;
  /** Growth progress 0→1 */
  growth: number;
  growthSpeed: number;
  /** Max height in pixels */
  maxHeight: number;
  /** Lean angle */
  lean: number;
  /** Phase for gentle sway */
  swayPhase: number;
}

// =====================================================================
// COLOR
// =====================================================================

/**
 * 4-stop chromatic shift for composting:
 *   0.0 → dead grey
 *   0.3 → rich amber
 *   0.6 → warm brown
 *   1.0 → vibrant green
 */
function compostColor(t: number, primaryRgb: RGB, accentRgb: RGB): RGB {
  const DEAD_GREY: RGB = [100, 95, 90];
  const RICH_AMBER: RGB = [170, 130, 50];
  const WARM_BROWN: RGB = [90, 65, 35];
  const NITROGEN_GREEN: RGB = [80, 170, 60];

  let base: RGB;
  if (t < 0.3) {
    base = lerpColor(DEAD_GREY, RICH_AMBER, t / 0.3);
  } else if (t < 0.6) {
    base = lerpColor(RICH_AMBER, WARM_BROWN, (t - 0.3) / 0.3);
  } else {
    base = lerpColor(WARM_BROWN, NITROGEN_GREEN, (t - 0.6) / 0.4);
  }

  // Blend with color story
  return lerpColor(base, t < 0.5 ? primaryRgb : accentRgb, 0.08);
}

// Dead leaf palette
const DEAD_LEAF: RGB = [85, 80, 75];         // Desaturated, brittle
const DEAD_LEAF_EDGE: RGB = [65, 60, 55];    // Darker edge
const SOIL_BED: RGB = [45, 35, 25];          // Rich soil
const NUTRIENT_GLOW: RGB = [100, 160, 60];   // Rising energy
const SPROUT_GREEN: RGB = [90, 180, 65];     // New growth

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function CompostingAtom({
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
  const callbacksRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange, onResolve }; },
    [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    leaves: [] as LeafForm[],
    particles: [] as CompostParticle[],
    sprouts: [] as Sprout[],
    // Counts
    compostedCount: 0,
    // Resolution
    resolved: false,
    resolveGlow: 0,
    // Soil
    soilLevel: 0, // 0–1 how full the soil bed is
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

  // ── Main render loop ─────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const s = stateRef.current;
    const minDim = Math.min(w, h);
    const soilY = h * (1 - SOIL_LINE_FRAC);

    if (!s.initialized) {
      s.leaves = createLeaves();
      s.initialized = true;
    }

    // ── Native tap handler ──────────────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      let hitLeaf: LeafForm | null = null;
      let hitDist = Infinity;
      for (const leaf of s.leaves) {
        if (leaf.composted) continue;
        const dx = px - leaf.cx;
        const dy = py - leaf.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const hitRadius = LEAF_SIZE_FRAC * leaf.size * 1.5;
        if (dist < hitRadius && dist < hitDist) {
          hitLeaf = leaf;
          hitDist = dist;
        }
      }

      if (hitLeaf) {
        hitLeaf.composted = true;
        hitLeaf.decompProgress = 0;
        s.compostedCount++;

        const leafPx = hitLeaf.cx * w;
        const leafPy = hitLeaf.cy * h;
        const leafSize = minDim * LEAF_SIZE_FRAC * hitLeaf.size;

        for (let i = 0; i < PARTICLES_PER_LEAF; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * leafSize * 0.6;
          s.particles.push({
            x: leafPx + Math.cos(angle) * dist,
            y: leafPy + Math.sin(angle) * dist,
            vx: (Math.random() - 0.5) * SCATTER_X,
            vy: -Math.random() * 0.5,
            chromaProgress: 0,
            chromaSpeed: 0.003 + Math.random() * 0.004,
            size: minDim * (0.003 + Math.random() * 0.007),
            settled: false,
            brightness: 0.4 + Math.random() * 0.6,
          });
        }

        callbacksRef.current.onHaptic('tap');
        callbacksRef.current.onHaptic('step_advance');

        if (s.compostedCount >= SPROUT_THRESHOLD) {
          for (let i = 0; i < SPROUTS_PER_LEAF; i++) {
            s.sprouts.push({
              x: w * 0.1 + Math.random() * w * 0.8,
              growth: 0,
              growthSpeed: 0.002 + Math.random() * 0.003,
              maxHeight: h * MAX_SPROUT_HEIGHT_FRAC * (0.5 + Math.random() * 0.5),
              lean: (Math.random() - 0.5) * 0.3,
              swayPhase: Math.random() * Math.PI * 2,
            });
          }
        }

        if (s.compostedCount >= LEAF_COUNT && !s.resolved) {
          s.resolved = true;
          callbacksRef.current.onHaptic('completion');
          callbacksRef.current.onResolve?.();
        }
      }
    };

    canvas.addEventListener('pointerdown', onDown);

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const p = propsRef.current;
      const cb = callbacksRef.current;

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

      // ── Particle physics ──────────────────────────────
      let settledCount = 0;
      for (const particle of s.particles) {
        if (particle.settled) {
          settledCount++;
          continue;
        }

        // Gravity
        particle.vy += GRAVITY;
        particle.vx *= 0.99; // Air resistance
        particle.vy *= 0.99;

        particle.x += particle.vx;
        particle.y += particle.vy;

        // Chromatic shift over time
        particle.chromaProgress = Math.min(1, particle.chromaProgress + particle.chromaSpeed);

        // Settle on soil
        const settleY = soilY + Math.random() * h * SOIL_LINE_FRAC * 0.3;
        if (particle.y >= settleY) {
          particle.y = settleY;
          particle.settled = true;
          particle.chromaProgress = Math.min(1, particle.chromaProgress + 0.1);
        }
      }

      // Soil level
      s.soilLevel = s.compostedCount / LEAF_COUNT;

      // ── Sprout growth ─────────────────────────────────
      for (const sprout of s.sprouts) {
        if (sprout.growth < 1) {
          const rate = p.reducedMotion ? 0.02 : sprout.growthSpeed;
          sprout.growth = Math.min(1, sprout.growth + rate);
        }
      }

      // ── Leaf decomposition ────────────────────────────
      for (const leaf of s.leaves) {
        if (leaf.composted && leaf.decompProgress < 1) {
          leaf.decompProgress = Math.min(1, leaf.decompProgress + (p.reducedMotion ? 0.08 : 0.015));
          leaf.alpha = Math.max(0, 1 - leaf.decompProgress * 1.5);
        }
      }

      // ── State reporting ───────────────────────────────
      cb.onStateChange?.(s.compostedCount / LEAF_COUNT);

      // ── Resolution glow ───────────────────────────────
      if (s.resolved) {
        s.resolveGlow = Math.min(1, s.resolveGlow + 0.004);
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      // ── Background ────────────────────────────────────
      const bgColor = lerpColor([6, 7, 5], s.primaryRgb, 0.02);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgColor, entrance * 0.03));
      bgGrad.addColorStop(0.6, rgba(lerpColor(bgColor, SOIL_BED, 0.15), entrance * 0.015));
      bgGrad.addColorStop(1, rgba(bgColor, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Soil bed ──────────────────────────────────────
      const soilAlpha = (0.15 + s.soilLevel * 0.25) * entrance;
      const soilColor = lerpColor(SOIL_BED, s.primaryRgb, 0.06);
      const soilGrad = ctx.createLinearGradient(0, soilY, 0, h);
      soilGrad.addColorStop(0, rgba(soilColor, soilAlpha));
      soilGrad.addColorStop(0.3, rgba(lerpColor(soilColor, [20, 15, 10], 0.3), soilAlpha * 0.8));
      soilGrad.addColorStop(1, rgba(lerpColor([10, 8, 5], s.primaryRgb, 0.02), soilAlpha * 0.6));
      ctx.fillStyle = soilGrad;
      ctx.fillRect(0, soilY, w, h - soilY);

      // Soil surface highlight (grows brighter with more compost)
      if (s.soilLevel > 0.1) {
        const surfAlpha = s.soilLevel * 0.04 * entrance;
        const surfColor = lerpColor(NUTRIENT_GLOW, s.accentRgb, 0.2);
        const surfThick = minDim * 0.01;
        const surfGrad = ctx.createLinearGradient(0, soilY - surfThick * 0.3, 0, soilY + surfThick * 0.7);
        surfGrad.addColorStop(0, rgba(surfColor, 0));
        surfGrad.addColorStop(0.4, rgba(surfColor, surfAlpha));
        surfGrad.addColorStop(1, rgba(surfColor, 0));
        ctx.fillStyle = surfGrad;
        ctx.fillRect(0, soilY - surfThick * 0.3, w, surfThick);
      }

      // ── Settled particles (soil texture) ─────────────
      for (const particle of s.particles) {
        if (!particle.settled) continue;
        const pColor = compostColor(particle.chromaProgress, s.primaryRgb, s.accentRgb);
        const pAlpha = particle.brightness * 0.25 * entrance;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = rgba(pColor, pAlpha);
        ctx.fill();
      }

      // ── Sprouts ───────────────────────────────────────
      for (const sprout of s.sprouts) {
        if (sprout.growth < 0.01) continue;
        const sproutH = sprout.maxHeight * easeOutCubic(sprout.growth);
        const baseX = sprout.x;
        const baseY = soilY;

        let sway = 0;
        if (!p.reducedMotion) {
          sway = Math.sin(s.frameCount * 0.008 + sprout.swayPhase) * minDim * 0.004 * sprout.growth;
        }

        const tipX = baseX + sprout.lean * sproutH + sway;
        const tipY = baseY - sproutH;

        // Sprout stem
        const stemColor = lerpColor(SPROUT_GREEN, s.accentRgb, 0.15);
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        // Slight curve via quadratic bezier
        const cpX = (baseX + tipX) / 2 + sway * 0.5;
        const cpY = (baseY + tipY) / 2;
        ctx.quadraticCurveTo(cpX, cpY, tipX, tipY);
        ctx.strokeStyle = rgba(stemColor, 0.3 * sprout.growth * entrance);
        ctx.lineWidth = minDim * (0.002 + sprout.growth * 0.001);
        ctx.lineCap = 'round';
        ctx.stroke();

        // Leaf bud at tip
        if (sprout.growth > 0.5) {
          const budSize = minDim * (0.004 + sprout.growth * 0.004);
          const budAlpha = (sprout.growth - 0.5) * 0.4 * entrance;
          const budColor = lerpColor(SPROUT_GREEN, s.accentRgb, 0.2);

          // Tiny glow
          const budGlowR = budSize * 3;
          const budGrad = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, budGlowR);
          budGrad.addColorStop(0, rgba(budColor, budAlpha * 0.15));
          budGrad.addColorStop(1, rgba(budColor, 0));
          ctx.fillStyle = budGrad;
          ctx.fillRect(tipX - budGlowR, tipY - budGlowR, budGlowR * 2, budGlowR * 2);

          // Bud dot
          ctx.beginPath();
          ctx.arc(tipX, tipY, budSize * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = rgba(budColor, budAlpha);
          ctx.fill();
        }
      }

      // ── Falling particles (in-flight) ─────────────────
      for (const particle of s.particles) {
        if (particle.settled) continue;
        const pColor = compostColor(particle.chromaProgress, s.primaryRgb, s.accentRgb);
        const pAlpha = particle.brightness * 0.35 * entrance;

        // Glow
        if (particle.size > minDim * 0.004) {
          const glowR = particle.size * 2;
          const glowGrad = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, glowR);
          glowGrad.addColorStop(0, rgba(pColor, pAlpha * 0.1));
          glowGrad.addColorStop(1, rgba(pColor, 0));
          ctx.fillStyle = glowGrad;
          ctx.fillRect(particle.x - glowR, particle.y - glowR, glowR * 2, glowR * 2);
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = rgba(pColor, pAlpha);
        ctx.fill();
      }

      // ── Leaves (uncomposted + decomposing) ────────────
      for (const leaf of s.leaves) {
        if (leaf.alpha <= 0) continue;

        const leafSize = minDim * LEAF_SIZE_FRAC * leaf.size;
        let lx = leaf.cx * w;
        let ly = leaf.cy * h;

        // Gentle float
        if (!p.reducedMotion && !leaf.composted) {
          lx += Math.sin(s.frameCount * leaf.floatSpeed + leaf.floatPhase) * minDim * 0.008;
          ly += Math.cos(s.frameCount * leaf.floatSpeed * 0.7 + leaf.floatPhase) * minDim * 0.004;
        }

        // Decomposition: leaf shrinks and fragments
        const decompScale = leaf.composted ? Math.max(0, 1 - leaf.decompProgress) : 1;
        const currentSize = leafSize * decompScale;
        if (currentSize < 0.5) continue;

        const leafAlpha = leaf.alpha * (leaf.composted ? 0.2 + (1 - leaf.decompProgress) * 0.3 : 0.35) * entrance;

        // Leaf color: dead grey, slightly warmer during decomposition
        const leafColor = leaf.composted
          ? lerpColor(
            lerpColor(DEAD_LEAF, s.primaryRgb, 0.06),
            lerpColor([140, 100, 50], s.accentRgb, 0.1),
            leaf.decompProgress * 0.3,
          )
          : lerpColor(DEAD_LEAF, s.primaryRgb, 0.06);

        // Draw leaf shape (organic Bezier)
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(leaf.rotation + (leaf.composted ? leaf.decompProgress * 0.5 : 0));

        const sz = currentSize;

        // Leaf shape: pointed oval with midrib
        ctx.beginPath();
        ctx.moveTo(0, -sz);
        ctx.bezierCurveTo(
          sz * (0.4 + leaf.shapeSeed * 0.2), -sz * 0.6,
          sz * (0.5 + leaf.shapeSeed * 0.15), -sz * 0.1,
          sz * 0.05, sz * 0.7,
        );
        ctx.bezierCurveTo(
          -sz * (0.5 + leaf.shapeSeed * 0.15), -sz * 0.1,
          -sz * (0.4 + leaf.shapeSeed * 0.2), -sz * 0.6,
          0, -sz,
        );
        ctx.closePath();

        ctx.fillStyle = rgba(leafColor, leafAlpha);
        ctx.fill();

        // Edge
        const edgeColor = lerpColor(DEAD_LEAF_EDGE, s.primaryRgb, 0.05);
        ctx.strokeStyle = rgba(edgeColor, leafAlpha * 0.5);
        ctx.lineWidth = minDim * 0.001;
        ctx.stroke();

        // Midrib vein
        ctx.beginPath();
        ctx.moveTo(0, -sz * 0.9);
        ctx.lineTo(0, sz * 0.5);
        ctx.strokeStyle = rgba(edgeColor, leafAlpha * 0.3);
        ctx.lineWidth = minDim * 0.0006;
        ctx.stroke();

        // Decomposition cracks
        if (leaf.composted && leaf.decompProgress > 0.1) {
          const crackAlpha = leaf.decompProgress * 0.2 * entrance;
          ctx.beginPath();
          ctx.moveTo(-sz * 0.2, -sz * 0.3);
          ctx.lineTo(sz * 0.15, sz * 0.1);
          ctx.moveTo(sz * 0.1, -sz * 0.5);
          ctx.lineTo(-sz * 0.1, -sz * 0.1);
          ctx.strokeStyle = rgba(lerpColor([80, 60, 40], s.primaryRgb, 0.1), crackAlpha);
          ctx.lineWidth = minDim * 0.0006;
          ctx.stroke();
        }

        ctx.restore();
      }

      // ── Nutrient glow (rising energy from soil) ───────
      if (s.soilLevel > 0.2) {
        const nutrientAlpha = (s.soilLevel - 0.2) * 0.04 * entrance;
        const pulse = p.reducedMotion ? 1 : (0.85 + 0.15 * Math.sin(s.frameCount * 0.015));
        const nColor = lerpColor(NUTRIENT_GLOW, s.accentRgb, 0.2);
        const nGrad = ctx.createLinearGradient(0, soilY, 0, soilY - h * 0.15);
        nGrad.addColorStop(0, rgba(nColor, nutrientAlpha * pulse));
        nGrad.addColorStop(0.5, rgba(nColor, nutrientAlpha * 0.3 * pulse));
        nGrad.addColorStop(1, rgba(nColor, 0));
        ctx.fillStyle = nGrad;
        ctx.fillRect(0, soilY - h * 0.15, w, h * 0.15);
      }

      // ── Resolution glow ───────────────────────────────
      if (s.resolveGlow > 0) {
        const rPulse = p.reducedMotion ? 1 : (0.9 + 0.1 * Math.sin(s.frameCount * 0.02));
        const rColor = lerpColor(NUTRIENT_GLOW, s.accentRgb, 0.2);
        const rR = minDim * 0.35;
        const rGrad = ctx.createRadialGradient(w / 2, soilY, 0, w / 2, soilY, rR);
        rGrad.addColorStop(0, rgba(rColor, s.resolveGlow * 0.08 * rPulse * entrance));
        rGrad.addColorStop(0.5, rgba(s.accentRgb, s.resolveGlow * 0.02 * entrance));
        rGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = rGrad;
        ctx.fillRect(w / 2 - rR, soilY - rR, rR * 2, rR * 2);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
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
          cursor: 'pointer',
        }}
      />
    </div>
  );
}