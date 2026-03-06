/**
 * ATOM 142: THE RAGE VAULT ENGINE · Series 15 · Position 2
 * Swipe up aggressively to hurl anger into vault. Iron doors slam shut.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function RageVaultAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    swiping: false, swipeStartY: 0, hurled: false, slamAnim: 0,
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
      const ms = motionScale(p.reducedMotion);
      const baseC = s.primaryRgb;
      const accentC = s.accentRgb;
      const redC: RGB = lerpColor(accentC, [200, 50, 40], 0.3);
      const ironC: RGB = lerpColor(baseC, [80, 80, 90], 0.5);

      if (s.hurled) s.slamAnim = Math.min(1, s.slamAnim + 0.03);
      const sa = easeOutCubic(s.slamAnim);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Vault opening
      const vaultW = minDim * 0.25; const vaultH = minDim * 0.2;
      const vaultX = cx - vaultW / 2; const vaultY = cy - vaultH * 0.7;

      // Dark interior
      ctx.fillStyle = rgba(lerpColor(baseC, [10, 10, 15] as RGB, 0.85), ELEMENT_ALPHA.primary.max * entrance);
      ctx.fillRect(vaultX, vaultY, vaultW, vaultH);

      // Iron doors (close with slam)
      const doorOpen = 1 - sa;
      const leftDoorW = vaultW / 2 * doorOpen;
      const rightDoorW = vaultW / 2 * doorOpen;

      ctx.fillStyle = rgba(ironC, EMPHASIS_ALPHA.focal.max * entrance);
      // Left door
      ctx.fillRect(vaultX, vaultY, vaultW / 2 - leftDoorW, vaultH);
      // Right door
      ctx.fillRect(cx + leftDoorW, vaultY, vaultW / 2 - rightDoorW, vaultH);

      // Rivets
      if (sa > 0.5) {
        const rivetR = minDim * 0.003;
        for (let i = 0; i < 4; i++) {
          const ry = vaultY + (i + 0.5) * (vaultH / 4);
          ctx.beginPath(); ctx.arc(cx - minDim * 0.01, ry, rivetR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(ironC, ELEMENT_ALPHA.primary.max * sa * entrance);
          ctx.fill();
          ctx.beginPath(); ctx.arc(cx + minDim * 0.01, ry, rivetR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Rage ball (flies upward when hurled)
      if (!s.hurled) {
        const ragePulse = !p.reducedMotion ? Math.sin(s.frameCount * 0.1 * ms) * minDim * 0.005 : 0;
        const rageR = minDim * 0.03;
        ctx.beginPath(); ctx.arc(cx, cy + minDim * 0.1, rageR + ragePulse, 0, Math.PI * 2);
        const rGrad = ctx.createRadialGradient(cx, cy + minDim * 0.1, 0, cx, cy + minDim * 0.1, rageR + ragePulse);
        rGrad.addColorStop(0, rgba(redC, EMPHASIS_ALPHA.accent.max * entrance));
        rGrad.addColorStop(1, rgba(redC, ELEMENT_ALPHA.glow.max * entrance));
        ctx.fillStyle = rGrad;
        ctx.fill();
      } else if (sa < 0.5) {
        // Flying up
        const flyY = cy + minDim * 0.1 - sa * 2 * minDim * 0.3;
        const rageR2 = minDim * 0.03 * (1 - sa);
        ctx.beginPath(); ctx.arc(cx, flyY, rageR2, 0, Math.PI * 2);
        ctx.fillStyle = rgba(redC, ELEMENT_ALPHA.primary.max * (1 - sa * 2) * entrance);
        ctx.fill();
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!s.hurled) ctx.fillText('Swipe up to vault', cx, cy + minDim * 0.2);
      else if (sa > 0.8) ctx.fillText('Contained.', cx, cy + minDim * 0.2);

      if (sa >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(sa);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.swiping = true; stateRef.current.swipeStartY = e.clientY; canvas.setPointerCapture(e.pointerId); };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current; s.swiping = false; canvas.releasePointerCapture(e.pointerId);
      if (!s.hurled && s.swipeStartY - e.clientY > 50) { s.hurled = true; cbRef.current.onHaptic('swipe_commit'); }
    };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} /></div>);
}