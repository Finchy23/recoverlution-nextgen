/**
 * ATOM 120: THE KINETIC SEAL
 * ============================
 * Series 12 — Friction Mechanics · Position 10
 *
 * An infinitely looping kinetic sculpture. One final tap
 * locks it into mathematically perfect eternal motion.
 *
 * PHYSICS: Perpetual motion, pendulum physics, frictionless orbiting
 * INTERACTION: Tap to set in motion
 * RENDER: Canvas 2D
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB,
} from '../atom-utils';

const ORB_COUNT = 5;

export default function KineticSealAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    activated: false,
    activateAnim: 0,
    completionFired: false,
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
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      const baseC = s.primaryRgb;
      const accentC = s.accentRgb;

      if (s.activated) s.activateAnim = Math.min(1, s.activateAnim + 0.01);
      const aa = easeOutCubic(s.activateAnim);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Orbit radius
      const orbitR = minDim * 0.15;
      const speed = s.activated ? 0.02 + aa * 0.02 : 0.003;

      // Draw orbit path
      ctx.beginPath();
      ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.tertiary.max * entrance);
      ctx.lineWidth = minDim * 0.0006;
      ctx.stroke();

      // Orbs
      for (let i = 0; i < ORB_COUNT; i++) {
        const offset = (i / ORB_COUNT) * Math.PI * 2;
        const angle = (p.reducedMotion ? 0 : s.frameCount * speed) + offset;
        const orbR = minDim * (0.008 + aa * 0.004);
        const ox = cx + Math.cos(angle) * orbitR;
        const oy = cy + Math.sin(angle) * orbitR;
        const t = i / (ORB_COUNT - 1);
        const orbColor = lerpColor(baseC, accentC, t * 0.8 * (0.3 + aa * 0.7));

        // Trail
        if (s.activated && !p.reducedMotion) {
          const trailLen = 8;
          for (let j = 1; j <= trailLen; j++) {
            const ta = angle - j * speed * 2;
            const tx = cx + Math.cos(ta) * orbitR;
            const ty = cy + Math.sin(ta) * orbitR;
            const tAlpha = (1 - j / trailLen) * ELEMENT_ALPHA.secondary.max * entrance * aa;
            ctx.beginPath();
            ctx.arc(tx, ty, orbR * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = rgba(orbColor, tAlpha);
            ctx.fill();
          }
        }

        ctx.beginPath();
        ctx.arc(ox, oy, orbR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(orbColor, ELEMENT_ALPHA.primary.max * (1 + aa) * entrance);
        ctx.fill();
      }

      // Center hub
      ctx.beginPath();
      ctx.arc(cx, cy, minDim * 0.01, 0, Math.PI * 2);
      ctx.fillStyle = rgba(lerpColor(baseC, accentC, aa * 0.5), ELEMENT_ALPHA.primary.max * entrance);
      ctx.fill();

      // Glow when active
      if (aa > 0.5) {
        const actGlowR = minDim * 0.08 * (aa - 0.5) * 2;
        const agGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, actGlowR);
        agGrad.addColorStop(0, rgba(accentC, ELEMENT_ALPHA.glow.max * entrance * (aa - 0.5) * 2));
        agGrad.addColorStop(1, rgba(accentC, 0));
        ctx.fillStyle = agGrad;
        ctx.fillRect(cx - actGlowR, cy - actGlowR, actGlowR * 2, actGlowR * 2);
      }

      // Prompt
      if (!s.activated) {
        const fs = Math.max(8, minDim * 0.013);
        ctx.font = `${fs}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance * (0.5 + Math.sin(s.frameCount * 0.03 * ms) * 0.3));
        ctx.fillText('Tap to set in motion', cx, cy + orbitR + minDim * 0.06);
      }

      if (s.activateAnim >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('seal_stamp');
        cb.onResolve?.();
      }

      cb.onStateChange?.(aa);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (_e: PointerEvent) => {
      if (!stateRef.current.activated) {
        stateRef.current.activated = true;
        cbRef.current.onHaptic('tap');
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}