/**
 * ATOM 697: THE TANGLED KNOT ENGINE
 * ====================================
 * Series 70 — Wu Wei Master · Position 7
 *
 * Pulling ends locks the knot tight. Release all tension — let the
 * rope go slack — natural repulsion unspools the knot.
 *
 * PHYSICS:
 *   - Complex rope rendered as connected segments forming a knot
 *   - 40+ nodes connected by springs, initially tangled at center
 *   - Touching/dragging any end: springs lock rigid, knot tightens
 *   - Hands off: tension drops to zero, repulsion algorithm activates
 *   - Nodes repel each other when slack — organically unspool
 *   - Beautiful unraveling animation with trailing glow
 *   - Completion: rope forms clean gentle arc
 *
 * INTERACTION:
 *   Touch/drag → tightens knot (error_boundary)
 *   Hands off → slack → organic unspooling (completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static clean arc
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

const NODE_COUNT = 30;
const SPRING_REST = 0.025;
const SPRING_K = 0.02;
const REPULSION_K = 0.0003;
const REPULSION_DIST = 0.08;
const DRAG_COEFF = 0.92;
const TIGHTEN_FORCE = 0.008;
const SLACK_FRAMES = 180;         // ~3 seconds to start unspooling
const NODE_R = 0.003;
const ROPE_WIDTH = 0.003;
const KNOT_SPREAD = 0.12;        // initial knot radius
const GLOW_LAYERS = 3;
const CLEAN_ARC_R = 0.35;

interface RopeNode {
  x: number; y: number;
  vx: number; vy: number;
  locked: boolean;
}

export default function TangledKnotSlackAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  // Generate tangled initial positions
  const initNodes = (): RopeNode[] => {
    return Array.from({ length: NODE_COUNT }, (_, i) => {
      const t = i / (NODE_COUNT - 1);
      // Tangled: spiral around center
      const angle = t * Math.PI * 6 + Math.random() * 0.5;
      const r = KNOT_SPREAD * (0.2 + Math.random() * 0.8);
      return {
        x: 0.5 + Math.cos(angle) * r,
        y: 0.5 + Math.sin(angle) * r,
        vx: 0, vy: 0, locked: false,
      };
    });
  };

  const stateRef = useRef({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    nodes: initNodes(),
    stillFrames: 0,
    unspooling: false,
    tangledness: 1,    // 1 = fully tangled, 0 = clean
    touching: false,
    stepNotified: false,
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

      if (p.reducedMotion) {
        // Clean arc
        ctx.beginPath();
        for (let i = 0; i < NODE_COUNT; i++) {
          const t = i / (NODE_COUNT - 1);
          const angle = -Math.PI * 0.3 + t * Math.PI * 0.6;
          const ax = cx + Math.cos(angle) * px(CLEAN_ARC_R, minDim);
          const ay = cy + Math.sin(angle) * px(CLEAN_ARC_R * 0.5, minDim);
          if (i === 0) ctx.moveTo(ax, ay); else ctx.lineTo(ax, ay);
        }
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
        ctx.lineWidth = px(ROPE_WIDTH, minDim);
        ctx.stroke();
        cb.onStateChange?.(1);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      if (p.phase === 'resolve') { s.stillFrames = SLACK_FRAMES + 60; s.touching = false; }

      // ── Stillness tracking ────────────────────────────────
      if (!s.touching) {
        s.stillFrames++;
      }

      if (s.stillFrames > SLACK_FRAMES && !s.unspooling && !s.completed) {
        s.unspooling = true;
      }

      // ── Node physics ──────────────────────────────────────
      const nodes = s.nodes;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Spring to neighbors
        for (const ni of [i - 1, i + 1]) {
          if (ni < 0 || ni >= nodes.length) continue;
          const neighbor = nodes[ni];
          const dx = neighbor.x - node.x;
          const dy = neighbor.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const displacement = dist - SPRING_REST;
          if (dist > 0.001) {
            const force = SPRING_K * displacement;
            node.vx += (dx / dist) * force * ms;
            node.vy += (dy / dist) * force * ms;
          }
        }

        // Repulsion from non-neighbors (only when unspooling)
        if (s.unspooling) {
          for (let j = 0; j < nodes.length; j++) {
            if (Math.abs(j - i) <= 2) continue;
            const other = nodes[j];
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < REPULSION_DIST && dist > 0.001) {
              const force = REPULSION_K / (dist * dist);
              node.vx += (dx / dist) * force * ms;
              node.vy += (dy / dist) * force * ms;
            }
          }
        }

        // Tightening when touching
        if (s.touching) {
          const dx = 0.5 - node.x;
          const dy = 0.5 - node.y;
          node.vx += dx * TIGHTEN_FORCE * ms;
          node.vy += dy * TIGHTEN_FORCE * ms;
        }

        // Drag
        node.vx *= DRAG_COEFF;
        node.vy *= DRAG_COEFF;

        // Update position
        node.x += node.vx * ms;
        node.y += node.vy * ms;

        // Bounds
        node.x = Math.max(0.05, Math.min(0.95, node.x));
        node.y = Math.max(0.05, Math.min(0.95, node.y));
      }

      // ── Tangledness measurement ───────────────────────────
      let crossings = 0;
      for (let i = 0; i < nodes.length - 1; i++) {
        for (let j = i + 3; j < nodes.length - 1; j++) {
          const dx = Math.abs(nodes[i].x - nodes[j].x);
          const dy = Math.abs(nodes[i].y - nodes[j].y);
          if (dx < SPRING_REST * 1.5 && dy < SPRING_REST * 1.5) crossings++;
        }
      }
      s.tangledness = Math.min(1, crossings / (NODE_COUNT * 0.5));

      if (s.tangledness < 0.3 && s.unspooling && !s.stepNotified) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }
      if (s.tangledness < 0.05 && s.unspooling && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }

      cb.onStateChange?.(1 - s.tangledness);

      // ── 1. Rope segments ──────────────────────────────────
      ctx.beginPath();
      for (let i = 0; i < nodes.length; i++) {
        const nx = nodes[i].x * w;
        const ny = nodes[i].y * h;
        if (i === 0) ctx.moveTo(nx, ny);
        else {
          // Smooth curve through midpoints
          const prev = nodes[i - 1];
          const midX = (prev.x * w + nx) / 2;
          const midY = (prev.y * h + ny) / 2;
          ctx.quadraticCurveTo(prev.x * w, prev.y * h, midX, midY);
        }
      }
      const ropeColor = lerpColor(s.accentRgb, s.primaryRgb, 1 - s.tangledness);
      ctx.strokeStyle = rgba(ropeColor, ALPHA.content.max * 0.35 * entrance);
      ctx.lineWidth = px(ROPE_WIDTH, minDim);
      ctx.stroke();

      // Rope glow
      ctx.beginPath();
      for (let i = 0; i < nodes.length; i++) {
        const nx = nodes[i].x * w;
        const ny = nodes[i].y * h;
        if (i === 0) ctx.moveTo(nx, ny);
        else {
          const prev = nodes[i - 1];
          const midX = (prev.x * w + nx) / 2;
          const midY = (prev.y * h + ny) / 2;
          ctx.quadraticCurveTo(prev.x * w, prev.y * h, midX, midY);
        }
      }
      ctx.strokeStyle = rgba(ropeColor, ALPHA.glow.max * 0.08 * entrance);
      ctx.lineWidth = px(ROPE_WIDTH * 4, minDim);
      ctx.stroke();

      // ── 2. Node dots ──────────────────────────────────────
      for (let i = 0; i < nodes.length; i++) {
        if (i % 3 !== 0 && i !== 0 && i !== nodes.length - 1) continue;
        const nx = nodes[i].x * w;
        const ny = nodes[i].y * h;
        const nR = px(NODE_R, minDim);
        ctx.beginPath();
        ctx.arc(nx, ny, nR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(ropeColor, ALPHA.content.max * 0.4 * entrance);
        ctx.fill();
      }

      // ── 3. Tension indicator ──────────────────────────────
      if (s.touching) {
        // Tight knot stress glow
        const stressR = px(KNOT_SPREAD * 0.5, minDim);
        const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, stressR);
        sg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.1 * entrance));
        sg.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(cx - stressR, cy - stressR, stressR * 2, stressR * 2);
      }

      // ── 4. Unspooling progress ────────────────────────────
      if (s.unspooling && !s.completed) {
        const progR = px(SIZE.xs * 0.7, minDim);
        const progAngle = (1 - s.tangledness) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy - px(0.08, minDim), progR, -Math.PI / 2, -Math.PI / 2 + progAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(0.002, minDim);
        ctx.stroke();
      }

      // ── 5. Completion glow ────────────────────────────────
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

    const onDown = () => {
      const s = stateRef.current;
      if (s.completed) return;
      s.touching = true;
      s.stillFrames = 0;
      s.unspooling = false;
      callbacksRef.current.onHaptic('error_boundary');
    };
    const onUp = () => { stateRef.current.touching = false; };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'default' }} />
    </div>
  );
}
