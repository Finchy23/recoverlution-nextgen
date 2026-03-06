/**
 * ATOM 664: THE IGNITION SPARK ENGINE
 * =====================================
 * Series 67 — Harmonious Friction · Position 4
 *
 * Prove passion requires friction. Gently tapping does nothing.
 * Violently smash and drag two cold nodes — extreme kinetic
 * friction forces a threshold break, igniting the ecosystem.
 *
 * SIGNATURE TECHNIQUE: Directional friction — kinetic energy
 * visualization, friction heat accumulation, ignition threshold
 * with colour cascade awakening from pitch black.
 *
 * INTERACTION: Drag (both nodes together) → clash → ignition
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static lit state
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE,
  PARTICLE_SIZE, motionScale, type RGB,
} from '../atom-utils';

const NODE_RADIUS      = 0.025;
const IGNITION_THRESH  = 1.0;
const HEAT_PER_CLASH   = 0.12;
const HEAT_DECAY       = 0.003;
const CLASH_DISTANCE   = 0.08;
const IGNITE_SPREAD    = 0.015;
const RESPAWN_DELAY    = 110;

interface IgniteState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  nodeAx: number; nodeAy: number;
  nodeBx: number; nodeBy: number;
  heat: number;
  ignited: boolean;
  igniteFill: number;           // 0-1 spread of colour
  draggingA: boolean;
  draggingB: boolean;
  activePointer: number | null;
  sparks: { x: number; y: number; vx: number; vy: number; life: number }[];
  completed: boolean;
  respawnTimer: number;
  lastClashFrame: number;
}

function freshState(c: string, a: string): IgniteState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(c), accentRgb: parseColor(a),
    nodeAx: 0.35, nodeAy: 0.5, nodeBx: 0.65, nodeBy: 0.5,
    heat: 0, ignited: false, igniteFill: 0,
    draggingA: false, draggingB: false, activePointer: null,
    sparks: [], completed: false, respawnTimer: 0, lastClashFrame: 0,
  };
}

export default function IgnitionSparkStrikeAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);
  const stateRef = useRef(freshState(color, accentColor));
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
      const breath = p.breathAmplitude;
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);
      const nodeR = px(NODE_RADIUS, minDim);

      // ── LAYER 1: Dark/lit atmosphere ────────────────
      if (!p.composed) {
        const atmAlpha = s.ignited ? s.igniteFill * 0.8 : 0.05;
        const atmGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.5);
        atmGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * atmAlpha * entrance));
        atmGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = atmGlow;
        ctx.fillRect(0, 0, w, h);
      }

      // ── PHYSICS ─────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        s.heat = Math.max(0, s.heat - HEAT_DECAY);

        // Check clash
        const dx = s.nodeAx - s.nodeBx;
        const dy = s.nodeAy - s.nodeBy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CLASH_DISTANCE && s.frameCount - s.lastClashFrame > 10 && !s.ignited) {
          s.heat = Math.min(IGNITION_THRESH, s.heat + HEAT_PER_CLASH);
          s.lastClashFrame = s.frameCount;
          cb.onHaptic('drag_snap');

          // Clash sparks
          const midX = (s.nodeAx + s.nodeBx) / 2;
          const midY = (s.nodeAy + s.nodeBy) / 2;
          for (let i = 0; i < 8; i++) {
            const a = Math.random() * Math.PI * 2;
            s.sparks.push({
              x: midX, y: midY,
              vx: Math.cos(a) * (0.003 + Math.random() * 0.005),
              vy: Math.sin(a) * (0.003 + Math.random() * 0.005),
              life: 20 + Math.random() * 15,
            });
          }

          // Push apart
          if (dist > 0.01) {
            const pushX = dx / dist * 0.02;
            const pushY = dy / dist * 0.02;
            s.nodeAx += pushX; s.nodeAy += pushY;
            s.nodeBx -= pushX; s.nodeBy -= pushY;
          }
        }

        // Ignition
        if (s.heat >= IGNITION_THRESH && !s.ignited) {
          s.ignited = true;
          cb.onHaptic('completion');
        }

        if (s.ignited) {
          s.igniteFill = Math.min(1, s.igniteFill + IGNITE_SPREAD);
          cb.onStateChange?.(s.igniteFill);
          if (s.igniteFill >= 1 && !s.completed) {
            s.completed = true;
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          }
        } else {
          cb.onStateChange?.(s.heat / IGNITION_THRESH * 0.8);
        }

        // Spark physics
        for (const sp of s.sparks) { sp.x += sp.vx; sp.y += sp.vy; sp.vy += 0.0002; sp.life--; }
        s.sparks = s.sparks.filter(sp => sp.life > 0);
      }

      // ── LAYER 2: Ignition colour spread ─────────────
      if (s.ignited) {
        const midX = ((s.nodeAx + s.nodeBx) / 2) * w;
        const midY = ((s.nodeAy + s.nodeBy) / 2) * h;
        const spreadR = s.igniteFill * minDim * 0.6;
        const igGlow = ctx.createRadialGradient(midX, midY, 0, midX, midY, spreadR);
        igGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * s.igniteFill * entrance));
        igGlow.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.15 * s.igniteFill * entrance));
        igGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = igGlow;
        ctx.fillRect(midX - spreadR, midY - spreadR, spreadR * 2, spreadR * 2);

        for (let i = 0; i < 6; i++) {
          const a = (Math.PI * 2 * i) / 6 + s.frameCount * 0.01;
          const ex = midX + Math.cos(a) * spreadR * 0.9;
          const ey = midY + Math.sin(a) * spreadR * 0.9;
          ctx.beginPath();
          ctx.moveTo(midX, midY);
          ctx.lineTo(ex, ey);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * s.igniteFill * entrance);
          ctx.lineWidth = px(STROKE.light, minDim);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(ex, ey, px(0.0036, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.12 * s.igniteFill * entrance);
          ctx.fill();
        }
      }

      // ── LAYER 3: Heat haze ──────────────────────────
      if (s.heat > 0.3 && !s.ignited) {
        const midX = ((s.nodeAx + s.nodeBx) / 2) * w;
        const midY = ((s.nodeAy + s.nodeBy) / 2) * h;
        const hazeR = px(0.1, minDim) * s.heat;
        const haze = ctx.createRadialGradient(midX, midY, 0, midX, midY, hazeR);
        haze.addColorStop(0, rgba(s.accentRgb, s.heat * ALPHA.glow.max * 0.2 * entrance));
        haze.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = haze;
        ctx.fillRect(midX - hazeR, midY - hazeR, hazeR * 2, hazeR * 2);
      }

      // ── LAYER 4: Sparks ────────────────────────────
      const sparkColor: RGB = [255, 200, 80];
      for (const sp of s.sparks) {
        const spx = sp.x * w;
        const spy = sp.y * h;
        ctx.beginPath();
        ctx.arc(spx, spy, px(PARTICLE_SIZE.sm, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(sparkColor, (sp.life / 35) * ALPHA.content.max * 0.7 * entrance * ms);
        ctx.fill();
      }

      // ── LAYER 5: Connection line ───────────────────
      const ax = s.nodeAx * w;
      const ay = s.nodeAy * h;
      const bx = s.nodeBx * w;
      const by = s.nodeBy * h;
      const dist2 = Math.sqrt((s.nodeAx - s.nodeBx) ** 2 + (s.nodeAy - s.nodeBy) ** 2);
      if (dist2 < 0.3) {
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        const lineAlpha = (1 - dist2 / 0.3) * 0.3;
        ctx.strokeStyle = rgba(s.heat > 0.5 ? s.accentRgb : s.primaryRgb,
                               lineAlpha * ALPHA.content.max * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
      }

      // ── LAYER 6-7: Node A and B ────────────────────
      for (const [nx2, ny2, label] of [[ax, ay, 'A'], [bx, by, 'B']] as [number, number, string][]) {
        const gr = px(0.07, minDim);
        const glowInt = s.ignited ? 0.4 : (s.heat > 0.5 ? 0.25 : 0.15);
        const nGlow = ctx.createRadialGradient(nx2, ny2, 0, nx2, ny2, gr);
        nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * glowInt * entrance));
        nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = nGlow;
        ctx.fillRect(nx2 - gr, ny2 - gr, gr * 2, gr * 2);

        ctx.beginPath();
        ctx.arc(nx2, ny2, nodeR * (1 + breath * 0.04), 0, Math.PI * 2);
        const nColor = s.ignited ? lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3) : s.primaryRgb;
        ctx.fillStyle = rgba(nColor, ALPHA.content.max * entrance);
        ctx.fill();
      }

      // ── LAYER 8: HUD ───────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';

      if (s.ignited) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance);
        ctx.fillText('IGNITED', cx, h - px(0.035, minDim));
      } else {
        const heatPct = Math.round(s.heat * 100);
        ctx.fillStyle = rgba(s.heat > 0.5 ? s.accentRgb : s.primaryRgb, ALPHA.text.max * 0.35 * entrance);
        ctx.fillText(heatPct > 5 ? `HEAT ${heatPct}%` : 'SMASH NODES TOGETHER', cx, h - px(0.035, minDim));
      }

      if (p.reducedMotion) {
        const midX2 = (s.nodeAx + s.nodeBx) / 2 * w;
        const midY2 = (s.nodeAy + s.nodeBy) / 2 * h;
        const litR = px(0.15, minDim);
        const lit = ctx.createRadialGradient(midX2, midY2, 0, midX2, midY2, litR);
        lit.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
        lit.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = lit;
        ctx.fillRect(midX2 - litR, midY2 - litR, litR * 2, litR * 2);
      }

      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          Object.assign(s, freshState(color, accentColor));
          s.entranceProgress = 1;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      const dA = Math.sqrt((mx - s.nodeAx) ** 2 + (my - s.nodeAy) ** 2);
      const dB = Math.sqrt((mx - s.nodeBx) ** 2 + (my - s.nodeBy) ** 2);

      if (dA < 0.08) { s.draggingA = true; s.activePointer = e.pointerId; }
      else if (dB < 0.08) { s.draggingB = true; s.activePointer = e.pointerId; }
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.draggingA && !s.draggingB) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      if (s.draggingA) { s.nodeAx = mx; s.nodeAy = my; }
      if (s.draggingB) { s.nodeBx = mx; s.nodeBy = my; }
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      s.draggingA = false;
      s.draggingB = false;
      s.activePointer = null;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}
