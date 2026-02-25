/**
 * WARRIOR II #8 -- 1368. The Flanking Maneuver
 * "Direct attack is suicide. Go around."
 * INTERACTION: A wall. Hit head-on (fail). Go around the side. Open door.
 * STEALTH KBE: Lateral Thinking -- Indirect Approach (K)
 *
 * COMPOSITOR: poetic_precision / Lattice / work / knowing / tap / 1368
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

export default function WarriorII_FlankingManeuver({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Lattice',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1368,
        isSeal: false,
      }}
      arrivalText="A wall. Thick."
      prompt="Direct attack is suicide. Hitting the strength is foolish. Attack the weakness. Go around."
      resonantText="Lateral thinking. You went around the wall and found the open door. Indirect approach: the shortest path is not always through. Often, the longest way round is the shortest way home."
      afterglowCoda="Go around."
      onComplete={onComplete}
    >
      {(verse) => <FlankingManeuverInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FlankingManeuverInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'wall' | 'hit' | 'think' | 'flank' | 'through'>('wall');

  const handleHit = () => {
    if (phase !== 'wall') return;
    setPhase('hit');
    setTimeout(() => setPhase('think'), 1000);
  };

  const handleFlank = () => {
    if (phase !== 'think') return;
    setPhase('flank');
    setTimeout(() => {
      setPhase('through');
      setTimeout(() => verse.advance(), 3000);
    }, 1500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 160;
  const CX = W / 2;

  // Wall
  const WALL_X = CX, WALL_Y1 = 20, WALL_Y2 = 110;
  // Door (at bottom of wall)
  const DOOR_Y = WALL_Y2 + 5;
  // You
  const YOU_START = CX - 50;

  const flanking = phase === 'flank' || phase === 'through';

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>approach</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'through' ? verse.palette.accent
            : phase === 'hit' ? verse.palette.shadow : verse.palette.text,
        }}>
          {phase === 'through' ? 'through'
            : flanking ? 'flanking...'
              : phase === 'think' ? 'rethinking'
                : phase === 'hit' ? 'blocked'
                  : 'direct'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Wall */}
          <line x1={WALL_X} y1={WALL_Y1} x2={WALL_X} y2={WALL_Y2}
            stroke={verse.palette.primary} strokeWidth={6}
            strokeLinecap="round"
            opacity={safeOpacity(0.15)} />
          <text x={WALL_X + 8} y={(WALL_Y1 + WALL_Y2) / 2 + 3}
            fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.15}>
            strength
          </text>

          {/* Door (below wall, side) */}
          <rect x={WALL_X - 8} y={DOOR_Y} width={16} height={20} rx={2}
            fill={phase === 'through' ? verse.palette.accent : verse.palette.primary}
            opacity={safeOpacity(phase === 'through' ? 0.1 : 0.04)} />
          <rect x={WALL_X - 8} y={DOOR_Y} width={16} height={20} rx={2}
            fill="none"
            stroke={phase === 'through' || flanking ? verse.palette.accent : verse.palette.primary}
            strokeWidth={0.8}
            opacity={safeOpacity(flanking || phase === 'through' ? 0.3 : 0.08)} />
          {(flanking || phase === 'through') && (
            <text x={WALL_X} y={DOOR_Y + 13} textAnchor="middle"
              fill={verse.palette.accent} style={{ fontSize: '7px' }} opacity={0.4}>
              weak
            </text>
          )}

          {/* You (dot that moves) */}
          <motion.circle
            r={8}
            fill={phase === 'through' ? verse.palette.accent : verse.palette.primary}
            animate={{
              cx: phase === 'through' ? WALL_X + 30
                : flanking ? WALL_X - 10
                  : YOU_START,
              cy: phase === 'through' ? DOOR_Y + 10
                : flanking ? DOOR_Y + 10
                  : (WALL_Y1 + WALL_Y2) / 2,
              opacity: safeOpacity(phase === 'through' ? 0.25 : 0.12),
            }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Direct attack line (failed) */}
          {phase === 'hit' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
            >
              <line x1={YOU_START + 8} y1={(WALL_Y1 + WALL_Y2) / 2}
                x2={WALL_X - 5} y2={(WALL_Y1 + WALL_Y2) / 2}
                stroke={verse.palette.shadow} strokeWidth={1}
                strokeDasharray="3 3" />
              {/* Impact X */}
              <text x={WALL_X - 12} y={(WALL_Y1 + WALL_Y2) / 2 + 4}
                fill={verse.palette.shadow} style={{ fontSize: '14px' }}>
                x
              </text>
            </motion.g>
          )}

          {/* Flank path (curved arrow going around) */}
          {(flanking || phase === 'through') && (
            <motion.path
              d={`M ${YOU_START},${(WALL_Y1 + WALL_Y2) / 2} Q ${YOU_START - 20},${WALL_Y2 + 20} ${WALL_X - 15},${DOOR_Y + 10}`}
              fill="none"
              stroke={verse.palette.accent}
              strokeWidth={1}
              strokeDasharray="4 3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: safeOpacity(0.2) }}
              transition={{ duration: 0.8 }}
            />
          )}

          {/* Through indicator */}
          {phase === 'through' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* Arrow showing passage through */}
              <line x1={WALL_X + 8} y1={DOOR_Y + 10}
                x2={WALL_X + 25} y2={DOOR_Y + 10}
                stroke={verse.palette.accent} strokeWidth={1}
                opacity={safeOpacity(0.3)} />

              <text x={CX} y={H - 5} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.micro}
                opacity={0.5}>
                the open door was always there
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      {phase === 'wall' && (
        <motion.button style={{ ...btn.base, opacity: 0.5 }} whileTap={btn.active} onClick={handleHit}>
          attack head-on
        </motion.button>
      )}

      {phase === 'think' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleFlank}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          go around
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'through' ? 'the indirect approach. through the weakness.'
          : flanking ? 'around the side...'
            : phase === 'think' ? 'direct attack failed. look for another way.'
              : phase === 'hit' ? 'blocked. the wall holds.'
                : 'a thick wall. the direct path.'}
      </span>

      {phase === 'through' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          indirect approach
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'through' ? 'lateral thinking' : 'attack the weakness'}
      </div>
    </div>
  );
}
