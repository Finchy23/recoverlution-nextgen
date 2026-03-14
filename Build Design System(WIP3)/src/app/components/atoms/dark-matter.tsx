/**
 * ATOM: DARK MATTER — Invisible Gravity
 * Series 4 — Via Negativa · Subtraction and stillness
 *
 * 95% of the universe's mass is invisible. And it holds everything together.
 * Touch the screen — no cursor, no highlight. But the entire field responds.
 *
 * INTERACTION: Hold (invisible gravity well) · Breath (well depth)
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from './types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB, ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from './atom-utils';

const DUST_COUNT = 200;
const FILAMENT_COUNT = 15;
const WELL_RADIUS_FRAC = 0.35;
const MAX_GRAVITY = 2.5;
const GRAVITY_RAMP = 0.008;
const GRAVITY_DECAY = 0.015;
const DUST_DRIFT = 0.15;
const LENS_RING_FRAC = 0.3;

interface DustMote { x: number; y: number; vx: number; vy: number; homeX: number; homeY: number; size: number; alpha: number; phase: number; }
interface LightFilament { x1: number; y1: number; x2: number; y2: number; cpx: number; cpy: number; alpha: number; width: number; }

const DEEP_VOID: RGB = [2, 2, 3];
const DUST_DIM: RGB = [80, 75, 70];
const DUST_LIT: RGB = [120, 110, 100];
const FILAMENT_COLOR: RGB = [60, 58, 55];
const LENS_RING: RGB = [90, 85, 80];
const WELL_AURA: RGB = [70, 65, 60];

function createDust(w: number, h: number, minDim: number): DustMote[] {
  return Array.from({ length: DUST_COUNT }, () => {
    const x = Math.random() * w, y = Math.random() * h;
    return { x, y, vx: (Math.random() - 0.5) * DUST_DRIFT, vy: (Math.random() - 0.5) * DUST_DRIFT, homeX: x, homeY: y, size: minDim * (0.0006 + Math.random() * 0.0025), alpha: 0.02 + Math.random() * 0.06, phase: Math.random() * Math.PI * 2 };
  });
}

function createFilaments(w: number, h: number): LightFilament[] {
  return Array.from({ length: FILAMENT_COUNT }, () => {
    const angle = Math.random() * Math.PI, cx = w * (0.1 + Math.random() * 0.8), cy = h * (0.1 + Math.random() * 0.8), len = Math.min(w, h) * (0.1 + Math.random() * 0.25);
    return { x1: cx + Math.cos(angle) * len, y1: cy + Math.sin(angle) * len, x2: cx - Math.cos(angle) * len, y2: cy - Math.sin(angle) * len, cpx: cx + (Math.random() - 0.5) * len * 0.4, cpy: cy + (Math.random() - 0.5) * len * 0.4, alpha: 0.01 + Math.random() * 0.02, width: Math.min(w, h) * (0.0004 + Math.random() * 0.0006) };
  });
}

export default function DarkMatterAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    dust: [] as DustMote[], filaments: [] as LightFilament[],
    isHolding: false, wellX: 0, wellY: 0, wellStrength: 0,
    holdStartFired: false, holdThresholdFired: false,
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor), initialized: false,
  });

  useEffect(() => { const s = stateRef.current; s.primaryRgb = parseColor(color); s.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const w = viewport.width, h = viewport.height, s = stateRef.current, minDim = Math.min(w, h);

    if (!s.initialized) { s.dust = createDust(w, h, minDim); s.filaments = createFilaments(w, h); s.initialized = true; }

    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      s.isHolding = true; s.wellX = (e.clientX - rect.left) / rect.width * w; s.wellY = (e.clientY - rect.top) / rect.height * h;
      if (!s.holdStartFired) { s.holdStartFired = true; cbRef.current.onHaptic('hold_start'); }
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (s.isHolding) { s.wellX = (e.clientX - rect.left) / rect.width * w; s.wellY = (e.clientY - rect.top) / rect.height * h; }
    };
    const onUp = (e: PointerEvent) => { s.isHolding = false; s.holdStartFired = false; s.holdThresholdFired = false; canvas.releasePointerCapture(e.pointerId); };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let animId: number;
    const dpr = window.devicePixelRatio || 1;
    const wellRadius = minDim * WELL_RADIUS_FRAC;

    const render = () => {
      const p = propsRef.current, cb = cbRef.current;
      const cw = Math.round(w * dpr), ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
      ctx.save(); ctx.scale(dpr, dpr); ctx.clearRect(0, 0, w, h); s.frameCount++;

      if (s.entranceProgress < 1) s.entranceProgress = Math.min(1, s.entranceProgress + (p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE));
      const entrance = easeOutExpo(s.entranceProgress);

      // Gravity well
      if (s.isHolding) {
        s.wellStrength = Math.min(1, s.wellStrength + GRAVITY_RAMP * (1 + p.breathAmplitude * 0.4));
        if (s.wellStrength > 0.5 && !s.holdThresholdFired) { s.holdThresholdFired = true; cb.onHaptic('hold_threshold'); }
      } else { s.wellStrength = Math.max(0, s.wellStrength - GRAVITY_DECAY); }
      cb.onStateChange?.(s.wellStrength);

      const gStrength = s.wellStrength * MAX_GRAVITY;
      const spdMult = p.reducedMotion ? 0.3 : 1;

      for (const d of s.dust) {
        d.vx += (Math.random() - 0.5) * 0.01 * spdMult; d.vy += (Math.random() - 0.5) * 0.01 * spdMult;
        d.vx += (d.homeX - d.x) * 0.0002; d.vy += (d.homeY - d.y) * 0.0002;
        if (gStrength > 0.01) {
          const dx = s.wellX - d.x, dy = s.wellY - d.y, dist = Math.max(minDim * 0.015, Math.hypot(dx, dy));
          if (dist < wellRadius) {
            const force = Math.min(gStrength / (dist * dist) * 80, 0.3);
            const nx = dx / dist, ny = dy / dist;
            const radialPull = dist < wellRadius * 0.3 ? 0.15 : 0.03;
            d.vx += (-ny * force * 0.7 + nx * force * radialPull) * spdMult;
            d.vy += (nx * force * 0.7 + ny * force * radialPull) * spdMult;
          }
        }
        d.vx *= 0.98; d.vy *= 0.98;
        const spd = Math.hypot(d.vx, d.vy); if (spd > 1.5 * spdMult) { d.vx = (d.vx / spd) * 1.5 * spdMult; d.vy = (d.vy / spd) * 1.5 * spdMult; }
        d.x += d.vx; d.y += d.vy;
        const wrapM = minDim * 0.04;
        if (d.x < -wrapM) { d.x = w + wrapM; d.homeX = d.x; }
        if (d.x > w + wrapM) { d.x = -wrapM; d.homeX = d.x; }
        if (d.y < -wrapM) { d.y = h + wrapM; d.homeY = d.y; }
        if (d.y > h + wrapM) { d.y = -wrapM; d.homeY = d.y; }
      }

      // Background
      const bgColor = lerpColor(DEEP_VOID, s.primaryRgb, 0.005);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgColor, entrance * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgColor, entrance * 0.015));
      bgGrad.addColorStop(1, rgba(bgColor, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Filaments with lensing
      for (const fil of s.filaments) {
        let cpx = fil.cpx, cpy = fil.cpy;
        if (gStrength > 0.05) {
          const fmx = (fil.x1 + fil.x2) / 2, fmy = (fil.y1 + fil.y2) / 2;
          const dx = s.wellX - fmx, dy = s.wellY - fmy, dist = Math.max(20, Math.hypot(dx, dy));
          if (dist < wellRadius) { const bf = gStrength * 15 / Math.max(dist, 30); cpx += (dx / dist) * bf; cpy += (dy / dist) * bf; }
        }
        ctx.beginPath(); ctx.moveTo(fil.x1, fil.y1); ctx.quadraticCurveTo(cpx, cpy, fil.x2, fil.y2);
        ctx.strokeStyle = rgba(lerpColor(FILAMENT_COLOR, s.primaryRgb, 0.06), fil.alpha * entrance);
        ctx.lineWidth = minDim * (0.0008 + gStrength * 0.0012); ctx.lineCap = 'round'; ctx.stroke();
      }

      // Dust motes
      for (const d of s.dust) {
        const shimmer = p.reducedMotion ? 0.7 : 0.5 + 0.5 * Math.sin(s.frameCount * 0.02 + d.phase);
        let nearWell = 0;
        if (gStrength > 0.05) { const dist = Math.hypot(s.wellX - d.x, s.wellY - d.y); nearWell = dist < wellRadius ? (1 - dist / wellRadius) * s.wellStrength : 0; }
        const dustColor = lerpColor(lerpColor(DUST_DIM, s.primaryRgb, 0.05), lerpColor(DUST_LIT, s.accentRgb, 0.08), nearWell * 0.6);
        const alpha = (d.alpha + nearWell * 0.06) * shimmer * entrance;
        if (alpha < 0.005) continue;
        if (nearWell > 0.3 && d.size > minDim * 0.0012) {
          const glowR = d.size * 3;
          const glowGrad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, glowR);
          glowGrad.addColorStop(0, rgba(dustColor, alpha * 0.15)); glowGrad.addColorStop(1, rgba(dustColor, 0));
          ctx.fillStyle = glowGrad; ctx.fillRect(d.x - glowR, d.y - glowR, glowR * 2, glowR * 2);
        }
        ctx.beginPath(); ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2); ctx.fillStyle = rgba(dustColor, alpha); ctx.fill();
      }

      // Lensing ring
      if (gStrength > 0.05 && !p.reducedMotion) {
        const lensR = wellRadius * LENS_RING_FRAC * s.wellStrength;
        ctx.beginPath(); ctx.arc(s.wellX, s.wellY, lensR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(lerpColor(LENS_RING, s.primaryRgb, 0.06), s.wellStrength * 0.025 * entrance);
        ctx.lineWidth = minDim * (0.0008 + gStrength * 0.0012); ctx.stroke();
        const haloR = lensR * 2;
        const haloGrad = ctx.createRadialGradient(s.wellX, s.wellY, lensR * 0.8, s.wellX, s.wellY, haloR);
        haloGrad.addColorStop(0, rgba(lerpColor(WELL_AURA, s.accentRgb, 0.06), s.wellStrength * 0.025 * entrance * 0.3));
        haloGrad.addColorStop(0.5, rgba(lerpColor(WELL_AURA, s.accentRgb, 0.06), s.wellStrength * 0.025 * entrance * 0.08));
        haloGrad.addColorStop(1, rgba(lerpColor(WELL_AURA, s.accentRgb, 0.06), 0));
        ctx.fillStyle = haloGrad; ctx.fillRect(s.wellX - haloR, s.wellY - haloR, haloR * 2, haloR * 2);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'none' }} />
    </div>
  );
}
