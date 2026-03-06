/**
 * ATOM 094: THE FUTURE MEMORY ENGINE
 * Series 10 — Reality Bender · Position 4
 * Brownian particles crystallise into geometric form on sustained hold.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, ELEMENT_ALPHA, type RGB } from '../atom-utils';

const HAZE_COLOR: RGB = [120, 110, 140];
const CRYSTAL_COLOR: RGB = [200, 180, 240];
const CRYSTAL_GLOW: RGB = [220, 200, 255];
const BG_BASE: RGB = [18, 16, 24];
const PARTICLE_COUNT = 300;
const HOLD_THRESHOLD = 180;

interface CrystalParticle { homeX: number; homeY: number; x: number; y: number; vx: number; vy: number; }

function generateCrystalPositions(cx: number, cy: number, minDim: number, count: number): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  const r = minDim * 0.1;
  // Hexagonal crystal lattice
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const spacing = r * 2 / cols;
  for (let row = 0; row < rows && pts.length < count; row++) {
    for (let col = 0; col < cols && pts.length < count; col++) {
      const offset = row % 2 === 0 ? 0 : spacing * 0.5;
      pts.push({ x: cx - r + col * spacing + offset, y: cy - r + row * spacing });
    }
  }
  return pts;
}

export default function FutureMemoryAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<CrystalParticle[]>([]);
  const stateRef = useRef({
    entranceProgress: 0, isHolding: false, holdFrames: 0,
    crystallisation: 0, resolved: false, frame: 0,
  });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const { width: w, height: h } = viewport;
    const cx = w / 2, cy = h / 2, minDim = Math.min(w, h);

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

    if (particlesRef.current.length === 0) {
      const targets = generateCrystalPositions(cx, cy, minDim, PARTICLE_COUNT);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const t = targets[i] || { x: cx, y: cy };
        particlesRef.current.push({
          homeX: t.x, homeY: t.y,
          x: cx + (Math.random() - 0.5) * minDim * 0.6,
          y: cy + (Math.random() - 0.5) * minDim * 0.5,
          vx: (Math.random() - 0.5) * minDim * 0.004, vy: (Math.random() - 0.5) * minDim * 0.004,
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
        s.crystallisation = Math.min(1, s.holdFrames / HOLD_THRESHOLD);
        if (s.holdFrames === Math.round(HOLD_THRESHOLD * 0.5)) onHaptic('hold_threshold');
        if (s.crystallisation >= 1 && !s.resolved) {
          s.resolved = true; onHaptic('seal_stamp'); onHaptic('completion'); onResolve?.();
        }
      }
      onStateChange?.(s.crystallisation);

      const primaryRgb = parseColor(p.color);
      const dims = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const bgGrad = ctx.createRadialGradient(dims.cx, dims.cy, 0, dims.cx, dims.cy, dims.minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.015));
      bgGrad.addColorStop(1, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, dims.w, dims.h);

      const particles = particlesRef.current;
      const hazeCol = lerpColor(HAZE_COLOR, primaryRgb, 0.04);
      const crystalCol = lerpColor(CRYSTAL_COLOR, primaryRgb, 0.04);
      const t = s.crystallisation;

      for (const pt of particles) {
        if (!p.reducedMotion) {
          // Brownian motion (decays with crystallisation)
          pt.vx += (Math.random() - 0.5) * (1 - t) * 0.5;
          pt.vy += (Math.random() - 0.5) * (1 - t) * 0.5;
          // Crystal pull (increases with crystallisation)
          pt.vx += (pt.homeX - pt.x) * t * 0.02;
          pt.vy += (pt.homeY - pt.y) * t * 0.02;
          pt.vx *= 0.9; pt.vy *= 0.9;
          pt.x += pt.vx; pt.y += pt.vy;
        } else if (t > 0) {
          pt.x += (pt.homeX - pt.x) * 0.1;
          pt.y += (pt.homeY - pt.y) * 0.1;
        }

        const col = lerpColor(hazeCol, crystalCol, t);
        const alpha = (ELEMENT_ALPHA.primary.min + t * (ELEMENT_ALPHA.primary.max - ELEMENT_ALPHA.primary.min)) * ent;
        const ptSize = dims.minDim * 0.002 * (1 + t);
        ctx.fillStyle = rgba(col, alpha);
        ctx.fillRect(pt.x - ptSize / 2, pt.y - ptSize / 2, ptSize, ptSize);
      }

      // Crystal glow at high crystallisation
      if (t > 0.5) {
        const glowR = dims.minDim * 0.12;
        const gCol = lerpColor(CRYSTAL_GLOW, primaryRgb, 0.04);
        const grad = ctx.createRadialGradient(dims.cx, dims.cy, 0, dims.cx, dims.cy, glowR);
        grad.addColorStop(0, rgba(gCol, ELEMENT_ALPHA.glow.max * ent * (t - 0.5) * 2 * 0.3));
        grad.addColorStop(1, rgba(gCol, 0));
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(dims.cx, dims.cy, glowR, 0, Math.PI * 2); ctx.fill();
      }

      // Hold progress
      if (s.isHolding && !s.resolved) {
        ctx.strokeStyle = rgba(crystalCol, ELEMENT_ALPHA.primary.min * ent);
        ctx.lineWidth = dims.minDim * 0.002;
        ctx.beginPath();
        ctx.arc(dims.cx, dims.cy, dims.minDim * 0.14, -Math.PI / 2, -Math.PI / 2 + t * Math.PI * 2);
        ctx.stroke();
      }

      if (t < 0.05) {
        ctx.font = `${Math.round(dims.minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(HAZE_COLOR, primaryRgb, 0.06), ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText('hold to crystallise the future', dims.cx, dims.h * 0.9);
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