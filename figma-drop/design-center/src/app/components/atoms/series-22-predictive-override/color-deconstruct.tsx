/**
 * ATOM 213: THE COLOR DECONSTRUCT ENGINE
 * ========================================
 * Series 22 — Predictive Override · Position 3
 *
 * Break a monolithic emotional block into constituent manageable
 * parts — RGB channel separation. Tap to split.
 *
 * SIGNATURE TECHNIQUE: Sensory deconstruction — monolithic block
 * splitting into RGB channels, spatial dispersion, individual
 * channel examination.
 *
 * INTERACTION: Tap → split block → RGB separation
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static RGB split
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const BLOCK_SIZE = 0.2; const SPLIT_SPEED = 0.008; const CHANNEL_SPREAD = 0.15;
const RESPAWN_DELAY = 100;

interface DeconState { entranceProgress: number; frameCount: number; primaryRgb: RGB; accentRgb: RGB;
  splitProgress: number; tapped: boolean; rOffset: number; gOffset: number; bOffset: number;
  completed: boolean; respawnTimer: number; }

function freshState(c: string, a: string): DeconState {
  return { entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(c), accentRgb: parseColor(a),
    splitProgress: 0, tapped: false, rOffset: 0, gOffset: 0, bOffset: 0,
    completed: false, respawnTimer: 0 }; }

export default function ColorDeconstructAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);
  const stateRef = useRef(freshState(color, accentColor));
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s.frameCount++; const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress; const ms = motionScale(p.reducedMotion);

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      if (!p.reducedMotion && s.tapped && !s.completed) {
        s.splitProgress = Math.min(1, s.splitProgress + SPLIT_SPEED);
        s.rOffset = -CHANNEL_SPREAD * s.splitProgress;
        s.gOffset = 0;
        s.bOffset = CHANNEL_SPREAD * s.splitProgress;
        cb.onStateChange?.(s.splitProgress);
        if (s.splitProgress >= 1) { s.completed = true; cb.onHaptic('completion'); cb.onStateChange?.(1); s.respawnTimer = RESPAWN_DELAY; }
      }

      const blockSize = px(BLOCK_SIZE, minDim);
      const split = s.splitProgress;

      // Monolithic block (fades as split increases)
      if (split < 0.5) {
        const monoAlpha = (1 - split * 2) * ALPHA.content.max * 0.6 * entrance;
        ctx.fillStyle = rgba(s.accentRgb, monoAlpha);
        ctx.fillRect(cx - blockSize / 2, cy - blockSize / 2, blockSize, blockSize);
        ctx.strokeStyle = rgba(s.accentRgb, monoAlpha * 0.6);
        ctx.lineWidth = px(STROKE.bold, minDim); ctx.strokeRect(cx - blockSize / 2, cy - blockSize / 2, blockSize, blockSize);
        // EMOTION label
        const eFont = Math.max(8, px(FONT_SIZE.sm, minDim));
        ctx.font = `${eFont}px monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba([255, 255, 255] as RGB, monoAlpha * 0.5);
        ctx.fillText('EMOTION', cx, cy); ctx.textBaseline = 'alphabetic';
      }

      // RGB channels (emerge as split increases)
      if (split > 0) {
        const channelAlpha = Math.min(1, split * 2) * ALPHA.content.max * 0.4 * entrance;
        const channels: [number, RGB, string][] = [
          [s.rOffset, [s.primaryRgb[0], 60, 60], 'SENSATION'],
          [s.gOffset, [60, s.primaryRgb[1], 60], 'THOUGHT'],
          [s.bOffset, [60, 60, s.primaryRgb[2]], 'IMPULSE'],
        ];

        for (const [offset, col, label] of channels) {
          const chX = cx + offset * minDim;
          const chSize = blockSize * (0.6 + split * 0.2);

          // Glow
          const gr = chSize * 1.2;
          const glow = ctx.createRadialGradient(chX, cy, 0, chX, cy, gr);
          glow.addColorStop(0, rgba(col, channelAlpha * 0.3)); glow.addColorStop(1, rgba(col, 0));
          ctx.fillStyle = glow; ctx.fillRect(chX - gr, cy - gr, gr * 2, gr * 2);

          ctx.fillStyle = rgba(col, channelAlpha);
          ctx.fillRect(chX - chSize / 2, cy - chSize / 2, chSize, chSize);

          if (split > 0.5) {
            const lFont = Math.max(6, px(FONT_SIZE.xs, minDim));
            ctx.font = `${lFont}px monospace`; ctx.textAlign = 'center';
            ctx.fillStyle = rgba(col, (split - 0.5) * 2 * ALPHA.text.max * 0.4 * entrance);
            ctx.fillText(label, chX, cy + chSize / 2 + px(0.02, minDim));
          }
        }
      }

      // Split crack lines
      if (split > 0 && split < 1) {
        for (let i = 0; i < 3; i++) {
          const crackX = cx + (Math.random() - 0.5) * blockSize * split;
          const crackY = cy + (Math.random() - 0.5) * blockSize;
          ctx.beginPath(); ctx.arc(crackX, crackY, px(0.002, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba([255, 255, 255] as RGB, split * ALPHA.atmosphere.min * 0.4 * entrance * ms);
          ctx.fill();
        }
      }

      // HUD
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`; ctx.textAlign = 'center';
      if (s.completed) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance); ctx.fillText('DECONSTRUCTED', cx, h - px(0.035, minDim)); }
      else if (!s.tapped) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance); ctx.fillText('TAP TO DECONSTRUCT', cx, h - px(0.035, minDim)); }

      if (p.reducedMotion) { const channels2: [number, RGB][] = [[-0.12, [200, 60, 60]], [0, [60, 200, 60]], [0.12, [60, 60, 200]]];
        for (const [off, col] of channels2) { ctx.fillStyle = rgba(col, ALPHA.content.max * 0.3 * entrance);
          ctx.fillRect(cx + off * minDim - blockSize * 0.3, cy - blockSize * 0.3, blockSize * 0.6, blockSize * 0.6); } }

      if (s.completed && p.phase !== 'resolve') { s.respawnTimer--; if (s.respawnTimer <= 0) { Object.assign(s, freshState(color, accentColor)); s.entranceProgress = 1; } }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = () => { const s = stateRef.current; if (s.completed) return;
      if (!s.tapped) { s.tapped = true; cbRef.current.onHaptic('tap'); }
      else { cbRef.current.onHaptic('step_advance'); } };

    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
