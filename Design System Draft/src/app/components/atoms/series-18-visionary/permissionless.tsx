/**
 * ATOM 179: THE PERMISSIONLESS ENGINE · Series 18 · Position 9
 * Dead glass. Hold to crack it open — blinding green light erupts.
 * The Sovereign Mind picks itself.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function PermissionlessAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    holding: false, holdProgress: 0, cracked: false, crackAnim: 0,
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
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const greenC: RGB = lerpColor(accentC, [60, 220, 80], 0.3);
      const glassC: RGB = lerpColor(accentC, [100, 110, 120], 0.4);

      if (s.holding && !s.cracked) {
        s.holdProgress = Math.min(1, s.holdProgress + 0.008);
        if (s.holdProgress >= 1) { s.cracked = true; cb.onHaptic('hold_threshold'); }
      }
      if (s.cracked) s.crackAnim = Math.min(1, s.crackAnim + 0.015);
      const ca = easeOutCubic(s.crackAnim);

      // Background
      const glowR = minDim * (0.2 + p.breathAmplitude * 0.02 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * 0.5 * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Glass panel
      const panelR = minDim * 0.1;
      if (!s.cracked) {
        ctx.beginPath(); ctx.arc(cx, cy, panelR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(glassC, ELEMENT_ALPHA.primary.max * (0.8 + s.holdProgress * 0.5) * entrance);
        ctx.fill();
        ctx.strokeStyle = rgba(glassC, ELEMENT_ALPHA.primary.max * entrance);
        ctx.lineWidth = minDim * 0.001; ctx.stroke();

        // Crack lines based on progress
        if (s.holdProgress > 0.2) {
          const cracks = Math.floor(s.holdProgress * 8);
          ctx.strokeStyle = rgba(greenC, ELEMENT_ALPHA.primary.max * s.holdProgress * entrance);
          ctx.lineWidth = minDim * 0.0008;
          for (let i = 0; i < cracks; i++) {
            const angle = (i / 8) * Math.PI * 2 + 0.3;
            const len = panelR * 0.3 * s.holdProgress;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * panelR * 0.2, cy + Math.sin(angle) * panelR * 0.2);
            ctx.lineTo(cx + Math.cos(angle) * (panelR * 0.2 + len), cy + Math.sin(angle) * (panelR * 0.2 + len));
            ctx.stroke();
          }
        }

        // Hold progress ring
        ctx.beginPath();
        ctx.arc(cx, cy, panelR + minDim * 0.015, -Math.PI / 2, -Math.PI / 2 + s.holdProgress * Math.PI * 2);
        ctx.strokeStyle = rgba(greenC, ELEMENT_ALPHA.primary.max * s.holdProgress * entrance);
        ctx.lineWidth = minDim * 0.002; ctx.stroke();
      } else {
        // Green light eruption
        const eR = panelR + ca * minDim * 0.2;
        const eGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, eR);
        eGrad.addColorStop(0, rgba(greenC, EMPHASIS_ALPHA.focal.max * entrance));
        eGrad.addColorStop(0.5, rgba(greenC, ELEMENT_ALPHA.glow.max * entrance));
        eGrad.addColorStop(1, rgba(greenC, 0));
        ctx.fillStyle = eGrad; ctx.fillRect(0, 0, w, h);

        // Shattered fragments floating outward
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          const fd = panelR * 0.5 + ca * minDim * 0.15;
          const fx = cx + Math.cos(angle) * fd;
          const fy = cy + Math.sin(angle) * fd;
          const fSize = minDim * 0.008 * (1 - ca);
          ctx.fillStyle = rgba(glassC, ELEMENT_ALPHA.primary.max * (1 - ca) * entrance);
          ctx.fillRect(fx - fSize / 2, fy - fSize / 2, fSize, fSize);
        }

        // "GO" text
        const fs3 = Math.max(12, minDim * 0.03 * ca);
        ctx.font = `900 ${fs3}px -apple-system, sans-serif`; ctx.textAlign = 'center';
        ctx.fillStyle = rgba(greenC, ELEMENT_ALPHA.text.max * ca * entrance);
        ctx.fillText('GO', cx, cy + minDim * 0.01);
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!s.cracked) ctx.fillText('Hold to ignite', cx, cy + panelR + minDim * 0.06);
      else ctx.fillText('Permission granted.', cx, cy + panelR + minDim * 0.06);

      if (ca >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.cracked ? 1 : s.holdProgress);
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