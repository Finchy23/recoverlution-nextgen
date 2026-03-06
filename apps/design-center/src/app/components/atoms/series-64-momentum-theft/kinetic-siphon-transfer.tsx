/**
 * ATOM 631: THE KINETIC SIPHON ENGINE
 * =====================================
 * Series 64 — Momentum Theft · Position 1
 *
 * Cure freeze-panic. Align in the exact impact path — perfect
 * elastic collision transfers 100% of threat velocity to you.
 * The attacker freezes dead. You launch at maximum speed.
 *
 * INTERACTION: Drag (align in path) → elastic collision → launch
 * RENDER: Canvas 2D · REDUCED MOTION: Static transfer diagram
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

export default function KineticSiphonTransferAtom({
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
    threatY: -0.05,
    threatVy: 0.004,
    threatFrozen: false,
    userX: 0.5, userY: 0.7,
    userVy: 0,
    launched: false,
    dragging: false,
    aligned: false,
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

      const threatR = px(0.035, minDim);
      const userR = px(0.012, minDim);

      // ── Threat physics ─────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        if (!s.threatFrozen) {
          s.threatY += s.threatVy;

          // Collision check
          const threatPx = cy * 0.3 + s.threatY * h;
          const userPx = s.userY * h;
          const dx = Math.abs(s.userX * w - cx);
          const dy = Math.abs(threatPx - userPx);

          if (dy < threatR + userR && dx < threatR) {
            if (dx < threatR * 0.5) {
              // Perfect alignment — elastic transfer!
              s.threatFrozen = true;
              s.launched = true;
              s.userVy = -(s.threatVy * 2.5);
              cb.onHaptic('drag_snap');
              s.aligned = true;
            }
          }
        }

        if (s.launched) {
          s.userY += s.userVy;
          s.userVy *= 0.995;
          if (s.userY < -0.1) {
            s.completed = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = 90;
          }
        }
      }

      // ── Draw threat ────────────────────────────────
      if (!s.completed) {
        const ty = cy * 0.3 + s.threatY * h;
        const shake = s.threatFrozen ? 0 : Math.sin(s.frameCount * 0.15 * ms) * px(0.002, minDim);
        ctx.beginPath();
        ctx.arc(cx + shake, ty, threatR, 0, Math.PI * 2);
        const tAlpha = s.threatFrozen ? ALPHA.content.max * 0.3 : ALPHA.content.max;
        ctx.fillStyle = rgba(s.accentRgb, tAlpha * entrance);
        ctx.fill();

        if (!s.threatFrozen) {
          const tGlow = ctx.createRadialGradient(cx, ty, threatR, cx, ty, threatR * 2.5);
          tGlow.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.3 * entrance));
          tGlow.addColorStop(1, rgba(s.accentRgb, 0));
          ctx.fillStyle = tGlow;
          ctx.fillRect(cx - threatR * 2.5, ty - threatR * 2.5, threatR * 5, threatR * 5);
        }
      }

      // ── Draw user node ─────────────────────────────
      if (!s.completed || s.respawnTimer > 60) {
        const ux = s.userX * w;
        const uy = s.userY * h;

        // Speed lines
        if (s.launched && s.userVy < -0.003) {
          for (let i = 0; i < 4; i++) {
            const lx = ux + (i - 1.5) * px(0.006, minDim);
            ctx.beginPath();
            ctx.moveTo(lx, uy + userR);
            ctx.lineTo(lx, uy + userR + minDim * 0.04);
            ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * entrance * (1 - i * 0.2));
            ctx.lineWidth = px(0.001, minDim);
            ctx.stroke();
          }
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

      // ── Transfer column ───────────────────────────
      if (s.launched || s.aligned) {
        const frozenY = cy * 0.3 + s.threatY * h;
        const columnTop = Math.max(0, frozenY - minDim * 0.22);
        const columnBottom = h * 0.88;
        const columnW = px(0.028, minDim);
        const siphonAlpha = (s.launched ? 1 : 0.55) * entrance;

        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.max * 0.16 * siphonAlpha);
        ctx.fillRect(cx - columnW * 0.5, columnTop, columnW, columnBottom - columnTop);

        ctx.beginPath();
        ctx.moveTo(cx, columnTop);
        ctx.lineTo(cx, columnBottom);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.glow.max * 0.28 * siphonAlpha);
        ctx.lineWidth = px(0.0032, minDim);
        ctx.stroke();

        for (let i = 0; i < 5; i++) {
          const t = ((s.frameCount * 0.018) + i * 0.19) % 1;
          const py = columnBottom + (columnTop - columnBottom) * t;
          ctx.beginPath();
          ctx.arc(cx, py, px(0.0032, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.14 * siphonAlpha);
          ctx.fill();
        }
      }

      // ── Alignment guide ────────────────────────────
      if (!s.launched && !s.completed) {
        ctx.setLineDash([px(0.004, minDim), px(0.004, minDim)]);
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, h);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.5 * entrance);
        ctx.lineWidth = px(0.0008, minDim);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ── Respawn ────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.threatY = -0.05; s.threatVy = 0.004; s.threatFrozen = false;
          s.userX = 0.5; s.userY = 0.7; s.userVy = 0;
          s.launched = false; s.aligned = false; s.completed = false;
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
      if (!s.dragging || s.launched) return;
      const rect = canvas.getBoundingClientRect();
      s.userX = (e.clientX - rect.left) / rect.width;
      cbRef.current.onStateChange?.(1 - Math.abs(s.userX - 0.5) * 4);
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
