/**
 * ENGINE RENDERERS — 6 Interactive Backgrounds
 * ═══════════════════════════════════════════════════════════
 *
 * Design rule: every engine is built from DISCRETE, INDIVIDUALLY
 * ANIMATED ELEMENTS — never gradient washes, never blurred blobs.
 * Particle Field and Neural Web are the benchmark.
 * These are BACKGROUNDS — atoms are the heroes. Sparse, breathable,
 * felt-not-seen. Each uses a unique visual primitive.
 *
 *   1. PARTICLE FIELD  (particle) — Scattered sharp dots, depth parallax
 *   2. ORBIT DRIFT     (mesh)    — Dots tracing elliptical orbital paths with fading trails
 *   3. EMBER DRIFT     (noise)   — Sparse glowing dots rising upward like embers
 *   4. NEURAL WEB      (graph)   — Connected dot graph with SVG edge lines
 *   5. RIPPLE RINGS    (fluid)   — Concentric ring outlines expanding from source points
 *   6. SYNAPSE PULSE   (void)    — Floating dots with momentary neural fire pulses
 *
 * Primitive uniqueness:
 *   dots/drift | dots/orbit+trail | dots/rise+fade | dots+lines/graph | rings/expand | dots+pulse/fire
 *
 * SPATIAL GOVERNANCE:
 *   All element sizes use `px(TOKEN, minDim)` from universal-canvas.
 *   All colors flow as RGB tuples via `parseColor` / `rgba`.
 *   Viewport dimensions are received as props for minDim computation.
 */

import { useRef, useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { colors, fonts, surfaces } from '@/design-tokens';
import {
  parseColor, rgba, px,
  PARTICLE_SIZE, STROKE,
} from '@/universal-canvas';

import { getResponseVisual, scrims } from '../dc-tokens';

// @deprecated local aliases — canonical types are VisualEngineId and
// ResponseProfileId in navicue-types.ts. Kept here to avoid mass-rename
// across 900+ lines of canvas code.
type EnginePhysics = 'particle' | 'mesh' | 'noise' | 'graph' | 'fluid' | 'void';
type ResponseMode = 'resonance' | 'contrast' | 'witness' | 'immersion';

import { useBreathEngine } from '../hooks/useBreathEngine';

// ─── Shared Types ───────────────────────────────────────────

interface EngineProps {
  engineId: string;
  physics: EnginePhysics;
  responseMode: ResponseMode;
  accent: string;
  glow: string;
  params: {
    density: number;
    speed: number;
    complexity: number;
    reactivity: number;
    depth: number;
  };
  /** Container dimensions for minDim-relative sizing */
  viewport?: { width: number; height: number };
}

interface TouchPoint {
  x: number;
  y: number;
  id: number;
  time: number;
}

// ─── Simulated Touch System ─────────────────────────────────

function useSimulatedTouch(responseMode: ResponseMode) {
  const [touches, setTouches] = useState<TouchPoint[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const positions = [
      { x: 50, y: 45 }, { x: 30, y: 60 }, { x: 70, y: 35 },
      { x: 45, y: 70 }, { x: 55, y: 25 },
    ];
    const interval = setInterval(() => {
      const pos = positions[idRef.current % positions.length];
      const id = idRef.current++;
      setTouches(prev => [...prev, { ...pos, id, time: Date.now() }]);
      setTimeout(() => {
        setTouches(prev => prev.filter(t => t.id !== id));
      }, responseMode === 'witness' ? 3000 : responseMode === 'contrast' ? 2000 : 1500);
    }, responseMode === 'immersion' ? 2200 : 2800);
    return () => clearInterval(interval);
  }, [responseMode]);

  return touches;
}

// ═══════════════════════════════════════════════════════════
// 1. PARTICLE FIELD — Scattered sharp dots, depth parallax
//    Primitive: filled dots · Motion: random drift · Distribution: scattered
// ═══════════════════════════════════════════════════════════

function ParticleFieldEngine({ accent, params, responseMode, viewport }: EngineProps) {
  const touches = useSimulatedTouch(responseMode);
  const { amplitude } = useBreathEngine('calm');
  const minDim = Math.min(viewport?.width ?? 320, viewport?.height ?? 652);
  const accentRgb = parseColor(accent);

  const particles = useRef(
    Array.from({ length: Math.max(10, Math.round(30 * params.density)) }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      /** minDim fraction — dot to lg particle range */
      sizeFrac: PARTICLE_SIZE.dot + Math.random() * (PARTICLE_SIZE.lg - PARTICLE_SIZE.dot),
      duration: (5 + Math.random() * 12) / Math.max(params.speed, 0.1),
      delay: Math.random() * -15,
      /** minDim fraction — drift distance */
      driftXFrac: (Math.random() > 0.5 ? 1 : -1) * (0.006 + Math.random() * 0.032),
      driftYFrac: (Math.random() > 0.5 ? 1 : -1) * (0.009 + Math.random() * 0.038),
      layer: Math.random(),
    }))
  ).current;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 40% 55%, ${rgba(accentRgb, 0.04)} 0%, transparent 70%)`,
      }} />

      {particles.map(p => {
        const depth = 0.4 + p.layer * 0.6;
        const dotSize = px(p.sizeFrac * (0.6 + p.layer * 0.6), minDim);
        return (
          <motion.div
            key={p.id}
            animate={{
              x: [0, p.driftXFrac * minDim * depth, 0],
              y: [0, p.driftYFrac * minDim * depth, 0],
              opacity: [
                0.05 + p.layer * 0.05,
                (0.15 + params.reactivity * 0.3) * depth + amplitude * 0.1,
                0.05 + p.layer * 0.05,
              ],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: dotSize,
              height: dotSize,
              borderRadius: '50%',
              background: accent,
              boxShadow: p.layer > 0.7 ? `0 0 ${px(PARTICLE_SIZE.sm + amplitude * PARTICLE_SIZE.md, minDim)}px ${rgba(accentRgb, 0.2)}` : 'none',
            }}
          />
        );
      })}

      {touches.map(t => (
        <TouchRipple key={t.id} x={t.x} y={t.y} accent={accent} mode={responseMode} minDim={minDim} accentRgb={accentRgb} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 2. ORBIT DRIFT — Dots tracing elliptical orbital paths
//    Primitive: dots on paths + fading arc trails
//    Motion: continuous orbital revolution
//    DISTINCT: circular path motion (vs random drift), visible trails
// ═══════════════════════════════════════════════════════════

function OrbitDriftEngine({ accent, params, responseMode, viewport }: EngineProps) {
  const { amplitude } = useBreathEngine('calm');
  const touches = useSimulatedTouch(responseMode);
  const minDim = Math.min(viewport?.width ?? 320, viewport?.height ?? 652);
  const accentRgb = parseColor(accent);
  const frameRef = useRef(0);
  const [, setTick] = useState(0);

  const orbits = useRef(
    Array.from({ length: 4 + Math.round(params.density * 4) }, (_, i) => {
      const count = 4 + Math.round(params.density * 4);
      return {
        id: i,
        cx: 48 + (Math.random() - 0.5) * 10,
        cy: 48 + (Math.random() - 0.5) * 10,
        rx: 12 + (i / count) * 32 + Math.random() * 8,
        ry: 8 + (i / count) * 22 + Math.random() * 6,
        tilt: (i * 25 + Math.random() * 30) * (Math.PI / 180),
        speed: (0.15 + Math.random() * 0.25) * params.speed,
        phase: Math.random() * Math.PI * 2,
        /** minDim fraction — sm to lg particle */
        sizeFrac: PARTICLE_SIZE.sm + Math.random() * (PARTICLE_SIZE.lg - PARTICLE_SIZE.sm),
        dir: i % 2 === 0 ? 1 : -1,
      };
    })
  ).current;

  useEffect(() => {
    let running = true;
    const loop = () => {
      if (!running) return;
      setTick(t => t + 1);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(frameRef.current); };
  }, []);

  const now = performance.now() / 1000;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {orbits.map(orb => (
          <ellipse
            key={`path-${orb.id}`}
            cx={`${orb.cx}%`} cy={`${orb.cy}%`}
            rx={`${orb.rx}%`} ry={`${orb.ry}%`}
            fill="none"
            stroke={rgba(accentRgb, 0.03 + amplitude * 0.015)}
            strokeWidth={px(STROKE.medium, minDim)}
            transform={`rotate(${orb.tilt * (180 / Math.PI)}, ${orb.cx}%, ${orb.cy}%)`}
          />
        ))}
        {orbits.map(orb => {
          const angle = orb.phase + now * orb.speed * orb.dir;
          const trailLen = 0.6 + params.complexity * 0.8;
          const pts: string[] = [];
          for (let s = 0; s <= 8; s++) {
            const a = angle - (s / 8) * trailLen * orb.dir;
            const lx = orb.rx * Math.cos(a);
            const ly = orb.ry * Math.sin(a);
            const rx = lx * Math.cos(orb.tilt) - ly * Math.sin(orb.tilt);
            const ry = lx * Math.sin(orb.tilt) + ly * Math.cos(orb.tilt);
            pts.push(`${orb.cx + rx}%,${orb.cy + ry}%`);
          }
          return (
            <polyline
              key={`trail-${orb.id}`}
              points={pts.join(' ')}
              fill="none"
              stroke={rgba(accentRgb, 0.08 + amplitude * 0.04)}
              strokeWidth={px(STROKE.bold, minDim)} strokeLinecap="round" opacity={0.6}
            />
          );
        })}
      </svg>

      {orbits.map(orb => {
        const angle = orb.phase + now * orb.speed * orb.dir;
        const lx = orb.rx * Math.cos(angle);
        const ly = orb.ry * Math.sin(angle);
        const dotX = orb.cx + lx * Math.cos(orb.tilt) - ly * Math.sin(orb.tilt);
        const dotY = orb.cy + lx * Math.sin(orb.tilt) + ly * Math.cos(orb.tilt);
        const dotSize = px(orb.sizeFrac + amplitude * PARTICLE_SIZE.sm, minDim);
        return (
          <div
            key={`dot-${orb.id}`}
            style={{
              position: 'absolute',
              left: `${dotX}%`, top: `${dotY}%`,
              width: dotSize,
              height: dotSize,
              borderRadius: '50%',
              background: accent,
              boxShadow: `0 0 ${px(PARTICLE_SIZE.md + amplitude * PARTICLE_SIZE.lg, minDim)}px ${rgba(accentRgb, 0.3)}`,
              transform: 'translate(-50%, -50%)',
              opacity: 0.4 + params.reactivity * 0.35 + amplitude * 0.15,
            }}
          />
        );
      })}

      {touches.map(t => (
        <TouchRipple key={t.id} x={t.x} y={t.y} accent={accent} mode={responseMode} minDim={minDim} accentRgb={accentRgb} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 3. EMBER DRIFT — Sparse glowing dots that rise upward and fade
//    Primitive: glowing dots · Motion: UPWARD with gentle sway
//    Distribution: born in bottom half, die as they reach top
//    DISTINCT from Particle Field: directional gravity (always up),
//    warm glow halo on every ember, bottom-heavy birth distribution
// ═══════════════════════════════════════════════════════════

function EmberDriftEngine({ accent, params, responseMode, viewport }: EngineProps) {
  const { amplitude } = useBreathEngine('calm');
  const touches = useSimulatedTouch(responseMode);
  const minDim = Math.min(viewport?.width ?? 320, viewport?.height ?? 652);
  const accentRgb = parseColor(accent);

  const emberCount = 6 + Math.round(params.density * 10);
  const embers = useRef(
    Array.from({ length: emberCount }, (_, i) => ({
      id: i,
      startX: 8 + Math.random() * 84,
      startY: 55 + Math.random() * 40,
      /** minDim fraction — rise travel distance */
      riseFrac: 0.156 + Math.random() * 0.125,
      /** minDim fraction — lateral sway */
      swayFrac: 0.009 + Math.random() * 0.025,
      /** minDim fraction — sm to lg ember */
      sizeFrac: PARTICLE_SIZE.sm + Math.random() * (PARTICLE_SIZE.lg - PARTICLE_SIZE.sm),
      duration: (8 + Math.random() * 14) / Math.max(params.speed, 0.1),
      delay: -(Math.random() * 20),
    }))
  ).current;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {embers.map(e => {
        const emberSize = px(e.sizeFrac, minDim);
        const rise = e.riseFrac * minDim;
        const sway = e.swayFrac * minDim;
        return (
          <motion.div
            key={e.id}
            animate={{
              y: [0, -rise],
              x: [0, sway, -sway * 0.6, sway * 0.3, 0],
              opacity: [
                0,
                0.2 + params.reactivity * 0.3 + amplitude * 0.15,
                0.25 + params.reactivity * 0.35 + amplitude * 0.2,
                0.1 + amplitude * 0.05,
                0,
              ],
            }}
            transition={{
              y: { duration: e.duration, repeat: Infinity, delay: e.delay, ease: 'linear' },
              x: { duration: e.duration * 0.8, repeat: Infinity, delay: e.delay, ease: 'easeInOut' },
              opacity: { duration: e.duration, repeat: Infinity, delay: e.delay, ease: 'easeInOut' },
            }}
            style={{
              position: 'absolute',
              left: `${e.startX}%`,
              top: `${e.startY}%`,
              width: emberSize,
              height: emberSize,
              borderRadius: '50%',
              background: accent,
              boxShadow: `0 0 ${px(PARTICLE_SIZE.lg + amplitude * PARTICLE_SIZE.xl, minDim)}px ${rgba(accentRgb, 0.35)}, 0 0 ${px(0.025 + amplitude * 0.025, minDim)}px ${rgba(accentRgb, 0.12)}`,
            }}
          />
        );
      })}

      {touches.map(t => (
        <TouchRipple key={t.id} x={t.x} y={t.y} accent={accent} mode={responseMode} minDim={minDim} accentRgb={accentRgb} />
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// 4. NEURAL WEB — Connected dot graph with SVG edge lines
//    Primitive: dots + connecting lines · Motion: slow drift
//    Distribution: scattered with proximity-based connections
// ═══════════════════════════════════════════════════════════

function NeuralWebEngine({ accent, params, responseMode, viewport }: EngineProps) {
  const touches = useSimulatedTouch(responseMode);
  const { amplitude } = useBreathEngine('calm');
  const minDim = Math.min(viewport?.width ?? 320, viewport?.height ?? 652);
  const accentRgb = parseColor(accent);

  const nodes = useRef(
    Array.from({ length: 8 + Math.round(params.density * 14) }, (_, i) => ({
      id: i,
      x: 6 + Math.random() * 88,
      y: 6 + Math.random() * 88,
      /** minDim fraction — sm to lg node */
      sizeFrac: PARTICLE_SIZE.sm + Math.random() * (PARTICLE_SIZE.lg - PARTICLE_SIZE.sm),
      /** minDim fraction — drift distance */
      driftXFrac: (Math.random() - 0.5) * 0.031,
      driftYFrac: (Math.random() - 0.5) * 0.031,
      duration: (14 + Math.random() * 16) / Math.max(params.speed, 0.1),
    }))
  ).current;

  const edges = useMemo(() => {
    const result: { from: number; to: number; dist: number }[] = [];
    const threshold = 28 + params.complexity * 16;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < threshold) result.push({ from: i, to: j, dist });
      }
    }
    return result;
  }, [nodes, params.complexity]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {edges.map((e, i) => {
          const strength = Math.max(0.04, 0.15 - e.dist * 0.003);
          return (
            <motion.line
              key={i}
              x1={`${nodes[e.from].x}%`} y1={`${nodes[e.from].y}%`}
              x2={`${nodes[e.to].x}%`} y2={`${nodes[e.to].y}%`}
              stroke={rgba(accentRgb, strength + amplitude * 0.04)}
              strokeWidth={px(STROKE.medium, minDim)}
              animate={{ opacity: [0.3, 0.7 + amplitude * 0.3, 0.3] }}
              transition={{
                duration: 5 + (i % 4) * 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          );
        })}
      </svg>

      {nodes.map(n => {
        const nodeSize = px(n.sizeFrac, minDim);
        return (
          <motion.div
            key={n.id}
            animate={{
              x: [0, n.driftXFrac * minDim, 0],
              y: [0, n.driftYFrac * minDim, 0],
              opacity: [0.15, 0.5 + amplitude * 0.25, 0.15],
            }}
            transition={{
              duration: n.duration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              left: `${n.x}%`, top: `${n.y}%`,
              width: nodeSize, height: nodeSize,
              borderRadius: '50%',
              background: accent,
              boxShadow: `0 0 ${px(PARTICLE_SIZE.md + amplitude * PARTICLE_SIZE.lg, minDim)}px ${rgba(accentRgb, 0.25)}`,
            }}
          />
        );
      })}

      {touches.map(t => (
        <TouchRipple key={t.id} x={t.x} y={t.y} accent={accent} mode={responseMode} minDim={minDim} accentRgb={accentRgb} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 5. RIPPLE RINGS — Concentric ring outlines expanding from sources
//    Primitive: stroked ellipse outlines (no fill)
//    Motion: continuous outward expansion + fade
//    Distribution: 3–5 source points emitting rings
//    DISTINCT: expanding outward motion, ring shapes, perspective ellipses
// ═══════════════════════════════════════════════════════════

function RippleRingsEngine({ accent, params, responseMode, viewport }: EngineProps) {
  const { amplitude } = useBreathEngine('calm');
  const touches = useSimulatedTouch(responseMode);
  const minDim = Math.min(viewport?.width ?? 320, viewport?.height ?? 652);
  const accentRgb = parseColor(accent);

  const sourceCount = 2 + Math.round(params.density * 3);
  const sources = useRef(
    Array.from({ length: sourceCount }, (_, i) => ({
      id: i,
      x: 15 + Math.random() * 70,
      y: 25 + Math.random() * 50,
      interval: (5 + Math.random() * 6) / Math.max(params.speed, 0.1),
      ringCount: 3 + Math.round(params.complexity * 2),
      maxRadius: 20 + Math.random() * 25 + params.depth * 12,
      squish: 0.45 + Math.random() * 0.2,
    }))
  ).current;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Source point dots */}
      {sources.map(src => {
        const dotSize = px(PARTICLE_SIZE.md, minDim);
        return (
          <motion.div
            key={`src-${src.id}`}
            animate={{
              opacity: [0.15, 0.4 + amplitude * 0.15, 0.15],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              left: `${src.x}%`, top: `${src.y}%`,
              width: dotSize, height: dotSize,
              borderRadius: '50%',
              background: accent,
              boxShadow: `0 0 ${px(PARTICLE_SIZE.md + amplitude * PARTICLE_SIZE.md, minDim)}px ${rgba(accentRgb, 0.3)}`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}

      {/* Expanding rings — boosted opacity and stroke */}
      {sources.map(src =>
        Array.from({ length: src.ringCount }, (_, ringIdx) => {
          const stagger = (ringIdx / src.ringCount) * src.interval;
          return (
            <motion.div
              key={`ring-${src.id}-${ringIdx}`}
              animate={{
                scale: [0, 1],
                opacity: [
                  0.35 + amplitude * params.reactivity * 0.12,
                  0,
                ],
              }}
              transition={{
                duration: src.interval,
                repeat: Infinity,
                delay: stagger,
                ease: 'easeOut',
              }}
              style={{
                position: 'absolute',
                left: `${src.x}%`,
                top: `${src.y}%`,
                width: src.maxRadius * 2 + '%',
                height: src.maxRadius * 2 * src.squish + '%',
                borderRadius: '50%',
                border: `${px(STROKE.heavy, minDim)}px solid ${rgba(accentRgb, 0.4)}`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
              }}
            />
          );
        })
      )}

      {/* Touch ring bursts */}
      {touches.map(t => (
        <RippleTouchBurst key={t.id} x={t.x} y={t.y} accent={accent} mode={responseMode} minDim={minDim} accentRgb={accentRgb} />
      ))}
    </div>
  );
}

function RippleTouchBurst({ x, y, accent, mode, minDim, accentRgb }: {
  x: number; y: number; accent: string; mode: ResponseMode;
  minDim?: number; accentRgb?: ReturnType<typeof parseColor>;
}) {
  const count = mode === 'immersion' ? 4 : mode === 'resonance' ? 3 : 2;
  const md = minDim ?? 320;
  const rgb = accentRgb ?? parseColor(accent);
  const burstSize = px(0.156, md);
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0.4 }}
          animate={{ scale: 2 + i * 0.4, opacity: 0 }}
          transition={{ duration: 1.2 + i * 0.3, delay: i * 0.1, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: `${x}%`, top: `${y}%`,
            width: burstSize, height: burstSize * 0.55,
            borderRadius: '50%',
            border: `${px(STROKE.heavy, md)}px solid ${rgba(rgb, 0.35)}`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// 6. SYNAPSE PULSE — Floating dots with momentary neural fire pulses
//    Primitive: drifting dots (like Particle Field) + brief luminous
//    pulses that fire between nearby pairs. Connections are MOMENTARY
//    (unlike Neural Web's persistent edges). Most of the time it's
//    just quiet floating dots — then a spark of neural life.
//    DISTINCT: same drift feel as particles, but with firing synapses
// ══════════════════════════════════════════════════════════

interface SynapseFire {
  id: number;
  fromIdx: number;
  toIdx: number;
  startTime: number;
}

function SynapsePulseEngine({ accent, params, responseMode, viewport }: EngineProps) {
  const { amplitude } = useBreathEngine('calm');
  const touches = useSimulatedTouch(responseMode);
  const minDim = Math.min(viewport?.width ?? 320, viewport?.height ?? 652);
  const accentRgb = parseColor(accent);
  const [fires, setFires] = useState<SynapseFire[]>([]);
  const fireIdRef = useRef(0);

  // Sparse floating dots — like Particle Field but fewer, neural-sized
  const nodeCount = 8 + Math.round(params.density * 10);
  const nodes = useRef(
    Array.from({ length: nodeCount }, (_, i) => ({
      id: i,
      x: 8 + Math.random() * 84,
      y: 8 + Math.random() * 84,
      /** minDim fraction — sm to lg node */
      sizeFrac: PARTICLE_SIZE.sm + Math.random() * (PARTICLE_SIZE.lg - PARTICLE_SIZE.sm),
      /** minDim fraction — drift distance */
      driftXFrac: (Math.random() - 0.5) * 0.038,
      driftYFrac: (Math.random() - 0.5) * 0.038,
      duration: (10 + Math.random() * 18) / Math.max(params.speed, 0.1),
      delay: Math.random() * -15,
      layer: 0.3 + Math.random() * 0.7,
    }))
  ).current;

  // Pre-compute nearby pairs for potential firing
  const pairs = useMemo(() => {
    const result: { from: number; to: number }[] = [];
    const threshold = 30 + params.complexity * 15;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < threshold) {
          result.push({ from: i, to: j });
        }
      }
    }
    return result;
  }, [nodes, params.complexity]);

  // Periodically fire a random synapse
  useEffect(() => {
    if (pairs.length === 0) return;
    const fireInterval = (2500 - params.reactivity * 1200) / Math.max(params.speed, 0.1);
    const interval = setInterval(() => {
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      const id = fireIdRef.current++;
      setFires(prev => [...prev, { id, fromIdx: pair.from, toIdx: pair.to, startTime: Date.now() }]);
      // Auto-remove after animation
      setTimeout(() => {
        setFires(prev => prev.filter(f => f.id !== id));
      }, 1200);
    }, fireInterval);
    return () => clearInterval(interval);
  }, [pairs, params.reactivity, params.speed]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Floating dots — gentle drift like Particle Field */}
      {nodes.map(n => {
        const depth = 0.4 + n.layer * 0.6;
        const nodeSize = px(n.sizeFrac, minDim);
        return (
          <motion.div
            key={n.id}
            animate={{
              x: [0, n.driftXFrac * minDim * depth, 0],
              y: [0, n.driftYFrac * minDim * depth, 0],
              opacity: [
                0.06 + n.layer * 0.04,
                0.15 + params.reactivity * 0.2 + amplitude * 0.1,
                0.06 + n.layer * 0.04,
              ],
            }}
            transition={{
              duration: n.duration,
              repeat: Infinity,
              delay: n.delay,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              left: `${n.x}%`, top: `${n.y}%`,
              width: nodeSize, height: nodeSize,
              borderRadius: '50%',
              background: accent,
              boxShadow: `0 0 ${px(PARTICLE_SIZE.sm + amplitude * PARTICLE_SIZE.md, minDim)}px ${rgba(accentRgb, 0.15)}`,
            }}
          />
        );
      })}

      {/* Synapse fires — brief luminous pulses between pairs */}
      {fires.map(fire => {
        const from = nodes[fire.fromIdx];
        const to = nodes[fire.toIdx];
        return (
          <SynapseFireEffect
            key={fire.id}
            x1={from.x} y1={from.y}
            x2={to.x} y2={to.y}
            accent={accent}
            amplitude={amplitude}
            minDim={minDim}
            accentRgb={accentRgb}
          />
        );
      })}

      {touches.map(t => (
        <TouchRipple key={t.id} x={t.x} y={t.y} accent={accent} mode={responseMode} minDim={minDim} accentRgb={accentRgb} />
      ))}
    </div>
  );
}

/** A single synapse fire: brief line flash + traveling dot + node flare */
function SynapseFireEffect({ x1, y1, x2, y2, accent, amplitude, minDim, accentRgb }: {
  x1: number; y1: number; x2: number; y2: number; accent: string; amplitude: number;
  minDim?: number; accentRgb?: ReturnType<typeof parseColor>;
}) {
  const md = minDim ?? 320;
  const rgb = accentRgb ?? parseColor(accent);
  const dotSize = px(PARTICLE_SIZE.md, md);
  const flareSize = px(PARTICLE_SIZE.lg, md);
  return (
    <>
      {/* Brief connecting line — appears and fades */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.2 + amplitude * 0.1, 0] }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <line
            x1={`${x1}%`} y1={`${y1}%`}
            x2={`${x2}%`} y2={`${y2}%`}
            stroke={rgba(rgb, 0.15)}
            strokeWidth={px(STROKE.medium, md)}
          />
        </svg>
      </motion.div>

      {/* Traveling dot — moves from source to target */}
      <motion.div
        initial={{ left: `${x1}%`, top: `${y1}%`, opacity: 0, scale: 0.5 }}
        animate={{
          left: `${x2}%`,
          top: `${y2}%`,
          opacity: [0, 0.6 + amplitude * 0.2, 0],
          scale: [0.5, 1.2, 0.3],
        }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          width: dotSize, height: dotSize,
          borderRadius: '50%',
          background: accent,
          boxShadow: `0 0 ${px(PARTICLE_SIZE.xl + amplitude * PARTICLE_SIZE.lg, md)}px ${rgba(rgb, 0.5)}`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Source node flare */}
      <motion.div
        initial={{ scale: 1, opacity: 0.4 }}
        animate={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          left: `${x1}%`, top: `${y1}%`,
          width: flareSize, height: flareSize,
          borderRadius: '50%',
          background: rgba(rgb, 0.3),
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Target node flare — delayed to arrive with traveling dot */}
      <motion.div
        initial={{ scale: 1, opacity: 0 }}
        animate={{ scale: 2, opacity: [0, 0.3, 0] }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.5 }}
        style={{
          position: 'absolute',
          left: `${x2}%`, top: `${y2}%`,
          width: flareSize, height: flareSize,
          borderRadius: '50%',
          background: rgba(rgb, 0.3),
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />
    </>
  );
}

// ─── Touch Ripple (shared) ──────────────────────────────────

function TouchRipple({ x, y, accent, mode, minDim, accentRgb }: { x: number; y: number; accent: string; mode: ResponseMode; minDim?: number; accentRgb?: ReturnType<typeof parseColor> }) {
  const md = minDim ?? 320;
  const rgb = accentRgb ?? parseColor(accent);

  if (mode === 'resonance') {
    const ringSize = px(0.094, md);   // ~30px at 320
    const glowSize = px(0.063, md);   // ~20px at 320
    return (
      <>
        <motion.div
          initial={{ scale: 0, opacity: 0.3 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: `${x}%`, top: `${y}%`,
            width: ringSize, height: ringSize, borderRadius: '50%',
            border: `${px(STROKE.bold, md)}px solid ${rgba(rgb, 0.2)}`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
        <motion.div
          initial={{ scale: 0, opacity: 0.15 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          style={{
            position: 'absolute',
            left: `${x}%`, top: `${y}%`,
            width: glowSize, height: glowSize, borderRadius: '50%',
            background: `radial-gradient(circle, ${rgba(rgb, 0.12)}, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
      </>
    );
  }

  if (mode === 'contrast') {
    const contrastSize = px(0.188, md);  // ~60px at 320
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0.4 }}
        animate={{ scale: 1.5, opacity: 0 }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          left: `${x}%`, top: `${y}%`,
          width: contrastSize, height: contrastSize, borderRadius: '50%',
          background: `radial-gradient(circle, ${scrims.contrastTouch} 0%, transparent 70%)`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />
    );
  }

  if (mode === 'witness') {
    const dotSize = px(PARTICLE_SIZE.md, md);
    return (
      <motion.div
        initial={{ scale: 0.5, opacity: 0.15 }}
        animate={{ scale: 0.8, opacity: 0, y: -px(0.016, md) }}
        transition={{ duration: 3, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          left: `${x}%`, top: `${y}%`,
          width: dotSize, height: dotSize, borderRadius: '50%',
          background: accent,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0.06 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at ${x}% ${y}%, ${rgba(rgb, 0.08)}, transparent 60%)`,
        pointerEvents: 'none',
      }}
    />
  );
}

// ─── Engine Router ──────────────────────────────────────────

const ENGINE_COMPONENTS: Record<EnginePhysics, React.ComponentType<EngineProps>> = {
  particle: ParticleFieldEngine,
  mesh: OrbitDriftEngine,
  noise: EmberDriftEngine,
  graph: NeuralWebEngine,
  fluid: RippleRingsEngine,
  void: SynapsePulseEngine,
};

// ─── Main Composite Renderer ────────────────────────────────

export function EnginePreviewRenderer({
  engineId,
  physics,
  responseMode,
  accent,
  glow,
  params,
  engineName,
  responseName,
  viewport,
}: EngineProps & { engineName: string; responseName: string }) {
  const EngineComponent = ENGINE_COMPONENTS[physics] || ParticleFieldEngine;
  const responseVisual = getResponseVisual(responseMode);
  const hasLabels = !!(engineName || responseName);

  return (
    <div style={{ position: 'absolute', inset: 0, background: surfaces.solid.base }}>
      <EngineComponent
        engineId={engineId}
        physics={physics}
        responseMode={responseMode}
        accent={accent}
        glow={glow}
        params={params}
        viewport={viewport}
      />

      {hasLabels && (
        <>
          <div style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            padding: '40px 20px 24px',
            background: scrims.labelBottom,
            zIndex: 10,
          }}>
            <div style={{
              fontFamily: fonts.secondary, fontSize: 16,
              color: colors.neutral.white, opacity: 0.7,
              marginBottom: 6,
            }}>
              {engineName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 4, height: 4, borderRadius: '50%',
                background: responseVisual?.accent ?? surfaces.glass.light,
              }} />
              <div style={{
                fontFamily: fonts.mono, fontSize: 9,
                color: colors.neutral.white, opacity: 0.35,
                letterSpacing: '0.06em',
              }}>
                {responseName} response
              </div>
            </div>
          </div>

          <div style={{
            position: 'absolute',
            top: 44, left: 0, right: 0,
            display: 'flex', justifyContent: 'center',
            zIndex: 10,
          }}>
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{
                fontFamily: fonts.mono, fontSize: 7,
                color: colors.neutral.white, opacity: 0.15,
                letterSpacing: '0.12em',
                textTransform: 'uppercase' as const,
              }}
            >
              {physics} · {responseVisual?.metaphor}
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}