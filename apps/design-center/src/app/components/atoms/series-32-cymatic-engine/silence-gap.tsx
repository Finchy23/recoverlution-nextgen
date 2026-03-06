/**
 * ATOM 314: THE SILENCE GAP ENGINE
 * Series 32 — Cymatic Engine · Position 4
 *
 * Drag frequency to zero and hold for 3 seconds. UI goes dead.
 * Hidden truth materializes from the darkness.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, FONT_SIZE, type RGB,
} from '../atom-utils';

const HOLD_FRAMES = 180; // ~3 seconds
const PARTICLE_COUNT = 60;

export default function SilenceGapAtom({
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
    freq: 0.8, dragging: false, holdFrames: 0,
    particles: Array.from({ length: PARTICLE_COUNT }, () => ({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.005, vy: (Math.random() - 0.5) * 0.005 })),
    revealed: false, revealAnim: 0, completed: false,
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
      if (p.phase === 'resolve') { s.freq = 0; s.holdFrames = HOLD_FRAMES; }

      if (s.freq < 0.05) s.holdFrames += ms; else s.holdFrames = Math.max(0, s.holdFrames - 2);
      if (s.holdFrames >= HOLD_FRAMES && !s.revealed) { s.revealed = true; cb.onHaptic('completion'); }
      if (s.revealed) s.revealAnim = Math.min(1, s.revealAnim + 0.008 * ms);
      cb.onStateChange?.(s.revealed ? 0.5 + s.revealAnim * 0.5 : Math.min(0.5, s.holdFrames / HOLD_FRAMES * 0.5));

      const activity = s.freq;

      // Active particles
      if (!s.revealed || s.revealAnim < 0.5) {
        const pAlpha = activity * (s.revealed ? (1 - s.revealAnim * 2) : 1);
        for (const pt of s.particles) {
          pt.x += pt.vx * activity * ms; pt.y += pt.vy * activity * ms;
          pt.vx += (Math.random() - 0.5) * 0.001 * activity;
          pt.vy += (Math.random() - 0.5) * 0.001 * activity;
          if (pt.x < 0 || pt.x > 1) pt.vx *= -1;
          if (pt.y < 0 || pt.y > 1) pt.vy *= -1;
          ctx.beginPath(); ctx.arc(pt.x * w, pt.y * h, px(0.002, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * pAlpha * entrance); ctx.fill();
        }
      }

      // Revealed truth
      if (s.revealed) {
        ctx.save(); ctx.globalAlpha = s.revealAnim * entrance;
        ctx.font = `${FONT_SIZE.sm(minDim)}px monospace`;
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('the answer was in the silence', cx, cy);
        ctx.restore();
      }

      // Fader (left edge)
      const faderX = w * 0.08; const fT = h * 0.15; const fB = h * 0.85;
      ctx.beginPath(); ctx.moveTo(faderX, fT); ctx.lineTo(faderX, fB);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
      ctx.lineWidth = px(0.002, minDim); ctx.stroke();
      const kY = fT + (1 - s.freq) * (fB - fT);
      ctx.beginPath(); ctx.arc(faderX, kY, px(0.008, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance); ctx.fill();

      // Hold progress (when freq near zero)
      if (s.freq < 0.05 && !s.revealed) {
        const prog = Math.min(1, s.holdFrames / HOLD_FRAMES);
        ctx.beginPath(); ctx.arc(cx, cy, px(0.04, minDim), -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(0.001, minDim); ctx.stroke();
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if ((e.clientX - rect.left) / rect.width < 0.2) { st.current.dragging = true; cbRef.current.onHaptic('hold_start'); }
    };
    const onMove = (e: PointerEvent) => {
      if (!st.current.dragging) return;
      const rect = canvas.getBoundingClientRect();
      st.current.freq = Math.max(0, Math.min(1, 1 - ((e.clientY - rect.top) / rect.height - 0.15) / 0.7));
    };
    const onUp = () => { st.current.dragging = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} /></div>);
}
