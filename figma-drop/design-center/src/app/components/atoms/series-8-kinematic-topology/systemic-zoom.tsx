/**
 * ATOM 074: THE SYSTEMIC ZOOM ENGINE
 * =====================================
 * Series 8 — Kinematic Topology · Position 4
 *
 * You're obsessing over one diseased leaf, convinced the tree is
 * dying. This atom forces you to see the health of the entire forest.
 * Tap or pinch out to reveal the massive healthy network.
 *
 * PHYSICS:
 *   - Camera starts locked tight on a single massive node
 *   - Each tap zooms out: 1 → 10 → 100 → 1000 nodes visible
 *   - Connection lines between nearby nodes at each zoom level
 *   - Original node subtly highlighted with accent colour
 *   - Node pulse: phase-offset sine on alpha
 *
 * INTERACTION:
 *   Tap → zoom out to next level
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: No node pulsing, instant zoom jumps
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, type RGB,
} from '../atom-utils';

// =====================================================================
// PALETTE
// =====================================================================

const NODE_COLOR: RGB = [100, 140, 200];
const NODE_DIM: RGB = [70, 80, 100];
const ACCENT_RING: RGB = [200, 160, 100];
const CONNECTION: RGB = [80, 90, 120];
const LABEL_COLOR: RGB = [170, 165, 185];
const BG_BASE: RGB = [18, 16, 24];

// =====================================================================
// CONSTANTS
// =====================================================================

const TOTAL_NODES = 200;
const ZOOM_LEVELS = [
  { nodesVisible: 1, zoom: 8, label: 'one crisis' },
  { nodesVisible: 12, zoom: 3, label: '12 events' },
  { nodesVisible: 60, zoom: 1.2, label: '60 connections' },
  { nodesVisible: 200, zoom: 0.5, label: 'the whole network' },
];
const VIRTUAL_SIZE = 800; // virtual coordinate space

// =====================================================================
// NODE GENERATION (deterministic)
// =====================================================================

interface NodeData {
  x: number; y: number;
  phase: number;
  size: number;
}

function generateNodes(count: number): NodeData[] {
  const nodes: NodeData[] = [];
  for (let i = 0; i < count; i++) {
    const angle = i * 2.399963; // golden angle
    const r = Math.sqrt(i / count) * VIRTUAL_SIZE * 0.45;
    nodes.push({
      x: VIRTUAL_SIZE / 2 + Math.cos(angle) * r,
      y: VIRTUAL_SIZE / 2 + Math.sin(angle) * r,
      phase: i * 0.5,
      size: 2 + (i === 0 ? 3 : Math.sin(i * 1.7) * 1),
    });
  }
  return nodes;
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function SystemicZoomAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<NodeData[]>(generateNodes(TOTAL_NODES));
  const stateRef = useRef({
    entranceProgress: 0,
    level: 0,
    targetLevel: 0,
    zoomT: 0, // interpolated 0-3 (level index)
    resolved: false,
    frame: 0,
  });
  const propsRef = useRef({
    breathAmplitude, reducedMotion, phase, color, accentColor,
  });

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  // ── Render loop ───────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── Native pointer handler ──────────────────────────
    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const s = stateRef.current;
      if (s.level < ZOOM_LEVELS.length - 1) {
        s.level++;
        s.targetLevel = s.level;
        onHaptic('step_advance');
        if (s.level >= ZOOM_LEVELS.length - 1 && !s.resolved) {
          s.resolved = true;
          onHaptic('completion');
          onResolve?.();
        }
      }
    };

    canvas.addEventListener('pointerdown', onDown);

    let raf = 0;

    const render = () => {
      raf = requestAnimationFrame(render);
      const s = stateRef.current;
      const p = propsRef.current;
      s.frame++;

      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress;
      const ent = adv.entrance;

      // Smooth zoom transition
      const zLerp = p.reducedMotion ? 0.4 : 0.03;
      s.zoomT += (s.targetLevel - s.zoomT) * zLerp;

      onStateChange?.(s.zoomT / (ZOOM_LEVELS.length - 1));

      const primaryRgb = parseColor(p.color);
      const accentRgb = parseColor(p.accentColor);
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.015));
      bgGrad.addColorStop(1, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Interpolate zoom level
      const levelIdx = Math.min(ZOOM_LEVELS.length - 1, Math.floor(s.zoomT));
      const levelFrac = s.zoomT - levelIdx;
      const currentZoom = levelIdx < ZOOM_LEVELS.length - 1
        ? ZOOM_LEVELS[levelIdx].zoom + (ZOOM_LEVELS[levelIdx + 1].zoom - ZOOM_LEVELS[levelIdx].zoom) * levelFrac
        : ZOOM_LEVELS[ZOOM_LEVELS.length - 1].zoom;

      const nodesVisible = levelIdx < ZOOM_LEVELS.length - 1
        ? Math.round(ZOOM_LEVELS[levelIdx].nodesVisible + (ZOOM_LEVELS[levelIdx + 1].nodesVisible - ZOOM_LEVELS[levelIdx].nodesVisible) * levelFrac)
        : TOTAL_NODES;

      const nodes = nodesRef.current;
      const originX = nodes[0].x;
      const originY = nodes[0].y;

      // Transform: centre on node[0], apply zoom
      const scale = (minDim / VIRTUAL_SIZE) * currentZoom;

      // ── Draw connections ───────────────────────────────
      const connCol = lerpColor(CONNECTION, primaryRgb, 0.04);
      const connThreshold = 60 / currentZoom; // world-space distance
      ctx.strokeStyle = rgba(connCol, ELEMENT_ALPHA.tertiary.max * ent);
      ctx.lineWidth = minDim * 0.0004;

      for (let i = 0; i < Math.min(nodesVisible, nodes.length); i++) {
        const ni = nodes[i];
        const sx1 = cx + (ni.x - originX) * scale;
        const sy1 = cy + (ni.y - originY) * scale;
        if (sx1 < -minDim * 0.04 || sx1 > w + minDim * 0.04 || sy1 < -minDim * 0.04 || sy1 > h + minDim * 0.04) continue;

        for (let j = i + 1; j < Math.min(nodesVisible, nodes.length); j++) {
          const nj = nodes[j];
          const dx = ni.x - nj.x;
          const dy = ni.y - nj.y;
          if (dx * dx + dy * dy < connThreshold * connThreshold) {
            const sx2 = cx + (nj.x - originX) * scale;
            const sy2 = cy + (nj.y - originY) * scale;
            ctx.beginPath();
            ctx.moveTo(sx1, sy1);
            ctx.lineTo(sx2, sy2);
            ctx.stroke();
          }
        }
      }

      // ── Draw nodes ─────────────────────────────────────
      for (let i = 0; i < Math.min(nodesVisible, nodes.length); i++) {
        const n = nodes[i];
        const sx = cx + (n.x - originX) * scale;
        const sy = cy + (n.y - originY) * scale;
        if (sx < -minDim * 0.04 || sx > w + minDim * 0.04 || sy < -minDim * 0.04 || sy > h + minDim * 0.04) continue;

        const pulse = p.reducedMotion ? 0 : Math.sin(s.frame * 0.03 + n.phase) * 0.3;
        const nodeAlpha = (ELEMENT_ALPHA.primary.min + pulse * 0.02) * ent;
        const nodeSize = n.size * scale * 0.3;

        const col = i === 0
          ? lerpColor(ACCENT_RING, accentRgb, 0.1)
          : lerpColor(NODE_COLOR, primaryRgb, 0.05);

        ctx.fillStyle = rgba(col, nodeAlpha);
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(0.5, nodeSize), 0, Math.PI * 2);
        ctx.fill();

        // Accent ring on original node
        if (i === 0) {
          ctx.strokeStyle = rgba(lerpColor(ACCENT_RING, accentRgb, 0.1), ELEMENT_ALPHA.secondary.max * ent);
          ctx.lineWidth = minDim * 0.0006;
          ctx.beginPath();
          ctx.arc(sx, sy, Math.max(1, nodeSize * 1.8), 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // ── Label ──────────────────────────────────────────
      const currentLabel = ZOOM_LEVELS[Math.min(levelIdx, ZOOM_LEVELS.length - 1)].label;
      if (currentLabel) {
        ctx.font = `${Math.round(minDim * 0.014)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(LABEL_COLOR, primaryRgb, 0.05), ELEMENT_ALPHA.text.min * ent * 0.6);
        ctx.fillText(currentLabel, cx, h * 0.92);
      }

      // ── Instruction ────────────────────────────────────
      if (s.level === 0) {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(LABEL_COLOR, primaryRgb, 0.05), ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText('tap to zoom out and see the system', cx, h * 0.06);
      }

      ctx.restore();
    };

    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport, onStateChange, onHaptic, onResolve]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: viewport.width,
        height: viewport.height,
        display: 'block',
        touchAction: 'none',
        cursor: 'zoom-out',
      }}
    />
  );
}