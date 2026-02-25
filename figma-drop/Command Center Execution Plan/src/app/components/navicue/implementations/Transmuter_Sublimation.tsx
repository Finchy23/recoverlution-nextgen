/**
 * TRANSMUTER #6 -- 1086. The Sublimation (The Rise)
 * "Sometimes you don't need to flow. You need to fly."
 * INTERACTION: Swipe up rapidly -- ice skips water, goes straight to vapor
 * STEALTH KBE: Energy state -- high-energy state shift (E)
 *
 * COMPOSITOR: sensory_cinema / Ember / work / embodying / drag / 1086
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, navicueInteraction } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Transmuter_Sublimation({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Ember',
        chrono: 'work',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1086,
        isSeal: false,
      }}
      arrivalText="Solid ice. Stuck."
      prompt="Sometimes you do not need to flow. You need to fly. Use the intensity of the pressure to go straight up. Skip the middleman."
      resonantText="Energy state. You did not melt first. You sublimated. Solid to gas in one leap. Some transformations do not need an intermediate step."
      afterglowCoda="Straight up."
      onComplete={onComplete}
    >
      {(verse) => <SublimationInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SublimationInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'ice' | 'launching' | 'vapor'>('ice');
  const [swipes, setSwipes] = useState(0);
  const SWIPE_THRESHOLD = 3;

  const handleDragEnd = useCallback((_: any, info: any) => {
    if (phase !== 'ice') return;
    // Must swipe UP (negative y offset)
    if (info.offset.y < -50 && info.velocity.y < -100) {
      const next = swipes + 1;
      setSwipes(next);
      if (next >= SWIPE_THRESHOLD) {
        setPhase('launching');
        setTimeout(() => {
          setPhase('vapor');
          setTimeout(() => verse.advance(), 2000);
        }, 1500);
      }
    }
  }, [phase, swipes, verse]);

  return (
    <div style={navicueStyles.interactionContainer()}>
      <AnimatePresence mode="wait">
        {phase === 'ice' && (
          <motion.div
            key="ice"
            drag="y"
            dragConstraints={{ top: -80, bottom: 0 }}
            dragElastic={0.3}
            onDragEnd={handleDragEnd}
            whileDrag={{ scale: 0.95 }}
            exit={{ y: -200, opacity: 0, scale: 0.5, transition: { duration: 0.5 } }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 8,
              border: `1px solid hsla(200, 40%, 65%, 0.4)`,
              background: `linear-gradient(135deg, hsla(200, 35%, 55%, 0.2), hsla(210, 30%, 45%, 0.15))`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'grab',
              touchAction: 'none',
            }}
          >
            <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11 }}>
              stuck
            </span>
          </motion.div>
        )}

        {phase === 'launching' && (
          <motion.div
            key="launch"
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -180, opacity: 0, scale: 2 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${verse.palette.primaryFaint}, transparent)`,
            }}
          />
        )}

        {phase === 'vapor' && (
          <motion.div
            key="vapor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {/* Vapor wisps */}
            {[0, 1, 2, 3].map(i => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.15, 0.3, 0.15],
                  scale: [1, 1.1, 1],
                }}
                transition={{ repeat: Infinity, duration: 2 + i * 0.4, delay: i * 0.3 }}
                style={{
                  width: 30 + i * 12,
                  height: 14,
                  borderRadius: '50%',
                  background: `radial-gradient(ellipse, ${verse.palette.primaryFaint}, transparent)`,
                }}
              />
            ))}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11, marginTop: 8 }}
            >
              vapor
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipe progress */}
      {phase === 'ice' && (
        <>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: SWIPE_THRESHOLD }).map((_, i) => (
              <div key={i} style={{
                width: 5,
                height: 14,
                borderRadius: 2,
                background: i < swipes ? verse.palette.accent : verse.palette.primaryGlow,
                opacity: i < swipes ? 0.6 : 0.2,
                transition: 'all 0.2s',
              }} />
            ))}
          </div>
          <div style={navicueStyles.kbeLabel(verse.palette)}>
            swipe up hard
          </div>
        </>
      )}
    </div>
  );
}