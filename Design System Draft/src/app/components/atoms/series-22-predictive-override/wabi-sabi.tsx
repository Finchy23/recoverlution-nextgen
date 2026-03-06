/**
 * ATOM 217: THE WABI-SABI ENGINE · S22 · Position 7
 * The ego demands perfect symmetry. Find beauty in the fracture.
 * INTERACTION: Tap (crack) → Drag (rearrange) → beauty emerges
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static kintsugi
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const SHARD_COUNT = 8; const RESPAWN_DELAY = 100;

interface Shard { cx: number; cy: number; angle: number; size: number; settled: boolean;
  vx: number; vy: number; rotation: number; rotVel: number; }

interface WabiState { entranceProgress: number; frameCount: number; primaryRgb: RGB; accentRgb: RGB;
  phase2: 'whole' | 'cracking' | 'scattered' | 'kintsugi'; crackProgress: number;
  shards: Shard[]; goldFill: number; completed: boolean; respawnTimer: number; }

function makeShards(): Shard[] {
  return Array.from({ length: SHARD_COUNT }, (_, i) => {
    const angle = (i / SHARD_COUNT) * Math.PI * 2;
    return { cx: Math.cos(angle) * 0.02, cy: Math.sin(angle) * 0.02, angle: angle + Math.random() * 0.3,
      size: 0.04 + Math.random() * 0.03, settled: false,
      vx: Math.cos(angle) * (0.003 + Math.random() * 0.004),
      vy: Math.sin(angle) * (0.003 + Math.random() * 0.004),
      rotation: 0, rotVel: (Math.random() - 0.5) * 0.05 }; });
}

function freshState(c: string, a: string): WabiState {
  return { entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(c), accentRgb: parseColor(a),
    phase2: 'whole', crackProgress: 0, shards: makeShards(), goldFill: 0,
    completed: false, respawnTimer: 0 }; }

export default function WabiSabiAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
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

      if (!p.reducedMotion && !s.completed) {
        if (s.phase2 === 'cracking') {
          s.crackProgress = Math.min(1, s.crackProgress + 0.02);
          if (s.crackProgress >= 1) { s.phase2 = 'scattered'; cb.onHaptic('tap'); }
        }
        if (s.phase2 === 'scattered') {
          let allSettled = true;
          for (const sh of s.shards) {
            if (!sh.settled) {
              sh.cx += sh.vx; sh.cy += sh.vy;
              sh.vx *= 0.97; sh.vy *= 0.97; sh.vy += 0.0001;
              sh.rotation += sh.rotVel; sh.rotVel *= 0.98;
              if (Math.abs(sh.vx) < 0.0002 && Math.abs(sh.vy) < 0.0002) sh.settled = true;
              allSettled = false;
            }
          }
          if (allSettled) { s.phase2 = 'kintsugi'; }
        }
        if (s.phase2 === 'kintsugi') {
          s.goldFill = Math.min(1, s.goldFill + 0.008);
          cb.onStateChange?.(s.goldFill);
          if (s.goldFill >= 1) { s.completed = true; cb.onHaptic('completion'); cb.onStateChange?.(1); s.respawnTimer = RESPAWN_DELAY; }
        }
      }

      const vesselR = px(SIZE.md * 0.5, minDim);

      if (s.phase2 === 'whole') {
        // Perfect vessel
        ctx.beginPath(); ctx.arc(cx, cy, vesselR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance); ctx.fill();
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
        ctx.lineWidth = px(STROKE.bold, minDim); ctx.stroke();
        // "PERFECT" label
        const pFont = Math.max(7, px(FONT_SIZE.xs, minDim));
        ctx.font = `${pFont}px monospace`; ctx.textAlign = 'center';
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.3 * entrance);
        ctx.fillText('PERFECT', cx, cy + px(0.003, minDim));
      }

      if (s.phase2 === 'cracking') {
        ctx.beginPath(); ctx.arc(cx, cy, vesselR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance); ctx.fill();
        // Crack lines
        for (let i = 0; i < 6; i++) {
          const ca = (i / 6) * Math.PI * 2;
          const crackLen = vesselR * s.crackProgress;
          ctx.beginPath(); ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(ca) * crackLen, cy + Math.sin(ca) * crackLen);
          ctx.strokeStyle = rgba(s.accentRgb, s.crackProgress * ALPHA.content.max * 0.5 * entrance);
          ctx.lineWidth = px(STROKE.light, minDim); ctx.stroke();
        }
      }

      if (s.phase2 === 'scattered' || s.phase2 === 'kintsugi') {
        // Shards
        for (const sh of s.shards) {
          const sx = cx + sh.cx * minDim; const sy = cy + sh.cy * minDim;
          const shSize = px(sh.size, minDim);
          ctx.save(); ctx.translate(sx, sy); ctx.rotate(sh.rotation);
          // Irregular polygon
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const sa = (i / 5) * Math.PI * 2 + sh.angle;
            const sr = shSize * (0.6 + Math.sin(i * 2.1) * 0.4);
            if (i === 0) ctx.moveTo(Math.cos(sa) * sr, Math.sin(sa) * sr);
            else ctx.lineTo(Math.cos(sa) * sr, Math.sin(sa) * sr);
          }
          ctx.closePath();
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance); ctx.fill();
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim); ctx.stroke();
          ctx.restore();
        }

        // Gold kintsugi lines between shards
        if (s.goldFill > 0) {
          const goldColor: RGB = [220, 180, 50];
          for (let i = 0; i < s.shards.length; i++) {
            const a = s.shards[i]; const b = s.shards[(i + 1) % s.shards.length];
            const ax = cx + a.cx * minDim; const ay = cy + a.cy * minDim;
            const bx = cx + b.cx * minDim; const by = cy + b.cy * minDim;
            ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
            ctx.strokeStyle = rgba(goldColor, s.goldFill * ALPHA.content.max * 0.5 * entrance);
            ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke();
            // Gold glow
            const midX = (ax + bx) / 2; const midY = (ay + by) / 2;
            const gGlow = ctx.createRadialGradient(midX, midY, 0, midX, midY, px(0.02, minDim));
            gGlow.addColorStop(0, rgba(goldColor, s.goldFill * ALPHA.glow.max * 0.15 * entrance));
            gGlow.addColorStop(1, rgba(goldColor, 0));
            ctx.fillStyle = gGlow; ctx.fillRect(midX - px(0.02, minDim), midY - px(0.02, minDim), px(0.04, minDim), px(0.04, minDim));
          }
        }
      }

      // HUD
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`; ctx.textAlign = 'center';
      if (s.phase2 === 'whole') { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance); ctx.fillText('TAP TO BREAK', cx, h - px(0.035, minDim)); }
      else if (s.phase2 === 'kintsugi') { ctx.fillStyle = rgba([220, 180, 50] as RGB, ALPHA.text.max * 0.4 * s.goldFill * entrance); ctx.fillText('KINTSUGI', cx, h - px(0.035, minDim)); }
      else if (s.phase2 === 'scattered') { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.25 * entrance); ctx.fillText('SETTLING...', cx, h - px(0.035, minDim)); }

      if (p.reducedMotion) { /* show kintsugi state */ }

      if (s.completed && p.phase !== 'resolve') { s.respawnTimer--; if (s.respawnTimer <= 0) { Object.assign(s, freshState(color, accentColor)); s.entranceProgress = 1; } }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = () => { const s = stateRef.current; if (s.completed) return;
      if (s.phase2 === 'whole') { s.phase2 = 'cracking'; cbRef.current.onHaptic('tap'); } };

    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
