/**
 * ATOM 331: THE LOOM ANCHOR ENGINE
 * Series 34 — Chaos Loom · Position 1
 *
 * Chaotic threads rushing horizontally. Press and hold in center.
 * Threads wrap around touch point, weaving into fabric.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

const THREAD_COUNT = 15;

export default function LoomAnchorAtom({
  breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const st = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    threads: Array.from({ length: THREAD_COUNT }, (_, i) => ({
      y: 0.1 + (i / THREAD_COUNT) * 0.8,
      phase: Math.random() * Math.PI * 2, speed: 0.5 + Math.random() * 1.5,
      caught: false, wrapProgress: 0,
    })),
    holding: false, holdProgress: 0, woven: false, weaveAnim: 0, completed: false,
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
      if (p.phase === 'resolve') s.holdProgress = 1;

      if (s.holding) s.holdProgress = Math.min(1, s.holdProgress + 0.004 * ms);
      else if (!s.woven) s.holdProgress = Math.max(0, s.holdProgress - 0.002);

      // Catch threads progressively
      const catchThreshold = s.holdProgress;
      for (const t of s.threads) {
        if (!t.caught && catchThreshold > 0.3 + Math.random() * 0.01) {
          t.caught = true;
        }
        if (t.caught) t.wrapProgress = Math.min(1, t.wrapProgress + 0.01 * ms);
      }

      const caughtCount = s.threads.filter(t => t.caught).length;
      if (caughtCount === THREAD_COUNT && !s.woven) { s.woven = true; cb.onHaptic('completion'); }
      if (s.woven) s.weaveAnim = Math.min(1, s.weaveAnim + 0.012 * ms);
      cb.onStateChange?.(s.woven ? 0.5 + s.weaveAnim * 0.5 : caughtCount / THREAD_COUNT * 0.5);

      for (const t of s.threads) {
        ctx.beginPath();
        if (t.caught) {
          // Wrapping around center
          const wrapR = px(0.02 + t.wrapProgress * 0.04, minDim);
          for (let x = 0; x <= w; x += 3) {
            const frac = x / w;
            const distToCenter = Math.abs(frac - 0.5);
            const wrap = t.wrapProgress * Math.max(0, 1 - distToCenter * 4);
            const ty = t.y * h + Math.sin(frac * 8 + t.phase) * wrapR * (1 - wrap);
            const pullY = cy + (t.y * h - cy) * (1 - wrap * 0.5);
            if (x === 0) ctx.moveTo(x, pullY + Math.sin(frac * 8 + t.phase) * wrapR * (1 - wrap));
            else ctx.lineTo(x, pullY + Math.sin(frac * 8 + t.phase) * wrapR * (1 - wrap));
          }
        } else {
          // Free rushing
          t.phase += t.speed * 0.02 * ms;
          for (let x = 0; x <= w; x += 4) {
            const frac = x / w;
            const val = Math.sin(frac * 6 + t.phase) * px(0.015, minDim);
            if (x === 0) ctx.moveTo(x, t.y * h + val); else ctx.lineTo(x, t.y * h + val);
          }
        }
        ctx.strokeStyle = rgba(t.caught ? s.primaryRgb : s.accentRgb,
          ALPHA.content.max * (t.caught ? 0.3 + t.wrapProgress * 0.2 : 0.15) * entrance);
        ctx.lineWidth = px(0.0008, minDim); ctx.stroke();
      }

      // Hold indicator
      if (s.holding && !s.woven) {
        ctx.beginPath(); ctx.arc(cx, cy, px(0.01, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance); ctx.fill();
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = () => { st.current.holding = true; cbRef.current.onHaptic('hold_start'); };
    const onUp = () => { st.current.holding = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
