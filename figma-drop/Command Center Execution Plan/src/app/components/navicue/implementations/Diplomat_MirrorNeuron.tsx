/**
 * DIPLOMAT #5 -- 1265. The Mirror Neuron
 * "If you want peace, infect the room with calm."
 * INTERACTION: Hold calm -- avatar gradually mirrors your state and smiles
 * STEALTH KBE: State Regulation -- Co-Regulation (E)
 *
 * COMPOSITOR: witness_ritual / Pulse / social / embodying / hold / 1265
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveHoldButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

interface Props { data?: any; onComplete?: () => void; }

export default function Diplomat_MirrorNeuron({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Pulse',
        chrono: 'social',
        kbe: 'e',
        hook: 'hold',
        specimenSeed: 1265,
        isSeal: false,
      }}
      arrivalText="They are frowning."
      prompt="Emotions are contagious. You are the index case. If you want peace, infect the room with calm. Hold the state."
      resonantText="State regulation. You held your calm and they caught it. Co-regulation is the science of emotional contagion used intentionally. You did not change their mind. You changed their nervous system."
      afterglowCoda="Hold the state."
      onComplete={onComplete}
    >
      {(verse) => <MirrorNeuronInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function MirrorNeuronInteraction({ verse }: { verse: any }) {
  const [done, setDone] = useState(false);

  const hold = useHoldInteraction({
    maxDuration: 5000,
    onComplete: () => {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    },
  });

  const btn = immersiveHoldButton(verse.palette, 90, 26);
  const W = 240, H = 140;
  const YOUR_X = 70, THEIR_X = 170, FACE_Y = 60;

  // Mouth curve: -1 = frown, +1 = smile
  const yourMouth = done ? 1 : 0.3 + hold.tension * 0.7;
  const theirMouth = done ? 0.8 : -0.8 + hold.tension * 1.6;

  // Eye openness
  const theirEyes = done ? 3 : 2 + hold.tension;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Entrainment indicator */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>entrainment</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.text,
        }}>
          {done ? 'synced' : `${Math.round(hold.tension * 100)}%`}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Connection wave between faces */}
          <motion.path
            d={`M ${YOUR_X + 20},${FACE_Y} Q ${W / 2},${FACE_Y - 10 + hold.tension * 10} ${THEIR_X - 20},${FACE_Y}`}
            fill="none"
            stroke={verse.palette.accent}
            strokeWidth={0.5}
            strokeDasharray="3 3"
            animate={{
              opacity: safeOpacity(hold.tension * 0.3),
            }}
          />

          {/* YOUR face */}
          <motion.g>
            <circle cx={YOUR_X} cy={FACE_Y} r={22}
              fill={verse.palette.accent} opacity={safeOpacity(0.08)} />
            <circle cx={YOUR_X} cy={FACE_Y} r={22}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={0.5} opacity={safeOpacity(0.2)} />

            {/* Eyes */}
            <circle cx={YOUR_X - 7} cy={FACE_Y - 5} r={3}
              fill={verse.palette.accent} opacity={safeOpacity(0.3)} />
            <circle cx={YOUR_X + 7} cy={FACE_Y - 5} r={3}
              fill={verse.palette.accent} opacity={safeOpacity(0.3)} />

            {/* Mouth (smile) */}
            <motion.path
              fill="none" stroke={verse.palette.accent}
              strokeWidth={1} strokeLinecap="round"
              animate={{
                d: `M ${YOUR_X - 8},${FACE_Y + 8} Q ${YOUR_X},${FACE_Y + 8 + yourMouth * 6} ${YOUR_X + 8},${FACE_Y + 8}`,
                opacity: safeOpacity(0.3),
              }}
            />

            <text x={YOUR_X} y={FACE_Y + 35} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro} opacity={0.4}>
              you
            </text>
          </motion.g>

          {/* THEIR face */}
          <motion.g>
            <circle cx={THEIR_X} cy={FACE_Y} r={22}
              fill={verse.palette.primary} opacity={safeOpacity(0.05)} />
            <circle cx={THEIR_X} cy={FACE_Y} r={22}
              fill="none" stroke={verse.palette.primary}
              strokeWidth={0.5} opacity={safeOpacity(0.15)} />

            {/* Eyes (gradually open) */}
            <motion.ellipse
              cx={THEIR_X - 7} cy={FACE_Y - 5}
              rx={3}
              fill={theirMouth > 0 ? verse.palette.accent : verse.palette.primary}
              animate={{
                ry: theirEyes,
                opacity: safeOpacity(0.25),
              }}
            />
            <motion.ellipse
              cx={THEIR_X + 7} cy={FACE_Y - 5}
              rx={3}
              fill={theirMouth > 0 ? verse.palette.accent : verse.palette.primary}
              animate={{
                ry: theirEyes,
                opacity: safeOpacity(0.25),
              }}
            />

            {/* Mouth (frown to smile) */}
            <motion.path
              fill="none"
              stroke={theirMouth > 0 ? verse.palette.accent : verse.palette.primary}
              strokeWidth={1} strokeLinecap="round"
              animate={{
                d: `M ${THEIR_X - 8},${FACE_Y + 8} Q ${THEIR_X},${FACE_Y + 8 + theirMouth * 6} ${THEIR_X + 8},${FACE_Y + 8}`,
                opacity: safeOpacity(0.3),
              }}
            />

            <text x={THEIR_X} y={FACE_Y + 35} textAnchor="middle"
              fill={verse.palette.textFaint} style={navicueType.micro} opacity={0.4}>
              them
            </text>
          </motion.g>

          {/* Mirror neurons (particles between) */}
          {hold.isHolding && [0, 1, 2].map(i => (
            <motion.circle
              key={i}
              r={2}
              fill={verse.palette.accent}
              animate={{
                cx: [YOUR_X + 25, THEIR_X - 25],
                cy: [FACE_Y - 5 + i * 8, FACE_Y - 5 + i * 8],
                opacity: [safeOpacity(0.3), 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                delay: i * 0.3,
                ease: 'easeOut',
              }}
            />
          ))}
        </svg>
      </div>

      {/* Hold button */}
      {!done && (
        <motion.div
          {...hold.holdProps}
          animate={hold.isHolding ? btn.holding : {}}
          transition={{ duration: 0.2 }}
          style={{ ...hold.holdProps.style, ...btn.base }}
        >
          <svg viewBox="0 0 90 90" style={btn.progressRing.svg}>
            <circle {...btn.progressRing.track} />
            <circle {...btn.progressRing.fill(hold.tension)} />
          </svg>
          <div style={btn.label}>
            {hold.isHolding ? 'holding calm...' : 'hold to radiate'}
          </div>
        </motion.div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'they caught your calm'
          : hold.isHolding
            ? theirMouth > 0 ? 'they are mirroring...' : 'the frown is softening...'
            : 'emotions are contagious'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          co-regulation
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'state regulation' : 'infect the room with calm'}
      </div>
    </div>
  );
}
