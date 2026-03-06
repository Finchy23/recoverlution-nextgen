/**
 * ATOM 678: THE DELAYED SHIFT ENGINE · Series 68 · Position 8
 * Ignore the flashing panic button. Wait 5 agonising seconds for
 * the wave to pass — the boat naturally settles back to zero.
 *
 * INTERACTION: Observable (do nothing) → wave passes → natural settle
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static level boat
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const WAIT_FRAMES = 300; const WAVE_DURATION = 180; const PANIC_FLASH_RATE = 12;
const BOAT_Y = 0.5; const RESPAWN_DELAY = 100;

interface WaitState { entranceProgress: number; frameCount: number; primaryRgb: RGB; accentRgb: RGB;
  wavePhase: number; pitch: number; tapped: boolean; flipped: boolean; waitTimer: number;
  settled: boolean; completed: boolean; respawnTimer: number; }

function freshState(c: string, a: string): WaitState {
  return { entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(c), accentRgb: parseColor(a),
    wavePhase: 0, pitch: 0, tapped: false, flipped: false, waitTimer: 0,
    settled: false, completed: false, respawnTimer: 0 }; }

export default function DelayedShiftWaitAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
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

      if (!p.reducedMotion && !s.completed && !s.flipped) {
        s.wavePhase += 0.02;
        // Wave comes in as sin curve then fades
        const wavePower = s.wavePhase < Math.PI ? Math.sin(s.wavePhase) * 0.6 : Math.sin(s.wavePhase) * 0.6 * Math.max(0, 1 - (s.wavePhase - Math.PI) * 0.3);
        s.pitch = wavePower;

        if (!s.tapped) { s.waitTimer++; cb.onStateChange?.(Math.min(0.9, s.waitTimer / WAIT_FRAMES)); }
        if (s.frameCount % 10 === 0 && Math.abs(s.pitch) > 0.1) cb.onHaptic('step_advance');

        // Natural settling
        if (s.waitTimer >= WAIT_FRAMES && Math.abs(s.pitch) < 0.05) {
          s.settled = true; s.completed = true; cb.onHaptic('completion'); cb.onStateChange?.(1); s.respawnTimer = RESPAWN_DELAY;
        }
      }

      const boatY = h * BOAT_Y;
      const waterY = boatY + px(0.03, minDim);

      // Water
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 2 * entrance);
      ctx.fillRect(0, waterY, w, h - waterY);

      // Wave visualization
      ctx.beginPath();
      for (let x = 0; x < w; x += 3) {
        const frac = x / w;
        const waveH = Math.sin(frac * Math.PI * 3 + s.wavePhase * 2) * s.pitch * px(0.04, minDim);
        if (x === 0) ctx.moveTo(x, waterY + waveH); else ctx.lineTo(x, waterY + waveH);
      }
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.3 * entrance * ms);
      ctx.lineWidth = px(STROKE.thin, minDim); ctx.stroke();

      // Boat
      ctx.save(); ctx.translate(cx, boatY); ctx.rotate(s.pitch * 0.8);
      const boatW = px(0.12, minDim); const boatH = px(0.02, minDim);
      ctx.beginPath(); ctx.moveTo(-boatW / 2, 0); ctx.lineTo(-boatW / 3, boatH); ctx.lineTo(boatW / 3, boatH); ctx.lineTo(boatW / 2, 0); ctx.closePath();
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance); ctx.fill();
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance); ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke();
      // Mast
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -px(0.06, minDim));
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance); ctx.lineWidth = px(STROKE.light, minDim); ctx.stroke();
      ctx.restore();

      // Panic button (flashing)
      if (!s.settled && !s.flipped) {
        const flash = Math.sin(s.frameCount * 0.3) > 0;
        const btnX = cx; const btnY = h * 0.2; const btnR = px(0.035, minDim);
        ctx.beginPath(); ctx.arc(btnX, btnY, btnR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, (flash ? 0.5 : 0.2) * ALPHA.content.max * entrance);
        ctx.fill();
        const bFont = Math.max(7, px(FONT_SIZE.xs, minDim));
        ctx.font = `${bFont}px monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.text.max * (flash ? 0.6 : 0.3) * entrance);
        ctx.fillText('FIX', btnX, btnY); ctx.textBaseline = 'alphabetic';
      }

      // Pitch gauge
      const gaugeX = w * 0.9; const gaugeH = px(0.1, minDim);
      const gaugeY = cy - gaugeH / 2;
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 1.5 * entrance);
      ctx.fillRect(gaugeX, gaugeY, px(0.004, minDim), gaugeH);
      const needleY = gaugeY + gaugeH / 2 - s.pitch * gaugeH;
      ctx.beginPath(); ctx.arc(gaugeX + px(0.002, minDim), needleY, px(0.004, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(Math.abs(s.pitch) > 0.1 ? s.accentRgb : s.primaryRgb, ALPHA.content.max * 0.5 * entrance); ctx.fill();

      // HUD
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`; ctx.textAlign = 'center';
      if (s.settled) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance); ctx.fillText('SETTLED', cx, h - px(0.035, minDim)); }
      else if (s.flipped) { ctx.fillStyle = rgba(s.accentRgb, ALPHA.text.max * 0.5 * entrance); ctx.fillText('FLIPPED', cx, h - px(0.035, minDim)); }
      else { const secs = Math.max(0, Math.ceil((WAIT_FRAMES - s.waitTimer) / 60));
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.3 * entrance); ctx.fillText(`WAIT... ${secs}s`, cx, h - px(0.035, minDim)); }

      if (p.reducedMotion) { ctx.beginPath(); ctx.moveTo(cx - px(0.06, minDim), boatY); ctx.lineTo(cx + px(0.06, minDim), boatY);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance); ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke(); }

      if (s.completed && p.phase !== 'resolve') { s.respawnTimer--; if (s.respawnTimer <= 0) { Object.assign(s, freshState(color, accentColor)); s.entranceProgress = 1; } }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = () => {
      const s = stateRef.current; if (s.completed || s.flipped) return;
      // Tapping the panic button flips the boat
      s.tapped = true; s.flipped = true; s.pitch = Math.PI; cbRef.current.onHaptic('error_boundary');
      s.completed = true; s.respawnTimer = RESPAWN_DELAY;
    };

    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'default' }} /></div>);
}
