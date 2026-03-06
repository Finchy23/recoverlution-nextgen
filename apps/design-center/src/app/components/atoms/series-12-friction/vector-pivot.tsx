/**
 * ATOM 118: THE VECTOR PIVOT ENGINE
 * ===================================
 * Series 12 — Friction Mechanics · Position 8
 *
 * A beam of light hits a wall and scatters. Place a mirror
 * at 45° to ricochet the light past the wall.
 *
 * PHYSICS: Elastic collision, angular deflection, mirror raytracing
 * INTERACTION: Drag mirror into position
 * RENDER: Canvas 2D
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB,
} from '../atom-utils';

export default function VectorPivotAtom({
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
    mirrorX: 0, mirrorY: 0, mirrorPlaced: false,
    dragging: false,
    reflected: false, reflectAnim: 0,
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

      if (s.reflected) s.reflectAnim = Math.min(1, s.reflectAnim + 0.02);
      const ra = easeOutCubic(s.reflectAnim);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Wall (vertical, center-right)
      const wallX = cx + minDim * 0.05;
      const wallH = minDim * 0.3;
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * 1.5 * entrance);
      ctx.fillRect(wallX - minDim * 0.005, cy - wallH / 2, minDim * 0.01, wallH);

      // Beam of light (from left)
      const beamStartX = cx - minDim * 0.3;
      const beamEndX = s.mirrorPlaced ? s.mirrorX : wallX;
      const beamY = cy;

      ctx.beginPath();
      ctx.moveTo(beamStartX, beamY);
      ctx.lineTo(beamEndX, beamY);
      ctx.strokeStyle = rgba(accentC, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.lineWidth = minDim * 0.002;
      ctx.stroke();

      // Scatter sparks at wall (when no mirror)
      if (!s.mirrorPlaced && !p.reducedMotion) {
        for (let i = 0; i < 4; i++) {
          const sparkX = wallX + (Math.random() - 0.3) * minDim * 0.02;
          const sparkY = beamY + (Math.random() - 0.5) * minDim * 0.04;
          ctx.fillStyle = rgba(accentC, Math.random() * ELEMENT_ALPHA.primary.max * entrance);
          ctx.fillRect(sparkX, sparkY, minDim * 0.002, minDim * 0.002);
        }
      }

      // Mirror
      if (s.mirrorPlaced || s.dragging) {
        const mx = s.mirrorX;
        const my = s.mirrorY;
        const mirrorLen = minDim * 0.06;

        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(-Math.PI / 4); // 45 degrees
        ctx.beginPath();
        ctx.moveTo(-mirrorLen / 2, 0);
        ctx.lineTo(mirrorLen / 2, 0);
        ctx.strokeStyle = rgba(lerpColor(accentC, [255, 255, 255], 0.3), EMPHASIS_ALPHA.accent.min * entrance);
        ctx.lineWidth = minDim * 0.003;
        ctx.stroke();
        ctx.restore();

        // Reflected beam (goes upward past the wall)
        if (s.reflected) {
          const reflLen = minDim * 0.4 * ra;
          ctx.beginPath();
          ctx.moveTo(mx, my);
          ctx.lineTo(mx + reflLen * 0.7, my - reflLen);
          ctx.strokeStyle = rgba(accentC, EMPHASIS_ALPHA.focal.max * entrance * ra);
          ctx.lineWidth = minDim * 0.002;
          ctx.stroke();

          // Illumination on the right side
          if (ra > 0.5) {
            const illR = minDim * 0.25 * (ra - 0.5) * 2;
            const illGrad = ctx.createRadialGradient(w * 0.75, cy * 0.4, 0, w * 0.75, cy * 0.4, illR);
            illGrad.addColorStop(0, rgba(accentC, EMPHASIS_ALPHA.focal.min * entrance * (ra - 0.5) * 2));
            illGrad.addColorStop(1, rgba(accentC, 0));
            ctx.fillStyle = illGrad;
            ctx.fillRect(w * 0.5, 0, w * 0.5, h);
          }
        }
      }

      // Prompt
      if (!s.mirrorPlaced) {
        const fs = Math.max(8, minDim * 0.013);
        ctx.font = `${fs}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
        ctx.fillText('Drag mirror to deflect', cx, cy + minDim * 0.2);
      }

      if (s.reflectAnim >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      cb.onStateChange?.(s.reflected ? ra : 0);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.reflected) return;
      const rect = canvas.getBoundingClientRect();
      s.mirrorX = (e.clientX - rect.left) / rect.width * viewport.width;
      s.mirrorY = (e.clientY - rect.top) / rect.height * viewport.height;
      s.dragging = true;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      s.mirrorX = (e.clientX - rect.left) / rect.width * viewport.width;
      s.mirrorY = (e.clientY - rect.top) / rect.height * viewport.height;
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      s.dragging = false;
      canvas.releasePointerCapture(e.pointerId);

      // Check if mirror is near the beam path
      const beamY = viewport.height / 2;
      const wallX = viewport.width / 2 + Math.min(viewport.width, viewport.height) * 0.05;
      if (Math.abs(s.mirrorY - beamY) < Math.min(viewport.width, viewport.height) * 0.06 &&
          s.mirrorX < wallX && s.mirrorX > viewport.width * 0.3) {
        s.mirrorPlaced = true;
        s.reflected = true;
        s.mirrorY = beamY;
        cbRef.current.onHaptic('drag_snap');
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'move' }} />
    </div>
  );
}