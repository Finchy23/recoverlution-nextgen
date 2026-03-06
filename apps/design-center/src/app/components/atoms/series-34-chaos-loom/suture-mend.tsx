/**
 * ATOM 337: THE SUTURE ENGINE
 * Series 34 — Chaos Loom · Position 7
 *
 * Massive jagged tear down middle. Zig-zag swipes stitch
 * the tear back into solid unbroken plane.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale, type RGB } from '../atom-utils';

const STITCH_COUNT = 8;

export default function SutureMendAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const st = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    stitches: 0, healed: false, healAnim: 0, completed: false,
    swiping: false, lastX: 0, lastDir: 0,
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
      if (p.phase === 'resolve') s.stitches = STITCH_COUNT;

      const ratio = Math.min(1, s.stitches / STITCH_COUNT);
      if (ratio >= 1 && !s.healed) { s.healed = true; cb.onHaptic('completion'); }
      if (s.healed) s.healAnim = Math.min(1, s.healAnim + 0.012 * ms);
      cb.onStateChange?.(s.healed ? 0.5 + s.healAnim * 0.5 : ratio * 0.5);

      const tearGap = px(0.015 * (1 - ratio), minDim);

      // Jagged tear
      ctx.beginPath();
      for (let y = 0; y < h; y += 6) {
        const jag = Math.sin(y * 0.08) * px(0.005, minDim);
        ctx.lineTo(cx + jag + tearGap, y);
      }
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.2 * (1 - ratio) * entrance);
      ctx.lineWidth = px(0.0008, minDim); ctx.stroke();
      ctx.beginPath();
      for (let y = 0; y < h; y += 6) {
        const jag = Math.sin(y * 0.08) * px(0.005, minDim);
        ctx.lineTo(cx + jag - tearGap, y);
      }
      ctx.stroke();

      // Stitches
      const stitchSpacing = h / (STITCH_COUNT + 1);
      for (let i = 0; i < Math.min(s.stitches, STITCH_COUNT); i++) {
        const sy = stitchSpacing * (i + 1);
        const dir = i % 2 === 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(cx - px(0.015, minDim) * dir, sy - px(0.008, minDim));
        ctx.lineTo(cx + px(0.015, minDim) * dir, sy + px(0.008, minDim));
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
        ctx.lineWidth = px(0.001, minDim); ctx.stroke();
      }

      // Healed glow
      if (ratio > 0.5) {
        ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.glow.max * 0.15 * ratio * entrance);
        ctx.lineWidth = px(0.004 * ratio, minDim); ctx.stroke();
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { st.current.swiping = true; st.current.lastX = e.clientX; };
    const onMove = (e: PointerEvent) => {
      if (!st.current.swiping || st.current.healed) return;
      const dx = e.clientX - st.current.lastX;
      const dir = dx > 0 ? 1 : -1;
      if (Math.abs(dx) > 25 && dir !== st.current.lastDir) {
        st.current.stitches++; st.current.lastDir = dir; st.current.lastX = e.clientX;
        cbRef.current.onHaptic('drag_snap');
      }
    };
    const onUp = () => { st.current.swiping = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ew-resize' }} /></div>);
}
