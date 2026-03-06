/**
 * ATOM 632: THE GRAVITY ASSIST ENGINE
 * =====================================
 * Series 64 — Momentum Theft · Position 2
 *
 * Steal systemic momentum. Ride the outer edge of the terrifying
 * gravity well — orbital slingshot steals rotational momentum
 * launching you at 10x normal speed.
 *
 * INTERACTION: Drag (ride gravity well edge) → slingshot launch
 * RENDER: Canvas 2D · REDUCED MOTION: Static orbital path
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

export default function GravityAssistSlingshotAtom({
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
    nodeAngle: Math.PI,  // orbital angle around black hole
    nodeR: 0.25,         // orbital radius (fraction of minDim)
    orbitProgress: 0,    // 0→1 how far around the orbit
    dragging: false,
    slingshot: false,
    slingshotVx: 0, slingshotVy: 0,
    nodeX: 0, nodeY: 0,
    launchStartX: 0, launchStartY: 0,
    launchCtrlX: 0, launchCtrlY: 0,
    launchEndX: 0, launchEndY: 0,
    corridorAlpha: 0,
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

      const bhR = px(0.03, minDim);
      const userR = px(0.012, minDim);

      // ── Black hole ─────────────────────────────────
      // Swirl rings
      for (let i = 3; i > 0; i--) {
        const ringR = bhR * (2 + i * 1.5);
        const ringAlpha = ALPHA.atmosphere.min * (1 - i * 0.25) * entrance;
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.accentRgb, ringAlpha);
        ctx.lineWidth = px(0.0008, minDim);
        ctx.stroke();
      }

      // Core
      const bhGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, bhR * 2);
      bhGrad.addColorStop(0, rgba(s.accentRgb, ALPHA.content.max * entrance));
      bhGrad.addColorStop(0.5, rgba(s.accentRgb, ALPHA.content.max * 0.5 * entrance));
      bhGrad.addColorStop(1, rgba(s.accentRgb, 0));
      ctx.fillStyle = bhGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, bhR * 2, 0, Math.PI * 2);
      ctx.fill();

      // ── Slingshot physics ──────────────────────────
      if (s.slingshot && !s.completed) {
        s.nodeX += s.slingshotVx;
        s.nodeY += s.slingshotVy;
        s.corridorAlpha = Math.min(1, s.corridorAlpha + 0.025 * ms);
        if (s.nodeX < -0.1 || s.nodeX > 1.1 || s.nodeY < -0.1 || s.nodeY > 1.1) {
          s.completed = true;
          cb.onHaptic('completion');
          cb.onStateChange?.(1);
          s.respawnTimer = 90;
        }
      }

      // ── Orbital path guide ─────────────────────────
      if (!s.slingshot && !s.completed) {
        ctx.beginPath();
        ctx.arc(cx, cy, s.nodeR * minDim, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.5 * entrance);
        ctx.lineWidth = px(0.001, minDim);
        ctx.setLineDash([px(0.005, minDim), px(0.005, minDim)]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ── Escape corridor ───────────────────────────
      if (s.corridorAlpha > 0.01) {
        const startX = s.launchStartX * w;
        const startY = s.launchStartY * h;
        const ctrlX = s.launchCtrlX * w;
        const ctrlY = s.launchCtrlY * h;
        const endX = s.launchEndX * w;
        const endY = s.launchEndY * h;
        const corridorWidth = px(0.018, minDim) * (1 + s.corridorAlpha * 0.4);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.background.max * 0.22 * s.corridorAlpha * entrance);
        ctx.lineWidth = corridorWidth;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.glow.max * 0.35 * s.corridorAlpha * entrance);
        ctx.lineWidth = corridorWidth * 0.35;
        ctx.stroke();

        for (let i = 0; i < 7; i++) {
          const t = i / 6;
          const qx = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * ctrlX + t * t * endX;
          const qy = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * ctrlY + t * t * endY;
          const nodePulse = 0.55 + 0.45 * Math.sin(s.frameCount * 0.08 + i);
          ctx.beginPath();
          ctx.arc(qx, qy, px(0.0035, minDim) * nodePulse, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.12 * s.corridorAlpha * entrance);
          ctx.fill();
        }
      }

      // ── Draw user node ─────────────────────────────
      if (!s.completed) {
        let nx: number, ny: number;
        if (s.slingshot) {
          nx = s.nodeX * w;
          ny = s.nodeY * h;
        } else {
          nx = cx + Math.cos(s.nodeAngle) * s.nodeR * minDim;
          ny = cy + Math.sin(s.nodeAngle) * s.nodeR * minDim;
        }

        const nGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, userR * 4);
        nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * entrance));
        nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = nGlow;
        ctx.fillRect(nx - userR * 4, ny - userR * 4, userR * 8, userR * 8);

        ctx.beginPath();
        ctx.arc(nx, ny, userR * (1 + breath * 0.1), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();

        // Speed trail when slingshot
        if (s.slingshot) {
          ctx.beginPath();
          ctx.moveTo(nx, ny);
          ctx.lineTo(nx - s.slingshotVx * w * 5, ny - s.slingshotVy * h * 5);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * entrance);
          ctx.lineWidth = px(0.001, minDim);
          ctx.stroke();
        }
      }

      // ── Respawn ────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.nodeAngle = Math.PI; s.nodeR = 0.25;
          s.orbitProgress = 0; s.slingshot = false;
          s.nodeX = 0; s.nodeY = 0; s.completed = false;
          s.corridorAlpha = 0;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.slingshot || s.completed) return;
      s.dragging = true;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || s.slingshot) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      const prevAngle = s.nodeAngle;
      s.nodeAngle = Math.atan2(my, mx);
      const dist = Math.sqrt(mx * mx + my * my);
      s.nodeR = Math.max(0.1, Math.min(0.4, dist * 1.5));

      // Track orbit progress
      let delta = s.nodeAngle - prevAngle;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      s.orbitProgress += Math.abs(delta) / (Math.PI * 2);

      cbRef.current.onStateChange?.(Math.min(0.8, s.orbitProgress));
      if (s.orbitProgress > 0.15 && Math.floor(s.orbitProgress * 4) > Math.floor((s.orbitProgress - Math.abs(delta) / (Math.PI * 2)) * 4)) {
        cbRef.current.onHaptic('step_advance');
      }

      // Slingshot when orbit > ~180°
      if (s.orbitProgress >= 0.5) {
        s.slingshot = true;
        s.dragging = false;
        const tangentAngle = s.nodeAngle + Math.PI / 2;
        const speed = 0.015;
        s.slingshotVx = Math.cos(tangentAngle) * speed;
        s.slingshotVy = Math.sin(tangentAngle) * speed;
        s.nodeX = 0.5 + Math.cos(s.nodeAngle) * s.nodeR;
        s.nodeY = 0.5 + Math.sin(s.nodeAngle) * s.nodeR;
        s.launchStartX = s.nodeX;
        s.launchStartY = s.nodeY;
        s.launchCtrlX = 0.5 + Math.cos(s.nodeAngle) * (s.nodeR + 0.1);
        s.launchCtrlY = 0.5 + Math.sin(s.nodeAngle) * (s.nodeR + 0.1);
        s.launchEndX = s.nodeX + Math.cos(tangentAngle) * 0.42;
        s.launchEndY = s.nodeY + Math.sin(tangentAngle) * 0.42;
        s.corridorAlpha = 0.2;
        cbRef.current.onHaptic('drag_snap');
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
