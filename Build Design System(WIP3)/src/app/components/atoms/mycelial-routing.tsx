/**
 * ATOM: MYCELIAL ROUTING — Organic Growth Networks
 * Series 3 — Biomimetic · Healing as growth, not fixing
 *
 * A living network of interconnected nodes slowly growing outward.
 * Touch to seed a new growth point. Connections form organically,
 * following paths of least resistance. Breath accelerates growth.
 *
 * INTERACTION: Tap (seed growth) · Breath (growth rate)
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from './types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB, ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from './atom-utils';

const MAX_NODES = 120;
const CONNECTION_DIST_FRAC = 0.12;
const GROWTH_RATE = 0.3;
const NODE_SIZE_MIN = 1;
const NODE_SIZE_MAX = 3.5;

interface MycelNode {
  x: number; y: number;
  size: number;
  age: number;
  brightness: number;
  parent: number; // index of parent node, -1 for seeds
  growthAngle: number;
  alive: boolean;
}

const BIO_GREEN: RGB = [80, 180, 120];
const BIO_GLOW: RGB = [140, 220, 160];
const BIO_DIM: RGB = [40, 80, 55];

function seedNode(x: number, y: number, parent: number): MycelNode {
  return {
    x, y,
    size: NODE_SIZE_MIN + Math.random() * (NODE_SIZE_MAX - NODE_SIZE_MIN),
    age: 0, brightness: 0.5 + Math.random() * 0.5,
    parent,
    growthAngle: Math.random() * Math.PI * 2,
    alive: true,
  };
}

export default function MycelialRoutingAtom({
  breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    nodes: [] as MycelNode[],
    growTimer: 0,
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    initialized: false,
  });

  useEffect(() => { const s = stateRef.current; s.primaryRgb = parseColor(color); s.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const w = viewport.width, h = viewport.height, s = stateRef.current;
    const minDim = Math.min(w, h);
    const connDist = minDim * CONNECTION_DIST_FRAC;

    if (!s.initialized) {
      // Seed initial network from center
      s.nodes.push(seedNode(w / 2, h / 2, -1));
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + Math.random() * 0.3;
        const dist = minDim * 0.04 + Math.random() * minDim * 0.04;
        s.nodes.push(seedNode(w / 2 + Math.cos(angle) * dist, h / 2 + Math.sin(angle) * dist, 0));
      }
      s.initialized = true;
    }

    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const tx = (e.clientX - rect.left) / rect.width * w;
      const ty = (e.clientY - rect.top) / rect.height * h;
      if (s.nodes.length < MAX_NODES) {
        // Find nearest node to connect to
        let nearest = 0, nearDist = Infinity;
        for (let i = 0; i < s.nodes.length; i++) {
          const d = Math.hypot(s.nodes[i].x - tx, s.nodes[i].y - ty);
          if (d < nearDist) { nearDist = d; nearest = i; }
        }
        s.nodes.push(seedNode(tx, ty, nearest));
        cbRef.current.onHaptic('tap');
      }
    };
    canvas.addEventListener('pointerdown', onDown);

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const p = propsRef.current, cb = cbRef.current;
      const cw = Math.round(w * dpr), ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
      ctx.save(); ctx.scale(dpr, dpr); ctx.clearRect(0, 0, w, h); s.frameCount++;

      if (s.entranceProgress < 1) s.entranceProgress = Math.min(1, s.entranceProgress + (p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE));
      const entrance = easeOutExpo(s.entranceProgress);

      // Auto-grow: breath accelerates
      if (!p.reducedMotion) {
        s.growTimer += GROWTH_RATE * (0.5 + p.breathAmplitude * 1.5);
        if (s.growTimer > 12 && s.nodes.length < MAX_NODES) {
          s.growTimer = 0;
          // Pick a random alive node and grow from it
          const aliveNodes = s.nodes.filter(n => n.alive);
          if (aliveNodes.length > 0) {
            const parent = aliveNodes[Math.floor(Math.random() * aliveNodes.length)];
            const parentIdx = s.nodes.indexOf(parent);
            const angle = parent.growthAngle + (Math.random() - 0.5) * 1.2;
            const dist = minDim * (0.02 + Math.random() * 0.04);
            const nx = parent.x + Math.cos(angle) * dist;
            const ny = parent.y + Math.sin(angle) * dist;
            if (nx > 20 && nx < w - 20 && ny > 20 && ny < h - 20) {
              const newNode = seedNode(nx, ny, parentIdx);
              newNode.growthAngle = angle + (Math.random() - 0.5) * 0.6;
              s.nodes.push(newNode);
            }
          }
        }
      }

      // Age nodes
      for (const n of s.nodes) n.age = Math.min(1, n.age + 0.008);

      cb.onStateChange?.(s.nodes.length / MAX_NODES);

      // Background
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.5);
      bgGrad.addColorStop(0, rgba(lerpColor([8, 14, 10], s.primaryRgb, 0.03), entrance * 0.03));
      bgGrad.addColorStop(1, rgba([4, 6, 4], 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      const nodeColor = lerpColor(BIO_GREEN, s.primaryRgb, 0.2);
      const glowCol = lerpColor(BIO_GLOW, s.accentRgb, 0.15);
      const dimCol = lerpColor(BIO_DIM, s.primaryRgb, 0.1);

      // Connections (draw first, behind nodes)
      ctx.lineCap = 'round';
      for (let i = 0; i < s.nodes.length; i++) {
        const n = s.nodes[i];
        if (n.parent >= 0 && n.parent < s.nodes.length) {
          const p2 = s.nodes[n.parent];
          const dist = Math.hypot(n.x - p2.x, n.y - p2.y);
          if (dist < connDist * 2) {
            const lineAlpha = 0.06 * Math.min(n.age, p2.age) * entrance;
            // Organic bezier — slight curve
            const mx = (n.x + p2.x) / 2 + (Math.sin(s.frameCount * 0.01 + i) * 3);
            const my = (n.y + p2.y) / 2 + (Math.cos(s.frameCount * 0.01 + i) * 3);
            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.quadraticCurveTo(mx, my, p2.x, p2.y);
            ctx.strokeStyle = rgba(dimCol, lineAlpha);
            ctx.lineWidth = minDim * 0.001; ctx.stroke();
          }
        }
        // Also connect to nearby non-parent nodes (network mesh)
        for (let j = i + 1; j < s.nodes.length; j++) {
          const m = s.nodes[j];
          const dist = Math.hypot(n.x - m.x, n.y - m.y);
          if (dist < connDist && m.parent !== i && n.parent !== j) {
            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = rgba(dimCol, 0.02 * Math.min(n.age, m.age) * entrance);
            ctx.lineWidth = minDim * 0.0005; ctx.stroke();
          }
        }
      }

      // Nodes
      for (const n of s.nodes) {
        const pulse = p.reducedMotion ? 1 : 0.7 + 0.3 * Math.sin(s.frameCount * 0.02 + n.x * 0.01);
        const alpha = n.brightness * n.age * pulse * entrance * 0.3;
        if (alpha < 0.005) continue;

        // Glow
        const glowR = n.size * 4;
        const gGrad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
        gGrad.addColorStop(0, rgba(glowCol, alpha * 0.2));
        gGrad.addColorStop(1, rgba(glowCol, 0));
        ctx.fillStyle = gGrad; ctx.fillRect(n.x - glowR, n.y - glowR, glowR * 2, glowR * 2);

        // Core
        ctx.beginPath(); ctx.arc(n.x, n.y, n.size * n.age, 0, Math.PI * 2);
        ctx.fillStyle = rgba(nodeColor, alpha); ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'default' }} />
    </div>
  );
}
