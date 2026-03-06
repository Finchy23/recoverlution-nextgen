/**
 * ATOM 303: THE ORBITAL DECAY ENGINE · S31 · Position 3
 * Introduce friction until orbit collapses into cathartic impact.
 * INTERACTION: Swipe against orbital path → friction → spiral inward → collision
 * RENDER: Canvas 2D · REDUCED MOTION: Static impact glow
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const ORBIT_DECAY_RATE = 0.0002; const ORBIT_SPEED = 0.03; const MIN_ORBIT = 0.03; const RESPAWN_DELAY = 100;

interface OrbitState { entranceProgress: number; frameCount: number; primaryRgb: RGB; accentRgb: RGB;
  orbitRadius: number; angle: number; swiping: boolean; impacted: boolean; impactAnim: number;
  completed: boolean; respawnTimer: number; }

function freshState(c: string, a: string): OrbitState {
  return { entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(c), accentRgb: parseColor(a),
    orbitRadius: 0.2, angle: 0, swiping: false, impacted: false, impactAnim: 0,
    completed: false, respawnTimer: 0 }; }

export default function OrbitalDecayAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
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
        const speedMult = 1 + (0.2 - s.orbitRadius) * 5;
        s.angle += ORBIT_SPEED * speedMult * ms;
        if (s.swiping) { s.orbitRadius = Math.max(MIN_ORBIT, s.orbitRadius - ORBIT_DECAY_RATE * 3); }
        else { s.orbitRadius = Math.max(MIN_ORBIT, s.orbitRadius - ORBIT_DECAY_RATE * 0.3); }

        const decayProgress = 1 - (s.orbitRadius - MIN_ORBIT) / (0.2 - MIN_ORBIT);
        cb.onStateChange?.(Math.max(0, decayProgress));
        if (s.frameCount % 20 === 0 && s.swiping) cb.onHaptic('swipe_commit');

        if (s.orbitRadius <= MIN_ORBIT + 0.005 && !s.impacted) {
          s.impacted = true; cb.onHaptic('completion');
        }
        if (s.impacted) {
          s.impactAnim = Math.min(1, s.impactAnim + 0.015);
          if (s.impactAnim >= 1) { s.completed = true; cb.onStateChange?.(1); s.respawnTimer = RESPAWN_DELAY; }
        }
      }

      // Central mass
      const centerR = px(SIZE.md * 0.25, minDim);
      const cGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, centerR * 3);
      cGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
      cGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = cGlow; ctx.fillRect(cx - centerR * 3, cy - centerR * 3, centerR * 6, centerR * 6);
      ctx.beginPath(); ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance); ctx.fill();

      // Orbit path (fading)
      if (!s.impacted) {
        const orbR = px(s.orbitRadius, minDim);
        ctx.beginPath(); ctx.arc(cx, cy, orbR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();

        // Satellite
        const satX = cx + Math.cos(s.angle) * orbR;
        const satY = cy + Math.sin(s.angle) * orbR;
        const satR = px(0.015, minDim);
        const sg = ctx.createRadialGradient(satX, satY, 0, satX, satY, satR * 2.5);
        sg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.25 * entrance));
        sg.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = sg; ctx.fillRect(satX - satR * 2.5, satY - satR * 2.5, satR * 5, satR * 5);
        ctx.beginPath(); ctx.arc(satX, satY, satR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.6 * entrance); ctx.fill();

        // Trail
        for (let i = 1; i <= 8; i++) {
          const ta = s.angle - i * 0.15;
          const tr = px(s.orbitRadius + i * 0.002, minDim);
          ctx.beginPath(); ctx.arc(cx + Math.cos(ta) * tr, cy + Math.sin(ta) * tr, satR * (1 - i * 0.1), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.atmosphere.min * 0.2 * (1 - i / 8) * entrance * ms); ctx.fill();
        }
      }

      // Impact light wave
      if (s.impacted) {
        const waveR = minDim * 0.4 * s.impactAnim;
        const wg = ctx.createRadialGradient(cx, cy, waveR * 0.8, cx, cy, waveR);
        wg.addColorStop(0, rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.5), 0));
        wg.addColorStop(0.8, rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.5), (1 - s.impactAnim) * ALPHA.glow.max * 0.3 * entrance));
        wg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = wg; ctx.fillRect(cx - waveR, cy - waveR, waveR * 2, waveR * 2);
      }

      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim)); ctx.font = `${fontSize}px monospace`; ctx.textAlign = 'center';
      if (s.completed) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance); ctx.fillText('IMPACT', cx, h - px(0.035, minDim)); }
      else { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance); ctx.fillText('SWIPE TO ADD FRICTION', cx, h - px(0.035, minDim)); }

      if (s.completed && p.phase !== 'resolve') { s.respawnTimer--; if (s.respawnTimer <= 0) { Object.assign(s, freshState(color, accentColor)); s.entranceProgress = 1; } }
      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => { stateRef.current.swiping = true; canvas.setPointerCapture(e.pointerId); };
    const onUp = (e: PointerEvent) => { stateRef.current.swiping = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
