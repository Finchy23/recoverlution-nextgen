/**
 * ATOM 131: THE REVERSE ORBIT ENGINE · Series 14 · Position 1
 * Chase the Other node = it flees. Stand still = it orbits you.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function ReverseOrbitAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    userX: 0, userY: 0, dragging: false,
    otherX: 0, otherY: 0, otherAngle: 0,
    stillFrames: 0, orbiting: false, orbitAnim: 0,
    completionFired: false,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;
    const s = stateRef.current;
    s.userX = viewport.width / 2; s.userY = viewport.height / 2;
    s.otherX = viewport.width * 0.7; s.otherY = viewport.height * 0.3;

    const render = () => {
      const s2 = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s2.frameCount++;
      const { progress, entrance } = advanceEntrance(s2.entranceProgress, p.phase);
      s2.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);
      const baseC = s2.primaryRgb; const accentC = s2.accentRgb;

      // If user is still (at center), count still frames
      const distFromCenter = Math.sqrt((s2.userX - cx) ** 2 + (s2.userY - cy) ** 2);
      if (!s2.dragging && distFromCenter < minDim * 0.05) {
        s2.stillFrames++;
        if (s2.stillFrames > 60 && !s2.orbiting) {
          s2.orbiting = true;
          cb.onHaptic('step_advance');
        }
      } else if (s2.dragging) {
        s2.stillFrames = 0;
      }

      if (s2.orbiting) s2.orbitAnim = Math.min(1, s2.orbitAnim + 0.01);
      const oa = easeOutCubic(s2.orbitAnim);

      // Other node behavior
      if (!p.reducedMotion) {
        if (s2.dragging && !s2.orbiting) {
          // Flee: move away from user
          const dx = s2.otherX - s2.userX; const dy = s2.otherY - s2.userY;
          const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
          const flee = minDim * 0.003 / Math.max(0.5, dist / minDim);
          s2.otherX += (dx / dist) * flee;
          s2.otherY += (dy / dist) * flee;
          // Clamp
          s2.otherX = Math.max(minDim * 0.05, Math.min(w - minDim * 0.05, s2.otherX));
          s2.otherY = Math.max(minDim * 0.05, Math.min(h - minDim * 0.05, s2.otherY));
        }
        if (s2.orbiting) {
          // Orbit around center
          s2.otherAngle += 0.015 * oa;
          const orbitR = minDim * (0.2 - oa * 0.05);
          s2.otherX = cx + Math.cos(s2.otherAngle) * orbitR;
          s2.otherY = cy + Math.sin(s2.otherAngle) * orbitR;
        }
      }

      // Spring user back to center when released
      if (!s2.dragging) {
        s2.userX += (cx - s2.userX) * 0.05;
        s2.userY += (cy - s2.userY) * 0.05;
      }

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Orbit path
      if (s2.orbiting) {
        const orbitR2 = minDim * (0.2 - oa * 0.05);
        ctx.beginPath(); ctx.arc(cx, cy, orbitR2, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(accentC, ELEMENT_ALPHA.tertiary.max * oa * entrance);
        ctx.lineWidth = minDim * 0.0006; ctx.stroke();
      }

      // Connection line
      ctx.beginPath();
      ctx.moveTo(s2.userX, s2.userY); ctx.lineTo(s2.otherX, s2.otherY);
      ctx.strokeStyle = rgba(accentC, ELEMENT_ALPHA.secondary.max * entrance * (s2.orbiting ? oa : 0.3));
      ctx.lineWidth = minDim * 0.0006; ctx.stroke();

      // User node (grows with stillness)
      const userR = minDim * (0.02 + oa * 0.01);
      ctx.beginPath(); ctx.arc(s2.userX, s2.userY, userR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(lerpColor(baseC, accentC, oa * 0.5), ELEMENT_ALPHA.primary.max * (1.5 + oa) * entrance);
      ctx.fill();

      // Other node
      const otherR = minDim * 0.015;
      ctx.beginPath(); ctx.arc(s2.otherX, s2.otherY, otherR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(accentC, ELEMENT_ALPHA.primary.max * 1.5 * entrance);
      ctx.fill();

      // Labels
      const fs = Math.max(7, minDim * 0.011);
      ctx.font = `${fs}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText('You', s2.userX, s2.userY + userR + minDim * 0.02);
      ctx.fillText('Other', s2.otherX, s2.otherY + otherR + minDim * 0.02);

      if (!s2.orbiting) {
        ctx.fillText('Stand still at center', cx, h - minDim * 0.05);
      }

      if (s2.orbitAnim >= 1 && !s2.completionFired) { s2.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(oa);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.dragging = true; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.dragging) return;
      const rect = canvas.getBoundingClientRect();
      stateRef.current.userX = (e.clientX - rect.left) / rect.width * viewport.width;
      stateRef.current.userY = (e.clientY - rect.top) / rect.height * viewport.height;
    };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'move' }} /></div>);
}