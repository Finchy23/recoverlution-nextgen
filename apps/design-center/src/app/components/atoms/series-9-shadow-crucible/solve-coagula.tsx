/**
 * ATOM 084: THE COAGULA ENGINE
 * ===============================
 * Series 9 — Shadow & Crucible · Position 4
 *
 * Solve et Coagula. Dissolve the old form completely,
 * then reassemble into something stronger.
 *
 * PHYSICS:
 *   - Geometric shape (hexagon) at centre
 *   - Tap → Voronoi-style shatter into fragments
 *   - Fragments scatter with gravity
 *   - Hold → magnetic reassembly into new shape (circle)
 *   - Lock stamp on completion
 *
 * INTERACTION:
 *   Tap → shatter (solve)
 *   Hold → reassemble (coagula)
 *
 * RENDER: Canvas 2D
 * REDUCED MOTION: Instant transitions
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, type RGB,
} from '../atom-utils';

const FORM_OLD: RGB = [100, 85, 110];
const FORM_NEW: RGB = [160, 140, 180];
const FRAGMENT: RGB = [80, 70, 95];
const GLOW_COLOR: RGB = [180, 160, 200];
const BG_BASE: RGB = [18, 16, 24];

const SHARD_COUNT = 18;

interface Shard {
  homeX: number; homeY: number;
  x: number; y: number;
  vx: number; vy: number;
  angle: number;
  size: number;
  targetX: number; targetY: number;
}

export default function SolveCoagulaAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    entranceProgress: 0,
    state: 'whole' as 'whole' | 'shattered' | 'reassembling' | 'complete',
    shards: [] as Shard[],
    reassembleT: 0,
    holdFrames: 0,
    isHolding: false,
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

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);

    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const s = stateRef.current;
      const cx = w / 2, cy = h / 2;
      if (s.state === 'whole') {
        s.state = 'shattered';
        s.shards = [];
        for (let i = 0; i < SHARD_COUNT; i++) {
          const angle = (i / SHARD_COUNT) * Math.PI * 2;
          const r = minDim * 0.08;
          const hx = cx + Math.cos(angle) * r * 0.5;
          const hy = cy + Math.sin(angle) * r * 0.5;
          s.shards.push({
            homeX: hx, homeY: hy, x: hx, y: hy,
            vx: Math.cos(angle) * (2 + Math.random() * 3),
            vy: Math.sin(angle) * (2 + Math.random() * 3) - 2,
            angle: Math.random() * Math.PI * 2,
            size: minDim * (0.02 + Math.random() * 0.02),
            targetX: cx + Math.cos(angle) * r * 0.4,
            targetY: cy + Math.sin(angle) * r * 0.4,
          });
        }
        onHaptic('tap');
      } else if (s.state === 'shattered') {
        s.isHolding = true;
        s.state = 'reassembling';
        onHaptic('hold_start');
      }
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      stateRef.current.isHolding = false;
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let raf: number;
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

      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.015));
      bgGrad.addColorStop(1, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      if (s.state === 'whole') {
        // Draw hexagon
        const formCol = lerpColor(FORM_OLD, primaryRgb, 0.04);
        ctx.fillStyle = rgba(formCol, ELEMENT_ALPHA.primary.max * ent);
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
          const r = minDim * 0.08;
          const px = cx + Math.cos(a) * r;
          const py = cy + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(FORM_OLD, primaryRgb, 0.06), ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText('tap to dissolve', cx, h * 0.9);
      }

      if (s.state === 'shattered' || s.state === 'reassembling') {
        // Update shards
        for (const sh of s.shards) {
          if (s.state === 'shattered') {
            sh.vy += 0.08; // gravity
            sh.x += sh.vx;
            sh.y += sh.vy;
            sh.vx *= 0.98;
            sh.angle += 0.02;
          } else if (s.isHolding) {
            // Magnetic pull toward target (only while holding)
            const pull = 0.06;
            sh.x += (sh.targetX - sh.x) * pull;
            sh.y += (sh.targetY - sh.y) * pull;
            sh.angle *= 0.95;
          }
        }

        if (s.state === 'reassembling' && s.isHolding) {
          s.reassembleT = Math.min(1, s.reassembleT + 0.01);
          if (s.reassembleT >= 1 && !s.resolved) {
            s.state = 'complete';
            s.resolved = true;
            onHaptic('seal_stamp');
            onHaptic('completion');
            onResolve?.();
          }
        }

        // Draw shards
        const fragCol = lerpColor(FRAGMENT, primaryRgb, 0.04);
        for (const sh of s.shards) {
          ctx.save();
          ctx.translate(sh.x, sh.y);
          ctx.rotate(sh.angle);
          ctx.fillStyle = rgba(fragCol, ELEMENT_ALPHA.primary.max * ent);
          ctx.fillRect(-sh.size / 2, -sh.size / 2, sh.size, sh.size * 0.7);
          ctx.restore();
        }

        if (s.state === 'shattered') {
          ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillStyle = rgba(lerpColor(FRAGMENT, primaryRgb, 0.06), ELEMENT_ALPHA.text.min * ent * 0.7);
          ctx.fillText('hold to reassemble', cx, h * 0.9);
        }
      }

      if (s.state === 'complete') {
        // New form: circle
        const newCol = lerpColor(FORM_NEW, primaryRgb, 0.04);
        ctx.fillStyle = rgba(newCol, ELEMENT_ALPHA.primary.max * ent);
        ctx.beginPath();
        ctx.arc(cx, cy, minDim * 0.07, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        const gCol = lerpColor(GLOW_COLOR, primaryRgb, 0.04);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.12);
        grad.addColorStop(0, rgba(gCol, ELEMENT_ALPHA.glow.max * ent * 0.3));
        grad.addColorStop(1, rgba(gCol, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, minDim * 0.12, 0, Math.PI * 2);
        ctx.fill();
      }

      onStateChange?.(s.state === 'complete' ? 1 : s.state === 'reassembling' ? 0.5 + s.reassembleT * 0.5 : s.state === 'shattered' ? 0.3 : 0);
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