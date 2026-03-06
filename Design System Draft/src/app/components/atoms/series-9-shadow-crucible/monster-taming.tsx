/**
 * ATOM 086: THE MONSTER TAMING ENGINE
 * Series 9 — Shadow & Crucible · Position 6
 * Hold still to calm a chaotic particle swarm into protective orbit.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, ELEMENT_ALPHA, type RGB } from '../atom-utils';

const CHAOS_COLOR: RGB = [200, 60, 60];
const CALM_COLOR: RGB = [140, 180, 220];
const ORBIT_COLOR: RGB = [160, 170, 200];
const BG_BASE: RGB = [18, 16, 24];
const SWARM_COUNT = 80;

interface SwarmParticle { x: number; y: number; vx: number; vy: number; angle: number; speed: number; }

export default function MonsterTamingAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<SwarmParticle[]>([]);
  const stateRef = useRef({
    entranceProgress: 0, isHolding: false, holdFrames: 0,
    calmT: 0, resolved: false, frame: 0,
  });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;

    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      stateRef.current.isHolding = true; stateRef.current.holdFrames = 0;
      onHaptic('hold_start');
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      stateRef.current.isHolding = false;
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    // Init particles
    const { width: w, height: h } = viewport;
    const cx = w / 2, cy = h / 2, minDim = Math.min(w, h);
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < SWARM_COUNT; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = minDim * 0.15 + Math.random() * minDim * 0.1;
        particlesRef.current.push({
          x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r,
          vx: (Math.random() - 0.5) * minDim * 0.008, vy: (Math.random() - 0.5) * minDim * 0.008,
          angle: a, speed: 0.01 + Math.random() * 0.02,
        });
      }
    }
    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      const s = stateRef.current; const p = propsRef.current; s.frame++;
      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress; const ent = adv.entrance;

      if (s.isHolding && !s.resolved) {
        s.holdFrames++;
        s.calmT = Math.min(1, s.holdFrames / 180);
        if (s.holdFrames === 90) onHaptic('hold_threshold');
        if (s.calmT >= 1 && !s.resolved) { s.resolved = true; onHaptic('completion'); onResolve?.(); }
      } else if (!s.resolved) {
        s.calmT = Math.max(0, s.calmT - 0.005);
      }
      onStateChange?.(s.calmT);

      const primaryRgb = parseColor(p.color);
      const dims = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const bgGrad = ctx.createRadialGradient(dims.cx, dims.cy, 0, dims.cx, dims.cy, dims.minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.015));
      bgGrad.addColorStop(1, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, dims.w, dims.h);

      const particles = particlesRef.current;
      const chaosCol = lerpColor(CHAOS_COLOR, primaryRgb, 0.05);
      const calmCol = lerpColor(CALM_COLOR, primaryRgb, 0.05);
      const orbitR = dims.minDim * 0.1;

      for (const pt of particles) {
        if (!p.reducedMotion) {
          // Chaotic motion decays with calmT
          const chaos = 1 - s.calmT;
          pt.vx += (Math.random() - 0.5) * dims.minDim * 0.004 * chaos;
          pt.vy += (Math.random() - 0.5) * dims.minDim * 0.004 * chaos;
          // Orbital pull increases with calmT
          pt.angle += pt.speed;
          const targetX = dims.cx + Math.cos(pt.angle) * orbitR;
          const targetY = dims.cy + Math.sin(pt.angle) * orbitR;
          pt.vx += (targetX - pt.x) * 0.01 * s.calmT;
          pt.vy += (targetY - pt.y) * 0.01 * s.calmT;
          pt.vx *= 0.92; pt.vy *= 0.92;
          pt.x += pt.vx; pt.y += pt.vy;
        }
        const col = lerpColor(chaosCol, calmCol, s.calmT);
        const ptSize = dims.minDim * 0.004;
        ctx.fillStyle = rgba(col, ELEMENT_ALPHA.primary.max * ent * 0.7);
        ctx.fillRect(pt.x - ptSize / 2, pt.y - ptSize / 2, ptSize, ptSize);
      }

      // Centre point
      ctx.fillStyle = rgba(lerpColor(ORBIT_COLOR, primaryRgb, 0.04), ELEMENT_ALPHA.primary.min * ent);
      ctx.beginPath(); ctx.arc(dims.cx, dims.cy, dims.minDim * 0.008, 0, Math.PI * 2); ctx.fill();

      if (!s.resolved && s.calmT < 0.1) {
        ctx.font = `${Math.round(dims.minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(CALM_COLOR, primaryRgb, 0.06), ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText('hold still to calm the swarm', dims.cx, dims.h * 0.9);
      }
      ctx.restore();
    };
    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport, onStateChange, onHaptic, onResolve]);

  return (
    <canvas ref={canvasRef}
      style={{ width: viewport.width, height: viewport.height, display: 'block', touchAction: 'none', cursor: 'pointer' }}
    />
  );
}