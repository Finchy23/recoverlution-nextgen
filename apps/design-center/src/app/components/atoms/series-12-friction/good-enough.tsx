/**
 * ATOM 116: THE "GOOD ENOUGH" ENGINE
 * ====================================
 * Series 12 — Friction Mechanics · Position 6
 *
 * Drag a progress ring to 80%. If you try past 80%, it snaps
 * back like a rubber band. Hit "SHIP IT" to launch.
 *
 * PHYSICS: Progress bar snapping, elastic rejection, explosive release
 * INTERACTION: Drag ring + tap button
 * RENDER: Canvas 2D
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB,
} from '../atom-utils';

export default function GoodEnoughAtom({
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
    progress: 0, // 0→0.8 max
    dragging: false,
    rejected: false, rejectAnim: 0,
    shipped: false, shipAnim: 0,
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

      const { progress: ep, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = ep;
      const ms = motionScale(p.reducedMotion);

      const baseC = s.primaryRgb;
      const accentC = s.accentRgb;

      // Reject animation (snap back)
      if (s.rejected) {
        s.rejectAnim = Math.min(1, s.rejectAnim + 0.08);
        if (s.rejectAnim >= 1) { s.rejected = false; s.rejectAnim = 0; }
      }

      // Ship animation
      if (s.shipped) {
        s.shipAnim = Math.min(1, s.shipAnim + 0.015);
      }

      // Background
      const glowR = minDim * (0.35 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const ringR = minDim * 0.15;

      if (!s.shipped) {
        // Ring track
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.tertiary.max * entrance);
        ctx.lineWidth = minDim * 0.008;
        ctx.stroke();

        // Progress arc
        const shake = s.rejected ? Math.sin(s.rejectAnim * Math.PI * 6) * minDim * 0.003 * (1 - s.rejectAnim) : 0;
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + s.progress * Math.PI * 2;
        const ringColor = s.progress >= 0.75 ? lerpColor(baseC, accentC, 0.6) : baseC;

        ctx.beginPath();
        ctx.arc(cx + shake, cy, ringR, startAngle, endAngle);
        ctx.strokeStyle = rgba(ringColor, EMPHASIS_ALPHA.focal.max * entrance);
        ctx.lineWidth = minDim * 0.008;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Percentage text
        const pct = Math.round(s.progress * 100);
        const fs = Math.max(12, minDim * 0.04);
        ctx.font = `600 ${fs}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba(ringColor, ELEMENT_ALPHA.text.max * entrance);
        ctx.fillText(`${pct}%`, cx, cy);

        // 80% marker
        const markerAngle = -Math.PI / 2 + 0.8 * Math.PI * 2;
        const mx = cx + Math.cos(markerAngle) * (ringR + minDim * 0.025);
        const my = cy + Math.sin(markerAngle) * (ringR + minDim * 0.025);
        const mfs = Math.max(7, minDim * 0.011);
        ctx.font = `${mfs}px -apple-system, sans-serif`;
        ctx.fillStyle = rgba(accentC, ELEMENT_ALPHA.text.min * entrance);
        ctx.fillText('80%', mx, my);

        // Ship button (appears at 80%)
        if (s.progress >= 0.75) {
          const btnY = cy + ringR + minDim * 0.08;
          const btnW = minDim * 0.16;
          const btnH = minDim * 0.04;
          const pulse = 0.5 + Math.sin(s.frameCount * 0.06 * ms) * 0.3;

          ctx.fillStyle = rgba(accentC, ELEMENT_ALPHA.primary.max * (1 + pulse) * entrance);
          ctx.beginPath();
          const br = minDim * 0.008;
          ctx.moveTo(cx - btnW / 2 + br, btnY);
          ctx.lineTo(cx + btnW / 2 - br, btnY);
          ctx.quadraticCurveTo(cx + btnW / 2, btnY, cx + btnW / 2, btnY + br);
          ctx.lineTo(cx + btnW / 2, btnY + btnH - br);
          ctx.quadraticCurveTo(cx + btnW / 2, btnY + btnH, cx + btnW / 2 - br, btnY + btnH);
          ctx.lineTo(cx - btnW / 2 + br, btnY + btnH);
          ctx.quadraticCurveTo(cx - btnW / 2, btnY + btnH, cx - btnW / 2, btnY + btnH - br);
          ctx.lineTo(cx - btnW / 2, btnY + br);
          ctx.quadraticCurveTo(cx - btnW / 2, btnY, cx - btnW / 2 + br, btnY);
          ctx.closePath();
          ctx.fill();

          ctx.font = `600 ${Math.max(8, minDim * 0.014)}px -apple-system, sans-serif`;
          ctx.fillStyle = rgba(accentC, ELEMENT_ALPHA.text.max * entrance);
          ctx.fillText('SHIP IT', cx, btnY + btnH / 2);
        }
      } else {
        // Ship animation: ring rockets upward
        const sa = easeOutCubic(s.shipAnim);
        const rocketY = cy - sa * h * 0.6;
        const rocketAlpha = (1 - s.shipAnim) * EMPHASIS_ALPHA.focal.max * entrance;

        if (s.shipAnim < 0.8) {
          ctx.beginPath();
          ctx.arc(cx, rocketY, ringR * (1 - sa * 0.5), 0, Math.PI * 2);
          ctx.strokeStyle = rgba(accentC, rocketAlpha);
          ctx.lineWidth = minDim * 0.006;
          ctx.stroke();
        }

        // Relief glow
        if (s.shipAnim > 0.3) {
          const reliefR = minDim * 0.3 * (s.shipAnim - 0.3);
          const rGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, reliefR);
          rGrad.addColorStop(0, rgba(accentC, EMPHASIS_ALPHA.focal.min * entrance * Math.min(1, (s.shipAnim - 0.3) * 3)));
          rGrad.addColorStop(1, rgba(accentC, 0));
          ctx.fillStyle = rGrad;
          ctx.fillRect(0, 0, w, h);
        }
      }

      if (s.shipAnim >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      cb.onStateChange?.(s.shipped ? 1 : s.progress);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    let dragStartY = 0;
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.shipped) return;
      const rect = canvas.getBoundingClientRect();
      const py = (e.clientY - rect.top) / rect.height * viewport.height;
      const minDim2 = Math.min(viewport.width, viewport.height);

      // Check if ship button tap
      const ringR2 = minDim2 * 0.15;
      const btnY = viewport.height / 2 + ringR2 + minDim2 * 0.08;
      if (s.progress >= 0.75 && py > btnY && py < btnY + minDim2 * 0.04) {
        s.shipped = true;
        cbRef.current.onHaptic('drag_snap');
        return;
      }

      s.dragging = true;
      dragStartY = py;
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const ny = (e.clientY - rect.top) / rect.height * viewport.height;
      const delta = -(ny - dragStartY) / viewport.height;
      dragStartY = ny;
      const newProg = s.progress + delta;

      if (newProg > 0.81) {
        s.rejected = true;
        s.rejectAnim = 0;
        s.progress = 0.8;
        cbRef.current.onHaptic('error_boundary');
      } else {
        s.progress = Math.max(0, Math.min(0.8, newProg));
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}