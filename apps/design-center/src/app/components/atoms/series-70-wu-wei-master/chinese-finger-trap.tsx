/**
 * ATOM 692: THE CHINESE FINGER TRAP ENGINE
 * ===========================================
 * Series 70 — Wu Wei Master · Position 2
 *
 * Pulling forcefully tightens the mesh crushing you. Slide inward
 * deeper into the trap — tension drops to zero, you slip free.
 *
 * PHYSICS:
 *   - Core node (SIZE.md) surrounded by woven mesh cylinder
 *   - Dragging outward tightens mesh — visible constriction + pain haptics
 *   - Mesh render: overlapping diamond weave that contracts
 *   - Counter-intuitive: slide node INWARD (toward center/threat)
 *   - Inward motion relaxes mesh — tension drops exponentially
 *   - At zero tension: mesh expands, node slips free effortlessly
 *   - Visual: tension heatmap on mesh (red=tight, cool=relaxed)
 *
 * INTERACTION:
 *   Drag outward → mesh tightens (error_boundary)
 *   Drag inward → mesh relaxes → freedom (completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static freed node with expanded relaxed mesh
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

const CORE_R = SIZE.md;                  // 0.22
const MESH_INNER_R = 0.12;
const MESH_OUTER_R = 0.35;
const MESH_SEGMENTS = 16;
const MESH_RINGS = 6;
const TENSION_MAX = 1;
const TENSION_RELAX_THRESHOLD = 0.05;   // below this = freedom
const CONSTRICT_RATE = 0.015;           // tension increase per frame dragging out
const RELAX_RATE = 0.025;              // tension decrease per frame dragging in
const TENSION_DECAY = 0.001;           // passive tension decay (slow)
const CORE_START_Y = 0.5;
const DRAG_SENSITIVITY = 3;
const FREEDOM_EXPAND = 0.4;
const GLOW_LAYERS = 4;

export default function ChineseFingerTrapAtom({
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
    dragging: false,
    lastDragY: 0,
    coreY: CORE_START_Y,
    tension: 0.5,        // 0 = free, 1 = max constriction
    freed: false,
    freedProgress: 0,
    errorNotified: false,
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

      const time = s.frameCount * 0.012;

      if (p.reducedMotion) {
        // Static freed node
        const cR = px(CORE_R * 0.4, minDim);
        for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = cR * (2 + i * 1.5);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * entrance / (i + 1)));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }
        ctx.beginPath(); ctx.arc(cx, cy, cR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.6 * entrance);
        ctx.fill();
        // Expanded mesh ghost
        for (let i = 0; i < MESH_SEGMENTS; i++) {
          const a = (i / MESH_SEGMENTS) * Math.PI * 2;
          const mR = px(MESH_OUTER_R + FREEDOM_EXPAND, minDim);
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * mR, cy + Math.sin(a) * mR, px(0.003, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance);
          ctx.fill();
        }
        cb.onStateChange?.(1);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      if (p.phase === 'resolve' && !s.freed) {
        s.tension = 0;
      }

      // ── Passive tension decay ─────────────────────────────
      if (!s.dragging && !s.freed) {
        s.tension = Math.max(0, s.tension - TENSION_DECAY * ms);
      }

      // ── Freedom check ─────────────────────────────────────
      if (s.tension <= TENSION_RELAX_THRESHOLD && !s.freed) {
        s.freed = true;
        cb.onHaptic('completion');
      }

      if (s.freed) {
        s.freedProgress = Math.min(1, s.freedProgress + 0.012 * ms);
      }

      // Error haptic at high tension
      if (s.tension > 0.8 && !s.errorNotified) {
        s.errorNotified = true;
        cb.onHaptic('error_boundary');
      }
      if (s.tension < 0.5) s.errorNotified = false;

      cb.onStateChange?.(s.freed ? 0.5 + s.freedProgress * 0.5 : (1 - s.tension) * 0.5);

      const meshConstriction = s.freed ? -s.freedProgress * FREEDOM_EXPAND : s.tension * 0.15;
      const meshR = MESH_OUTER_R - meshConstriction;

      // ── 1. Mesh weave ─────────────────────────────────────
      const tensionColor = lerpColor(s.primaryRgb, s.accentRgb, s.tension);

      for (let ring = 0; ring < MESH_RINGS; ring++) {
        const ringT = ring / (MESH_RINGS - 1);
        const ringR = px(MESH_INNER_R + ringT * (meshR - MESH_INNER_R), minDim);

        for (let seg = 0; seg < MESH_SEGMENTS; seg++) {
          const a1 = (seg / MESH_SEGMENTS) * Math.PI * 2;
          const a2 = ((seg + 1) / MESH_SEGMENTS) * Math.PI * 2;

          // Diamond weave: alternate ring offset
          const offset = ring % 2 === 0 ? 0 : Math.PI / MESH_SEGMENTS;
          const ma1 = a1 + offset;
          const ma2 = a2 + offset;

          const x1 = cx + Math.cos(ma1) * ringR;
          const y1 = cy + Math.sin(ma1) * ringR;
          const x2 = cx + Math.cos(ma2) * ringR;
          const y2 = cy + Math.sin(ma2) * ringR;

          // Vibration at high tension
          const vib = s.tension > 0.5 ? Math.sin(time * 8 + seg + ring) * px(0.002 * s.tension, minDim) : 0;

          ctx.beginPath();
          ctx.moveTo(x1 + vib, y1 + vib);
          ctx.lineTo(x2 - vib, y2 - vib);

          const meshAlpha = ALPHA.content.max * (s.freed ? 0.08 * (1 - s.freedProgress) : 0.12 + s.tension * 0.2) * entrance;
          ctx.strokeStyle = rgba(tensionColor, meshAlpha);
          ctx.lineWidth = px(0.001 + s.tension * 0.002, minDim);
          ctx.stroke();
        }

        // Cross-ring connections (diamond pattern)
        if (ring < MESH_RINGS - 1) {
          const nextRingR = px(MESH_INNER_R + (ring + 1) / (MESH_RINGS - 1) * (meshR - MESH_INNER_R), minDim);
          const offset = ring % 2 === 0 ? 0 : Math.PI / MESH_SEGMENTS;
          const nextOffset = (ring + 1) % 2 === 0 ? 0 : Math.PI / MESH_SEGMENTS;

          for (let seg = 0; seg < MESH_SEGMENTS; seg += 2) {
            const a = (seg / MESH_SEGMENTS) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(a + offset) * ringR, cy + Math.sin(a + offset) * ringR);
            ctx.lineTo(cx + Math.cos(a + nextOffset) * nextRingR, cy + Math.sin(a + nextOffset) * nextRingR);
            ctx.strokeStyle = rgba(tensionColor, ALPHA.content.max * 0.06 * entrance);
            ctx.lineWidth = px(0.0008, minDim);
            ctx.stroke();
          }
        }
      }

      // ── 2. Core node ──────────────────────────────────────
      const nodeY = s.coreY * h;
      const nodeR = px(CORE_R * 0.3, minDim) * (1 - s.tension * 0.3);
      const breathPulse = 1 + p.breathAmplitude * 0.04;

      // Core glow
      for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
        const gR = nodeR * (1.5 + i * 1.2) * breathPulse;
        const gA = ALPHA.glow.max * (0.05 + (s.freed ? 0.2 : 0)) * entrance / (i + 1);
        const gg = ctx.createRadialGradient(cx, nodeY, 0, cx, nodeY, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, gA));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(cx - gR, nodeY - gR, gR * 2, gR * 2);
      }

      // Core body
      const coreAlpha = ALPHA.content.max * (0.4 + (s.freed ? 0.4 : 0) - s.tension * 0.2) * entrance;
      ctx.beginPath();
      ctx.arc(cx, nodeY, nodeR * breathPulse, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, coreAlpha);
      ctx.fill();

      // Constriction pain indicator
      if (s.tension > 0.3 && !s.freed) {
        const painR = nodeR * (1.3 + s.tension * 0.5);
        ctx.beginPath();
        ctx.arc(cx, nodeY, painR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * s.tension * 0.3 * entrance);
        ctx.lineWidth = px(0.002, minDim);
        ctx.stroke();
      }

      // ── 3. Tension gauge ──────────────────────────────────
      if (!s.freed) {
        const gaugeR = px(SIZE.xs * 0.7, minDim);
        const gaugeAngle = s.tension * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, nodeY - nodeR * 2, gaugeR, -Math.PI / 2, -Math.PI / 2 + gaugeAngle);
        ctx.strokeStyle = rgba(tensionColor, ALPHA.content.max * 0.25 * entrance);
        ctx.lineWidth = px(0.002, minDim);
        ctx.stroke();
      }

      // ── 4. Freedom radiance ───────────────────────────────
      if (s.freed && s.freedProgress > 0.2) {
        const freeR = px(CORE_R * s.freedProgress, minDim);
        for (let i = 0; i < 3; i++) {
          const ringPhase = (time * 0.2 + i * 0.33) % 1;
          const rR = freeR * (0.3 + ringPhase);
          ctx.beginPath();
          ctx.arc(cx, nodeY, rR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * (1 - ringPhase) * entrance);
          ctx.lineWidth = px(0.001, minDim);
          ctx.stroke();
        }

        const laneW = px(0.032, minDim) * (0.7 + s.freedProgress * 0.6);
        const laneTop = nodeY - freeR * 1.5;
        const laneBottom = nodeY + freeR * 1.5;
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.max * 0.12 * s.freedProgress * entrance);
        ctx.fillRect(cx - laneW * 0.5, laneTop, laneW, laneBottom - laneTop);

        ctx.beginPath();
        ctx.moveTo(cx, laneTop);
        ctx.lineTo(cx, laneBottom);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * s.freedProgress * entrance);
        ctx.lineWidth = px(0.002, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.freed) return;
      const rect = canvas.getBoundingClientRect();
      s.lastDragY = (e.clientY - rect.top) / rect.height;
      s.dragging = true;
      callbacksRef.current.onHaptic('drag_snap');
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || s.freed) return;
      const rect = canvas.getBoundingClientRect();
      const my = (e.clientY - rect.top) / rect.height;
      const dy = my - s.lastDragY;

      // Outward (away from center) = tightens
      // Inward (toward center) = relaxes
      const distFromCenter = Math.abs(my - 0.5);
      const lastDistFromCenter = Math.abs(s.lastDragY - 0.5);
      const movingOutward = distFromCenter > lastDistFromCenter;

      if (movingOutward) {
        s.tension = Math.min(TENSION_MAX, s.tension + CONSTRICT_RATE * Math.abs(dy) * DRAG_SENSITIVITY);
      } else {
        s.tension = Math.max(0, s.tension - RELAX_RATE * Math.abs(dy) * DRAG_SENSITIVITY);
      }

      s.coreY = Math.max(0.3, Math.min(0.7, s.coreY + dy * 0.3));
      s.lastDragY = my;
    };

    const onUp = () => { stateRef.current.dragging = false; };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ns-resize' }} />
    </div>
  );
}
