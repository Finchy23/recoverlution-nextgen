/**
 * TRANSMUTER #9 -- 1089. The Philosopher's Stone
 * "You are the stone. Whatever you touch changes."
 * INTERACTION: Tap objects to transmute them -- Fear to Courage, Doubt to Faith
 * STEALTH KBE: Agency -- self-as-catalyst (B)
 *
 * COMPOSITOR: sacred_ordinary / Ember / morning / believing / tap / 1089
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, navicueInteraction } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const TRANSMUTATIONS = [
  { from: 'Fear', to: 'Courage' },
  { from: 'Doubt', to: 'Faith' },
  { from: 'Shame', to: 'Compassion' },
];

export default function Transmuter_PhilosophersStone({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Ember',
        chrono: 'morning',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1089,
        isSeal: false,
      }}
      arrivalText="A red stone. Warm to the touch."
      prompt="You are the stone. Whatever you touch changes. Stop waiting for the world to change. Touch it."
      resonantText="Agency. You touched fear and it became courage. You touched doubt and it became faith. The stone was never separate from you."
      afterglowCoda="Touch it."
      onComplete={onComplete}
    >
      {(verse) => <PhilosophersStoneInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function PhilosophersStoneInteraction({ verse }: { verse: any }) {
  const [transmuted, setTransmuted] = useState<boolean[]>(TRANSMUTATIONS.map(() => false));
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const allDone = transmuted.every(Boolean);

  const handleTouch = useCallback((idx: number) => {
    if (transmuted[idx]) return;
    setActiveIdx(idx);
    setTimeout(() => {
      setTransmuted(prev => {
        const next = [...prev];
        next[idx] = true;
        const done = next.every(Boolean);
        if (done) {
          setTimeout(() => verse.advance(), 1800);
        }
        return next;
      });
      setActiveIdx(null);
    }, 800);
  }, [transmuted, verse]);

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* The Stone */}
      <motion.div
        animate={{
          boxShadow: allDone
            ? `0 0 30px hsla(0, 60%, 50%, 0.2)`
            : `0 0 15px hsla(0, 50%, 40%, 0.1)`,
        }}
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: `1px solid hsla(0, 50%, 45%, 0.5)`,
          background: `radial-gradient(circle at 40% 35%, hsla(0, 55%, 45%, 0.35), hsla(0, 40%, 30%, 0.2))`,
        }}
      />

      {/* Transmutation targets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
        {TRANSMUTATIONS.map((pair, i) => (
          <motion.button
            key={pair.from}
            onClick={() => handleTouch(i)}
            disabled={transmuted[i]}
            animate={activeIdx === i ? {
              scale: [1, 1.05, 1],
              borderColor: verse.palette.accent,
            } : {}}
            transition={{ duration: 0.4 }}
            style={{
              width: 180,
              padding: '10px 16px',
              border: `1px solid ${transmuted[i] ? verse.palette.accent : verse.palette.primaryGlow}`,
              borderRadius: 8,
              background: transmuted[i] ? `${verse.palette.accent}08` : 'transparent',
              cursor: transmuted[i] ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: transmuted[i] ? 0.8 : 1,
              transition: 'border-color 0.4s, background 0.4s',
            }}
          >
            <AnimatePresence mode="wait">
              {!transmuted[i] ? (
                <motion.span key={`from-${i}`} exit={{ opacity: 0, scale: 0.7 }}
                  style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11 }}>
                  {pair.from}
                </motion.span>
              ) : (
                <motion.span key={`to-${i}`}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
                  {pair.to}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      {/* Instruction */}
      {!allDone && (
        <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.4, fontSize: 10 }}>
          touch each one
        </div>
      )}

      {allDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 10, opacity: 0.6 }}
        >
          you are the stone
        </motion.div>
      )}
    </div>
  );
}