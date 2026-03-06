/**
 * ATOM 024: THE MYCELIAL ROUTING ENGINE
 * =======================================
 * Series 3 — Biomimetic Algorithms · Position 4
 *
 * Your actions do not exist in a vacuum. Underneath the surface,
 * every decision sends nutrients across a vast, invisible network.
 * Tap a node — bioluminescent light races through hidden mycelial
 * connections, cascading across the entire web. One action
 * illuminates everything it's connected to.
 *
 * PHYSICS:
 *   - 22 organic nodes in a force-directed layout
 *   - Bezier connections between proximate nodes (~3–5 per node)
 *   - Light packets travel parametrically along connections
 *   - Cascade propagation: each ignited node fires packets onward
 *   - Breath peak = global nutrient pulse (all lit nodes surge)
 *   - Node energy decays slowly after ignition (but never fully dies)
 *   - Network luminosity accumulates with repeated interaction
 *
 * HAPTIC JOURNEY:
 *   Tap node       → tap (ignition)
 *   Cascade arrival → step_advance (each wave front)
 *   breath_peak    → nutrient surge through lit network
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: No packet travel animation, instant node ignition
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const NODE_COUNT = 22;
/** Minimum distance between nodes as fraction of min dimension */
const MIN_NODE_DIST_FRAC = 0.1;
/** Connection distance threshold as fraction of min dimension */
const CONN_DIST_FRAC = 0.32;
/** Max connections per node */
const MAX_CONNS = 5;
/** Packet travel speed (0–1 parametric per frame) */
const PACKET_SPEED = 0.025;
/** Node ignition decay rate per frame */
const IGNITION_DECAY = 0.0008;
/** Cascade delay (frames between node ignition and outgoing packets) */
const CASCADE_DELAY = 12;
/** Node base radius as fraction of min dimension */
const NODE_RADIUS_FRAC = 0.012;
/** Breath nutrient surge multiplier */
const BREATH_SURGE = 0.3;

// =====================================================================
// DATA STRUCTURES
// =====================================================================

interface MycelialNode {
  x: number;
  y: number;
  /** Base size multiplier (0.6–1.4) */
  sizeMult: number;
  /** Current ignition intensity (0–1) */
  ignition: number;
  /** Accumulated lifetime glow (never resets fully) */
  residue: number;
  /** Frame at which this node was last ignited */
  ignitionFrame: number;
  /** Pulse phase for idle shimmer */
  pulsePhase: number;
  pulseSpeed: number;
  /** Connections (indices into node array) */
  connections: number[];
}

interface LightPacket {
  /** Source node index */
  from: number;
  /** Destination node index */
  to: number;
  /** Parametric position along the connection (0→1) */
  t: number;
  /** Brightness */
  brightness: number;
}

// =====================================================================
// NODE GENERATION
// =====================================================================

function generateNodes(w: number, h: number): MycelialNode[] {
  const minDim = Math.min(w, h);
  const minDist = minDim * MIN_NODE_DIST_FRAC;
  const connDist = minDim * CONN_DIST_FRAC;
  const margin = minDim * 0.08;
  const nodes: MycelialNode[] = [];

  // Place nodes with minimum spacing
  let attempts = 0;
  while (nodes.length < NODE_COUNT && attempts < 2000) {
    attempts++;
    const x = margin + Math.random() * (w - margin * 2);
    const y = margin + Math.random() * (h - margin * 2);

    let tooClose = false;
    for (const n of nodes) {
      const dx = n.x - x;
      const dy = n.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < minDist) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) continue;

    nodes.push({
      x, y,
      sizeMult: 0.6 + Math.random() * 0.8,
      ignition: 0,
      residue: 0,
      ignitionFrame: -9999,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.008 + Math.random() * 0.012,
      connections: [],
    });
  }

  // Build connections (proximity-based, limited per node)
  for (let i = 0; i < nodes.length; i++) {
    // Sort other nodes by distance
    const dists: { idx: number; dist: number }[] = [];
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const dx = nodes[j].x - nodes[i].x;
      const dy = nodes[j].y - nodes[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < connDist) {
        dists.push({ idx: j, dist });
      }
    }
    dists.sort((a, b) => a.dist - b.dist);

    for (const d of dists) {
      if (nodes[i].connections.length >= MAX_CONNS) break;
      if (nodes[d.idx].connections.length >= MAX_CONNS) continue;
      // Avoid duplicate connections
      if (!nodes[i].connections.includes(d.idx)) {
        nodes[i].connections.push(d.idx);
        nodes[d.idx].connections.push(i);
      }
    }
  }

  return nodes;
}

// =====================================================================
// BEZIER HELPERS
// =====================================================================

function connectionControlPoint(
  ax: number, ay: number, bx: number, by: number,
  seed: number,
): { cx: number; cy: number } {
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const dx = bx - ax;
  const dy = by - ay;
  // Perpendicular offset based on seed
  const perp = (seed - 0.5) * 0.4;
  return {
    cx: mx + (-dy) * perp,
    cy: my + dx * perp,
  };
}

function bezierPoint(
  ax: number, ay: number,
  cx: number, cy: number,
  bx: number, by: number,
  t: number,
): { x: number; y: number } {
  const u = 1 - t;
  return {
    x: u * u * ax + 2 * u * t * cx + t * t * bx,
    y: u * u * ay + 2 * u * t * cy + t * t * by,
  };
}

// =====================================================================
// COLOR
// =====================================================================

// Mycelial palette
const MYCELIUM_DIM: RGB = [40, 45, 35];        // Dormant thread
const MYCELIUM_LIT: RGB = [140, 200, 90];      // Bioluminescent pulse
const NODE_CORE: RGB = [100, 170, 70];          // Node center
const NODE_GLOW: RGB = [160, 220, 100];         // Ignited glow
const SOIL_BG: RGB = [8, 10, 6];               // Deep soil
const NUTRIENT_PULSE: RGB = [180, 230, 120];    // Breath surge

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function MycelialRoutingAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  onHaptic,
  onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; },
    [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    nodes: [] as MycelialNode[],
    packets: [] as LightPacket[],
    /** Seeded random for control point offsets (one per connection pair) */
    connSeeds: new Map<string, number>(),
    // Breath tracking
    lastBreathPeak: false,
    // Cascade tracking
    cascadeWaveFronts: 0,
    lastCascadeStep: 0,
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

  // ── Seed for connection control points ────────────────────
  function getConnSeed(a: number, b: number): number {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    const s = stateRef.current;
    if (!s.connSeeds.has(key)) {
      s.connSeeds.set(key, Math.random());
    }
    return s.connSeeds.get(key)!;
  }

  // ── Ignite a node and fire cascade packets ────────────────
  function igniteNode(nodeIdx: number) {
    const s = stateRef.current;
    const node = s.nodes[nodeIdx];
    if (!node) return;

    node.ignition = 1;
    node.residue = Math.min(1, node.residue + 0.15);
    node.ignitionFrame = s.frameCount;

    // Fire packets to all connections
    for (const connIdx of node.connections) {
      // Don't send back to a node that's currently bright
      if (s.nodes[connIdx].ignition > 0.7) continue;
      s.packets.push({
        from: nodeIdx,
        to: connIdx,
        t: 0,
        brightness: 0.8,
      });
    }
  }

  // ── Main render loop ──────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const s = stateRef.current;
    const minDim = Math.min(w, h);
    const nodeBaseR = minDim * NODE_RADIUS_FRAC;

    // ── Native pointer handler ──────────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;

      let hitIdx = -1;
      let hitDist = Infinity;
      const hitR = minDim * NODE_RADIUS_FRAC * 4;

      for (let i = 0; i < s.nodes.length; i++) {
        const dx = s.nodes[i].x - px;
        const dy = s.nodes[i].y - py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < hitR && dist < hitDist) {
          hitIdx = i;
          hitDist = dist;
        }
      }

      if (hitIdx >= 0) {
        igniteNode(hitIdx);
        callbacksRef.current.onHaptic('tap');
        s.cascadeWaveFronts = 0;
      }
    };

    canvas.addEventListener('pointerdown', onDown);

    if (!s.initialized) {
      s.nodes = generateNodes(w, h);
      s.initialized = true;
    }

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

      // ── Breath nutrient pulse ─────────────────────────
      const breathHigh = p.breathAmplitude > 0.7;
      if (breathHigh && !s.lastBreathPeak) {
        cb.onHaptic('breath_peak');
        // Surge all currently-lit nodes
        for (const node of s.nodes) {
          if (node.ignition > 0.05 || node.residue > 0.1) {
            node.ignition = Math.min(1, node.ignition + BREATH_SURGE);
            node.residue = Math.min(1, node.residue + 0.05);
          }
        }
      }
      s.lastBreathPeak = breathHigh;

      // ── Packet physics ────────────────────────────────
      const deadPackets: number[] = [];
      for (let i = 0; i < s.packets.length; i++) {
        const pkt = s.packets[i];
        if (p.reducedMotion) {
          pkt.t = 1; // Instant arrival
        } else {
          pkt.t += PACKET_SPEED;
        }

        // Packet arrived at destination
        if (pkt.t >= 1) {
          deadPackets.push(i);
          const destNode = s.nodes[pkt.to];
          if (destNode && destNode.ignition < 0.3) {
            // Cascade ignition
            destNode.ignition = Math.min(1, destNode.ignition + 0.6);
            destNode.residue = Math.min(1, destNode.residue + 0.1);
            destNode.ignitionFrame = s.frameCount;

            // Fire onward packets after delay
            setTimeout(() => {
              if (!s.nodes[pkt.to]) return;
              for (const connIdx of destNode.connections) {
                if (connIdx === pkt.from) continue; // Don't loop back
                if (s.nodes[connIdx].ignition > 0.5) continue;
                s.packets.push({
                  from: pkt.to,
                  to: connIdx,
                  t: 0,
                  brightness: pkt.brightness * 0.7,
                });
              }
            }, CASCADE_DELAY * 16.67); // Convert frames to ms

            // Cascade wave front tracking
            s.cascadeWaveFronts++;
            if (s.cascadeWaveFronts % 3 === 0 && s.cascadeWaveFronts !== s.lastCascadeStep) {
              s.lastCascadeStep = s.cascadeWaveFronts;
              cb.onHaptic('step_advance');
            }
          }
        }
      }

      // Remove dead packets (reverse order to preserve indices)
      for (let i = deadPackets.length - 1; i >= 0; i--) {
        s.packets.splice(deadPackets[i], 1);
      }

      // ── Node decay ────────────────────────────────────
      for (const node of s.nodes) {
        if (node.ignition > 0) {
          node.ignition = Math.max(0, node.ignition - IGNITION_DECAY);
        }
        // Residue decays very slowly
        if (node.residue > 0) {
          node.residue = Math.max(0, node.residue - 0.00003);
        }
      }

      // ── State reporting (network luminosity) ──────────
      let totalLum = 0;
      for (const node of s.nodes) {
        totalLum += node.ignition + node.residue * 0.5;
      }
      cb.onStateChange?.(Math.min(1, totalLum / (NODE_COUNT * 0.6)));

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      // ── Background — deep soil ────────────────────────
      const bgBase = lerpColor(SOIL_BG, s.primaryRgb, 0.02);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgBase, entrance * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgBase, entrance * 0.015));
      bgGrad.addColorStop(1, rgba(bgBase, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle organic atmosphere
      const atmGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.4);
      atmGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [15, 20, 10], 0.8), 0.03 * entrance));
      atmGrad.addColorStop(1, rgba(bgBase, 0));
      ctx.fillStyle = atmGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Connections (mycelial threads) ─────────────────
      for (let i = 0; i < s.nodes.length; i++) {
        const nodeA = s.nodes[i];
        for (const j of nodeA.connections) {
          if (j <= i) continue; // Draw each connection once
          const nodeB = s.nodes[j];
          const seed = getConnSeed(i, j);
          const cp = connectionControlPoint(nodeA.x, nodeA.y, nodeB.x, nodeB.y, seed);

          // Connection brightness: max of both nodes
          const connBright = Math.max(
            nodeA.ignition, nodeB.ignition,
            nodeA.residue * 0.3, nodeB.residue * 0.3,
          );
          const dormantAlpha = 0.03;
          const litAlpha = 0.15;
          const alpha = (dormantAlpha + connBright * (litAlpha - dormantAlpha)) * entrance;

          const connColor = lerpColor(
            lerpColor(MYCELIUM_DIM, s.primaryRgb, 0.08),
            lerpColor(MYCELIUM_LIT, s.accentRgb, 0.12),
            connBright,
          );

          // Draw bezier
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.quadraticCurveTo(cp.cx, cp.cy, nodeB.x, nodeB.y);
          ctx.strokeStyle = rgba(connColor, alpha);
          ctx.lineWidth = minDim * (0.001 + connBright * 0.003);
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }

      // ── Light packets ─────────────────────────────────
      if (!p.reducedMotion) {
        for (const pkt of s.packets) {
          const nodeA = s.nodes[pkt.from];
          const nodeB = s.nodes[pkt.to];
          if (!nodeA || !nodeB) continue;

          const seed = getConnSeed(pkt.from, pkt.to);
          const cp = connectionControlPoint(nodeA.x, nodeA.y, nodeB.x, nodeB.y, seed);
          const pos = bezierPoint(nodeA.x, nodeA.y, cp.cx, cp.cy, nodeB.x, nodeB.y, pkt.t);

          const pktColor = lerpColor(NUTRIENT_PULSE, s.accentRgb, 0.15);
          const pktAlpha = pkt.brightness * (1 - pkt.t * 0.3) * entrance;

          // Packet glow
          const glowR = minDim * (0.012 + pkt.brightness * 0.008);
          const glowGrad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glowR);
          glowGrad.addColorStop(0, rgba(pktColor, pktAlpha * 0.3));
          glowGrad.addColorStop(0.4, rgba(pktColor, pktAlpha * 0.08));
          glowGrad.addColorStop(1, rgba(pktColor, 0));
          ctx.fillStyle = glowGrad;
          ctx.fillRect(pos.x - glowR, pos.y - glowR, glowR * 2, glowR * 2);

          // Packet core
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, minDim * (0.003 + pkt.brightness * 0.002), 0, Math.PI * 2);
          ctx.fillStyle = rgba(pktColor, pktAlpha);
          ctx.fill();
        }
      }

      // ── Nodes ─────────────────────────────────────────
      for (const node of s.nodes) {
        const r = nodeBaseR * node.sizeMult;
        const intensity = Math.max(node.ignition, node.residue * 0.4);
        const pulse = p.reducedMotion ? 0 :
          Math.sin(s.frameCount * node.pulseSpeed + node.pulsePhase) * 0.15;
        const breathPulse = p.breathAmplitude * 0.08;
        const totalIntensity = Math.min(1, intensity + (intensity > 0.05 ? pulse + breathPulse : pulse * 0.2));

        const nodeColor = lerpColor(
          lerpColor(MYCELIUM_DIM, s.primaryRgb, 0.1),
          lerpColor(NODE_CORE, s.accentRgb, 0.12),
          totalIntensity,
        );

        // Outer glow (only when lit)
        if (totalIntensity > 0.05) {
          const glowR = r * (3 + totalIntensity * 5);
          const glowGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowR);
          const glowColor = lerpColor(NODE_GLOW, s.accentRgb, 0.15);
          glowGrad.addColorStop(0, rgba(glowColor, totalIntensity * 0.12 * entrance));
          glowGrad.addColorStop(0.3, rgba(glowColor, totalIntensity * 0.03 * entrance));
          glowGrad.addColorStop(1, rgba(glowColor, 0));
          ctx.fillStyle = glowGrad;
          ctx.fillRect(node.x - glowR, node.y - glowR, glowR * 2, glowR * 2);
        }

        // Node body
        const bodyAlpha = (0.08 + totalIntensity * 0.4) * entrance;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * (1 + totalIntensity * 0.3), 0, Math.PI * 2);
        ctx.fillStyle = rgba(nodeColor, bodyAlpha);
        ctx.fill();

        // Specular on ignited nodes
        if (node.ignition > 0.3) {
          ctx.beginPath();
          ctx.arc(node.x - r * 0.15, node.y - r * 0.15, r * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = rgba([255, 255, 255], (node.ignition - 0.3) * 0.2 * entrance);
          ctx.fill();
        }
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