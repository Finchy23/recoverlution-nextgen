/**
 * ATOM 311: THE BASE FREQUENCY ENGINE
 * Series 32 — Cymatic Engine · Position 1
 *
 * Find the resonant frequency and chaotic particles snap into geometric mandala.
 * Vertical fader slides through pitches; at exact resonance, particles self-organize.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

const PARTICLE_COUNT = 40;
const RESONANT_FREQ = 0.618; // Golden ratio sweet spot

export default function BaseFrequencyAtom({
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
    freq: 0.1, dragging: false,
    particles: Array.from({ length: PARTICLE_COUNT }, () => ({
      x: 0.2 + Math.random() * 0.6, y: 0.2 + Math.random() * 0.6,
      vx: (Math.random() - 0.5) * 0.003, vy: (Math.random() - 0.5) * 0.003,
      targetAngle: 0, targetR: 0,
    })),
    locked: false, lockAnim: 0, completed: false,
  });
  useEffect(() => { st.current.primaryRgb = parseColor(color); st.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    // Assign mandala positions
    const s = st.current;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ring = Math.floor(i / 8);
      const posInRing = i % 8;
      s.particles[i].targetAngle = (posInRing / 8) * Math.PI * 2 + ring * 0.3;
      s.particles[i].targetR = 0.06 + ring * 0.04;
    }

    const render = () => {
      const s = st.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion); s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.freq = RESONANT_FREQ;

      const resonance = 1 - Math.min(1, Math.abs(s.freq - RESONANT_FREQ) * 5);
      if (resonance > 0.95 && !s.locked) { s.locked = true; cb.onHaptic('completion'); }
      if (s.locked) s.lockAnim = Math.min(1, s.lockAnim + 0.012 * ms);
      cb.onStateChange?.(s.locked ? 0.5 + s.lockAnim * 0.5 : resonance * 0.5);

      // Particles
      for (const pt of s.particles) {
        const targetX = 0.5 + Math.cos(pt.targetAngle + s.frameCount * 0.002 * (1 - resonance)) * pt.targetR;
        const targetY = 0.5 + Math.sin(pt.targetAngle + s.frameCount * 0.002 * (1 - resonance)) * pt.targetR;
        const pull = resonance * 0.04;
        pt.x += (targetX - pt.x) * pull + pt.vx * (1 - resonance) * ms;
        pt.y += (targetY - pt.y) * pull + pt.vy * (1 - resonance) * ms;
        // Chaos when off-resonance
        pt.vx += (Math.random() - 0.5) * 0.0003 * (1 - resonance);
        pt.vy += (Math.random() - 0.5) * 0.0003 * (1 - resonance);
        pt.vx *= 0.98; pt.vy *= 0.98;
        pt.x = Math.max(0.05, Math.min(0.95, pt.x));
        pt.y = Math.max(0.05, Math.min(0.95, pt.y));

        const pR = px(0.003 + resonance * 0.002, minDim);
        ctx.beginPath(); ctx.arc(pt.x * w, pt.y * h, pR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.locked ? s.primaryRgb : s.accentRgb, ALPHA.content.max * (0.3 + resonance * 0.3) * entrance);
        ctx.fill();
      }

      // Mandala glow at resonance
      if (resonance > 0.5) {
        const gR = px(0.08 * resonance, minDim);
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * resonance * entrance));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg; ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      // Fader track (right edge)
      const faderX = w * 0.92; const faderTop = h * 0.15; const faderBot = h * 0.85;
      ctx.beginPath(); ctx.moveTo(faderX, faderTop); ctx.lineTo(faderX, faderBot);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
      ctx.lineWidth = px(0.002, minDim); ctx.stroke();
      // Fader knob
      const knobY = faderTop + (1 - s.freq) * (faderBot - faderTop);
      ctx.beginPath(); ctx.arc(faderX, knobY, px(0.008, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance); ctx.fill();
      // Resonance zone indicator
      const resY = faderTop + (1 - RESONANT_FREQ) * (faderBot - faderTop);
      ctx.beginPath(); ctx.moveTo(faderX - px(0.008, minDim), resY); ctx.lineTo(faderX + px(0.008, minDim), resY);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.2 * entrance);
      ctx.lineWidth = px(0.0005, minDim); ctx.setLineDash([px(0.002, minDim), px(0.002, minDim)]); ctx.stroke(); ctx.setLineDash([]);

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      if (mx > 0.85) { st.current.dragging = true; cbRef.current.onHaptic('drag_snap'); }
    };
    const onMove = (e: PointerEvent) => {
      if (!st.current.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const my = (e.clientY - rect.top) / rect.height;
      st.current.freq = Math.max(0, Math.min(1, 1 - (my - 0.15) / 0.7));
    };
    const onUp = () => { st.current.dragging = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} /></div>);
}
