/**
 * CATALYST #10 -- The Catalyst Seal (Be the Tunnel)
 * "Be the catalyst, not the reagent. Lower the barrier without being consumed."
 * ARCHETYPE: Pattern A (Hold) -- Hold to catalyze a reaction without being changed
 * ENTRY: Scene-first -- two elements unable to combine
 * STEALTH KBE: Sustained presence without absorption = Catalytic Presence (E)
 *
 * DELIVERY STACK:
 *   NaviCueVerse (compositor-driven 5-stage arc)
 *   useHoldInteraction (catalytic presence)
 */
import { useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveHoldButton } from '@/app/design-system/navicue-blueprint';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

interface Props { data?: any; onComplete?: () => void; }

export default function Catalyst_CatalystSeal({ onComplete }: Props) {
  const hold = useHoldInteraction({ maxDuration: 5000 });

  const advanceRef = useRef<(() => void) | null>(null);
  const advancedRef = useRef(false);

  const handleComplete = useCallback(() => {
    if (hold.completed && !advancedRef.current) {
      advancedRef.current = true;
      if (hold.completed) {
        console.log(`[KBE:E] CatalystSeal catalyticPresence=confirmed`);
      }
      setTimeout(() => advanceRef.current?.(), 2500);
    }
  }, [hold.completed]);

  // Visual: gap between A and B closes as tension builds
  const gap = 40 - hold.tension * 32; // 40px -> 8px

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'relational_ghost',
        form: 'Theater',
        chrono: 'night',
        kbe: 'embodying',
        hook: 'hold',
        specimenSeed: 620,
        isSeal: true,
      }}
      arrivalText="Two elements. Unable to combine."
      prompt="Be the catalyst, not the reagent. Lower the barrier without being consumed."
      resonantText="Catalytic presence. A catalyst lowers the activation energy of a reaction. It brings others together without being consumed in the process. This is the art of facilitation, leadership, and love. Be the tunnel, not the hill."
      afterglowCoda="Be the tunnel."
      onComplete={onComplete}
      mechanism="Metacognition"
      timing={{
        presentAt: 3500,
        activeAt: 6000,
        resonantDuration: 6000,
        afterglowDuration: 5000,
      }}
    >
      {(verse) => {
        advanceRef.current = verse.advance;
        if (hold.completed) handleComplete();

        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            width: '100%',
            maxWidth: 300,
          }}>
            {/* A and B elements approaching */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: `${gap}px`,
              transition: 'gap 0.15s ease-out',
            }}>
              <motion.div
                animate={{
                  borderColor: hold.completed ? verse.palette.accent : verse.palette.primaryGlow,
                  opacity: hold.completed ? 0.8 : 0.5,
                }}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: verse.composition.transitionConfig ? 4 : 4,
                  border: `1px solid ${verse.palette.primaryGlow}`,
                  background: verse.palette.primaryFaint,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11 }}>A</span>
              </motion.div>

              {hold.completed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 0.5 }}
                  style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}
                >
                  connected
                </motion.div>
              )}

              {!hold.completed && (
                <span style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.3 }}>
                  gap
                </span>
              )}

              <motion.div
                animate={{
                  borderColor: hold.completed ? verse.palette.accent : verse.palette.primaryGlow,
                  opacity: hold.completed ? 0.8 : 0.5,
                }}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 4,
                  border: `1px solid ${verse.palette.primaryGlow}`,
                  background: verse.palette.primaryFaint,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11 }}>B</span>
              </motion.div>
            </div>

            {/* Progress indicator */}
            <motion.div
              animate={{ opacity: hold.tension > 0 ? 0.6 : 0.3 }}
              style={{
                ...navicueType.data,
                color: verse.palette.textFaint,
                textAlign: 'center',
              }}
            >
              {hold.completed
                ? 'Catalysis complete.'
                : hold.tension > 0.5
                  ? 'catalyzing...'
                  : hold.tension > 0
                    ? `${Math.round(hold.tension * 100)}%`
                    : 'Hold to lower the barrier'}
            </motion.div>

            {/* Hold zone */}
            {!hold.completed && (() => {
              const btn = immersiveHoldButton(verse.palette, 80);
              return (
                <motion.div
                  {...hold.holdProps}
                  animate={hold.isHolding ? btn.holding : {}}
                  transition={{ duration: 0.2 }}
                  style={{ ...hold.holdProps.style, ...btn.base }}
                >
                  <svg viewBox="0 0 80 80" style={btn.progressRing.svg}>
                    <circle {...btn.progressRing.track} />
                    <circle {...btn.progressRing.fill(hold.tension)} />
                  </svg>
                  <div style={btn.label}>
                    {hold.tension > 0.5 ? 'catalyzing' : 'hold'}
                  </div>
                </motion.div>
              );
            })()}

            {/* Post-hold message */}
            {hold.completed && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.4, y: 0 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                style={{
                  ...navicueType.texture,
                  color: verse.palette.textFaint,
                  textAlign: 'center',
                  fontStyle: 'italic',
                  maxWidth: 260,
                }}
              >
                You lowered the barrier. They connected. You remained unchanged.
              </motion.div>
            )}
          </div>
        );
      }}
    </NaviCueVerse>
  );
}