/**
 * ATOM 187: THE UNPLANNED HOUR ENGINE · Series 19 · Position 7
 * Time anxiety is a prison. Drag clock hands off —
 * ticking stops, replaced by a soft breathing circle.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function UnplannedHourAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    handsRemoved: 0, handAnims: [0, 0, 0], // hour, minute, second
    dragging: -1, breathAnim: 0, completionFired: false,
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
      const clockC: RGB = lerpColor(accentC, [160, 160, 170], 0.3);
      const calmC: RGB = lerpColor(accentC, [120, 180, 200], 0.3);

      for (let i = 0; i < 3; i++) if (i < s.handsRemoved) s.handAnims[i] = Math.min(1, s.handAnims[i] + 0.03);
      const allGone = s.handsRemoved >= 3;
      if (allGone) s.breathAnim += 0.015;

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      const clockR = minDim * 0.1;

      // Clock face
      ctx.beginPath(); ctx.arc(cx, cy, clockR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(clockC, ELEMENT_ALPHA.primary.max * entrance);
      ctx.lineWidth = minDim * 0.001; ctx.stroke();

      // Hour markers
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const inner = clockR * 0.85; const outer = clockR * 0.95;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
        ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
        ctx.strokeStyle = rgba(clockC, ELEMENT_ALPHA.tertiary.max * entrance);
        ctx.lineWidth = minDim * 0.0008; ctx.stroke();
      }

      // Clock hands (falling away when removed)
      const handLens = [clockR * 0.5, clockR * 0.7, clockR * 0.8];
      const handWidths = [minDim * 0.002, minDim * 0.0016, minDim * 0.0006];
      const handAngles = [s.frameCount * 0.001 * ms, s.frameCount * 0.01 * ms, s.frameCount * 0.06 * ms];
      const handLabels = ['hour', 'minute', 'second'];

      for (let i = 0; i < 3; i++) {
        const fa = easeOutCubic(s.handAnims[i]);
        if (fa >= 1) continue;
        const angle = handAngles[i] - Math.PI / 2;
        const dropY = fa * minDim * 0.2;
        const alpha = ELEMENT_ALPHA.primary.max * (1.5 - fa * 1.5) * entrance;
        ctx.beginPath();
        ctx.moveTo(cx, cy + dropY);
        ctx.lineTo(cx + Math.cos(angle) * handLens[i] * (1 - fa * 0.5), cy + Math.sin(angle) * handLens[i] * (1 - fa * 0.5) + dropY);
        ctx.strokeStyle = rgba(clockC, alpha);
        ctx.lineWidth = handWidths[i]; ctx.stroke();
      }

      // Center dot
      ctx.beginPath(); ctx.arc(cx, cy, minDim * 0.004, 0, Math.PI * 2);
      ctx.fillStyle = rgba(clockC, ELEMENT_ALPHA.primary.max * entrance); ctx.fill();

      // Breathing circle after all hands removed
      if (allGone) {
        const br = clockR * (0.6 + Math.sin(s.breathAnim) * 0.2);
        const bGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, br);
        bGrad.addColorStop(0, rgba(calmC, EMPHASIS_ALPHA.focal.min * entrance));
        bGrad.addColorStop(1, rgba(calmC, 0));
        ctx.fillStyle = bGrad;
        ctx.fillRect(cx - br, cy - br, br * 2, br * 2);
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!allGone) ctx.fillText('Tap to remove hands', cx, cy + clockR + minDim * 0.06);
      else ctx.fillText('Outside time.', cx, cy + clockR + minDim * 0.06);

      if (allGone && s.handAnims[2] >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.handsRemoved / 3);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = () => {
      const s = stateRef.current;
      if (s.handsRemoved < 3) { s.handsRemoved++; cbRef.current.onHaptic('step_advance'); }
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}