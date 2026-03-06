/**
 * ATOM 088: THE FORGE ENGINE
 * Series 9 — Shadow & Crucible · Position 8
 * Strike the anvil rhythmically to forge a shape from rage.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, ELEMENT_ALPHA, type RGB } from '../atom-utils';

const HOT_METAL: RGB = [220, 120, 40];
const COOL_STEEL: RGB = [160, 170, 185];
const ANVIL_COLOR: RGB = [70, 65, 80];
const SPARK: RGB = [255, 200, 80];
const BG_BASE: RGB = [18, 16, 24];

const STRIKES_NEEDED = 12;
const SPARK_COUNT_PER_STRIKE = 8;

interface SparkParticle { x: number; y: number; vx: number; vy: number; alpha: number; }

export default function AngerForgeAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    entranceProgress: 0, strikes: 0, shakeFrame: 0,
    sparks: [] as SparkParticle[], forgeT: 0,
    resolved: false, frame: 0,
  });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);

    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const s = stateRef.current;
      if (s.resolved) return;
      s.strikes++;
      s.shakeFrame = 6;
      s.forgeT = Math.min(1, s.strikes / STRIKES_NEEDED);
      onHaptic('tap');
      const cx = w / 2, cy = h * 0.5;
      for (let i = 0; i < SPARK_COUNT_PER_STRIKE; i++) {
        const a = Math.random() * Math.PI * 2;
        s.sparks.push({
          x: cx + (Math.random() - 0.5) * minDim * 0.04,
          y: cy,
          vx: Math.cos(a) * minDim * (0.004 + Math.random() * 0.008),
          vy: Math.sin(a) * minDim * (0.004 + Math.random() * 0.008) - minDim * 0.004,
          alpha: ELEMENT_ALPHA.primary.max,
        });
      }
      if (s.strikes >= STRIKES_NEEDED && !s.resolved) {
        s.resolved = true;
        onHaptic('step_advance'); onHaptic('completion'); onResolve?.();
      }
    };
    canvas.addEventListener('pointerdown', onDown);

    let raf = 0;

    const render = () => {
      raf = requestAnimationFrame(render);
      const s = stateRef.current; const p = propsRef.current; s.frame++;
      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress; const ent = adv.entrance;

      if (s.shakeFrame > 0) s.shakeFrame--;

      // Sparks
      for (const sp of s.sparks) { sp.x += sp.vx; sp.y += sp.vy; sp.vy += minDim * 0.0003; sp.alpha *= 0.94; }
      s.sparks = s.sparks.filter(sp => sp.alpha > 0.005);

      onStateChange?.(s.forgeT);

      const primaryRgb = parseColor(p.color);
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const shake = p.reducedMotion ? 0 : (Math.random() - 0.5) * s.shakeFrame * minDim * 0.001;

      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.015));
      bgGrad.addColorStop(1, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Anvil
      const anvilW = minDim * 0.2, anvilH = minDim * 0.04;
      const anvilY = cy + minDim * 0.05;
      const anvilCol = lerpColor(ANVIL_COLOR, primaryRgb, 0.04);
      ctx.fillStyle = rgba(anvilCol, ELEMENT_ALPHA.primary.max * ent);
      ctx.fillRect(cx - anvilW / 2 + shake, anvilY, anvilW, anvilH);

      // Workpiece (morphs from amorphous blob to sharp blade shape)
      const wpY = anvilY - minDim * 0.01;
      const hotCol = lerpColor(HOT_METAL, primaryRgb, 0.05);
      const coolCol = lerpColor(COOL_STEEL, primaryRgb, 0.05);
      const wpCol = lerpColor(hotCol, coolCol, s.forgeT);
      ctx.fillStyle = rgba(wpCol, ELEMENT_ALPHA.primary.max * ent);

      const blobW = minDim * 0.08 * (1 - s.forgeT * 0.3);
      const blobH = minDim * 0.04 * (1 - s.forgeT * 0.6);
      const sharpW = minDim * 0.12 * s.forgeT;
      const sharpH = minDim * 0.015 * s.forgeT;

      // Blend between blob and blade
      const finalW = blobW + sharpW;
      const finalH = Math.max(blobH, sharpH + blobH * (1 - s.forgeT));
      ctx.beginPath();
      ctx.roundRect(cx - finalW / 2 + shake, wpY - finalH + shake, finalW, finalH, s.forgeT < 0.5 ? minDim * 0.012 : minDim * 0.004);
      ctx.fill();

      // Glow when hot
      if (s.forgeT < 0.8) {
        const glowAlpha = ELEMENT_ALPHA.glow.max * ent * (1 - s.forgeT) * 0.3;
        const gr = minDim * 0.06;
        const grad = ctx.createRadialGradient(cx + shake, wpY - finalH / 2 + shake, 0, cx, wpY - finalH / 2, gr);
        grad.addColorStop(0, rgba(hotCol, glowAlpha));
        grad.addColorStop(1, rgba(hotCol, 0));
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(cx + shake, wpY - finalH / 2 + shake, gr, 0, Math.PI * 2); ctx.fill();
      }

      // Sparks
      const sparkCol = lerpColor(SPARK, primaryRgb, 0.04);
      const spSize = minDim * 0.004;
      for (const sp of s.sparks) {
        ctx.fillStyle = rgba(sparkCol, sp.alpha * ent);
        ctx.fillRect(sp.x - spSize / 2, sp.y - spSize / 2, spSize, spSize);
      }

      // Strike counter
      ctx.font = `${Math.round(minDim * 0.013)}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      const labelCol = lerpColor(COOL_STEEL, primaryRgb, 0.05);
      ctx.fillStyle = rgba(labelCol, ELEMENT_ALPHA.text.min * ent * 0.5);
      ctx.fillText(`${s.strikes} / ${STRIKES_NEEDED}`, cx, h * 0.85);

      if (s.strikes === 0) {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = rgba(labelCol, ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText('tap to strike the anvil', cx, h * 0.92);
      }
      ctx.restore();
    };
    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport, onStateChange, onHaptic, onResolve]);

  return (
    <canvas ref={canvasRef}
      style={{ width: viewport.width, height: viewport.height, display: 'block', touchAction: 'none', cursor: 'pointer' }}
    />
  );
}