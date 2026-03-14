/**
 * ATOM: ROOT-PULSE — The Underground
 * Approach: Diffuse insight — foundations support everything
 *
 * From the bottom of the screen, root-like tendrils grow upward —
 * branching, organic, bioluminescent. They pulse faintly with
 * the breath cycle. Touch a root and it brightens, sending a
 * pulse down to the base. New branches grow from touched points.
 *
 * INTERACTION: Tap (grow new branches)
 * RESOLVE: Root network reaches critical density
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from './types';
import {
  parseColor, lerpColor, rgba, type RGB,
  setupCanvas, advanceEntrance,
  pointerToCanvas, clamp,
} from './atom-utils';

const MAX_SEGMENTS = 80;
const GROW_RATE = 0.015;            // growProgress increment per frame
const BRANCH_CHANCE = 0.015;
const RESOLVE_DENSITY = 0.2;        // fraction of max segments — ~16 segments to resolve

interface RootSegment {
  x1: number; y1: number;
  x2: number; y2: number;
  thickness: number;
  glow: number;
  depth: number;           // generation depth
  growing: boolean;
  growProgress: number;     // 0-1
  angle: number;
  length: number;
  pulse: number;
  phase: number;
}

function createInitialRoots(w: number, h: number): RootSegment[] {
  const roots: RootSegment[] = [];
  const baseY = h * 0.92;
  const count = 3 + Math.floor(Math.random() * 3);

  for (let i = 0; i < count; i++) {
    const x = w * (0.25 + Math.random() * 0.5);
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
    const len = 30 + Math.random() * 40;
    roots.push({
      x1: x, y1: baseY,
      x2: x + Math.cos(angle) * len,
      y2: baseY + Math.sin(angle) * len,
      thickness: 2 + Math.random(),
      glow: 0.3,
      depth: 0,
      growing: true,
      growProgress: 0,
      angle,
      length: len,
      pulse: 0,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return roots;
}

function spawnBranch(parent: RootSegment, w: number, h: number): RootSegment | null {
  const angleOffset = (Math.random() - 0.5) * 1.2;
  const newAngle = parent.angle + angleOffset;
  const len = parent.length * (0.6 + Math.random() * 0.3);
  const x1 = parent.x2;
  const y1 = parent.y2;
  const x2 = x1 + Math.cos(newAngle) * len;
  const y2 = y1 + Math.sin(newAngle) * len;

  if (y2 < h * 0.08 || x2 < 10 || x2 > w - 10) return null;

  return {
    x1, y1, x2, y2,
    thickness: Math.max(0.3, parent.thickness * 0.7),
    glow: 0.2,
    depth: parent.depth + 1,
    growing: true,
    growProgress: 0,
    angle: newAngle,
    length: len,
    pulse: 0,
    phase: Math.random() * Math.PI * 2,
  };
}

export default function RootPulseAtom(props: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic: props.onHaptic, onStateChange: props.onStateChange, onResolve: props.onResolve });
  const propsRef = useRef({ breathAmplitude: props.breathAmplitude, reducedMotion: props.reducedMotion, phase: props.phase, color: props.color, accentColor: props.accentColor });
  const stateRef = useRef({
    roots: [] as RootSegment[],
    primaryRgb: parseColor(props.color),
    accentRgb: parseColor(props.accentColor),
    entranceProgress: 0,
    frameCount: 0,
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
    const cx = w / 2;

    if (!s.initialized) { s.roots = createInitialRoots(w, h); s.initialized = true; }

    const onDown = (e: PointerEvent) => {
      const pt = pointerToCanvas(e, canvas, w, h);
      // Find nearest tip and spawn branches
      let nearest = -1;
      let nearestDist = Infinity;
      for (let i = 0; i < s.roots.length; i++) {
        const r = s.roots[i];
        if (!r.growing && r.growProgress >= 1) {
          const d = Math.sqrt((r.x2 - pt.x) ** 2 + (r.y2 - pt.y) ** 2);
          if (d < minDim * 0.08 && d < nearestDist) {
            nearest = i;
            nearestDist = d;
          }
        }
      }
      if (nearest >= 0 && s.roots.length < MAX_SEGMENTS) {
        const parent = s.roots[nearest];
        parent.pulse = 1;
        // Spawn 1-2 branches
        const branchCount = 1 + (Math.random() > 0.5 ? 1 : 0);
        for (let b = 0; b < branchCount; b++) {
          const branch = spawnBranch(parent, w, h);
          if (branch) s.roots.push(branch);
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

      // Base atmosphere
      const baseGrad = ctx.createLinearGradient(0, h * 0.5, 0, h);
      baseGrad.addColorStop(0, 'rgba(0,0,0,0)');
      baseGrad.addColorStop(1, rgba(s.primaryRgb, 0.03 * entrance));
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, h * 0.5, w, h * 0.5);

      // Progress
      const density = s.roots.length / MAX_SEGMENTS;
      cb.onStateChange?.(clamp(density / RESOLVE_DENSITY, 0, 1));

      // ── Grow and render roots ──
      ctx.lineCap = 'round';

      for (const r of s.roots) {
        // Grow
        if (r.growing) {
          r.growProgress = Math.min(1, r.growProgress + GROW_RATE);
          if (r.growProgress >= 1) {
            r.growing = false;
            // Auto-branch chance
            if (Math.random() < BRANCH_CHANCE * 5 && s.roots.length < MAX_SEGMENTS && r.depth < 6) {
              const branch = spawnBranch(r, w, h);
              if (branch) s.roots.push(branch);
            }
          }
        }

        // Pulse decay
        r.pulse *= 0.97;

        // Breath-synced glow
        const breathGlow = p.reducedMotion ? 0.75 : 0.5 + 0.5 * Math.sin(s.frameCount * 0.01 + r.phase);
        const totalGlow = (r.glow + r.pulse) * breathGlow + p.breathAmplitude * 0.1;

        // Interpolated end position for growing segments
        const ex = r.x1 + (r.x2 - r.x1) * r.growProgress;
        const ey = r.y1 + (r.y2 - r.y1) * r.growProgress;

        // Root glow (soft light along the segment)
        const segMidX = (r.x1 + ex) / 2;
        const segMidY = (r.y1 + ey) / 2;
        const glowR = r.length * 0.4;
        const gGrad = ctx.createRadialGradient(segMidX, segMidY, 0, segMidX, segMidY, glowR);
        gGrad.addColorStop(0, rgba(s.accentRgb, totalGlow * 0.06 * entrance));
        gGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gGrad;
        ctx.fillRect(segMidX - glowR, segMidY - glowR, glowR * 2, glowR * 2);

        // Root line
        const depthFade = Math.max(0.15, 1 - r.depth * 0.12);
        const rootColor = lerpColor(s.primaryRgb, s.accentRgb, clamp(r.depth * 0.15, 0, 0.6));
        ctx.beginPath();
        ctx.moveTo(r.x1, r.y1);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = rgba(rootColor, totalGlow * depthFade * 0.2 * entrance);
        ctx.lineWidth = r.thickness;
        ctx.stroke();

        // Tip glow (if fully grown)
        if (r.growProgress >= 1) {
          ctx.beginPath();
          ctx.arc(r.x2, r.y2, r.thickness * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, totalGlow * depthFade * 0.15 * entrance);
          ctx.fill();
        }
      }

      // ── Resolution ──
      if (density >= RESOLVE_DENSITY && !s.resolved) {
        s.resolved = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      if (s.resolved) {
        s.resolveGlow = Math.min(1, s.resolveGlow + 0.005);
        const rGrad = ctx.createLinearGradient(0, h * 0.6, 0, h);
        rGrad.addColorStop(0, 'rgba(0,0,0,0)');
        rGrad.addColorStop(1, rgba(s.accentRgb, s.resolveGlow * 0.04 * entrance));
        ctx.fillStyle = rGrad;
        ctx.fillRect(0, h * 0.6, w, h * 0.4);
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