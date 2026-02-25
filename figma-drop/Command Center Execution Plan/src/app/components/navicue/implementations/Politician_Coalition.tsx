/**
 * POLITICIAN #1 -- 1351. The Coalition (The Majority)
 * "A coalition of three weak players beats one strong player."
 * INTERACTION: You are 1 vote. Align with 2 others. Become 3. Majority wins.
 * STEALTH KBE: Alliance Building -- Pragmatism (K)
 *
 * COMPOSITOR: poetic_precision / Lattice / work / knowing / tap / 1351
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

export default function Politician_Coalition({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Lattice',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1351,
        isSeal: false,
      }}
      arrivalText="One vote. Alone."
      prompt="You cannot win alone. Find the common interest. Build the block. A coalition of three weak players beats one strong player."
      resonantText="Alliance building. You aligned with former rivals and formed a majority. Pragmatism: ideology divides, interest unites. The winning move is always to count the votes before you fight."
      afterglowCoda="Build the block."
      onComplete={onComplete}
    >
      {(verse) => <CoalitionInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function CoalitionInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'alone' | 'seeking' | 'aligned' | 'majority'>('alone');

  const handleSeek = () => {
    if (phase !== 'alone') return;
    setPhase('seeking');
  };

  const handleAlign = () => {
    if (phase !== 'seeking') return;
    setPhase('aligned');
    setTimeout(() => {
      setPhase('majority');
      setTimeout(() => verse.advance(), 3000);
    }, 1500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 160;
  const CX = W / 2, CY = H / 2;

  // Player positions
  const YOU = { x: CX, y: CY + 30 };
  const ALLY_A = { x: CX - 50, y: CY - 15 };
  const ALLY_B = { x: CX + 50, y: CY - 15 };
  const OPPONENT = { x: CX, y: 25 };

  const aligned = phase === 'aligned' || phase === 'majority';

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>votes</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'majority' ? verse.palette.accent
            : aligned ? verse.palette.text : verse.palette.shadow,
        }}>
          {phase === 'majority' ? '3 / 5 (majority)'
            : aligned ? '3 / 5'
              : phase === 'seeking' ? '1 / 5'
                : '1 / 5 (weak)'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Opponent (strong, 2 votes) */}
          <g>
            <circle cx={OPPONENT.x} cy={OPPONENT.y} r={16}
              fill={verse.palette.primary}
              opacity={safeOpacity(phase === 'majority' ? 0.05 : 0.1)} />
            <circle cx={OPPONENT.x} cy={OPPONENT.y} r={16}
              fill="none" stroke={verse.palette.primary}
              strokeWidth={1} opacity={safeOpacity(0.15)} />
            <text x={OPPONENT.x} y={OPPONENT.y + 3} textAnchor="middle"
              fill={verse.palette.text} style={{ fontSize: '11px' }}
              opacity={phase === 'majority' ? 0.15 : 0.25}>
              2
            </text>
            <text x={OPPONENT.x} y={OPPONENT.y + 28} textAnchor="middle"
              fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}>
              strong player
            </text>
          </g>

          {/* You (1 vote) */}
          <motion.g
            animate={{
              y: aligned ? -10 : 0,
            }}
            transition={{ duration: 0.4 }}
          >
            <circle cx={YOU.x} cy={YOU.y} r={12}
              fill={aligned ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(aligned ? 0.15 : 0.08)} />
            <circle cx={YOU.x} cy={YOU.y} r={12}
              fill="none"
              stroke={aligned ? verse.palette.accent : verse.palette.primary}
              strokeWidth={1}
              opacity={safeOpacity(aligned ? 0.3 : 0.15)} />
            <text x={YOU.x} y={YOU.y + 3} textAnchor="middle"
              fill={aligned ? verse.palette.accent : verse.palette.text}
              style={{ fontSize: '11px' }} opacity={aligned ? 0.5 : 0.25}>
              1
            </text>
            <text x={YOU.x} y={YOU.y + 22} textAnchor="middle"
              fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}>
              you
            </text>
          </motion.g>

          {/* Ally A */}
          <motion.g
            animate={{
              x: aligned ? 15 : 0,
              y: aligned ? 5 : 0,
            }}
            transition={{ duration: 0.5 }}
          >
            <circle cx={ALLY_A.x} cy={ALLY_A.y} r={12}
              fill={aligned ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(aligned ? 0.12 : 0.06)} />
            <circle cx={ALLY_A.x} cy={ALLY_A.y} r={12}
              fill="none"
              stroke={phase === 'seeking' || aligned ? verse.palette.accent : verse.palette.primary}
              strokeWidth={phase === 'seeking' ? 0.5 : 1}
              strokeDasharray={phase === 'seeking' ? '3 3' : 'none'}
              opacity={safeOpacity(aligned ? 0.25 : 0.12)} />
            <text x={ALLY_A.x} y={ALLY_A.y + 3} textAnchor="middle"
              fill={verse.palette.text} style={{ fontSize: '11px' }} opacity={0.2}>
              1
            </text>
          </motion.g>

          {/* Ally B */}
          <motion.g
            animate={{
              x: aligned ? -15 : 0,
              y: aligned ? 5 : 0,
            }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <circle cx={ALLY_B.x} cy={ALLY_B.y} r={12}
              fill={aligned ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(aligned ? 0.12 : 0.06)} />
            <circle cx={ALLY_B.x} cy={ALLY_B.y} r={12}
              fill="none"
              stroke={phase === 'seeking' || aligned ? verse.palette.accent : verse.palette.primary}
              strokeWidth={phase === 'seeking' ? 0.5 : 1}
              strokeDasharray={phase === 'seeking' ? '3 3' : 'none'}
              opacity={safeOpacity(aligned ? 0.25 : 0.12)} />
            <text x={ALLY_B.x} y={ALLY_B.y + 3} textAnchor="middle"
              fill={verse.palette.text} style={{ fontSize: '11px' }} opacity={0.2}>
              1
            </text>
          </motion.g>

          {/* Coalition lines */}
          {aligned && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.2) }}
              transition={{ duration: 0.4 }}
            >
              <line x1={YOU.x} y1={YOU.y - 10} x2={ALLY_A.x + 15} y2={ALLY_A.y + 5}
                stroke={verse.palette.accent} strokeWidth={1} />
              <line x1={YOU.x} y1={YOU.y - 10} x2={ALLY_B.x - 15} y2={ALLY_B.y + 5}
                stroke={verse.palette.accent} strokeWidth={1} />
              <line x1={ALLY_A.x + 15} y1={ALLY_A.y + 5} x2={ALLY_B.x - 15} y2={ALLY_B.y + 5}
                stroke={verse.palette.accent} strokeWidth={1} />
            </motion.g>
          )}

          {/* Coalition bracket */}
          {phase === 'majority' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.3 }}
            >
              <text x={CX} y={H - 5} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.micro}>
                majority wins
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      {phase === 'alone' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleSeek}>
          seek allies
        </motion.button>
      )}

      {phase === 'seeking' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleAlign}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          align (common interest)
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'majority' ? 'three weak players beat one strong player.'
          : aligned ? 'coalition formed. counting votes...'
            : phase === 'seeking' ? 'two others. former rivals. shared interest.'
              : 'one vote. alone against two.'}
      </span>

      {phase === 'majority' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          pragmatism
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'majority' ? 'alliance building' : 'find the common interest'}
      </div>
    </div>
  );
}
