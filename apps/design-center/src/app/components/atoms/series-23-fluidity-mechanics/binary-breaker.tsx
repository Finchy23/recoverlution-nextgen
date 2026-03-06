/**
 * ATOM 221: THE BINARY BREAKER ENGINE · S23 · Position 1
 * Black and white fluids mix into infinite gradient. Drag to stir.
 * INTERACTION: Drag (stir fluids) → mixing → gradient emerges
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static gradient
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const PARTICLE_COUNT = 60; const MIX_RATE = 0.003; const STIR_RADIUS = 0.06; const RESPAWN_DELAY = 100;

interface FluidP { x: number; y: number; tone: number; vx: number; vy: number; }

interface BinaryState { entranceProgress: number; frameCount: number; primaryRgb: RGB; accentRgb: RGB;
  particles: FluidP[]; dragging: boolean; mx: number; my: number; mixScore: number;
  completed: boolean; respawnTimer: number; }

function makeParticles(): FluidP[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    x: i < PARTICLE_COUNT / 2 ? Math.random() * 0.45 + 0.05 : Math.random() * 0.45 + 0.5,
    y: 0.1 + Math.random() * 0.8,
    tone: i < PARTICLE_COUNT / 2 ? 0 : 1,
    vx: 0, vy: 0,
  }));
}

function freshState(c: string, a: string): BinaryState {
  return { entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(c), accentRgb: parseColor(a),
    particles: makeParticles(), dragging: false, mx: 0.5, my: 0.5, mixScore: 0,
    completed: false, respawnTimer: 0 }; }

export default function BinaryBreakerAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
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
        // Stir physics
        for (const pt of s.particles) {
          if (s.dragging) {
            const dx = pt.x - s.mx; const dy = pt.y - s.my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < STIR_RADIUS && dist > 0.01) {
              const force = (STIR_RADIUS - dist) / STIR_RADIUS * 0.003;
              pt.vx += (-dy / dist) * force; pt.vy += (dx / dist) * force;
            }
          }
          pt.x += pt.vx; pt.y += pt.vy;
          pt.vx *= 0.96; pt.vy *= 0.96;
          pt.x = Math.max(0.02, Math.min(0.98, pt.x));
          pt.y = Math.max(0.02, Math.min(0.98, pt.y));
        }

        // Tone mixing: particles near opposite-tone particles blend
        for (const pt of s.particles) {
          for (const other of s.particles) {
            if (pt === other) continue;
            const dx = pt.x - other.x; const dy = pt.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 0.04) { pt.tone += (other.tone - pt.tone) * MIX_RATE; }
          }
        }

        // Calculate mix uniformity
        const avgTone = s.particles.reduce((sum, p2) => sum + p2.tone, 0) / PARTICLE_COUNT;
        const variance = s.particles.reduce((sum, p2) => sum + (p2.tone - avgTone) ** 2, 0) / PARTICLE_COUNT;
        s.mixScore = Math.max(0, 1 - variance * 8);
        cb.onStateChange?.(s.mixScore);

        if (s.mixScore > 0.85 && !s.completed) {
          s.completed = true; cb.onHaptic('completion'); cb.onStateChange?.(1); s.respawnTimer = RESPAWN_DELAY;
        }
      }

      // Divider line (fades as mixing progresses)
      if (s.mixScore < 0.5) {
        const lineAlpha = (1 - s.mixScore * 2) * ALPHA.content.max * 0.2 * entrance;
        ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
        ctx.strokeStyle = rgba(s.primaryRgb, lineAlpha);
        ctx.lineWidth = px(STROKE.light, minDim); ctx.stroke();
      }

      // Particles
      for (const pt of s.particles) {
        const ptx = pt.x * w; const pty = pt.y * h;
        const ptR = px(0.008, minDim);
        const ptColor = lerpColor(s.accentRgb, s.primaryRgb, pt.tone);

        // Glow
        const gr = ptR * 2.5;
        const glow = ctx.createRadialGradient(ptx, pty, 0, ptx, pty, gr);
        glow.addColorStop(0, rgba(ptColor, ALPHA.glow.max * 0.15 * entrance));
        glow.addColorStop(1, rgba(ptColor, 0));
        ctx.fillStyle = glow; ctx.fillRect(ptx - gr, pty - gr, gr * 2, gr * 2);

        ctx.beginPath(); ctx.arc(ptx, pty, ptR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(ptColor, ALPHA.content.max * 0.5 * entrance); ctx.fill();
      }

      // Labels
      if (s.mixScore < 0.3) {
        const lFont = Math.max(7, px(FONT_SIZE.xs, minDim));
        ctx.font = `${lFont}px monospace`; ctx.textAlign = 'center';
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.text.max * 0.3 * (1 - s.mixScore * 3) * entrance);
        ctx.fillText('BLACK', cx * 0.5, py(0.06, h));
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.3 * (1 - s.mixScore * 3) * entrance);
        ctx.fillText('WHITE', cx * 1.5, py(0.06, h));
      }

      // HUD
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`; ctx.textAlign = 'center';
      if (s.completed) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance); ctx.fillText('GRADIENT', cx, h - px(0.035, minDim)); }
      else { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance); ctx.fillText('STIR TO MIX', cx, h - px(0.035, minDim)); }

      if (p.reducedMotion) { const gradW = w * 0.8;
        const grad = ctx.createLinearGradient(cx - gradW / 2, 0, cx + gradW / 2, 0);
        grad.addColorStop(0, rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance));
        grad.addColorStop(0.5, rgba(lerpColor(s.accentRgb, s.primaryRgb, 0.5), ALPHA.content.max * 0.3 * entrance));
        grad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance));
        ctx.fillStyle = grad; ctx.fillRect(cx - gradW / 2, cy - px(0.05, minDim), gradW, px(0.1, minDim)); }

      if (s.completed && p.phase !== 'resolve') { s.respawnTimer--; if (s.respawnTimer <= 0) { Object.assign(s, freshState(color, accentColor)); s.entranceProgress = 1; } }

      ctx.restore(); animId = requestAnimationFrame(render);
    };

    function py(frac: number, total: number) { return frac * total; }

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => { const s = stateRef.current; s.dragging = true;
      const rect = canvas.getBoundingClientRect(); s.mx = (e.clientX - rect.left) / rect.width; s.my = (e.clientY - rect.top) / rect.height;
      canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => { const s = stateRef.current; if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect(); s.mx = (e.clientX - rect.left) / rect.width; s.my = (e.clientY - rect.top) / rect.height; };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; canvas.releasePointerCapture(e.pointerId); };

    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} /></div>);
}
