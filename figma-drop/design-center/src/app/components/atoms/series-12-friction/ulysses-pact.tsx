/**
 * ATOM 113: THE ULYSSES PACT ENGINE
 * ===================================
 * Series 12 — Friction Mechanics · Position 3
 *
 * A heavy vault lever. Drag past 51% and it snaps irreversibly.
 * Massive metallic CLANG locks the commitment.
 *
 * PHYSICS: One-way mechanical gates, irreversible timelines, heavy locking
 * INTERACTION: Drag lever downward
 * RENDER: Canvas 2D
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB,
} from '../atom-utils';

export default function UlyssesPactAtom({
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
    leverProgress: 0, // 0=top, 1=bottom
    dragging: false,
    locked: false,
    lockAnim: 0,
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

      // Lock animation (auto-snaps past 51%)
      if (s.locked && s.lockAnim < 1) {
        s.lockAnim = Math.min(1, s.lockAnim + 0.04);
        s.leverProgress = 0.51 + (1 - 0.51) * easeOutCubic(s.lockAnim);
      }

      // Spring back if released before threshold and not locked
      if (!s.dragging && !s.locked && s.leverProgress > 0) {
        s.leverProgress *= 0.9;
        if (s.leverProgress < 0.01) s.leverProgress = 0;
      }

      // Background
      const glowR = minDim * (0.35 + p.breathAmplitude * 0.03 * ms) * entrance;
      const lockT = s.locked ? easeOutCubic(s.lockAnim) : 0;
      const bgC = lerpColor(baseC, accentC, lockT * 0.3);
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(bgC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(bgC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Lever track
      const trackH = minDim * 0.35;
      const trackTop = cy - trackH / 2;
      const trackBot = cy + trackH / 2;

      ctx.beginPath();
      ctx.moveTo(cx, trackTop);
      ctx.lineTo(cx, trackBot);
      ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * entrance);
      ctx.lineWidth = minDim * 0.003;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Threshold marker at 51%
      const threshY = trackTop + trackH * 0.51;
      ctx.beginPath();
      ctx.moveTo(cx - minDim * 0.03, threshY);
      ctx.lineTo(cx + minDim * 0.03, threshY);
      ctx.strokeStyle = rgba(accentC, ELEMENT_ALPHA.secondary.max * entrance);
      ctx.lineWidth = minDim * 0.0006;
      ctx.setLineDash([minDim * 0.003, minDim * 0.003]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Labels
      const fs = Math.max(7, minDim * 0.011);
      ctx.font = `${fs}px -apple-system, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText('REVERSIBLE', cx - minDim * 0.05, threshY - minDim * 0.01);
      ctx.fillText('IRREVERSIBLE', cx - minDim * 0.05, threshY + minDim * 0.02);

      // Lever handle
      const leverY = trackTop + trackH * s.leverProgress;
      const handleR = minDim * 0.025;
      const leverColor = s.locked ? accentC : lerpColor(baseC, accentC, s.leverProgress);

      ctx.beginPath();
      ctx.arc(cx, leverY, handleR * entrance, 0, Math.PI * 2);
      ctx.fillStyle = rgba(leverColor, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.fill();

      // Lock indicator
      if (s.locked && s.lockAnim > 0.5) {
        const lockAlpha = (s.lockAnim - 0.5) * 2 * ELEMENT_ALPHA.primary.max * entrance;
        ctx.beginPath();
        ctx.arc(cx, trackBot + minDim * 0.04, minDim * 0.015, 0, Math.PI * 2);
        ctx.fillStyle = rgba(accentC, lockAlpha);
        ctx.fill();

        const lfs = Math.max(7, minDim * 0.012);
        ctx.font = `600 ${lfs}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(accentC, lockAlpha);
        ctx.fillText('LOCKED', cx, trackBot + minDim * 0.08);
      }

      // Prompt
      if (!s.locked && s.leverProgress < 0.05) {
        ctx.font = `${Math.max(8, minDim * 0.013)}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance * (0.5 + Math.sin(s.frameCount * 0.03 * ms) * 0.3));
        ctx.fillText('Drag down to commit', cx, trackBot + minDim * 0.06);
      }

      if (s.lockAnim >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('seal_stamp');
        cb.onResolve?.();
      }

      cb.onStateChange?.(s.leverProgress);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    let dragStartY = 0;
    const onDown = (e: PointerEvent) => {
      if (stateRef.current.locked) return;
      stateRef.current.dragging = true;
      const rect = canvas.getBoundingClientRect();
      dragStartY = (e.clientY - rect.top) / rect.height * viewport.height;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || s.locked) return;
      const rect = canvas.getBoundingClientRect();
      const ny = (e.clientY - rect.top) / rect.height * viewport.height;
      const minDim2 = Math.min(viewport.width, viewport.height);
      const trackH = minDim2 * 0.35;
      const delta = (ny - dragStartY) / trackH;
      dragStartY = ny;
      s.leverProgress = Math.max(0, Math.min(0.55, s.leverProgress + delta));

      if (s.leverProgress >= 0.51) {
        s.locked = true;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ns-resize' }} />
    </div>
  );
}