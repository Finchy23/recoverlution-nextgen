/**
 * TRANSMUTER #3 -- 1083. The Distillation (The Essence)
 * "The situation is muddy. Apply heat. Condense the truth."
 * INTERACTION: Hold to boil -- steam rises -- condenses into a pure drop of truth
 * STEALTH KBE: Insight -- cognitive extraction (K)
 *
 * COMPOSITOR: poetic_precision / Ember / work / knowing / hold / 1083
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, navicueInteraction, immersiveTapButton, immersiveHoldButton } from '@/app/design-system/navicue-blueprint';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

interface Props { data?: any; onComplete?: () => void; }

export default function Transmuter_Distillation({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Ember',
        chrono: 'work',
        kbe: 'k',
        hook: 'hold',
        specimenSeed: 1083,
        isSeal: false,
      }}
      arrivalText="A muddy mixture. Confusion."
      prompt="The situation is muddy. Apply heat. Rise above the mud as vapor. Condense the truth. Drink the clarity."
      resonantText="Insight. You extracted the lesson from the complexity. The mud was not the enemy. It was the container. The truth was always there, waiting for enough heat to rise."
      afterglowCoda="Drink the clarity."
      onComplete={onComplete}
    >
      {(verse) => <DistillationInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function DistillationInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'muddy' | 'boiling' | 'steam' | 'drop'>('muddy');

  const hold = useHoldInteraction({
    maxDuration: 4000,
    onComplete: () => {
      setPhase('boiling');
      setTimeout(() => setPhase('steam'), 1500);
      setTimeout(() => {
        setPhase('drop');
        setTimeout(() => verse.advance(), 2200);
      }, 3500);
    },
  });

  const heatProgress = hold.tension;

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Flask */}
      <div style={{
        width: 110,
        height: 130,
        borderRadius: '8px 8px 40px 40px',
        border: `1px solid ${verse.palette.primaryGlow}`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Muddy contents */}
        {(phase === 'muddy' || phase === 'boiling') && (
          <motion.div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${60 - (phase === 'boiling' ? 20 : 0)}%`,
              background: `linear-gradient(to top, hsla(30, 20%, 25%, ${0.5 - heatProgress * 0.2}), hsla(35, 15%, 30%, ${0.3 - heatProgress * 0.1}))`,
              transition: 'height 1.5s',
            }}
          />
        )}

        {/* Bubbles */}
        {phase === 'boiling' && (
          <>
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ y: [-60, -120], opacity: [0.4, 0] }}
                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.25 }}
                style={{
                  position: 'absolute',
                  bottom: '40%',
                  left: `${30 + i * 20}%`,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  border: `1px solid ${verse.palette.accent}40`,
                }}
              />
            ))}
          </>
        )}

        {/* Steam rising */}
        {phase === 'steam' && (
          <>
            {[0, 1, 2].map(i => (
              <motion.div
                key={`steam-${i}`}
                initial={{ y: 0, opacity: 0.3 }}
                animate={{ y: -150, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.6 }}
                style={{
                  position: 'absolute',
                  bottom: '50%',
                  left: `${25 + i * 20}%`,
                  width: 20,
                  height: 30,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${verse.palette.primaryFaint}, transparent)`,
                }}
              />
            ))}
          </>
        )}

        {/* Pure drop */}
        {phase === 'drop' && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '30%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 22,
              height: 28,
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              border: `1px solid ${verse.palette.accent}`,
              background: `radial-gradient(circle at 40% 35%, hsla(200, 50%, 70%, 0.3), transparent)`,
            }}
          />
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
            {phase === 'muddy' && (
              <motion.span key="mud" exit={{ opacity: 0 }}
                style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 10 }}>
                confusion
              </motion.span>
            )}
            {phase === 'drop' && (
              <motion.span key="truth"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 10, marginTop: 70 }}>
                truth
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Heat button */}
      {phase === 'muddy' && (() => {
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
            <div style={btn.label}>{hold.isHolding ? 'heating...' : 'hold to boil'}</div>
          </motion.div>
        );
      })()}
    </div>
  );
}