/**
 * TRANSMUTER #5 -- 1085. The Fermentation (The Rot)
 * "The breakdown is necessary. The sugar must be destroyed to make the alcohol."
 * INTERACTION: Observe the rot -- wait without intervening -- grapes become wine
 * STEALTH KBE: Patience -- faith in process (B)
 *
 * COMPOSITOR: koan_paradox / Ember / night / believing / observe / 1085
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, navicueInteraction, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Transmuter_Fermentation({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Ember',
        chrono: 'night',
        kbe: 'b',
        hook: 'observe',
        specimenSeed: 1085,
        isSeal: false,
      }}
      arrivalText="Grapes. Fresh and whole."
      prompt="The breakdown is necessary. The sugar must be destroyed to make the alcohol. Do not fear the dark night. It is fermenting."
      resonantText="Patience. You waited. You did not intervene. The rot was not destruction. It was creation wearing a disguise you did not recognise."
      afterglowCoda="Wine."
      onComplete={onComplete}
    >
      {(verse) => <FermentationInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FermentationInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'grapes' | 'rotting' | 'waiting' | 'wine'>('grapes');
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const FERMENT_TIME = 7; // seconds to observe

  const beginFermentation = () => {
    if (phase !== 'grapes') return;
    setPhase('rotting');
  };

  useEffect(() => {
    if (phase === 'rotting' || phase === 'waiting') {
      timerRef.current = setInterval(() => {
        setElapsed(prev => {
          const next = prev + 0.1;
          if (next >= 2 && phase === 'rotting') {
            setPhase('waiting');
          }
          if (next >= FERMENT_TIME) {
            setPhase('wine');
            setTimeout(() => verse.advance(), 2200);
            return FERMENT_TIME;
          }
          return next;
        });
      }, 100);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, verse]);

  const fermentProgress = Math.min(1, elapsed / FERMENT_TIME);

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Vessel */}
      <div style={{
        width: 100,
        height: 120,
        borderRadius: '12px 12px 50% 50%',
        border: `1px solid ${verse.palette.primaryGlow}`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Contents colour shift */}
        <motion.div
          animate={{
            background: phase === 'wine'
              ? `linear-gradient(to top, hsla(340, 50%, 25%, 0.5), hsla(350, 40%, 20%, 0.3))`
              : `linear-gradient(to top, hsla(${100 - fermentProgress * 100}, ${40 - fermentProgress * 15}%, ${35 - fermentProgress * 10}%, ${0.4 + fermentProgress * 0.15}), transparent 80%)`,
          }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '65%',
          }}
        />

        {/* Bubbles during fermentation */}
        {(phase === 'rotting' || phase === 'waiting') && (
          <>
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ y: [-20, -70], opacity: [0.3, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 + i * 0.3, delay: i * 0.5 }}
                style={{
                  position: 'absolute',
                  bottom: '35%',
                  left: `${25 + i * 22}%`,
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  border: `1px solid ${verse.palette.textFaint}40`,
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
            {phase === 'grapes' && (
              <motion.span key="grapes" exit={{ opacity: 0 }}
                style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 10 }}>
                grapes
              </motion.span>
            )}
            {phase === 'rotting' && (
              <motion.span key="rotting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 10 }}>
                rotting...
              </motion.span>
            )}
            {phase === 'waiting' && (
              <motion.span key="wait"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
                exit={{ opacity: 0 }}
                style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 10 }}>
                fermenting
              </motion.span>
            )}
            {phase === 'wine' && (
              <motion.span key="wine"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ ...navicueType.hint, color: 'hsla(340, 45%, 60%, 0.9)', fontSize: 12 }}>
                wine
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress */}
      {(phase === 'rotting' || phase === 'waiting') && (
        <div style={{
          width: 100,
          height: 2,
          background: verse.palette.primaryGlow,
          borderRadius: 1,
          overflow: 'hidden',
        }}>
          <motion.div
            style={{
              height: '100%',
              background: verse.palette.accent,
              width: `${fermentProgress * 100}%`,
              transition: 'width 0.2s',
            }}
          />
        </div>
      )}

      {/* Action */}
      {phase === 'grapes' && (
        <motion.button
          onClick={beginFermentation}
          whileTap={immersiveTapButton(verse.palette).active}
          style={immersiveTapButton(verse.palette).base}
        >
          begin the wait
        </motion.button>
      )}

      {phase === 'waiting' && (
        <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.4, fontSize: 10 }}>
          do not intervene
        </div>
      )}
    </div>
  );
}