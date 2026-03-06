/**
 * ATOM 095: THE LUCK SURFACE ENGINE
 * Series 10 — Reality Bender · Position 5
 * Expand your surface area to catch ambient opportunity particles.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, ELEMENT_ALPHA, type RGB } from '../atom-utils';

const CIRCLE_COLOR: RGB = [140, 130, 170];
const OPP_COLOR: RGB = [220, 200, 100];
const OPP_CAUGHT: RGB = [240, 220, 140];
const BG_BASE: RGB = [18, 16, 24];
const OPP_COUNT = 40;
const CATCH_GOAL = 10;

interface Opportunity { x: number; y: number; vx: number; vy: number; caught: boolean; alpha: number; }

export default function LuckSurfaceAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const oppsRef = useRef<Opportunity[]>([]);
  const stateRef = useRef({
    entranceProgress: 0, radius: 0, targetRadius: 0,
    isDragging: false, pinchDist: 0,
    pointers: new Map<number, { x: number; y: number }>(),
    caught: 0, resolved: false, frame: 0,
  });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  useEffect(() => {
    const { width: w, height: h } = viewport;
    const minDim = Math.min(w, h);
    stateRef.current.radius = minDim * 0.03;
    stateRef.current.targetRadius = minDim * 0.03;
    oppsRef.current = [];
    for (let i = 0; i < OPP_COUNT; i++) {
      oppsRef.current.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * minDim * 0.003, vy: (Math.random() - 0.5) * minDim * 0.003,
        caught: false, alpha: ELEMENT_ALPHA.primary.max,
      });
    }
  }, [viewport]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);

    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const s = stateRef.current; const rect = canvas.getBoundingClientRect();
      s.pointers.set(e.pointerId, {
        x: (e.clientX - rect.left) / rect.width * w,
        y: (e.clientY - rect.top) / rect.height * h,
      });
      if (s.pointers.size === 2) {
        const pts = Array.from(s.pointers.values());
        s.pinchDist = Math.sqrt((pts[1].x - pts[0].x) ** 2 + (pts[1].y - pts[0].y) ** 2);
      }
      s.isDragging = true;
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.isDragging) return;
      const rect = canvas.getBoundingClientRect();
      s.pointers.set(e.pointerId, {
        x: (e.clientX - rect.left) / rect.width * w,
        y: (e.clientY - rect.top) / rect.height * h,
      });
      if (s.pointers.size === 2) {
        const pts = Array.from(s.pointers.values());
        const dist = Math.sqrt((pts[1].x - pts[0].x) ** 2 + (pts[1].y - pts[0].y) ** 2);
        const delta = dist - s.pinchDist;
        s.targetRadius = Math.max(minDim * 0.03, Math.min(minDim * 0.3, minDim * 0.03 + delta));
      } else {
        const cx = w / 2, cy = h / 2;
        const pts = Array.from(s.pointers.values());
        if (pts.length > 0) {
          const pt = pts[0];
          const dist = Math.sqrt((pt.x - cx) ** 2 + (pt.y - cy) ** 2);
          s.targetRadius = Math.max(minDim * 0.03, Math.min(minDim * 0.3, dist * 0.6));
        }
      }
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      const s = stateRef.current; s.pointers.delete(e.pointerId);
      if (s.pointers.size === 0) s.isDragging = false;
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

      s.radius += (s.targetRadius - s.radius) * 0.06;

      const primaryRgb = parseColor(p.color);
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.015));
      bgGrad.addColorStop(1, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Move opportunities
      const opps = oppsRef.current;
      for (const opp of opps) {
        if (opp.caught) continue;
        opp.x += opp.vx; opp.y += opp.vy;
        if (opp.x < 0 || opp.x > w) opp.vx *= -1;
        if (opp.y < 0 || opp.y > h) opp.vy *= -1;

        // Check if caught by circle
        const d = Math.sqrt((opp.x - cx) ** 2 + (opp.y - cy) ** 2);
        if (d < s.radius) {
          opp.caught = true; s.caught++;
          onHaptic('tap');
          if (s.caught >= CATCH_GOAL && !s.resolved) {
            s.resolved = true; onHaptic('completion'); onResolve?.();
          }
        }
      }
      onStateChange?.(s.caught / CATCH_GOAL);

      // Draw luck surface circle
      const circleCol = lerpColor(CIRCLE_COLOR, primaryRgb, 0.04);
      ctx.strokeStyle = rgba(circleCol, ELEMENT_ALPHA.secondary.max * ent);
      ctx.lineWidth = minDim * 0.0006;
      ctx.beginPath(); ctx.arc(cx, cy, s.radius, 0, Math.PI * 2); ctx.stroke();

      // Fill with subtle glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, s.radius);
      grad.addColorStop(0, rgba(circleCol, ELEMENT_ALPHA.tertiary.min * ent));
      grad.addColorStop(1, rgba(circleCol, 0));
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(cx, cy, s.radius, 0, Math.PI * 2); ctx.fill();

      // Draw opportunities
      const oppCol = lerpColor(OPP_COLOR, primaryRgb, 0.05);
      const caughtCol = lerpColor(OPP_CAUGHT, primaryRgb, 0.04);
      const oppR = minDim * 0.004;
      for (const opp of opps) {
        if (opp.caught) {
          opp.alpha *= 0.96;
          if (opp.alpha < 0.01) continue;
          ctx.fillStyle = rgba(caughtCol, opp.alpha * ent);
          ctx.beginPath(); ctx.arc(opp.x, opp.y, oppR, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillStyle = rgba(oppCol, ELEMENT_ALPHA.primary.min * ent);
          ctx.beginPath(); ctx.arc(opp.x, opp.y, oppR * 1.2, 0, Math.PI * 2); ctx.fill();
        }
      }

      // Counter
      ctx.font = `${Math.round(minDim * 0.013)}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(circleCol, ELEMENT_ALPHA.text.min * ent * 0.5);
      ctx.fillText(`${s.caught} / ${CATCH_GOAL}`, cx, cy);

      if (s.caught === 0) {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = rgba(circleCol, ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText('expand to catch opportunities', cx, h * 0.9);
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
      style={{ width: viewport.width, height: viewport.height, display: 'block', touchAction: 'none' }}
    />
  );
}