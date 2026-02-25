/**
 * ECONOMIST #1 -- 1341. The Opportunity Cost
 * "Always calculate the invisible cost."
 * INTERACTION: Two doors. Choose Party. See the degree you lost.
 * STEALTH KBE: Trade-off Analysis -- Opportunity Cost Awareness (K)
 *
 * COMPOSITOR: koan_paradox / Arc / work / knowing / tap / 1341
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Economist_OpportunityCost({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Arc',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1341,
        isSeal: false,
      }}
      arrivalText="Two doors. Both free."
      prompt="Nothing is free. The cost of the party is the study you did not do. Always calculate the invisible cost."
      resonantText="Trade-off analysis. The party cost nothing in dollars and everything in trajectory. Opportunity cost awareness is the discipline of seeing the invisible price tag on every choice you make."
      afterglowCoda="Calculate the invisible cost."
      onComplete={onComplete}
    >
      {(verse) => <OpportunityCostInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function OpportunityCostInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'doors' | 'chose' | 'reveal' | 'aware'>('doors');

  const handleChooseParty = () => {
    if (phase !== 'doors') return;
    setPhase('chose');
    setTimeout(() => {
      setPhase('reveal');
      setTimeout(() => {
        setPhase('aware');
        setTimeout(() => verse.advance(), 3000);
      }, 2000);
    }, 1000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 160;
  const CX = W / 2;

  const DOOR_W = 50, DOOR_H = 80;
  const DOOR_Y = 25;
  const LEFT_X = CX - 45;
  const RIGHT_X = CX + 45;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>price</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'aware' ? verse.palette.accent
            : phase === 'reveal' ? verse.palette.shadow : verse.palette.text,
        }}>
          {phase === 'aware' ? 'visible now'
            : phase === 'reveal' ? 'a degree'
              : phase === 'chose' ? '$0'
                : '$0 each'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Left door: Party */}
          <motion.g
            animate={{
              opacity: phase === 'chose' || phase === 'reveal' || phase === 'aware' ? 1 : 1,
            }}
          >
            <rect x={LEFT_X - DOOR_W / 2} y={DOOR_Y} width={DOOR_W} height={DOOR_H} rx={3}
              fill={phase === 'chose' || phase === 'reveal' || phase === 'aware'
                ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(phase === 'chose' ? 0.12 : 0.06)} />
            <rect x={LEFT_X - DOOR_W / 2} y={DOOR_Y} width={DOOR_W} height={DOOR_H} rx={3}
              fill="none"
              stroke={phase === 'chose' || phase === 'reveal' || phase === 'aware'
                ? verse.palette.accent : verse.palette.primary}
              strokeWidth={1}
              opacity={safeOpacity(0.2)} />
            {/* Doorknob */}
            <circle cx={LEFT_X + DOOR_W / 2 - 8} cy={DOOR_Y + DOOR_H / 2} r={2.5}
              fill={verse.palette.primary} opacity={safeOpacity(0.15)} />
            {/* Label */}
            <text x={LEFT_X} y={DOOR_Y + DOOR_H / 2 - 5} textAnchor="middle"
              fill={verse.palette.text} style={{ fontSize: '11px' }}
              opacity={0.3}>
              party
            </text>
            <text x={LEFT_X} y={DOOR_Y + DOOR_H / 2 + 10} textAnchor="middle"
              fill={verse.palette.textFaint} style={{ fontSize: '8px' }}
              opacity={0.2}>
              $0
            </text>
          </motion.g>

          {/* Right door: Study */}
          <motion.g
            animate={{
              opacity: phase === 'reveal' || phase === 'aware' ? 0.4 : 1,
            }}
            transition={{ duration: 0.5 }}
          >
            <rect x={RIGHT_X - DOOR_W / 2} y={DOOR_Y} width={DOOR_W} height={DOOR_H} rx={3}
              fill={verse.palette.primary} opacity={safeOpacity(0.06)} />
            <rect x={RIGHT_X - DOOR_W / 2} y={DOOR_Y} width={DOOR_W} height={DOOR_H} rx={3}
              fill="none" stroke={verse.palette.primary}
              strokeWidth={1} opacity={safeOpacity(0.2)} />
            <circle cx={RIGHT_X - DOOR_W / 2 + 8} cy={DOOR_Y + DOOR_H / 2} r={2.5}
              fill={verse.palette.primary} opacity={safeOpacity(0.15)} />
            <text x={RIGHT_X} y={DOOR_Y + DOOR_H / 2 - 5} textAnchor="middle"
              fill={verse.palette.text} style={{ fontSize: '11px' }}
              opacity={phase === 'reveal' || phase === 'aware' ? 0.15 : 0.3}>
              study
            </text>
            <text x={RIGHT_X} y={DOOR_Y + DOOR_H / 2 + 10} textAnchor="middle"
              fill={verse.palette.textFaint} style={{ fontSize: '8px' }}
              opacity={0.2}>
              $0
            </text>
          </motion.g>

          {/* The invisible cost reveal */}
          {(phase === 'reveal' || phase === 'aware') && (
            <motion.g
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Cost arrow from right door */}
              <line x1={RIGHT_X} y1={DOOR_Y + DOOR_H + 5}
                x2={RIGHT_X} y2={DOOR_Y + DOOR_H + 25}
                stroke={verse.palette.shadow} strokeWidth={0.5}
                strokeDasharray="3 2" opacity={safeOpacity(0.2)} />

              <text x={CX} y={DOOR_Y + DOOR_H + 22} textAnchor="middle"
                fill={verse.palette.shadow} style={{ fontSize: '9px' }}
                opacity={0.4}>
                cost: a degree
              </text>

              {/* Ghost of the unchosen path */}
              <rect x={RIGHT_X - DOOR_W / 2} y={DOOR_Y} width={DOOR_W} height={DOOR_H} rx={3}
                fill="none" stroke={verse.palette.shadow}
                strokeWidth={0.5} strokeDasharray="4 3"
                opacity={safeOpacity(0.12)} />
            </motion.g>
          )}

          {/* Awareness frame */}
          {phase === 'aware' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <text x={CX} y={H - 5} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.micro}
                opacity={0.5}>
                the invisible price tag
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      {phase === 'doors' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleChooseParty}>
          choose party
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'aware' ? 'nothing is free. you see the cost now.'
          : phase === 'reveal' ? 'the party cost a degree.'
            : phase === 'chose' ? 'you chose party. it was free...'
              : 'two doors. both cost $0.'}
      </span>

      {phase === 'aware' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          opportunity cost awareness
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'aware' ? 'trade-off analysis' : 'calculate the invisible cost'}
      </div>
    </div>
  );
}
