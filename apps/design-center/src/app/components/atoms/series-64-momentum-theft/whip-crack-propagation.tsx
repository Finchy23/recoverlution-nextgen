/**
 * ATOM 637: THE WHIP CRACK ENGINE
 * =================================
 * Series 64 — Momentum Theft · Position 7
 *
 * Let slow bureaucratic waves do the work. Relax all input as the
 * heavy slow wave reaches the tether tip — physics compresses
 * energy into a microscopic point snapping you forward at supersonic.
 *
 * INTERACTION: Observe (don't fight the wave) → supersonic snap
 * RENDER: Canvas 2D · REDUCED MOTION: Static whip shape
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

export default function WhipCrackPropagationAtom({
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
    waveT: 0,            // 0→1 wave position along tether
    snapped: false,
    snapVx: 0,
    nodeX: 0.85,
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

      const tetherStart = w * 0.08;
      const tetherEnd = w * 0.85;
      const tetherLen = tetherEnd - tetherStart;
      const nodeR = px(0.012, minDim);

      // ── Wave propagation ───────────────────────────
      if (!p.reducedMotion && !s.snapped && !s.completed) {
        s.waveT += 0.002;
        cb.onStateChange?.(s.waveT * 0.7);

        const tier = Math.floor(s.waveT * 5);
        if (tier > s.lastTier) { cb.onHaptic('step_advance'); s.lastTier = tier; }

        if (s.waveT >= 0.95) {
          s.snapped = true;
          s.snapVx = 0.025;
          cb.onHaptic('completion');
        }
      }

      if (s.snapped && !s.completed) {
        s.nodeX += s.snapVx;
        if (s.nodeX > 1.2) {
          s.completed = true;
          cb.onStateChange?.(1);
          s.respawnTimer = 90;
        }
      }

      // ── Draw tether ────────────────────────────────
      const segments = 40;
      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = tetherStart + t * tetherLen;
        // Wave: thick at start, thin at propagation point
        const thickness = 1 - t * 0.8; // thicker at start
        const waveAmp = minDim * 0.03 * thickness;
        // Wave travels along tether
        const wavePhase = t - s.waveT;
        const waveY = wavePhase > -0.15 && wavePhase < 0.15
          ? Math.sin(wavePhase / 0.15 * Math.PI) * waveAmp * (1 + (1 - thickness) * 3) * ms
          : 0;
        const y = cy + waveY;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      const tetherColor = lerpColor(s.accentRgb, s.primaryRgb, s.waveT);
      ctx.strokeStyle = rgba(tetherColor, ALPHA.content.max * entrance);
      ctx.lineWidth = px(0.002, minDim);
      ctx.stroke();

      // ── Tether thickness visualization ─────────────
      if (!s.snapped) {
        for (let i = 0; i < 5; i++) {
          const t = i / 5;
          const x = tetherStart + t * tetherLen;
          const thick = (1 - t * 0.8) * px(0.004, minDim);
          ctx.beginPath();
          ctx.arc(x, cy, thick, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * entrance);
          ctx.fill();
        }
      }

      // ── Wave front glow ────────────────────────────
      if (!s.snapped && s.waveT > 0.05) {
        const wfX = tetherStart + s.waveT * tetherLen;
        const wfGlow = ctx.createRadialGradient(wfX, cy, 0, wfX, cy, minDim * 0.04);
        wfGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * entrance));
        wfGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = wfGlow;
        ctx.fillRect(wfX - minDim * 0.04, cy - minDim * 0.04, minDim * 0.08, minDim * 0.08);
      }

      // ── Draw node ──────────────────────────────────
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
          s.waveT = 0; s.snapped = false; s.snapVx = 0;
          s.nodeX = 0.85; s.completed = false; s.lastTier = 0;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(animId); };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} />
    </div>
  );
}
