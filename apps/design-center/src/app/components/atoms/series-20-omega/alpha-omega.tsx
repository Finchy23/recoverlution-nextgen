/**
 * ATOM 196: THE ALPHA OMEGA ENGINE · Series 20 · Position 6
 * Every ending is simultaneously a beginning.
 * Drag chaotic symbols — they morph into a smooth infinity glide.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale,
  type RGB,
} from '../atom-utils';

interface Symbol { x: number; y: number; angle: number; speed: number; char: string; }

export default function AlphaOmegaAtom({
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
    morphProgress: 0, dragging: false, lastX: 0, completionFired: false,
    symbols: [] as Symbol[], inited: false,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;
    const s = stateRef.current;
    if (!s.inited) {
      const chars = ['α', 'ω', '∞', '◯', '△', '□', '☆', '◇'];
      for (let i = 0; i < 12; i++) {
        s.symbols.push({
          x: Math.random(), y: Math.random(),
          angle: Math.random() * Math.PI * 2,
          speed: 0.002 + Math.random() * 0.003,
          char: chars[i % chars.length],
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
      const chaosC: RGB = lerpColor(accentC, [200, 100, 80], 0.3);
      const harmonyC: RGB = lerpColor(accentC, [180, 200, 240], 0.3);
      const mp = easeOutCubic(s.morphProgress);
      const blendC: RGB = lerpColor(chaosC, harmonyC, mp);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      const infR = minDim * 0.1;
      for (const sym of s.symbols) {
        const chaosX = sym.x * w + Math.sin(s.frameCount * sym.speed * 3 * ms + sym.angle) * minDim * 0.05 * (1 - mp);
        const chaosY = sym.y * h + Math.cos(s.frameCount * sym.speed * 2 * ms + sym.angle) * minDim * 0.04 * (1 - mp);
        const t = (sym.angle + s.frameCount * 0.005 * ms) % (Math.PI * 2);
        const denom = 1 + Math.sin(t) ** 2;
        const orbX = cx + infR * Math.cos(t) / denom;
        const orbY = cy + infR * Math.sin(t) * Math.cos(t) / denom;
        const px = chaosX + (orbX - chaosX) * mp;
        const py = chaosY + (orbY - chaosY) * mp;

        const fs = minDim * 0.015;
        ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba(blendC, EMPHASIS_ALPHA.focal.min * entrance);
        ctx.fillText(sym.char, px, py);
      }

      // Smooth infinity trace
      if (mp > 0.3) {
        const traceAlpha = (mp - 0.3) / 0.7;
        ctx.beginPath();
        for (let t = 0; t <= Math.PI * 2; t += 0.03) {
          const denom = 1 + Math.sin(t) ** 2;
          const ix = cx + infR * Math.cos(t) / denom;
          const iy = cy + infR * Math.sin(t) * Math.cos(t) / denom;
          if (t === 0) ctx.moveTo(ix, iy); else ctx.lineTo(ix, iy);
        }
        ctx.closePath();
        ctx.strokeStyle = rgba(harmonyC, ELEMENT_ALPHA.primary.max * traceAlpha * entrance);
        ctx.lineWidth = minDim * 0.0012; ctx.stroke();
      }

      const fs2 = minDim * 0.013;
      ctx.font = `${fs2}px -apple-system, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (mp < 0.95) ctx.fillText('Drag to synthesize', cx, h - minDim * 0.04);
      else ctx.fillText('α ≡ ω', cx, h - minDim * 0.04);

      if (mp >= 0.95 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.morphProgress);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.dragging = true; stateRef.current.lastX = e.clientX; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.dragging) return;
      const dx = Math.abs(e.clientX - s.lastX);
      s.morphProgress = Math.min(1, s.morphProgress + dx * 0.003);
      s.lastX = e.clientX;
      if (s.morphProgress > 0.5 && s.morphProgress < 0.52) cbRef.current.onHaptic('drag_snap');
    };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} /></div>);
}
