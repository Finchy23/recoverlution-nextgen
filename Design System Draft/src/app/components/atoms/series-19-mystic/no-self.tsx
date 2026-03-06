/**
 * ATOM 182: THE NO-SELF ENGINE · Series 19 · Position 2
 * The ego is a construct. Tap stone pieces of identity —
 * they evaporate into glowing dust, unburdened relief.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

const STONES = ['Status', 'Titles', 'Opinions', 'Image', 'Control'];

export default function NoSelfAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    dissolved: 0, dissolveAnims: new Array(STONES.length).fill(0),
    dustParticles: [] as { x: number; y: number; vx: number; vy: number; life: number }[],
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
      const stoneC: RGB = lerpColor(accentC, [140, 130, 120], 0.4);
      const dustC: RGB = lerpColor(accentC, [240, 220, 160], 0.3);

      for (let i = 0; i < STONES.length; i++) if (i < s.dissolved) s.dissolveAnims[i] = Math.min(1, s.dissolveAnims[i] + 0.025);

      // Dust particles
      for (let i = s.dustParticles.length - 1; i >= 0; i--) {
        const dp = s.dustParticles[i];
        dp.x += dp.vx; dp.y += dp.vy; dp.vy -= 0.02; dp.life -= 0.008;
        if (dp.life <= 0) s.dustParticles.splice(i, 1);
      }

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Stones
      const stoneW = minDim * 0.09; const stoneH = minDim * 0.04;
      for (let i = 0; i < STONES.length; i++) {
        const sx = cx; const sy = cy - minDim * 0.1 + i * minDim * 0.05;
        const da = easeOutCubic(s.dissolveAnims[i]);

        if (da < 1) {
          const alpha = ELEMENT_ALPHA.primary.max * (1.5 - da) * entrance;
          ctx.fillStyle = rgba(stoneC, alpha);
          ctx.fillRect(sx - stoneW / 2 * (1 - da), sy - stoneH / 2, stoneW * (1 - da), stoneH * (1 - da * 0.5));
          if (da < 0.5) {
            const fs = Math.max(6, minDim * 0.009 * (1 - da * 2));
            ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
            ctx.fillStyle = rgba(lerpColor(baseC, [255, 255, 255] as RGB, 0.85), ELEMENT_ALPHA.text.max * (1 - da * 2) * entrance);
            ctx.fillText(STONES[i], sx, sy + minDim * 0.003);
          }
        }
      }

      // Dust
      for (const dp of s.dustParticles) {
        const r = minDim * 0.003 * dp.life;
        const dGrad = ctx.createRadialGradient(dp.x, dp.y, 0, dp.x, dp.y, r * 2);
        dGrad.addColorStop(0, rgba(dustC, ELEMENT_ALPHA.glow.max * dp.life * entrance));
        dGrad.addColorStop(1, rgba(dustC, 0));
        ctx.fillStyle = dGrad;
        ctx.fillRect(dp.x - r * 2, dp.y - r * 2, r * 4, r * 4);
        ctx.beginPath(); ctx.arc(dp.x, dp.y, r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(dustC, ELEMENT_ALPHA.primary.max * dp.life * entrance); ctx.fill();
      }

      const fs2 = Math.max(8, minDim * 0.013);
      ctx.font = `${fs2}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (s.dissolved < STONES.length) ctx.fillText(`Tap to dissolve (${s.dissolved}/${STONES.length})`, cx, cy + minDim * 0.18);
      else ctx.fillText('Unburdened.', cx, cy + minDim * 0.18);

      if (s.dissolved >= STONES.length && s.dissolveAnims[STONES.length - 1] >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.dissolved / STONES.length);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = () => {
      const s = stateRef.current;
      if (s.dissolved >= STONES.length) return;
      const minDim2 = Math.min(viewport.width, viewport.height);
      const sy = viewport.height / 2 - minDim2 * 0.1 + s.dissolved * minDim2 * 0.05;
      for (let p = 0; p < 12; p++) {
        s.dustParticles.push({
          x: viewport.width / 2 + (Math.random() - 0.5) * minDim2 * 0.06,
          y: sy + (Math.random() - 0.5) * minDim2 * 0.02,
          vx: (Math.random() - 0.5) * minDim2 * 0.002,
          vy: -Math.random() * minDim2 * 0.002,
          life: 1,
        });
      }
      s.dissolved++;
      cbRef.current.onHaptic(s.dissolved < STONES.length ? 'step_advance' : 'tap');
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}