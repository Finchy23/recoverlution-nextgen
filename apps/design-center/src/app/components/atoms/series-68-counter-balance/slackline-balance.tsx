/**
 * ATOM 675: THE SLACKLINE ENGINE
 * =================================
 * Series 68 — Counter-Balance · Position 5
 *
 * Prove balance is a verb not a noun. Rigid stillness builds
 * vibrations. Must constantly fluidly roll thumb in microscopic
 * continuous inputs — true dynamic equilibrium.
 *
 * SIGNATURE TECHNIQUE: Equilibrium counter-balance — razor-thin
 * line physics, vibration buildup, micro-correction visualization.
 *
 * INTERACTION: Drag (continuous micro-corrections) → sustained balance
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

const NODE_RADIUS      = 0.02;
const LINE_Y           = 0.55;
const VIBRATION_BUILD  = 0.0008;
const VIBRATION_DECAY  = 0.002;
const FALL_THRESHOLD   = 0.15;
const BALANCE_DURATION = 300;
const RESPAWN_DELAY    = 100;

interface SlackState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  nodeX: number;
  vibration: number;
  balanceTimer: number;
  dragging: boolean;
  lastMoveFrame: number;
  fallen: boolean;
  completed: boolean;
  respawnTimer: number;
}

function freshState(c: string, a: string): SlackState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(c), accentRgb: parseColor(a),
    nodeX: 0.5, vibration: 0.02, balanceTimer: 0,
    dragging: false, lastMoveFrame: 0, fallen: false,
    completed: false, respawnTimer: 0,
  };
}

export default function SlacklineBalanceAtom({
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
      const lineY = h * LINE_Y;

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      // ── PHYSICS ─────────────────────────────────────
      if (!p.reducedMotion && !s.completed && !s.fallen) {
        const idleFrames = s.frameCount - s.lastMoveFrame;

        if (s.dragging && idleFrames < 5) {
          // Active micro-corrections — dampen vibration
          s.vibration = Math.max(0.005, s.vibration - VIBRATION_DECAY);
          s.balanceTimer++;
        } else {
          // Static — vibration builds
          s.vibration = Math.min(FALL_THRESHOLD, s.vibration + VIBRATION_BUILD);
        }

        // Apply vibration to position
        s.nodeX = 0.5 + Math.sin(s.frameCount * 0.15) * s.vibration;

        if (s.vibration >= FALL_THRESHOLD) {
          s.fallen = true;
          cb.onHaptic('error_boundary');
          s.respawnTimer = 60;
        }

        cb.onStateChange?.(Math.min(1, s.balanceTimer / BALANCE_DURATION));

        if (s.balanceTimer >= BALANCE_DURATION) {
          s.completed = true;
          cb.onHaptic('completion');
          cb.onStateChange?.(1);
          s.respawnTimer = RESPAWN_DELAY;
        }

        if (s.frameCount % 20 === 0 && s.dragging && s.vibration < 0.05) {
          cb.onHaptic('step_advance');
        }
      }

      const nx = s.nodeX * w;
      const ny = s.fallen ? lineY + px(0.15, minDim) : lineY - nodeR;

      // ── LAYER 2: Void below ────────────────────────
      const voidGrad = ctx.createLinearGradient(0, lineY, 0, h);
      voidGrad.addColorStop(0, rgba(s.accentRgb, 0));
      voidGrad.addColorStop(1, rgba(s.accentRgb, ALPHA.background.min * 2 * entrance));
      ctx.fillStyle = voidGrad;
      ctx.fillRect(0, lineY, w, h - lineY);

      // ── LAYER 3: Slackline (with vibration wave) ───
      ctx.beginPath();
      ctx.moveTo(w * 0.1, lineY);
      for (let x = w * 0.1; x <= w * 0.9; x += 2) {
        const frac = (x - w * 0.1) / (w * 0.8);
        const sag = Math.sin(frac * Math.PI) * px(0.005, minDim);
        const vib = Math.sin(frac * 10 + s.frameCount * 0.2) * s.vibration * px(0.5, minDim);
        ctx.lineTo(x, lineY + sag + vib * ms);
      }
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
      ctx.lineWidth = px(STROKE.medium, minDim);
      ctx.stroke();

      // Anchor points
      for (const ax of [w * 0.1, w * 0.9]) {
        ctx.beginPath();
        ctx.arc(ax, lineY, px(0.006, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
        ctx.fill();
      }

      if (s.balanceTimer > 40) {
        const corridorAlpha = Math.min(1, (s.balanceTimer - 40) / 120) * entrance;
        const bandH = px(0.03, minDim);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.max * 0.1 * corridorAlpha);
        ctx.fillRect(w * 0.12, lineY - bandH * 0.5, w * 0.76, bandH);

        for (let i = 0; i < 6; i++) {
          const tx = w * (0.18 + i * 0.12);
          ctx.beginPath();
          ctx.arc(tx, lineY, px(0.0028, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.12 * corridorAlpha);
          ctx.fill();
        }
      }

      // ── LAYER 4: Vibration amplitude indicator ─────
      const vibBar = s.vibration / FALL_THRESHOLD;
      const vBarW = px(0.004, minDim);
      const vBarH = px(0.15, minDim);
      const vBarX = w * 0.92;
      const vBarY = lineY - vBarH;

      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 1.5 * entrance);
      ctx.fillRect(vBarX, vBarY, vBarW, vBarH);
      ctx.fillStyle = rgba(vibBar > 0.7 ? s.accentRgb : s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
      ctx.fillRect(vBarX, vBarY + vBarH * (1 - vibBar), vBarW, vBarH * vibBar);

      // ── LAYER 5: Balance timer arc ─────────────────
      const timerR = px(0.04, minDim);
      const timerX = w * 0.08;
      const timerY = lineY - px(0.1, minDim);
      const timerFrac = Math.min(1, s.balanceTimer / BALANCE_DURATION);

      ctx.beginPath();
      ctx.arc(timerX, timerY, timerR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.background.min * 2 * entrance);
      ctx.lineWidth = px(STROKE.medium, minDim);
      ctx.stroke();

      if (timerFrac > 0) {
        ctx.beginPath();
        ctx.arc(timerX, timerY, timerR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * timerFrac);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
        ctx.stroke();
      }

      // ── LAYER 6: Node ──────────────────────────────
      const gr = px(0.06, minDim);
      const nGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, gr);
      nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
      nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = nGlow;
      ctx.fillRect(nx - gr, ny - gr, gr * 2, gr * 2);

      ctx.beginPath();
      ctx.arc(nx, ny, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
      ctx.fill();

      // ── LAYER 8: HUD ───────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';

      if (s.fallen) {
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.text.max * 0.5 * entrance);
        ctx.fillText('FELL', cx, h - px(0.035, minDim));
      } else if (s.completed) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance);
        ctx.fillText('BALANCED', cx, h - px(0.035, minDim));
      } else {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance);
        ctx.fillText('KEEP MOVING', cx, h - px(0.035, minDim));
      }

      if (p.reducedMotion) {
        ctx.beginPath();
        ctx.moveTo(w * 0.1, lineY);
        ctx.lineTo(w * 0.9, lineY);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      if ((s.completed || s.fallen) && p.phase !== 'resolve') {
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
      stateRef.current.dragging = true;
      stateRef.current.lastMoveFrame = stateRef.current.frameCount;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = () => {
      stateRef.current.lastMoveFrame = stateRef.current.frameCount;
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
