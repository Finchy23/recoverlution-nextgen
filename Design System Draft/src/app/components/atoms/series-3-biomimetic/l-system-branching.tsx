/**
 * ATOM 021: THE L-SYSTEM BRANCHING ENGINE
 * =========================================
 * Series 3 — Biomimetic Algorithms · Position 1
 *
 * Healing is not linear; it is fractal. A single, tiny micro-yes
 * can expand into a massive canopy of new behavioral pathways.
 * Each breath drives one generation of L-system growth. The tree
 * pushes through space with organic hesitation and burst — the
 * slow, deep creak of living tissue pushing through soil.
 *
 * Below ground: a root network mirrors the canopy, seeking water.
 * Above: branches taper and sway, with tiny leaf particles
 * budding at the tips of mature segments.
 *
 * PHYSICS:
 *   - Lindenmayer system string expansion (axiom → 7 generations)
 *   - Each segment: start, end, angle, width, generation, growthProgress
 *   - Organic easing: slow ignition → acceleration → slight tip deceleration
 *   - Breath amplitude DRIVES growth rate (primary coupling)
 *   - Tap triggers an immediate growth burst (one full generation)
 *   - Branch taper proportional to generation depth
 *   - Roots mirror canopy structure inverted below soil line
 *   - Leaf particles bud at tips of mature segments
 *   - Gentle sway on all segments (wind)
 *
 * HAPTIC JOURNEY:
 *   Tap           → immediate creak (new generation)
 *   breath_peak   → deep growth pulse
 *   step_advance  → each generation completing
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: No sway, instant segment growth, static leaves
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS (viewport-relative via minDim * factor)
// =====================================================================

const MAX_GENERATIONS = 7;
const TRUNK_LENGTH_FRAC = 0.08;
const LENGTH_DECAY = 0.72;
const TRUNK_WIDTH_FRAC = 0.012;
const WIDTH_DECAY = 0.65;
const BRANCH_ANGLE = Math.PI / 7;
const ANGLE_JITTER = Math.PI / 18;
const GROWTH_RATE = 0.012;
const BREATH_GROWTH_MULT = 0.04;
const ROOT_DEPTH_MULT = 0.6;
const SWAY_MAG_FRAC = 0.007;
const SWAY_FREQ = 0.006;
const LEAF_THRESHOLD = 0.85;
const MAX_LEAVES = 80;
const SOIL_LINE_FRAC = 0.35;

// =====================================================================
// L-SYSTEM SEGMENT
// =====================================================================

interface Segment {
  startX: number; startY: number;
  endX: number; endY: number;
  gen: number; index: number;
  angle: number; length: number; width: number;
  growth: number;
  isRoot: boolean;
  swayPhase: number;
  parentIdx: number;
}

interface LeafBud {
  x: number; y: number;
  sizeFrac: number; // fraction of minDim
  phase: number; alpha: number; gen: number;
}

function generateSegments(
  generations: number, viewW: number, viewH: number, soilY: number, minDim: number,
): { canopy: Segment[]; roots: Segment[] } {
  const canopy: Segment[] = [];
  const roots: Segment[] = [];
  const trunkLen = viewH * TRUNK_LENGTH_FRAC;
  const trunkWidth = minDim * TRUNK_WIDTH_FRAC;

  function branch(
    x: number, y: number, angle: number, length: number, width: number,
    gen: number, parentIdx: number, isRoot: boolean, segments: Segment[],
  ) {
    if (gen > generations || length < 1) return;
    const endX = x + Math.sin(angle) * length;
    const endY = y - Math.cos(angle) * length * (isRoot ? -1 : 1);
    const idx = segments.length;
    segments.push({
      startX: x, startY: y, endX, endY,
      gen, index: idx, angle, length, width, growth: 0,
      isRoot, swayPhase: Math.random() * Math.PI * 2, parentIdx,
    });
    const nextLen = length * LENGTH_DECAY;
    const nextWidth = width * WIDTH_DECAY;
    const j1 = (Math.random() - 0.5) * ANGLE_JITTER;
    const j2 = (Math.random() - 0.5) * ANGLE_JITTER;
    branch(endX, endY, angle - BRANCH_ANGLE + j1, nextLen, nextWidth, gen + 1, idx, isRoot, segments);
    branch(endX, endY, angle + BRANCH_ANGLE + j2, nextLen, nextWidth, gen + 1, idx, isRoot, segments);
    if (gen < 3 && Math.random() > 0.5) {
      const j3 = (Math.random() - 0.5) * ANGLE_JITTER * 0.5;
      branch(endX, endY, angle + j3, nextLen * 0.85, nextWidth * 0.8, gen + 1, idx, isRoot, segments);
    }
  }

  branch(viewW / 2, soilY, 0, trunkLen, trunkWidth, 0, -1, false, canopy);
  branch(viewW / 2, soilY, 0, trunkLen * ROOT_DEPTH_MULT, trunkWidth * 0.7, 0, -1, true, roots);
  return { canopy, roots };
}

// =====================================================================
// COLOR
// =====================================================================

const BARK_DEEP: RGB = [60, 40, 30];
const BARK_LIGHT: RGB = [100, 75, 55];
const SAP_AMBER: RGB = [180, 140, 60];
const LEAF_GREEN: RGB = [100, 180, 70];
const SOIL_DARK: RGB = [30, 22, 16];
const SOIL_WARM: RGB = [55, 40, 28];
const ROOT_COLOR: RGB = [80, 60, 45];
const SKY_DEEP: RGB = [8, 10, 20];

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function LSystemBranchingAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; },
    [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor]);

  // ── Single effect: native events + rAF loop ────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);
    const soilY = h * (1 - SOIL_LINE_FRAC);

    // ── Mutable state ─────────────────────────────────
    const s = {
      canopy: [] as Segment[],
      roots: [] as Segment[],
      leaves: [] as LeafBud[],
      currentGen: 0,
      generationGrowing: false,
      lastBreathPeak: false,
      entranceProgress: 0,
      frameCount: 0,
      primaryRgb: parseColor(color),
      accentRgb: parseColor(accentColor),
    };

    // Generate tree
    const tree = generateSegments(MAX_GENERATIONS, w, h, soilY, minDim);
    s.canopy = tree.canopy;
    s.roots = tree.roots;

    // ── Native pointer handler ────────────────────────
    const onDown = (e: PointerEvent) => {
      if (s.currentGen < MAX_GENERATIONS) {
        s.currentGen++;
        s.generationGrowing = true;
        callbacksRef.current.onHaptic('tap');
        callbacksRef.current.onHaptic('step_advance');
      }
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    // ── Animation loop ────────────────────────────────
    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const p = propsRef.current;
      const cb = callbacksRef.current;
      s.primaryRgb = parseColor(p.color);
      s.accentRgb = parseColor(p.accentColor);

      const cw = Math.round(w * dpr);
      const ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw; canvas.height = ch;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);
      s.frameCount++;

      // ── Entrance ──────────────────────────────────
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const entrance = easeOutExpo(s.entranceProgress);

      // ── Breath-driven growth ──────────────────────
      const breathHigh = p.breathAmplitude > 0.7;
      if (breathHigh && !s.lastBreathPeak) {
        cb.onHaptic('breath_peak');
        if (s.currentGen < MAX_GENERATIONS) {
          s.currentGen++;
          s.generationGrowing = true;
          cb.onHaptic('step_advance');
        }
      }
      s.lastBreathPeak = breathHigh;

      const growthSpeed = GROWTH_RATE + p.breathAmplitude * BREATH_GROWTH_MULT;

      // ── Segment growth ────────────────────────────
      for (const segments of [s.canopy, s.roots]) {
        for (const seg of segments) {
          if (seg.gen > s.currentGen) continue;
          if (seg.growth < 1) {
            const genDelay = seg.gen * 0.15;
            const available = Math.max(0, entrance - genDelay);
            if (available > 0) {
              const rate = p.reducedMotion ? 0.08 : growthSpeed;
              seg.growth = Math.min(1, seg.growth + rate * available);
            }
          }
        }
      }

      // ── Leaf generation ───────────────────────────
      if (s.leaves.length < MAX_LEAVES) {
        for (const seg of s.canopy) {
          if (seg.gen < 3 || seg.growth < LEAF_THRESHOLD) continue;
          if (Math.random() > 0.005) continue;
          if (s.leaves.length >= MAX_LEAVES) break;
          const t = seg.growth;
          const lx = seg.startX + (seg.endX - seg.startX) * t;
          const ly = seg.startY + (seg.endY - seg.startY) * t;
          s.leaves.push({
            x: lx + (Math.random() - 0.5) * minDim * 0.015,
            y: ly + (Math.random() - 0.5) * minDim * 0.015,
            sizeFrac: 0.003 + Math.random() * 0.007,
            phase: Math.random() * Math.PI * 2,
            alpha: 0, gen: seg.gen,
          });
        }
      }

      // ── State reporting ───────────────────────────
      cb.onStateChange?.(s.currentGen / MAX_GENERATIONS);

      // ══════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════

      // ── Sky background (radial, fading to transparent) ──
      const skyColor = lerpColor(SKY_DEEP, s.primaryRgb, 0.03);
      const skyGrad = ctx.createRadialGradient(w / 2, soilY * 0.5, 0, w / 2, soilY * 0.5, minDim * 0.5);
      skyGrad.addColorStop(0, rgba(skyColor, entrance * 0.03));
      skyGrad.addColorStop(0.7, rgba(lerpColor(skyColor, SOIL_DARK, 0.3), entrance * 0.02));
      skyGrad.addColorStop(1, rgba(skyColor, 0));
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, soilY);

      // ── Soil background (radial, fading to transparent) ──
      const soilGrad = ctx.createRadialGradient(w / 2, soilY + minDim * 0.1, 0, w / 2, soilY + minDim * 0.1, minDim * 0.4);
      soilGrad.addColorStop(0, rgba(lerpColor(SOIL_WARM, s.primaryRgb, 0.05), entrance * 0.05));
      soilGrad.addColorStop(0.6, rgba(lerpColor(SOIL_DARK, s.primaryRgb, 0.03), entrance * 0.03));
      soilGrad.addColorStop(1, rgba(SOIL_DARK, 0));
      ctx.fillStyle = soilGrad;
      ctx.fillRect(0, soilY, w, h - soilY);

      // Soil surface line
      const surfThick = minDim * 0.02;
      const surfGrad = ctx.createLinearGradient(0, soilY - surfThick * 0.3, 0, soilY + surfThick * 0.7);
      surfGrad.addColorStop(0, rgba(lerpColor(SOIL_WARM, s.primaryRgb, 0.1), 0));
      surfGrad.addColorStop(0.5, rgba(lerpColor(SOIL_WARM, s.primaryRgb, 0.1), 0.06 * entrance));
      surfGrad.addColorStop(1, rgba(SOIL_DARK, 0));
      ctx.fillStyle = surfGrad;
      ctx.fillRect(0, soilY - surfThick * 0.3, w, surfThick);

      // ── Draw roots ────────────────────────────────
      for (const seg of s.roots) {
        if (seg.gen > s.currentGen || seg.growth < 0.01) continue;
        drawSegment(ctx, seg, s, p, entrance, true, minDim);
      }

      // ── Draw canopy ───────────────────────────────
      for (const seg of s.canopy) {
        if (seg.gen > s.currentGen || seg.growth < 0.01) continue;
        drawSegment(ctx, seg, s, p, entrance, false, minDim);
      }

      // ── Draw leaves ───────────────────────────────
      for (const leaf of s.leaves) {
        leaf.alpha = Math.min(0.5, leaf.alpha + 0.005);
        const leafColor = lerpColor(
          lerpColor(LEAF_GREEN, s.accentRgb, 0.15),
          lerpColor(SAP_AMBER, s.primaryRgb, 0.1),
          leaf.gen / MAX_GENERATIONS * 0.3,
        );
        let lx = leaf.x;
        let ly = leaf.y;
        if (!p.reducedMotion) {
          lx += Math.sin(s.frameCount * 0.008 + leaf.phase) * minDim * 0.002;
          ly += Math.cos(s.frameCount * 0.006 + leaf.phase * 1.3) * minDim * 0.001;
        }
        const leafSize = leaf.sizeFrac * minDim;
        const glowR = leafSize * 3;
        const glowGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, glowR);
        glowGrad.addColorStop(0, rgba(leafColor, leaf.alpha * 0.15 * entrance));
        glowGrad.addColorStop(1, rgba(leafColor, 0));
        ctx.fillStyle = glowGrad;
        ctx.fillRect(lx - glowR, ly - glowR, glowR * 2, glowR * 2);
        ctx.beginPath();
        ctx.arc(lx, ly, leafSize * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = rgba(leafColor, leaf.alpha * entrance);
        ctx.fill();
      }

      // ── Ambient sap glow along trunk ──────────────
      if (s.currentGen > 0) {
        const sapAlpha = Math.min(0.04, s.currentGen * 0.006) * entrance;
        const sapColor = lerpColor(SAP_AMBER, s.accentRgb, 0.2);
        const sapW = minDim * 0.07;
        const sapGrad = ctx.createLinearGradient(w / 2, soilY, w / 2, soilY - h * 0.3);
        sapGrad.addColorStop(0, rgba(sapColor, sapAlpha));
        sapGrad.addColorStop(0.4, rgba(sapColor, sapAlpha * 0.4));
        sapGrad.addColorStop(1, rgba(sapColor, 0));
        ctx.fillStyle = sapGrad;
        ctx.fillRect(w / 2 - sapW / 2, soilY - h * 0.3, sapW, h * 0.3);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
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
          cursor: 'pointer',
        }}
      />
    </div>
  );
}

// =====================================================================
// DRAW SEGMENT
// =====================================================================

function drawSegment(
  ctx: CanvasRenderingContext2D,
  seg: Segment,
  state: { frameCount: number; primaryRgb: RGB; accentRgb: RGB },
  props: { reducedMotion: boolean },
  entrance: number,
  isRoot: boolean,
  minDim: number,
) {
  const t = seg.growth;
  if (t < 0.01) return;

  let swayX = 0;
  let swayY = 0;
  if (!props.reducedMotion) {
    const swayAmount = SWAY_MAG_FRAC * minDim * (seg.gen + 1) * 0.3;
    swayX = Math.sin(state.frameCount * SWAY_FREQ + seg.swayPhase) * swayAmount;
    swayY = Math.cos(state.frameCount * SWAY_FREQ * 0.7 + seg.swayPhase) * swayAmount * 0.3;
  }

  const currentEndX = seg.startX + (seg.endX - seg.startX) * t + swayX;
  const currentEndY = seg.startY + (seg.endY - seg.startY) * t + swayY;
  const sx = seg.startX + (seg.parentIdx >= 0 ? swayX * 0.5 : 0);
  const sy = seg.startY + (seg.parentIdx >= 0 ? swayY * 0.3 : 0);

  const genT = seg.gen / MAX_GENERATIONS;
  const baseColor = isRoot
    ? lerpColor(ROOT_COLOR, state.primaryRgb, 0.1)
    : lerpColor(
      lerpColor(BARK_DEEP, state.primaryRgb, 0.06),
      lerpColor(BARK_LIGHT, state.accentRgb, 0.08),
      genT * 0.5,
    );

  const alpha = (isRoot ? 0.25 : 0.4) * (1 - genT * 0.3) * t * entrance;
  const lineWidth = Math.max(minDim * 0.0007, seg.width * (1 - genT * 0.2));

  // Sap glow for young branches
  if (!isRoot && seg.gen >= 3 && t > 0.5) {
    const glowAlpha = (t - 0.5) * 0.03 * entrance * (1 - genT * 0.5);
    const sapColor = lerpColor(SAP_AMBER, state.accentRgb, 0.2);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(currentEndX, currentEndY);
    ctx.strokeStyle = rgba(sapColor, glowAlpha);
    ctx.lineWidth = lineWidth * 4;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(currentEndX, currentEndY);
  ctx.strokeStyle = rgba(baseColor, alpha);
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.stroke();
}
