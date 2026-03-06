/**
 * ATOM 078: THE HORIZON ENGINE
 * ===============================
 * Series 8 — Kinematic Topology · Position 8
 *
 * The horizon is not a destination. It is an orientation.
 * Infinite forward motion without arrival. A walking meditation.
 *
 * PHYSICS:
 *   - 4 parallax layers at different speeds
 *   - Ground grid scrolls forward continuously
 *   - Horizon line: unreachable, always same distance
 *   - Breath modulates forward speed
 *   - No resolution — this is an infinite game
 *
 * INTERACTION:
 *   Swipe / auto-scroll → continuous forward motion
 *   Breath → modulates pace
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static horizon scene, no scrolling
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, type RGB,
} from '../atom-utils';

const SKY_TOP: RGB = [40, 50, 80];
const SKY_HORIZON: RGB = [120, 100, 75];
const GROUND_NEAR: RGB = [70, 60, 50];
const GROUND_FAR: RGB = [90, 80, 65];
const GRID_LINE: RGB = [80, 70, 60];
const HORIZON_GLOW: RGB = [180, 150, 100];
const CLOUD_COLOR: RGB = [100, 95, 110];
const BG_BASE: RGB = [18, 16, 24];

const LAYER_SPEEDS = [0.1, 0.3, 0.6, 1.0]; // parallax multipliers

export default function HorizonInfiniteAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    entranceProgress: 0,
    scrollOffset: 0,
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
    let raf = 0;

    const render = () => {
      raf = requestAnimationFrame(render);
      const s = stateRef.current;
      const p = propsRef.current;
      s.frame++;

      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress;
      const ent = adv.entrance;

      // Forward motion
      if (!p.reducedMotion) {
        const breathSpeed = 1 + p.breathAmplitude * 0.5;
        s.scrollOffset += minDim * 0.001 * breathSpeed;
      }

      const t = (Math.sin(s.frame * 0.005) + 1) / 2;
      onStateChange?.(t);

      const primaryRgb = parseColor(p.color);
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      const horizonY = h * 0.42;

      // Sky gradient
      const skyTopCol = lerpColor(SKY_TOP, primaryRgb, 0.04);
      const skyHorizCol = lerpColor(SKY_HORIZON, primaryRgb, 0.04);
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, rgba(skyTopCol, ELEMENT_ALPHA.secondary.max * ent));
      skyGrad.addColorStop(1, rgba(skyHorizCol, ELEMENT_ALPHA.secondary.max * ent));
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, horizonY);

      // Background tint
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.015));
      bgGrad.addColorStop(1, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Clouds (parallax layer 0)
      if (!p.reducedMotion) {
        const cloudCol = lerpColor(CLOUD_COLOR, primaryRgb, 0.04);
        const cloudWrap = w + minDim * 0.15;
        for (let i = 0; i < 5; i++) {
          const baseX = i * w * 0.25;
          const scrolled = s.scrollOffset * LAYER_SPEEDS[0];
          const cloudX = ((baseX - scrolled) % cloudWrap + cloudWrap) % cloudWrap - minDim * 0.07;
          const cloudY = horizonY * 0.2 + i * horizonY * 0.12;
          const cloudW = minDim * (0.08 + Math.sin(i * 2.3) * 0.03);
          ctx.fillStyle = rgba(cloudCol, ELEMENT_ALPHA.tertiary.max * ent);
          ctx.beginPath();
          ctx.ellipse(cloudX, cloudY, cloudW, cloudW * 0.3, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Horizon glow
      const glowCol = lerpColor(HORIZON_GLOW, primaryRgb, 0.05);
      const hGrad = ctx.createRadialGradient(cx, horizonY, 0, cx, horizonY, minDim * 0.3);
      hGrad.addColorStop(0, rgba(glowCol, ELEMENT_ALPHA.glow.max * ent * 0.4));
      hGrad.addColorStop(1, rgba(glowCol, 0));
      ctx.fillStyle = hGrad;
      ctx.fillRect(0, horizonY - minDim * 0.15, w, minDim * 0.3);

      // Horizon line
      ctx.strokeStyle = rgba(glowCol, ELEMENT_ALPHA.secondary.max * ent);
      ctx.lineWidth = minDim * 0.0006;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(w, horizonY);
      ctx.stroke();

      // Ground
      const groundNear = lerpColor(GROUND_NEAR, primaryRgb, 0.04);
      const groundFar = lerpColor(GROUND_FAR, primaryRgb, 0.04);
      const gGrad = ctx.createLinearGradient(0, horizonY, 0, h);
      gGrad.addColorStop(0, rgba(groundFar, ELEMENT_ALPHA.secondary.max * ent));
      gGrad.addColorStop(1, rgba(groundNear, ELEMENT_ALPHA.secondary.max * ent));
      ctx.fillStyle = gGrad;
      ctx.fillRect(0, horizonY, w, h - horizonY);

      // Perspective grid lines
      if (!p.reducedMotion) {
        const gridCol = lerpColor(GRID_LINE, primaryRgb, 0.04);
        ctx.strokeStyle = rgba(gridCol, ELEMENT_ALPHA.tertiary.max * ent);
        ctx.lineWidth = minDim * 0.0004;

        // Horizontal lines (receding)
        const gridSpacing = minDim * 0.06;
        for (let i = 0; i < 15; i++) {
          const rawY = i * gridSpacing - (s.scrollOffset * LAYER_SPEEDS[3]) % gridSpacing;
          const perspective = rawY / (h - horizonY);
          const lineY = horizonY + rawY;
          if (lineY > horizonY && lineY < h) {
            ctx.globalAlpha = perspective;
            ctx.beginPath();
            ctx.moveTo(0, lineY);
            ctx.lineTo(w, lineY);
            ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;

        // Converging vertical lines
        for (let i = -6; i <= 6; i++) {
          const topX = cx + i * minDim * 0.006;
          const bottomX = cx + i * w * 0.12;
          ctx.beginPath();
          ctx.moveTo(topX, horizonY);
          ctx.lineTo(bottomX, h);
          ctx.stroke();
        }
      }

      // Distant terrain silhouettes (parallax layer 1)
      if (!p.reducedMotion) {
        const terrCol = lerpColor(groundFar, primaryRgb, 0.03);
        ctx.fillStyle = rgba(terrCol, ELEMENT_ALPHA.tertiary.max * ent);
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        for (let x = 0; x <= w; x += minDim * 0.016) {
          const noise = Math.sin((x * 0.01 - s.scrollOffset * LAYER_SPEEDS[1] * 0.01)) * minDim * 0.02;
          ctx.lineTo(x, horizonY - Math.abs(noise));
        }
        ctx.lineTo(w, horizonY);
        ctx.closePath();
        ctx.fill();
      }

      // Label
      const labelCol = lerpColor(HORIZON_GLOW, primaryRgb, 0.05);
      ctx.font = `${Math.round(minDim * 0.013)}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(labelCol, ELEMENT_ALPHA.text.min * ent * 0.4);
      ctx.fillText('the horizon never arrives', cx, horizonY - minDim * 0.02);

      ctx.restore();
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [viewport, onStateChange]);

  return (
    <canvas ref={canvasRef}
      style={{ width: viewport.width, height: viewport.height, display: 'block', touchAction: 'none' }}
    />
  );
}