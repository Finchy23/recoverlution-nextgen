/**
 * ATOM 688: THE ACUPUNCTURE NEEDLE ENGINE
 * ==========================================
 * Series 69 — Minimum Effective Dose · Position 8
 *
 * Cure over-analysis wound inflation. Drop the blunt hammer.
 * Select the needle. Find the exact single-pixel mathematical
 * origin point — one microscopic painless tap unspools the
 * entire massive pain web into clear space.
 *
 * PHYSICS:
 *   - Sprawling web of interconnected red pain nodes fills viewport
 *   - 30+ nodes connected by tension lines radiating from origin
 *   - Tapping with "hammer" (default mode): web vibrates + grows
 *   - Double-tap to switch to "needle" mode (precision cursor)
 *   - Origin node: slightly brighter, pulse at different frequency
 *   - Single needle tap on origin: dissolution wave from center
 *   - Nodes unspool and fade outward sequentially
 *
 * INTERACTION:
 *   Tap (hammer) → web grows (error_boundary)
 *   Double-tap → switch to needle mode
 *   Needle tap on origin → dissolution (completion)
 *
 * RENDER: Canvas 2D with web network dissolution
 * REDUCED MOTION: Static clear space with faint web ghost
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

const BASE_NODES = 20;
const MAX_NODES = 45;
const GROWTH_PER_HIT = 2;
const NODE_R = 0.006;
const CONNECTION_DIST = 0.18;
const ORIGIN_PULSE_SPEED = 1.8;
const DISSOLUTION_SPEED = 0.06;
const DISSOLUTION_WAVE_SPEED = 0.04;
const DOUBLE_TAP_WINDOW = 25;
const TAP_HIT_R = 0.03;
const GLOW_LAYERS = 3;

interface WebNode {
  x: number; y: number;
  distFromOrigin: number;
  dissolved: boolean;
  dissolveProgress: number;
}

export default function AcupunctureNeedleAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const originX = 0.4 + Math.random() * 0.2;
  const originY = 0.4 + Math.random() * 0.2;

  const buildWeb = (count: number): WebNode[] => {
    const nodes: WebNode[] = [];
    // Origin node first
    nodes.push({ x: originX, y: originY, distFromOrigin: 0, dissolved: false, dissolveProgress: 0 });
    for (let i = 1; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.05 + Math.random() * 0.35;
      const nx = originX + Math.cos(angle) * dist;
      const ny = originY + Math.sin(angle) * dist;
      nodes.push({
        x: Math.max(0.05, Math.min(0.95, nx)),
        y: Math.max(0.05, Math.min(0.95, ny)),
        distFromOrigin: dist,
        dissolved: false,
        dissolveProgress: 0,
      });
    }
    return nodes;
  };

  const stateRef = useRef({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    nodes: buildWeb(BASE_NODES),
    needleMode: false,
    dissolving: false,
    dissolveTime: 0,
    lastTapFrame: -100,
    vibration: 0,
    completed: false,
    stepNotified: false,
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

      const time = s.frameCount * 0.012;

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

      if (p.phase === 'resolve') { s.dissolving = true; s.dissolveTime = 100; }

      // ── Vibration decay ───────────────────────────────────
      s.vibration *= 0.95;

      // ── Dissolution physics ───────────────────────────────
      if (s.dissolving) {
        s.dissolveTime += DISSOLUTION_SPEED * ms;
        let allDissolved = true;
        for (const node of s.nodes) {
          const dissolveAt = node.distFromOrigin / DISSOLUTION_WAVE_SPEED;
          if (s.dissolveTime > dissolveAt) {
            node.dissolved = true;
            node.dissolveProgress = Math.min(1, (s.dissolveTime - dissolveAt) * 0.03);
          }
          if (!node.dissolved || node.dissolveProgress < 1) allDissolved = false;
        }

        const dissolved = s.nodes.filter(n => n.dissolved).length;
        if (dissolved > s.nodes.length * 0.5 && !s.stepNotified) {
          s.stepNotified = true;
          cb.onHaptic('tap');
        }

        if (allDissolved && !s.completed) {
          s.completed = true;
          cb.onHaptic('completion');
        }

        cb.onStateChange?.(0.3 + dissolved / s.nodes.length * 0.7);
      }

      // Vibration offset
      const vibX = s.vibration * Math.sin(time * 15) * px(0.005, minDim);
      const vibY = s.vibration * Math.cos(time * 17) * px(0.005, minDim);

      // ── 1. Connection lines ───────────────────────────────
      for (let i = 0; i < s.nodes.length; i++) {
        for (let j = i + 1; j < s.nodes.length; j++) {
          const ni = s.nodes[i]; const nj = s.nodes[j];
          if (ni.dissolved && ni.dissolveProgress >= 1) continue;
          if (nj.dissolved && nj.dissolveProgress >= 1) continue;
          const dist = Math.hypot(ni.x - nj.x, ni.y - nj.y);
          if (dist < CONNECTION_DIST) {
            const lineAlpha = ALPHA.content.max * 0.06 *
              (1 - Math.max(ni.dissolveProgress, nj.dissolveProgress)) * entrance;
            if (lineAlpha < 0.001) continue;
            ctx.beginPath();
            ctx.moveTo(ni.x * w + vibX, ni.y * h + vibY);
            ctx.lineTo(nj.x * w + vibX, nj.y * h + vibY);
            ctx.strokeStyle = rgba(s.accentRgb, lineAlpha);
            ctx.lineWidth = px(0.0008, minDim);
            ctx.stroke();
          }
        }
      }

      // ── 2. Nodes ──────────────────────────────────────────
      for (let i = 0; i < s.nodes.length; i++) {
        const node = s.nodes[i];
        if (node.dissolved && node.dissolveProgress >= 1) continue;
        const isOrigin = i === 0;
        const nx = node.x * w + vibX;
        const ny = node.y * h + vibY;
        const scale = 1 - node.dissolveProgress;
        const nR = px(NODE_R * scale * (isOrigin ? 1.3 : 1), minDim);
        if (nR < 0.3) continue;

        // Origin pulse
        if (isOrigin && !node.dissolved) {
          const pulse = 0.5 + 0.5 * Math.sin(time * ORIGIN_PULSE_SPEED);
          const og = ctx.createRadialGradient(nx, ny, 0, nx, ny, nR * 3);
          og.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.1 * pulse * entrance));
          og.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = og;
          ctx.fillRect(nx - nR * 3, ny - nR * 3, nR * 6, nR * 6);
        }

        ctx.beginPath();
        ctx.arc(nx, ny, nR, 0, Math.PI * 2);
        const nodeColor = isOrigin && !node.dissolved
          ? lerpColor(s.accentRgb, s.primaryRgb, 0.3)
          : s.accentRgb;
        ctx.fillStyle = rgba(nodeColor, ALPHA.content.max * 0.3 * scale * entrance);
        ctx.fill();
      }

      // ── 3. Dissolution wave ring ──────────────────────────
      if (s.dissolving && !s.completed) {
        const waveR = s.dissolveTime * DISSOLUTION_WAVE_SPEED * minDim;
        if (waveR > 0 && waveR < Math.max(w, h)) {
          ctx.beginPath();
          ctx.arc(originX * w, originY * h, waveR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance);
          ctx.lineWidth = px(0.001, minDim);
          ctx.stroke();
        }
      }

      // ── 4. Mode indicator ─────────────────────────────────
      if (!s.dissolving) {
        const indR = px(0.008, minDim);
        const indY = h * 0.92;
        ctx.beginPath();
        ctx.arc(cx, indY, indR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          s.needleMode ? s.primaryRgb : s.accentRgb,
          ALPHA.content.max * 0.3 * entrance
        );
        ctx.fill();
        // Needle indicator
        if (s.needleMode) {
          ctx.beginPath();
          ctx.moveTo(cx, indY - indR * 2);
          ctx.lineTo(cx, indY - indR * 4);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
          ctx.lineWidth = px(0.001, minDim);
          ctx.stroke();
        }
      }

      // ── 5. Cleared space glow ─────────────────────────────
      if (s.completed) {
        const cR = px(SIZE.md, minDim);
        const cg = ctx.createRadialGradient(originX * w, originY * h, 0,
          originX * w, originY * h, cR * 3);
        cg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.15 * entrance));
        cg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = cg;
        ctx.fillRect(originX * w - cR * 3, originY * h - cR * 3, cR * 6, cR * 6);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed || s.dissolving) return;
      const cb = callbacksRef.current;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      // Double-tap detection for mode switch
      const now = s.frameCount;
      if (now - s.lastTapFrame < DOUBLE_TAP_WINDOW) {
        s.needleMode = !s.needleMode;
        cb.onHaptic('tap');
        s.lastTapFrame = -100;
        return;
      }
      s.lastTapFrame = now;

      if (s.needleMode) {
        // Check origin node
        const dist = Math.hypot(mx - originX, my - originY);
        if (dist < TAP_HIT_R) {
          s.dissolving = true;
          s.dissolveTime = 0;
          cb.onHaptic('tap');
          return;
        }
        // Miss in needle mode — no penalty
      } else {
        // Hammer mode — web grows
        s.vibration = 1;
        const newCount = Math.min(MAX_NODES, s.nodes.length + GROWTH_PER_HIT);
        for (let i = s.nodes.length; i < newCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 0.05 + Math.random() * 0.35;
          s.nodes.push({
            x: Math.max(0.05, Math.min(0.95, originX + Math.cos(angle) * dist)),
            y: Math.max(0.05, Math.min(0.95, originY + Math.sin(angle) * dist)),
            distFromOrigin: dist,
            dissolved: false,
            dissolveProgress: 0,
          });
        }
        cb.onHaptic('error_boundary');
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} />
    </div>
  );
}
