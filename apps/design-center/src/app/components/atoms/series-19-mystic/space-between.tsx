/**
 * ATOM 184: THE SPACE BETWEEN ENGINE · Series 19 · Position 4
 * Thoughts are clouds; you are the sky. Frantic clouds scroll by
 * at depth — tap to deepen the blue background anchor.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

interface Cloud { x: number; y: number; w: number; speed: number; depth: number; }

export default function SpaceBetweenAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    clouds: [] as Cloud[], inited: false, skyDepth: 0, tapCount: 0, completionFired: false,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;
    const s = stateRef.current;
    if (!s.inited) {
      const minDim0 = Math.min(viewport.width, viewport.height);
      for (let i = 0; i < 8; i++) {
        s.clouds.push({
          x: Math.random() * viewport.width,
          y: minDim0 * 0.05 + Math.random() * viewport.height * 0.7,
          w: minDim0 * (0.06 + Math.random() * 0.08),
          speed: minDim0 * (0.0005 + Math.random() * 0.001),
          depth: 0.3 + Math.random() * 0.7,
        });
      }
      s.inited = true;
    }

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const skyC: RGB = lerpColor(accentC, [40, 80, 160], 0.3);
      const cloudC: RGB = lerpColor(accentC, [180, 180, 190], 0.4);

      const sd = easeOutCubic(Math.min(1, s.skyDepth));

      // Deep sky background
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.5);
      bgGrad.addColorStop(0, rgba(skyC, ELEMENT_ALPHA.glow.max * (1 + sd * 2) * entrance));
      bgGrad.addColorStop(1, rgba(skyC, ELEMENT_ALPHA.glow.max * 0.3 * entrance));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Clouds — move and wrap
      for (const c of s.clouds) {
        c.x += c.speed * c.depth * ms;
        if (c.x > w + c.w) c.x = -c.w;
        const blur = sd * c.depth;
        const cAlpha = ELEMENT_ALPHA.primary.max * (1 - blur * 0.5) * c.depth * entrance;
        const cGrad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.w);
        cGrad.addColorStop(0, rgba(cloudC, cAlpha));
        cGrad.addColorStop(0.5, rgba(cloudC, cAlpha * 0.5));
        cGrad.addColorStop(1, rgba(cloudC, 0));
        ctx.fillStyle = cGrad;
        ctx.fillRect(c.x - c.w, c.y - c.w * 0.4, c.w * 2, c.w * 0.8);
      }

      // Center anchor point — "you"
      const anchorR = minDim * 0.005 * (1 + sd * 2);
      const aGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, anchorR * 4);
      aGrad.addColorStop(0, rgba(lerpColor(baseC, [255, 255, 255] as RGB, 0.85), ELEMENT_ALPHA.glow.max * (1 + sd) * entrance));
      aGrad.addColorStop(1, rgba(lerpColor(baseC, [255, 255, 255] as RGB, 0.85), 0));
      ctx.fillStyle = aGrad; ctx.fillRect(cx - anchorR * 4, cy - anchorR * 4, anchorR * 8, anchorR * 8);

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(lerpColor(baseC, [255, 255, 255] as RGB, 0.85), ELEMENT_ALPHA.text.min * entrance);
      if (s.tapCount < 5) ctx.fillText('Tap to anchor in the sky', cx, h - minDim * 0.04);
      else ctx.fillText('You are the sky.', cx, h - minDim * 0.04);

      if (s.tapCount >= 5 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(Math.min(1, s.skyDepth));
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = () => {
      stateRef.current.skyDepth = Math.min(1, stateRef.current.skyDepth + 0.2);
      stateRef.current.tapCount++;
      cbRef.current.onHaptic('tap');
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}