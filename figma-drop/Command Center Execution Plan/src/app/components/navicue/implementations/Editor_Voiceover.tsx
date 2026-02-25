/**
 * EDITOR #4 -- 1254. The Voiceover (The Narrator)
 * "If the narrator is abusive, fire them."
 * INTERACTION: Tap to swap harsh inner narrator for a kind one
 * STEALTH KBE: Self-Talk -- Self-Compassion (B)
 *
 * COMPOSITOR: sacred_ordinary / Drift / night / believing / tap / 1254
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

const NARRATORS = [
  { id: 'critic', name: 'the critic', line: '"You are stupid."', tone: 'shadow' as const },
  { id: 'mentor', name: 'the mentor', line: '"You are learning."', tone: 'accent' as const },
  { id: 'friend', name: 'the friend', line: '"You are brave for trying."', tone: 'accent' as const },
];

export default function Editor_Voiceover({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Drift',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1254,
        isSeal: false,
      }}
      arrivalText='A voice says: "You are stupid."'
      prompt="The internal narrator is an employee. If they are abusive, fire them. Hire a narrator who is on your side."
      resonantText="Self-talk. You fired the critic and hired a mentor. Self-compassion is not weakness. It is choosing a narrator who tells the truth with kindness instead of cruelty."
      afterglowCoda="Change the voiceover."
      onComplete={onComplete}
    >
      {(verse) => <VoiceoverInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function VoiceoverInteraction({ verse }: { verse: any }) {
  const [narratorIndex, setNarratorIndex] = useState(0);
  const [fired, setFired] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = () => {
    if (done) return;

    if (!fired) {
      setFired(true);
      setTimeout(() => setNarratorIndex(1), 600);
      return;
    }

    const next = narratorIndex + 1;
    if (next < NARRATORS.length) {
      setNarratorIndex(next);
    }

    if (next >= 1) {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }
  };

  const narrator = NARRATORS[narratorIndex];
  const toneColor = narrator.tone === 'shadow' ? verse.palette.shadow : verse.palette.accent;

  const btn = immersiveTapButton(verse.palette, 'accent');
  const SCENE_W = 260;
  const SCENE_H = 100;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Narrator badge */}
      <motion.div
        style={{
          display: 'flex', gap: 8, alignItems: 'center',
          padding: '6px 14px', borderRadius: 20,
          border: `1px solid ${toneColor}25`,
        }}
      >
        {/* Mic icon */}
        <svg width={14} height={14} viewBox="0 0 14 14">
          <rect x={5} y={1} width={4} height={7} rx={2}
            fill={toneColor} opacity={0.4} />
          <path d="M 3,7 Q 3,11 7,11 Q 11,11 11,7"
            fill="none" stroke={toneColor} strokeWidth={0.8} opacity={0.3} />
          <line x1={7} y1={11} x2={7} y2={13}
            stroke={toneColor} strokeWidth={0.8} opacity={0.3} />
        </svg>
        <motion.span
          key={narrator.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          style={{
            ...navicueType.micro,
            color: toneColor,
          }}
        >
          {narrator.name}
        </motion.span>

        {/* FIRED badge */}
        {fired && narratorIndex === 0 && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.6, scale: 1 }}
            style={{
              ...navicueType.micro,
              color: verse.palette.shadow,
              padding: '1px 6px',
              borderRadius: 4,
              border: `1px solid ${verse.palette.shadow}30`,
            }}
          >
            fired
          </motion.span>
        )}
      </motion.div>

      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Speech bubble */}
          <AnimatePresence mode="wait">
            <motion.g
              key={narrator.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              <rect x={30} y={15} width={SCENE_W - 60} height={50} rx={8}
                fill={toneColor} opacity={safeOpacity(0.06)} />
              <rect x={30} y={15} width={SCENE_W - 60} height={50} rx={8}
                fill="none" stroke={toneColor}
                strokeWidth={0.5} opacity={safeOpacity(0.15)} />

              {/* Quote */}
              <text x={SCENE_W / 2} y={45} textAnchor="middle"
                fill={toneColor}
                style={navicueType.choice}>
                {narrator.line}
              </text>

              {/* Tail */}
              <path
                d={`M ${SCENE_W / 2 - 8},65 L ${SCENE_W / 2},75 L ${SCENE_W / 2 + 8},65`}
                fill={toneColor} opacity={safeOpacity(0.06)} />
            </motion.g>
          </AnimatePresence>

          {/* Waveform */}
          <motion.g>
            {Array.from({ length: 20 }).map((_, i) => {
              const h = 3 + Math.sin(i * 0.8 + narratorIndex * 3) * 6;
              return (
                <motion.rect
                  key={i}
                  x={40 + i * 9}
                  y={85 - h / 2}
                  width={4} height={Math.abs(h)}
                  rx={1}
                  fill={toneColor}
                  animate={{
                    opacity: safeOpacity(0.1 + Math.abs(h) / 20),
                    height: Math.abs(h),
                    y: 85 - Math.abs(h) / 2,
                  }}
                  transition={{ duration: 0.3, delay: i * 0.02 }}
                />
              );
            })}
          </motion.g>
        </svg>
      </div>

      {/* Action button */}
      {!done && (
        <motion.button
          style={btn.base}
          whileTap={btn.active}
          onClick={handleChange}
        >
          {fired ? 'hire new narrator' : 'change voiceover'}
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'the new narrator is on your side'
          : fired
            ? 'the critic is fired. who speaks next?'
            : 'the narrator is an employee'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          self-compassion
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'self-talk' : 'fire the abusive narrator'}
      </div>
    </div>
  );
}
