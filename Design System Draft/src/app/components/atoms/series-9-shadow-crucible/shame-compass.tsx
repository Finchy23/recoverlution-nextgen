/**
 * ATOM 087: THE COMPASS OF SHAME ENGINE
 * Series 9 — Shadow & Crucible · Position 7
 * Drag the needle into the darkest zone to find your values.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, ELEMENT_ALPHA, type RGB } from '../atom-utils';

const NEEDLE_COLOR: RGB = [200, 80, 80];
const DARK_ZONE: RGB = [30, 20, 45];
const LIGHT_BURST: RGB = [240, 220, 160];
const RING_COLOR: RGB = [80, 70, 95];
const BG_BASE: RGB = [18, 16, 24];

export default function ShameCompassAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    entranceProgress: 0, needleAngle: -Math.PI / 2,
    targetAngle: -Math.PI / 2, isDragging: false,
    dragStartAngle: 0, dragStartNeedle: 0,
    darkZoneAngle: Math.PI * 0.75, // bottom-right quadrant
    penetration: 0, burstGlow: 0,
    lastDetent: -1, resolved: false, frame: 0,
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
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w - w / 2;
      const py = (e.clientY - rect.top) / rect.height * h - h / 2;
      s.isDragging = true;
      s.dragStartAngle = Math.atan2(py, px);
      s.dragStartNeedle = s.needleAngle;
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.isDragging) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w - w / 2;
      const py = (e.clientY - rect.top) / rect.height * h - h / 2;
      const angle = Math.atan2(py, px);
      let delta = angle - s.dragStartAngle;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      s.targetAngle = s.dragStartNeedle + delta;
      const detent = Math.floor(((s.targetAngle % (Math.PI * 2)) + Math.PI * 2) / (Math.PI / 4));
      if (detent !== s.lastDetent) { s.lastDetent = detent; onHaptic('drag_snap'); }
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

      const lrp = p.reducedMotion ? 0.3 : 0.06;
      s.needleAngle += (s.targetAngle - s.needleAngle) * lrp;

      // Check proximity to dark zone
      let angleDiff = Math.abs(s.needleAngle - s.darkZoneAngle);
      angleDiff = angleDiff % (Math.PI * 2);
      if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
      s.penetration = Math.max(0, 1 - angleDiff / (Math.PI * 0.3));

      if (s.penetration > 0.9 && !s.resolved) {
        s.resolved = true; s.burstGlow = 1;
        onHaptic('step_advance'); onHaptic('completion'); onResolve?.();
      }
      if (s.burstGlow > 0) s.burstGlow *= 0.98;
      onStateChange?.(s.penetration);

      const primaryRgb = parseColor(p.color);
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.015));
      bgGrad.addColorStop(1, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const compassR = minDim * 0.2;

      // Dark zone wedge
      const darkCol = lerpColor(DARK_ZONE, primaryRgb, 0.02);
      ctx.fillStyle = rgba(darkCol, ELEMENT_ALPHA.secondary.max * ent);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, compassR * 1.2, s.darkZoneAngle - 0.4, s.darkZoneAngle + 0.4);
      ctx.closePath(); ctx.fill();

      // Compass ring
      const ringCol = lerpColor(RING_COLOR, primaryRgb, 0.04);
      ctx.strokeStyle = rgba(ringCol, ELEMENT_ALPHA.secondary.max * ent);
      ctx.lineWidth = minDim * 0.0006;
      ctx.beginPath(); ctx.arc(cx, cy, compassR, 0, Math.PI * 2); ctx.stroke();

      // Tick marks
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const inner = compassR * 0.9;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
        ctx.lineTo(cx + Math.cos(a) * compassR, cy + Math.sin(a) * compassR);
        ctx.stroke();
      }

      // Needle
      const needleLen = compassR * 0.85;
      const needleCol = lerpColor(NEEDLE_COLOR, primaryRgb, 0.05);
      ctx.strokeStyle = rgba(needleCol, ELEMENT_ALPHA.primary.max * ent);
      ctx.lineWidth = Math.max(1, minDim * 0.003);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(s.needleAngle) * needleLen, cy + Math.sin(s.needleAngle) * needleLen);
      ctx.stroke();

      // Centre dot
      ctx.fillStyle = rgba(needleCol, ELEMENT_ALPHA.primary.max * ent);
      ctx.beginPath(); ctx.arc(cx, cy, minDim * 0.006, 0, Math.PI * 2); ctx.fill();

      // Light burst on resolution
      if (s.burstGlow > 0.01) {
        const burstCol = lerpColor(LIGHT_BURST, primaryRgb, 0.04);
        const bR = compassR * 1.5 * s.burstGlow;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, bR);
        grad.addColorStop(0, rgba(burstCol, ELEMENT_ALPHA.glow.max * ent * s.burstGlow * 0.5));
        grad.addColorStop(1, rgba(burstCol, 0));
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(cx, cy, bR, 0, Math.PI * 2); ctx.fill();
      }

      if (!s.resolved && s.penetration < 0.1) {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(RING_COLOR, primaryRgb, 0.06), ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText('point the needle into the dark', cx, h * 0.9);
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