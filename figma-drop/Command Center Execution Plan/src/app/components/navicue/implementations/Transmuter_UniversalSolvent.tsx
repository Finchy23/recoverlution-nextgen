/**
 * TRANSMUTER #8 -- 1088. The Universal Solvent
 * "Resentment is a stone. Forgiveness is the acid that eats the stone."
 * INTERACTION: Hold to pour solvent on the knot -- tension releases -- knot unties
 * STEALTH KBE: Release -- emotional release (E)
 *
 * COMPOSITOR: relational_ghost / Ember / night / embodying / hold / 1088
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, navicueInteraction, immersiveTapButton, immersiveHoldButton } from '@/app/design-system/navicue-blueprint';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

interface Props { data?: any; onComplete?: () => void; }

export default function Transmuter_UniversalSolvent({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'relational_ghost',
        form: 'Ember',
        chrono: 'night',
        kbe: 'e',
        hook: 'hold',
        specimenSeed: 1088,
        isSeal: false,
      }}
      arrivalText="A hard knot. Resentment."
      prompt="Resentment is a stone. Forgiveness is the acid that eats the stone. It does not free them. It frees the container."
      resonantText="Release. You poured the solvent. The knot was not untied. It was dissolved. The tension left your body, not theirs. That was always the point."
      afterglowCoda="You."
      onComplete={onComplete}
    >
      {(verse) => <SolventInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SolventInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'knot' | 'pouring' | 'dissolving' | 'free'>('knot');

  const hold = useHoldInteraction({
    maxDuration: 4000,
    onComplete: () => {
      setPhase('dissolving');
      setTimeout(() => {
        setPhase('free');
        setTimeout(() => verse.advance(), 2000);
      }, 2000);
    },
  });

  const progress = hold.tension;

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* The knot */}
      <div style={{
        width: 100,
        height: 100,
        borderRadius: phase === 'free' ? '50%' : 12,
        border: `1px solid ${phase === 'free' ? verse.palette.accent : verse.palette.primaryGlow}`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-radius 1s, border-color 1s',
      }}>
        {/* Knot lines */}
        {(phase === 'knot' || phase === 'pouring') && (
          <svg width="100" height="100" viewBox="0 0 100 100" style={{
            position: 'absolute',
            inset: 0,
            opacity: 1 - progress * 0.6,
            transition: 'opacity 0.3s',
          }}>
            <path
              d="M 20 50 C 35 30, 65 70, 80 50 M 30 35 C 45 55, 55 25, 70 65 M 25 65 C 40 45, 60 55, 75 35"
              fill="none"
              stroke={verse.palette.textFaint}
              strokeWidth="1.5"
              opacity="0.4"
            />
          </svg>
        )}

        {/* Dissolving */}
        {phase === 'dissolving' && (
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.8 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle, ${verse.palette.primaryFaint}, transparent 70%)`,
            }}
          />
        )}

        {/* Free state */}
        {phase === 'free' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle, ${verse.palette.accent}15, transparent 70%)`,
            }}
          />
        )}

        {/* Solvent dripping */}
        {hold.isHolding && (
          <>
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ y: [0, 60], opacity: [0.4, 0] }}
                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.25 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: `${30 + i * 18}%`,
                  width: 3,
                  height: 12,
                  borderRadius: 2,
                  background: verse.palette.accent,
                  opacity: 0.3,
                }}
              />
            ))}
          </>
        )}

        {/* Label */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <AnimatePresence mode="wait">
            {(phase === 'knot' || phase === 'pouring') && (
              <motion.span key="knot" exit={{ opacity: 0 }}
                style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 10, opacity: 1 - progress * 0.5 }}>
                resentment
              </motion.span>
            )}
            {phase === 'free' && (
              <motion.span key="free"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
                free
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Action */}
      {(phase === 'knot') && (() => {
        const btn = immersiveHoldButton(verse.palette);
        return (
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
            <div style={btn.label}>{hold.isHolding ? 'pouring forgiveness...' : 'hold to pour the solvent'}</div>
          </motion.div>
        );
      })()}
    </div>
  );
}