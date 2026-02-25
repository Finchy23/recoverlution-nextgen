/**
 * TRANSMUTER #2 -- 1082. The Calcination (The Burn)
 * "The fire does not burn you. It burns what you are not."
 * INTERACTION: Tap the fire itself to feed it -- ego burns -- tap ash to blow -- diamond remains
 * STEALTH KBE: Essentialism -- identity purification (K)
 *
 * COMPOSITOR: sacred_ordinary / Ember / morning / knowing / tap / 1082
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueInteraction, immersiveTap } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Transmuter_Calcination({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Ember',
        chrono: 'morning',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1082,
        isSeal: false,
      }}
      arrivalText="A white fire. Waiting."
      prompt="The fire does not burn you. It burns what you are not. Let the false self turn to ash. Keep the diamond."
      resonantText="Essentialism. You identified a belief that was not yours. You gave it to the fire. What remained was harder, clearer, more real."
      afterglowCoda="Keep the diamond."
      onComplete={onComplete}
    >
      {(verse) => <CalcinationInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function CalcinationInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'ego' | 'burning' | 'ash' | 'blowing' | 'diamond'>('ego');
  const [taps, setTaps] = useState(0);
  const BURN_TAPS = 5;

  const handleTap = useCallback(() => {
    if (phase === 'ego') {
      const next = taps + 1;
      setTaps(next);
      if (next >= BURN_TAPS) {
        setPhase('burning');
        setTimeout(() => setPhase('ash'), 1800);
      }
    } else if (phase === 'ash') {
      setPhase('blowing');
      setTimeout(() => {
        setPhase('diamond');
        setTimeout(() => verse.advance(), 2000);
      }, 1200);
    }
  }, [phase, taps, verse]);

  const burnProgress = taps / BURN_TAPS;

  return (
    <div style={{ ...navicueInteraction.interactionWrapper, gap: 24 }}>
      {/* The crucible -- tap target IS the visual */}
      <motion.div
        style={{
          ...immersiveTap(verse.palette).zone,
          width: 150,
          height: 150,
          borderRadius: phase === 'diamond' ? '50%' : 16,
          position: 'relative',
          overflow: 'hidden',
          transition: 'border-radius 1s ease',
          cursor: (phase === 'burning' || phase === 'blowing' || phase === 'diamond') ? 'default' : 'pointer',
        }}
        onClick={handleTap}
        whileTap={(phase === 'ego' || phase === 'ash') ? { scale: 0.94 } : {}}
      >
        {/* Fire glow -- intensifies with taps */}
        {(phase === 'ego' || phase === 'burning') && (
          <motion.div
            style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(circle at 50% 75%, hsla(30, 90%, 50%, ${0.05 + burnProgress * 0.25}), transparent 70%)`,
            }}
            animate={phase === 'burning' ? { opacity: [0.6, 1, 0.6] } : {}}
            transition={phase === 'burning' ? { repeat: Infinity, duration: 0.4 } : {}}
          />
        )}

        {/* Ember particles during burning */}
        {phase === 'burning' && Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 0, x: 75 + (i - 4) * 12, opacity: 0.4, scale: 1 }}
            animate={{ y: -80 - i * 15, opacity: 0, scale: 0.3 }}
            transition={{ duration: 1.2 + i * 0.15, repeat: Infinity, delay: i * 0.15 }}
            style={{
              position: 'absolute', bottom: 30,
              width: 3, height: 3, borderRadius: '50%',
              background: `hsla(${25 + i * 5}, 80%, 60%, 0.6)`,
            }}
          />
        ))}

        {/* Ash layer */}
        {phase === 'ash' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(circle, hsla(0, 0%, 40%, 0.25), transparent 75%)`,
            }}
          />
        )}

        {/* Blowing ash away */}
        {phase === 'blowing' && (
          <motion.div
            animate={{ x: 200, opacity: 0, rotate: 15 }}
            transition={{ duration: 1, ease: 'easeIn' }}
            style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(circle, hsla(0, 0%, 40%, 0.25), transparent 75%)`,
            }}
          />
        )}

        {/* Phase labels */}
        <AnimatePresence mode="wait">
          {phase === 'ego' && (
            <motion.span
              key="ego"
              exit={{ opacity: 0, scale: 0.5 }}
              style={{
                ...navicueType.hint,
                color: verse.palette.textFaint,
                fontSize: 13,
                opacity: 0.6 - burnProgress * 0.3,
                position: 'relative', zIndex: 1,
              }}
            >
              ego
            </motion.span>
          )}
          {phase === 'burning' && (
            <motion.span
              key="burning"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
              style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 12, position: 'relative', zIndex: 1 }}
            >
              burning
            </motion.span>
          )}
          {phase === 'ash' && (
            <motion.span
              key="ash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 12, position: 'relative', zIndex: 1 }}
            >
              ash
            </motion.span>
          )}
          {phase === 'diamond' && (
            <motion.div
              key="diamond"
              initial={{ opacity: 0, scale: 0.2, rotate: 45 }}
              animate={{ opacity: 0.8, scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: 32, height: 32, position: 'relative', zIndex: 1,
                transform: 'rotate(45deg)',
                background: `linear-gradient(135deg, ${verse.palette.accent}, transparent 80%)`,
                opacity: 0.5,
              }}
            />
          )}
        </AnimatePresence>

        {/* Tap ripple */}
        {phase === 'ego' && taps > 0 && (
          <motion.div
            key={taps}
            initial={{ scale: 0.3, opacity: 0.3 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.7 }}
            style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 40, height: 40, borderRadius: '50%',
              border: `1px solid hsla(30, 80%, 55%, 0.4)`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          />
        )}
      </motion.div>

      {/* Hint */}
      <span style={{ ...navicueInteraction.tapHint, color: verse.palette.textFaint }}>
        {phase === 'ego' ? (taps === 0 ? 'tap to feed the fire' : `${BURN_TAPS - taps} more`)
          : phase === 'ash' ? 'tap to clear the ash'
          : phase === 'diamond' ? 'the diamond remains'
          : ''}
      </span>
    </div>
  );
}