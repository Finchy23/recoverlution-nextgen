/**
 * ATOM 352: THE PISTON ENGINE
 * ============================
 * Series 36 — Friction Spark · Position 2
 *
 * Cure boredom and the refusal to do repetitive unglamorous work.
 * Massive heavy piston. Drag down and release. Each pump generates
 * a fraction of internal light. 10 pumps to fully prime the engine.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, FONT_SIZE,
} from '../atom-utils';

const PISTON_WIDTH = 0.35;
const PISTON_HEIGHT = 0.12;
const CYLINDER_TOP = 0.25;
const CYLINDER_BOT = 0.7;
const MAX_PUMPS = 10;
const SPRING_RETURN = 0.06;

export default function PistonPumpAtom({
  breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    pistonY: CYLINDER_TOP, pumps: 0,
    dragging: false, dragStartY: 0, wasPushedDown: false,
    lightLevel: 0, primed: false, primeAnim: 0, completed: false,
    lightPulse: 0,
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
      if (p.phase === 'resolve') s.pumps = MAX_PUMPS;

      // Spring return
      if (!s.dragging && s.pistonY > CYLINDER_TOP + 0.01) {
        s.pistonY += (CYLINDER_TOP - s.pistonY) * SPRING_RETURN * ms;
        if (s.wasPushedDown && s.pistonY < CYLINDER_TOP + 0.03) {
          // Count pump on return
          if (s.pumps < MAX_PUMPS) {
            s.pumps++; s.lightPulse = 1;
            cb.onHaptic('step_advance');
          }
          s.wasPushedDown = false;
        }
      }

      s.lightLevel += ((s.pumps / MAX_PUMPS) - s.lightLevel) * 0.03 * ms;
      if (s.pumps >= MAX_PUMPS && !s.primed) { s.primed = true; cb.onHaptic('completion'); }
      if (s.primed) s.primeAnim = Math.min(1, s.primeAnim + 0.01 * ms);
      s.lightPulse = Math.max(0, s.lightPulse - 0.02);
      cb.onStateChange?.(s.primed ? 0.5 + s.primeAnim * 0.5 : s.lightLevel * 0.5);

      const cylW = minDim * PISTON_WIDTH;
      const cylL = cx - cylW / 2;
      const cylT = CYLINDER_TOP * h;
      const cylB = CYLINDER_BOT * h;
      const pisH = minDim * PISTON_HEIGHT;
      const pisY = s.pistonY * h;

      // ── Cylinder housing ────────────────────────────
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance);
      ctx.lineWidth = px(0.002, minDim);
      ctx.beginPath(); ctx.moveTo(cylL, cylT); ctx.lineTo(cylL, cylB);
      ctx.lineTo(cylL + cylW, cylB); ctx.lineTo(cylL + cylW, cylT); ctx.stroke();

      // ── Internal light chamber ──────────────────────
      const lightH = (cylB - pisY - pisH) * s.lightLevel;
      if (s.lightLevel > 0.05) {
        const lg = ctx.createLinearGradient(cx, cylB, cx, cylB - lightH);
        lg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * s.lightLevel * entrance));
        lg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = lg;
        ctx.fillRect(cylL + px(0.001, minDim), cylB - lightH, cylW - px(0.002, minDim), lightH);
      }

      // Light pulse flash
      if (s.lightPulse > 0) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * s.lightPulse * entrance);
        ctx.fillRect(cylL, pisY + pisH, cylW, cylB - pisY - pisH);
      }

      // ── Piston head ─────────────────────────────────
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.4 * entrance);
      ctx.fillRect(cylL + px(0.002, minDim), pisY, cylW - px(0.004, minDim), pisH);
      // Piston rod
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.25 * entrance);
      ctx.fillRect(cx - px(0.006, minDim), pisY - minDim * 0.08, px(0.012, minDim), minDim * 0.08);
      // Grip marks on piston
      for (let i = 0; i < 3; i++) {
        const gy = pisY + pisH * 0.25 + i * pisH * 0.2;
        ctx.beginPath(); ctx.moveTo(cylL + cylW * 0.2, gy);
        ctx.lineTo(cylL + cylW * 0.8, gy);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.1 * entrance);
        ctx.lineWidth = px(0.0008, minDim); ctx.stroke();
      }

      // ── Pump counter ────────────────────────────────
      if (s.pumps > 0 && !s.primed) {
        const counterY = h * 0.12;
        ctx.beginPath(); ctx.arc(cx, counterY, px(0.02, minDim), -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * s.pumps / MAX_PUMPS));
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.35 * entrance);
        ctx.lineWidth = px(0.002, minDim); ctx.stroke();
      }

      // ── Primed state — sustained glow ───────────────
      if (s.primed) {
        const gR = minDim * 0.25 * s.primeAnim;
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * s.primeAnim * entrance));
        gg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * s.primeAnim * entrance));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg; ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current; if (s.primed) return;
      const rect = canvas.getBoundingClientRect();
      const my = (e.clientY - rect.top) / rect.height;
      if (my >= s.pistonY - 0.05 && my <= s.pistonY + PISTON_HEIGHT + 0.1) {
        s.dragging = true; s.dragStartY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
        callbacksRef.current.onHaptic('drag_snap');
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const my = (e.clientY - rect.top) / rect.height;
      s.pistonY = Math.max(CYLINDER_TOP, Math.min(CYLINDER_BOT - PISTON_HEIGHT, my - PISTON_HEIGHT / 2));
      if (s.pistonY > CYLINDER_TOP + 0.15) s.wasPushedDown = true;
    };
    const onUp = () => { stateRef.current.dragging = false; };

    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ns-resize' }} />
    </div>
  );
}
