/**
 * ATOM 354: THE VELOCITY SLED ENGINE
 * ====================================
 * Series 36 — Friction Spark · Position 4
 *
 * Cure the Procrastination Wall. Massive dense node at bottom.
 * Rapid repeated upward swipes push against gravity. Stop and
 * it falls back. Sprint until escape velocity.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale } from '../atom-utils';

const NODE_RADIUS = 0.06;
const GRAVITY = 0.0008;
const SWIPE_BOOST = 0.012;
const ESCAPE_Y = 0.05;

export default function VelocitySledAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    nodeY: 0.85, vy: 0, escaped: false, escapeAnim: 0, completed: false,
    trail: [] as { y: number; age: number }[],
    swiping: false, lastY: 0,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;
    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion); s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') { s.nodeY = -0.1; s.escaped = true; }

      if (!s.escaped) {
        s.vy += GRAVITY * ms; // gravity pulls down
        s.nodeY = Math.min(0.88, s.nodeY + s.vy);
        if (s.nodeY >= 0.88) s.vy = 0;
        if (s.nodeY <= ESCAPE_Y) { s.escaped = true; cb.onHaptic('completion'); }
      }
      if (s.escaped) { s.escapeAnim = Math.min(1, s.escapeAnim + 0.012 * ms); s.nodeY -= 0.005 * ms; }
      cb.onStateChange?.(s.escaped ? 0.5 + s.escapeAnim * 0.5 : Math.max(0, 1 - s.nodeY) * 0.5);

      // Trail
      s.trail.push({ y: s.nodeY, age: 0 });
      if (s.trail.length > 30) s.trail.shift();
      for (const t of s.trail) {
        t.age += 0.03;
        if (t.age >= 1) continue;
        const tR = minDim * NODE_RADIUS * (1 - t.age) * 0.3;
        ctx.beginPath(); ctx.arc(cx, t.y * h, tR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * (1 - t.age) * 0.1 * entrance); ctx.fill();
      }

      // Velocity streaks
      if (Math.abs(s.vy) > 0.003) {
        const streakLen = Math.abs(s.vy) * minDim * 8;
        const sg = ctx.createLinearGradient(cx, s.nodeY * h, cx, s.nodeY * h + streakLen);
        sg.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance));
        sg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(cx - minDim * 0.02, s.nodeY * h, minDim * 0.04, streakLen);
      }

      // Node — massive
      const nR = minDim * NODE_RADIUS;
      const nodeGlow = ctx.createRadialGradient(cx, s.nodeY * h, 0, cx, s.nodeY * h, nR * 3);
      nodeGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
      nodeGlow.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * entrance));
      nodeGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = nodeGlow; ctx.fillRect(cx - nR * 3, s.nodeY * h - nR * 3, nR * 6, nR * 6);
      ctx.beginPath(); ctx.arc(cx, s.nodeY * h, nR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.escaped ? s.primaryRgb : s.accentRgb, ALPHA.content.max * 0.5 * entrance); ctx.fill();

      // Escape threshold line
      ctx.beginPath(); ctx.moveTo(w * 0.2, ESCAPE_Y * h); ctx.lineTo(w * 0.8, ESCAPE_Y * h);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance);
      ctx.lineWidth = px(0.0005, minDim); ctx.setLineDash([px(0.005, minDim), px(0.005, minDim)]); ctx.stroke();
      ctx.setLineDash([]);

      // Escape burst
      if (s.escaped) {
        const burstR = minDim * 0.2 * s.escapeAnim;
        const bg = ctx.createRadialGradient(cx, 0, 0, cx, 0, burstR);
        bg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * (1 - s.escapeAnim) * entrance));
        bg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = bg; ctx.fillRect(cx - burstR, -burstR, burstR * 2, burstR * 2);
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.swiping = true; stateRef.current.lastY = e.clientY; };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.swiping || s.escaped) return;
      const dy = s.lastY - e.clientY;
      if (dy > 10) { s.vy -= SWIPE_BOOST; s.lastY = e.clientY; callbacksRef.current.onHaptic('swipe_commit'); }
    };
    const onUp = () => { stateRef.current.swiping = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'n-resize' }} /></div>);
}
