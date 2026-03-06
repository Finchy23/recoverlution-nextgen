/**
 * ATOM 636: THE VALVE REDIRECT ENGINE
 * =====================================
 * Series 64 — Momentum Theft · Position 6
 *
 * Turn incoming rage into jet propulsion. Draw a U-shaped pipe —
 * fire blasts in but geometry channels it 180° providing massive
 * continuous thrust directly away from danger.
 *
 * INTERACTION: Draw (U-pipe shape) → fire channeled → jet thrust
 * RENDER: Canvas 2D · REDUCED MOTION: Static pipe with flow
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

export default function ValveRedirectThrustAtom({
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
    pipePts: [] as { x: number; y: number }[],
    drawing: false,
    pipeComplete: false,
    thrustActive: false,
    nodeX: 0.65,
    thrustVx: 0,
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

      const fireOriginX = w * 0.05;
      const nodeR = px(0.012, minDim);

      // ── Fire blast (continuous from left) ──────────
      const fireLen = w * 0.4;
      const fireCount = 8;
      for (let i = 0; i < fireCount; i++) {
        const t = ((s.frameCount * 0.03 + i * 0.125) % 1);
        const fx = fireOriginX + t * fireLen;
        const fy = cy + Math.sin(t * 6 + i) * minDim * 0.01;
        const fSize = px(0.004, minDim) * (1 - t * 0.5);
        ctx.beginPath();
        ctx.arc(fx, fy, fSize, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * (1 - t) * 0.5 * entrance * ms);
        ctx.fill();
      }

      // ── Draw pipe ──────────────────────────────────
      if (s.pipePts.length > 1) {
        ctx.beginPath();
        ctx.moveTo(s.pipePts[0].x, s.pipePts[0].y);
        for (let i = 1; i < s.pipePts.length; i++) {
          ctx.lineTo(s.pipePts[i].x, s.pipePts[i].y);
        }
        const pipeAlpha = s.pipeComplete ? ALPHA.content.max : ALPHA.atmosphere.max;
        ctx.strokeStyle = rgba(s.primaryRgb, pipeAlpha * entrance);
        ctx.lineWidth = px(0.004, minDim);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }

      // ── Thrust physics ─────────────────────────────
      if (s.thrustActive && !s.completed) {
        s.thrustVx += 0.0004;
        s.nodeX += s.thrustVx;
        cb.onStateChange?.(Math.min(1, (s.nodeX - 0.65) / 0.5));

        // Thrust particles
        const nx = s.nodeX * w;
        for (let i = 0; i < 4; i++) {
          const tx = nx - px(0.015, minDim) * (i + 1);
          const ty = cy + (Math.random() - 0.5) * px(0.01, minDim);
          ctx.beginPath();
          ctx.arc(tx, ty, px(0.002, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * (1 - i * 0.2) * entrance);
          ctx.fill();
        }

        if (s.nodeX > 1.15) {
          s.completed = true;
          cb.onHaptic('completion');
          cb.onStateChange?.(1);
          s.respawnTimer = 90;
        }
      }

      // ── Draw user node ─────────────────────────────
      if (!s.completed) {
        const nx = s.nodeX * w;
        const nGlow = ctx.createRadialGradient(nx, cy, 0, nx, cy, nodeR * 4);
        nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * entrance));
        nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = nGlow;
        ctx.fillRect(nx - nodeR * 4, cy - nodeR * 4, nodeR * 8, nodeR * 8);

        ctx.beginPath();
        ctx.arc(nx, cy, nodeR * (1 + breath * 0.1), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();
      }

      // ── Respawn ────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.pipePts = []; s.pipeComplete = false; s.thrustActive = false;
          s.nodeX = 0.65; s.thrustVx = 0; s.completed = false;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.pipeComplete || s.completed) return;
      s.drawing = true;
      s.pipePts = [];
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (viewport.width / rect.width);
      const my = (e.clientY - rect.top) * (viewport.height / rect.height);
      s.pipePts.push({ x: mx, y: my });
      canvas.setPointerCapture(e.pointerId);
      cbRef.current.onHaptic('drag_snap');
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.drawing) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (viewport.width / rect.width);
      const my = (e.clientY - rect.top) * (viewport.height / rect.height);
      s.pipePts.push({ x: mx, y: my });
      cbRef.current.onStateChange?.(Math.min(0.5, s.pipePts.length / 30));
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      s.drawing = false;
      canvas.releasePointerCapture(e.pointerId);
      if (s.pipePts.length > 10) {
        s.pipeComplete = true;
        s.thrustActive = true;
        cbRef.current.onHaptic('step_advance');
      }
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} />
    </div>
  );
}
