/**
 * ATOM: EMBER-GRID — What Still Glows
 * Approach: Perceptual thought — notice what matters
 *
 * A field of faint ember-like particles. Most barely visible.
 * Some glow warmly. Touch an ember and it brightens, revealing
 * connection lines to 2-3 other embers — a constellation.
 * Release and it slowly fades. The brightest embers are
 * the ones that matter most.
 *
 * INTERACTION: Tap (reveal connections)
 * RESOLVE: Duration — after enough embers have been noticed
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from './types';
import {
  parseColor, lerpColor, rgba, type RGB,
  setupCanvas, advanceEntrance, drawAtmosphere,
  pointerToCanvas, clamp,
} from './atom-utils';

const EMBER_COUNT = 45;
const CONNECTION_DIST_FRAC = 0.25;
const TOUCH_RADIUS_FRAC = 0.06;
const GLOW_DECAY = 0.992;
const CONNECTIONS_PER = 3;

interface Ember {
  x: number; y: number;
  baseGlow: number;        // 0-1 inherent brightness
  activeGlow: number;      // 0-1 touch-activated brightness
  size: number;
  phase: number;
  connections: number[];   // indices of connected embers
  touched: boolean;
}

function createEmbers(w: number, h: number): Ember[] {
  const margin = Math.min(w, h) * 0.1;
  const embers: Ember[] = Array.from({ length: EMBER_COUNT }, () => ({
    x: margin + Math.random() * (w - margin * 2),
    y: margin + Math.random() * (h - margin * 2),
    baseGlow: 0.05 + Math.random() * 0.25,
    activeGlow: 0,
    size: 1 + Math.random() * 2,
    phase: Math.random() * Math.PI * 2,
    connections: [],
    touched: false,
  }));

  // Build connections based on proximity
  const connDist = Math.min(w, h) * CONNECTION_DIST_FRAC;
  for (let i = 0; i < embers.length; i++) {
    const dists: { idx: number; dist: number }[] = [];
    for (let j = 0; j < embers.length; j++) {
      if (i === j) continue;
      const dx = embers[j].x - embers[i].x;
      const dy = embers[j].y - embers[i].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < connDist) dists.push({ idx: j, dist: d });
    }
    dists.sort((a, b) => a.dist - b.dist);
    embers[i].connections = dists.slice(0, CONNECTIONS_PER).map(d => d.idx);
  }

  // Give some embers higher base glow (the "important" ones)
  const brightCount = Math.floor(EMBER_COUNT * 0.2);
  const shuffled = [...Array(EMBER_COUNT).keys()].sort(() => Math.random() - 0.5);
  for (let i = 0; i < brightCount; i++) {
    embers[shuffled[i]].baseGlow = 0.3 + Math.random() * 0.4;
  }

  return embers;
}

export default function EmberGridAtom(props: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic: props.onHaptic, onStateChange: props.onStateChange, onResolve: props.onResolve });
  const propsRef = useRef({ breathAmplitude: props.breathAmplitude, reducedMotion: props.reducedMotion, phase: props.phase, color: props.color, accentColor: props.accentColor });
  const stateRef = useRef({
    embers: [] as Ember[],
    primaryRgb: parseColor(props.color),
    accentRgb: parseColor(props.accentColor),
    entranceProgress: 0,
    frameCount: 0,
    touchedCount: 0,
    resolved: false,
    resolveGlow: 0,
    initialized: false,
  });

  useEffect(() => { cbRef.current = { onHaptic: props.onHaptic, onStateChange: props.onStateChange, onResolve: props.onResolve }; }, [props.onHaptic, props.onStateChange, props.onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude: props.breathAmplitude, reducedMotion: props.reducedMotion, phase: props.phase, color: props.color, accentColor: props.accentColor }; }, [props.breathAmplitude, props.reducedMotion, props.phase, props.color, props.accentColor]);
  useEffect(() => { const s = stateRef.current; s.primaryRgb = parseColor(props.color); s.accentRgb = parseColor(props.accentColor); }, [props.color, props.accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const w = props.viewport.width, h = props.viewport.height;
    const s = stateRef.current;
    const minDim = Math.min(w, h);
    const cx = w / 2, cy = h / 2;
    const touchR = minDim * TOUCH_RADIUS_FRAC;

    if (!s.initialized) { s.embers = createEmbers(w, h); s.initialized = true; }

    const onDown = (e: PointerEvent) => {
      const pt = pointerToCanvas(e, canvas, w, h);
      // Find nearest ember within touch radius
      let nearest = -1;
      let nearestDist = Infinity;
      for (let i = 0; i < s.embers.length; i++) {
        const em = s.embers[i];
        const d = Math.sqrt((em.x - pt.x) ** 2 + (em.y - pt.y) ** 2);
        if (d < touchR && d < nearestDist) {
          nearest = i;
          nearestDist = d;
        }
      }
      if (nearest >= 0) {
        const em = s.embers[nearest];
        em.activeGlow = 1;
        if (!em.touched) {
          em.touched = true;
          s.touchedCount++;
        }
        // Activate connections
        for (const ci of em.connections) {
          s.embers[ci].activeGlow = Math.max(s.embers[ci].activeGlow, 0.6);
        }
        cbRef.current.onHaptic('tap');
      }
    };

    canvas.addEventListener('pointerdown', onDown);

    let animId: number;

    const render = () => {
      const p = propsRef.current, cb = cbRef.current;
      setupCanvas(canvas, ctx, w, h);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      cb.onStateChange?.(clamp(s.touchedCount / (EMBER_COUNT * 0.25), 0, 1));

      // ── Render embers ──
      for (const em of s.embers) {
        // Decay active glow
        em.activeGlow *= GLOW_DECAY;

        const totalGlow = em.baseGlow + em.activeGlow;
        const shimmer = p.reducedMotion ? 0.8 : 0.6 + 0.4 * Math.sin(s.frameCount * 0.01 + em.phase);
        const alpha = clamp(totalGlow * shimmer, 0, 1) * entrance;

        if (alpha < 0.005) continue;

        const warmth = clamp(totalGlow, 0, 1);
        const emColor = lerpColor(s.primaryRgb, s.accentRgb, warmth * 0.6);

        // Ember glow
        const glowR = em.size * (3 + totalGlow * 6);
        const gGrad = ctx.createRadialGradient(em.x, em.y, 0, em.x, em.y, glowR);
        gGrad.addColorStop(0, rgba(emColor, alpha * 0.3));
        gGrad.addColorStop(0.3, rgba(lerpColor(emColor, s.accentRgb, 0.3), alpha * 0.1));
        gGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gGrad;
        ctx.fillRect(em.x - glowR, em.y - glowR, glowR * 2, glowR * 2);

        // Core
        ctx.beginPath();
        ctx.arc(em.x, em.y, em.size * (0.6 + totalGlow * 0.4), 0, Math.PI * 2);
        ctx.fillStyle = rgba(emColor, alpha * 0.6);
        ctx.fill();

        // Connections (only when active)
        if (em.activeGlow > 0.05) {
          for (const ci of em.connections) {
            const other = s.embers[ci];
            const connAlpha = em.activeGlow * 0.08 * entrance;
            const connColor = lerpColor(emColor, lerpColor(s.primaryRgb, s.accentRgb, 0.5), 0.5);
            ctx.beginPath();
            ctx.moveTo(em.x, em.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = rgba(connColor, connAlpha);
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // ── Resolution ──
      if (s.touchedCount >= EMBER_COUNT * 0.25 && !s.resolved) {
        s.resolved = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      if (s.resolved) {
        s.resolveGlow = Math.min(1, s.resolveGlow + 0.005);
        const rR = minDim * 0.35;
        const rGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rR);
        rGrad.addColorStop(0, rgba(s.accentRgb, s.resolveGlow * 0.04 * entrance));
        rGrad.addColorStop(0.5, rgba(s.primaryRgb, s.resolveGlow * 0.01 * entrance));
        rGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rGrad;
        ctx.fillRect(cx - rR, cy - rR, rR * 2, rR * 2);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [props.viewport.width, props.viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}