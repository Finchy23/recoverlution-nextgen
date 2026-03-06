/**
 * ATOM 161: THE MIRROR SHIELD ENGINE · Series 17 · Position 1
 * Aggressive phrases fall from above. Tap to deflect them —
 * each one bounces off a kinetic shield with a metallic ping.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

interface Phrase { text: string; x: number; y: number; vy: number; deflected: boolean; deflectAnim: number; vx: number; }

const HARSH = ['You always…', 'You never…', 'It\'s your fault', 'Not good enough', 'You can\'t'];

export default function MirrorShieldAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    phrases: [] as Phrase[], deflected: 0, spawned: 0, completionFired: false,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const shieldC: RGB = lerpColor(accentC, [180, 220, 255], 0.3);
      const aggroC: RGB = lerpColor(accentC, [220, 80, 60], 0.5);

      // Spawn phrases
      if (entrance > 0.5 && s.spawned < HARSH.length && s.frameCount % 80 === 0) {
        const text = HARSH[s.spawned];
        s.phrases.push({ text, x: cx + (Math.random() - 0.5) * minDim * 0.2, y: -minDim * 0.05, vy: minDim * 0.001, deflected: false, deflectAnim: 0, vx: 0 });
        s.spawned++;
      }

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Shield arc
      const shieldY = cy + minDim * 0.08;
      const shieldR = minDim * 0.1;
      ctx.beginPath();
      ctx.arc(cx, shieldY, shieldR, Math.PI * 1.1, Math.PI * 1.9);
      ctx.strokeStyle = rgba(shieldC, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.lineWidth = minDim * 0.003;
      ctx.stroke();
      // Shield glow
      const sgGrad = ctx.createRadialGradient(cx, shieldY, shieldR * 0.8, cx, shieldY, shieldR * 1.5);
      sgGrad.addColorStop(0, rgba(shieldC, ELEMENT_ALPHA.glow.max * entrance));
      sgGrad.addColorStop(1, rgba(shieldC, 0));
      ctx.fillStyle = sgGrad;
      ctx.fillRect(cx - shieldR * 1.5, shieldY - shieldR * 1.5, shieldR * 3, shieldR * 3);

      // Phrases
      const fs = Math.max(8, minDim * 0.014);
      ctx.font = `600 ${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      for (const ph of s.phrases) {
        if (!ph.deflected) {
          ph.y += ph.vy;
          ctx.fillStyle = rgba(aggroC, ELEMENT_ALPHA.text.max * entrance);
          ctx.fillText(ph.text, ph.x, ph.y);
        } else {
          ph.deflectAnim = Math.min(1, ph.deflectAnim + 0.03);
          ph.y -= minDim * 0.003; ph.x += ph.vx;
          const da = 1 - ph.deflectAnim;
          ctx.globalAlpha = da;
          ctx.fillStyle = rgba(shieldC, ELEMENT_ALPHA.text.max * da * entrance);
          ctx.fillText(ph.text, ph.x, ph.y);
          ctx.globalAlpha = 1;
        }
      }

      // Status
      const fs2 = Math.max(8, minDim * 0.012);
      ctx.font = `${fs2}px -apple-system, sans-serif`;
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (s.deflected < HARSH.length) ctx.fillText(`Deflected ${s.deflected}/${HARSH.length}`, cx, h - minDim * 0.04);
      else ctx.fillText('Shield held.', cx, h - minDim * 0.04);

      if (s.deflected >= HARSH.length && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.deflected / HARSH.length);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * viewport.width;
      const py = (e.clientY - rect.top) / rect.height * viewport.height;
      const s = stateRef.current;
      const minDim2 = Math.min(viewport.width, viewport.height);
      for (const ph of s.phrases) {
        if (ph.deflected) continue;
        if (Math.abs(px - ph.x) < minDim2 * 0.1 && Math.abs(py - ph.y) < minDim2 * 0.03) {
          ph.deflected = true; ph.vx = (px < viewport.width / 2 ? 1 : -1) * minDim2 * 0.003;
          s.deflected++; cbRef.current.onHaptic('tap'); break;
        }
      }
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}