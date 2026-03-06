/**
 * ATOM 117: THE BURN RATE ENGINE
 * ================================
 * Series 12 — Friction Mechanics · Position 7
 *
 * A spacecraft shaking violently at 100%. Pull throttle back
 * to 70%. Shaking stops, color cools, fuel stabilizes.
 *
 * PHYSICS: Throttle deceleration, heat dissipation, aerodynamic gliding
 * INTERACTION: Drag slider from 100% to 70%
 * RENDER: Canvas 2D
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB,
} from '../atom-utils';

export default function BurnRateAtom({
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
    throttle: 1.0, // 1.0=100%, target 0.7
    dragging: false,
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

      // Check stabilization
      if (!s.stabilized && s.throttle <= 0.72) {
        s.stabilized = true;
        cb.onHaptic('step_advance');
      }
      if (s.stabilized) s.stabilizeAnim = Math.min(1, s.stabilizeAnim + 0.02);

      const heat = Math.max(0, (s.throttle - 0.7) / 0.3); // 1 at 100%, 0 at 70%
      const sa = easeOutCubic(s.stabilizeAnim);

      // Shake
      const shakeI = !p.reducedMotion ? heat * minDim * 0.005 : 0;
      const sx = (Math.random() - 0.5) * shakeI;
      const sy = (Math.random() - 0.5) * shakeI;

      ctx.save();
      ctx.translate(sx, sy);

      // Background: red-hot → cool blue
      const bgColor: RGB = lerpColor([200, 50, 30], accentC, 1 - heat);
      const glowR = minDim * (0.35 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(bgColor, ELEMENT_ALPHA.glow.max * (1 + heat) * entrance));
      bgGrad.addColorStop(1, rgba(bgColor, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(-10, -10, w + 20, h + 20);

      // Node (spacecraft)
      const nodeR = minDim * 0.03;
      const nodeColor = lerpColor([255, 80, 40], accentC, 1 - heat);
      ctx.beginPath();
      ctx.arc(cx, cy - minDim * 0.08, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(nodeColor, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.fill();

      // Throttle slider (right side)
      const sliderX = cx + minDim * 0.2;
      const sliderTop = cy - minDim * 0.15;
      const sliderH = minDim * 0.3;

      // Track
      ctx.beginPath();
      ctx.moveTo(sliderX, sliderTop);
      ctx.lineTo(sliderX, sliderTop + sliderH);
      ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * entrance);
      ctx.lineWidth = minDim * 0.003;
      ctx.lineCap = 'round';
      ctx.stroke();

      // 70% marker
      const marker70Y = sliderTop + sliderH * 0.3;
      ctx.beginPath();
      ctx.moveTo(sliderX - minDim * 0.02, marker70Y);
      ctx.lineTo(sliderX + minDim * 0.02, marker70Y);
      ctx.strokeStyle = rgba(accentC, ELEMENT_ALPHA.secondary.max * entrance);
      ctx.lineWidth = minDim * 0.0006;
      ctx.stroke();

      const mfs = Math.max(7, minDim * 0.01);
      ctx.font = `${mfs}px -apple-system, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillStyle = rgba(accentC, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText('70%', sliderX + minDim * 0.03, marker70Y + 3);

      // Handle
      const handleY = sliderTop + sliderH * (1 - s.throttle);
      const handleR = minDim * 0.015;
      ctx.beginPath();
      ctx.arc(sliderX, handleY, handleR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(nodeColor, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.fill();

      // Fuel bar (left side)
      const fuelX = cx - minDim * 0.2;
      const fuelW = minDim * 0.02;
      const fuelLevel = s.stabilized ? 0.5 + sa * 0.4 : Math.max(0.1, 1 - heat * 0.8);

      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.tertiary.max * entrance);
      ctx.fillRect(fuelX - fuelW / 2, sliderTop, fuelW, sliderH);

      const fuelColor = fuelLevel > 0.5 ? accentC : [255, 80, 40] as RGB;
      ctx.fillStyle = rgba(fuelColor, ELEMENT_ALPHA.primary.max * entrance);
      ctx.fillRect(fuelX - fuelW / 2, sliderTop + sliderH * (1 - fuelLevel), fuelW, sliderH * fuelLevel);

      ctx.font = `${mfs}px -apple-system, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText('FUEL', fuelX - minDim * 0.02, sliderTop - minDim * 0.01);

      ctx.restore(); // undo shake

      // Throttle label
      const pct = Math.round(s.throttle * 100);
      ctx.font = `600 ${Math.max(10, minDim * 0.025)}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(nodeColor, ELEMENT_ALPHA.text.max * entrance);
      ctx.fillText(`${pct}%`, cx, cy + minDim * 0.1);

      if (s.stabilizeAnim >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      cb.onStateChange?.(1 - heat);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    let dragStartY = 0;
    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      dragStartY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const delta = (dragStartY - e.clientY) / viewport.height * 0.8;
      dragStartY = e.clientY;
      s.throttle = Math.max(0.65, Math.min(1, s.throttle + delta));
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ns-resize' }} />
    </div>
  );
}