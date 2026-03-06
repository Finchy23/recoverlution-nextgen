/**
 * ATOM 677: THE PHASE CANCELLATION ENGINE · Series 68 · Position 7
 * Draw the exact inverse of the aggressive waveform — destructive
 * interference flatlines the signal into total blessed silence.
 *
 * INTERACTION: Draw (inverse wave) → waves meet → flatline
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static flatline
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const WAVE_SEGMENTS = 40; const SAMPLE_TOLERANCE = 0.06; const MATCH_THRESHOLD = 0.7;
const RESPAWN_DELAY = 100;

interface PhaseState { entranceProgress: number; frameCount: number; primaryRgb: RGB; accentRgb: RGB;
  attackWave: number[]; userWave: number[]; drawing: boolean; matchScore: number;
  flatlined: boolean; flatlineAnim: number; completed: boolean; respawnTimer: number; }

function makeAttackWave(): number[] {
  return Array.from({ length: WAVE_SEGMENTS }, (_, i) => {
    const t = i / WAVE_SEGMENTS;
    return Math.sin(t * Math.PI * 4) * 0.3 + Math.sin(t * Math.PI * 7) * 0.15 + Math.sin(t * Math.PI * 2) * 0.2;
  });
}

function freshState(c: string, a: string): PhaseState {
  return { entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(c), accentRgb: parseColor(a),
    attackWave: makeAttackWave(), userWave: Array(WAVE_SEGMENTS).fill(0),
    drawing: false, matchScore: 0, flatlined: false, flatlineAnim: 0,
    completed: false, respawnTimer: 0 }; }

export default function PhaseCancellationWaveAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
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

      const waveY = cy; const waveW = w * 0.8; const waveX = (w - waveW) / 2; const ampScale = px(0.15, minDim);

      if (!p.reducedMotion && s.flatlined && !s.completed) {
        s.flatlineAnim = Math.min(1, s.flatlineAnim + 0.015);
        if (s.flatlineAnim >= 1) { s.completed = true; cb.onHaptic('completion'); cb.onStateChange?.(1); s.respawnTimer = RESPAWN_DELAY; }
      }

      // Attack wave (red)
      ctx.beginPath();
      for (let i = 0; i < WAVE_SEGMENTS; i++) {
        const x = waveX + (i / (WAVE_SEGMENTS - 1)) * waveW;
        const y = waveY - s.attackWave[i] * ampScale * (1 - s.flatlineAnim);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.5 * entrance * ms);
      ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke();

      // User wave (blue/primary) — drawn inverted
      if (s.userWave.some(v => v !== 0)) {
        ctx.beginPath();
        for (let i = 0; i < WAVE_SEGMENTS; i++) {
          const x = waveX + (i / (WAVE_SEGMENTS - 1)) * waveW;
          const y = waveY + s.userWave[i] * ampScale * (1 - s.flatlineAnim);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance * ms);
        ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke();
      }

      // Flatline
      if (s.flatlined) {
        ctx.beginPath(); ctx.moveTo(waveX, waveY); ctx.lineTo(waveX + waveW, waveY);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * s.flatlineAnim * entrance);
        ctx.lineWidth = px(STROKE.light, minDim); ctx.stroke();
      }

      // Center line
      ctx.setLineDash([px(0.004, minDim), px(0.006, minDim)]);
      ctx.beginPath(); ctx.moveTo(waveX, waveY); ctx.lineTo(waveX + waveW, waveY);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.2 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke(); ctx.setLineDash([]);

      // Match score
      const barW = px(SIZE.md * 0.7, minDim); const barH = px(0.006, minDim);
      const barX = cx - barW / 2; const barY = h - px(0.08, minDim);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 1.5 * entrance);
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
      ctx.fillRect(barX, barY, barW * s.matchScore, barH);

      // HUD
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`; ctx.textAlign = 'center';
      if (s.flatlined) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance); ctx.fillText('SILENCE', cx, h - px(0.035, minDim)); }
      else { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.25 * entrance); ctx.fillText('DRAW THE INVERSE', cx, h - px(0.035, minDim)); }

      if (p.reducedMotion) { ctx.beginPath(); ctx.moveTo(waveX, waveY); ctx.lineTo(waveX + waveW, waveY);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance); ctx.lineWidth = px(STROKE.light, minDim); ctx.stroke(); }

      if (s.completed && p.phase !== 'resolve') { s.respawnTimer--; if (s.respawnTimer <= 0) { Object.assign(s, freshState(color, accentColor)); s.entranceProgress = 1; } }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => { stateRef.current.drawing = true; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.drawing || s.flatlined) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width; const my = (e.clientY - rect.top) / rect.height;
      const waveX2 = 0.1; const waveW2 = 0.8;
      const seg = Math.floor(((mx - waveX2) / waveW2) * WAVE_SEGMENTS);
      if (seg >= 0 && seg < WAVE_SEGMENTS) {
        const val = (my - 0.5) * 2 / 0.15; // normalize
        s.userWave[seg] = val;
      }
      // Calculate match
      let matches = 0;
      for (let i = 0; i < WAVE_SEGMENTS; i++) {
        if (s.userWave[i] !== 0 && Math.abs(s.userWave[i] + s.attackWave[i]) < SAMPLE_TOLERANCE) matches++;
      }
      const drawn = s.userWave.filter(v => v !== 0).length;
      s.matchScore = drawn > 5 ? matches / WAVE_SEGMENTS : 0;
      cbRef.current.onStateChange?.(s.matchScore);
      if (s.matchScore >= MATCH_THRESHOLD && !s.flatlined) { s.flatlined = true; cbRef.current.onHaptic('drag_snap'); }
    };
    const onUp = (e: PointerEvent) => { stateRef.current.drawing = false; canvas.releasePointerCapture(e.pointerId); };

    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} /></div>);
}
