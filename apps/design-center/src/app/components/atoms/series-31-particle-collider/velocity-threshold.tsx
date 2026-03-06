/**
 * ATOM 305: THE VELOCITY THRESHOLD ENGINE · S31 · Position 5
 * Build cumulative kinetic energy through repeated strikes.
 * INTERACTION: Repeated taps → energy builds → threshold cracks shell
 * RENDER: Canvas 2D · REDUCED MOTION: Static cracked
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const STRIKES_NEEDED = 12; const ENERGY_DECAY = 0.003; const SHELL_R = 0.12; const RESPAWN_DELAY = 100;

interface ThreshState { entranceProgress: number; frameCount: number; primaryRgb: RGB; accentRgb: RGB;
  strikes: number; energy: number; shakeAmount: number; cracked: boolean; crackAnim: number;
  completed: boolean; respawnTimer: number; }

function freshState(c: string, a: string): ThreshState {
  return { entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(c), accentRgb: parseColor(a),
    strikes: 0, energy: 0, shakeAmount: 0, cracked: false, crackAnim: 0,
    completed: false, respawnTimer: 0 }; }

export default function VelocityThresholdAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
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
        s.shakeAmount *= 0.92;
        if (!s.cracked) { s.energy = Math.max(0, s.energy - ENERGY_DECAY); cb.onStateChange?.(s.energy); }
        if (s.cracked) {
          s.crackAnim = Math.min(1, s.crackAnim + 0.012);
          if (s.crackAnim >= 1) { s.completed = true; cb.onStateChange?.(1); s.respawnTimer = RESPAWN_DELAY; }
        }
      }

      const shellR = px(SHELL_R, minDim);
      const shake = s.shakeAmount * px(0.008, minDim) * ms;
      const sx = cx + (Math.random() - 0.5) * shake * 2;
      const sy = cy + (Math.random() - 0.5) * shake * 2;

      // Energy ring
      const energyR = shellR * 1.4;
      ctx.beginPath(); ctx.arc(sx, sy, energyR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * s.energy);
      ctx.strokeStyle = rgba(lerpColor(s.primaryRgb, s.accentRgb, s.energy), ALPHA.content.max * 0.4 * entrance);
      ctx.lineWidth = px(STROKE.bold, minDim); ctx.stroke();

      // Energy glow
      if (s.energy > 0.3) {
        const eg = ctx.createRadialGradient(sx, sy, shellR, sx, sy, energyR * 1.2);
        eg.addColorStop(0, rgba(s.accentRgb, (s.energy - 0.3) * ALPHA.glow.max * 0.15 * entrance));
        eg.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = eg; ctx.fillRect(sx - energyR * 1.2, sy - energyR * 1.2, energyR * 2.4, energyR * 2.4);
      }

      // Shell
      if (!s.cracked) {
        ctx.beginPath(); ctx.arc(sx, sy, shellR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.15 * entrance); ctx.fill();
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke();

        // Stress cracks (more with energy)
        if (s.energy > 0.3) {
          const crackCount = Math.floor(s.energy * 6);
          for (let i = 0; i < crackCount; i++) {
            const ca = (i / crackCount) * Math.PI * 2;
            const cl = shellR * (0.3 + s.energy * 0.7);
            ctx.beginPath(); ctx.moveTo(sx, sy);
            ctx.lineTo(sx + Math.cos(ca) * cl, sy + Math.sin(ca) * cl);
            ctx.strokeStyle = rgba(s.accentRgb, s.energy * ALPHA.content.max * 0.3 * entrance);
            ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
          }
        }
      }

      // Crack & reveal
      if (s.cracked) {
        // Shell fragments expanding outward
        for (let i = 0; i < 8; i++) {
          const fa = (i / 8) * Math.PI * 2;
          const fd = shellR * (1 + s.crackAnim * 2);
          const fx = sx + Math.cos(fa) * fd; const fy = sy + Math.sin(fa) * fd;
          ctx.beginPath(); ctx.arc(fx, fy, px(0.006, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, (1 - s.crackAnim) * ALPHA.content.max * 0.3 * entrance); ctx.fill();
        }
        // Light core
        const lR = shellR * s.crackAnim;
        const lg = ctx.createRadialGradient(cx, cy, 0, cx, cy, lR * 2);
        lg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.5 * s.crackAnim * entrance));
        lg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * s.crackAnim * entrance));
        lg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = lg; ctx.fillRect(cx - lR * 2, cy - lR * 2, lR * 4, lR * 4);
        ctx.beginPath(); ctx.arc(cx, cy, lR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.6 * s.crackAnim * entrance); ctx.fill();
      }

      // Strike counter
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim)); ctx.font = `${fontSize}px monospace`; ctx.textAlign = 'center';
      if (s.completed) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance); ctx.fillText('THRESHOLD BROKEN', cx, h - px(0.035, minDim)); }
      else { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance);
        ctx.fillText(`TAP TO STRIKE (${s.strikes}/${STRIKES_NEEDED})`, cx, h - px(0.035, minDim)); }

      if (s.completed && p.phase !== 'resolve') { s.respawnTimer--; if (s.respawnTimer <= 0) { Object.assign(s, freshState(color, accentColor)); s.entranceProgress = 1; } }
      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = () => {
      const s = stateRef.current; if (s.cracked || s.completed) return;
      s.strikes++; s.energy = Math.min(1, s.energy + 1 / STRIKES_NEEDED + 0.02);
      s.shakeAmount = 1; cbRef.current.onHaptic('tap');
      if (s.energy >= 0.95) { s.cracked = true; cbRef.current.onHaptic('completion'); }
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
