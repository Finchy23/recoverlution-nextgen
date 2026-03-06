/**
 * ATOM 104: THE STEEL-MAN ENGINE
 * ===============================
 * Series 11 — Epistemic Constructs · Position 4
 *
 * Build the strongest possible opposing argument.
 * Tap to add blocks to the opponent's structure until
 * both sides equalize, then a Bridge of Opposites locks.
 *
 * PHYSICS: Tensile bridge building, counter-weight, structural load-testing
 * INTERACTION: Tap to build opponent's structure
 * RENDER: Canvas 2D
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance,
  ELEMENT_ALPHA,
  EMPHASIS_ALPHA,
  motionScale,
  type RGB,
} from '../atom-utils';

const MAX_BLOCKS = 7;

export default function SteelManAtom({
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
    opponentBlocks: 1, // starts with 1 flimsy block
    bridgeProgress: 0,
    blockAnims: [1] as number[], // animation progress per block
    completionFired: false,
  });

  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      const breath = p.breathAmplitude;
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      const baseC = s.primaryRgb;
      const accentC = s.accentRgb;

      // Animate blocks
      for (let i = 0; i < s.blockAnims.length; i++) {
        if (s.blockAnims[i] < 1) s.blockAnims[i] = Math.min(1, s.blockAnims[i] + 0.05);
      }

      // Bridge animation
      if (s.opponentBlocks >= MAX_BLOCKS) {
        s.bridgeProgress = Math.min(1, s.bridgeProgress + 0.02);
      }

      // Background glow
      const glowR = minDim * (0.38 + breath * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Tower geometry
      const towerW = minDim * 0.1;
      const blockH = minDim * 0.035;
      const gap = minDim * 0.005;
      const baseY = cy + minDim * 0.15;
      const leftX = cx - minDim * 0.2;
      const rightX = cx + minDim * 0.2;

      // Draw left fortress (user's argument — always full)
      for (let i = 0; i < MAX_BLOCKS; i++) {
        const by = baseY - (i + 1) * (blockH + gap);
        const t = i / (MAX_BLOCKS - 1);
        const bColor = lerpColor(baseC, accentC, t * 0.5);
        ctx.fillStyle = rgba(bColor, ELEMENT_ALPHA.primary.max * entrance);
        const r = minDim * 0.003;
        const bx = leftX - towerW / 2;
        ctx.beginPath();
        ctx.moveTo(bx + r, by); ctx.lineTo(bx + towerW - r, by);
        ctx.quadraticCurveTo(bx + towerW, by, bx + towerW, by + r);
        ctx.lineTo(bx + towerW, by + blockH - r);
        ctx.quadraticCurveTo(bx + towerW, by + blockH, bx + towerW - r, by + blockH);
        ctx.lineTo(bx + r, by + blockH);
        ctx.quadraticCurveTo(bx, by + blockH, bx, by + blockH - r);
        ctx.lineTo(bx, by + r);
        ctx.quadraticCurveTo(bx, by, bx + r, by);
        ctx.closePath();
        ctx.fill();
      }

      // Draw right structure (opponent — grows with taps)
      for (let i = 0; i < s.opponentBlocks; i++) {
        const anim = s.blockAnims[i] ?? 1;
        const ea = easeOutCubic(anim);
        const by = baseY - (i + 1) * (blockH + gap);
        const t = i / (MAX_BLOCKS - 1);
        const bColor = lerpColor(accentC, baseC, t * 0.5);
        ctx.fillStyle = rgba(bColor, ELEMENT_ALPHA.primary.max * entrance * ea);
        const bx = rightX - towerW / 2;
        const bw = towerW * ea;
        const actualBx = rightX - bw / 2;
        ctx.fillRect(actualBx, by + blockH * (1 - ea), bw, blockH * ea);
      }

      // Labels
      const fontSize = Math.max(8, minDim * 0.015);
      ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText('Your View', leftX, baseY + minDim * 0.03);
      ctx.fillText('Their View', rightX, baseY + minDim * 0.03);

      // Bridge
      if (s.bridgeProgress > 0) {
        const bp = easeOutCubic(s.bridgeProgress);
        const bridgeY = baseY - MAX_BLOCKS * (blockH + gap) * 0.5;
        const bridgeStartX = leftX + towerW / 2;
        const bridgeEndX = rightX - towerW / 2;
        const bridgeLen = (bridgeEndX - bridgeStartX) * bp;
        const bridgeColor = lerpColor(baseC, accentC, 0.5);

        ctx.beginPath();
        ctx.moveTo(bridgeStartX, bridgeY);
        ctx.lineTo(bridgeStartX + bridgeLen, bridgeY);
        ctx.strokeStyle = rgba(bridgeColor, EMPHASIS_ALPHA.focal.max * entrance);
        ctx.lineWidth = minDim * 0.003;
        ctx.stroke();

        // Bridge glow
        if (bp > 0.9) {
          const bGlowR = minDim * 0.15;
          const bGrad = ctx.createRadialGradient(cx, bridgeY, 0, cx, bridgeY, bGlowR);
          bGrad.addColorStop(0, rgba(bridgeColor, ELEMENT_ALPHA.glow.max * entrance * (bp - 0.9) * 10));
          bGrad.addColorStop(1, rgba(bridgeColor, 0));
          ctx.fillStyle = bGrad;
          ctx.fillRect(cx - bGlowR, bridgeY - bGlowR, bGlowR * 2, bGlowR * 2);
        }

        if (s.bridgeProgress >= 1 && !s.completionFired) {
          s.completionFired = true;
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      }

      cb.onStateChange?.(s.opponentBlocks / MAX_BLOCKS);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.opponentBlocks >= MAX_BLOCKS) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * viewport.width;
      const minDim2 = Math.min(viewport.width, viewport.height);
      const rightX = viewport.width / 2 + minDim2 * 0.2;
      // Tap anywhere on right half to build
      if (px > viewport.width * 0.4) {
        s.opponentBlocks++;
        s.blockAnims.push(0);
        cbRef.current.onHaptic('tap');
        if (s.opponentBlocks >= MAX_BLOCKS) {
          cbRef.current.onHaptic('step_advance');
        }
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}