/**
 * ATOM 167: THE STEEL MAN BUILD ENGINE · Series 17 · Position 7
 * Tap to add structural beams to strengthen the opponent's argument.
 * Wireframe grows into a solid glowing structure.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

const TOTAL_BEAMS = 6;

export default function SteelManBuildAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    beams: 0, beamAnims: new Array(TOTAL_BEAMS).fill(0),
    completionFired: false,
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
      const steelC: RGB = lerpColor(accentC, [180, 200, 220], 0.3);

      for (let i = 0; i < TOTAL_BEAMS; i++) if (i < s.beams) s.beamAnims[i] = Math.min(1, s.beamAnims[i] + 0.04);

      const strength = s.beams / TOTAL_BEAMS;

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms + strength * 0.1) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Structure frame
      const frameW = minDim * 0.2; const frameH = minDim * 0.25;
      const fx = cx - frameW / 2; const fy = cy - frameH / 2;

      // Base outline (wireframe)
      ctx.strokeStyle = rgba(steelC, ELEMENT_ALPHA.tertiary.max * entrance);
      ctx.lineWidth = minDim * 0.0006;
      ctx.strokeRect(fx, fy, frameW, frameH);

      // Beam positions (structural elements)
      const beamDefs = [
        // horizontal beams
        { x1: fx, y1: fy + frameH * 0.25, x2: fx + frameW, y2: fy + frameH * 0.25 },
        { x1: fx, y1: fy + frameH * 0.5, x2: fx + frameW, y2: fy + frameH * 0.5 },
        { x1: fx, y1: fy + frameH * 0.75, x2: fx + frameW, y2: fy + frameH * 0.75 },
        // diagonal braces
        { x1: fx, y1: fy, x2: fx + frameW * 0.5, y2: fy + frameH * 0.5 },
        { x1: fx + frameW, y1: fy, x2: fx + frameW * 0.5, y2: fy + frameH * 0.5 },
        // center vertical
        { x1: cx, y1: fy, x2: cx, y2: fy + frameH },
      ];

      for (let i = 0; i < TOTAL_BEAMS; i++) {
        const ba = easeOutCubic(s.beamAnims[i]);
        if (ba <= 0) continue;
        const beam = beamDefs[i];
        const ex = beam.x1 + (beam.x2 - beam.x1) * ba;
        const ey = beam.y1 + (beam.y2 - beam.y1) * ba;
        ctx.beginPath(); ctx.moveTo(beam.x1, beam.y1); ctx.lineTo(ex, ey);
        ctx.strokeStyle = rgba(steelC, ELEMENT_ALPHA.primary.max * (1 + ba) * entrance);
        ctx.lineWidth = minDim * (0.001 + ba * 0.001); ctx.stroke();

        // Joint nodes
        ctx.beginPath(); ctx.arc(beam.x1, beam.y1, minDim * 0.003, 0, Math.PI * 2);
        ctx.fillStyle = rgba(steelC, ELEMENT_ALPHA.primary.max * ba * 2 * entrance); ctx.fill();
        if (ba > 0.9) {
          ctx.beginPath(); ctx.arc(ex, ey, minDim * 0.003, 0, Math.PI * 2); ctx.fill();
        }
      }

      // Full structure glow on completion
      if (strength >= 1) {
        const sGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, frameW * 0.8);
        sGrad.addColorStop(0, rgba(steelC, EMPHASIS_ALPHA.focal.min * entrance));
        sGrad.addColorStop(1, rgba(steelC, 0));
        ctx.fillStyle = sGrad; ctx.fillRect(fx - frameW * 0.3, fy - frameH * 0.3, frameW * 1.6, frameH * 1.6);
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (s.beams < TOTAL_BEAMS) ctx.fillText(`Tap to reinforce (${s.beams}/${TOTAL_BEAMS})`, cx, fy + frameH + minDim * 0.06);
      else ctx.fillText('Argument fortified.', cx, fy + frameH + minDim * 0.06);

      if (s.beams >= TOTAL_BEAMS && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(strength);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = () => {
      const s = stateRef.current;
      if (s.beams < TOTAL_BEAMS) { s.beams++; cbRef.current.onHaptic('drag_snap'); }
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}