/**
 * ATOM: WAVE COLLAPSE — Observation Changes Reality
 * Series 2 — Quantum Mechanics · Hold to collapse probability
 *
 * 220 quantum probability particles drift as Gaussian haze.
 * Hold to observe — collapse radiates outward from the touch point.
 * Breath drives collapse rate. At full crystallisation, lattice forms.
 *
 * INTERACTION: Hold (observation) · Breath (collapse rate)
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from './types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB, ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from './atom-utils';

const PARTICLE_COUNT = 220;
const MAX_BLUR_FRAC = 0.04;
const COLLAPSE_WAVE_SPEED = 2.5;
const BASE_COLLAPSE_RATE = 0.0015;
const BREATH_COLLAPSE_MULT = 0.006;
const BROWNIAN_STRENGTH = 0.8;
const LATTICE_SPACING = 0.035;
const CRYSTAL_PULL = 0.015;
const LATTICE_THRESHOLD = 0.85;

interface QuantumParticle {
  x: number; y: number; vx: number; vy: number;
  collapse: number; brightness: number; size: number;
  shimmerPhase: number; shimmerSpeed: number;
  crystalX: number; crystalY: number; collapseDelay: number;
}

const PROBABILITY_HAZE: RGB = [90, 70, 180];
const CRYSTALLINE: RGB = [200, 210, 255];
const LATTICE_LINE: RGB = [140, 160, 220];

function createParticles(w: number, h: number): QuantumParticle[] {
  const minDim = Math.min(w, h);
  const spacing = minDim * LATTICE_SPACING;
  const cols = Math.max(1, Math.floor(w * 0.7 / spacing));
  const neededRows = Math.ceil(PARTICLE_COUNT / cols);
  const ox = (w - cols * spacing) / 2;
  const oy = (h - neededRows * spacing) / 2;

  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    return {
      x: w * 0.1 + Math.random() * w * 0.8,
      y: h * 0.1 + Math.random() * h * 0.8,
      vx: (Math.random() - 0.5) * BROWNIAN_STRENGTH,
      vy: (Math.random() - 0.5) * BROWNIAN_STRENGTH,
      collapse: 0, brightness: 0.3 + Math.random() * 0.7,
      size: 1.2 + Math.random() * 2.5,
      shimmerPhase: Math.random() * Math.PI * 2,
      shimmerSpeed: 0.02 + Math.random() * 0.04,
      crystalX: ox + col * spacing + spacing / 2,
      crystalY: oy + row * spacing + spacing / 2,
      collapseDelay: Infinity,
    };
  });
}

export default function WaveCollapseAtom({
  breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    particles: [] as QuantumParticle[],
    isObserving: false, observeX: 0, observeY: 0,
    collapseWaveRadius: 0, globalCollapse: 0, holdFrames: 0,
    resolved: false, resolveGlow: 0,
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    initialized: false,
  });

  useEffect(() => { const s = stateRef.current; s.primaryRgb = parseColor(color); s.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const w = viewport.width, h = viewport.height, s = stateRef.current;
    const minDim = Math.min(w, h);

    if (!s.initialized) { s.particles = createParticles(w, h); s.initialized = true; }

    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      s.isObserving = true; s.holdFrames = 0;
      s.observeX = (e.clientX - rect.left) / rect.width * w;
      s.observeY = (e.clientY - rect.top) / rect.height * h;
      if (s.collapseWaveRadius === 0) s.collapseWaveRadius = 1;
      cbRef.current.onHaptic('hold_start');
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (s.isObserving) {
        s.observeX = (e.clientX - rect.left) / rect.width * w;
        s.observeY = (e.clientY - rect.top) / rect.height * h;
      }
    };
    const onUp = (e: PointerEvent) => { s.isObserving = false; canvas.releasePointerCapture(e.pointerId); };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const p = propsRef.current, cb = cbRef.current;
      const cw = Math.round(w * dpr), ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
      ctx.save(); ctx.scale(dpr, dpr); ctx.clearRect(0, 0, w, h); s.frameCount++;
      const maxBlur = minDim * MAX_BLUR_FRAC;

      if (s.entranceProgress < 1) s.entranceProgress = Math.min(1, s.entranceProgress + (p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE));
      const entrance = easeOutExpo(s.entranceProgress);

      // Collapse wave
      if (s.collapseWaveRadius > 0 && s.collapseWaveRadius < Math.max(w, h) * 1.5) s.collapseWaveRadius += COLLAPSE_WAVE_SPEED;

      if (s.isObserving) { s.holdFrames++; if (s.holdFrames === 45) cb.onHaptic('hold_threshold'); }

      let totalCollapse = 0;
      for (const pt of s.particles) {
        const dx = pt.x - s.observeX, dy = pt.y - s.observeY;
        const distFromObs = Math.sqrt(dx * dx + dy * dy);

        if (s.collapseWaveRadius > 0 && distFromObs < s.collapseWaveRadius) {
          if (pt.collapseDelay === Infinity) pt.collapseDelay = distFromObs;
          const waveAge = (s.collapseWaveRadius - pt.collapseDelay) / (minDim * 0.5);
          const collapseRate = Math.max(0, waveAge) * (BASE_COLLAPSE_RATE + p.breathAmplitude * BREATH_COLLAPSE_MULT);
          if (s.isObserving || pt.collapse > 0.1) pt.collapse = Math.min(1, pt.collapse + collapseRate);
        }

        if (!p.reducedMotion && pt.collapse < 0.9) {
          const bs = 1 - pt.collapse;
          pt.vx += (Math.random() - 0.5) * BROWNIAN_STRENGTH * bs;
          pt.vy += (Math.random() - 0.5) * BROWNIAN_STRENGTH * bs;
          pt.vx *= 0.95; pt.vy *= 0.95;
          pt.x += pt.vx; pt.y += pt.vy;
          if (pt.x < 20) pt.vx += 0.2; if (pt.x > w - 20) pt.vx -= 0.2;
          if (pt.y < 20) pt.vy += 0.2; if (pt.y > h - 20) pt.vy -= 0.2;
        }

        if (pt.collapse > 0.6) {
          const pull = (pt.collapse - 0.6) * CRYSTAL_PULL;
          pt.x += (pt.crystalX - pt.x) * pull; pt.y += (pt.crystalY - pt.y) * pull;
          pt.vx *= 0.9; pt.vy *= 0.9;
        }
        totalCollapse += pt.collapse;
      }

      s.globalCollapse = totalCollapse / PARTICLE_COUNT;
      cb.onStateChange?.(s.globalCollapse);

      if (s.globalCollapse > 0.95 && !s.resolved) {
        s.resolved = true; cb.onHaptic('completion'); cb.onResolve?.();
      }
      if (s.resolved) s.resolveGlow = Math.min(1, s.resolveGlow + 0.008);

      // ── RENDER ──

      // Background
      const bgBase = lerpColor([5, 4, 12], s.primaryRgb, 0.03);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(bgBase, [12, 10, 25], 0.4), entrance * 0.03));
      bgGrad.addColorStop(0.5, rgba(bgBase, entrance * 0.02));
      bgGrad.addColorStop(1, rgba(bgBase, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Probability haze
      if (s.globalCollapse < 0.8) {
        const hazeAlpha = (1 - s.globalCollapse * 1.2) * 0.08 * entrance;
        const hazeColor = lerpColor(PROBABILITY_HAZE, s.primaryRgb, 0.2);
        const hazeGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.5);
        hazeGrad.addColorStop(0, rgba(hazeColor, hazeAlpha));
        hazeGrad.addColorStop(0.5, rgba(hazeColor, hazeAlpha * 0.4));
        hazeGrad.addColorStop(1, rgba(hazeColor, 0));
        ctx.fillStyle = hazeGrad; ctx.fillRect(0, 0, w, h);
      }

      // Wave ring
      if (s.collapseWaveRadius > 0 && s.collapseWaveRadius < Math.max(w, h) * 1.5) {
        ctx.beginPath(); ctx.arc(s.observeX, s.observeY, s.collapseWaveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(lerpColor(s.accentRgb, CRYSTALLINE, 0.3), 0.05 * (1 - s.collapseWaveRadius / (Math.max(w, h) * 1.5)) * entrance);
        ctx.lineWidth = minDim * 0.002; ctx.stroke();
      }

      // Particles
      for (const pt of s.particles) {
        const c = pt.collapse;
        const blurRadius = maxBlur * (1 - c);
        const shimmer = p.reducedMotion ? 1 : 0.7 + 0.3 * Math.sin(s.frameCount * pt.shimmerSpeed + pt.shimmerPhase);
        const pColor = lerpColor(lerpColor(PROBABILITY_HAZE, s.primaryRgb, 0.2), lerpColor(CRYSTALLINE, s.accentRgb, 0.15), c);
        const baseAlpha = (0.08 + c * 0.55) * pt.brightness * shimmer * entrance;

        if (c < 0.5) {
          const blobR = pt.size + blurRadius;
          const blobGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, blobR);
          blobGrad.addColorStop(0, rgba(pColor, baseAlpha));
          blobGrad.addColorStop(0.3, rgba(pColor, baseAlpha * 0.5));
          blobGrad.addColorStop(0.7, rgba(pColor, baseAlpha * 0.15));
          blobGrad.addColorStop(1, rgba(pColor, 0));
          ctx.fillStyle = blobGrad; ctx.fillRect(pt.x - blobR, pt.y - blobR, blobR * 2, blobR * 2);
        } else {
          const hazeR = pt.size + blurRadius * 2;
          if (blurRadius > 0.5) {
            const hGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, hazeR);
            hGrad.addColorStop(0, rgba(pColor, baseAlpha * 0.2));
            hGrad.addColorStop(1, rgba(pColor, 0));
            ctx.fillStyle = hGrad; ctx.fillRect(pt.x - hazeR, pt.y - hazeR, hazeR * 2, hazeR * 2);
          }
          ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.size * (0.5 + c * 0.5), 0, Math.PI * 2);
          ctx.fillStyle = rgba(pColor, baseAlpha); ctx.fill();
          if (c > 0.8) {
            ctx.beginPath(); ctx.arc(pt.x - pt.size * 0.15, pt.y - pt.size * 0.15, pt.size * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = rgba([255, 255, 255], (c - 0.8) * 0.5 * baseAlpha); ctx.fill();
          }
        }
      }

      // Lattice connections
      if (s.globalCollapse > LATTICE_THRESHOLD) {
        const connAlpha = (s.globalCollapse - LATTICE_THRESHOLD) / (1 - LATTICE_THRESHOLD) * 0.08 * entrance;
        const lineColor = lerpColor(LATTICE_LINE, s.primaryRgb, 0.15);
        const nearDist = minDim * LATTICE_SPACING * 1.6;
        ctx.lineWidth = minDim * 0.002; ctx.strokeStyle = rgba(lineColor, connAlpha);
        for (let i = 0; i < s.particles.length; i++) {
          const a = s.particles[i]; if (a.collapse < 0.8) continue;
          let conns = 0;
          for (let j = i + 1; j < s.particles.length && conns < 4; j++) {
            const b = s.particles[j]; if (b.collapse < 0.8) continue;
            const d = Math.hypot(b.x - a.x, b.y - a.y);
            if (d < nearDist) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); conns++; }
          }
        }
      }

      // Observation point
      if (s.isObserving) {
        const focusR = 8 + p.breathAmplitude * 4;
        const fGrad = ctx.createRadialGradient(s.observeX, s.observeY, 0, s.observeX, s.observeY, focusR * 4);
        fGrad.addColorStop(0, rgba(s.accentRgb, 0.2 * entrance));
        fGrad.addColorStop(0.3, rgba(s.accentRgb, 0.06 * entrance));
        fGrad.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = fGrad; ctx.fillRect(s.observeX - focusR * 4, s.observeY - focusR * 4, focusR * 8, focusR * 8);
        ctx.beginPath(); ctx.arc(s.observeX, s.observeY, minDim * 0.004, 0, Math.PI * 2);
        ctx.fillStyle = rgba(lerpColor(CRYSTALLINE, s.accentRgb, 0.2), 0.4 * entrance); ctx.fill();
      }

      // Resolution glow
      if (s.resolveGlow > 0) {
        const glowR = minDim * 0.4;
        const pulse = p.reducedMotion ? 1 : 0.9 + 0.1 * Math.sin(s.frameCount * 0.02);
        const rGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, glowR);
        rGrad.addColorStop(0, rgba(lerpColor(CRYSTALLINE, s.accentRgb, 0.15), s.resolveGlow * 0.08 * pulse * entrance));
        rGrad.addColorStop(0.5, rgba(s.accentRgb, s.resolveGlow * 0.03 * entrance));
        rGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = rGrad; ctx.fillRect(w / 2 - glowR, h / 2 - glowR, glowR * 2, glowR * 2);
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} />
    </div>
  );
}
