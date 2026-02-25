/**
 * CATALYST #6 -- 1066. The Chain Reaction
 * "You just need to trigger the first one."
 * INTERACTION: Tap to identify the lead domino, then watch cascade
 * STEALTH KBE: Leverage -- systems leverage (K)
 *
 * COMPOSITOR: witness_ritual / Glacier / morning / knowing / tap / 1066
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const DOMINOES = [
  { label: 'Sleep', isLead: true },
  { label: 'Mood', isLead: false },
  { label: 'Focus', isLead: false },
  { label: 'Output', isLead: false },
  { label: 'Confidence', isLead: false },
  { label: 'Relationships', isLead: false },
];

export default function Catalyst_ChainReaction({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Glacier',
        chrono: 'morning',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1066,
        isSeal: false,
      }}
      arrivalText="A field of standing dominoes."
      prompt="You do not need to push every domino. You just need to find the first one. The lead domino knocks down the rest."
      resonantText="Leverage. Systems thinking reveals that one well-placed action cascades through the entire structure. Find the domino that matters."
      afterglowCoda="Find the first one."
      onComplete={onComplete}
    >
      {(verse) => <ChainInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ChainInteraction({ verse }: { verse: any }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [cascadeIdx, setCascadeIdx] = useState(-1);
  const [wrong, setWrong] = useState(false);

  useEffect(() => {
    if (selected !== null && DOMINOES[selected].isLead && cascadeIdx >= 0) {
      if (cascadeIdx < DOMINOES.length - 1) {
        const timer = setTimeout(() => setCascadeIdx(prev => prev + 1), 400);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => verse.advance(), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [cascadeIdx, selected]);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    if (DOMINOES[idx].isLead) {
      setSelected(idx);
      setCascadeIdx(0);
    } else {
      setWrong(true);
      setTimeout(() => setWrong(false), 1200);
    }
  };

  const isFallen = (idx: number) => {
    if (selected === null) return false;
    return idx <= cascadeIdx;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      {/* Domino field */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        {DOMINOES.map((d, i) => (
          <motion.div
            key={d.label}
            onClick={() => handleSelect(i)}
            animate={{
              rotateZ: isFallen(i) ? 70 : 0,
              opacity: isFallen(i) ? 0.4 : 1,
            }}
            transition={{ duration: 0.3, delay: isFallen(i) ? 0.1 : 0 }}
            style={{
              width: 28,
              height: 56,
              borderRadius: 4,
              border: `1px solid ${
                selected === i
                  ? verse.palette.accent
                  : verse.palette.primaryGlow
              }`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: selected !== null ? 'default' : 'pointer',
              transformOrigin: 'bottom right',
              background: selected === i ? verse.palette.primaryFaint : 'transparent',
            }}
          >
            <span style={{
              ...navicueType.hint,
              color: selected === i ? verse.palette.accent : verse.palette.textFaint,
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              fontSize: 11,
            }}>
              {d.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Status */}
      <AnimatePresence mode="wait">
        {wrong && (
          <motion.div
            key="wrong"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ ...navicueType.hint, color: verse.palette.textFaint }}
          >
            not the lead domino. look deeper.
          </motion.div>
        )}
        {selected === null && !wrong && (
          <motion.div
            key="prompt"
            style={{ ...navicueType.hint, color: verse.palette.textFaint }}
          >
            which domino falls first?
          </motion.div>
        )}
        {selected !== null && cascadeIdx >= DOMINOES.length - 1 && (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ ...navicueType.hint, color: verse.palette.accent }}
          >
            cascade complete
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}