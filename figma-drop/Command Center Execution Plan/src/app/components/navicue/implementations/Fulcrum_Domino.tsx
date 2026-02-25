/**
 * FULCRUM #8 -- 1208. The Domino (Sequence)
 * "You cannot fight the boss level yet. Fight the level 1 minion."
 * INTERACTION: Tap the smallest domino. Chain reaction cascades to the giant.
 * STEALTH KBE: Sequencing -- Linear Progression (K)
 *
 * COMPOSITOR: pattern_glitch / Storm / morning / knowing / tap / 1208
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTap,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const DOMINOES = [
  { height: 20, width: 8, label: 'tiny' },
  { height: 30, width: 10, label: 'small' },
  { height: 42, width: 13, label: 'medium' },
  { height: 58, width: 16, label: 'large' },
  { height: 80, width: 20, label: 'giant' },
];

export default function Fulcrum_Domino({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Storm',
        chrono: 'morning',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1208,
        isSeal: false,
      }}
      arrivalText="A giant domino. Immovable."
      prompt="You cannot fight the boss level yet. Fight the level 1 minion. The momentum of the small win knocks down the big wall."
      resonantText="Sequencing. The giant domino was 50 times heavier than the tiny one. But physics does not care about size. It cares about sequence. Linear progression is the unstoppable force."
      afterglowCoda="Start small."
      onComplete={onComplete}
    >
      {(verse) => <DominoInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function DominoInteraction({ verse }: { verse: any }) {
  const [fallenIdx, setFallenIdx] = useState(-1);
  const [triedGiant, setTriedGiant] = useState(false);
  const [cascading, setCascading] = useState(false);
  const [done, setDone] = useState(false);

  // Cascade timer
  useEffect(() => {
    if (!cascading || fallenIdx >= DOMINOES.length - 1) return;
    const delay = 350 + fallenIdx * 100; // Each bigger domino takes longer
    const timer = setTimeout(() => {
      setFallenIdx(prev => {
        const next = prev + 1;
        if (next >= DOMINOES.length - 1) {
          setDone(true);
          setTimeout(() => verse.advance(), 2200);
        }
        return next;
      });
    }, delay);
    return () => clearTimeout(timer);
  }, [fallenIdx, cascading, verse]);

  const handleTap = (idx: number) => {
    if (cascading || done) return;

    // Tapping the giant directly fails
    if (idx === DOMINOES.length - 1) {
      setTriedGiant(true);
      setTimeout(() => setTriedGiant(false), 1500);
      return;
    }

    // Only the smallest starts the cascade
    if (idx === 0) {
      setCascading(true);
      setFallenIdx(0);
    }
  };

  const isFallen = (idx: number) => idx <= fallenIdx;

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Domino field */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 14,
        height: 100, paddingBottom: 4,
      }}>
        {DOMINOES.map((d, i) => (
          <motion.div
            key={i}
            onClick={() => handleTap(i)}
            animate={{
              rotateZ: isFallen(i) ? 75 : 0,
              opacity: isFallen(i) ? safeOpacity(0.2) : safeOpacity(0.5 + i * 0.1),
            }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              ...immersiveTap(verse.palette).zone,
              width: d.width,
              height: d.height,
              minWidth: d.width,
              minHeight: d.height,
              borderRadius: 3,
              border: `1px solid ${
                i === 0 && !cascading
                  ? verse.palette.accent
                  : verse.palette.primaryGlow
              }`,
              transformOrigin: 'bottom right',
              cursor: cascading ? 'default' : 'pointer',
              padding: 0,
              background: i === 0 && !cascading ? verse.palette.primaryFaint : 'transparent',
            }}
          />
        ))}
      </div>

      {/* Size labels */}
      <div style={{ display: 'flex', gap: 14 }}>
        {DOMINOES.map((d, i) => (
          <span key={i} style={{
            ...navicueType.micro,
            color: isFallen(i) ? verse.palette.accent : verse.palette.textFaint,
            opacity: i === 0 || isFallen(i) ? 0.6 : 0.25,
            width: d.width,
            textAlign: 'center',
            fontSize: 11,
          }}>
            {i === 0 ? 'tiny' : i === DOMINOES.length - 1 ? 'giant' : ''}
          </span>
        ))}
      </div>

      {/* Feedback */}
      <AnimatePresence mode="wait">
        {triedGiant && (
          <motion.span
            key="giant"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6, x: [0, -3, 3, -2, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ ...navicueType.hint, color: verse.palette.shadow }}
          >
            immovable. start smaller.
          </motion.span>
        )}
      </AnimatePresence>

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'crash'
          : cascading
            ? `cascade ${fallenIdx + 1} of ${DOMINOES.length}`
            : triedGiant
              ? ''
              : 'push the smallest domino'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          linear progression
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'sequencing' : 'find the first domino'}
      </div>
    </div>
  );
}
