/**
 * ATOM 170: THE COMMON GROUND SEAL · Series 17 · Position 10
 * Tap to shatter surface conflict layers. Beneath them all:
 * shared bedrock. The capstone of Series 17.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

const LAYERS_COUNT = 4;

export default function CommonGroundSealAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    shattered: 0, shatterAnims: new Array(LAYERS_COUNT).fill(0),
    bedrockAnim: 0, completionFired: false,
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
      const bedrockC: RGB = lerpColor(accentC, [180, 160, 120], 0.3);
      const layerColors: RGB[] = [
        lerpColor(accentC, [200, 60, 60], 0.5),
        lerpColor(accentC, [180, 100, 60], 0.5),
        lerpColor(accentC, [160, 140, 80], 0.5),
        lerpColor(accentC, [140, 160, 120], 0.4),
      ];

      for (let i = 0; i < LAYERS_COUNT; i++) if (i < s.shattered) s.shatterAnims[i] = Math.min(1, s.shatterAnims[i] + 0.03);
      const allShattered = s.shattered >= LAYERS_COUNT;
      if (allShattered) s.bedrockAnim = Math.min(1, s.bedrockAnim + 0.02);
      const ba = easeOutCubic(s.bedrockAnim);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Geological layers (drawn bottom-up)
      const layerH = minDim * 0.04;
      const layerW = minDim * 0.3;
      const stackTop = cy - (LAYERS_COUNT * layerH) / 2;

      // Bedrock (always there, revealed when layers shatter)
      if (ba > 0) {
        const brY = stackTop + LAYERS_COUNT * layerH;
        const brH = minDim * 0.05;
        ctx.fillStyle = rgba(bedrockC, ELEMENT_ALPHA.primary.max * ba * 2 * entrance);
        ctx.fillRect(cx - layerW / 2, brY, layerW, brH);
        // Bedrock glow
        const brGrad = ctx.createRadialGradient(cx, brY + brH / 2, 0, cx, brY + brH / 2, layerW * 0.6);
        brGrad.addColorStop(0, rgba(bedrockC, EMPHASIS_ALPHA.focal.min * ba * entrance));
        brGrad.addColorStop(1, rgba(bedrockC, 0));
        ctx.fillStyle = brGrad;
        ctx.fillRect(cx - layerW * 0.6, brY - brH, layerW * 1.2, brH * 3);

        const fs3 = Math.max(8, minDim * 0.013);
        ctx.font = `600 ${fs3}px -apple-system, sans-serif`; ctx.textAlign = 'center';
        ctx.fillStyle = rgba(bedrockC, ELEMENT_ALPHA.text.max * ba * entrance);
        ctx.fillText('SHARED GROUND', cx, brY + brH / 2 + minDim * 0.005);
      }

      // Surface layers
      for (let i = LAYERS_COUNT - 1; i >= 0; i--) {
        const ly = stackTop + i * layerH;
        const sa = easeOutCubic(s.shatterAnims[i]);
        if (sa >= 1) continue; // Fully shattered

        if (sa > 0) {
          // Shattering fragments
          for (let f = 0; f < 5; f++) {
            const fx = cx + (Math.sin(f * 2.1 + i) * minDim * 0.1 * sa) + (f % 2 === 0 ? -1 : 1) * minDim * 0.05 * sa;
            const fy = ly + layerH / 2 + Math.cos(f * 1.7 + i) * minDim * 0.04 * sa;
            const fW = minDim * 0.03 * (1 - sa); const fH = layerH * 0.6 * (1 - sa);
            ctx.fillStyle = rgba(layerColors[i], ELEMENT_ALPHA.primary.max * (1 - sa) * entrance);
            ctx.fillRect(fx - fW / 2, fy - fH / 2, fW, fH);
          }
        } else {
          ctx.fillStyle = rgba(layerColors[i], ELEMENT_ALPHA.primary.max * 1.5 * entrance);
          ctx.fillRect(cx - layerW / 2, ly, layerW, layerH - minDim * 0.002);
        }
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!allShattered) ctx.fillText(`Tap to excavate (${s.shattered}/${LAYERS_COUNT})`, cx, stackTop + LAYERS_COUNT * layerH + minDim * 0.12);
      else if (ba > 0.5) ctx.fillText('Bedrock found.', cx, stackTop + LAYERS_COUNT * layerH + minDim * 0.12);

      if (ba >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('seal_stamp'); cb.onResolve?.(); }
      cb.onStateChange?.(s.shattered / LAYERS_COUNT);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = () => {
      const s = stateRef.current;
      if (s.shattered < LAYERS_COUNT) { s.shattered++; cbRef.current.onHaptic('tap'); }
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}