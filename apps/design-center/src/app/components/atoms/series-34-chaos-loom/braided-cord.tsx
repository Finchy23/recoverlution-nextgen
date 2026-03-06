/**
 * ATOM 334: THE BRAIDED CORD ENGINE
 * Series 34 — Chaos Loom · Position 4
 *
 * Three thin fragile lines. Rhythmic left-right swiping braids them
 * into mathematically thicker, heavier, glowing cord.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale, type RGB } from '../atom-utils';

const BRAID_STEPS = 10;

export default function BraidedCordAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const st = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    braids: 0, lastSwipeDir: 0, swiping: false, lastX: 0,
    braided: false, braidAnim: 0, completed: false,
  });
  useEffect(() => { st.current.primaryRgb = parseColor(color); st.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = st.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion); s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.braids = BRAID_STEPS;

      const braidRatio = Math.min(1, s.braids / BRAID_STEPS);
      if (braidRatio >= 1 && !s.braided) { s.braided = true; cb.onHaptic('completion'); }
      if (s.braided) s.braidAnim = Math.min(1, s.braidAnim + 0.012 * ms);
      cb.onStateChange?.(s.braided ? 0.5 + s.braidAnim * 0.5 : braidRatio * 0.5);

      // Three strands
      const thickness = px(0.0008 + braidRatio * 0.003, minDim);
      const amplitude = px(0.02 * (1 - braidRatio * 0.5), minDim);
      const strands = 3;
      for (let si = 0; si < strands; si++) {
        ctx.beginPath();
        const phaseOff = (si / strands) * Math.PI * 2;
        for (let y = 0; y < h; y += 3) {
          const frac = y / h;
          const xOff = Math.sin(frac * 8 + phaseOff + s.frameCount * 0.01) * amplitude;
          // Converge toward center as braiding progresses
          const convergence = braidRatio * 0.5;
          const baseX = cx + (si - 1) * px(0.02 * (1 - convergence), minDim);
          if (y === 0) ctx.moveTo(baseX + xOff, y); else ctx.lineTo(baseX + xOff, y);
        }
        ctx.strokeStyle = rgba(s.braided ? s.primaryRgb : s.accentRgb,
          ALPHA.content.max * (0.2 + braidRatio * 0.3) * entrance);
        ctx.lineWidth = thickness; ctx.stroke();
      }

      // Glow when braided
      if (braidRatio > 0.5) {
        const gR = px(0.015 + braidRatio * 0.02, minDim);
        for (let y = 0; y < h; y += px(0.06, minDim)) {
          const gg = ctx.createRadialGradient(cx, y, 0, cx, y, gR);
          gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.min * 0.2 * braidRatio * entrance));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg; ctx.fillRect(cx - gR, y - gR, gR * 2, gR * 2);
        }
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { st.current.swiping = true; st.current.lastX = e.clientX; };
    const onMove = (e: PointerEvent) => {
      if (!st.current.swiping || st.current.braided) return;
      const dx = e.clientX - st.current.lastX;
      const dir = dx > 0 ? 1 : -1;
      if (Math.abs(dx) > 30 && dir !== st.current.lastSwipeDir) {
        st.current.braids++; st.current.lastSwipeDir = dir;
        st.current.lastX = e.clientX; cbRef.current.onHaptic('swipe_commit');
      }
    };
    const onUp = () => { st.current.swiping = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ew-resize' }} /></div>);
}
