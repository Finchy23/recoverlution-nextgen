/**
 * ATOM 214: THE TASTE EXPLODE ENGINE
 * =====================================
 * Series 22 — Predictive Override · Position 4
 *
 * The anxious mind moves too fast to taste. Slow to micro-sensory
 * perception. Hold to slow time — individual crystalline particles
 * burst in ultra-slow-motion sensory fireworks.
 *
 * SIGNATURE TECHNIQUE: Sensory deconstruction — time dilation,
 * particle burst in extreme slow-mo, individual droplet physics.
 *
 * INTERACTION: Hold → time slows → particles burst → perception
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static burst
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, PARTICLE_SIZE, motionScale, type RGB } from '../atom-utils';

const BURST_COUNT = 30; const SLOW_MO_FACTOR = 0.08; const NORMAL_SPEED = 1;
const HOLD_THRESHOLD = 0.3; const RESPAWN_DELAY = 100;

interface Droplet { x: number; y: number; vx: number; vy: number; size: number; color: RGB; life: number; maxLife: number; }

interface TasteState { entranceProgress: number; frameCount: number; primaryRgb: RGB; accentRgb: RGB;
  holding: boolean; holdTime: number; timeScale: number; droplets: Droplet[];
  burstTriggered: boolean; perceptionScore: number; completed: boolean; respawnTimer: number; }

function freshState(c: string, a: string): TasteState {
  return { entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(c), accentRgb: parseColor(a),
    holding: false, holdTime: 0, timeScale: NORMAL_SPEED, droplets: [],
    burstTriggered: false, perceptionScore: 0, completed: false, respawnTimer: 0 }; }

export default function TasteExplodeAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
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
          s.holdTime += 0.016;
          s.timeScale = Math.max(SLOW_MO_FACTOR, s.timeScale * 0.97);

          if (s.holdTime > HOLD_THRESHOLD && !s.burstTriggered) {
            s.burstTriggered = true;
            cb.onHaptic('step_advance');
            for (let i = 0; i < BURST_COUNT; i++) {
              const a = Math.random() * Math.PI * 2;
              const speed = 0.002 + Math.random() * 0.006;
              s.droplets.push({ x: 0.5, y: 0.5, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
                size: 0.005 + Math.random() * 0.01,
                color: lerpColor(s.primaryRgb, s.accentRgb, Math.random()),
                life: 200 + Math.random() * 200, maxLife: 200 + Math.random() * 200 });
            }
          }
        } else {
          s.timeScale = Math.min(NORMAL_SPEED, s.timeScale * 1.05);
        }

        // Droplet physics (affected by time scale)
        for (const d of s.droplets) {
          d.x += d.vx * s.timeScale; d.y += d.vy * s.timeScale;
          d.vy += 0.00005 * s.timeScale;
          d.life -= s.timeScale;
        }
        s.droplets = s.droplets.filter(d => d.life > 0);

        if (s.burstTriggered) {
          s.perceptionScore = Math.min(1, s.holdTime / 5);
          cb.onStateChange?.(s.perceptionScore);
          if (s.droplets.length === 0 && s.perceptionScore > 0.5) {
            s.completed = true; cb.onHaptic('completion'); cb.onStateChange?.(1); s.respawnTimer = RESPAWN_DELAY;
          }
        }
      }

      // Central orb (pre-burst)
      if (!s.burstTriggered) {
        const orbR = px(SIZE.md * 0.5, minDim);
        const orbGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbR * 1.5);
        orbGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
        orbGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = orbGlow; ctx.fillRect(cx - orbR * 1.5, cy - orbR * 1.5, orbR * 3, orbR * 3);
        ctx.beginPath(); ctx.arc(cx, cy, orbR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance); ctx.fill();
      }

      // Droplets
      for (const d of s.droplets) {
        const dx = d.x * w; const dy = d.y * h;
        const dr = px(d.size * (s.timeScale < 0.3 ? 1.5 : 1), minDim);
        const dAlpha = (d.life / d.maxLife) * ALPHA.content.max * 0.7 * entrance;

        // Slow-mo glow
        if (s.timeScale < 0.3) {
          const dGlow = ctx.createRadialGradient(dx, dy, 0, dx, dy, dr * 3);
          dGlow.addColorStop(0, rgba(d.color, dAlpha * 0.3)); dGlow.addColorStop(1, rgba(d.color, 0));
          ctx.fillStyle = dGlow; ctx.fillRect(dx - dr * 3, dy - dr * 3, dr * 6, dr * 6);
        }

        ctx.beginPath(); ctx.arc(dx, dy, dr, 0, Math.PI * 2);
        ctx.fillStyle = rgba(d.color, dAlpha); ctx.fill();

        // Crystalline highlight in slow-mo
        if (s.timeScale < 0.2 && d.size > 0.008) {
          ctx.beginPath(); ctx.arc(dx - dr * 0.3, dy - dr * 0.3, dr * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = rgba([255, 255, 255] as RGB, dAlpha * 0.3); ctx.fill();
        }
      }

      // Time scale indicator
      if (s.timeScale < 0.8) {
        const tFont = Math.max(10, px(FONT_SIZE.md, minDim));
        ctx.font = `${tFont}px monospace`; ctx.textAlign = 'center';
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * (1 - s.timeScale) * entrance);
        ctx.fillText(`${Math.round(s.timeScale * 100)}% SPEED`, cx, px(0.06, minDim));
      }

      // HUD
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`; ctx.textAlign = 'center';
      if (s.completed) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance); ctx.fillText('PERCEIVED', cx, h - px(0.035, minDim)); }
      else if (!s.burstTriggered) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance); ctx.fillText('HOLD TO SLOW TIME', cx, h - px(0.035, minDim)); }
      else { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.3 * entrance); ctx.fillText('OBSERVE EACH PARTICLE', cx, h - px(0.035, minDim)); }

      if (p.reducedMotion) { for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; const r = px(0.1, minDim);
        ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, px(0.008, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(lerpColor(s.primaryRgb, s.accentRgb, i / 8), ALPHA.content.max * 0.5 * entrance); ctx.fill(); } }

      if (s.completed && p.phase !== 'resolve') { s.respawnTimer--; if (s.respawnTimer <= 0) { Object.assign(s, freshState(color, accentColor)); s.entranceProgress = 1; } }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => { stateRef.current.holding = true; cbRef.current.onHaptic('hold_start'); canvas.setPointerCapture(e.pointerId); };
    const onUp = (e: PointerEvent) => { stateRef.current.holding = false; canvas.releasePointerCapture(e.pointerId); };

    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
