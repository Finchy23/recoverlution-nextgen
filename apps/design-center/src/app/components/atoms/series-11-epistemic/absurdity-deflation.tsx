/**
 * ATOM 107: THE ABSURDITY DEFLATION ENGINE
 * ==========================================
 * Series 11 — Epistemic Constructs · Position 7
 *
 * A massive terrifying rigid block of text. Each tap softens it,
 * inflating like a balloon. On the 5th tap it pops and zooms
 * erratically, leaving a tiny silly squished version.
 *
 * PHYSICS: Soft-body inflation/deflation, elastic bouncing
 * INTERACTION: Tap to inflate
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

const TAP_STAGES = 5;

export default function AbsurdityDeflationAtom({
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
    taps: 0,
    inflateAnim: 0, // smooth inflation
    popped: false,
    popAnim: 0,
    // After pop: erratic flying position
    flyX: 0, flyY: 0, flyVx: 0, flyVy: 0,
    settled: false,
    settleAnim: 0,
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
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      const baseC = s.primaryRgb;
      const accentC = s.accentRgb;

      // Smooth inflation toward target
      const targetInflate = s.taps / TAP_STAGES;
      s.inflateAnim += (targetInflate - s.inflateAnim) * 0.08;

      // Background glow
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      if (!s.popped) {
        // The block/balloon
        const inf = s.inflateAnim;
        const blockW = minDim * (0.35 + inf * 0.15);
        const blockH = minDim * (0.12 + inf * 0.12);
        const cornerR = minDim * (0.005 + inf * 0.04); // becomes rounder
        const wobble = !p.reducedMotion ? Math.sin(s.frameCount * 0.03 * ms) * inf * minDim * 0.005 : 0;

        const bx = cx - blockW / 2 + wobble;
        const by = cy - blockH / 2;

        // Color shifts from dark serious to bright silly
        const blockColor = lerpColor(baseC, accentC, inf * 0.8);

        ctx.beginPath();
        ctx.moveTo(bx + cornerR, by);
        ctx.lineTo(bx + blockW - cornerR, by);
        ctx.quadraticCurveTo(bx + blockW, by, bx + blockW, by + cornerR);
        ctx.lineTo(bx + blockW, by + blockH - cornerR);
        ctx.quadraticCurveTo(bx + blockW, by + blockH, bx + blockW - cornerR, by + blockH);
        ctx.lineTo(bx + cornerR, by + blockH);
        ctx.quadraticCurveTo(bx, by + blockH, bx, by + blockH - cornerR);
        ctx.lineTo(bx, by + cornerR);
        ctx.quadraticCurveTo(bx, by, bx + cornerR, by);
        ctx.closePath();

        ctx.fillStyle = rgba(blockColor, ELEMENT_ALPHA.primary.max * (1.5 + inf) * entrance);
        ctx.fill();
        ctx.strokeStyle = rgba(blockColor, ELEMENT_ALPHA.primary.max * entrance);
        ctx.lineWidth = minDim * 0.0008;
        ctx.stroke();

        // Text on block — warps with inflation
        const fontSize = Math.max(9, minDim * (0.02 + inf * 0.012));
        ctx.font = `${600 - inf * 300}  ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba(blockColor, ELEMENT_ALPHA.text.max * entrance);

        const scaleX = 1 + inf * 0.3;
        const scaleY = 1 + inf * 0.2;
        ctx.save();
        ctx.translate(cx + wobble, cy);
        ctx.scale(scaleX, scaleY);
        ctx.fillText('THE MONSTER', 0, 0);
        ctx.restore();

      } else if (!s.settled) {
        // Erratic flying after pop
        s.popAnim = Math.min(1, s.popAnim + 0.02);
        if (!p.reducedMotion) {
          s.flyX += s.flyVx;
          s.flyY += s.flyVy;
          s.flyVx *= 0.97;
          s.flyVy *= 0.97;
          s.flyVx += (Math.random() - 0.5) * minDim * 0.003;
          s.flyVy += (Math.random() - 0.5) * minDim * 0.003;
          // Bounce off walls
          if (s.flyX < minDim * 0.05 || s.flyX > w - minDim * 0.05) s.flyVx *= -0.8;
          if (s.flyY < minDim * 0.05 || s.flyY > h - minDim * 0.05) s.flyVy *= -0.8;
        }

        if (s.popAnim >= 1) {
          s.settled = true;
        }

        // Tiny silly squished version
        const tinyR = minDim * 0.015;
        const squish = 1 + Math.sin(s.frameCount * 0.1 * ms) * 0.2 * (1 - s.popAnim);
        ctx.save();
        ctx.translate(s.flyX, s.flyY);
        ctx.scale(squish, 1 / squish);
        ctx.beginPath();
        ctx.arc(0, 0, tinyR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(accentC, EMPHASIS_ALPHA.focal.max * entrance);
        ctx.fill();
        ctx.restore();

        const tinyFontSize = Math.max(6, minDim * 0.008);
        ctx.font = `${tinyFontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(accentC, ELEMENT_ALPHA.text.min * entrance);
        ctx.fillText('the monster', s.flyX, s.flyY + tinyR + minDim * 0.01);

      } else {
        // Settled: tiny silly thing at center
        s.settleAnim = Math.min(1, s.settleAnim + 0.03);
        const sa = easeOutCubic(s.settleAnim);
        const sx = s.flyX + (cx - s.flyX) * sa;
        const sy = s.flyY + (cy - s.flyY) * sa;
        const tinyR = minDim * 0.012;

        ctx.beginPath();
        ctx.arc(sx, sy, tinyR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(accentC, EMPHASIS_ALPHA.focal.max * entrance);
        ctx.fill();

        // Glow around tiny settled monster
        const sGlowR = minDim * 0.06 * sa;
        const sGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sGlowR);
        sGrad.addColorStop(0, rgba(accentC, ELEMENT_ALPHA.glow.max * entrance * sa));
        sGrad.addColorStop(1, rgba(accentC, 0));
        ctx.fillStyle = sGrad;
        ctx.fillRect(sx - sGlowR, sy - sGlowR, sGlowR * 2, sGlowR * 2);

        const tf = Math.max(6, minDim * 0.009);
        ctx.font = `${tf}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(accentC, ELEMENT_ALPHA.text.min * entrance * sa);
        ctx.fillText('the monster', sx, sy + tinyR + minDim * 0.012);

        if (s.settleAnim >= 1 && !s.completionFired) {
          s.completionFired = true;
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      }

      cb.onStateChange?.(s.taps / TAP_STAGES);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (_e: PointerEvent) => {
      const s = stateRef.current;
      if (s.popped) return;
      s.taps++;
      cbRef.current.onHaptic('tap');

      if (s.taps >= TAP_STAGES) {
        s.popped = true;
        s.flyX = viewport.width / 2;
        s.flyY = viewport.height / 2;
        s.flyVx = (Math.random() - 0.5) * Math.min(viewport.width, viewport.height) * 0.02;
        s.flyVy = (Math.random() - 0.5) * Math.min(viewport.width, viewport.height) * 0.02;
        cbRef.current.onHaptic('step_advance');
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}