/**
 * NETWORK #5 -- 1315. Metcalfe's Law
 * "Your value increases with the square of your connections."
 * INTERACTION: Tap to add phones/nodes -- value bar grows n-squared
 * STEALTH KBE: Platform Thinking -- Scalability (K)
 *
 * COMPOSITOR: science_x_soul / Circuit / work / knowing / tap / 1315
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Network_MetcalfesLaw({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Circuit',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1315,
        isSeal: false,
      }}
      arrivalText="One phone. Useless."
      prompt="Your value increases with the square of your connections. Do not be a hermit. Join the network. Be compatible."
      resonantText="Platform thinking. The value did not grow linearly. It squared. Scalability is the exponential truth of networks: each new node does not add value, it multiplies it."
      afterglowCoda="Value equals n squared."
      onComplete={onComplete}
    >
      {(verse) => <MetcalfesLawInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function MetcalfesLawInteraction({ verse }: { verse: any }) {
  const [nodes, setNodes] = useState(1);
  const [done, setDone] = useState(false);
  const TARGET = 6;

  const handleAdd = () => {
    if (done) return;
    const next = nodes + 1;
    setNodes(next);
    if (next >= TARGET) {
      setDone(true);
      setTimeout(() => verse.advance(), 3200);
    }
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 180;
  const CX = W / 2, CY = 85;

  const value = nodes * nodes;
  const maxValue = TARGET * TARGET;

  // Node positions in a circle
  const nodePositions = Array.from({ length: nodes }).map((_, i) => {
    const angle = (i / Math.max(nodes, 1)) * Math.PI * 2 - Math.PI / 2;
    const r = nodes === 1 ? 0 : 35 + nodes * 5;
    return {
      x: CX + (nodes === 1 ? 0 : Math.cos(angle) * r),
      y: CY + (nodes === 1 ? 0 : Math.sin(angle) * r),
    };
  });

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      {/* Value readout */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>n={nodes}</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.text,
        }}>
          value = {value}
        </motion.span>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint, opacity: 0.3 }}>
          (n{'\u00B2'})
        </span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Connection lines (all pairs) */}
          {nodePositions.map((a, i) =>
            nodePositions.slice(i + 1).map((b, j) => (
              <motion.line key={`c-${i}-${j}`}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={verse.palette.accent}
                strokeWidth={0.5}
                initial={{ opacity: 0 }}
                animate={{ opacity: safeOpacity(0.12) }}
                transition={{ delay: 0.05 * (i + j) }}
              />
            ))
          )}

          {/* Nodes */}
          {nodePositions.map((pos, i) => (
            <motion.g key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.2 }}
            >
              <circle cx={pos.x} cy={pos.y} r={6}
                fill={verse.palette.accent} opacity={safeOpacity(0.15)} />
              <circle cx={pos.x} cy={pos.y} r={6}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.8} opacity={safeOpacity(0.3)} />
            </motion.g>
          ))}

          {/* Value bar */}
          <g>
            <rect x={20} y={H - 20} width={W - 40} height={6} rx={3}
              fill={verse.palette.primary} opacity={safeOpacity(0.06)} />
            <motion.rect
              x={20} y={H - 20} height={6} rx={3}
              fill={verse.palette.accent}
              animate={{
                width: ((value / maxValue) * (W - 40)),
                opacity: safeOpacity(done ? 0.4 : 0.2),
              }}
              transition={{ duration: 0.4 }}
            />
          </g>

          {/* Labels at value bar edges */}
          <text x={20} y={H - 5} fill={verse.palette.textFaint}
            style={{ fontSize: '7px' }} opacity={0.2}>0</text>
          <text x={W - 20} y={H - 5} textAnchor="end"
            fill={verse.palette.textFaint}
            style={{ fontSize: '7px' }} opacity={0.2}>{maxValue}</text>

          {/* Connection count */}
          {nodes > 1 && (
            <text x={CX} y={CY} textAnchor="middle"
              fill={verse.palette.textFaint}
              style={navicueType.micro} opacity={0.25}>
              {nodes * (nodes - 1) / 2} links
            </text>
          )}
        </svg>
      </div>

      {!done && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleAdd}>
          {nodes === 1 ? 'join network' : 'add node'}
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'indispensable. value squared.'
          : nodes === 1 ? '1 phone is useless'
            : `${nodes} nodes. ${value} value.`}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          scalability
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'platform thinking' : 'value = n squared'}
      </div>
    </div>
  );
}
