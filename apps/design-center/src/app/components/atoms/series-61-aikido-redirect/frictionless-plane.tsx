/**
 * ATOM 609: THE FRICTIONLESS PLANE ENGINE
 * =========================================
 * Series 61 — Aikido Redirect · Position 9
 *
 * Stop holding onto insults. Swiping the toxic particle causes
 * draining friction. Toggle your material from Rubber to Teflon —
 * friction drops to absolute zero and it slides off into the void.
 *
 * PHYSICS:
 *   - Toxic particle sticks to user node
 *   - Swiping causes harsh friction (energy drain)
 *   - Tap toggle: Rubber → Teflon (friction → zero)
 *   - With zero friction particle slides off into void
 *   - Breath modulates the node glow
 *
 * INTERACTION:
 *   Swipe (in rubber mode) → harsh friction, failure
 *   Tap (toggle)           → material switch → particle slides off
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static toggle showing material states
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const NODE_R_FRAC = 0.035;
const TOXIC_R_FRAC = 0.014;
const SLIDE_SPEED = 0.008;
const SLIDE_ACCEL = 1.03;
const FRICTION_SHAKE_AMP = 0.004;

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function FrictionlessPlaneAtom({
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
    material: 'rubber' as 'rubber' | 'teflon',
    toxicAngle: Math.PI * 0.3, // angle on node surface
    toxicSliding: false,
    toxicSlideV: SLIDE_SPEED,
    toxicSlideOffset: 0,       // distance from node center
    toxicGone: false,
    frictionShake: 0,
    energy: 1,                 // user energy (drains on friction)
    completed: false,
    respawnTimer: 0,
    completions: 0,
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
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      if (!p.composed) {
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      }

      const nodeR = px(NODE_R_FRAC, minDim);
      const toxicR = px(TOXIC_R_FRAC, minDim);

      // ── Sliding physics ─────────────────────────────
      if (!p.reducedMotion && s.toxicSliding && !s.toxicGone) {
        s.toxicSlideOffset += s.toxicSlideV;
        s.toxicSlideV *= SLIDE_ACCEL;
        if (s.toxicSlideOffset > minDim * 0.5) {
          s.toxicGone = true;
          s.completed = true;
          s.completions++;
          cb.onHaptic('completion');
          cb.onStateChange?.(Math.min(1, s.completions / 2));
          s.respawnTimer = 90;
        }
      }

      // Friction shake decay
      if (s.frictionShake > 0) s.frictionShake *= 0.9;

      // ── Respawn ─────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.material = 'rubber';
          s.toxicAngle = Math.PI * (0.2 + Math.random() * 0.6);
          s.toxicSliding = false;
          s.toxicSlideV = SLIDE_SPEED;
          s.toxicSlideOffset = 0;
          s.toxicGone = false;
          s.energy = 1;
          s.completed = false;
        }
      }

      const shakeX = s.frictionShake * Math.sin(s.frameCount * 2) * px(FRICTION_SHAKE_AMP, minDim) * ms;
      const shakeY = s.frictionShake * Math.cos(s.frameCount * 2.3) * px(FRICTION_SHAKE_AMP, minDim) * ms;
      const slipField = s.material === 'teflon' ? 1 : 0;

      if (slipField > 0) {
        const moatInset = minDim * 0.08;
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.18 * entrance);
        ctx.lineWidth = px(0.002, minDim);
        ctx.strokeRect(moatInset, moatInset, w - moatInset * 2, h - moatInset * 2);
      }

      // ── Draw user node ──────────────────────────────
      const nodeX = cx + shakeX;
      const nodeY = cy + shakeY;

      // Surface material indicator
      const isRubber = s.material === 'rubber';
      const materialColor = isRubber
        ? lerpColor(s.primaryRgb, s.accentRgb, 0.3)
        : s.primaryRgb;

      // Node glow
      const nodeGlow = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, nodeR * 4);
      nodeGlow.addColorStop(0, rgba(materialColor, ALPHA.glow.max * 0.4 * entrance));
      nodeGlow.addColorStop(0.5, rgba(materialColor, ALPHA.glow.min * entrance));
      nodeGlow.addColorStop(1, rgba(materialColor, 0));
      ctx.fillStyle = nodeGlow;
      ctx.fillRect(nodeX - nodeR * 4, nodeY - nodeR * 4, nodeR * 8, nodeR * 8);

      // Node body
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, nodeR * (1 + breath * 0.06), 0, Math.PI * 2);
      ctx.fillStyle = rgba(materialColor, ALPHA.content.max * entrance);
      ctx.fill();

      // Surface texture (rubber = rough dashes, teflon = smooth)
      if (isRubber) {
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, nodeR * 0.85, 0, Math.PI * 2);
        ctx.setLineDash([px(0.003, minDim), px(0.005, minDim)]);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.atmosphere.min * entrance);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Smooth ring
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, nodeR * 0.85, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.5 * entrance);
        ctx.lineWidth = px(0.0008, minDim);
        ctx.stroke();
      }

      // ── Draw toxic particle ─────────────────────────
      if (!s.toxicGone) {
        const toxicDist = nodeR + toxicR * 0.5 + s.toxicSlideOffset;
        const tx = nodeX + Math.cos(s.toxicAngle) * toxicDist;
        const ty = nodeY + Math.sin(s.toxicAngle) * toxicDist;

        if (s.material === 'teflon' && s.toxicSliding) {
          ctx.beginPath();
          ctx.moveTo(nodeX, nodeY);
          ctx.lineTo(tx, ty);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.2 * entrance);
          ctx.lineWidth = px(0.0011, minDim);
          ctx.stroke();
        }

        // Toxic glow
        const toxGlow = ctx.createRadialGradient(tx, ty, 0, tx, ty, toxicR * 3);
        toxGlow.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.3 * entrance));
        toxGlow.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = toxGlow;
        ctx.fillRect(tx - toxicR * 3, ty - toxicR * 3, toxicR * 6, toxicR * 6);

        ctx.beginPath();
        ctx.arc(tx, ty, toxicR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * entrance);
        ctx.fill();

        // Sticky line (only in rubber mode while attached)
        if (isRubber && !s.toxicSliding) {
          ctx.beginPath();
          ctx.moveTo(nodeX + Math.cos(s.toxicAngle) * nodeR, nodeY + Math.sin(s.toxicAngle) * nodeR);
          ctx.lineTo(tx, ty);
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.atmosphere.max * 0.5 * entrance);
          ctx.lineWidth = px(0.001, minDim);
          ctx.stroke();
        }
      }

      // ── Toggle indicator ────────────────────────────
      const toggleY = h * 0.88;
      const toggleW = minDim * 0.08;
      const toggleH = minDim * 0.025;
      const toggleX = cx - toggleW / 2;

      // Toggle track
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * entrance);
      ctx.beginPath();
      ctx.arc(toggleX + toggleH / 2, toggleY + toggleH / 2, toggleH / 2, Math.PI * 0.5, Math.PI * 1.5);
      ctx.arc(toggleX + toggleW - toggleH / 2, toggleY + toggleH / 2, toggleH / 2, Math.PI * 1.5, Math.PI * 0.5);
      ctx.closePath();
      ctx.fill();

      // Toggle knob
      const knobX = isRubber ? toggleX + toggleH / 2 : toggleX + toggleW - toggleH / 2;
      ctx.beginPath();
      ctx.arc(knobX, toggleY + toggleH / 2, toggleH * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = rgba(isRubber ? s.accentRgb : s.primaryRgb, ALPHA.content.max * entrance);
      ctx.fill();

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Pointer handlers ──────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed || s.toxicGone) return;

      const rect = canvas.getBoundingClientRect();
      const my = (e.clientY - rect.top) / rect.height;

      // Check if tapping near toggle area (bottom 20%)
      if (my > 0.78) {
        // Toggle material
        if (s.material === 'rubber') {
          s.material = 'teflon';
          s.toxicSliding = true;
          callbacksRef.current.onHaptic('tap');
        }
      } else if (s.material === 'rubber') {
        // Swiping in rubber mode = friction failure
        s.frictionShake = 8;
        s.energy = Math.max(0, s.energy - 0.15);
        callbacksRef.current.onHaptic('error_boundary');
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
