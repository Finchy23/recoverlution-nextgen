/**
 * ATOM 115: THE FLYWHEEL ENGINE
 * ===============================
 * Series 12 — Friction Mechanics · Position 5
 *
 * A massive gyroscope slowing down, wobbling violently.
 * One perfectly timed swipe corrects it into infinite blur.
 *
 * PHYSICS: Rotational momentum, angular velocity decay, gyroscopic stabilization
 * INTERACTION: Swipe at the right moment to stabilize
 * RENDER: Canvas 2D
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB,
} from '../atom-utils';

export default function FlywheelAtom({
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
    angle: 0,
    speed: 0.02, // starts slow and wobbling
    wobble: 0.8, // wobble intensity
    stabilized: false,
    stabilizeAnim: 0,
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

      // Rotation
      if (!p.reducedMotion) {
        s.angle += s.speed;
      }

      // Stabilization
      if (s.stabilized) {
        s.stabilizeAnim = Math.min(1, s.stabilizeAnim + 0.02);
        const sa = easeOutCubic(s.stabilizeAnim);
        s.wobble *= 0.95;
        s.speed = 0.02 + sa * 0.12; // speeds up to perfect spin
      } else {
        // Decay
        s.speed *= 0.9998;
        if (s.speed < 0.005) s.speed = 0.005;
      }

      const wb = s.wobble;

      // Background
      const glowR = minDim * (0.35 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Wobble offset
      const wobbleX = !p.reducedMotion ? Math.sin(s.frameCount * 0.07 * ms) * minDim * 0.015 * wb : 0;
      const wobbleY = !p.reducedMotion ? Math.cos(s.frameCount * 0.09 * ms) * minDim * 0.01 * wb : 0;

      const fcx = cx + wobbleX;
      const fcy = cy + wobbleY;
      const wheelR = minDim * 0.18;
      const wheelColor = s.stabilized
        ? lerpColor(baseC, accentC, easeOutCubic(s.stabilizeAnim) * 0.7)
        : baseC;

      // Draw flywheel
      ctx.save();
      ctx.translate(fcx, fcy);
      ctx.rotate(s.angle);

      // Outer ring
      ctx.beginPath();
      ctx.arc(0, 0, wheelR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(wheelColor, ELEMENT_ALPHA.primary.max * 1.5 * entrance);
      ctx.lineWidth = minDim * 0.004;
      ctx.stroke();

      // Spokes
      const spokeCount = 6;
      for (let i = 0; i < spokeCount; i++) {
        const sa = (i / spokeCount) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(sa) * wheelR, Math.sin(sa) * wheelR);
        ctx.strokeStyle = rgba(wheelColor, ELEMENT_ALPHA.primary.max * entrance);
        ctx.lineWidth = minDim * 0.001;
        ctx.stroke();
      }

      // Inner hub
      ctx.beginPath();
      ctx.arc(0, 0, minDim * 0.02, 0, Math.PI * 2);
      ctx.fillStyle = rgba(wheelColor, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.fill();

      ctx.restore();

      // Motion blur effect when fast
      if (s.stabilized && s.stabilizeAnim > 0.5) {
        const blurAlpha = (s.stabilizeAnim - 0.5) * 2 * ELEMENT_ALPHA.secondary.max * entrance;
        ctx.beginPath();
        ctx.arc(fcx, fcy, wheelR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(accentC, blurAlpha);
        ctx.lineWidth = minDim * 0.01;
        ctx.stroke();
      }

      // Status
      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!s.stabilized) {
        ctx.fillText('Swipe to stabilize', cx, cy + wheelR + minDim * 0.06);
      } else if (s.stabilizeAnim > 0.8) {
        ctx.fillText('Infinite motion.', cx, cy + wheelR + minDim * 0.06);
      }

      if (s.stabilizeAnim >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      cb.onStateChange?.(s.stabilized ? 0.5 + s.stabilizeAnim * 0.5 : s.speed / 0.02 * 0.5);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    let swipeStartX = 0, swipeStartY = 0, swipeTime = 0;
    const onDown = (e: PointerEvent) => {
      swipeStartX = e.clientX;
      swipeStartY = e.clientY;
      swipeTime = performance.now();
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.stabilized) return;
      const dx = e.clientX - swipeStartX;
      const dy = e.clientY - swipeStartY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const elapsed = performance.now() - swipeTime;
      if (dist > 30 && elapsed < 500) {
        s.stabilized = true;
        cbRef.current.onHaptic('swipe_commit');
      }
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