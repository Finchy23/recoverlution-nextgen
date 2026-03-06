/**
 * ATOM 114: THE FRICTION INJECTION ENGINE
 * =========================================
 * Series 12 — Friction Mechanics · Position 4
 *
 * A smooth neon track flows down the screen. Each tap spawns
 * a heavy rock. Flow crashes into rocks, slowing to a halt.
 *
 * PHYSICS: Collision generation, obstacle spawning, kinetic dampening
 * INTERACTION: Tap to spawn rocks
 * RENDER: Canvas 2D
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB,
} from '../atom-utils';

const ROCKS_TO_STOP = 8;

interface Rock { x: number; y: number; r: number; }
interface FlowParticle { x: number; y: number; vy: number; alpha: number; }

export default function FrictionInjectionAtom({
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
    rocks: [] as Rock[],
    flow: [] as FlowParticle[],
    flowSpeed: 1, // 1=fast, 0=stopped
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

      // Flow speed decreases with rocks
      const targetSpeed = Math.max(0, 1 - s.rocks.length / ROCKS_TO_STOP);
      s.flowSpeed += (targetSpeed - s.flowSpeed) * 0.05;

      // Spawn flow particles
      if (!p.reducedMotion && s.flowSpeed > 0.01 && s.frameCount % 2 === 0) {
        s.flow.push({
          x: cx + (Math.random() - 0.5) * minDim * 0.08,
          y: -minDim * 0.02,
          vy: minDim * 0.004 * s.flowSpeed,
          alpha: 0.6 + Math.random() * 0.4,
        });
      }

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Draw track (center vertical lane)
      const trackW = minDim * 0.12;
      ctx.fillStyle = rgba(accentC, ELEMENT_ALPHA.tertiary.max * entrance * s.flowSpeed);
      ctx.fillRect(cx - trackW / 2, 0, trackW, h);

      // Update and draw flow particles
      for (let i = s.flow.length - 1; i >= 0; i--) {
        const fp = s.flow[i];
        fp.y += fp.vy * s.flowSpeed;
        fp.alpha -= 0.005;

        // Collision with rocks
        for (const rock of s.rocks) {
          const dx = fp.x - rock.x;
          const dy = fp.y - rock.y;
          if (dx * dx + dy * dy < rock.r * rock.r * 1.5) {
            fp.x += (Math.random() - 0.5) * minDim * 0.01;
            fp.vy *= 0.5;
          }
        }

        if (fp.alpha <= 0 || fp.y > h + 20) { s.flow.splice(i, 1); continue; }

        const sz = minDim * 0.003;
        ctx.fillStyle = rgba(accentC, fp.alpha * EMPHASIS_ALPHA.focal.max * entrance);
        ctx.fillRect(fp.x - sz / 2, fp.y - sz / 2, sz, sz);
      }

      // Draw rocks
      for (const rock of s.rocks) {
        ctx.beginPath();
        // Jagged rock shape
        const sides = 6;
        for (let j = 0; j < sides; j++) {
          const angle = (j / sides) * Math.PI * 2;
          const jr = rock.r * (0.7 + Math.sin(j * 3.7) * 0.3);
          const rx = rock.x + Math.cos(angle) * jr;
          const ry = rock.y + Math.sin(angle) * jr;
          j === 0 ? ctx.moveTo(rx, ry) : ctx.lineTo(rx, ry);
        }
        ctx.closePath();
        ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * 1.5 * entrance);
        ctx.fill();
        ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * entrance);
        ctx.lineWidth = minDim * 0.0006;
        ctx.stroke();
      }

      // Status
      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (s.flowSpeed > 0.05) {
        ctx.fillText('Tap to add friction', cx, h - minDim * 0.06);
      } else {
        ctx.fillText('Halted.', cx, h - minDim * 0.06);
      }

      if (s.flowSpeed <= 0.02 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      cb.onStateChange?.(1 - s.flowSpeed);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.rocks.length >= ROCKS_TO_STOP) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * viewport.width;
      const py = (e.clientY - rect.top) / rect.height * viewport.height;
      const minDim2 = Math.min(viewport.width, viewport.height);
      s.rocks.push({ x: px, y: py, r: minDim2 * (0.015 + Math.random() * 0.01) });
      cbRef.current.onHaptic('tap');
      if (s.rocks.length >= ROCKS_TO_STOP) cbRef.current.onHaptic('step_advance');
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