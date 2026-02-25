/**
 * ARCHITECT #1 -- 1321. The Bottleneck
 * "Any improvement not at the bottleneck is an illusion."
 * INTERACTION: Tap to widen the constriction -- flow doubles
 * STEALTH KBE: Constraint Theory -- TOC (K)
 *
 * COMPOSITOR: science_x_soul / Circuit / work / knowing / tap / 1321
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

export default function Architect_Bottleneck({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Circuit',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1321,
        isSeal: false,
      }}
      arrivalText="A pipe. Water chokes."
      prompt="Stop optimizing the fast parts. Find the constriction. Any improvement not at the bottleneck is an illusion."
      resonantText="Constraint theory. You widened the bottleneck and flow doubled. The Theory of Constraints says every system has exactly one limiting factor. Find it. Fix it. Everything upstream accelerates."
      afterglowCoda="Find the constriction."
      onComplete={onComplete}
    >
      {(verse) => <BottleneckInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function BottleneckInteraction({ verse }: { verse: any }) {
  const [widened, setWidened] = useState(false);
  const [done, setDone] = useState(false);

  const handleWiden = () => {
    if (widened) return;
    setWidened(true);
    setDone(true);
    setTimeout(() => verse.advance(), 3500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 260, H = 140;
  const PY = H / 2;

  // Pipe geometry
  const WIDE = 28;
  const NARROW = widened ? 24 : 8;
  const neckX = 130;

  // Flow particles
  const particles = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    yOff: (Math.random() - 0.5) * 12,
    delay: i * 0.25,
  }));

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>throughput</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.text,
        }}>
          {done ? '2x' : '0.5x'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Pipe upper wall */}
          <motion.path
            d={`M 20,${PY - WIDE} L ${neckX - 30},${PY - WIDE} Q ${neckX},${PY - NARROW} ${neckX + 30},${PY - WIDE} L ${W - 20},${PY - WIDE}`}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={1.5}
            animate={{ d: `M 20,${PY - WIDE} L ${neckX - 30},${PY - WIDE} Q ${neckX},${PY - NARROW} ${neckX + 30},${PY - WIDE} L ${W - 20},${PY - WIDE}` }}
            opacity={safeOpacity(0.2)}
            transition={{ duration: 0.5 }}
          />

          {/* Pipe lower wall */}
          <motion.path
            d={`M 20,${PY + WIDE} L ${neckX - 30},${PY + WIDE} Q ${neckX},${PY + NARROW} ${neckX + 30},${PY + WIDE} L ${W - 20},${PY + WIDE}`}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={1.5}
            animate={{ d: `M 20,${PY + WIDE} L ${neckX - 30},${PY + WIDE} Q ${neckX},${PY + NARROW} ${neckX + 30},${PY + WIDE} L ${W - 20},${PY + WIDE}` }}
            opacity={safeOpacity(0.2)}
            transition={{ duration: 0.5 }}
          />

          {/* Pipe fill */}
          <motion.path
            d={`M 20,${PY - WIDE + 2} L ${neckX - 30},${PY - WIDE + 2} Q ${neckX},${PY - NARROW + 2} ${neckX + 30},${PY - WIDE + 2} L ${W - 20},${PY - WIDE + 2} L ${W - 20},${PY + WIDE - 2} L ${neckX + 30},${PY + WIDE - 2} Q ${neckX},${PY + NARROW - 2} ${neckX - 30},${PY + WIDE - 2} L 20,${PY + WIDE - 2} Z`}
            fill={verse.palette.accent}
            animate={{
              d: `M 20,${PY - WIDE + 2} L ${neckX - 30},${PY - WIDE + 2} Q ${neckX},${PY - NARROW + 2} ${neckX + 30},${PY - WIDE + 2} L ${W - 20},${PY - WIDE + 2} L ${W - 20},${PY + WIDE - 2} L ${neckX + 30},${PY + WIDE - 2} Q ${neckX},${PY + NARROW - 2} ${neckX - 30},${PY + WIDE - 2} L 20,${PY + WIDE - 2} Z`,
              opacity: safeOpacity(done ? 0.06 : 0.03),
            }}
            transition={{ duration: 0.5 }}
          />

          {/* Flow particles */}
          {particles.map((p) => (
            <motion.circle key={p.id}
              r={widened ? 3 : 2}
              cy={PY + (widened ? p.yOff : p.yOff * 0.3)}
              fill={verse.palette.accent}
              animate={{
                cx: [20, neckX, W - 20],
                opacity: [safeOpacity(0.3), safeOpacity(widened ? 0.3 : 0.15), 0],
              }}
              transition={{
                repeat: Infinity,
                duration: widened ? 1.2 : 2.5,
                delay: p.delay,
                ease: 'linear',
              }}
            />
          ))}

          {/* Bottleneck indicator */}
          {!widened && (
            <motion.g
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              <line x1={neckX} y1={PY - NARROW - 8} x2={neckX} y2={PY - NARROW - 2}
                stroke={verse.palette.shadow} strokeWidth={1} />
              <line x1={neckX} y1={PY + NARROW + 2} x2={neckX} y2={PY + NARROW + 8}
                stroke={verse.palette.shadow} strokeWidth={1} />
              <text x={neckX} y={PY - NARROW - 12} textAnchor="middle"
                fill={verse.palette.shadow} style={{ fontSize: '8px' }}>
                constraint
              </text>
            </motion.g>
          )}

          {/* Speed labels */}
          <text x={55} y={H - 8} textAnchor="middle"
            fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}>
            fast
          </text>
          <text x={neckX} y={H - 8} textAnchor="middle"
            fill={widened ? verse.palette.accent : verse.palette.shadow}
            style={{ fontSize: '7px' }} opacity={widened ? 0.4 : 0.3}>
            {widened ? 'widened' : 'choke'}
          </text>
          <text x={W - 55} y={H - 8} textAnchor="middle"
            fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}>
            fast
          </text>
        </svg>
      </div>

      {!widened && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleWiden}>
          widen the constraint
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'flow doubled. the bottleneck was the system.'
          : 'the fast parts are not the problem'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          theory of constraints
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'constraint theory' : 'find the constriction'}
      </div>
    </div>
  );
}
