/**
 * ATOM 355: THE BOWSTRING ENGINE
 * ================================
 * Series 36 — Friction Spark · Position 5
 *
 * Cure guilt over resting. Slow patient pull stores massive kinetic
 * potential. Release rockets the node into the void with force
 * proportional to patience.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale } from '../atom-utils';

const BOW_WIDTH = 0.25;
const NODE_R = 0.025;
const MAX_DRAW = 0.3;
const LAUNCH_SPEED = 0.05;

export default function BowstringDrawAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    drawAmount: 0, dragging: false, startY: 0,
    launched: false, nodeY: 0.5, nodeVy: 0, launchAnim: 0, completed: false,
    storedEnergy: 0,
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
      if (p.phase === 'resolve') { s.launched = true; s.nodeY = -0.1; }

      if (s.launched) {
        s.nodeY += s.nodeVy * ms;
        s.launchAnim = Math.min(1, s.launchAnim + 0.01 * ms);
        if (s.nodeY <= -0.05 && !s.completed) { s.completed = true; cb.onHaptic('completion'); }
      }
      cb.onStateChange?.(s.launched ? 0.5 + s.launchAnim * 0.5 : s.drawAmount / MAX_DRAW * 0.5);

      const restY = 0.45;
      const stringY = restY + s.drawAmount;
      const bowTopY = restY - 0.15;
      const bowBotY = restY + 0.15;
      const bowW = minDim * BOW_WIDTH;

      // ── Bow arms ────────────────────────────────────
      ctx.beginPath();
      ctx.moveTo(cx - bowW / 2, bowTopY * h);
      ctx.quadraticCurveTo(cx - bowW * 0.7, restY * h, cx - bowW / 2, bowBotY * h);
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.35 * entrance);
      ctx.lineWidth = px(0.003, minDim); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + bowW / 2, bowTopY * h);
      ctx.quadraticCurveTo(cx + bowW * 0.7, restY * h, cx + bowW / 2, bowBotY * h);
      ctx.stroke();

      // ── Bowstring ───────────────────────────────────
      if (!s.launched) {
        ctx.beginPath();
        ctx.moveTo(cx - bowW / 2, bowTopY * h);
        ctx.lineTo(cx, stringY * h);
        ctx.lineTo(cx + bowW / 2, bowBotY * h);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * (0.2 + s.drawAmount * 1.5) * entrance);
        ctx.lineWidth = px(0.001 + s.drawAmount * 0.003, minDim); ctx.stroke();

        // Tension glow along string
        if (s.drawAmount > 0.05) {
          const tg = ctx.createRadialGradient(cx, stringY * h, 0, cx, stringY * h, minDim * 0.06);
          tg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * (s.drawAmount / MAX_DRAW) * entrance));
          tg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = tg;
          ctx.fillRect(cx - minDim * 0.06, stringY * h - minDim * 0.06, minDim * 0.12, minDim * 0.12);
        }
      }

      // ── Node ────────────────────────────────────────
      const nY = s.launched ? s.nodeY : stringY;
      const nR = minDim * NODE_R;
      if (nY > -0.1) {
        // Glow
        const ng = ctx.createRadialGradient(cx, nY * h, 0, cx, nY * h, nR * 4);
        ng.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * entrance));
        ng.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = ng; ctx.fillRect(cx - nR * 4, nY * h - nR * 4, nR * 8, nR * 8);
        // Body
        ctx.beginPath(); ctx.arc(cx, nY * h, nR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.6 * entrance); ctx.fill();
      }

      // Launch trail
      if (s.launched && s.nodeY > -0.1) {
        const trailH = minDim * 0.15 * s.storedEnergy;
        const tg = ctx.createLinearGradient(cx, s.nodeY * h, cx, s.nodeY * h + trailH);
        tg.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance));
        tg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = tg; ctx.fillRect(cx - nR, s.nodeY * h, nR * 2, trailH);
      }

      // Energy stored indicator
      if (!s.launched && s.drawAmount > 0.01) {
        const barH = minDim * 0.15 * (s.drawAmount / MAX_DRAW);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.fillRect(w * 0.08, cy - barH / 2, px(0.003, minDim), barH);
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.dragging = true; stateRef.current.startY = e.clientY; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.dragging || s.launched) return;
      const rect = canvas.getBoundingClientRect();
      const dy = (e.clientY - s.startY) / rect.height;
      s.drawAmount = Math.max(0, Math.min(MAX_DRAW, dy));
    };
    const onUp = () => {
      const s = stateRef.current; s.dragging = false;
      if (s.drawAmount > 0.05 && !s.launched) {
        s.storedEnergy = s.drawAmount / MAX_DRAW;
        s.nodeVy = -LAUNCH_SPEED * s.storedEnergy;
        s.launched = true;
        callbacksRef.current.onHaptic('swipe_commit');
      }
      s.drawAmount = 0;
    };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ns-resize' }} /></div>);
}
