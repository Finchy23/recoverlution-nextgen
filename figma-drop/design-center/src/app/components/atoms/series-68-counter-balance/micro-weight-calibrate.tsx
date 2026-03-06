/**
 * ATOM 674: THE MICRO-WEIGHT ENGINE
 * ====================================
 * Series 68 — Counter-Balance · Position 4
 *
 * Cure the sledgehammer over-reaction. Pinch to break massive
 * weight into a single 1g counter-measure. Delicately place on
 * the opposite side to restore perfect silent harmony.
 *
 * SIGNATURE TECHNIQUE: Equilibrium counter-balance — precision
 * balance scale, weight subdivision, delicate placement.
 *
 * INTERACTION: Tap (subdivide) → Drag (place) → balance
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static balanced
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE,
  motionScale, type RGB,
} from '../atom-utils';

const BEAM_WIDTH       = 0.6;
const FULCRUM_Y        = 0.5;
const IMBALANCE_WEIGHT = 1;
const COUNTER_WEIGHT   = 100;
const TARGET_WEIGHT    = 1;
const TILT_SENSITIVITY = 0.02;
const RESPAWN_DELAY    = 100;

interface WeightState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  leftWeight: number;
  rightWeight: number;
  beamTilt: number;
  counterSize: number;          // current size (starts at 100, pinch to 1)
  placed: boolean;
  shattered: boolean;
  subdivisions: number;
  draggingCounter: boolean;
  counterX: number;
  counterY: number;
  completed: boolean;
  respawnTimer: number;
}

function freshState(c: string, a: string): WeightState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(c), accentRgb: parseColor(a),
    leftWeight: 0, rightWeight: IMBALANCE_WEIGHT,
    beamTilt: 0, counterSize: COUNTER_WEIGHT,
    placed: false, shattered: false, subdivisions: 0,
    draggingCounter: false, counterX: 0.2, counterY: 0.2,
    completed: false, respawnTimer: 0,
  };
}

export default function MicroWeightCalibrateAtom({
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

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      // ── PHYSICS ─────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        const diff = s.rightWeight - s.leftWeight;
        const targetTilt = diff * TILT_SENSITIVITY;
        s.beamTilt += (targetTilt - s.beamTilt) * 0.05;

        if (s.placed && Math.abs(diff) < 0.1 && !s.shattered) {
          s.completed = true;
          cb.onHaptic('completion');
          cb.onStateChange?.(1);
          s.respawnTimer = RESPAWN_DELAY;
        }

        cb.onStateChange?.(s.placed ? 0.8 : s.counterSize <= TARGET_WEIGHT ? 0.5 : s.subdivisions * 0.1);
      }

      const beamW = px(BEAM_WIDTH, minDim);
      const fulcrumY = h * FULCRUM_Y;

      // ── LAYER 2: Fulcrum ───────────────────────────
      ctx.beginPath();
      ctx.moveTo(cx, fulcrumY);
      ctx.lineTo(cx - px(0.02, minDim), fulcrumY + px(0.04, minDim));
      ctx.lineTo(cx + px(0.02, minDim), fulcrumY + px(0.04, minDim));
      ctx.closePath();
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
      ctx.fill();

      // ── LAYER 3: Beam ──────────────────────────────
      ctx.save();
      ctx.translate(cx, fulcrumY);
      ctx.rotate(s.beamTilt);

      const beamH = px(0.008, minDim);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
      ctx.fillRect(-beamW / 2, -beamH / 2, beamW, beamH);

      // Pans
      const panW = px(0.06, minDim);
      const panH = px(0.005, minDim);
      const panDrop = px(0.03, minDim);

      // Left pan
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
      ctx.fillRect(-beamW / 2 - panW / 2, panDrop - panH / 2, panW, panH);

      // Right pan with existing weight
      ctx.fillRect(beamW / 2 - panW / 2, panDrop - panH / 2, panW, panH);

      // Right weight (imbalance)
      ctx.beginPath();
      ctx.arc(beamW / 2, panDrop - px(0.015, minDim), px(0.008, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.5 * entrance);
      ctx.fill();

      // Left weight (if placed)
      if (s.placed) {
        ctx.beginPath();
        ctx.arc(-beamW / 2, panDrop - px(0.01, minDim), px(0.005, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.6 * entrance);
        ctx.fill();
      }

      ctx.restore();

      // ── LAYER 4: Counter weight (draggable) ────────
      if (!s.placed) {
        const cwX = s.counterX * w;
        const cwY = s.counterY * h;
        const cwR = px(0.005 + (s.counterSize / COUNTER_WEIGHT) * 0.025, minDim);

        ctx.beginPath();
        ctx.arc(cwX, cwY, cwR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
        ctx.fill();
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();

        // Weight label
        const wFont = Math.max(6, px(FONT_SIZE.xs, minDim));
        ctx.font = `${wFont}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.4 * entrance);
        ctx.fillText(`${s.counterSize}g`, cwX, cwY - cwR - px(0.01, minDim));
      }

      // ── LAYER 5: Shatter warning ──────────────────
      if (s.shattered) {
        const shFont = Math.max(8, px(FONT_SIZE.sm, minDim));
        ctx.font = `${shFont}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.text.max * 0.5 * entrance);
        ctx.fillText('SHATTERED!', cx, fulcrumY - px(0.1, minDim));
      }

      // ── LAYER 8: HUD ───────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';

      if (s.completed) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance);
        ctx.fillText('BALANCED', cx, h - px(0.035, minDim));
      } else if (s.counterSize > TARGET_WEIGHT) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.25 * entrance);
        ctx.fillText('TAP WEIGHT TO SUBDIVIDE', cx, h - px(0.035, minDim));
      } else if (!s.placed) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.25 * entrance);
        ctx.fillText('DRAG TO LEFT PAN', cx, h - px(0.035, minDim));
      }

      if (p.reducedMotion) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.fillRect(cx - beamW / 2, fulcrumY - px(0.004, minDim), beamW, px(0.008, minDim));
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
      if (s.completed) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      // Check if clicking on counter weight
      const cwDist = Math.sqrt((mx - s.counterX) ** 2 + (my - s.counterY) ** 2);
      if (cwDist < 0.06 && !s.placed) {
        if (s.counterSize > TARGET_WEIGHT) {
          s.counterSize = Math.max(TARGET_WEIGHT, Math.floor(s.counterSize / 2));
          s.subdivisions++;
          cbRef.current.onHaptic('drag_snap');
        } else {
          s.draggingCounter = true;
        }
      }
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.draggingCounter) return;
      const rect = canvas.getBoundingClientRect();
      s.counterX = (e.clientX - rect.left) / rect.width;
      s.counterY = (e.clientY - rect.top) / rect.height;
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.draggingCounter) {
        // Check if near left pan
        if (s.counterX < 0.35 && s.counterY > 0.4 && s.counterY < 0.6) {
          s.placed = true;
          s.leftWeight = s.counterSize;
          cbRef.current.onHaptic('drag_snap');
        }
        s.draggingCounter = false;
      }
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
