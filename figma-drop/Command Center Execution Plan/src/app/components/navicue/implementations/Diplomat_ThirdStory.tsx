/**
 * DIPLOMAT #4 -- 1264. The Third Story
 * "Tell the third story."
 * INTERACTION: Tap to merge two opposing stories into a neutral third
 * STEALTH KBE: Objectivity -- Meta-Cognition (K)
 *
 * COMPOSITOR: koan_paradox / Lattice / social / knowing / tap / 1264
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

export default function Diplomat_ThirdStory({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Lattice',
        chrono: 'social',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1264,
        isSeal: false,
      }}
      arrivalText="Two stories. Both true. Both incomplete."
      prompt="There is your story, their story, and the third story. What a neutral observer would see. Tell the third story."
      resonantText="Objectivity. You found the third story. The one no ego wrote. Meta-cognition is the camera above the argument, the one that sees both sides from a height where right and wrong dissolve into stuck."
      afterglowCoda="Tell the third story."
      onComplete={onComplete}
    >
      {(verse) => <ThirdStoryInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ThirdStoryInteraction({ verse }: { verse: any }) {
  const [merged, setMerged] = useState(false);
  const [done, setDone] = useState(false);

  const handleMerge = () => {
    if (merged) return;
    setMerged(true);
    setTimeout(() => {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }, 1800);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 260, H = 140;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Left panel: "I am right" */}
          <motion.rect
            rx={6} fill={verse.palette.primary}
            animate={{
              x: merged ? W / 2 - 55 : 10,
              y: 15,
              width: merged ? 50 : W / 2 - 20,
              height: merged ? 35 : H - 30,
              opacity: safeOpacity(merged ? 0.04 : 0.06),
            }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.rect
            rx={6} fill="none" stroke={verse.palette.text}
            strokeWidth={0.5}
            animate={{
              x: merged ? W / 2 - 55 : 10,
              y: 15,
              width: merged ? 50 : W / 2 - 20,
              height: merged ? 35 : H - 30,
              opacity: safeOpacity(merged ? 0.08 : 0.12),
            }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.text
            textAnchor="middle"
            fill={verse.palette.text}
            style={navicueType.micro}
            animate={{
              x: merged ? W / 2 - 30 : W / 4 - 5,
              y: merged ? 36 : H / 2 + 4,
              opacity: merged ? 0.25 : 0.5,
              fontSize: merged ? 11 : 12,
            }}
            transition={{ duration: 0.8 }}
          >
            {merged ? 'my story' : 'I am right'}
          </motion.text>

          {/* Right panel: "They are right" */}
          <motion.rect
            rx={6} fill={verse.palette.primary}
            animate={{
              x: merged ? W / 2 + 5 : W / 2 + 10,
              y: 15,
              width: merged ? 50 : W / 2 - 20,
              height: merged ? 35 : H - 30,
              opacity: safeOpacity(merged ? 0.04 : 0.06),
            }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.rect
            rx={6} fill="none" stroke={verse.palette.textFaint}
            strokeWidth={0.5}
            animate={{
              x: merged ? W / 2 + 5 : W / 2 + 10,
              y: 15,
              width: merged ? 50 : W / 2 - 20,
              height: merged ? 35 : H - 30,
              opacity: safeOpacity(merged ? 0.08 : 0.12),
            }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.text
            textAnchor="middle"
            fill={verse.palette.textFaint}
            style={navicueType.micro}
            animate={{
              x: merged ? W / 2 + 30 : 3 * W / 4 + 5,
              y: merged ? 36 : H / 2 + 4,
              opacity: merged ? 0.25 : 0.5,
              fontSize: merged ? 11 : 12,
            }}
            transition={{ duration: 0.8 }}
          >
            {merged ? 'their story' : 'they are right'}
          </motion.text>

          {/* Divider / VS */}
          {!merged && (
            <motion.text
              x={W / 2} y={H / 2 + 4}
              textAnchor="middle"
              fill={verse.palette.shadow}
              style={navicueType.micro}
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              vs
            </motion.text>
          )}

          {/* Third story (center, appears after merge) */}
          {merged && (
            <motion.g
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <rect x={W / 2 - 70} y={65} width={140} height={50} rx={8}
                fill={verse.palette.accent} opacity={safeOpacity(0.08)} />
              <rect x={W / 2 - 70} y={65} width={140} height={50} rx={8}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.5} opacity={safeOpacity(0.25)} />
              <text x={W / 2} y={83} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.micro} opacity={0.4}>
                the third story
              </text>
              <motion.text
                x={W / 2} y={100} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.choice}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 1 }}
              >
                "we are stuck"
              </motion.text>
            </motion.g>
          )}
        </svg>
      </div>

      {!merged && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleMerge}>
          find the third story
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'the neutral view' : merged ? 'rising above both sides...' : 'two stories. both incomplete.'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          meta-cognition
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'objectivity' : 'what would a neutral observer see?'}
      </div>
    </div>
  );
}
