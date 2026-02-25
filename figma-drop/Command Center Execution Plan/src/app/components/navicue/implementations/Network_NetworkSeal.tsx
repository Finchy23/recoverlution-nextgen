/**
 * NETWORK #10 -- 1320. The Network Seal (The Proof)
 * "We are woven together."
 * INTERACTION: Observe -- complex graph with clusters, shortcuts, six degrees
 * STEALTH KBE: Graph Theory -- seal completion
 *
 * COMPOSITOR: science_x_soul / Cosmos / night / knowing / observe / 1320
 */
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Network_NetworkSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Cosmos',
        chrono: 'night',
        kbe: 'k',
        hook: 'observe',
        specimenSeed: 1320,
        isSeal: true,
      }}
      arrivalText="Nodes. Edges. The web."
      prompt="We are woven together."
      resonantText="Graph theory. The study of mathematical structures used to model pairwise relations between objects. You are defined by your edges, not just your node. Six degrees of separation. Specimen 1320. The proof."
      afterglowCoda="Woven together."
      onComplete={onComplete}
    >
      {(verse) => <NetworkSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function NetworkSealInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 2000),
      setTimeout(() => setPhase(2), 5000),
      setTimeout(() => setPhase(3), 8000),
      setTimeout(() => setPhase(4), 11000),
      setTimeout(() => {
        setPhase(5);
        setTimeout(() => verse.advance(), 3500);
      }, 14000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [verse]);

  const W = 280, H = 260;
  const CX = W / 2, CY = H / 2;

  // Generate a small-world graph
  const nodes = useMemo(() => {
    const result: { x: number; y: number; cluster: number }[] = [];
    // 4 clusters
    const clusterCenters = [
      { x: 70, y: 70 }, { x: 210, y: 65 },
      { x: 65, y: 185 }, { x: 200, y: 190 },
    ];
    clusterCenters.forEach((center, c) => {
      const count = 6 + c;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const r = 25 + (i % 3) * 8;
        result.push({
          x: center.x + Math.cos(angle) * r,
          y: center.y + Math.sin(angle) * r,
          cluster: c,
        });
      }
    });
    return result;
  }, []);

  // Edges: intra-cluster (dense) + inter-cluster shortcuts
  const intraEdges = useMemo(() => {
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].cluster === nodes[j].cluster) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 45) edges.push([i, j]);
        }
      }
    }
    return edges;
  }, [nodes]);

  // Shortcut edges (6 degrees bridges)
  const shortcuts = useMemo(() => {
    const s: [number, number][] = [];
    // Connect cluster 0 -> 1
    s.push([2, nodes.findIndex(n => n.cluster === 1)]);
    // Connect cluster 1 -> 3
    s.push([nodes.findIndex(n => n.cluster === 1) + 3, nodes.findIndex(n => n.cluster === 3) + 1]);
    // Connect cluster 2 -> 0
    s.push([nodes.findIndex(n => n.cluster === 2) + 2, 4]);
    // Connect cluster 3 -> 2
    s.push([nodes.findIndex(n => n.cluster === 3), nodes.findIndex(n => n.cluster === 2) + 3]);
    // Extra long bridge
    s.push([1, nodes.findIndex(n => n.cluster === 3) + 4]);
    return s.filter(([a, b]) => a >= 0 && b >= 0 && a < nodes.length && b < nodes.length);
  }, [nodes]);

  // Six degrees path (highlight)
  const sixDegreesPath = useMemo(() => {
    const start = 0;
    const end = nodes.findIndex(n => n.cluster === 3) + 2;
    // Manually trace: cluster 0 -> shortcut -> cluster 1 -> shortcut -> cluster 3 -> end
    const c1Start = nodes.findIndex(n => n.cluster === 1);
    const c3Start = nodes.findIndex(n => n.cluster === 3);
    return [start, 2, c1Start, c1Start + 3, c3Start + 1, Math.min(end, nodes.length - 1)];
  }, [nodes]);

  return (
    <div style={navicueStyles.interactionContainer(12)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Intra-cluster edges */}
          {phase >= 1 && intraEdges.map(([a, b], i) => (
            <motion.line key={`ie-${i}`}
              x1={nodes[a].x} y1={nodes[a].y}
              x2={nodes[b].x} y2={nodes[b].y}
              stroke={verse.palette.primary}
              strokeWidth={0.4}
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.1) }}
              transition={{ delay: i * 0.01 + 0.2, duration: 0.3 }}
            />
          ))}

          {/* Shortcut edges (bridges) */}
          {phase >= 2 && shortcuts.map(([a, b], i) => (
            <motion.line key={`sc-${i}`}
              x1={nodes[a].x} y1={nodes[a].y}
              x2={nodes[b].x} y2={nodes[b].y}
              stroke={verse.palette.accent}
              strokeWidth={0.8}
              strokeDasharray="4 3"
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.25) }}
              transition={{ delay: i * 0.2, duration: 0.5 }}
            />
          ))}

          {/* Nodes */}
          {phase >= 1 && nodes.map((node, i) => (
            <motion.circle key={`n-${i}`}
              cx={node.x} cy={node.y}
              r={3}
              fill={verse.palette.primary}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: safeOpacity(0.2),
                scale: 1,
              }}
              transition={{ delay: i * 0.015 + 0.1, duration: 0.15 }}
            />
          ))}

          {/* Hub nodes (larger) */}
          {phase >= 1 && [0, nodes.findIndex(n => n.cluster === 1),
            nodes.findIndex(n => n.cluster === 2), nodes.findIndex(n => n.cluster === 3)]
            .filter(i => i >= 0 && i < nodes.length)
            .map(i => (
              <motion.circle key={`hub-${i}`}
                cx={nodes[i].x} cy={nodes[i].y}
                r={5} fill="none"
                stroke={verse.palette.primary}
                strokeWidth={0.5}
                initial={{ opacity: 0 }}
                animate={{ opacity: safeOpacity(0.15) }}
                transition={{ delay: 0.5 }}
              />
            ))}

          {/* Cluster labels */}
          {phase >= 1 && [
            { x: 70, y: 38, label: 'cluster a' },
            { x: 210, y: 33, label: 'cluster b' },
            { x: 65, y: 223, label: 'cluster c' },
            { x: 200, y: 228, label: 'cluster d' },
          ].map((cl, i) => (
            <motion.text key={cl.label}
              x={cl.x} y={cl.y} textAnchor="middle"
              fill={verse.palette.textFaint}
              style={{ fontSize: '7px' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              transition={{ delay: 0.8 + i * 0.1 }}
            >
              {cl.label}
            </motion.text>
          ))}

          {/* Six degrees path highlight */}
          {phase >= 3 && sixDegreesPath.map((nodeIdx, i) => {
            if (i === 0 || nodeIdx >= nodes.length) return null;
            const prevIdx = sixDegreesPath[i - 1];
            if (prevIdx >= nodes.length) return null;
            return (
              <motion.line key={`path-${i}`}
                x1={nodes[prevIdx].x} y1={nodes[prevIdx].y}
                x2={nodes[nodeIdx].x} y2={nodes[nodeIdx].y}
                stroke={verse.palette.accent}
                strokeWidth={2}
                initial={{ opacity: 0 }}
                animate={{ opacity: safeOpacity(0.35) }}
                transition={{ delay: i * 0.3, duration: 0.3 }}
              />
            );
          })}

          {/* Path node highlights */}
          {phase >= 3 && sixDegreesPath.filter(i => i < nodes.length).map((nodeIdx, i) => (
            <motion.circle key={`pn-${i}`}
              cx={nodes[nodeIdx].x} cy={nodes[nodeIdx].y}
              r={5}
              fill={verse.palette.accent}
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.3) }}
              transition={{ delay: i * 0.3, duration: 0.2 }}
            />
          ))}

          {/* "6 degrees" label */}
          {phase >= 3 && (
            <motion.text
              x={CX} y={CY} textAnchor="middle"
              fill={verse.palette.accent}
              style={navicueType.choice}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 1.5 }}
            >
              6 degrees
            </motion.text>
          )}

          {/* Seal ring */}
          {phase >= 4 && (
            <motion.circle
              cx={CX} cy={CY} r={120}
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
            fill={phase >= 5 ? verse.palette.accent : verse.palette.textFaint}
            style={navicueType.hint}
            animate={{ opacity: 0.6 }}
          >
            {phase === 0 && 'the graph emerges'}
            {phase === 1 && 'clusters form'}
            {phase === 2 && 'bridges connect'}
            {phase === 3 && 'six degrees of separation'}
            {phase === 4 && 'every node reachable'}
            {phase >= 5 && 'we are woven together'}
          </motion.text>
        </svg>
      </div>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase >= 5 ? 'graph theory / specimen 1320' : 'observe'}
      </div>
    </div>
  );
}
