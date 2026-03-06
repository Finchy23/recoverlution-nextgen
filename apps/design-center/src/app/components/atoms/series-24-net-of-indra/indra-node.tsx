/**
 * ATOM 231: THE INDRA NODE ENGINE
 * ==================================
 * Series 24 — Net of Indra · Position 1
 *
 * Touch one jewel — light recursively reflects through every node
 * in the network. Isolated actions do not exist. Each jewel is a
 * faceted diamond that refracts and amplifies the light it receives.
 *
 * PHYSICS:
 *   - 18-node network arranged in two concentric hexagonal rings + center
 *   - Each node connected to 2-4 neighbours via luminous filaments
 *   - Tap a node → it ignites to full brightness (the "seed")
 *   - Light propagates along connections with inverse-distance falloff
 *   - Each lit node develops reaction-diffusion Turing spots in its glow
 *   - Filaments pulse with travelling light particles (propagation visual)
 *   - Fully lit network produces standing-wave resonance halo
 *   - Breath modulates propagation speed and node glow warmth
 *
 * INTERACTION:
 *   Tap → ignites nearest node (seed)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static fully-lit network with gentle glow
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, GLOW, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Total nodes in Indra's net */
const NODE_COUNT = 18;
/** Inner ring node count */
const INNER_COUNT = 6;
/** Outer ring node count */
const OUTER_COUNT = 11;
/** Inner ring radius (fraction of minDim) */
const INNER_R = 0.13;
/** Outer ring radius */
const OUTER_R = SIZE.lg;
/** Node jewel radius at rest */
const NODE_R_REST = 0.012;
/** Node jewel radius when fully lit */
const NODE_R_LIT = 0.018;
/** Light propagation speed along filaments */
const PROP_SPEED = 0.018;
/** Propagation speed breath multiplier */
const BREATH_PROP = 0.25;
/** Breath warmth shift on lit nodes */
const BREATH_WARMTH = 0.15;
/** Travelling light particle count per connection */
const PARTICLES_PER_CONN = 2;
/** Particle speed along filament */
const PARTICLE_SPEED = 0.02;
/** Reaction-diffusion spot count per lit node */
const SPOT_COUNT = 5;
/** Spot orbit radius around node */
const SPOT_ORBIT = 0.025;
/** Spot visual size */
const SPOT_SIZE = 0.003;
/** Standing-wave halo layers at full illumination */
const HALO_LAYERS = 4;
/** Completion threshold (fraction of nodes lit > 0.8) */
const COMPLETION_FRAC = 0.85;
/** Glow bloom layers per node */
const NODE_GLOW_LAYERS = 3;
/** Center node index */
const CENTER_IDX = 0;

// =====================================================================
// STATE TYPES
// =====================================================================

interface NetNode {
  /** Normalized position 0-1 */
  x: number;
  y: number;
  /** Illumination level 0-1 */
  lit: number;
  /** Connected node indices */
  connections: number[];
  /** Jewel facet rotation angle */
  facetAngle: number;
  /** Individual phase for shimmer */
  phase: number;
}

interface TravellingParticle {
  /** Connection: source node index */
  from: number;
  /** Connection: target node index */
  to: number;
  /** Progress along connection 0-1 */
  t: number;
  /** Speed */
  speed: number;
}

// =====================================================================
// HELPERS
// =====================================================================

/** Build the Indra network topology */
function buildNetwork(): NetNode[] {
  const nodes: NetNode[] = [];

  // Center node
  nodes.push({
    x: 0.5, y: 0.5, lit: 0,
    connections: [],
    facetAngle: 0,
    phase: Math.random() * Math.PI * 2,
  });

  // Inner hexagonal ring
  for (let i = 0; i < INNER_COUNT; i++) {
    const angle = (i / INNER_COUNT) * Math.PI * 2 - Math.PI / 2;
    nodes.push({
      x: 0.5 + Math.cos(angle) * INNER_R,
      y: 0.5 + Math.sin(angle) * INNER_R,
      lit: 0,
      connections: [],
      facetAngle: angle,
      phase: Math.random() * Math.PI * 2,
    });
  }

  // Outer ring
  for (let i = 0; i < OUTER_COUNT; i++) {
    const angle = (i / OUTER_COUNT) * Math.PI * 2 - Math.PI / 6;
    nodes.push({
      x: 0.5 + Math.cos(angle) * OUTER_R,
      y: 0.5 + Math.sin(angle) * OUTER_R,
      lit: 0,
      connections: [],
      facetAngle: angle,
      phase: Math.random() * Math.PI * 2,
    });
  }

  // Connect center to inner ring
  for (let i = 1; i <= INNER_COUNT; i++) {
    nodes[CENTER_IDX].connections.push(i);
    nodes[i].connections.push(CENTER_IDX);
  }

  // Connect inner ring sequentially
  for (let i = 1; i <= INNER_COUNT; i++) {
    const next = i < INNER_COUNT ? i + 1 : 1;
    nodes[i].connections.push(next);
    nodes[next].connections.push(i);
  }

  // Connect inner to outer (each inner connects to ~2 outer)
  for (let i = 0; i < INNER_COUNT; i++) {
    const innerIdx = i + 1;
    const outerBase = INNER_COUNT + 1;
    const oi1 = outerBase + Math.floor(i * OUTER_COUNT / INNER_COUNT) % OUTER_COUNT;
    const oi2 = outerBase + (Math.floor(i * OUTER_COUNT / INNER_COUNT) + 1) % OUTER_COUNT;
    if (!nodes[innerIdx].connections.includes(oi1)) {
      nodes[innerIdx].connections.push(oi1);
      nodes[oi1].connections.push(innerIdx);
    }
    if (!nodes[innerIdx].connections.includes(oi2)) {
      nodes[innerIdx].connections.push(oi2);
      nodes[oi2].connections.push(innerIdx);
    }
  }

  // Connect outer ring sequentially
  const outerBase = INNER_COUNT + 1;
  for (let i = 0; i < OUTER_COUNT; i++) {
    const curr = outerBase + i;
    const next = outerBase + (i + 1) % OUTER_COUNT;
    if (!nodes[curr].connections.includes(next)) {
      nodes[curr].connections.push(next);
      nodes[next].connections.push(curr);
    }
  }

  return nodes;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function IndraNodeAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  composed,
  onHaptic,
  onStateChange,
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
    nodes: buildNetwork(),
    particles: [] as TravellingParticle[],
    stepNotified: false,
    completed: false,
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

      // ── Auto-resolve / Reduced motion ─────────────────
      if (p.reducedMotion || p.phase === 'resolve') {
        s.nodes.forEach(n => { n.lit = 1; });
        s.completed = true;
      }

      // ════════════════════════════════════════════════════
      // LIGHT PROPAGATION PHYSICS
      // ════════════════════════════════════════════════════
      const propSpeed = PROP_SPEED * (1 + breath * BREATH_PROP);

      for (const n of s.nodes) {
        if (n.lit > 0.05) {
          for (const ci of n.connections) {
            const neighbor = s.nodes[ci];
            if (neighbor.lit < n.lit - 0.08) {
              neighbor.lit = Math.min(1, neighbor.lit + propSpeed * n.lit * ms);
            }
          }
        }
      }

      // Travelling particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const tp = s.particles[i];
        tp.t += tp.speed * ms;
        if (tp.t >= 1) s.particles.splice(i, 1);
      }

      // Spawn new particles on active connections
      if (s.frameCount % 8 === 0) {
        for (const n of s.nodes) {
          if (n.lit > 0.3) {
            for (const ci of n.connections) {
              if (s.nodes[ci].lit < n.lit - 0.1 && s.particles.length < 80) {
                s.particles.push({
                  from: s.nodes.indexOf(n),
                  to: ci,
                  t: 0,
                  speed: PARTICLE_SPEED + Math.random() * 0.01,
                });
              }
            }
          }
        }
      }

      // ── Completion tracking ────────────────────────────
      const litCount = s.nodes.filter(n => n.lit > 0.8).length;
      const litFrac = litCount / NODE_COUNT;

      if (litFrac >= 0.5 && !s.stepNotified) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }
      if (litFrac >= COMPLETION_FRAC && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      if (s.completed) {
        s.completionGlow = Math.min(1, s.completionGlow + 0.008 * ms);
      }

      cb.onStateChange?.(s.completed ? 0.5 + s.completionGlow * 0.5 : litFrac * 0.5);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Network shadow
      // ════════════════════════════════════════════════════
      const networkGlowR = px(OUTER_R * 1.3, minDim);
      const netShadow = ctx.createRadialGradient(cx, cy + px(0.01, minDim), px(INNER_R, minDim), cx, cy, networkGlowR);
      netShadow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.04 * litFrac * entrance));
      netShadow.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.015 * litFrac * entrance));
      netShadow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = netShadow;
      ctx.fillRect(cx - networkGlowR, cy - networkGlowR, networkGlowR * 2, networkGlowR * 2);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Connection filaments
      // ════════════════════════════════════════════════════
      const drawnConns = new Set<string>();
      for (let ni = 0; ni < s.nodes.length; ni++) {
        const n = s.nodes[ni];
        for (const ci of n.connections) {
          const key = ni < ci ? `${ni}-${ci}` : `${ci}-${ni}`;
          if (drawnConns.has(key)) continue;
          drawnConns.add(key);

          const neighbor = s.nodes[ci];
          const litLevel = Math.min(n.lit, neighbor.lit);
          const nx1 = n.x * w, ny1 = n.y * h;
          const nx2 = neighbor.x * w, ny2 = neighbor.y * h;

          // Filament glow (behind the line)
          if (litLevel > 0.2) {
            const midX = (nx1 + nx2) / 2;
            const midY = (ny1 + ny2) / 2;
            const filGlowR = px(0.015 * litLevel, minDim);
            const fg = ctx.createRadialGradient(midX, midY, 0, midX, midY, filGlowR);
            fg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.06 * litLevel * entrance));
            fg.addColorStop(1, rgba(s.primaryRgb, 0));
            ctx.fillStyle = fg;
            ctx.fillRect(midX - filGlowR, midY - filGlowR, filGlowR * 2, filGlowR * 2);
          }

          // Filament line
          ctx.beginPath();
          ctx.moveTo(nx1, ny1);
          ctx.lineTo(nx2, ny2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * (0.04 + litLevel * 0.12) * entrance);
          ctx.lineWidth = px(STROKE.thin + litLevel * STROKE.light, minDim);
          ctx.stroke();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Travelling light particles
      // ════════════════════════════════════════════════════
      for (const tp of s.particles) {
        const fromN = s.nodes[tp.from];
        const toN = s.nodes[tp.to];
        const ppx = (fromN.x + (toN.x - fromN.x) * tp.t) * w;
        const ppy = (fromN.y + (toN.y - fromN.y) * tp.t) * h;
        const pR = px(0.003 * (1 - Math.abs(tp.t - 0.5) * 2), minDim);

        if (pR > 0.2) {
          // Particle glow
          const pgR = pR * 3;
          const pg = ctx.createRadialGradient(ppx, ppy, 0, ppx, ppy, pgR);
          pg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.15 * entrance));
          pg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = pg;
          ctx.fillRect(ppx - pgR, ppy - pgR, pgR * 2, pgR * 2);

          // Particle core
          ctx.beginPath();
          ctx.arc(ppx, ppy, pR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(
            lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3),
            ALPHA.content.max * 0.4 * entrance,
          );
          ctx.fill();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Reaction-diffusion spots (on lit nodes)
      // ════════════════════════════════════════════════════
      for (const n of s.nodes) {
        if (n.lit < 0.5) continue;
        const nx = n.x * w;
        const ny = n.y * h;
        const spotIntensity = (n.lit - 0.5) * 2; // 0-1

        for (let si = 0; si < SPOT_COUNT; si++) {
          const spotAngle = n.facetAngle + (si / SPOT_COUNT) * Math.PI * 2 + time * 0.4;
          const spotDist = px(SPOT_ORBIT * spotIntensity, minDim);
          const sx = nx + Math.cos(spotAngle) * spotDist;
          const sy = ny + Math.sin(spotAngle) * spotDist;
          const sR = px(SPOT_SIZE * spotIntensity, minDim);

          ctx.beginPath();
          ctx.arc(sx, sy, sR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(
            lerpColor(s.primaryRgb, s.accentRgb, 0.3),
            ALPHA.content.max * 0.15 * spotIntensity * entrance,
          );
          ctx.fill();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Node jewels
      // ════════════════════════════════════════════════════
      for (const n of s.nodes) {
        const nx = n.x * w;
        const ny = n.y * h;
        const nodeR = px(NODE_R_REST + (NODE_R_LIT - NODE_R_REST) * n.lit, minDim);
        const warmth = breath * BREATH_WARMTH * n.lit;
        const nodeColor = lerpColor(s.primaryRgb, [255, 240, 220] as RGB, warmth);
        const shimmer = 0.8 + 0.2 * Math.sin(time * 2.5 + n.phase);

        // Multi-layer node glow
        if (n.lit > 0.1) {
          for (let gi = NODE_GLOW_LAYERS - 1; gi >= 0; gi--) {
            const gR = nodeR * (2 + gi * 3 + n.lit * 4);
            const gA = ALPHA.glow.max * 0.08 * n.lit * entrance / (gi + 1);
            const gg = ctx.createRadialGradient(nx, ny, 0, nx, ny, gR);
            gg.addColorStop(0, rgba(nodeColor, gA));
            gg.addColorStop(0.3, rgba(nodeColor, gA * 0.4));
            gg.addColorStop(0.7, rgba(nodeColor, gA * 0.08));
            gg.addColorStop(1, rgba(nodeColor, 0));
            ctx.fillStyle = gg;
            ctx.fillRect(nx - gR, ny - gR, gR * 2, gR * 2);
          }
        }

        // Shadow beneath jewel
        const shadowR = nodeR * 2;
        const shadow = ctx.createRadialGradient(nx, ny + nodeR * 0.3, 0, nx, ny + nodeR * 0.3, shadowR);
        shadow.addColorStop(0, rgba([0, 0, 0] as RGB, 0.06 * entrance));
        shadow.addColorStop(1, rgba([0, 0, 0] as RGB, 0));
        ctx.fillStyle = shadow;
        ctx.fillRect(nx - shadowR, ny - shadowR, shadowR * 2, shadowR * 2);

        // Jewel body (multi-stop gradient)
        const jewGrad = ctx.createRadialGradient(
          nx - nodeR * 0.2, ny - nodeR * 0.2, nodeR * 0.1,
          nx, ny, nodeR,
        );
        const bodyAlpha = ALPHA.content.max * (0.15 + n.lit * 0.45) * shimmer * entrance;
        jewGrad.addColorStop(0, rgba(lerpColor(nodeColor, [255, 255, 255] as RGB, 0.4), bodyAlpha));
        jewGrad.addColorStop(0.35, rgba(nodeColor, bodyAlpha * 0.85));
        jewGrad.addColorStop(0.7, rgba(lerpColor(nodeColor, s.accentRgb, 0.2), bodyAlpha * 0.6));
        jewGrad.addColorStop(1, rgba(s.primaryRgb, bodyAlpha * 0.2));
        ctx.beginPath();
        ctx.arc(nx, ny, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = jewGrad;
        ctx.fill();

        // Jewel edge
        ctx.beginPath();
        ctx.arc(nx, ny, nodeR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(lerpColor(nodeColor, [255, 255, 255] as RGB, 0.2), ALPHA.content.max * 0.1 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();

        // Specular highlight
        if (n.lit > 0.3 && nodeR > 1) {
          ctx.beginPath();
          ctx.ellipse(nx - nodeR * 0.2, ny - nodeR * 0.25, nodeR * 0.3, nodeR * 0.18, -0.3, 0, Math.PI * 2);
          ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.2 * n.lit * entrance);
          ctx.fill();
        }

        // Facet glint (rotating highlight)
        if (n.lit > 0.5) {
          const glintAngle = n.facetAngle + time * 0.8;
          const gx = nx + Math.cos(glintAngle) * nodeR * 0.4;
          const gy = ny + Math.sin(glintAngle) * nodeR * 0.4;
          ctx.beginPath();
          ctx.arc(gx, gy, nodeR * 0.12, 0, Math.PI * 2);
          ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.15 * n.lit * entrance);
          ctx.fill();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 6: Standing-wave resonance halo (completion)
      // ════════════════════════════════════════════════════
      if (s.completionGlow > 0) {
        for (let i = 0; i < HALO_LAYERS; i++) {
          const haloPhase = (time * 0.08 + i * (1 / HALO_LAYERS)) % 1;
          const haloR = px(INNER_R + haloPhase * (OUTER_R - INNER_R + 0.05), minDim);
          const haloAlpha = ALPHA.content.max * 0.04 * (1 - haloPhase) * s.completionGlow * entrance;

          ctx.beginPath();
          ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, haloAlpha);
          ctx.lineWidth = px(STROKE.light, minDim) * (1 + (1 - haloPhase) * 3);
          ctx.stroke();
        }
      }

      // ── Progress ring ──────────────────────────────────
      if (!s.completed && litFrac > 0.02) {
        const progR = px(SIZE.xs, minDim);
        ctx.beginPath();
        ctx.arc(cx, cy - px(OUTER_R + 0.05, minDim), progR, -Math.PI / 2, -Math.PI / 2 + litFrac * Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Tap to ignite nearest node ───────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      let closest = -1;
      let closestDist = Infinity;
      for (let i = 0; i < s.nodes.length; i++) {
        const d = Math.hypot(mx - s.nodes[i].x, my - s.nodes[i].y);
        if (d < closestDist && d < 0.08) {
          closest = i;
          closestDist = d;
        }
      }
      if (closest >= 0) {
        s.nodes[closest].lit = 1;
        callbacksRef.current.onHaptic('tap');
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
