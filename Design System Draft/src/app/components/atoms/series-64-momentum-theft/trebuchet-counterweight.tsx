/**
 * ATOM 635: THE TREBUCHET ENGINE
 * ================================
 * Series 64 — Momentum Theft · Position 5
 *
 * Convert devastation into flight. Slide the fulcrum to the exact
 * leverage point — crushing weight crashes down and inverted energy
 * launches you in a massive parabolic arc.
 *
 * INTERACTION: Drag (slide fulcrum) → weight crashes → parabolic launch
 * RENDER: Canvas 2D · REDUCED MOTION: Static lever balanced
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

export default function TrebuchetCounterweightAtom({
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
    fulcrumX: 0.5,       // 0→1 along lever
    weightY: 0.1,        // falling weight
    weightFalling: false,
    leverAngle: 0,       // lever rotation
    launched: false,
    launchT: 0,          // parabolic parameter
    launchX: 0, launchY: 0,
    dragging: false,
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

      const leverY = cy + minDim * 0.1;
      const leverLen = minDim * 0.35;
      const weightR = px(0.03, minDim);
      const userR = px(0.012, minDim);

      // ── Weight drop ────────────────────────────────
      if (!p.reducedMotion && !s.completed && s.frameCount > 50 && !s.weightFalling && !s.launched) {
        s.weightFalling = true;
      }

      if (s.weightFalling && !s.launched) {
        s.weightY += 0.005;
        // Impact when weight reaches lever
        if (s.weightY >= 0.55) {
          s.weightFalling = false;
          const leverage = s.fulcrumX; // closer to 1 = more leverage for user side
          if (leverage > 0.6) {
            s.launched = true;
            s.launchT = 0;
            cb.onHaptic('step_advance');
          } else {
            cb.onHaptic('error_boundary');
            s.weightY = 0.1;
            s.respawnTimer = 60;
          }
        }
      }

      // ── Launch parabola ────────────────────────────
      if (s.launched) {
        s.launchT += 0.012;
        s.leverAngle = Math.min(Math.PI * 0.15, s.launchT * Math.PI * 0.15);
        s.launchX = cx + leverLen * 0.4 + s.launchT * minDim * 0.3;
        s.launchY = leverY - Math.sin(s.launchT * Math.PI) * minDim * 0.35;

        if (s.launchT >= 1) {
          s.completed = true;
          cb.onHaptic('completion');
          cb.onStateChange?.(1);
          s.respawnTimer = 90;
        }
      }

      // ── Draw fulcrum ───────────────────────────────
      const fulcrumPx = cx - leverLen * 0.5 + leverLen * s.fulcrumX;
      ctx.beginPath();
      ctx.moveTo(fulcrumPx - px(0.01, minDim), leverY + px(0.015, minDim));
      ctx.lineTo(fulcrumPx + px(0.01, minDim), leverY + px(0.015, minDim));
      ctx.lineTo(fulcrumPx, leverY);
      ctx.closePath();
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
      ctx.fill();

      // ── Draw lever ─────────────────────────────────
      ctx.save();
      ctx.translate(fulcrumPx, leverY);
      ctx.rotate(-s.leverAngle);
      ctx.beginPath();
      ctx.moveTo(-leverLen * s.fulcrumX, 0);
      ctx.lineTo(leverLen * (1 - s.fulcrumX), 0);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
      ctx.lineWidth = px(0.003, minDim);
      ctx.stroke();
      ctx.restore();

      // ── Draw weight (left side) ────────────────────
      const wy = s.weightFalling ? s.weightY * h : leverY - px(0.015, minDim);
      const wx = cx - leverLen * 0.4;
      ctx.beginPath();
      ctx.rect(wx - weightR, wy - weightR, weightR * 2, weightR * 2);
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.7 * entrance);
      ctx.fill();

      // ── Draw user node (right side) ────────────────
      if (!s.launched) {
        const ux = cx + leverLen * 0.4;
        const uy = leverY - userR - px(0.003, minDim);
        ctx.beginPath();
        ctx.arc(ux, uy, userR * (1 + breath * 0.1), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();
      } else if (!s.completed) {
        // Parabolic flight
        const nGlow = ctx.createRadialGradient(s.launchX, s.launchY, 0, s.launchX, s.launchY, userR * 4);
        nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.5 * entrance));
        nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = nGlow;
        ctx.fillRect(s.launchX - userR * 4, s.launchY - userR * 4, userR * 8, userR * 8);

        ctx.beginPath();
        ctx.arc(s.launchX, s.launchY, userR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();
      }

      // ── Fulcrum slider guide ───────────────────────
      if (!s.launched && !s.completed) {
        ctx.beginPath();
        ctx.moveTo(cx - leverLen * 0.5, leverY + px(0.025, minDim));
        ctx.lineTo(cx + leverLen * 0.5, leverY + px(0.025, minDim));
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * entrance);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(fulcrumPx, leverY + px(0.025, minDim), px(0.005, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * entrance);
        ctx.fill();
      }

      // ── Respawn ────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.fulcrumX = 0.5; s.weightY = 0.1; s.weightFalling = false;
          s.leverAngle = 0; s.launched = false; s.launchT = 0;
          s.completed = false;
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
      if (!s.dragging || s.launched || s.completed) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      s.fulcrumX = Math.max(0.2, Math.min(0.8, mx));
      cbRef.current.onStateChange?.(Math.max(0, (s.fulcrumX - 0.5) * 3));
      cbRef.current.onHaptic('drag_snap');
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ew-resize' }} />
    </div>
  );
}
