/**
 * ATOM 672: THE COUNTER-STEER ENGINE
 * =====================================
 * Series 68 — Counter-Balance · Position 2
 *
 * Cure panic over-correction. Node skids left. Counter-intuitively
 * swipe INTO the skid — physics aligns wheels with momentum,
 * instantly regaining traction for smooth recovery.
 *
 * SIGNATURE TECHNIQUE: Equilibrium counter-balance — skid angle
 * visualization, traction indicator, counter-intuitive input
 * teaching through physics failure vs success.
 *
 * INTERACTION: Swipe (into skid direction) → align → recover
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static recovered
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE,
  PARTICLE_SIZE, motionScale, type RGB,
} from '../atom-utils';

const NODE_RADIUS      = 0.02;
const SKID_ANGLE       = -0.3;         // skid direction (left)
const CORRECT_SWIPE    = -0.05;        // swipe left threshold
const WRONG_SWIPE      = 0.05;         // swipe right threshold
const RECOVERY_FRAMES  = 60;
const SPINOUT_FRAMES   = 40;
const RESPAWN_DELAY    = 90;

interface SkidState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  nodeX: number;
  nodeAngle: number;            // rotation angle of node
  skidding: boolean;
  recovered: boolean;
  spunOut: boolean;
  recoveryTimer: number;
  spinTimer: number;
  swipeReady: boolean;
  traction: number;             // 0 = no traction, 1 = full
  completed: boolean;
  respawnTimer: number;
  lastX: number;
  dragging: boolean;
}

function freshState(c: string, a: string): SkidState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(c), accentRgb: parseColor(a),
    nodeX: 0.5, nodeAngle: SKID_ANGLE,
    skidding: true, recovered: false, spunOut: false,
    recoveryTimer: 0, spinTimer: 0, swipeReady: true,
    traction: 0, completed: false, respawnTimer: 0,
    lastX: 0, dragging: false,
  };
}

export default function CounterSteerSkidAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);
  const stateRef = useRef(freshState(color, accentColor));
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);
      const nodeR = px(NODE_RADIUS, minDim);

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      // ── PHYSICS ─────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        if (s.skidding) {
          s.nodeX += Math.sin(s.nodeAngle) * 0.002;
          s.nodeAngle += Math.sin(s.frameCount * 0.1) * 0.002;
          if (s.frameCount % 6 === 0) cb.onHaptic('error_boundary');
        }

        if (s.recovered) {
          s.recoveryTimer++;
          s.traction = Math.min(1, s.recoveryTimer / RECOVERY_FRAMES);
          s.nodeAngle *= 0.92;
          cb.onStateChange?.(0.3 + s.traction * 0.7);
          if (s.traction >= 1) {
            s.completed = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          }
        }

        if (s.spunOut) {
          s.spinTimer++;
          s.nodeAngle += 0.15;
          if (s.spinTimer >= SPINOUT_FRAMES) {
            s.completed = true;
            s.respawnTimer = RESPAWN_DELAY;
          }
        }
      }

      const nx = s.nodeX * w;
      const ny = cy;

      // ── LAYER 2: Road surface ──────────────────────
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 1.5 * entrance);
      ctx.fillRect(0, cy - px(0.1, minDim), w, px(0.2, minDim));

      // Ice patch
      if (s.skidding) {
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.background.min * 2 * entrance * ms);
        ctx.fillRect(cx - px(0.15, minDim), cy - px(0.05, minDim), px(0.3, minDim), px(0.1, minDim));
      }

      // ── LAYER 3: Skid marks ────────────────────────
      if (s.skidding || s.spunOut) {
        for (let i = 0; i < 6; i++) {
          const sx = nx + (Math.random() - 0.5) * px(0.04, minDim);
          const sy = ny + nodeR + Math.random() * px(0.02, minDim);
          ctx.beginPath();
          ctx.arc(sx, sy, px(PARTICLE_SIZE.xs, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.atmosphere.min * 0.4 * entrance * ms);
          ctx.fill();
        }
      }

      // ── LAYER 4: Traction indicator ────────────────
      if (s.recovered) {
        const tractionR = nodeR * (1.5 + s.traction);
        ctx.beginPath();
        ctx.arc(nx, ny, tractionR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.3 * s.traction * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
      }

      // ── LAYER 5: Direction arrow ───────────────────
      if (s.skidding) {
        const arrowLen = px(0.06, minDim);
        const arrowAngle = s.nodeAngle + Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(nx + Math.cos(arrowAngle) * arrowLen, ny + Math.sin(arrowAngle) * arrowLen);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.4 * entrance * ms);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      // ── LAYER 6: Node ──────────────────────────────
      ctx.save();
      ctx.translate(nx, ny);
      ctx.rotate(s.nodeAngle);

      const gr = px(0.07, minDim);
      const nGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, gr);
      nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
      nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = nGlow;
      ctx.fillRect(-gr, -gr, gr * 2, gr * 2);

      ctx.beginPath();
      ctx.arc(0, 0, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
      ctx.fill();

      // Direction indicator on node
      ctx.beginPath();
      ctx.moveTo(0, -nodeR * 0.8);
      ctx.lineTo(nodeR * 0.3, nodeR * 0.3);
      ctx.lineTo(-nodeR * 0.3, nodeR * 0.3);
      ctx.closePath();
      ctx.fillStyle = rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3),
                           ALPHA.content.max * 0.4 * entrance);
      ctx.fill();

      ctx.restore();

      // ── LAYER 7: Swipe hint ────────────────────────
      if (s.skidding && s.swipeReady) {
        const hintX = cx - px(0.08, minDim);
        const hintY = cy + px(0.08, minDim);
        ctx.beginPath();
        ctx.moveTo(hintX + px(0.04, minDim), hintY);
        ctx.lineTo(hintX, hintY);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.3 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
        // Arrow tip
        ctx.beginPath();
        ctx.moveTo(hintX, hintY);
        ctx.lineTo(hintX + px(0.008, minDim), hintY - px(0.006, minDim));
        ctx.moveTo(hintX, hintY);
        ctx.lineTo(hintX + px(0.008, minDim), hintY + px(0.006, minDim));
        ctx.stroke();
      }

      // ── LAYER 8: HUD ───────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';

      if (s.spunOut) {
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.text.max * 0.5 * entrance);
        ctx.fillText('SPUN OUT', cx, h - px(0.035, minDim));
      } else if (s.recovered) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.45 * entrance);
        ctx.fillText('RECOVERING', cx, h - px(0.035, minDim));
      } else {
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.text.max * 0.3 * entrance);
        ctx.fillText('SKIDDING LEFT', cx, h - px(0.035, minDim));
      }

      if (p.reducedMotion) {
        ctx.beginPath();
        ctx.arc(cx, cy, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();
      }

      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          Object.assign(s, freshState(color, accentColor));
          s.entranceProgress = 1;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.skidding || s.completed) return;
      s.dragging = true;
      const rect = canvas.getBoundingClientRect();
      s.lastX = (e.clientX - rect.left) / rect.width;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || !s.skidding) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const dx = mx - s.lastX;

      if (dx < CORRECT_SWIPE) {
        // Counter-steer INTO the skid (left)
        s.skidding = false;
        s.recovered = true;
        s.swipeReady = false;
        cbRef.current.onHaptic('swipe_commit');
      } else if (dx > WRONG_SWIPE) {
        // Wrong: swiped away from skid
        s.skidding = false;
        s.spunOut = true;
        s.swipeReady = false;
        cbRef.current.onHaptic('error_boundary');
      }
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.dragging = false;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}
