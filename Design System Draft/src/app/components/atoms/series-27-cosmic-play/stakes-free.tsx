/**
 * ATOM 266: THE STAKES-FREE ENGINE
 * ====================================
 * Series 27 — Cosmic Play · Position 6
 *
 * Turn off the scoreboard. The spikes are just xylophone keys.
 * The maze is an instrument to play, not a threat to survive.
 * Each transformed node becomes a holographic music bubble.
 *
 * SIGNATURE TECHNIQUE: Holographic Diffraction + Generative Art
 *   - Spike nodes have angular menacing geometry (accent color)
 *   - Tap → spike morphs into holographic bubble with rainbow surface
 *   - Transformed bubbles emit prismatic rings on each bob cycle
 *   - Connected bubbles create holographic web of diffraction lines
 *   - All transformed: generative constellation pattern emerges
 *
 * PHYSICS:
 *   - 6×4 grid of "spike" nodes that look threatening
 *   - Tap each spike → morphs into glowing holographic bubble
 *   - Pre-transform: sharp angular diamond shape (accent, dark)
 *   - Post-transform: round bubble with holographic rainbow surface
 *   - Transformed bubbles gently bob + emit prismatic micro-rings
 *   - Neighbors auto-transform via ripple after delay
 *   - Connected bubbles form holographic lattice web
 *   - 8 rendering layers: web lattice, node shadows, spike shapes,
 *     bubble glow, bubble body+specular+diffraction, prismatic rings,
 *     constellation, progress
 *   - Breath couples to: bob amplitude, bubble shimmer, web opacity
 *
 * INTERACTION:
 *   Tap spike → transform to bubble (tap, step_advance, completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: All nodes as gentle holographic bubbles with lattice
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, motionScale,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Grid columns */
const COLS = 6;
/** Grid rows */
const ROWS = 4;
/** Total node count */
const NODE_COUNT = COLS * ROWS;
/** Node visual radius (fraction of minDim) */
const NODE_R = 0.016;
/** Grid width (fraction of viewport) */
const GRID_W = 0.68;
/** Grid height (fraction of viewport) */
const GRID_H = 0.42;
/** Bob animation amplitude (fraction of viewport) */
const BOB_AMP = 0.006;
/** Bob speed factor */
const BOB_SPEED = 0.03;
/** Breath bob amplitude modulation */
const BREATH_BOB = 0.35;
/** Breath bubble shimmer modulation */
const BREATH_SHIMMER = 0.06;
/** Breath web opacity modulation */
const BREATH_WEB = 0.04;
/** Transform animation speed per frame */
const TRANSFORM_SPEED = 0.025;
/** Ripple auto-transform probability per frame for neighbors */
const RIPPLE_CHANCE = 0.003;
/** Number of glow layers per bubble */
const GLOW_LAYERS = 4;
/** Holographic surface segment count */
const HOLO_SEGMENTS = 8;
/** Micro-ring max count per bubble */
const MICRO_RING_MAX = 2;
/** Micro-ring expand rate */
const MICRO_RING_SPEED = 0.0015;
/** Micro-ring max radius before decay */
const MICRO_RING_MAX_R = 0.025;
/** Specular offset */
const SPECULAR_OFFSET = 0.28;
/** Specular size */
const SPECULAR_SIZE = 0.22;
/** Web line max opacity */
const WEB_OPACITY = 0.04;
/** Constellation particle count (post-completion) */
const CONSTELLATION_STARS = 20;

// ═════════════════════════════════════════════════════════════════════
// STATE TYPES
// ═════════════════════════════════════════════════════════════════════

/** Grid node with transform state */
interface SpikeNode {
  gridX: number;
  gridY: number;
  x: number;
  y: number;
  /** 0 = spike, 1 = fully transformed bubble */
  transformed: number;
  /** Phase offset for bob animation */
  phase: number;
  /** Whether user has tapped this node */
  tapped: boolean;
}

/** Prismatic micro-ring emitted from bobbing bubble */
interface MicroRing {
  x: number;
  y: number;
  r: number;
  life: number;
  hue: number;
}

// ═════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════

/**
 * Hue (0–1) → RGB for holographic rainbow.
 */
function hueToRgb(hue: number): RGB {
  const h = ((hue % 1) + 1) % 1;
  const c = 0.6;
  const x = c * (1 - Math.abs((h * 6) % 2 - 1));
  const m = 0.32;
  let r = 0, g = 0, b = 0;
  if (h < 1/6)      { r = c; g = x; }
  else if (h < 2/6) { r = x; g = c; }
  else if (h < 3/6) { g = c; b = x; }
  else if (h < 4/6) { g = x; b = c; }
  else if (h < 5/6) { r = x; b = c; }
  else               { r = c; b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)] as unknown as RGB;
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function StakesFreeAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    nodes: Array.from({ length: NODE_COUNT }, (_, i): SpikeNode => ({
      gridX: i % COLS,
      gridY: Math.floor(i / COLS),
      x: (0.5 - GRID_W / 2) + (i % COLS) / (COLS - 1) * GRID_W,
      y: (0.5 - GRID_H / 2) + Math.floor(i / COLS) / (ROWS - 1) * GRID_H,
      transformed: 0,
      phase: Math.random() * Math.PI * 2,
      tapped: false,
    })),
    microRings: [] as MicroRing[],
    completed: false,
    stepNotified: false,
    completionGlow: 0,
  });

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const breath = p.breathAmplitude;
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;
      const time = s.frameCount * 0.012;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.reducedMotion || p.phase === 'resolve') {
        s.nodes.forEach(n => { n.tapped = true; n.transformed = 1; });
        s.completed = true;
      }

      // ═══════════════════════════════════════════════════════════════
      // NODE TRANSFORM + RIPPLE PHYSICS
      // ═══════════════════════════════════════════════════════════════
      let transformedCount = 0;
      for (const n of s.nodes) {
        if (n.tapped) {
          n.transformed = Math.min(1, n.transformed + TRANSFORM_SPEED * ms);

          // Ripple to neighbors
          if (n.transformed > 0.7) {
            for (const other of s.nodes) {
              if (other.tapped) continue;
              const dist = Math.abs(other.gridX - n.gridX) + Math.abs(other.gridY - n.gridY);
              if (dist === 1 && Math.random() < RIPPLE_CHANCE * ms) {
                other.tapped = true;
              }
            }
          }
        }
        if (n.transformed > 0.9) transformedCount++;
      }

      if (transformedCount >= NODE_COUNT * 0.5 && !s.stepNotified) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }
      if (transformedCount >= NODE_COUNT && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      if (s.completed) s.completionGlow = Math.min(1, s.completionGlow + 0.005 * ms);
      cb.onStateChange?.(s.completed ? 0.5 + s.completionGlow * 0.5 : (transformedCount / NODE_COUNT) * 0.5);

      // Micro-ring physics
      for (let i = s.microRings.length - 1; i >= 0; i--) {
        const mr = s.microRings[i];
        mr.r += MICRO_RING_SPEED * ms;
        mr.life -= 0.015 * ms;
        if (mr.life <= 0 || mr.r > MICRO_RING_MAX_R) s.microRings.splice(i, 1);
      }

      // Spawn micro-rings from bobbing bubbles
      if (s.frameCount % 30 === 0) {
        for (const n of s.nodes) {
          if (n.transformed > 0.8 && s.microRings.length < NODE_COUNT * MICRO_RING_MAX) {
            s.microRings.push({
              x: n.x, y: n.y,
              r: 0, life: 1,
              hue: (n.gridX * 0.1 + n.gridY * 0.15 + time * 0.002) % 1,
            });
          }
        }
      }

      const bobMod = 1 + breath * BREATH_BOB;
      const breathShimmer = breath * BREATH_SHIMMER;
      const breathWeb = breath * BREATH_WEB;

      // ═══════════════════════════════════════════════════════════════
      // LAYER 1 — Holographic web lattice between transformed nodes
      // ═══════════════════════════════════════════════════════════════
      for (const n of s.nodes) {
        if (n.transformed < 0.5) continue;
        const nBob = Math.sin(time * BOB_SPEED / 0.012 + n.phase) * BOB_AMP * bobMod * n.transformed;
        const nx = n.x * w;
        const ny = (n.y + nBob) * h;

        for (const other of s.nodes) {
          if (other === n || other.transformed < 0.5) continue;
          const dist = Math.abs(other.gridX - n.gridX) + Math.abs(other.gridY - n.gridY);
          if (dist !== 1) continue;

          const oBob = Math.sin(time * BOB_SPEED / 0.012 + other.phase) * BOB_AMP * bobMod * other.transformed;
          const ox = other.x * w;
          const oy = (other.y + oBob) * h;

          const webHue = ((n.gridX + other.gridX) * 0.05 + time * 0.001) % 1;
          const webColor = hueToRgb(webHue);
          const webAlpha = ALPHA.content.max * (WEB_OPACITY + breathWeb) *
            Math.min(n.transformed, other.transformed) * entrance;

          ctx.beginPath();
          ctx.moveTo(nx, ny);
          ctx.lineTo(ox, oy);
          ctx.strokeStyle = rgba(webColor, webAlpha);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 2 — Node shadows
      // ═══════════════════════════════════════════════════════════════
      for (const n of s.nodes) {
        const nx = n.x * w;
        const nR = px(NODE_R, minDim);
        const shadowY = (n.y + 0.008) * h;
        const shadowR = nR * 1.8;
        const sGrad = ctx.createRadialGradient(nx, shadowY, 0, nx, shadowY, shadowR);
        sGrad.addColorStop(0, rgba([0, 0, 0] as unknown as RGB, 0.04 * entrance));
        sGrad.addColorStop(0.5, rgba([0, 0, 0] as unknown as RGB, 0.01 * entrance));
        sGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.ellipse(nx, shadowY, shadowR, shadowR * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 3 — Spike shapes (pre-transform)
      // ═══════════════════════════════════════════════════════════════
      for (const n of s.nodes) {
        if (n.transformed >= 0.5) continue;
        const nx = n.x * w;
        const ny = n.y * h;
        const nR = px(NODE_R, minDim);
        const spikeAlpha = (1 - n.transformed * 2);
        const nodeColor = lerpColor(s.accentRgb, s.primaryRgb, n.transformed * 2);

        // Sharp diamond spike
        ctx.save();
        ctx.translate(nx, ny);
        const spikeCount = 5;
        ctx.beginPath();
        for (let si = 0; si <= spikeCount * 2; si++) {
          const sa = (si / (spikeCount * 2)) * Math.PI * 2 - Math.PI / 4;
          const sr = nR * (si % 2 === 0 ? 1.3 : 0.45);
          if (si === 0) ctx.moveTo(Math.cos(sa) * sr, Math.sin(sa) * sr);
          else ctx.lineTo(Math.cos(sa) * sr, Math.sin(sa) * sr);
        }
        ctx.closePath();
        ctx.fillStyle = rgba(nodeColor, ALPHA.content.max * 0.18 * spikeAlpha * entrance);
        ctx.fill();
        ctx.strokeStyle = rgba(nodeColor, ALPHA.content.max * 0.08 * spikeAlpha * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
        ctx.restore();
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 4 — Bubble glow fields
      // ═══════════════════════════════════════════════════════════════
      for (const n of s.nodes) {
        if (n.transformed < 0.3) continue;
        const bob = Math.sin(time * BOB_SPEED / 0.012 + n.phase) * BOB_AMP * bobMod * n.transformed;
        const nx = n.x * w;
        const ny = (n.y + bob) * h;
        const nR = px(NODE_R, minDim);
        const t = n.transformed;

        const holoHue = ((n.gridX * 0.1 + n.gridY * 0.15) + time * 0.002 + breathShimmer * 2) % 1;
        const glowColor = lerpColor(s.primaryRgb, hueToRgb(holoHue), 0.3 * t);

        for (let gi = GLOW_LAYERS - 1; gi >= 0; gi--) {
          const gR = nR * (2 + gi * 1.4) * t;
          const gA = ALPHA.glow.max * 0.06 * t * entrance / (gi + 1);
          const gg = ctx.createRadialGradient(nx, ny, 0, nx, ny, gR);
          gg.addColorStop(0, rgba(glowColor, gA));
          gg.addColorStop(0.35, rgba(glowColor, gA * 0.35));
          gg.addColorStop(0.7, rgba(s.primaryRgb, gA * 0.08));
          gg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = gg;
          ctx.fillRect(nx - gR, ny - gR, gR * 2, gR * 2);
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 5 — Bubble bodies + specular + holographic segments
      // ═══════════════════════════════════════════════════════════════
      for (const n of s.nodes) {
        if (n.transformed < 0.1) continue;
        const bob = Math.sin(time * BOB_SPEED / 0.012 + n.phase) * BOB_AMP * bobMod * n.transformed;
        const nx = n.x * w;
        const ny = (n.y + bob) * h;
        const nR = px(NODE_R, minDim);
        const t = n.transformed;
        const nodeColor = lerpColor(s.accentRgb, s.primaryRgb, t);

        // 5-stop body gradient
        const bg = ctx.createRadialGradient(nx - nR * 0.18, ny - nR * 0.18, nR * 0.05, nx, ny, nR);
        bg.addColorStop(0, rgba(lerpColor(nodeColor, [255, 255, 255] as unknown as RGB, 0.35),
          ALPHA.content.max * 0.35 * t * entrance));
        bg.addColorStop(0.25, rgba(nodeColor, ALPHA.content.max * 0.3 * t * entrance));
        bg.addColorStop(0.55, rgba(nodeColor, ALPHA.content.max * 0.18 * t * entrance));
        bg.addColorStop(0.82, rgba(s.primaryRgb, ALPHA.content.max * 0.08 * t * entrance));
        bg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.beginPath();
        ctx.arc(nx, ny, nR, 0, Math.PI * 2);
        ctx.fillStyle = bg;
        ctx.fill();

        // Holographic surface segments
        if (t > 0.5) {
          const fringeIntensity = (t - 0.5) * 2;
          for (let seg = 0; seg < HOLO_SEGMENTS; seg++) {
            const segAngle = (seg / HOLO_SEGMENTS) * Math.PI * 2;
            const segHue = (seg / HOLO_SEGMENTS + n.gridX * 0.1 + n.gridY * 0.15 + time * 0.003) % 1;
            const segColor = hueToRgb(segHue);
            const segAlpha = ALPHA.content.max * 0.03 * fringeIntensity * entrance;

            ctx.beginPath();
            ctx.arc(nx, ny, nR * 0.88, segAngle, segAngle + Math.PI * 2 / HOLO_SEGMENTS);
            ctx.arc(nx, ny, nR * 0.55, segAngle + Math.PI * 2 / HOLO_SEGMENTS, segAngle, true);
            ctx.closePath();
            ctx.fillStyle = rgba(segColor, segAlpha);
            ctx.fill();
          }

          // Fresnel edge rim
          const rimHue = ((n.gridX + n.gridY) * 0.1 + time * 0.002) % 1;
          ctx.beginPath();
          ctx.arc(nx, ny, nR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(hueToRgb(rimHue), ALPHA.content.max * 0.06 * fringeIntensity * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }

        // Specular highlight
        if (nR > 1.5 && t > 0.4) {
          const sx = nx - nR * SPECULAR_OFFSET;
          const sy = ny - nR * SPECULAR_OFFSET;
          const sr = nR * SPECULAR_SIZE;
          const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
          sg.addColorStop(0, `rgba(255,255,255,${0.35 * t * entrance})`);
          sg.addColorStop(0.5, `rgba(255,255,255,${0.08 * t * entrance})`);
          sg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = sg;
          ctx.beginPath();
          ctx.arc(sx, sy, sr, 0, Math.PI * 2);
          ctx.fill();
        }

        // Secondary reflection
        if (nR > 2 && t > 0.6) {
          ctx.beginPath();
          ctx.ellipse(nx + nR * 0.12, ny + nR * 0.16, nR * 0.08, nR * 0.05, 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${0.04 * t * entrance})`;
          ctx.fill();
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 6 — Prismatic micro-rings
      // ═══════════════════════════════════════════════════════════════
      for (const mr of s.microRings) {
        const mrR = px(mr.r, minDim);
        if (mrR < 0.5) continue;
        const mrColor = hueToRgb(mr.hue);
        const bob = Math.sin(time * BOB_SPEED / 0.012) * BOB_AMP * bobMod;
        ctx.beginPath();
        ctx.arc(mr.x * w, (mr.y + bob) * h, mrR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(mrColor, ALPHA.content.max * 0.05 * mr.life * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 7 — Constellation stars (post-completion)
      // ═══════════════════════════════════════════════════════════════
      if (s.completed && s.completionGlow > 0.2) {
        const starIntensity = (s.completionGlow - 0.2) / 0.8;
        for (let i = 0; i < CONSTELLATION_STARS; i++) {
          const starAngle = (i / CONSTELLATION_STARS) * Math.PI * 2 + time * 0.001;
          const starDist = px(SIZE.md * (0.5 + (i % 5) * 0.12), minDim);
          const starX = cx + Math.cos(starAngle) * starDist;
          const starY = cy + Math.sin(starAngle) * starDist;
          const starR = px(0.002 + (i % 3) * 0.001, minDim);
          const starHue = (i / CONSTELLATION_STARS + time * 0.001) % 1;
          const starColor = hueToRgb(starHue);

          // Star glow
          const sgR = starR * 4;
          const sg = ctx.createRadialGradient(starX, starY, 0, starX, starY, sgR);
          sg.addColorStop(0, rgba(starColor, ALPHA.glow.max * 0.08 * starIntensity * entrance));
          sg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = sg;
          ctx.fillRect(starX - sgR, starY - sgR, sgR * 2, sgR * 2);

          // Star dot
          ctx.beginPath();
          ctx.arc(starX, starY, starR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(starColor, ALPHA.content.max * 0.2 * starIntensity * entrance);
          ctx.fill();
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 8 — Progress ring
      // ═══════════════════════════════════════════════════════════════
      if (!s.completed && transformedCount > 0) {
        const progR = px(0.04, minDim);
        const prog = transformedCount / NODE_COUNT;
        ctx.beginPath();
        ctx.arc(cx, cy - px(GRID_H / 2 + 0.08, minDim), progR,
          -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.18 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer events ─────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      for (const n of s.nodes) {
        if (n.tapped) continue;
        if (Math.hypot(mx - n.x, my - n.y) < 0.045) {
          n.tapped = true;
          callbacksRef.current.onHaptic('tap');
          break;
        }
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
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }}
      />
    </div>
  );
}
