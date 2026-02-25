/**
 * STRATEGIST #10 -- 1310. The Strategist Seal (The Proof)
 * "The game is won before the first move."
 * INTERACTION: Observe -- a decision tree branching out, looking 10 moves ahead
 * STEALTH KBE: Game Theory / Strategic Interaction -- seal completion
 *
 * COMPOSITOR: science_x_soul / Cosmos / night / knowing / observe / 1310
 */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

interface TreeNode {
  x: number;
  y: number;
  children: number[];
  depth: number;
  optimal: boolean;
}

export default function Strategist_StrategistSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Cosmos',
        chrono: 'night',
        kbe: 'k',
        hook: 'observe',
        specimenSeed: 1310,
        isSeal: true,
      }}
      arrivalText="The algorithm sees ahead."
      prompt="The game is won before the first move."
      resonantText="Game theory. The study of mathematical models of strategic interaction. You are in a game. Learn the rules. The decision tree extends ten moves deep. The optimal path illuminates. The game was won before the first piece moved."
      afterglowCoda="Learn the rules."
      onComplete={onComplete}
    >
      {(verse) => <StrategistSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function StrategistSealInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState(0);
  const [visibleDepth, setVisibleDepth] = useState(0);

  useEffect(() => {
    // Progressively reveal the tree depth by depth
    const timers: any[] = [];
    for (let d = 1; d <= 6; d++) {
      timers.push(setTimeout(() => setVisibleDepth(d), d * 1200));
    }
    timers.push(setTimeout(() => setPhase(1), 8000)); // highlight optimal
    timers.push(setTimeout(() => setPhase(2), 11000)); // seal
    timers.push(setTimeout(() => {
      setPhase(3);
      setTimeout(() => verse.advance(), 3500);
    }, 13500));

    return () => timers.forEach(clearTimeout);
  }, [verse]);

  const W = 280, H = 260;
  const CX = W / 2;

  // Build a binary-ish decision tree
  const buildTree = (): TreeNode[] => {
    const nodes: TreeNode[] = [];
    const DEPTHS = 6;
    const TOP_Y = 25;
    const BOT_Y = 230;
    const layerH = (BOT_Y - TOP_Y) / DEPTHS;

    // Optimal path: always take the "left" child at even depths, "right" at odd
    const isOptimal = (idx: number, depth: number): boolean => {
      if (depth === 0) return true;
      // Trace back: optimal path zigzags
      let current = idx;
      let d = depth;
      while (d > 0) {
        const parentIdx = Math.floor((current - 1) / 2); // rough parent
        if (d % 2 === 1 && current % 2 === 1) { d--; current = parentIdx; continue; }
        if (d % 2 === 0 && current % 2 === 0) { d--; current = parentIdx; continue; }
        return false;
      }
      return true;
    };

    let idx = 0;
    for (let d = 0; d <= DEPTHS; d++) {
      const count = Math.min(Math.pow(2, d), 32);
      const y = TOP_Y + d * layerH;
      const spread = Math.min(W - 40, 30 + d * 40);
      const startX = CX - spread / 2;

      for (let i = 0; i < count; i++) {
        const x = count === 1 ? CX : startX + (i / (count - 1)) * spread;
        const children: number[] = [];
        if (d < DEPTHS) {
          const nextLayerStart = idx + (count - i);
          // Approximate children indices
          children.push(idx + count + i * 2 - (d > 0 ? 0 : 0));
          children.push(idx + count + i * 2 + 1 - (d > 0 ? 0 : 0));
        }

        nodes.push({
          x, y,
          children,
          depth: d,
          optimal: d <= 3 && i === Math.floor(count / 3),
        });
        idx++;
      }
    }

    return nodes;
  };

  // Simpler approach: manually define layers
  const layers: { x: number; y: number; opt: boolean }[][] = [];
  const DEPTHS = 6;
  const TOP_Y = 25, BOT_Y = 230;
  const layerH = (BOT_Y - TOP_Y) / DEPTHS;

  // Optimal path index per layer
  const optPath = [0, 1, 2, 5, 10, 20, 40];

  for (let d = 0; d <= DEPTHS; d++) {
    const count = Math.min(Math.pow(2, d), 40);
    const y = TOP_Y + d * layerH;
    const spread = Math.min(W - 30, 20 + d * 42);
    const startX = CX - spread / 2;
    const layer: { x: number; y: number; opt: boolean }[] = [];

    for (let i = 0; i < count; i++) {
      const x = count === 1 ? CX : startX + (i / Math.max(1, count - 1)) * spread;
      layer.push({ x, y, opt: i === Math.min(i, Math.floor(count * 0.35)) });
    }
    layers.push(layer);
  }

  // Mark the optimal path more simply
  const optimalIndices = [0, 0, 1, 2, 4, 8, 16];

  return (
    <div style={navicueStyles.interactionContainer(12)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Connection lines between layers */}
          {layers.map((layer, d) => {
            if (d >= visibleDepth || d >= layers.length - 1) return null;
            const nextLayer = layers[d + 1];
            if (!nextLayer || d + 1 > visibleDepth) return null;

            return layer.map((node, i) => {
              // Connect to ~2 children in next layer
              const childStart = Math.min(Math.floor(i * 2), nextLayer.length - 2);
              const children = [childStart, Math.min(childStart + 1, nextLayer.length - 1)];

              return children.map((ci, j) => {
                const child = nextLayer[ci];
                if (!child) return null;
                const isOpt = phase >= 1 && i === optimalIndices[d] && ci === optimalIndices[d + 1];

                return (
                  <motion.line key={`${d}-${i}-${j}`}
                    x1={node.x} y1={node.y}
                    x2={child.x} y2={child.y}
                    stroke={isOpt ? verse.palette.accent : verse.palette.primary}
                    strokeWidth={isOpt ? 1.5 : 0.4}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: safeOpacity(isOpt ? 0.4 : 0.08),
                    }}
                    transition={{ delay: d * 0.05 + i * 0.01, duration: 0.3 }}
                  />
                );
              });
            });
          })}

          {/* Nodes */}
          {layers.map((layer, d) => {
            if (d > visibleDepth) return null;
            return layer.map((node, i) => {
              const isOpt = phase >= 1 && i === optimalIndices[d];
              const r = d === 0 ? 5 : Math.max(2, 4 - d * 0.3);

              return (
                <motion.circle key={`n-${d}-${i}`}
                  cx={node.x} cy={node.y} r={r}
                  fill={isOpt ? verse.palette.accent : verse.palette.primary}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: safeOpacity(isOpt ? 0.5 : 0.15),
                    scale: 1,
                  }}
                  transition={{ delay: d * 0.1 + i * 0.008, duration: 0.2 }}
                />
              );
            });
          })}

          {/* Depth labels */}
          {Array.from({ length: Math.min(visibleDepth + 1, DEPTHS + 1) }).map((_, d) => (
            <motion.text key={d}
              x={12} y={TOP_Y + d * layerH + 3}
              fill={verse.palette.textFaint}
              style={{ fontSize: '7px' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              transition={{ delay: d * 0.1 }}
            >
              +{d}
            </motion.text>
          ))}

          {/* Optimal path glow */}
          {phase >= 1 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {optimalIndices.slice(0, visibleDepth + 1).map((oi, d) => {
                const layer = layers[d];
                if (!layer || !layer[oi]) return null;
                const node = layer[oi];
                return (
                  <motion.circle key={`glow-${d}`}
                    cx={node.x} cy={node.y}
                    r={d === 0 ? 10 : 6}
                    fill={verse.palette.accent}
                    animate={{
                      opacity: [safeOpacity(0.04), safeOpacity(0.08), safeOpacity(0.04)],
                    }}
                    transition={{ repeat: Infinity, duration: 2, delay: d * 0.15 }}
                  />
                );
              })}
            </motion.g>
          )}

          {/* Seal ring */}
          {phase >= 2 && (
            <motion.circle
              cx={CX} cy={(TOP_Y + BOT_Y) / 2} r={120}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={0.5}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: safeOpacity(0.12), scale: 1 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            />
          )}

          {/* Phase text */}
          <motion.text
            x={CX} y={H - 5}
            textAnchor="middle"
            fill={phase >= 3 ? verse.palette.accent : verse.palette.textFaint}
            style={navicueType.hint}
            animate={{ opacity: 0.6 }}
          >
            {phase === 0 && visibleDepth < 3 && 'branching...'}
            {phase === 0 && visibleDepth >= 3 && `${Math.pow(2, visibleDepth)} possibilities`}
            {phase === 1 && 'the optimal path illuminates'}
            {phase === 2 && 'ten moves ahead'}
            {phase >= 3 && 'the game is won before the first move'}
          </motion.text>
        </svg>
      </div>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase >= 3 ? 'game theory' : 'observe'}
      </div>
    </div>
  );
}
