/**
 * ATOM 682: THE ONE-PIXEL TAP ENGINE
 * =====================================
 * Series 69 — Minimum Effective Dose · Position 2
 *
 * Cure over-explanation. Frantic swiping makes the threat grow.
 * Pause. Analyse the structural geometry. Deliver one single
 * deliberate one-pixel tap to the exact keystone — silent collapse.
 *
 * PHYSICS:
 *   - Complex geometric threat structure (hexagonal lattice)
 *   - Each frantic tap/swipe causes structure to GROW (new nodes)
 *   - One node is the keystone — subtly different (pulsing)
 *   - Single precise tap on keystone → cascading collapse
 *   - Collapse: nodes dissolve outward from keystone in wave
 *   - Structure rendered as connected hexagonal mesh
 *   - Growth penalty: 10% size increase per misplaced tap
 *
 * INTERACTION:
 *   Tap wrong spot → structure grows (error_boundary)
 *   Tap keystone → silent total collapse (completion)
 *
 * RENDER: Canvas 2D with hexagonal lattice fracture
 * REDUCED MOTION: Static clear space with faint dust
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

const BASE_NODE_COUNT = 18;
const MAX_NODES = 50;
const GROWTH_PER_ERROR = 3;
const HEX_SPACING = 0.06;
const NODE_R = 0.008;
const KEYSTONE_PULSE_SPEED = 2.5;
const KEYSTONE_PULSE_AMP = 0.003;
const TAP_HIT_R = 0.035;
const COLLAPSE_SPEED = 0.015;
const COLLAPSE_WAVE_SPEED = 0.08;
const DUST_COUNT = 20;
const DUST_SPEED = 0.002;
const DUST_LIFE = 60;
const GLOW_LAYERS = 3;

interface HexNode {
  x: number; y: number;
  isKeystone: boolean;
  collapseDelay: number;
  collapsed: boolean;
  collapseProgress: number;
}

interface Dust {
  x: number; y: number;
  vx: number; vy: number;
  life: number;
}

export default function OnePixelTapAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const buildNodes = (count: number): HexNode[] => {
    const nodes: HexNode[] = [];
    const keystoneIdx = Math.floor(count * 0.4 + Math.random() * count * 0.2);
    const rings = Math.ceil(Math.sqrt(count / 3));
    let idx = 0;
    for (let ring = 0; ring <= rings && idx < count; ring++) {
      const nodesInRing = ring === 0 ? 1 : ring * 6;
      for (let i = 0; i < nodesInRing && idx < count; i++) {
        const angle = (i / nodesInRing) * Math.PI * 2;
        const r = ring * HEX_SPACING;
        nodes.push({
          x: 0.5 + Math.cos(angle) * r + (Math.random() - 0.5) * 0.01,
          y: 0.5 + Math.sin(angle) * r + (Math.random() - 0.5) * 0.01,
          isKeystone: idx === keystoneIdx,
          collapseDelay: 0,
          collapsed: false,
          collapseProgress: 0,
        });
        idx++;
      }
    }
    return nodes;
  };

  const stateRef = useRef({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    nodes: buildNodes(BASE_NODE_COUNT),
    collapsing: false,
    collapseOriginX: 0.5,
    collapseOriginY: 0.5,
    collapseTime: 0,
    dusts: [] as Dust[],
    errors: 0,
    completed: false,
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
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const time = s.frameCount * 0.015;

      if (p.reducedMotion) {
        const cR = px(SIZE.md * 0.3, minDim);
        const pg = ctx.createRadialGradient(cx, cy, 0, cx, cy, cR * 3);
        pg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * entrance));
        pg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = pg;
        ctx.fillRect(cx - cR * 3, cy - cR * 3, cR * 6, cR * 6);
        cb.onStateChange?.(1);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      if (p.phase === 'resolve') { s.collapsing = true; s.collapseTime = 100; }

      // ── Collapse physics ──────────────────────────────────
      if (s.collapsing) {
        s.collapseTime += COLLAPSE_SPEED * ms;
        let allCollapsed = true;
        for (const node of s.nodes) {
          const dist = Math.hypot(node.x - s.collapseOriginX, node.y - s.collapseOriginY);
          node.collapseDelay = dist / COLLAPSE_WAVE_SPEED;
          if (s.collapseTime > node.collapseDelay) {
            node.collapsed = true;
            node.collapseProgress = Math.min(1, (s.collapseTime - node.collapseDelay) * 0.05);
          }
          if (!node.collapsed) allCollapsed = false;
        }
        if (allCollapsed && !s.completed) {
          s.completed = true;
          cb.onHaptic('completion');
          cb.onStateChange?.(1);
          // Spawn dust
          for (let i = 0; i < DUST_COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            s.dusts.push({
              x: s.collapseOriginX, y: s.collapseOriginY,
              vx: Math.cos(angle) * DUST_SPEED * (0.3 + Math.random()),
              vy: Math.sin(angle) * DUST_SPEED * (0.3 + Math.random()),
              life: DUST_LIFE,
            });
          }
        }
      }

      // Dust animation
      for (let i = s.dusts.length - 1; i >= 0; i--) {
        const d = s.dusts[i];
        d.x += d.vx * ms; d.y += d.vy * ms;
        d.life -= ms;
        if (d.life <= 0) s.dusts.splice(i, 1);
      }

      cb.onStateChange?.(s.completed ? 1 :
        s.collapsing ? 0.5 + s.nodes.filter(n => n.collapsed).length / s.nodes.length * 0.5 : 0);

      // ── 1. Connection lines ───────────────────────────────
      for (let i = 0; i < s.nodes.length; i++) {
        for (let j = i + 1; j < s.nodes.length; j++) {
          const ni = s.nodes[i]; const nj = s.nodes[j];
          const dist = Math.hypot(ni.x - nj.x, ni.y - nj.y);
          if (dist < HEX_SPACING * 1.6) {
            const lineAlpha = (ni.collapsed || nj.collapsed)
              ? 0.02 * Math.max(0, 1 - (ni.collapseProgress + nj.collapseProgress) / 2)
              : 0.08;
            ctx.beginPath();
            ctx.moveTo(ni.x * w, ni.y * h);
            ctx.lineTo(nj.x * w, nj.y * h);
            ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * lineAlpha * entrance);
            ctx.lineWidth = px(0.001, minDim);
            ctx.stroke();
          }
        }
      }

      // ── 2. Nodes ──────────────────────────────────────────
      for (const node of s.nodes) {
        if (node.collapsed && node.collapseProgress >= 1) continue;
        const nx = node.x * w;
        const ny = node.y * h;
        const scale = node.collapsed ? 1 - node.collapseProgress : 1;
        const nR = px(NODE_R * scale, minDim);
        if (nR < 0.5) continue;

        // Keystone pulse
        if (node.isKeystone && !node.collapsed) {
          const pulse = Math.sin(time * KEYSTONE_PULSE_SPEED);
          const extraR = px(KEYSTONE_PULSE_AMP * (0.5 + 0.5 * pulse), minDim);

          // Subtle keystone glow
          const kg = ctx.createRadialGradient(nx, ny, 0, nx, ny, nR + extraR * 3);
          kg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.08 * entrance));
          kg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = kg;
          ctx.fillRect(nx - (nR + extraR * 3), ny - (nR + extraR * 3),
            (nR + extraR * 3) * 2, (nR + extraR * 3) * 2);

          ctx.beginPath();
          ctx.arc(nx, ny, nR + extraR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(lerpColor(s.accentRgb, s.primaryRgb, 0.3),
            ALPHA.content.max * 0.45 * entrance);
          ctx.fill();
        } else {
          // Normal node
          ctx.beginPath();
          ctx.arc(nx, ny, nR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb,
            ALPHA.content.max * (node.collapsed ? 0.1 * scale : 0.3) * entrance);
          ctx.fill();
        }
      }

      // ── 3. Collapse wave ring ─────────────────────────────
      if (s.collapsing && !s.completed) {
        const waveR = s.collapseTime * COLLAPSE_WAVE_SPEED * minDim;
        if (waveR > 0 && waveR < Math.max(w, h)) {
          ctx.beginPath();
          ctx.arc(s.collapseOriginX * w, s.collapseOriginY * h, waveR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance);
          ctx.lineWidth = px(0.001, minDim);
          ctx.stroke();
        }
      }

      // ── 4. Dust particles ─────────────────────────────────
      for (const d of s.dusts) {
        const lr = d.life / DUST_LIFE;
        ctx.beginPath();
        ctx.arc(d.x * w, d.y * h, px(0.002 * lr, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.15 * lr * entrance);
        ctx.fill();
      }

      // ── 5. Cleared space glow ─────────────────────────────
      if (s.completed) {
        const cR = px(SIZE.sm, minDim);
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, cR * 3);
        cg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.15 * entrance));
        cg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = cg;
        ctx.fillRect(cx - cR * 3, cy - cR * 3, cR * 6, cR * 6);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed || s.collapsing) return;
      const cb = callbacksRef.current;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      // Check if tapped keystone
      for (const node of s.nodes) {
        if (!node.isKeystone) continue;
        const dist = Math.hypot(mx - node.x, my - node.y);
        if (dist < TAP_HIT_R) {
          // SUCCESS — keystone found
          s.collapsing = true;
          s.collapseOriginX = node.x;
          s.collapseOriginY = node.y;
          s.collapseTime = 0;
          cb.onHaptic('tap');
          return;
        }
      }

      // Miss — structure grows
      s.errors++;
      const newCount = Math.min(MAX_NODES, s.nodes.length + GROWTH_PER_ERROR);
      if (newCount > s.nodes.length) {
        for (let i = s.nodes.length; i < newCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const rings = Math.ceil(Math.sqrt(i / 3));
          const r = rings * HEX_SPACING * 0.5 + Math.random() * HEX_SPACING;
          s.nodes.push({
            x: 0.5 + Math.cos(angle) * r,
            y: 0.5 + Math.sin(angle) * r,
            isKeystone: false,
            collapseDelay: 0,
            collapsed: false,
            collapseProgress: 0,
          });
        }
      }
      cb.onHaptic('error_boundary');
    };

    canvas.addEventListener('pointerdown', onDown);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} />
    </div>
  );
}
