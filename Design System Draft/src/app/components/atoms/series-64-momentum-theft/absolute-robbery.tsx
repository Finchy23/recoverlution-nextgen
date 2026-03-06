/**
 * ATOM 640: THE ABSOLUTE ROBBERY ENGINE
 * =======================================
 * Series 64 — Momentum Theft · Position 10
 *
 * The apex: you never need to generate your own energy when your
 * opponents supply it. Five threats collide with your held core.
 * Absolute silence. They freeze drained. Your core glows with
 * the combined power of the entire board.
 *
 * INTERACTION: Hold (center) → five-vector absorption → seal
 * RENDER: Canvas 2D · REDUCED MOTION: Static glowing core
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

interface Threat {
  angle: number;
  dist: number;
  speed: number;
  frozen: boolean;
}

export default function AbsoluteRobberyAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const createThreats = (): Threat[] => {
    return Array.from({ length: 5 }, (_, i) => ({
      angle: (Math.PI * 2 * i) / 5 + Math.random() * 0.3,
      dist: 0.45 + Math.random() * 0.05,
      speed: 0.0015 + Math.random() * 0.001,
      frozen: false,
    }));
  };

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    threats: createThreats(),
    holding: false,
    absorbed: 0,
    corePower: 0,
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

      const coreR = px(0.02, minDim);
      const threatR = px(0.02, minDim);

      // ── Threat physics ─────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        for (const t of s.threats) {
          if (!t.frozen) {
            t.dist -= t.speed;
            if (t.dist <= 0.05 && s.holding) {
              t.frozen = true;
              s.absorbed++;
              cb.onHaptic('step_advance');
              cb.onStateChange?.(s.absorbed / 5);

              if (s.absorbed >= 5) {
                s.corePower = 1;
                s.completed = true;
                cb.onHaptic('seal_stamp');
                cb.onStateChange?.(1);
                s.respawnTimer = 120;
              }
            }
          }
        }
      }

      // ── Draw threats ───────────────────────────────
      for (const t of s.threats) {
        const tx = cx + Math.cos(t.angle) * t.dist * minDim;
        const ty = cy + Math.sin(t.angle) * t.dist * minDim;
        const shake = t.frozen ? 0 : Math.sin(s.frameCount * 0.15 * ms + t.angle) * px(0.002, minDim);

        ctx.beginPath();
        ctx.arc(tx + shake, ty, threatR * (t.frozen ? 0.7 : 1), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, (t.frozen ? ALPHA.atmosphere.min : ALPHA.content.max) * entrance);
        ctx.fill();

        if (!t.frozen) {
          // Speed trail
          const tailX = cx + Math.cos(t.angle) * (t.dist + 0.03) * minDim;
          const tailY = cy + Math.sin(t.angle) * (t.dist + 0.03) * minDim;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(tailX, tailY);
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.atmosphere.max * 0.5 * entrance);
          ctx.lineWidth = px(0.001, minDim);
          ctx.stroke();
        }
      }

      // ── Draw core ──────────────────────────────────
      const power = s.corePower;
      const finalR = coreR * (1 + power * 2 + breath * 0.08);

      // Power glow
      if (power > 0 || s.absorbed > 0) {
        const glowIntensity = Math.max(power, s.absorbed / 5);
        const gGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.2 * glowIntensity);
        gGlow.addColorStop(0, rgba([255, 255, 255] as RGB, ALPHA.glow.max * 0.5 * glowIntensity * entrance));
        gGlow.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * glowIntensity * entrance));
        gGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gGlow;
        ctx.fillRect(cx - minDim * 0.2, cy - minDim * 0.2, minDim * 0.4, minDim * 0.4);
      }

      ctx.beginPath();
      ctx.arc(cx, cy, finalR, 0, Math.PI * 2);
      const coreColor = power > 0.5
        ? lerpColor(s.primaryRgb, [255, 255, 255] as RGB, (power - 0.5) * 2)
        : s.primaryRgb;
      ctx.fillStyle = rgba(coreColor, ALPHA.content.max * entrance);
      ctx.fill();

      // ── Hold indicator ─────────────────────────────
      if (s.holding && !s.completed) {
        ctx.beginPath();
        ctx.arc(cx, cy, coreR * 2.5, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * entrance);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();
      }

      // ── Respawn ────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.threats = createThreats();
          s.absorbed = 0; s.corePower = 0; s.completed = false;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      stateRef.current.holding = true;
      canvas.setPointerCapture(e.pointerId);
      cbRef.current.onHaptic('hold_start');
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.holding = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
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
