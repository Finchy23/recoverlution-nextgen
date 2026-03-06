/**
 * ATOM 633: THE INELASTIC LATCH ENGINE
 * ======================================
 * Series 64 — Momentum Theft · Position 3
 *
 * Ride existing waves. Time an upward swipe to fuse your node
 * onto the side of the passing high-speed train — permanently
 * inherit its massive velocity for a free ride.
 *
 * INTERACTION: Swipe (upward, timed) → latch onto train → ride
 * RENDER: Canvas 2D · REDUCED MOTION: Static fused node on train
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

export default function InelasticLatchFuseAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    trainX: -0.3,       // fraction
    trainSpeed: 0.005,
    userX: 0.5, userY: 0.75,
    latched: false,
    swiping: false, swipeStartY: 0,
    completed: false, respawnTimer: 0,
  });

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
      const breath = p.breathAmplitude;
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const trainY = cy - minDim * 0.05;
      const trainW = minDim * 0.2;
      const trainH = minDim * 0.04;
      const userR = px(0.012, minDim);

      // ── Train physics ──────────────────────────────
      if (!p.reducedMotion) {
        s.trainX += s.trainSpeed;
        if (s.trainX > 1.3) {
          if (s.latched && !s.completed) {
            s.completed = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = 90;
          }
          if (!s.latched) {
            s.trainX = -0.3;
          }
        }

        if (s.latched) {
          s.userX = s.trainX + 0.02;
          s.userY = (trainY + trainH) / h;
        }
      }

      // ── Draw track ─────────────────────────────────
      ctx.beginPath();
      ctx.moveTo(0, trainY + trainH + px(0.003, minDim));
      ctx.lineTo(w, trainY + trainH + px(0.003, minDim));
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * entrance);
      ctx.lineWidth = px(0.001, minDim);
      ctx.stroke();

      // ── Draw train ─────────────────────────────────
      const tx = s.trainX * w;
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.6 * entrance);
      ctx.fillRect(tx - trainW / 2, trainY, trainW, trainH);

      // Train detail lines
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance);
      ctx.lineWidth = px(0.0008, minDim);
      for (let i = 0; i < 3; i++) {
        const lx = tx - trainW * 0.3 + i * trainW * 0.3;
        ctx.beginPath();
        ctx.moveTo(lx, trainY);
        ctx.lineTo(lx, trainY + trainH);
        ctx.stroke();
      }

      // ── Draw user node ─────────────────────────────
      const ux = s.userX * w;
      const uy = s.userY * h;

      const nGlow = ctx.createRadialGradient(ux, uy, 0, ux, uy, userR * 3);
      nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
      nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = nGlow;
      ctx.fillRect(ux - userR * 3, uy - userR * 3, userR * 6, userR * 6);

      ctx.beginPath();
      ctx.arc(ux, uy, userR * (1 + breath * 0.1), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
      ctx.fill();

      // Latch indicator
      if (s.latched) {
        ctx.beginPath();
        ctx.moveTo(ux, uy - userR);
        ctx.lineTo(ux, trainY + trainH);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * entrance);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();
      }

      // ── Respawn ────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.trainX = -0.3; s.userX = 0.5; s.userY = 0.75;
          s.latched = false; s.completed = false;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      stateRef.current.swiping = true;
      stateRef.current.swipeStartY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.swiping || s.latched) return;
      const dy = s.swipeStartY - e.clientY;
      if (dy > 30) {
        // Upward swipe — check timing
        const trainPx = s.trainX * viewport.width;
        const userPx = s.userX * viewport.width;
        if (Math.abs(trainPx - userPx) < viewport.width * 0.15) {
          s.latched = true;
          s.swiping = false;
          cbRef.current.onHaptic('swipe_commit');
          cbRef.current.onStateChange?.(0.5);
        }
      }
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.swiping = false;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
