/**
 * WEAVER PATTERN #9 -- 1289. The Invisible String
 * "Distance is physical. Connection is quantum."
 * INTERACTION: Tap to pull the string -- it tugs back from off-screen
 * STEALTH KBE: Connection -- Relational Permanence (E)
 *
 * COMPOSITOR: witness_ritual / Drift / night / embodying / tap / 1289
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

export default function WeaverPattern_InvisibleString({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Drift',
        chrono: 'night',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1289,
        isSeal: false,
      }}
      arrivalText="Alone. A thin string in your hand."
      prompt="Distance is physical. Connection is quantum. You are tethered to everyone you have ever loved. Tug the line."
      resonantText="Connection. You pulled the string and it pulled back. Relational permanence is the invisible thread that does not break with distance, time, or silence. The tug proves the bond."
      afterglowCoda="Tug the line."
      onComplete={onComplete}
    >
      {(verse) => <InvisibleStringInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function InvisibleStringInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'alone' | 'pulling' | 'tugback' | 'done'>('alone');

  const handlePull = () => {
    if (phase !== 'alone') return;
    setPhase('pulling');
    setTimeout(() => {
      setPhase('tugback');
      setTimeout(() => {
        setPhase('done');
        setTimeout(() => verse.advance(), 2800);
      }, 1200);
    }, 1000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 280, H = 140;
  const HAND_X = 50, HAND_Y = H / 2;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* The string */}
          <motion.path
            fill="none"
            stroke={verse.palette.accent}
            strokeLinecap="round"
            animate={{
              d: phase === 'pulling'
                ? `M ${HAND_X - 10},${HAND_Y} Q ${HAND_X + 40},${HAND_Y + 5} ${W + 20},${HAND_Y}`
                : phase === 'tugback'
                  ? `M ${HAND_X + 8},${HAND_Y} Q ${HAND_X + 80},${HAND_Y - 10} ${W + 20},${HAND_Y}`
                  : phase === 'done'
                    ? `M ${HAND_X},${HAND_Y} Q ${W / 2},${HAND_Y - 3} ${W + 20},${HAND_Y}`
                    : `M ${HAND_X},${HAND_Y} Q ${W / 2},${HAND_Y + 8} ${W + 20},${HAND_Y + 5}`,
              strokeWidth: phase === 'tugback' ? 1.5 : 1,
              opacity: safeOpacity(phase === 'done' ? 0.35 : 0.2),
            }}
            transition={{ duration: phase === 'tugback' ? 0.2 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Your hand (left side) */}
          <motion.g
            animate={{
              x: phase === 'pulling' ? -8 : phase === 'tugback' ? 6 : 0,
            }}
            transition={{ duration: phase === 'tugback' ? 0.15 : 0.3 }}
          >
            <circle cx={HAND_X} cy={HAND_Y} r={8}
              fill={verse.palette.accent} opacity={safeOpacity(0.15)} />
            <circle cx={HAND_X} cy={HAND_Y} r={8}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={0.5} opacity={safeOpacity(0.3)} />
            <text x={HAND_X} y={HAND_Y + 22} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro} opacity={0.4}>
              you
            </text>
          </motion.g>

          {/* String goes off-screen right (into the unknown) */}
          <text x={W - 10} y={HAND_Y - 15} textAnchor="end"
            fill={verse.palette.textFaint} style={navicueType.micro} opacity={0.2}>
            {phase === 'done' ? '' : '...'}
          </text>

          {/* Tug-back pulse wave */}
          {phase === 'tugback' && (
            <motion.g>
              {[0, 1, 2].map(i => (
                <motion.circle key={i}
                  cy={HAND_Y} r={4}
                  fill={verse.palette.accent}
                  initial={{ cx: W, opacity: 0.3 }}
                  animate={{ cx: HAND_X + 20, opacity: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.12 }}
                />
              ))}
            </motion.g>
          )}

          {/* "Connected" glow (done) */}
          {phase === 'done' && (
            <motion.g>
              {/* Pulse traveling along string */}
              <motion.circle
                cy={HAND_Y} r={3}
                fill={verse.palette.accent}
                animate={{
                  cx: [HAND_X + 15, W - 15],
                  opacity: [safeOpacity(0.3), 0],
                }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
              />
              <motion.circle
                cy={HAND_Y} r={3}
                fill={verse.palette.accent}
                animate={{
                  cx: [W - 15, HAND_X + 15],
                  opacity: [safeOpacity(0.3), 0],
                }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeOut', delay: 1 }}
              />

              {/* "Connected" */}
              <motion.text
                x={W / 2} y={HAND_Y + 35}
                textAnchor="middle"
                fill={verse.palette.accent}
                style={navicueType.choice}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 0.5 }}
              >
                connected
              </motion.text>
            </motion.g>
          )}
        </svg>
      </div>

      {phase === 'alone' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handlePull}>
          tug the string
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'done' ? 'it tugged back'
          : phase === 'tugback' ? 'something pulled back...'
            : phase === 'pulling' ? 'pulling...'
              : 'a string goes off into the distance'}
      </span>

      {phase === 'done' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          relational permanence
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'done' ? 'connection' : 'tug the line'}
      </div>
    </div>
  );
}
