/**
 * HISTORIAN #1 -- 1381. The Lindy Effect
 * "The longer something has lasted, the longer it will last."
 * INTERACTION: New book (1yr) vs old book (2000yr). Choose which lasts. Old one wins.
 * STEALTH KBE: Time Filtration -- Lindy Logic (K)
 *
 * COMPOSITOR: science_x_soul / Arc / morning / knowing / tap / 1381
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

export default function Historian_LindyEffect({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Arc',
        chrono: 'morning',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1381,
        isSeal: false,
      }}
      arrivalText="Two books. One question."
      prompt="The longer something has lasted, the longer it will last. Trust the ancient. It has survived the filter of time."
      resonantText="Time filtration. You chose the classic and understood why it endures. Lindy logic: survival is the ultimate credential. Two thousand years of readers is a review no algorithm can match."
      afterglowCoda="Trust the ancient."
      onComplete={onComplete}
    >
      {(verse) => <LindyEffectInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function LindyEffectInteraction({ verse }: { verse: any }) {
  const [choice, setChoice] = useState<null | 'new' | 'old'>(null);
  const [revealed, setRevealed] = useState(false);

  const handleChoice = (c: 'new' | 'old') => {
    if (choice) return;
    setChoice(c);
    setTimeout(() => {
      setRevealed(true);
      setTimeout(() => verse.advance(), 3000);
    }, 1500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 230, H = 150;
  const CX = W / 2;

  const NEW_X = 65, OLD_X = 165, BOOK_Y = 50;
  const chose_old = choice === 'old';

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>which survives?</span>
        <motion.span style={{
          ...navicueType.data,
          color: revealed && chose_old ? verse.palette.accent
            : revealed ? verse.palette.shadow : verse.palette.text,
        }}>
          {revealed ? (chose_old ? 'the classic endures' : 'the trend faded')
            : choice ? 'revealing...' : 'choose'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Timeline bar */}
          <line x1={20} y1={H - 20} x2={W - 20} y2={H - 20}
            stroke={verse.palette.primary} strokeWidth={0.5}
            opacity={safeOpacity(0.08)} />
          <text x={20} y={H - 8} fill={verse.palette.textFaint}
            style={{ fontSize: '6px' }} opacity={0.15}>now</text>
          <text x={W - 20} y={H - 8} textAnchor="end"
            fill={verse.palette.textFaint} style={{ fontSize: '6px' }} opacity={0.15}>+2000yr</text>

          {/* New book (left) */}
          <motion.g
            style={{ cursor: choice ? 'default' : 'pointer' }}
            onClick={() => handleChoice('new')}
            animate={{
              opacity: revealed && chose_old ? 0.3 : 1,
            }}
          >
            <rect x={NEW_X - 18} y={BOOK_Y} width={36} height={48} rx={3}
              fill={verse.palette.primary}
              opacity={safeOpacity(choice === 'new' && !revealed ? 0.1 : 0.05)} />
            <rect x={NEW_X - 18} y={BOOK_Y} width={36} height={48} rx={3}
              fill="none" stroke={verse.palette.primary}
              strokeWidth={1} opacity={safeOpacity(0.12)} />
            {/* Spine */}
            <line x1={NEW_X - 15} y1={BOOK_Y + 3} x2={NEW_X - 15} y2={BOOK_Y + 45}
              stroke={verse.palette.primary} strokeWidth={1.5}
              opacity={safeOpacity(0.08)} />
            {/* Title lines */}
            {[0, 1, 2].map(i => (
              <line key={i} x1={NEW_X - 8} y1={BOOK_Y + 14 + i * 8}
                x2={NEW_X + 12} y2={BOOK_Y + 14 + i * 8}
                stroke={verse.palette.primary} strokeWidth={0.5}
                opacity={safeOpacity(0.06)} />
            ))}
            <text x={NEW_X} y={BOOK_Y - 5} textAnchor="middle"
              fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}>
              1 year old
            </text>
            <text x={NEW_X} y={BOOK_Y + 60} textAnchor="middle"
              fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.18}>
              the trend
            </text>

            {/* Fade indicator when revealed wrong */}
            {revealed && !chose_old && (
              <motion.text x={NEW_X} y={BOOK_Y + 25} textAnchor="middle"
                fill={verse.palette.shadow} style={{ fontSize: '9px' }}
                initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}>
                faded
              </motion.text>
            )}
          </motion.g>

          {/* Old book (right) */}
          <motion.g
            style={{ cursor: choice ? 'default' : 'pointer' }}
            onClick={() => handleChoice('old')}
            animate={{
              opacity: revealed && !chose_old ? 0.3 : 1,
            }}
          >
            <rect x={OLD_X - 18} y={BOOK_Y} width={36} height={48} rx={3}
              fill={revealed && chose_old ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(revealed && chose_old ? 0.1 : 0.05)} />
            <rect x={OLD_X - 18} y={BOOK_Y} width={36} height={48} rx={3}
              fill="none"
              stroke={revealed && chose_old ? verse.palette.accent : verse.palette.primary}
              strokeWidth={1}
              opacity={safeOpacity(revealed && chose_old ? 0.25 : 0.12)} />
            <line x1={OLD_X - 15} y1={BOOK_Y + 3} x2={OLD_X - 15} y2={BOOK_Y + 45}
              stroke={revealed && chose_old ? verse.palette.accent : verse.palette.primary}
              strokeWidth={1.5} opacity={safeOpacity(0.1)} />
            {[0, 1, 2, 3].map(i => (
              <line key={i} x1={OLD_X - 8} y1={BOOK_Y + 12 + i * 7}
                x2={OLD_X + 12} y2={BOOK_Y + 12 + i * 7}
                stroke={verse.palette.primary} strokeWidth={0.5}
                opacity={safeOpacity(0.06)} />
            ))}
            <text x={OLD_X} y={BOOK_Y - 5} textAnchor="middle"
              fill={revealed && chose_old ? verse.palette.accent : verse.palette.textFaint}
              style={{ fontSize: '7px' }} opacity={revealed && chose_old ? 0.5 : 0.2}>
              2,000 years old
            </text>
            <text x={OLD_X} y={BOOK_Y + 60} textAnchor="middle"
              fill={revealed && chose_old ? verse.palette.accent : verse.palette.textFaint}
              style={{ fontSize: '7px' }} opacity={0.18}>
              the classic
            </text>

            {/* Endure indicator */}
            {revealed && chose_old && (
              <motion.text x={OLD_X} y={BOOK_Y + 25} textAnchor="middle"
                fill={verse.palette.accent} style={{ fontSize: '9px' }}
                initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}>
                endures
              </motion.text>
            )}
          </motion.g>

          {/* Lindy projection line (old book extends into future) */}
          {revealed && chose_old && (
            <motion.line
              x1={OLD_X} y1={H - 25} x2={W - 25} y2={H - 25}
              stroke={verse.palette.accent} strokeWidth={2}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: safeOpacity(0.2) }}
              transition={{ duration: 0.8 }}
            />
          )}

          {/* VS */}
          {!choice && (
            <text x={CX} y={BOOK_Y + 28} textAnchor="middle"
              fill={verse.palette.textFaint} style={{ fontSize: '9px' }} opacity={0.15}>
              vs
            </text>
          )}

          {/* Result */}
          {revealed && chose_old && (
            <motion.text x={CX} y={H - 5} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}>
              survival is the ultimate credential
            </motion.text>
          )}
        </svg>
      </div>

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {revealed ? (chose_old
          ? 'two thousand years of readers is a review no algorithm can match.'
          : 'the trend faded. the classic survived.')
          : 'which book will last another 2,000 years?'}
      </span>

      {revealed && chose_old && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          lindy logic
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {revealed && chose_old ? 'time filtration' : 'trust the filter of time'}
      </div>
    </div>
  );
}
