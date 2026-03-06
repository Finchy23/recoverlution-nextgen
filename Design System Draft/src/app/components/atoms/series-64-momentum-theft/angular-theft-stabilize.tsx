/**
 * ATOM 638: THE ANGULAR THEFT ENGINE
 * ====================================
 * Series 64 — Momentum Theft · Position 8
 *
 * Steal the panic spin from the environment. Drag a siphon tether
 * to the spinning perimeter — steal its angular momentum. The UI
 * halts dead. Your core spins as a stabilised gyroscope.
 *
 * INTERACTION: Drag (tether to perimeter) → steal spin → gyroscope
 * RENDER: Canvas 2D · REDUCED MOTION: Static stabilised core
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

export default function AngularTheftStabilizeAtom({
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
    envSpin: 1,          // 1 = full chaotic spin, 0 = halted
    coreSpin: 0,         // 0 = no spin, 1 = gyroscopic
    tethered: false,
    siphonProgress: 0,
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

      // ── Siphon physics ─────────────────────────────
      if (s.tethered && !s.completed && !p.reducedMotion) {
        s.siphonProgress = Math.min(1, s.siphonProgress + 0.005);
        s.envSpin = Math.max(0, 1 - s.siphonProgress);
        s.coreSpin = s.siphonProgress;
        cb.onStateChange?.(s.coreSpin);

        const tier = Math.floor(s.siphonProgress * 5);
        if (tier > s.lastTier) { cb.onHaptic('step_advance'); s.lastTier = tier; }

        if (s.siphonProgress >= 0.98 && !s.completed) {
          s.completed = true;
          cb.onHaptic('completion');
          cb.onStateChange?.(1);
          s.respawnTimer = 100;
        }
      }

      const envAngle = s.frameCount * 0.03 * s.envSpin * ms;
      const coreAngle = s.frameCount * 0.05 * s.coreSpin * ms;

      // ── Draw environment spin ──────────────────────
      const envR = minDim * 0.35;
      for (let i = 0; i < 6; i++) {
        const a = envAngle + (Math.PI * 2 * i) / 6;
        const dx = Math.cos(a) * envR;
        const dy = Math.sin(a) * envR;
        ctx.beginPath();
        ctx.moveTo(cx + dx * 0.3, cy + dy * 0.3);
        ctx.lineTo(cx + dx, cy + dy);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.atmosphere.max * s.envSpin * entrance);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();

        // End particles
        ctx.beginPath();
        ctx.arc(cx + dx, cy + dy, px(0.003, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.atmosphere.max * s.envSpin * entrance);
        ctx.fill();
      }

      // ── Tether line ────────────────────────────────
      if (s.tethered) {
        const tetherAngle = envAngle;
        const tetherEndX = cx + Math.cos(tetherAngle) * envR * 0.7;
        const tetherEndY = cy + Math.sin(tetherAngle) * envR * 0.7;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(tetherEndX, tetherEndY);
        const tetherAlpha = ALPHA.content.max * 0.5 * (1 - s.siphonProgress * 0.5) * entrance;
        ctx.strokeStyle = rgba(s.primaryRgb, tetherAlpha);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();

        // Energy flow particles along tether
        for (let i = 0; i < 3; i++) {
          const pt = ((s.frameCount * 0.03 + i * 0.33) % 1);
          const px2 = tetherEndX + (cx - tetherEndX) * pt;
          const py = tetherEndY + (cy - tetherEndY) * pt;
          ctx.beginPath();
          ctx.arc(px2, py, px(0.002, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
          ctx.fill();
        }
      }

      // ── Draw core ──────────────────────────────────
      const coreR = px(0.025, minDim);

      // Gyroscope rings (visible when spinning)
      if (s.coreSpin > 0.1) {
        for (let i = 0; i < 3; i++) {
          const ringAngle = coreAngle + (Math.PI * 2 * i) / 3;
          ctx.beginPath();
          ctx.ellipse(cx, cy, coreR * 1.5, coreR * 0.4, ringAngle, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * s.coreSpin * entrance);
          ctx.lineWidth = px(0.001, minDim);
          ctx.stroke();
        }
      }

      // Core node
      const cGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 3);
      cGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * entrance));
      cGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = cGlow;
      ctx.fillRect(cx - coreR * 3, cy - coreR * 3, coreR * 6, coreR * 6);

      ctx.beginPath();
      ctx.arc(cx, cy, coreR * (1 + breath * 0.08), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
      ctx.fill();

      // ── Respawn ────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.envSpin = 1; s.coreSpin = 0; s.tethered = false;
          s.siphonProgress = 0; s.completed = false; s.lastTier = 0;
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
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      const dist = Math.sqrt(mx * mx + my * my);
      if (dist < 0.1) {
        s.dragging = true;
        canvas.setPointerCapture(e.pointerId);
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      const dist = Math.sqrt(mx * mx + my * my);
      if (dist > 0.25 && !s.tethered) {
        s.tethered = true;
        s.dragging = false;
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
