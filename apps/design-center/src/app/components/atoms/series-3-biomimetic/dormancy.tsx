/**
 * ATOM 027: THE DORMANCY ENGINE
 * ===============================
 * Series 3 — Biomimetic Algorithms · Position 7
 *
 * The ego panics when it isn't "producing," viewing stillness as
 * depression. This atom visualises winter: nothing is happening
 * on the surface, but massive, critical architecture is being
 * built in the dark.
 *
 * The surface is frozen — white frost, absolute stillness, silence.
 * Hold your finger to peek beneath. A radial x-ray mask expands
 * from your touch point, revealing a vibrant, hyper-active root
 * network pulsing with warm energy underneath. Release — the
 * frost seals back. A chrysalis patience timer tracks how long
 * you can resist tapping. Each tap resets. Discipline is letting
 * the darkness do its work.
 *
 * PHYSICS:
 *   - Two layers: frozen surface (white/blue frost) + warm underworld
 *   - Radial reveal mask from hold position
 *   - Underworld: procedural root network with pulsing nodes
 *   - Chrysalis timer: patience score, tap resets
 *   - Haptics SILENT on surface, deep heartbeat revealed below
 *   - Frost crystal procedural generation (surface texture)
 *
 * HAPTIC JOURNEY:
 *   Hold → hold_start (silence breaks → heartbeat emerges)
 *   Hold sustained → hold_threshold (deep pulse)
 *   Tap → resets patience (silence)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static frost, no root pulsing, instant reveal
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const ROOT_NODE_COUNT = 30;
const ROOT_CONN_DIST_FRAC = 0.22;
const REVEAL_EXPAND_RATE = 0.015;
const REVEAL_SHRINK_RATE = 0.025;
const MAX_REVEAL_RADIUS_FRAC = 0.28;
const FROST_CRYSTAL_COUNT = 60;
const PATIENCE_DECAY = 0.0001; // very slow natural growth
const PULSE_FREQ = 0.025;
const HEARTBEAT_FREQ = 0.04;

// =====================================================================
// DATA STRUCTURES
// =====================================================================

interface RootNode {
  x: number;
  y: number;
  size: number;
  pulsePhase: number;
  connections: number[];
  energy: number;
}

interface FrostCrystal {
  x: number;
  y: number;
  size: number;
  angle: number;
  branches: number;
  alpha: number;
}

// =====================================================================
// COLOR
// =====================================================================

// Palette
const FROST_WHITE: RGB = [220, 230, 240];
const FROST_BLUE: RGB = [180, 200, 225];
const FROST_DEEP: RGB = [140, 165, 200];
const ICE_SURFACE: RGB = [200, 215, 235];
const WARM_ROOT: RGB = [180, 120, 50];
const ROOT_GLOW: RGB = [200, 150, 70];
const HEARTBEAT_WARM: RGB = [160, 90, 40];
const UNDERGROUND_BG: RGB = [20, 12, 8];
const NODE_BRIGHT: RGB = [220, 170, 80];

// =====================================================================
// GENERATION
// =====================================================================

function generateRoots(w: number, h: number): RootNode[] {
  const minDim = Math.min(w, h);
  const connDist = minDim * ROOT_CONN_DIST_FRAC;
  const margin = minDim * 0.06;
  const nodes: RootNode[] = [];
  let attempts = 0;

  while (nodes.length < ROOT_NODE_COUNT && attempts < 1500) {
    attempts++;
    const x = margin + Math.random() * (w - margin * 2);
    const y = margin + Math.random() * (h - margin * 2);
    let tooClose = false;
    for (const n of nodes) {
      const d = Math.hypot(n.x - x, n.y - y);
      if (d < minDim * 0.06) { tooClose = true; break; }
    }
    if (tooClose) continue;
    nodes.push({
      x, y,
      size: minDim * (0.004 + Math.random() * 0.008),
      pulsePhase: Math.random() * Math.PI * 2,
      connections: [],
      energy: 0.3 + Math.random() * 0.7,
    });
  }

  // Connect
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const d = Math.hypot(nodes[j].x - nodes[i].x, nodes[j].y - nodes[i].y);
      if (d < connDist && nodes[i].connections.length < 4 && nodes[j].connections.length < 4) {
        nodes[i].connections.push(j);
        nodes[j].connections.push(i);
      }
    }
  }
  return nodes;
}

function generateFrostCrystals(w: number, h: number, minDim: number): FrostCrystal[] {
  return Array.from({ length: FROST_CRYSTAL_COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    size: minDim * (0.008 + Math.random() * 0.024),
    angle: Math.random() * Math.PI * 2,
    branches: 5 + Math.floor(Math.random() * 3),
    alpha: 0.03 + Math.random() * 0.06,
  }));
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function DormancyAtom({
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
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    roots: [] as RootNode[],
    crystals: [] as FrostCrystal[],
    // Hold / reveal
    isHolding: false,
    holdX: 0,
    holdY: 0,
    revealRadius: 0, // normalised 0–1
    holdFired: false,
    holdThresholdFired: false,
    holdDuration: 0,
    // Patience
    patienceScore: 0, // 0–1
    lastTapFrame: -9999,
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

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      s.isHolding = true;
      s.holdX = (e.clientX - rect.left) / rect.width * w;
      s.holdY = (e.clientY - rect.top) / rect.height * h;
      s.holdFired = false;
      s.holdThresholdFired = false;
      s.holdDuration = 0;
      cbRef.current.onHaptic('hold_start');
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      if (s.isHolding) {
        s.holdX = (e.clientX - rect.left) / rect.width * w;
        s.holdY = (e.clientY - rect.top) / rect.height * h;
      }
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      const wasTap = s.holdDuration < 12;
      s.isHolding = false;
      if (wasTap) {
        s.patienceScore = Math.max(0, s.patienceScore - 0.15);
        s.lastTapFrame = s.frameCount;
      }
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    if (!s.initialized) {
      s.roots = generateRoots(w, h);
      s.crystals = generateFrostCrystals(w, h, minDim);
      s.initialized = true;
    }

    let animId: number;
    const dpr = window.devicePixelRatio || 1;
    const maxRevealPx = minDim * MAX_REVEAL_RADIUS_FRAC;

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

      // ── Hold / reveal ─────────────────────────────────
      if (s.isHolding) {
        s.holdDuration++;
        s.revealRadius = Math.min(1, s.revealRadius + (p.reducedMotion ? 0.08 : REVEAL_EXPAND_RATE));
        if (s.holdDuration > 60 && !s.holdThresholdFired) {
          s.holdThresholdFired = true;
          cb.onHaptic('hold_threshold');
        }
      } else {
        s.revealRadius = Math.max(0, s.revealRadius - (p.reducedMotion ? 0.08 : REVEAL_SHRINK_RATE));
      }

      // ── Patience score grows when NOT interacting ─────
      if (!s.isHolding && s.frameCount - s.lastTapFrame > 30) {
        s.patienceScore = Math.min(1, s.patienceScore + PATIENCE_DECAY);
      }

      cb.onStateChange?.(s.patienceScore);

      const revealPx = s.revealRadius * maxRevealPx;
      const heartbeat = p.reducedMotion ? 0.5 :
        0.5 + 0.5 * Math.pow(Math.abs(Math.sin(s.frameCount * HEARTBEAT_FREQ)), 4);

      // ══════════════════════════════════════════════════
      // LAYER 1: UNDERGROUND (warm, alive)
      // ══════════════════════════════════════════════════

      // Underground background
      const ugBg = lerpColor(UNDERGROUND_BG, s.primaryRgb, 0.03);
      const ugGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      ugGrad.addColorStop(0, rgba(ugBg, entrance * 0.03));
      ugGrad.addColorStop(0.6, rgba(ugBg, entrance * 0.015));
      ugGrad.addColorStop(1, rgba(ugBg, 0));
      ctx.fillStyle = ugGrad;
      ctx.fillRect(0, 0, w, h);

      // Warm atmospheric glow
      const warmGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.35);
      warmGrad.addColorStop(0, rgba(lerpColor(HEARTBEAT_WARM, s.primaryRgb, 0.15), 0.04 * entrance));
      warmGrad.addColorStop(1, rgba(ugBg, 0));
      ctx.fillStyle = warmGrad;
      ctx.fillRect(0, 0, w, h);

      // Root connections
      for (let i = 0; i < s.roots.length; i++) {
        const node = s.roots[i];
        for (const j of node.connections) {
          if (j <= i) continue;
          const other = s.roots[j];
          const pulse = p.reducedMotion ? 0.5 :
            0.3 + 0.7 * (0.5 + 0.5 * Math.sin(s.frameCount * PULSE_FREQ + node.pulsePhase));
          const connColor = lerpColor(WARM_ROOT, s.accentRgb, 0.1);
          const alpha = node.energy * pulse * 0.12 * entrance;

          ctx.beginPath();
          // Organic curve via midpoint offset
          const mx = (node.x + other.x) / 2 + (Math.sin(i + j) * 15);
          const my = (node.y + other.y) / 2 + (Math.cos(i * j) * 10);
          ctx.moveTo(node.x, node.y);
          ctx.quadraticCurveTo(mx, my, other.x, other.y);
          ctx.strokeStyle = rgba(connColor, alpha);
          ctx.lineWidth = minDim * (0.0016 + pulse * 0.001);
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }

      // Root nodes
      for (const node of s.roots) {
        const pulse = p.reducedMotion ? 0.6 :
          0.4 + 0.6 * (0.5 + 0.5 * Math.sin(s.frameCount * PULSE_FREQ * 1.3 + node.pulsePhase));
        const nColor = lerpColor(NODE_BRIGHT, s.accentRgb, 0.12);
        const alpha = node.energy * pulse * 0.25 * entrance;

        // Glow
        const glowR = node.size * 4;
        const glowColor = lerpColor(ROOT_GLOW, s.accentRgb, 0.1);
        const glowGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowR);
        glowGrad.addColorStop(0, rgba(glowColor, alpha * 0.3));
        glowGrad.addColorStop(0.5, rgba(glowColor, alpha * 0.06));
        glowGrad.addColorStop(1, rgba(glowColor, 0));
        ctx.fillStyle = glowGrad;
        ctx.fillRect(node.x - glowR, node.y - glowR, glowR * 2, glowR * 2);

        // Core
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * (0.5 + pulse * 0.3), 0, Math.PI * 2);
        ctx.fillStyle = rgba(nColor, alpha);
        ctx.fill();
      }

      // Heartbeat glow (center pulse)
      if (!p.reducedMotion) {
        const hbAlpha = heartbeat * 0.04 * entrance;
        const hbColor = lerpColor(HEARTBEAT_WARM, s.primaryRgb, 0.1);
        const hbR = minDim * 0.3;
        const hbGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, hbR);
        hbGrad.addColorStop(0, rgba(hbColor, hbAlpha));
        hbGrad.addColorStop(0.5, rgba(hbColor, hbAlpha * 0.2));
        hbGrad.addColorStop(1, rgba(hbColor, 0));
        ctx.fillStyle = hbGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // ═════════════════════════════════════════════════
      // LAYER 2: FROST SURFACE (masks the underground)
      // ══════════════════════════════════════════════════

      // We draw the frost surface with a circular "hole" at the hold point
      ctx.save();

      if (revealPx > 1) {
        // Create clipping region = entire canvas MINUS the reveal circle
        ctx.beginPath();
        ctx.rect(0, 0, w, h);
        ctx.arc(s.holdX, s.holdY, revealPx, 0, Math.PI * 2, true); // counter-clockwise = subtract
        ctx.clip('evenodd');
      }

      // Frost base
      const frostBase = lerpColor(ICE_SURFACE, s.primaryRgb, 0.03);
      const frostGrad = ctx.createLinearGradient(0, 0, 0, h);
      frostGrad.addColorStop(0, rgba(lerpColor(FROST_WHITE, s.primaryRgb, 0.02), 0.92 * entrance));
      frostGrad.addColorStop(0.3, rgba(frostBase, 0.95 * entrance));
      frostGrad.addColorStop(0.7, rgba(lerpColor(FROST_BLUE, s.primaryRgb, 0.03), 0.93 * entrance));
      frostGrad.addColorStop(1, rgba(lerpColor(FROST_DEEP, s.primaryRgb, 0.04), 0.04 * entrance));
      ctx.fillStyle = frostGrad;
      ctx.fillRect(0, 0, w, h);

      // Frost crystals
      for (const crystal of s.crystals) {
        drawFrostCrystal(ctx, crystal, s.primaryRgb, entrance, minDim);
      }

      // Subtle surface texture (noise-like)
      if (!p.reducedMotion) {
        for (let i = 0; i < 40; i++) {
          const tx = ((s.frameCount * 0.1 + i * 173.7) % w);
          const ty = ((i * 271.3 + 50) % h);
          ctx.beginPath();
          ctx.arc(tx, ty, minDim * 0.001, 0, Math.PI * 2);
          ctx.fillStyle = rgba(lerpColor(FROST_WHITE, s.primaryRgb, 0.04), 0.02 * entrance);
          ctx.fill();
        }
      }

      ctx.restore();

      // ── Reveal edge glow ──────────────────────────────
      if (revealPx > 2) {
        const edgeW = minDim * 0.012;
        const edgeColor = lerpColor(ROOT_GLOW, s.accentRgb, 0.15);
        const edgeGrad = ctx.createRadialGradient(
          s.holdX, s.holdY, Math.max(0, revealPx - edgeW * 0.5),
          s.holdX, s.holdY, revealPx + edgeW,
        );
        edgeGrad.addColorStop(0, rgba(edgeColor, 0));
        edgeGrad.addColorStop(0.4, rgba(edgeColor, 0.08 * entrance * heartbeat));
        edgeGrad.addColorStop(0.7, rgba(edgeColor, 0.03 * entrance));
        edgeGrad.addColorStop(1, rgba(edgeColor, 0));
        ctx.fillStyle = edgeGrad;
        const r2 = revealPx + edgeW;
        ctx.fillRect(s.holdX - r2, s.holdY - r2, r2 * 2, r2 * 2);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

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
          cursor: 'wait',
        }}
      />
    </div>
  );
}

// =====================================================================
// FROST CRYSTAL DRAWING
// =====================================================================

function drawFrostCrystal(
  ctx: CanvasRenderingContext2D,
  crystal: FrostCrystal,
  primaryRgb: [number, number, number],
  entrance: number,
  minDim: number,
) {
  const { x, y, size, angle, branches, alpha } = crystal;
  const crystalColor = lerpColor(FROST_WHITE, primaryRgb, 0.04);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  for (let i = 0; i < branches; i++) {
    const a = (i / branches) * Math.PI * 2;
    const ex = Math.cos(a) * size;
    const ey = Math.sin(a) * size;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = rgba(crystalColor, alpha * entrance);
    ctx.lineWidth = minDim * 0.0006;
    ctx.stroke();

    // Small side branches
    if (size > minDim * 0.012) {
      const mid = 0.55;
      const mx = ex * mid;
      const my = ey * mid;
      const sideLen = size * 0.3;
      const sideAngle = a + Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(mx + Math.cos(sideAngle) * sideLen, my + Math.sin(sideAngle) * sideLen);
      ctx.strokeStyle = rgba(crystalColor, alpha * 0.6 * entrance);
      ctx.lineWidth = minDim * 0.0004;
      ctx.stroke();

      const sideAngle2 = a - Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(mx + Math.cos(sideAngle2) * sideLen, my + Math.sin(sideAngle2) * sideLen);
      ctx.stroke();
    }
  }

  ctx.restore();
}