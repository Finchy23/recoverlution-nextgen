/**
 * ATOM 606: THE RIGID STANCE ENGINE
 * ===================================
 * Series 61 — Aikido Redirect · Position 6
 *
 * Prove you do not have to attend every argument. Holding firm
 * crushes you. Slide your node one single pixel up — the massive
 * unstoppable train blasts harmlessly past.
 *
 * PHYSICS:
 *   - Massive unstoppable train moves across X-axis
 *   - User node on the tracks
 *   - Holding firm → violent shaking and crushing
 *   - Slide one pixel up Y-axis → train blasts past
 *   - Breath modulates the tranquil glow after sidestep
 *
 * INTERACTION:
 *   Hold (rigid)   → crushing failure
 *   Drag (tiny up)  → liberation sidestep
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static track with node above
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

const TRAIN_SPEED = 0.008;       // X-axis fraction per frame
const TRAIN_WIDTH_FRAC = 0.35;
const TRAIN_HEIGHT_FRAC = 0.06;
const NODE_R_FRAC = 0.018;
const SIDESTEP_THRESHOLD = 3;    // pixels up needed
const CRUSH_DURATION = 40;
const TRAIN_RESPAWN_DELAY = 70;

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function RigidStanceSidestepAtom({
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
    // Train
    trainX: -0.4,         // fraction of w (starts off-screen left)
    trainActive: true,
    // User node
    nodeY: 0,             // offset from track center (px)
    sidestepped: false,
    // Crushing
    crushing: false,
    crushFrame: 0,
    crushShake: 0,
    // Drag
    dragActive: false,
    dragStartY: 0,
    // Completion
    completions: 0,
    respawnTimer: 0,
    trainPassed: false,
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

      const trackY = cy;
      const nodeR = px(NODE_R_FRAC, minDim);
      const trainW = minDim * TRAIN_WIDTH_FRAC;
      const trainH = minDim * TRAIN_HEIGHT_FRAC;

      // ── Draw tracks ─────────────────────────────────
      const trackAlpha = ALPHA.atmosphere.max * entrance;
      ctx.beginPath();
      ctx.moveTo(0, trackY - trainH / 2);
      ctx.lineTo(w, trackY - trainH / 2);
      ctx.moveTo(0, trackY + trainH / 2);
      ctx.lineTo(w, trackY + trainH / 2);
      ctx.strokeStyle = rgba(s.primaryRgb, trackAlpha * 0.4);
      ctx.lineWidth = px(0.001, minDim);
      ctx.stroke();

      // Track ties
      const tieSpacing = minDim * 0.04;
      const tieCount = Math.ceil(w / tieSpacing);
      for (let i = 0; i < tieCount; i++) {
        const tieX = (i * tieSpacing) % w;
        ctx.beginPath();
        ctx.moveTo(tieX, trackY - trainH / 2 - px(0.003, minDim));
        ctx.lineTo(tieX, trackY + trainH / 2 + px(0.003, minDim));
        ctx.strokeStyle = rgba(s.primaryRgb, trackAlpha * 0.15);
        ctx.lineWidth = px(0.002, minDim);
        ctx.stroke();
      }

      // ── Train physics ───────────────────────────────
      if (!p.reducedMotion && s.trainActive) {
        s.trainX += TRAIN_SPEED;

        // Check collision with node
        const nodeAbsX = cx;
        const nodeAbsY = trackY + s.nodeY;
        const trainLeft = s.trainX * w;
        const trainRight = trainLeft + trainW;

        if (!s.sidestepped && !s.crushing && !s.trainPassed) {
          // Node is on track — check if train reaches it
          if (trainRight > nodeAbsX - nodeR && trainLeft < nodeAbsX + nodeR) {
            if (Math.abs(s.nodeY) < SIDESTEP_THRESHOLD) {
              // CRUSH
              s.crushing = true;
              s.crushFrame = 0;
              cb.onHaptic('error_boundary');
            } else {
              // SIDESTEPPED
              s.sidestepped = true;
              s.trainPassed = true;
              cb.onHaptic('drag_snap');
            }
          }
        }

        // Train exits screen
        if (s.trainX > 1.5) {
          s.trainActive = false;
          if (s.sidestepped) {
            s.completions++;
            cb.onHaptic('completion');
            cb.onStateChange?.(Math.min(1, s.completions / 3));
          }
          s.respawnTimer = TRAIN_RESPAWN_DELAY;
        }
      }

      // ── Crush animation ─────────────────────────────
      if (s.crushing) {
        s.crushFrame++;
        s.crushShake = Math.sin(s.crushFrame * 2) * px(0.004, minDim) * Math.max(0, 1 - s.crushFrame / CRUSH_DURATION);
        if (s.crushFrame >= CRUSH_DURATION) {
          s.crushing = false;
          s.trainActive = false;
          s.respawnTimer = TRAIN_RESPAWN_DELAY;
        }
      }

      // ── Respawn ─────────────────────────────────────
      if (!s.trainActive && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.trainX = -0.4;
          s.trainActive = true;
          s.sidestepped = false;
          s.crushing = false;
          s.crushFrame = 0;
          s.nodeY = 0;
          s.trainPassed = false;
        }
      }

      // ── Draw train ──────────────────────────────────
      if (s.trainActive) {
        const tx = s.trainX * w;
        const ty = trackY - trainH / 2;

        // Train glow
        const trainGlow = ctx.createLinearGradient(tx, ty, tx + trainW, ty);
        trainGlow.addColorStop(0, rgba(s.accentRgb, 0));
        trainGlow.addColorStop(0.3, rgba(s.accentRgb, ALPHA.glow.max * 0.3 * entrance));
        trainGlow.addColorStop(0.7, rgba(s.accentRgb, ALPHA.glow.max * 0.3 * entrance));
        trainGlow.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = trainGlow;
        ctx.fillRect(tx - minDim * 0.05, ty - trainH * 0.5, trainW + minDim * 0.1, trainH * 2);

        // Train body
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * entrance);
        ctx.fillRect(tx, ty, trainW, trainH);

        // Front edge highlight
        ctx.fillStyle = rgba(lerpColor(s.accentRgb, [255, 255, 255] as RGB, 0.3), ALPHA.content.max * 0.6 * entrance);
        ctx.fillRect(tx + trainW - px(0.003, minDim), ty, px(0.003, minDim), trainH);
      }

      // ── Draw user node ──────────────────────────────
      const nodeDrawY = trackY + s.nodeY + s.crushShake;
      const crushScale = s.crushing ? Math.max(0.3, 1 - s.crushFrame / CRUSH_DURATION * 0.7) : 1;

      if (s.sidestepped && s.trainActive) {
        const laneGrad = ctx.createLinearGradient(0, trackY - trainH * 2, 0, trackY + trainH * 2);
        laneGrad.addColorStop(0, rgba(s.primaryRgb, 0));
        laneGrad.addColorStop(0.45, rgba(s.primaryRgb, ALPHA.background.min * 3.2 * entrance));
        laneGrad.addColorStop(0.55, rgba(s.primaryRgb, ALPHA.background.min * 4 * entrance));
        laneGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = laneGrad;
        ctx.fillRect(0, trackY - trainH * 2, w, trainH * 4);

        for (let i = 0; i < 3; i++) {
          const laneY = nodeDrawY - minDim * (0.045 + i * 0.028);
          ctx.beginPath();
          ctx.moveTo(cx, nodeDrawY);
          ctx.lineTo(w * (0.76 + i * 0.07), laneY);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.18 * entrance);
          ctx.lineWidth = px(0.0012, minDim);
          ctx.stroke();
        }
      }

      const nodeGlow = ctx.createRadialGradient(cx, nodeDrawY, 0, cx, nodeDrawY, nodeR * 4);
      nodeGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * entrance));
      nodeGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = nodeGlow;
      ctx.fillRect(cx - nodeR * 4, nodeDrawY - nodeR * 4, nodeR * 8, nodeR * 8);

      ctx.beginPath();
      ctx.arc(cx, nodeDrawY, nodeR * crushScale * (1 + breath * 0.08), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
      ctx.fill();

      // ── Freedom glow when sidestepped ───────────────
      if (s.sidestepped && s.trainActive) {
        const freedomAlpha = ALPHA.glow.min * entrance * (0.5 + 0.5 * Math.sin(s.frameCount * 0.05 * ms));
        const freedomGrad = ctx.createRadialGradient(cx, nodeDrawY, 0, cx, nodeDrawY, minDim * 0.12);
        freedomGrad.addColorStop(0, rgba(s.primaryRgb, freedomAlpha));
        freedomGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = freedomGrad;
        ctx.fillRect(cx - minDim * 0.12, nodeDrawY - minDim * 0.12, minDim * 0.24, minDim * 0.24);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Pointer handlers ──────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.crushing || s.sidestepped) return;
      s.dragActive = true;
      s.dragStartY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragActive) return;
      const dy = s.dragStartY - e.clientY; // positive = moved up
      s.nodeY = -Math.max(0, Math.min(dy, 30)); // clamp upward movement
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.dragActive = false;
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
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ns-resize' }}
      />
    </div>
  );
}
