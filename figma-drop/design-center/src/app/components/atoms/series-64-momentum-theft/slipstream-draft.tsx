/**
 * ATOM 639: THE SLIPSTREAM DRAFT ENGINE
 * =======================================
 * Series 64 — Momentum Theft · Position 9
 *
 * Prove the hard way is optional. Position directly behind the
 * massive object carving through dense friction — inside the
 * slipstream pocket friction drops to zero, max speed, zero effort.
 *
 * INTERACTION: Drag (position behind object) → slipstream ride
 * RENDER: Canvas 2D · REDUCED MOTION: Static drafting position
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

export default function SlipstreamDraftAtom({
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
    leaderX: 0.2,
    userX: 0.5, userY: 0.5,
    inSlipstream: false,
    draftTime: 0,        // how long in slipstream
    dragging: false,
    completed: false, respawnTimer: 0, lastTier: 0,
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

      const leaderR = px(0.04, minDim);
      const userR = px(0.012, minDim);
      const speed = 0.002;

      // ── Leader movement ────────────────────────────
      if (!p.reducedMotion) {
        s.leaderX += speed;
        if (s.leaderX > 1.2) s.leaderX = -0.1;

        // User follows in slipstream
        if (s.inSlipstream) {
          s.userX = s.leaderX - 0.08;
          s.userY = 0.5;
          s.draftTime += 1;
          cb.onStateChange?.(Math.min(1, s.draftTime / 180));

          const tier = Math.floor(s.draftTime / 40);
          if (tier > s.lastTier) { cb.onHaptic('step_advance'); s.lastTier = tier; }

          if (s.draftTime >= 180 && !s.completed) {
            s.completed = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = 90;
          }
        }
      }

      // ── Friction particles (dense medium) ──────────
      for (let i = 0; i < 15; i++) {
        const px2 = ((s.frameCount * 1.5 + i * 73) % (w + 40)) - 20;
        const py = h * 0.15 + ((i * 53) % (h * 0.7));
        ctx.beginPath();
        ctx.moveTo(px2, py);
        ctx.lineTo(px2 - minDim * 0.01, py);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.atmosphere.min * 0.5 * entrance * ms);
        ctx.lineWidth = px(0.0005, minDim);
        ctx.stroke();
      }

      // ── Slipstream pocket (V-shape behind leader) ──
      const lx = s.leaderX * w;
      const ly = cy;
      if (s.inSlipstream || s.draftTime > 0) {
        ctx.beginPath();
        ctx.moveTo(lx - leaderR, ly - leaderR * 0.8);
        ctx.lineTo(lx - leaderR * 6, ly - minDim * 0.06);
        ctx.lineTo(lx - leaderR * 6, ly + minDim * 0.06);
        ctx.lineTo(lx - leaderR, ly + leaderR * 0.8);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 0.5 * entrance);
        ctx.fill();
      }

      // ── Draw leader ────────────────────────────────
      ctx.beginPath();
      ctx.arc(lx, ly, leaderR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.6 * entrance);
      ctx.fill();

      // ── Draw user ──────────────────────────────────
      if (!s.completed) {
        const ux = s.userX * w;
        const uy = s.userY * h;

        // Friction indicator (absent in slipstream)
        if (!s.inSlipstream) {
          const frictionAlpha = ALPHA.atmosphere.min * entrance;
          ctx.beginPath();
          ctx.arc(ux, uy, userR * 3, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.accentRgb, frictionAlpha);
          ctx.lineWidth = px(0.001, minDim);
          ctx.stroke();
        }

        const nGlow = ctx.createRadialGradient(ux, uy, 0, ux, uy, userR * 4);
        nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * entrance));
        nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = nGlow;
        ctx.fillRect(ux - userR * 4, uy - userR * 4, userR * 8, userR * 8);

        ctx.beginPath();
        ctx.arc(ux, uy, userR * (1 + breath * 0.1), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();
      }

      // ── Respawn ────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.leaderX = 0.2; s.userX = 0.5; s.userY = 0.5;
          s.inSlipstream = false; s.draftTime = 0;
          s.completed = false; s.lastTier = 0;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || s.completed) return;
      const rect = canvas.getBoundingClientRect();
      if (!s.inSlipstream) {
        s.userX = (e.clientX - rect.left) / rect.width;
        s.userY = (e.clientY - rect.top) / rect.height;
        // Check if in slipstream pocket
        const dx = s.userX - s.leaderX;
        const dy = s.userY - 0.5;
        if (dx < -0.03 && dx > -0.15 && Math.abs(dy) < 0.1) {
          s.inSlipstream = true;
          s.dragging = false;
          cbRef.current.onHaptic('drag_snap');
        }
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
