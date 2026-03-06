/**
 * ATOM 202: THE FOCAL GLASS ENGINE
 * ====================================
 * Series 21 — Metacognitive Mirror · Position 2
 *
 * Shift focus from the content of the thought to the container holding it —
 * the window, not the storm. Hold the glass to blur the chaos and bring
 * the calm frame into sharp crystalline focus.
 *
 * PHYSICS:
 *   - Aggressive chaotic particles swarm inside a container frame
 *   - Hold finger on glass → depth-of-field shifts
 *   - Particles blur into soft bokeh while the frame sharpens
 *   - Resolution: the container is pristine, content is harmless fog
 *
 * INTERACTION:
 *   Hold → progressive depth-of-field shift
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static blurred state at 50%
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, SIZE,
  type RGB,
} from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const PARTICLE_COUNT = 40;
const HOLD_RATE = 0.008;
const RELEASE_RATE = 0.012;
const FRAME_CORNER_R = 0.02;

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  hue: number; // 0 = primary, 1 = accent
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function FocalGlassAtom({
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
    // Focus shift: 0 = content sharp (chaos), 1 = container sharp (calm)
    focusShift: 0,
    holding: false,
    completed: false,
    holdNotified: false,
    thresholdNotified: false,
    // Particles
    particles: [] as Particle[],
    initialized: false,
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
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      if (!p.composed) {
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      }

      // ── Initialize particles ──────────────────────────
      if (!s.initialized) {
        s.particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          s.particles.push({
            x: 0.2 + Math.random() * 0.6,
            y: 0.2 + Math.random() * 0.6,
            vx: (Math.random() - 0.5) * 0.004,
            vy: (Math.random() - 0.5) * 0.004,
            r: 0.003 + Math.random() * 0.005,
            hue: Math.random() > 0.5 ? 1 : 0,
          });
        }
        s.initialized = true;
      }

      // ── Focus shift physics ───────────────────────────
      if (s.holding || p.phase === 'resolve') {
        s.focusShift = Math.min(1, s.focusShift + HOLD_RATE);
      } else if (!s.completed) {
        s.focusShift = Math.max(0, s.focusShift - RELEASE_RATE);
      }

      // Threshold haptic at 50%
      if (s.focusShift >= 0.5 && !s.thresholdNotified) {
        s.thresholdNotified = true;
        cb.onHaptic('hold_threshold');
      }

      // Completion
      if (s.focusShift >= 0.98 && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }

      cb.onStateChange?.(s.focusShift);

      const blur = easeOutCubic(s.focusShift);

      // ── Container frame dimensions ────────────────────
      const frameW = w * 0.6;
      const frameH = h * 0.5;
      const frameX = cx - frameW / 2;
      const frameY = cy - frameH / 2;
      const cornerR = px(FRAME_CORNER_R, minDim);

      // ── Update & draw particles ───────────────────────
      const particleBlur = blur; // particles get blurrier
      for (const pt of s.particles) {
        // Move particles
        if (!p.reducedMotion) {
          pt.x += pt.vx * ms * (1 - blur * 0.7);
          pt.y += pt.vy * ms * (1 - blur * 0.7);
          // Agitated jitter (decreases with focus shift)
          pt.vx += (Math.random() - 0.5) * 0.0008 * (1 - blur * 0.8);
          pt.vy += (Math.random() - 0.5) * 0.0008 * (1 - blur * 0.8);
          // Damping
          pt.vx *= 0.98;
          pt.vy *= 0.98;
          // Bounce inside frame
          if (pt.x < 0.18 || pt.x > 0.82) pt.vx *= -1;
          if (pt.y < 0.18 || pt.y > 0.82) pt.vy *= -1;
          pt.x = Math.max(0.15, Math.min(0.85, pt.x));
          pt.y = Math.max(0.15, Math.min(0.85, pt.y));
        }

        const ptX = pt.x * w;
        const ptY = pt.y * h;
        const ptR = px(pt.r, minDim);
        const ptColor: RGB = pt.hue === 0 ? s.primaryRgb : s.accentRgb;

        // As blur increases, particles become larger soft bokeh circles
        const bokehR = ptR * (1 + particleBlur * 4);
        const alpha = ALPHA.content.max * entrance * (1 - particleBlur * 0.7);

        const grad = ctx.createRadialGradient(ptX, ptY, 0, ptX, ptY, bokehR);
        grad.addColorStop(0, rgba(ptColor, alpha * (1 - particleBlur * 0.5)));
        grad.addColorStop(0.4 + particleBlur * 0.4, rgba(ptColor, alpha * 0.3));
        grad.addColorStop(1, rgba(ptColor, 0));
        ctx.fillStyle = grad;
        ctx.fillRect(ptX - bokehR, ptY - bokehR, bokehR * 2, bokehR * 2);
      }

      // ── Container frame (sharpens with focus shift) ───
      const frameAlpha = ALPHA.content.max * (0.15 + blur * 0.7) * entrance;
      const frameWidth = px(0.001 + blur * 0.003, minDim);

      ctx.beginPath();
      ctx.roundRect(frameX, frameY, frameW, frameH, cornerR);
      ctx.strokeStyle = rgba(s.primaryRgb, frameAlpha);
      ctx.lineWidth = frameWidth;
      ctx.stroke();

      // Inner glow on frame when sharp
      if (blur > 0.3) {
        const innerGlowAlpha = ALPHA.glow.max * 0.3 * (blur - 0.3) / 0.7 * entrance;
        ctx.shadowColor = rgba(s.primaryRgb, innerGlowAlpha);
        ctx.shadowBlur = px(0.01, minDim);
        ctx.beginPath();
        ctx.roundRect(frameX, frameY, frameW, frameH, cornerR);
        ctx.strokeStyle = rgba(s.primaryRgb, innerGlowAlpha);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();
        ctx.shadowColor = 'rgba(0,0,0,0)';
        ctx.shadowBlur = 0;
      }

      // Corner accents (crystallize with focus)
      if (blur > 0.2) {
        const accentAlpha = ALPHA.content.max * 0.6 * Math.min(1, (blur - 0.2) / 0.5) * entrance;
        const accentLen = px(0.03, minDim);
        ctx.strokeStyle = rgba(s.accentRgb, accentAlpha);
        ctx.lineWidth = px(0.002, minDim);

        // Four corners
        const corners = [
          [frameX, frameY], [frameX + frameW, frameY],
          [frameX + frameW, frameY + frameH], [frameX, frameY + frameH],
        ];
        const dirs = [[1, 1], [-1, 1], [-1, -1], [1, -1]];

        for (let i = 0; i < 4; i++) {
          const [cxp, cyp] = corners[i];
          const [dx, dy] = dirs[i];
          ctx.beginPath();
          ctx.moveTo(cxp, cyp + dy * accentLen);
          ctx.lineTo(cxp, cyp);
          ctx.lineTo(cxp + dx * accentLen, cyp);
          ctx.stroke();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Pointer handlers ──────────────────────────────
    const onDown = () => {
      const s = stateRef.current;
      if (s.completed) return;
      s.holding = true;
      if (!s.holdNotified) {
        s.holdNotified = true;
        callbacksRef.current.onHaptic('hold_start');
      }
    };

    const onUp = () => {
      stateRef.current.holding = false;
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
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }}
      />
    </div>
  );
}
