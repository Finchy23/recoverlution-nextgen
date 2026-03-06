/**
 * ATOM 128: THE ABSURDITY FILTER ENGINE · Series 13 · Position 8
 * Drag an "Absurdity Lens" over heavy serif text. It transforms
 * into bubbly bouncing jelly with a silly haptic pop.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function AbsurdityFilterAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    lensX: -1, lensY: -1, lensActive: false,
    absurdity: 0, completionFired: false,
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
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const funC: RGB = lerpColor(accentC, [255, 180, 100], 0.4);

      // If lens is near text, increase absurdity
      if (s.lensActive) {
        const dx = s.lensX - cx; const dy = s.lensY - cy;
        if (dx * dx + dy * dy < (minDim * 0.2) ** 2) {
          s.absurdity = Math.min(1, s.absurdity + 0.005);
        }
      }
      const ab = s.absurdity;

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Text: serious → silly
      const fontSize = Math.max(10, minDim * (0.025 + ab * 0.01));
      const weight = Math.round(700 - ab * 400);
      const bounce = !p.reducedMotion ? Math.sin(s.frameCount * 0.08 * ms) * ab * minDim * 0.01 : 0;
      const textColor = lerpColor(baseC, funC, ab * 0.8);

      ctx.save();
      ctx.translate(cx, cy + bounce);
      const scaleX = 1 + Math.sin(s.frameCount * 0.06 * ms) * ab * 0.15;
      const scaleY = 1 + Math.cos(s.frameCount * 0.08 * ms) * ab * 0.1;
      if (!p.reducedMotion) ctx.scale(scaleX, scaleY);

      ctx.font = `${weight} ${fontSize}px Georgia, serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = rgba(textColor, ELEMENT_ALPHA.text.max * (2 - ab) * entrance);
      ctx.fillText(ab < 0.7 ? 'I will never recover.' : 'i will never recover!', 0, 0);
      ctx.restore();

      // Lens
      if (s.lensActive) {
        const lR = minDim * 0.1;
        ctx.beginPath();
        ctx.arc(s.lensX, s.lensY, lR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(funC, ELEMENT_ALPHA.primary.max * entrance);
        ctx.lineWidth = minDim * 0.001;
        ctx.stroke();
        const lGrad = ctx.createRadialGradient(s.lensX, s.lensY, 0, s.lensX, s.lensY, lR);
        lGrad.addColorStop(0, rgba(funC, ELEMENT_ALPHA.secondary.max * entrance));
        lGrad.addColorStop(1, rgba(funC, 0));
        ctx.fillStyle = lGrad;
        ctx.fillRect(s.lensX - lR, s.lensY - lR, lR * 2, lR * 2);
      }

      if (!s.lensActive && ab < 0.05) {
        const pf = Math.max(8, minDim * 0.013);
        ctx.font = `${pf}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance * (0.5 + Math.sin(s.frameCount * 0.03 * ms) * 0.3));
        ctx.fillText('Drag the Absurdity Lens', cx, cy + minDim * 0.1);
      }

      if (ab >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(ab);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.lensActive = true; const rect = canvas.getBoundingClientRect(); stateRef.current.lensX = (e.clientX - rect.left) / rect.width * viewport.width; stateRef.current.lensY = (e.clientY - rect.top) / rect.height * viewport.height; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => { if (!stateRef.current.lensActive) return; const rect = canvas.getBoundingClientRect(); stateRef.current.lensX = (e.clientX - rect.left) / rect.width * viewport.width; stateRef.current.lensY = (e.clientY - rect.top) / rect.height * viewport.height; };
    const onUp = (e: PointerEvent) => { stateRef.current.lensActive = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'none' }} /></div>);
}