/**
 * ATOM 356: THE DYNAMO ENGINE
 * Series 36 — Friction Spark · Position 6
 *
 * Cure wasting anxious energy on rumination. Spin the flywheel
 * to mechanically catch and convert anxiety into focused laser.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale } from '../atom-utils';

const WHEEL_R = 0.15;
const ANXIETY_COUNT = 40;
const SPIN_THRESHOLD = 12;

export default function DynamoSpinAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    wheelAngle: 0, spinSpeed: 0, totalSpin: 0,
    dragging: false, lastAngle: 0,
    anxietyNodes: Array.from({ length: ANXIETY_COUNT }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.006, vy: (Math.random() - 0.5) * 0.006,
      captured: false,
    })),
    converted: false, convertAnim: 0, completed: false,
    laserAlpha: 0,
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
      if (p.phase === 'resolve') s.totalSpin = SPIN_THRESHOLD;

      if (!s.dragging) s.spinSpeed *= 0.98;
      s.wheelAngle += s.spinSpeed * ms;
      const conversionRatio = Math.min(1, s.totalSpin / SPIN_THRESHOLD);

      // Capture anxiety nodes as spin increases
      for (const an of s.anxietyNodes) {
        if (!an.captured && conversionRatio > Math.random()) an.captured = true;
        if (an.captured) {
          an.x += (0.5 - an.x) * 0.03 * ms; an.y += (0.5 - an.y) * 0.03 * ms;
        } else {
          an.x += an.vx * ms; an.y += an.vy * ms;
          an.vx += (Math.random() - 0.5) * 0.001; an.vy += (Math.random() - 0.5) * 0.001;
          if (an.x < 0 || an.x > 1) an.vx *= -1;
          if (an.y < 0 || an.y > 1) an.vy *= -1;
        }
      }

      if (conversionRatio >= 1 && !s.converted) { s.converted = true; cb.onHaptic('completion'); }
      if (s.converted) { s.convertAnim = Math.min(1, s.convertAnim + 0.01 * ms); s.laserAlpha = Math.min(1, s.laserAlpha + 0.008 * ms); }
      cb.onStateChange?.(s.converted ? 0.5 + s.convertAnim * 0.5 : conversionRatio * 0.5);

      // Anxiety particles
      for (const an of s.anxietyNodes) {
        if (an.captured && s.converted) continue;
        ctx.beginPath(); ctx.arc(an.x * w, an.y * h, px(an.captured ? 0.002 : 0.004, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * (an.captured ? 0.1 : 0.2) * entrance); ctx.fill();
      }

      // Flywheel
      const wR = minDim * WHEEL_R;
      ctx.beginPath(); ctx.arc(cx, cy, wR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.converted ? s.primaryRgb : s.accentRgb, ALPHA.content.max * 0.3 * entrance);
      ctx.lineWidth = px(0.003, minDim); ctx.stroke();
      // Spokes
      for (let i = 0; i < 6; i++) {
        const a = s.wheelAngle + (i / 6) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * wR, cy + Math.sin(a) * wR);
        ctx.strokeStyle = rgba(s.converted ? s.primaryRgb : s.accentRgb, ALPHA.content.max * 0.15 * entrance);
        ctx.lineWidth = px(0.001, minDim); ctx.stroke();
      }
      // Center hub
      ctx.beginPath(); ctx.arc(cx, cy, px(0.012, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.converted ? s.primaryRgb : s.accentRgb, ALPHA.content.max * 0.4 * entrance); ctx.fill();

      // Conversion glow
      if (conversionRatio > 0.3) {
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, wR);
        cg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * conversionRatio * entrance));
        cg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = cg; ctx.fillRect(cx - wR, cy - wR, wR * 2, wR * 2);
      }

      // Laser beam (right side output)
      if (s.converted) {
        const laserGrad = ctx.createLinearGradient(cx + wR, cy, w, cy);
        laserGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.4 * s.laserAlpha * entrance));
        laserGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = laserGrad;
        ctx.fillRect(cx + wR, cy - px(0.003, minDim), w - cx - wR, px(0.006, minDim));
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.dragging = true; const rect = canvas.getBoundingClientRect(); stateRef.current.lastAngle = Math.atan2(e.clientY - rect.top - rect.height / 2, e.clientX - rect.left - rect.width / 2); };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const a = Math.atan2(e.clientY - rect.top - rect.height / 2, e.clientX - rect.left - rect.width / 2);
      let d = a - s.lastAngle; if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2;
      s.spinSpeed = d * 0.5; s.totalSpin += Math.abs(d); s.lastAngle = a;
    };
    const onUp = () => { stateRef.current.dragging = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} /></div>);
}
