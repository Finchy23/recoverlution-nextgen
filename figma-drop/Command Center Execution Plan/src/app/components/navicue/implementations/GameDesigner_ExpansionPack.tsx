/**
 * GAME DESIGNER #8 -- 1398. The Expansion Pack (New Skills)
 * "The world gets bigger when you get better."
 * INTERACTION: Map explored. Boring. Download DLC (new skill). New map opens.
 * STEALTH KBE: Growth -- Curiosity (K)
 *
 * COMPOSITOR: science_x_soul / Circuit / morning / knowing / tap / 1398
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

export default function GameDesigner_ExpansionPack({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Circuit',
        chrono: 'morning',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1398,
        isSeal: false,
      }}
      arrivalText="Map explored. Boring."
      prompt="Are you bored? It is because you explored the whole map. Download a new skill. The world gets bigger when you get better."
      resonantText="Growth. You downloaded the skill and the map expanded. Curiosity: boredom is not a symptom of the world being small. It is a symptom of your map being complete. Expand the map."
      afterglowCoda="The world gets bigger."
      onComplete={onComplete}
    >
      {(verse) => <ExpansionPackInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ExpansionPackInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'explored' | 'downloading' | 'expanding' | 'expanded'>('explored');

  const handleDownload = () => {
    if (phase !== 'explored') return;
    setPhase('downloading');
    setTimeout(() => {
      setPhase('expanding');
      setTimeout(() => {
        setPhase('expanded');
        setTimeout(() => verse.advance(), 3000);
      }, 1200);
    }, 1500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 230, H = 160;
  const CX = W / 2, CY = H / 2 - 5;

  // Map (old explored region)
  const OLD_R = 35;
  const NEW_R = 65;
  const mapR = phase === 'expanded' || phase === 'expanding' ? NEW_R : OLD_R;

  // Grid dots (explored)
  const exploredDots = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const r = 15 + (i % 3) * 8;
    return { x: CX + Math.cos(angle) * r, y: CY + Math.sin(angle) * r };
  });

  // New territory dots
  const newDots = Array.from({ length: 16 }).map((_, i) => {
    const angle = (i / 16) * Math.PI * 2 + 0.1;
    const r = OLD_R + 8 + (i % 3) * 10;
    return { x: CX + Math.cos(angle) * r, y: CY + Math.sin(angle) * r };
  });

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>map</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'expanded' ? verse.palette.accent
            : phase === 'explored' ? verse.palette.shadow : verse.palette.text,
        }}>
          {phase === 'expanded' ? 'expanded'
            : phase === 'expanding' ? 'new territory...'
              : phase === 'downloading' ? 'downloading DLC...'
                : '100% explored'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Map boundary */}
          <motion.circle
            cx={CX} cy={CY}
            fill="none"
            stroke={phase === 'expanded' ? verse.palette.accent : verse.palette.primary}
            strokeWidth={1}
            animate={{
              r: mapR,
              opacity: safeOpacity(phase === 'expanded' ? 0.2 : 0.1),
            }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Old explored fill */}
          <circle cx={CX} cy={CY} r={OLD_R}
            fill={verse.palette.primary} opacity={safeOpacity(0.03)} />

          {/* Explored dots (dim, done) */}
          {exploredDots.map((d, i) => (
            <circle key={`e-${i}`} cx={d.x} cy={d.y} r={2}
              fill={verse.palette.primary}
              opacity={safeOpacity(phase === 'explored' ? 0.06 : 0.03)} />
          ))}

          {/* "100%" label */}
          {phase === 'explored' && (
            <text x={CX} y={CY + 3} textAnchor="middle"
              fill={verse.palette.shadow} style={{ fontSize: '9px', fontFamily: 'monospace' }}
              opacity={0.2}>
              100%
            </text>
          )}

          {/* Download progress */}
          {phase === 'downloading' && (
            <motion.g>
              <rect x={CX - 30} y={CY - 5} width={60} height={8} rx={4}
                fill={verse.palette.primary} opacity={safeOpacity(0.05)} />
              <motion.rect
                x={CX - 30} y={CY - 5} height={8} rx={4}
                fill={verse.palette.accent}
                initial={{ width: 0 }}
                animate={{ width: 60 }}
                transition={{ duration: 1.5 }}
                opacity={safeOpacity(0.15)}
              />
              <text x={CX} y={CY + 15} textAnchor="middle"
                fill={verse.palette.textFaint} style={{ fontSize: '7px', fontFamily: 'monospace' }}
                opacity={0.2}>
                installing: new_skill.dlc
              </text>
            </motion.g>
          )}

          {/* New territory dots (appear on expand) */}
          {(phase === 'expanding' || phase === 'expanded') && newDots.map((d, i) => (
            <motion.circle key={`n-${i}`}
              cx={d.x} cy={d.y} r={2.5}
              fill={verse.palette.accent}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: safeOpacity(0.15),
                scale: 1,
              }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            />
          ))}

          {/* New territory fill */}
          {(phase === 'expanding' || phase === 'expanded') && (
            <motion.circle
              cx={CX} cy={CY} r={NEW_R}
              fill={verse.palette.accent}
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.02) }}
              transition={{ duration: 1 }}
            />
          )}

          {/* Unexplored label */}
          {phase === 'expanded' && (
            <motion.text x={CX + NEW_R - 10} y={CY - NEW_R + 15}
              fill={verse.palette.accent} style={{ fontSize: '7px' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 0.5 }}>
              unexplored
            </motion.text>
          )}

          {/* Result */}
          {phase === 'expanded' && (
            <motion.text x={CX} y={H - 5} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              transition={{ delay: 0.8 }}>
              the world gets bigger when you get better
            </motion.text>
          )}
        </svg>
      </div>

      {phase === 'explored' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleDownload}>
          download DLC: new skill
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'expanded' ? 'new territory. boredom was the signal, not the sentence.'
          : phase === 'expanding' ? 'new map regions appearing...'
            : phase === 'downloading' ? 'installing new skill...'
              : 'the whole map is explored. boredom.'}
      </span>

      {phase === 'expanded' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          curiosity
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'expanded' ? 'growth' : 'expand the map'}
      </div>
    </div>
  );
}
