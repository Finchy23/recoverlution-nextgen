/**
 * ATOM 090: THE PHOENIX ENGINE
 * Series 9 — Shadow & Crucible · Position 10
 * Blow away the ash to reveal the jewel beneath. Drag to create wind.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, ELEMENT_ALPHA, type RGB } from '../atom-utils';

const ASH_COLOR: RGB = [80, 75, 70];
const ASH_LIGHT: RGB = [120, 110, 100];
const JEWEL_COLOR: RGB = [220, 180, 100];
const JEWEL_GLOW: RGB = [255, 230, 150];
const BG_BASE: RGB = [18, 16, 24];

const ASH_COUNT = 800;

interface AshParticle { x: number; y: number; homeX: number; homeY: number; vx: number; vy: number; blown: boolean; size: number; }

export default function PhoenixAshAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ashRef = useRef<AshParticle[]>([]);
  const stateRef = useRef({
    entranceProgress: 0, isDragging: false,
    lastX: 0, lastY: 0, windVx: 0, windVy: 0,
    blownCount: 0, revealGlow: 0,
    resolved: false, frame: 0,
  });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;

    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      s.isDragging = true;
      s.lastX = (e.clientX - rect.left) / rect.width * w;
      s.lastY = (e.clientY - rect.top) / rect.height * h;
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.isDragging) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;
      s.windVx = (px - s.lastX) * 0.3;
      s.windVy = (py - s.lastY) * 0.3;
      s.lastX = px; s.lastY = py;
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      stateRef.current.isDragging = false;
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      const s = stateRef.current; const p = propsRef.current; s.frame++;
      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress; const ent = adv.entrance;

      const primaryRgb = parseColor(p.color);
      const dims = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const bgGrad = ctx.createRadialGradient(dims.cx, dims.cy, 0, dims.cx, dims.cy, dims.minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.015));
      bgGrad.addColorStop(1, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, dims.w, dims.h);

      const ash = ashRef.current;
      // Apply wind to nearby unblown particles
      if (s.isDragging && !p.reducedMotion) {
        for (const pt of ash) {
          if (pt.blown) continue;
          const dx = pt.x - s.lastX;
          const dy = pt.y - s.lastY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < w * 0.1) {
            pt.vx += s.windVx * 0.5;
            pt.vy += s.windVy * 0.5 - dims.minDim * 0.001;
            pt.blown = true;
            s.blownCount++;
          }
        }
      }
      s.windVx *= 0.9; s.windVy *= 0.9;

      // Update particles
      if (!p.reducedMotion) {
        for (const pt of ash) {
          if (pt.blown) {
            pt.vy += dims.minDim * 0.00004;
            pt.x += pt.vx; pt.y += pt.vy;
            pt.vx *= 0.99; pt.vy *= 0.99;
          }
        }
      }

      const progress = s.blownCount / ASH_COUNT;
      onStateChange?.(progress);
      if (progress > 0.7 && !s.resolved) {
        s.resolved = true; onHaptic('step_advance'); onHaptic('completion'); onResolve?.();
      }
      s.revealGlow = Math.min(1, progress * 1.5);

      // Jewel (revealed under ash)
      if (s.revealGlow > 0.1) {
        const jR = dims.minDim * 0.025 * s.revealGlow;
        const jGlowR = jR * 4;
        const jCol = lerpColor(JEWEL_COLOR, primaryRgb, 0.04);
        const jGCol = lerpColor(JEWEL_GLOW, primaryRgb, 0.04);
        const grad = ctx.createRadialGradient(dims.cx, dims.cy, 0, dims.cx, dims.cy, jGlowR);
        grad.addColorStop(0, rgba(jGCol, ELEMENT_ALPHA.glow.max * ent * s.revealGlow * 0.5));
        grad.addColorStop(1, rgba(jGCol, 0));
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(dims.cx, dims.cy, jGlowR, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = rgba(jCol, ELEMENT_ALPHA.primary.max * ent * s.revealGlow);
        ctx.beginPath(); ctx.arc(dims.cx, dims.cy, jR, 0, Math.PI * 2); ctx.fill();
      }

      // Ash particles
      const ashCol = lerpColor(ASH_COLOR, primaryRgb, 0.04);
      const ashLCol = lerpColor(ASH_LIGHT, primaryRgb, 0.04);
      for (const pt of ash) {
        if (pt.y > dims.h + dims.minDim * 0.05 || pt.x < -dims.minDim * 0.05 || pt.x > dims.w + dims.minDim * 0.05) continue;
        const col = pt.blown ? ashLCol : ashCol;
        const alpha = pt.blown
          ? ELEMENT_ALPHA.secondary.max * ent * 0.5
          : ELEMENT_ALPHA.primary.min * ent;
        ctx.fillStyle = rgba(col, alpha);
        ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
      }

      if (s.blownCount < 10 && !s.resolved) {
        ctx.font = `${Math.round(dims.minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(ASH_LIGHT, primaryRgb, 0.06), ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText('drag to blow away the ash', dims.cx, dims.h * 0.9);
      }
      ctx.restore();
    };
    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport, onStateChange, onHaptic, onResolve]);

  return (
    <canvas ref={canvasRef}
      style={{ width: viewport.width, height: viewport.height, display: 'block', touchAction: 'none', cursor: 'grab' }}
    />
  );
}