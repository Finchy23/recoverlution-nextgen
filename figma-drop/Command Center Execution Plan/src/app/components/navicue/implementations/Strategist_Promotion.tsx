/**
 * STRATEGIST #9 -- 1309. The Promotion
 * "The smallest piece has the highest potential."
 * INTERACTION: Tap to march the pawn forward rank by rank -- flash at the end = queen
 * STEALTH KBE: Growth -- Self-Actualization (E)
 *
 * COMPOSITOR: sacred_ordinary / Arc / morning / embodying / tap / 1309
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

export default function Strategist_Promotion({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Arc',
        chrono: 'morning',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1309,
        isSeal: false,
      }}
      arrivalText="A pawn. Row two."
      prompt="The smallest piece has the highest potential. Just keep moving forward. The crown is waiting at the edge of the board."
      resonantText="Growth. The pawn reached the eighth rank and became a queen. Self-actualization is the promotion that comes from showing up, step by step, until the board has no choice but to crown you."
      afterglowCoda="Keep moving forward."
      onComplete={onComplete}
    >
      {(verse) => <PromotionInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function PromotionInteraction({ verse }: { verse: any }) {
  const [rank, setRank] = useState(2); // start at rank 2
  const [promoted, setPromoted] = useState(false);
  const TARGET_RANK = 8;

  const handleAdvance = () => {
    if (promoted) return;
    const next = rank + 1;
    setRank(next);
    if (next >= TARGET_RANK) {
      setPromoted(true);
      setTimeout(() => verse.advance(), 3500);
    }
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 200, H = 210;
  const BOARD_X = 70, BOARD_W = 60;
  const BOARD_TOP = 20, BOARD_BOT = 190;
  const RANK_H = (BOARD_BOT - BOARD_TOP) / 8;

  // Pawn Y position (rank 1 = bottom, rank 8 = top)
  const pawnY = BOARD_BOT - (rank - 0.5) * RANK_H;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      {/* Rank readout */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>rank</span>
        <motion.span style={{
          ...navicueType.data,
          color: promoted ? verse.palette.accent : verse.palette.text,
        }}>
          {promoted ? 'queen' : `${rank}/8`}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Board column (single file) */}
          {Array.from({ length: 8 }).map((_, i) => {
            const y = BOARD_TOP + i * RANK_H;
            const isDark = i % 2 === 0;
            const rankNum = 8 - i;
            const isPassed = rankNum <= rank;

            return (
              <g key={i}>
                <rect x={BOARD_X} y={y} width={BOARD_W} height={RANK_H}
                  fill={isDark ? verse.palette.primary : 'transparent'}
                  opacity={safeOpacity(isDark ? 0.06 : 0)} />
                <rect x={BOARD_X} y={y} width={BOARD_W} height={RANK_H}
                  fill="none" stroke={verse.palette.primary}
                  strokeWidth={0.3} opacity={safeOpacity(0.08)} />

                {/* Rank label */}
                <text x={BOARD_X - 10} y={y + RANK_H / 2 + 3}
                  textAnchor="middle"
                  fill={rankNum === rank ? verse.palette.accent : verse.palette.textFaint}
                  style={{ fontSize: '9px' }}
                  opacity={rankNum === rank ? 0.6 : 0.2}>
                  {rankNum}
                </text>

                {/* Trail marker */}
                {isPassed && rankNum < rank && (
                  <motion.circle
                    cx={BOARD_X + BOARD_W / 2} cy={y + RANK_H / 2}
                    r={2} fill={verse.palette.accent}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: safeOpacity(0.1) }}
                  />
                )}
              </g>
            );
          })}

          {/* Promotion zone glow (rank 8) */}
          <rect x={BOARD_X} y={BOARD_TOP} width={BOARD_W} height={RANK_H}
            fill={verse.palette.accent}
            opacity={safeOpacity(promoted ? 0.15 : 0.03)} />

          {/* Crown icon at rank 8 */}
          {!promoted && (
            <motion.g
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <path
                d={`M ${BOARD_X + BOARD_W / 2 - 8},${BOARD_TOP + RANK_H - 5}
                    L ${BOARD_X + BOARD_W / 2 - 10},${BOARD_TOP + 8}
                    L ${BOARD_X + BOARD_W / 2 - 4},${BOARD_TOP + 14}
                    L ${BOARD_X + BOARD_W / 2},${BOARD_TOP + 6}
                    L ${BOARD_X + BOARD_W / 2 + 4},${BOARD_TOP + 14}
                    L ${BOARD_X + BOARD_W / 2 + 10},${BOARD_TOP + 8}
                    L ${BOARD_X + BOARD_W / 2 + 8},${BOARD_TOP + RANK_H - 5} Z`}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.5} />
            </motion.g>
          )}

          {/* The pawn */}
          <motion.g
            animate={{ y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.circle
              cx={BOARD_X + BOARD_W / 2} r={promoted ? 14 : 10}
              fill={verse.palette.accent}
              animate={{
                cy: pawnY,
                opacity: safeOpacity(promoted ? 0.25 : 0.15),
              }}
              transition={{ duration: 0.3 }}
            />
            <motion.circle
              cx={BOARD_X + BOARD_W / 2} r={promoted ? 14 : 10}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={promoted ? 1.5 : 1}
              animate={{
                cy: pawnY,
                opacity: safeOpacity(promoted ? 0.5 : 0.35),
              }}
              transition={{ duration: 0.3 }}
            />
            <motion.text
              x={BOARD_X + BOARD_W / 2} textAnchor="middle"
              fill={verse.palette.accent}
              style={{ fontSize: promoted ? '14px' : '11px' }}
              animate={{
                y: pawnY + 4,
                opacity: promoted ? 0.7 : 0.5,
              }}
              transition={{ duration: 0.3 }}
            >
              {promoted ? 'Q' : 'P'}
            </motion.text>
          </motion.g>

          {/* Promotion flash */}
          {promoted && (
            <motion.circle
              cx={BOARD_X + BOARD_W / 2} cy={pawnY} r={25}
              fill={verse.palette.accent}
              initial={{ opacity: 0.3, scale: 0.5 }}
              animate={{ opacity: 0, scale: 2 }}
              transition={{ duration: 0.8 }}
            />
          )}

          {/* Progress bar on right */}
          <rect x={BOARD_X + BOARD_W + 15} y={BOARD_TOP}
            width={4} height={BOARD_BOT - BOARD_TOP} rx={2}
            fill={verse.palette.primary} opacity={safeOpacity(0.06)} />
          <motion.rect
            x={BOARD_X + BOARD_W + 15}
            width={4} rx={2}
            fill={verse.palette.accent}
            animate={{
              y: BOARD_BOT - ((rank - 1) / 7) * (BOARD_BOT - BOARD_TOP),
              height: ((rank - 1) / 7) * (BOARD_BOT - BOARD_TOP),
              opacity: safeOpacity(promoted ? 0.4 : 0.2),
            }}
            transition={{ duration: 0.3 }}
          />
        </svg>
      </div>

      {!promoted && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleAdvance}>
          advance
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {promoted ? 'transformation. the pawn became a queen.'
          : `${TARGET_RANK - rank} ranks to the crown`}
      </span>

      {promoted && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          self-actualization
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {promoted ? 'growth' : 'keep moving forward'}
      </div>
    </div>
  );
}
