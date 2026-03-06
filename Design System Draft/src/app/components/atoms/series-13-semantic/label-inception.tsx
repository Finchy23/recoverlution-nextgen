/**
 * ATOM 126: THE LABEL INCEPTION ENGINE
 * ======================================
 * Series 13 — Semantic Translators · Position 6
 *
 * Drag a golden label onto a dark jagged avatar. The avatar
 * absorbs it and softens, adopting the warm hue.
 *
 * PHYSICS: Sticker adhesion, physics-based badging, aura propagation
 * INTERACTION: Drag label onto avatar
 * RENDER: Canvas 2D
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB,
} from '../atom-utils';

export default function LabelInceptionAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    labelX: 0, labelY: 0, dragging: false,
    absorbed: false, absorbAnim: 0,
    completionFired: false,
  });

  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    stateRef.current.labelX = viewport.width * 0.5;
    stateRef.current.labelY = viewport.height * 0.72;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      const baseC = s.primaryRgb;
      const accentC = s.accentRgb;
      const goldC: RGB = lerpColor(accentC, [255, 210, 80], 0.5);

      if (s.absorbed) s.absorbAnim = Math.min(1, s.absorbAnim + 0.02);
      const aa = easeOutCubic(s.absorbAnim);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Avatar (jagged → smooth)
      const avatarY = cy - minDim * 0.05;
      const avatarR = minDim * 0.08;
      const avatarColor = lerpColor(baseC, goldC, aa * 0.6);
      const sides = 8;

      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        const jaggedness = aa < 1 ? (1 - aa) * 0.3 * Math.sin(i * 5.1) : 0;
        const r = avatarR * (1 + jaggedness);
        const x = cx + Math.cos(angle) * r;
        const y = avatarY + Math.sin(angle) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = rgba(avatarColor, ELEMENT_ALPHA.primary.max * (1.5 + aa) * entrance);
      ctx.fill();

      // Aura glow when absorbed
      if (aa > 0.3) {
        const auraR = avatarR * (1 + (aa - 0.3) * 0.8);
        const aGrad = ctx.createRadialGradient(cx, avatarY, avatarR * 0.5, cx, avatarY, auraR);
        aGrad.addColorStop(0, rgba(goldC, EMPHASIS_ALPHA.focal.min * entrance * (aa - 0.3)));
        aGrad.addColorStop(1, rgba(goldC, 0));
        ctx.fillStyle = aGrad;
        ctx.fillRect(cx - auraR, avatarY - auraR, auraR * 2, auraR * 2);
      }

      // Draggable label
      if (!s.absorbed) {
        const lfs = Math.max(8, minDim * 0.014);
        ctx.font = `600 ${lfs}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const labelW = minDim * 0.14;
        const labelH = minDim * 0.04;
        ctx.fillStyle = rgba(goldC, EMPHASIS_ALPHA.focal.max * entrance);
        const lx = s.labelX - labelW / 2;
        const ly = s.labelY - labelH / 2;
        const r = minDim * 0.005;
        ctx.beginPath();
        ctx.moveTo(lx + r, ly);
        ctx.lineTo(lx + labelW - r, ly);
        ctx.quadraticCurveTo(lx + labelW, ly, lx + labelW, ly + r);
        ctx.lineTo(lx + labelW, ly + labelH - r);
        ctx.quadraticCurveTo(lx + labelW, ly + labelH, lx + labelW - r, ly + labelH);
        ctx.lineTo(lx + r, ly + labelH);
        ctx.quadraticCurveTo(lx, ly + labelH, lx, ly + labelH - r);
        ctx.lineTo(lx, ly + r);
        ctx.quadraticCurveTo(lx, ly, lx + r, ly);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = rgba(goldC, EMPHASIS_ALPHA.focal.max * entrance);
        ctx.fillText('Trying their best', s.labelX, s.labelY);
      }

      if (s.absorbAnim >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }
      cb.onStateChange?.(aa);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      if (stateRef.current.absorbed) return;
      stateRef.current.dragging = true;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.dragging) return;
      const rect = canvas.getBoundingClientRect();
      stateRef.current.labelX = (e.clientX - rect.left) / rect.width * viewport.width;
      stateRef.current.labelY = (e.clientY - rect.top) / rect.height * viewport.height;
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      s.dragging = false;
      canvas.releasePointerCapture(e.pointerId);
      const minDim2 = Math.min(viewport.width, viewport.height);
      const avatarY = viewport.height / 2 - minDim2 * 0.05;
      const dx = s.labelX - viewport.width / 2;
      const dy = s.labelY - avatarY;
      if (dx * dx + dy * dy < (minDim2 * 0.1) ** 2) {
        s.absorbed = true;
        cbRef.current.onHaptic('drag_snap');
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}