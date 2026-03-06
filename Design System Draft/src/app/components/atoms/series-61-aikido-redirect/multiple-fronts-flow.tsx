/**
 * ATOM 607: THE MULTIPLE FRONTS ENGINE
 * ======================================
 * Series 61 — Aikido Redirect · Position 7
 *
 * Handle simultaneous attacks without breaking flow. Draw one
 * continuous looping figure-eight — the Bezier curve catches,
 * orbits and slingshots all three threats without ever breaking
 * finger contact.
 *
 * PHYSICS:
 *   - Three threats approach from different angles
 *   - Drawing a continuous figure-eight creates a capture field
 *   - Each threat caught by the loop is slingshot away
 *   - All three must be dispatched in one unbroken gesture
 *   - Breath modulates the trail glow
 *
 * INTERACTION:
 *   Draw (continuous figure-eight loop) → catches and slingshots threats
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static figure-eight with arrows
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

const THREAT_R_FRAC = 0.018;
const NODE_R_FRAC = 0.02;
const THREAT_SPEED = 0.0015;
const CAPTURE_RADIUS_FRAC = 0.08;
const SLINGSHOT_SPEED = 0.02;
const TRAIL_MAX_POINTS = 200;

interface Threat {
  x: number; y: number;       // fraction of w/h
  vx: number; vy: number;     // velocity
  captured: boolean;
  slingshot: boolean;
  slingshotVx: number;
  slingshotVy: number;
  gone: boolean;
}

function createThreats(): Threat[] {
  return [
    { x: 0.1, y: 0.1, vx: 0.0008, vy: 0.001, captured: false, slingshot: false, slingshotVx: 0, slingshotVy: 0, gone: false },
    { x: 0.9, y: 0.2, vx: -0.001, vy: 0.0008, captured: false, slingshot: false, slingshotVx: 0, slingshotVy: 0, gone: false },
    { x: 0.5, y: 0.05, vx: 0.0002, vy: 0.0012, captured: false, slingshot: false, slingshotVx: 0, slingshotVy: 0, gone: false },
  ];
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function MultipleFrontsFlowAtom({
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
    threats: createThreats(),
    trail: [] as { x: number; y: number }[],
    drawing: false,
    capturedCount: 0,
    completed: false,
    respawnTimer: 0,
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
      const threatR = px(THREAT_R_FRAC, minDim);
      const captureR = minDim * CAPTURE_RADIUS_FRAC;

      // ── User core ───────────────────────────────────
      const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, nodeR * 4);
      coreGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
      coreGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = coreGlow;
      ctx.fillRect(cx - nodeR * 4, cy - nodeR * 4, nodeR * 8, nodeR * 8);

      ctx.beginPath();
      ctx.arc(cx, cy, nodeR * (1 + breath * 0.1), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
      ctx.fill();

      // ── Threat physics ──────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        for (const t of s.threats) {
          if (t.gone) continue;
          if (t.slingshot) {
            t.x += t.slingshotVx;
            t.y += t.slingshotVy;
            if (t.x < -0.2 || t.x > 1.2 || t.y < -0.2 || t.y > 1.2) {
              t.gone = true;
            }
          } else if (!t.captured) {
            // Move toward center
            const dx = 0.5 - t.x;
            const dy = 0.5 - t.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0.01) {
              t.x += (dx / dist) * THREAT_SPEED;
              t.y += (dy / dist) * THREAT_SPEED;
            }
          }
        }
      }

      // ── Check trail captures ────────────────────────
      if (s.drawing && s.trail.length > 2) {
        const lastPt = s.trail[s.trail.length - 1];
        for (const t of s.threats) {
          if (t.captured || t.slingshot || t.gone) continue;
          const dx = lastPt.x - t.x * w;
          const dy = lastPt.y - t.y * h;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < captureR) {
            t.captured = true;
            s.capturedCount++;
            cb.onHaptic('step_advance');

            // Slingshot direction: away from center
            const awayX = t.x - 0.5;
            const awayY = t.y - 0.5;
            const awayDist = Math.sqrt(awayX * awayX + awayY * awayY) || 0.01;
            t.slingshot = true;
            t.slingshotVx = (awayX / awayDist) * SLINGSHOT_SPEED;
            t.slingshotVy = (awayY / awayDist) * SLINGSHOT_SPEED;

            cb.onStateChange?.(s.capturedCount / 3);
          }
        }
      }

      // ── Check completion ────────────────────────────
      if (!s.completed && s.threats.every(t => t.gone)) {
        s.completed = true;
        cb.onHaptic('completion');
        cb.onStateChange?.(1);
        s.respawnTimer = 100;
      }

      // ── Respawn ─────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.threats = createThreats();
          s.trail = [];
          s.capturedCount = 0;
          s.completed = false;
        }
      }

      // ── Draw trail ──────────────────────────────────
      if (s.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(s.trail[0].x, s.trail[0].y);
        for (let i = 1; i < s.trail.length; i++) {
          ctx.lineTo(s.trail[i].x, s.trail[i].y);
        }
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * entrance);
        ctx.lineWidth = px(0.002, minDim);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Trail glow
        if (s.trail.length > 5) {
          const trailEnd = s.trail[s.trail.length - 1];
          const trailGlow = ctx.createRadialGradient(trailEnd.x, trailEnd.y, 0, trailEnd.x, trailEnd.y, captureR);
          trailGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.min * entrance));
          trailGlow.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = trailGlow;
          ctx.fillRect(trailEnd.x - captureR, trailEnd.y - captureR, captureR * 2, captureR * 2);
        }
      }

      // ── Draw threats ────────────────────────────────
      for (const t of s.threats) {
        if (t.gone) continue;
        const tx = t.x * w;
        const ty = t.y * h;
        const tAlpha = t.slingshot
          ? ALPHA.content.max * Math.max(0, 1 - Math.abs(t.x - 0.5) * 2) * entrance
          : ALPHA.content.max * entrance;

        // Threat glow
        const tGlow = ctx.createRadialGradient(tx, ty, 0, tx, ty, threatR * 3);
        tGlow.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.25 * entrance));
        tGlow.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = tGlow;
        ctx.fillRect(tx - threatR * 3, ty - threatR * 3, threatR * 6, threatR * 6);

        ctx.beginPath();
        ctx.arc(tx, ty, threatR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, tAlpha);
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Pointer handlers ──────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed) return;
      s.drawing = true;
      s.trail = [];
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (viewport.width / rect.width);
      const my = (e.clientY - rect.top) * (viewport.height / rect.height);
      s.trail.push({ x: mx, y: my });
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.drawing) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (viewport.width / rect.width);
      const my = (e.clientY - rect.top) * (viewport.height / rect.height);
      s.trail.push({ x: mx, y: my });
      if (s.trail.length > TRAIL_MAX_POINTS) {
        s.trail.shift();
      }
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.drawing = false;
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
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }}
      />
    </div>
  );
}
