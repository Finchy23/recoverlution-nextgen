/**
 * ATOM 174: THE LEVERAGE ENGINE · Series 18 · Position 4
 * A seesaw with a heavy boulder. Brute force fails — drag the
 * fulcrum to find the right angle for effortless launch.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function LeverageEngineAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    fulcrumX: 0.5, dragging: false, launched: false, launchAnim: 0,
    errorFlash: 0, completionFired: false,
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
      const beamC: RGB = lerpColor(accentC, [140, 130, 110], 0.3);
      const boulderC: RGB = lerpColor(accentC, [160, 150, 140], 0.4);
      const fulcrumC: RGB = lerpColor(accentC, [200, 180, 80], 0.3);

      if (s.launched) s.launchAnim = Math.min(1, s.launchAnim + 0.02);
      if (s.errorFlash > 0) s.errorFlash = Math.max(0, s.errorFlash - 0.03);
      const la = easeOutCubic(s.launchAnim);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Ground line
      const groundY = cy + minDim * 0.1;
      ctx.beginPath(); ctx.moveTo(cx - minDim * 0.25, groundY); ctx.lineTo(cx + minDim * 0.25, groundY);
      ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.tertiary.max * entrance);
      ctx.lineWidth = minDim * 0.0006; ctx.stroke();

      // Fulcrum triangle
      const fxPos = cx - minDim * 0.2 + s.fulcrumX * minDim * 0.4;
      const triH = minDim * 0.03;
      ctx.beginPath(); ctx.moveTo(fxPos, groundY); ctx.lineTo(fxPos - minDim * 0.015, groundY + triH); ctx.lineTo(fxPos + minDim * 0.015, groundY + triH); ctx.closePath();
      ctx.fillStyle = rgba(fulcrumC, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.fill();

      // Beam
      const beamL = cx - minDim * 0.18;
      const beamR = cx + minDim * 0.18;
      const leverage = s.fulcrumX; // 0=left, 1=right
      const tilt = (leverage - 0.5) * 0.15;
      ctx.save(); ctx.translate(fxPos, groundY); ctx.rotate(tilt);
      ctx.fillStyle = rgba(beamC, ELEMENT_ALPHA.primary.max * 1.5 * entrance);
      ctx.fillRect(beamL - fxPos, -minDim * 0.004, beamR - beamL, minDim * 0.008);
      ctx.restore();

      // Boulder on left end
      const boulderX = beamL + Math.cos(tilt) * (beamL - fxPos) * 0.1;
      const boulderR = minDim * 0.025;
      if (!s.launched) {
        ctx.beginPath(); ctx.arc(beamL, groundY - boulderR + tilt * minDim * 0.3, boulderR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(boulderC, EMPHASIS_ALPHA.focal.max * entrance);
        ctx.fill();
      } else {
        // Boulder launching upward
        const launchY = groundY - boulderR - la * minDim * 0.3;
        ctx.beginPath(); ctx.arc(beamL, launchY, boulderR * (1 - la * 0.3), 0, Math.PI * 2);
        ctx.fillStyle = rgba(boulderC, ELEMENT_ALPHA.primary.max * (2 - la) * entrance);
        ctx.fill();
        // Trail
        const tGrad = ctx.createRadialGradient(beamL, launchY, 0, beamL, launchY, minDim * 0.04 * la);
        tGrad.addColorStop(0, rgba(fulcrumC, ELEMENT_ALPHA.glow.max * la * 2 * entrance));
        tGrad.addColorStop(1, rgba(fulcrumC, 0));
        ctx.fillStyle = tGrad; ctx.fillRect(beamL - minDim * 0.04, launchY - minDim * 0.04, minDim * 0.08, minDim * 0.08);
      }

      // Error flash
      if (s.errorFlash > 0) {
        ctx.fillStyle = rgba(lerpColor(accentC, [220, 60, 60] as RGB, 0.3), ELEMENT_ALPHA.glow.max * s.errorFlash * entrance);
        ctx.fillRect(0, 0, w, h);
      }

      // Optimal zone marker
      ctx.setLineDash([minDim * 0.004, minDim * 0.004]);
      const optX = cx - minDim * 0.2 + 0.75 * minDim * 0.4;
      ctx.beginPath(); ctx.moveTo(optX, groundY + triH + minDim * 0.01); ctx.lineTo(optX, groundY + triH + minDim * 0.02);
      ctx.strokeStyle = rgba(fulcrumC, ELEMENT_ALPHA.tertiary.max * entrance);
      ctx.lineWidth = minDim * 0.0006; ctx.stroke();
      ctx.setLineDash([]);

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!s.launched) ctx.fillText('Drag fulcrum, tap boulder to push', cx, groundY + minDim * 0.1);
      else ctx.fillText('Leverage found.', cx, groundY + minDim * 0.1);

      if (la >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.launched ? 1 : s.fulcrumX);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current; if (s.launched) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * viewport.width;
      const py = (e.clientY - rect.top) / rect.height * viewport.height;
      const minDim2 = Math.min(viewport.width, viewport.height);
      const groundY2 = viewport.height / 2 + minDim2 * 0.1;
      // Check if near fulcrum area
      const fxPos = viewport.width / 2 - minDim2 * 0.2 + s.fulcrumX * minDim2 * 0.4;
      if (Math.abs(py - groundY2) < minDim2 * 0.05 && Math.abs(px - fxPos) < minDim2 * 0.04) {
        s.dragging = true; canvas.setPointerCapture(e.pointerId);
      } else {
        // Tap = attempt push
        if (s.fulcrumX > 0.65 && s.fulcrumX < 0.85) {
          s.launched = true; cbRef.current.onHaptic('drag_snap');
        } else {
          s.errorFlash = 1; cbRef.current.onHaptic('error_boundary');
        }
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const minDim2 = Math.min(viewport.width, viewport.height);
      stateRef.current.fulcrumX = Math.max(0.1, Math.min(0.9, (px * viewport.width - (viewport.width / 2 - minDim2 * 0.2)) / (minDim2 * 0.4)));
    };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}