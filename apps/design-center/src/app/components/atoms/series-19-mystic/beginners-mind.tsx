/**
 * ATOM 185: THE BEGINNER'S MIND ENGINE · Series 19 · Position 5
 * Expertise is a trap. Swipe to wipe labels off objects,
 * revealing a pristine glowing white canvas of total potential.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

const LABELS_LIST = ['Expert', 'Known', 'Obvious', 'Mastered', 'Certain', 'Solved'];

export default function BeginnersMindAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    wiped: 0, wipeAnims: new Array(LABELS_LIST.length).fill(0),
    swiping: false, swipeStartX: 0, completionFired: false,
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
      const labelC: RGB = lerpColor(accentC, [140, 140, 150], 0.4);
      const whiteC: RGB = lerpColor(baseC, [255, 255, 255] as RGB, 0.85);

      for (let i = 0; i < LABELS_LIST.length; i++) if (i < s.wiped) s.wipeAnims[i] = Math.min(1, s.wipeAnims[i] + 0.04);

      const cleanPct = s.wiped / LABELS_LIST.length;
      const cleanEased = easeOutCubic(cleanPct);

      // Background — blooms to white as wiped
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.4);
      const bgAlpha = ELEMENT_ALPHA.glow.max * (0.5 + cleanEased * 2) * entrance;
      bgGrad.addColorStop(0, rgba(lerpColor(baseC, whiteC, cleanEased), bgAlpha));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Label tags
      for (let i = 0; i < LABELS_LIST.length; i++) {
        const col = i % 3; const row = Math.floor(i / 3);
        const lx = cx - minDim * 0.1 + col * minDim * 0.1;
        const ly = cy - minDim * 0.04 + row * minDim * 0.06;
        const wa = easeOutCubic(s.wipeAnims[i]);

        if (wa < 1) {
          const tagW = minDim * 0.07; const tagH = minDim * 0.025;
          ctx.fillStyle = rgba(labelC, ELEMENT_ALPHA.primary.max * (1.5 - wa * 1.5) * entrance);
          ctx.fillRect(lx - tagW / 2 * (1 - wa), ly - tagH / 2, tagW * (1 - wa), tagH);
          if (wa < 0.3) {
            const fs = Math.max(6, minDim * 0.008);
            ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
            ctx.fillStyle = rgba(whiteC, ELEMENT_ALPHA.text.max * (1 - wa * 3) * entrance);
            ctx.fillText(LABELS_LIST[i], lx, ly + minDim * 0.003);
          }
        } else {
          // Glowing spot
          const gR = minDim * 0.015;
          const gGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, gR);
          gGrad.addColorStop(0, rgba(whiteC, ELEMENT_ALPHA.glow.max * entrance));
          gGrad.addColorStop(1, rgba(whiteC, 0));
          ctx.fillStyle = gGrad; ctx.fillRect(lx - gR, ly - gR, gR * 2, gR * 2);
        }
      }

      const fs2 = Math.max(8, minDim * 0.013);
      ctx.font = `${fs2}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (s.wiped < LABELS_LIST.length) ctx.fillText('Swipe right to wipe labels', cx, cy + minDim * 0.15);
      else ctx.fillText('Shoshin. See fresh.', cx, cy + minDim * 0.15);

      if (s.wiped >= LABELS_LIST.length && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(cleanPct);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.swiping = true; stateRef.current.swipeStartX = e.clientX; canvas.setPointerCapture(e.pointerId); };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.swiping && e.clientX - s.swipeStartX > 40 && s.wiped < LABELS_LIST.length) {
        s.wiped++; cbRef.current.onHaptic('swipe_commit');
      }
      s.swiping = false; canvas.releasePointerCapture(e.pointerId);
    };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}