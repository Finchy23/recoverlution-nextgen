/**
 * ATOM 081: THE CRUCIBLE ENGINE
 * ================================
 * Series 9 — Shadow & Crucible · Position 1
 *
 * Hold your finger in the fire. That is the only instruction.
 * Endure the heat — lead becomes gold. A sustained-hold mechanic
 * that transmutes chaos into order through patience.
 *
 * PHYSICS:
 *   - 400 fire particles rising from base
 *   - Lead block at centre: grey, heavy, shaking
 *   - Sustained hold (3s) triggers transmutation
 *   - Fire chaotic → ordered, block morphs to gold
 *   - Particle colour: red/orange chaos → golden/amber order
 *   - Breath modulates flame intensity
 *
 * INTERACTION:
 *   Hold → endure fire, transmute lead to gold
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: No particle motion, colour transition on hold threshold
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, type RGB,
} from '../atom-utils';

const FIRE_CHAOS: RGB = [220, 80, 30];
const FIRE_ORDER: RGB = [220, 180, 80];
const LEAD_COLOR: RGB = [80, 75, 85];
const GOLD_COLOR: RGB = [210, 180, 80];
const EMBER_COLOR: RGB = [255, 120, 40];
const BG_BASE: RGB = [18, 16, 24];

const PARTICLE_COUNT = 400;
const HOLD_THRESHOLD = 180; // 3 seconds at 60fps

interface FireParticle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number;
}

export default function CrucibleFireAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<FireParticle[]>([]);
  const stateRef = useRef({
    entranceProgress: 0,
    isHolding: false,
    holdFrames: 0,
    transmutation: 0, // 0 = lead, 1 = gold
    blockShake: 0,
    thresholdHapticSent: false,
    resolved: false,
    frame: 0,
  });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      stateRef.current.isHolding = true;
      stateRef.current.holdFrames = 0;
      onHaptic('hold_start');
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      stateRef.current.isHolding = false;
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let raf = 0;

    const render = () => {
      raf = requestAnimationFrame(render);
      const s = stateRef.current;
      const p = propsRef.current;
      s.frame++;

      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress;
      const ent = adv.entrance;

      const primaryRgb = parseColor(p.color);
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      // Hold tracking
      if (s.isHolding && !s.resolved) {
        s.holdFrames++;
        const holdT = Math.min(1, s.holdFrames / HOLD_THRESHOLD);
        s.transmutation = p.reducedMotion ? (holdT > 0.5 ? 1 : 0) : holdT;

        if (holdT > 0.5 && !s.thresholdHapticSent) {
          s.thresholdHapticSent = true;
          onHaptic('hold_threshold');
        }

        if (s.transmutation >= 1 && !s.resolved) {
          s.resolved = true;
          onHaptic('completion');
          onResolve?.();
        }
      }

      // Block shake (decreases with transmutation)
      s.blockShake = p.reducedMotion ? 0 : (1 - s.transmutation) * minDim * 0.004 * (s.isHolding ? 1 : 0.3);

      onStateChange?.(s.transmutation);

      // Background
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.015));
      bgGrad.addColorStop(1, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Fire base glow
      const baseY = h * 0.75;
      const fireGlowCol = lerpColor(
        lerpColor(FIRE_CHAOS, primaryRgb, 0.05),
        lerpColor(FIRE_ORDER, primaryRgb, 0.05),
        s.transmutation,
      );
      const breathMod = p.reducedMotion ? 0 : p.breathAmplitude * 0.3;
      const glowR = minDim * 0.3 * (1 + breathMod);
      const grad = ctx.createRadialGradient(cx, baseY, 0, cx, baseY, glowR);
      grad.addColorStop(0, rgba(fireGlowCol, ELEMENT_ALPHA.glow.max * ent * 0.4));
      grad.addColorStop(1, rgba(fireGlowCol, 0));
      ctx.fillStyle = grad;
      ctx.fillRect(0, baseY - glowR, w, glowR * 2);

      // Fire particles
      if (!p.reducedMotion) {
        const particles = particlesRef.current;
        // Spawn new particles
        while (particles.length < PARTICLE_COUNT) {
          const ptSize = minDim * 0.003;
          particles.push({
            x: cx + (Math.random() - 0.5) * minDim * 0.2,
            y: baseY + Math.random() * minDim * 0.05,
            vx: (Math.random() - 0.5) * minDim * 0.003 * (1 - s.transmutation * 0.7),
            vy: -(minDim * 0.002 + Math.random() * minDim * 0.004),
            life: 0,
            maxLife: 30 + Math.random() * 40,
            size: ptSize * (0.5 + Math.random() * 1),
          });
        }

        // Update and draw particles
        const chaosCol = lerpColor(FIRE_CHAOS, primaryRgb, 0.05);
        const orderCol = lerpColor(FIRE_ORDER, primaryRgb, 0.05);

        for (let i = particles.length - 1; i >= 0; i--) {
          const pt = particles[i];
          pt.life++;
          // Chaos decreases with transmutation
          const chaos = (1 - s.transmutation) * 0.8;
          pt.vx += (Math.random() - 0.5) * chaos;
          pt.vy -= 0.02;
          pt.x += pt.vx;
          pt.y += pt.vy;

          if (pt.life >= pt.maxLife) {
            particles.splice(i, 1);
            continue;
          }

          const lifeT = pt.life / pt.maxLife;
          const col = lerpColor(chaosCol, orderCol, s.transmutation);
          const alpha = ELEMENT_ALPHA.primary.max * ent * (1 - lifeT) * 0.7;
          ctx.fillStyle = rgba(col, alpha);
          ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
        }
      }

      // Lead/Gold block
      const blockW = minDim * 0.12;
      const blockH = minDim * 0.1;
      const shakeX = p.reducedMotion ? 0 : (Math.random() - 0.5) * s.blockShake;
      const shakeY = p.reducedMotion ? 0 : (Math.random() - 0.5) * s.blockShake;
      const blockX = cx + shakeX;
      const blockY = cy - minDim * 0.02 + shakeY;

      const blockCol = lerpColor(
        lerpColor(LEAD_COLOR, primaryRgb, 0.04),
        lerpColor(GOLD_COLOR, primaryRgb, 0.04),
        s.transmutation,
      );
      const blockAlpha = ELEMENT_ALPHA.primary.max * ent;

      ctx.fillStyle = rgba(blockCol, blockAlpha);
      ctx.beginPath();
      ctx.roundRect(blockX - blockW / 2, blockY - blockH / 2, blockW, blockH, minDim * 0.008);
      ctx.fill();

      // Block highlight (gold shine at high transmutation)
      if (s.transmutation > 0.5) {
        const shineAlpha = ELEMENT_ALPHA.secondary.max * ent * (s.transmutation - 0.5) * 2;
        const shineGrad = ctx.createLinearGradient(
          blockX - blockW / 2, blockY - blockH / 2,
          blockX + blockW / 2, blockY + blockH / 2,
        );
        shineGrad.addColorStop(0, rgba(lerpColor(GOLD_COLOR, primaryRgb, 0.03), shineAlpha * 0.5));
        shineGrad.addColorStop(0.5, rgba(lerpColor(GOLD_COLOR, primaryRgb, 0.03), shineAlpha));
        shineGrad.addColorStop(1, rgba(lerpColor(GOLD_COLOR, primaryRgb, 0.03), shineAlpha * 0.3));
        ctx.fillStyle = shineGrad;
        ctx.beginPath();
        ctx.roundRect(blockX - blockW / 2, blockY - blockH / 2, blockW, blockH, minDim * 0.008);
        ctx.fill();
      }

      // Labels
      ctx.font = `700 ${Math.round(minDim * 0.016)}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (s.transmutation < 0.5) {
        ctx.fillStyle = rgba(lerpColor(LEAD_COLOR, primaryRgb, 0.06), ELEMENT_ALPHA.text.max * ent * (1 - s.transmutation * 2));
        ctx.fillText('Pb', blockX, blockY);
      }
      if (s.transmutation > 0.3) {
        ctx.fillStyle = rgba(lerpColor(GOLD_COLOR, primaryRgb, 0.04), ELEMENT_ALPHA.text.max * ent * Math.min(1, (s.transmutation - 0.3) / 0.5));
        ctx.fillText('Au', blockX, blockY);
      }

      // Hold progress ring
      if (s.isHolding && !s.resolved) {
        const ringR = minDim * 0.09;
        ctx.strokeStyle = rgba(fireGlowCol, ELEMENT_ALPHA.primary.min * ent);
        ctx.lineWidth = minDim * 0.002;
        ctx.beginPath();
        ctx.arc(blockX, blockY, ringR, -Math.PI / 2, -Math.PI / 2 + s.transmutation * Math.PI * 2);
        ctx.stroke();
      }

      // Instruction
      if (s.transmutation < 0.05 && !s.resolved) {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(EMBER_COLOR, primaryRgb, 0.05), ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText('hold your finger in the fire', cx, h * 0.9);
      }

      ctx.restore();
    };

    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport, onStateChange, onHaptic, onResolve]);

  return (
    <canvas ref={canvasRef}
      style={{ width: viewport.width, height: viewport.height, display: 'block', touchAction: 'none', cursor: 'pointer' }}
    />
  );
}