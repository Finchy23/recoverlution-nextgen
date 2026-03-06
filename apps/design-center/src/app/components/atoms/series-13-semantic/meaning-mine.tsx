/**
 * ATOM 127: THE MEANING MINE ENGINE · Series 13 · Position 7
 * Tap a dark rock aggressively. On the 5th tap it splits like a geode,
 * revealing a brilliant crystal center.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

const TAPS_TO_BREAK = 5;

export default function MeaningMineAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    taps: 0, cracked: false, crackAnim: 0, shakeFrames: 0, completionFired: false,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const crystalC: RGB = lerpColor(accentC, [180, 230, 255], 0.4);

      if (s.cracked) s.crackAnim = Math.min(1, s.crackAnim + 0.015);
      const ca = easeOutCubic(s.crackAnim);
      if (s.shakeFrames > 0) s.shakeFrames--;

      const shake = !p.reducedMotion && s.shakeFrames > 0 ? (Math.random() - 0.5) * minDim * 0.006 : 0;
      ctx.save(); ctx.translate(shake, shake);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(-10, -10, w + 20, h + 20);

      const rockR = minDim * 0.1;

      if (!s.cracked) {
        // Dark rock with cracks
        ctx.beginPath();
        const sides = 7;
        for (let i = 0; i < sides; i++) {
          const a = (i / sides) * Math.PI * 2;
          const jr = rockR * (0.8 + Math.sin(i * 4.3) * 0.2);
          const x = cx + Math.cos(a) * jr;
          const y = cy + Math.sin(a) * jr;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * 1.5 * entrance);
        ctx.fill();

        // Crack lines
        if (s.taps > 0) {
          ctx.strokeStyle = rgba(crystalC, ELEMENT_ALPHA.secondary.max * entrance * s.taps / TAPS_TO_BREAK);
          ctx.lineWidth = minDim * 0.0006;
          for (let i = 0; i < s.taps; i++) {
            const a = (i / TAPS_TO_BREAK) * Math.PI * 2 + 0.5;
            ctx.beginPath(); ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(a) * rockR * 0.9, cy + Math.sin(a) * rockR * 0.9);
            ctx.stroke();
          }
        }

        const tf = Math.max(7, minDim * 0.012);
        ctx.font = `${tf}px -apple-system, sans-serif`;
        ctx.textAlign = 'center'; ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
        ctx.fillText('Tap to break', cx, cy + rockR + minDim * 0.04);
      } else {
        // Split halves flying apart
        const splitDist = ca * minDim * 0.12;
        for (const dir of [-1, 1]) {
          ctx.save();
          ctx.translate(cx + dir * splitDist, cy);
          ctx.rotate(dir * ca * 0.2);
          ctx.beginPath();
          ctx.moveTo(0, -rockR * 0.8);
          ctx.lineTo(dir * rockR * 0.6, -rockR * 0.4);
          ctx.lineTo(dir * rockR * 0.7, rockR * 0.4);
          ctx.lineTo(0, rockR * 0.8);
          ctx.lineTo(0, -rockR * 0.8);
          ctx.closePath();
          ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * (1 - ca * 0.5) * entrance);
          ctx.fill();
          // Inner crystal face
          ctx.fillStyle = rgba(crystalC, ELEMENT_ALPHA.primary.max * ca * 2 * entrance);
          ctx.fillRect(-minDim * 0.003, -rockR * 0.6, minDim * 0.006, rockR * 1.2);
          ctx.restore();
        }

        // Crystal center glow
        const cgR = minDim * 0.08 * ca;
        const cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cgR);
        cGrad.addColorStop(0, rgba(crystalC, EMPHASIS_ALPHA.focal.max * entrance * ca));
        cGrad.addColorStop(1, rgba(crystalC, 0));
        ctx.fillStyle = cGrad;
        ctx.fillRect(cx - cgR, cy - cgR, cgR * 2, cgR * 2);

        if (ca > 0.5) {
          const tf = Math.max(8, minDim * 0.014);
          ctx.font = `600 ${tf}px -apple-system, sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = rgba(crystalC, ELEMENT_ALPHA.text.max * entrance * (ca - 0.5) * 2);
          ctx.fillText('The Lesson', cx, cy);
        }
      }

      ctx.restore();
      if (s.crackAnim >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.cracked ? 0.5 + ca * 0.5 : s.taps / TAPS_TO_BREAK * 0.5);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = () => {
      const s = stateRef.current;
      if (s.cracked) return;
      s.taps++; s.shakeFrames = 6;
      cbRef.current.onHaptic('tap');
      if (s.taps >= TAPS_TO_BREAK) { s.cracked = true; cbRef.current.onHaptic('step_advance'); }
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
    <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
  </div>);
}