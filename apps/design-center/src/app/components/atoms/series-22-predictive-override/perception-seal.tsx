/**
 * ATOM 220: THE PERCEPTION SEAL · S22 · Position 10 (Capstone)
 * Hold the gaze of reality without adding story, label, or prediction.
 * The Unblinking Eye — sustained holding stabilizes the UI.
 * INTERACTION: Hold (sustained) → UI stabilizes → seal
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static stable
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const HOLD_DURATION = 300; const SQUINT_THRESHOLD = 0.3;
const RESPAWN_DELAY = 100;

interface PerceptionState { entranceProgress: number; frameCount: number; primaryRgb: RGB; accentRgb: RGB;
  holding: boolean; holdTimer: number; stability: number; erratic: number;
  completed: boolean; respawnTimer: number; }

function freshState(c: string, a: string): PerceptionState {
  return { entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(c), accentRgb: parseColor(a),
    holding: false, holdTimer: 0, stability: 0, erratic: 1,
    completed: false, respawnTimer: 0 }; }

export default function PerceptionSealAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);
  const stateRef = useRef(freshState(color, accentColor));
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s.frameCount++; const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress; const ms = motionScale(p.reducedMotion);

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      if (!p.reducedMotion && !s.completed) {
        if (s.holding) {
          s.holdTimer++;
          s.stability = Math.min(1, s.holdTimer / HOLD_DURATION);
          s.erratic = Math.max(0, 1 - s.stability * 1.5);
          if (s.holdTimer % 30 === 0) cb.onHaptic('hold_threshold');
          cb.onStateChange?.(s.stability);
          if (s.stability >= 1) { s.completed = true; cb.onHaptic('seal_stamp'); cb.onStateChange?.(1); s.respawnTimer = RESPAWN_DELAY; }
        } else {
          s.erratic = Math.min(1, s.erratic + 0.005);
          s.holdTimer = Math.max(0, s.holdTimer - 2);
          s.stability = s.holdTimer / HOLD_DURATION;
        }
      }

      // Eye visualization
      const eyeW = px(SIZE.lg, minDim); const eyeH = px(SIZE.md * 0.5, minDim);
      const irisR = px(0.05 + s.stability * 0.02, minDim);

      // Erratic jitter
      const jx = s.erratic * Math.sin(s.frameCount * 0.3) * px(0.02, minDim) * ms;
      const jy = s.erratic * Math.cos(s.frameCount * 0.4) * px(0.01, minDim) * ms;

      // Eye outline
      ctx.save(); ctx.translate(cx + jx, cy + jy);

      ctx.beginPath();
      ctx.ellipse(0, 0, eyeW / 2, eyeH / 2, 0, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
      ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke();

      // Iris
      const irisGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, irisR);
      irisGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.6 * entrance));
      irisGrad.addColorStop(0.6, rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance));
      irisGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.1 * entrance));
      ctx.beginPath(); ctx.arc(0, 0, irisR, 0, Math.PI * 2);
      ctx.fillStyle = irisGrad; ctx.fill();

      // Pupil (opens with stability)
      const pupilR = irisR * (0.2 + s.stability * 0.4);
      ctx.beginPath(); ctx.arc(0, 0, pupilR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.8 * entrance); ctx.fill();

      // Highlight
      ctx.beginPath(); ctx.arc(-irisR * 0.3, -irisR * 0.3, irisR * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.3 * entrance); ctx.fill();

      ctx.restore();

      // Stability ring (grows)
      if (s.stability > 0.1) {
        const stabR = px(SIZE.lg * 0.8, minDim) * s.stability;
        ctx.beginPath(); ctx.arc(cx, cy, stabR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, s.stability * ALPHA.atmosphere.max * 0.3 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim); ctx.stroke();
      }

      // Erratic noise particles (fade with stability)
      if (s.erratic > 0.1) {
        for (let i = 0; i < Math.floor(s.erratic * 15); i++) {
          const nx = cx + (Math.random() - 0.5) * w * 0.8;
          const ny = cy + (Math.random() - 0.5) * h * 0.8;
          ctx.beginPath(); ctx.arc(nx, ny, px(0.002, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, s.erratic * ALPHA.atmosphere.min * 0.3 * entrance * ms); ctx.fill();
        }
      }

      // Progress arc
      const arcR = px(SIZE.lg * 0.6, minDim);
      ctx.beginPath(); ctx.arc(cx, cy, arcR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * s.stability);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
      ctx.lineWidth = px(STROKE.light, minDim); ctx.stroke();

      // HUD
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`; ctx.textAlign = 'center';
      if (s.completed) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance); ctx.fillText('THE UNBLINKING EYE', cx, h - px(0.035, minDim)); }
      else if (s.holding) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.3 * entrance); ctx.fillText('HOLD THE GAZE', cx, h - px(0.035, minDim)); }
      else { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance); ctx.fillText('HOLD TO OBSERVE', cx, h - px(0.035, minDim)); }

      if (p.reducedMotion) { ctx.beginPath(); ctx.arc(cx, cy, irisR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance); ctx.fill(); }

      if (s.completed && p.phase !== 'resolve') { s.respawnTimer--; if (s.respawnTimer <= 0) { Object.assign(s, freshState(color, accentColor)); s.entranceProgress = 1; } }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => { stateRef.current.holding = true; cbRef.current.onHaptic('hold_start'); canvas.setPointerCapture(e.pointerId); };
    const onUp = (e: PointerEvent) => { stateRef.current.holding = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
