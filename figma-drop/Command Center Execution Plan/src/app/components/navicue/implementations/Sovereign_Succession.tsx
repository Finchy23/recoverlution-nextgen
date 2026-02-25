/**
 * SOVEREIGN #6 -- 1376. The Succession (Future Self)
 * "Rule so that the heir inherits a rich kingdom."
 * INTERACTION: Old king. Young prince. Teach the prince. Prepare the heir.
 * STEALTH KBE: Future Orientation -- Intertemporal Choice (K)
 *
 * COMPOSITOR: science_x_soul / Arc / work / knowing / tap / 1376
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

export default function Sovereign_Succession({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Arc',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1376,
        isSeal: false,
      }}
      arrivalText="The king is old. The prince is young."
      prompt="You are ruling for the next version of you. Rule so that the heir inherits a rich kingdom, not a debt."
      resonantText="Future orientation. You saved resources for the heir and the next version of you inherited strength. Intertemporal choice: the wisest king rules for the one who comes after."
      afterglowCoda="Prepare the heir."
      onComplete={onComplete}
    >
      {(verse) => <SuccessionInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SuccessionInteraction({ verse }: { verse: any }) {
  const [gifts, setGifts] = useState(0);
  const [done, setDone] = useState(false);
  const TARGET = 4;

  const LESSONS = ['discipline', 'patience', 'courage', 'wisdom'];

  const handleTeach = () => {
    if (done || gifts >= TARGET) return;
    const next = gifts + 1;
    setGifts(next);
    if (next >= TARGET) {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 155;
  const CX = W / 2;

  const KING_X = 60, PRINCE_X = 160, FIG_Y = 65;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>heir</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.text,
        }}>
          {done ? 'prepared' : `${gifts} / ${TARGET} lessons`}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* King (old, fading) */}
          <motion.g
            animate={{ opacity: done ? 0.3 : 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Crown */}
            <path
              d={`M ${KING_X - 8},${FIG_Y - 22} L ${KING_X - 6},${FIG_Y - 30} L ${KING_X - 2},${FIG_Y - 24} L ${KING_X},${FIG_Y - 32} L ${KING_X + 2},${FIG_Y - 24} L ${KING_X + 6},${FIG_Y - 30} L ${KING_X + 8},${FIG_Y - 22} Z`}
              fill={verse.palette.primary} opacity={safeOpacity(0.1)}
            />
            {/* Head */}
            <circle cx={KING_X} cy={FIG_Y - 12} r={8}
              fill={verse.palette.primary} opacity={safeOpacity(0.08)} />
            {/* Body */}
            <line x1={KING_X} y1={FIG_Y - 4} x2={KING_X} y2={FIG_Y + 15}
              stroke={verse.palette.primary} strokeWidth={2}
              opacity={safeOpacity(0.1)} />
            {/* Walking stick */}
            <line x1={KING_X + 12} y1={FIG_Y - 5} x2={KING_X + 14} y2={FIG_Y + 20}
              stroke={verse.palette.primary} strokeWidth={1}
              opacity={safeOpacity(0.08)} />
            <text x={KING_X} y={FIG_Y + 32} textAnchor="middle"
              fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}>
              the king (you)
            </text>
          </motion.g>

          {/* Prince (young, growing) */}
          <motion.g
            animate={{
              scale: done ? 1.15 : 1,
            }}
            style={{ transformOrigin: `${PRINCE_X}px ${FIG_Y}px` }}
          >
            {/* Head */}
            <circle cx={PRINCE_X} cy={FIG_Y - 5} r={6}
              fill={done ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(done ? 0.2 : 0.06)} />
            {/* Body */}
            <line x1={PRINCE_X} y1={FIG_Y + 1} x2={PRINCE_X} y2={FIG_Y + 15}
              stroke={done ? verse.palette.accent : verse.palette.primary}
              strokeWidth={1.5}
              opacity={safeOpacity(done ? 0.25 : 0.1)} />
            <text x={PRINCE_X} y={FIG_Y + 32} textAnchor="middle"
              fill={done ? verse.palette.accent : verse.palette.textFaint}
              style={{ fontSize: '7px' }}
              opacity={done ? 0.4 : 0.2}>
              the heir (future you)
            </text>

            {/* Crown transfers when done */}
            {done && (
              <motion.path
                d={`M ${PRINCE_X - 6},${FIG_Y - 15} L ${PRINCE_X - 4},${FIG_Y - 21} L ${PRINCE_X - 1},${FIG_Y - 17} L ${PRINCE_X},${FIG_Y - 23} L ${PRINCE_X + 1},${FIG_Y - 17} L ${PRINCE_X + 4},${FIG_Y - 21} L ${PRINCE_X + 6},${FIG_Y - 15} Z`}
                fill={verse.palette.accent}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: safeOpacity(0.2), y: 0 }}
                transition={{ delay: 0.3 }}
              />
            )}
          </motion.g>

          {/* Teaching arrow */}
          <motion.line
            x1={KING_X + 15} y1={FIG_Y}
            x2={PRINCE_X - 15} y2={FIG_Y}
            stroke={done ? verse.palette.accent : verse.palette.primary}
            strokeWidth={0.8}
            strokeDasharray="4 3"
            animate={{
              opacity: safeOpacity(gifts > 0 ? 0.15 : 0.05),
            }}
          />

          {/* Lesson dots (along the arrow) */}
          {LESSONS.slice(0, gifts).map((lesson, i) => {
            const t = (i + 1) / (TARGET + 1);
            const lx = KING_X + 15 + t * (PRINCE_X - KING_X - 30);
            return (
              <motion.g key={lesson}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <circle cx={lx} cy={FIG_Y} r={4}
                  fill={verse.palette.accent} opacity={safeOpacity(0.15)} />
                <text x={lx} y={FIG_Y + 14} textAnchor="middle"
                  fill={verse.palette.accent} style={{ fontSize: '6px' }}
                  opacity={0.3}>
                  {lesson}
                </text>
              </motion.g>
            );
          })}

          {/* Succession text */}
          {done && (
            <motion.text
              x={CX} y={H - 5} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}
            >
              the heir inherits a rich kingdom
            </motion.text>
          )}
        </svg>
      </div>

      {!done && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleTeach}>
          teach: {LESSONS[gifts] || 'complete'}
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'the next version of you inherits strength.'
          : gifts > 0 ? `${LESSONS[gifts - 1]} taught. ${TARGET - gifts} remain.`
            : 'the prince needs your wisdom.'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          intertemporal choice
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'future orientation' : 'rule for the next version'}
      </div>
    </div>
  );
}
