/**
 * ATOM 138: THE LIGHTHOUSE ENGINE · Series 14 · Position 8
 * Stop chasing. Hold center to ignite. Sweeping beam cuts through fog.
 * Distant nodes drift toward the light.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function LighthouseAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    holding: false, ignited: false, igniteAnim: 0,
    beamAngle: 0,
    tribeNodes: Array.from({ length: 5 }, () => ({
      x: Math.random(), y: Math.random(), visible: false, approach: 0,
    })),
    completionFired: false,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const baseC = s.primaryRgb; const accentC = s.accentRgb;

      if (s.holding && !s.ignited) { s.ignited = true; cb.onHaptic('step_advance'); }
      if (s.ignited) s.igniteAnim = Math.min(1, s.igniteAnim + 0.01);
      const ia = easeOutCubic(s.igniteAnim);

      if (s.ignited && !p.reducedMotion) s.beamAngle += 0.015;

      // Background (foggy)
      const fogAlpha = (1 - ia * 0.5) * 0.02 * entrance;
      ctx.fillStyle = rgba(baseC, fogAlpha);
      ctx.fillRect(0, 0, w, h);

      // Background glow
      const ms = motionScale(p.reducedMotion);
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms + ia * 0.15) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(accentC, ELEMENT_ALPHA.glow.max * ia * 2 * entrance));
      bgGrad.addColorStop(1, rgba(accentC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Beam
      if (s.ignited) {
        const beamLen = minDim * 0.4 * ia;
        const beamWidth = Math.PI * 0.15;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, beamLen, s.beamAngle - beamWidth / 2, s.beamAngle + beamWidth / 2);
        ctx.closePath();
        const bGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, beamLen);
        bGrad.addColorStop(0, rgba(accentC, EMPHASIS_ALPHA.focal.max * ia * entrance));
        bGrad.addColorStop(1, rgba(accentC, 0));
        ctx.fillStyle = bGrad;
        ctx.fill();
      }

      // Center node (lighthouse)
      const nodeR = minDim * (0.015 + ia * 0.01);
      ctx.beginPath(); ctx.arc(cx, cy, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(accentC, ELEMENT_ALPHA.primary.max * (1 + ia * 2) * entrance);
      ctx.fill();

      // Tribe nodes
      for (const tn of s.tribeNodes) {
        const nx = tn.x * w; const ny = tn.y * h;
        // Check if beam hits
        if (s.ignited) {
          const angle = Math.atan2(ny - cy, nx - cx);
          const angleDiff = Math.abs(((angle - s.beamAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
          if (angleDiff < Math.PI * 0.15) tn.visible = true;
        }
        if (tn.visible) {
          tn.approach = Math.min(1, tn.approach + 0.003);
          const dx = cx - nx; const dy = cy - ny;
          tn.x += dx / w * 0.002 * tn.approach;
          tn.y += dy / h * 0.002 * tn.approach;

          const tnR = minDim * 0.008;
          ctx.beginPath(); ctx.arc(tn.x * w, tn.y * h, tnR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(accentC, ELEMENT_ALPHA.primary.max * tn.approach * entrance);
          ctx.fill();
        }
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!s.ignited) ctx.fillText('Hold to ignite', cx, cy + minDim * 0.12);

      const allVisible = s.tribeNodes.every(t => t.visible && t.approach > 0.5);
      if (allVisible && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(ia);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.holding = true; cbRef.current.onHaptic('hold_start'); canvas.setPointerCapture(e.pointerId); };
    const onUp = (e: PointerEvent) => { stateRef.current.holding = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}