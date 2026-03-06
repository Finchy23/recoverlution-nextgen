/**
 * ATOM 380: THE SINGULARITY FOCUS ENGINE
 * ========================================
 * Series 38 — Magnetic Sieve · Position 10
 *
 * Cure FOMO paralysis. Drag 9 options into the incinerator —
 * the surviving 1 absorbs all power and becomes a blinding sun.
 *
 * PHYSICS:
 *   - 10 equally bright nodes orbit in a circle
 *   - Incinerator zone at bottom of viewport glows hot
 *   - User drags individual nodes down into incinerator
 *   - Each destruction transfers power to remaining nodes
 *   - The final surviving node absorbs ALL accumulated power
 *   - Final node expands to massive viewport-filling sun
 *   - Breath modulates the final sun's corona pulsation
 *
 * INTERACTION:
 *   Drag (node → incinerator) → destroys node, transfers power
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static single bright sun at center with orbit ring
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo, easeOutCubic,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Total option nodes */
const NODE_COUNT = 10;
/** Nodes that must be incinerated */
const DESTROY_COUNT = 9;
/** Orbit radius for circling nodes */
const ORBIT_R_FRAC = 0.28;
/** Individual node radius (base) */
const NODE_R_BASE = 0.016;
/** Orbit speed (rad/frame) */
const ORBIT_SPEED = 0.008;
/** Incinerator zone Y threshold (fraction of viewport) */
const INCINERATOR_Y = 0.85;
/** Incinerator glow radius */
const INCINERATOR_GLOW_R = 0.12;
/** Power transfer speed (per frame after destruction) */
const POWER_TRANSFER_RATE = 0.02;
/** Maximum sun radius when fully powered */
const SUN_R_MAX = 0.30;
/** Sun corona multiplier */
const CORONA_MULT = 3;
/** Breath corona pulsation factor */
const BREATH_CORONA_FACTOR = 0.15;
/** Drag snap distance to pick up a node */
const GRAB_DISTANCE = 0.08;
/** Incineration flash duration */
const FLASH_DURATION = 20;

// =====================================================================
// STATE TYPES
// =====================================================================

interface OptionNode {
  orbitAngle: number;     // position on orbit
  alive: boolean;
  power: number;          // accumulated power (1 = base)
  dragging: boolean;
  dragX: number;          // current drag position (fraction)
  dragY: number;
  incinerating: boolean;
  incinerateAnim: number; // 0→1 destruction animation
}

// =====================================================================
// HELPERS
// =====================================================================

function createNodes(): OptionNode[] {
  return Array.from({ length: NODE_COUNT }, (_, i) => ({
    orbitAngle: (i / NODE_COUNT) * Math.PI * 2,
    alive: true,
    power: 1,
    dragging: false,
    dragX: 0,
    dragY: 0,
    incinerating: false,
    incinerateAnim: 0,
  }));
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function SingularityFocusAtom({
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
    nodes: createNodes(),
    destroyedCount: 0,
    completed: false,
    sunExpand: 0,          // 0→1 sun expansion after completion
    totalPower: NODE_COUNT, // total power in system (conserved)
    flashTimer: 0,
    dragNodeIndex: -1,
    pointerDown: false,
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

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      // ── Atmosphere ──────────────────────────────────
      if (!p.composed) {
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      }

      // ── Orbit center (slightly above true center) ───
      const orbitCx = cx;
      const orbitCy = cy * 0.85;
      const orbitR = px(ORBIT_R_FRAC, minDim);

      // ── Flash decay ─────────────────────────────────
      if (s.flashTimer > 0) {
        s.flashTimer--;
      }

      // ── Node physics ────────────────────────────────
      const aliveNodes = s.nodes.filter(n => n.alive && !n.incinerating);

      // Redistribute power to alive nodes
      if (aliveNodes.length > 0 && aliveNodes.length < NODE_COUNT) {
        const targetPower = s.totalPower / aliveNodes.length;
        for (const n of aliveNodes) {
          n.power += (targetPower - n.power) * POWER_TRANSFER_RATE * ms;
        }
      }

      // Process incinerating nodes
      for (const n of s.nodes) {
        if (n.incinerating) {
          n.incinerateAnim = Math.min(1, n.incinerateAnim + 0.03 * ms);
          if (n.incinerateAnim >= 1) {
            n.alive = false;
            n.incinerating = false;
          }
        }
      }

      // Orbit rotation
      for (const n of s.nodes) {
        if (n.alive && !n.dragging && !n.incinerating) {
          n.orbitAngle += ORBIT_SPEED * ms;
        }
      }

      // Count destroyed
      s.destroyedCount = s.nodes.filter(n => !n.alive).length;

      // ── Completion check ────────────────────────────
      if (s.destroyedCount >= DESTROY_COUNT && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      if (s.completed) {
        s.sunExpand = Math.min(1, s.sunExpand + 0.006 * ms);
      }

      cb.onStateChange?.(s.completed
        ? 0.5 + s.sunExpand * 0.5
        : (s.destroyedCount / DESTROY_COUNT) * 0.5);

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        const sunR = px(SUN_R_MAX, minDim);
        const coronaR = sunR * CORONA_MULT;

        // Sun corona
        const corona = ctx.createRadialGradient(orbitCx, orbitCy, 0, orbitCx, orbitCy, coronaR);
        corona.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.5 * entrance));
        corona.addColorStop(0.2, rgba(s.primaryRgb, ALPHA.glow.max * 0.25 * entrance));
        corona.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * entrance));
        corona.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = corona;
        ctx.fillRect(orbitCx - coronaR, orbitCy - coronaR, coronaR * 2, coronaR * 2);

        // Sun body
        ctx.beginPath();
        ctx.arc(orbitCx, orbitCy, sunR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.6 * entrance);
        ctx.fill();

        // Orbit ring (ghost)
        ctx.beginPath();
        ctx.arc(orbitCx, orbitCy, orbitR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.3 * entrance);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ── Draw incinerator zone ───────────────────────
      const incY = INCINERATOR_Y * h;
      const incGlowR = px(INCINERATOR_GLOW_R, minDim);

      // Incinerator glow from bottom
      const incGrad = ctx.createLinearGradient(0, incY - incGlowR, 0, h);
      incGrad.addColorStop(0, rgba(s.accentRgb, 0));
      incGrad.addColorStop(0.3, rgba(s.accentRgb, ALPHA.glow.max * 0.15 * entrance));
      incGrad.addColorStop(1, rgba(s.accentRgb, ALPHA.glow.max * 0.25 * entrance));
      ctx.fillStyle = incGrad;
      ctx.fillRect(0, incY - incGlowR, w, h - incY + incGlowR);

      // Incinerator threshold line
      ctx.beginPath();
      ctx.moveTo(w * 0.15, incY);
      ctx.lineTo(w * 0.85, incY);
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.1 * entrance);
      ctx.lineWidth = px(0.001, minDim);
      ctx.setLineDash([px(0.006, minDim), px(0.008, minDim)]);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── Draw orbit ring ─────────────────────────────
      if (!s.completed) {
        ctx.beginPath();
        ctx.arc(orbitCx, orbitCy, orbitR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.3 * entrance);
        ctx.lineWidth = px(0.0008, minDim);
        ctx.stroke();
      }

      // ── Draw destruction flash ──────────────────────
      if (s.flashTimer > 0) {
        const flashAlpha = (s.flashTimer / FLASH_DURATION) * ALPHA.content.max * 0.08 * entrance;
        ctx.fillStyle = rgba(s.accentRgb, flashAlpha);
        ctx.fillRect(0, 0, w, h);
      }

      // ── Draw option nodes ───────────────────────────
      for (let i = 0; i < s.nodes.length; i++) {
        const n = s.nodes[i];
        if (!n.alive && !n.incinerating) continue;

        let npx: number, npy: number;

        if (n.dragging) {
          npx = n.dragX * w;
          npy = n.dragY * h;
        } else {
          npx = orbitCx + Math.cos(n.orbitAngle) * orbitR;
          npy = orbitCy + Math.sin(n.orbitAngle) * orbitR;
        }

        const powerScale = Math.sqrt(n.power / NODE_COUNT);
        const nodeR = px(NODE_R_BASE, minDim) * (1 + powerScale * 1.5);

        // Incineration shrink/fade
        const incFade = n.incinerating ? (1 - n.incinerateAnim) : 1;
        const effectiveR = nodeR * incFade;

        if (effectiveR < 0.5) continue;

        // Node outer glow
        const glowR = effectiveR * (3 + powerScale * 2);
        const glow = ctx.createRadialGradient(npx, npy, 0, npx, npy, glowR);
        glow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.25 * incFade * entrance));
        glow.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.glow.min * incFade * entrance));
        glow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = glow;
        ctx.fillRect(npx - glowR, npy - glowR, glowR * 2, glowR * 2);

        // Node body
        ctx.beginPath();
        ctx.arc(npx, npy, effectiveR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * incFade * entrance);
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.arc(npx, npy, effectiveR * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          lerpColor(s.primaryRgb, [255, 255, 255], 0.3),
          ALPHA.content.max * 0.25 * incFade * entrance,
        );
        ctx.fill();
      }

      // ── Draw the final sun (post-completion) ────────
      if (s.completed && s.sunExpand > 0.01) {
        const survivor = s.nodes.find(n => n.alive);
        if (survivor) {
          const sunR = px(SUN_R_MAX * easeOutExpo(s.sunExpand), minDim);
          const breathMod = 1 + breath * BREATH_CORONA_FACTOR;
          const coronaR = sunR * CORONA_MULT * breathMod;

          // Corona layers
          for (let layer = 2; layer >= 0; layer--) {
            const layerR = coronaR * (1 + layer * 0.3);
            const corona = ctx.createRadialGradient(orbitCx, orbitCy, sunR * 0.3, orbitCx, orbitCy, layerR);
            corona.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * s.sunExpand * entrance / (layer + 1)));
            corona.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * s.sunExpand * entrance / (layer + 1)));
            corona.addColorStop(1, rgba(s.primaryRgb, 0));
            ctx.fillStyle = corona;
            ctx.fillRect(orbitCx - layerR, orbitCy - layerR, layerR * 2, layerR * 2);
          }

          // Sun body
          ctx.beginPath();
          ctx.arc(orbitCx, orbitCy, sunR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.6 * s.sunExpand * entrance);
          ctx.fill();

          // Sun bright core
          ctx.beginPath();
          ctx.arc(orbitCx, orbitCy, sunR * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = rgba(
            lerpColor(s.primaryRgb, [255, 255, 255], 0.4),
            ALPHA.content.max * 0.35 * s.sunExpand * entrance,
          );
          ctx.fill();
        }
      }

      // ── Destruction counter ─────────────────────────
      if (s.destroyedCount > 0 && !s.completed) {
        const counterR = px(0.015, minDim);
        const counterAngle = (s.destroyedCount / DESTROY_COUNT) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(orbitCx, orbitCy, orbitR + px(0.02, minDim), -Math.PI / 2, -Math.PI / 2 + counterAngle);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.15 * entrance);
        ctx.lineWidth = px(0.002, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      const orbitCxF = 0.5;
      const orbitCyF = 0.5 * 0.85;
      const orbitRF = ORBIT_R_FRAC * Math.min(1, 1);

      // Find closest alive node
      let closestIdx = -1;
      let closestDist = Infinity;

      for (let i = 0; i < s.nodes.length; i++) {
        const n = s.nodes[i];
        if (!n.alive || n.incinerating) continue;

        const nx = orbitCxF + Math.cos(n.orbitAngle) * orbitRF;
        const ny = orbitCyF + Math.sin(n.orbitAngle) * orbitRF;
        const dx = mx - nx;
        const dy = my - ny;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      }

      if (closestDist < GRAB_DISTANCE && closestIdx >= 0) {
        s.nodes[closestIdx].dragging = true;
        s.nodes[closestIdx].dragX = mx;
        s.nodes[closestIdx].dragY = my;
        s.dragNodeIndex = closestIdx;
        s.pointerDown = true;
        canvas.setPointerCapture(e.pointerId);
        callbacksRef.current.onHaptic('drag_snap');
      }
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.pointerDown || s.dragNodeIndex < 0) return;

      const rect = canvas.getBoundingClientRect();
      const n = s.nodes[s.dragNodeIndex];
      n.dragX = (e.clientX - rect.left) / rect.width;
      n.dragY = (e.clientY - rect.top) / rect.height;
    };

    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.dragNodeIndex >= 0) {
        const n = s.nodes[s.dragNodeIndex];
        n.dragging = false;

        // Check if in incinerator zone
        if (n.dragY > INCINERATOR_Y && n.alive) {
          n.incinerating = true;
          n.incinerateAnim = 0;
          s.flashTimer = FLASH_DURATION;
          callbacksRef.current.onHaptic('step_advance');
        }

        s.dragNodeIndex = -1;
      }
      s.pointerDown = false;
      canvas.releasePointerCapture(e.pointerId);
    };

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
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
          cursor: 'grab',
        }}
      />
    </div>
  );
}
