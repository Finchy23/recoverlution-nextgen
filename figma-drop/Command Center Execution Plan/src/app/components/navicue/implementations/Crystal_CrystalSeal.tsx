/**
 * CRYSTAL #10 -- 1130. The Crystal Seal (The Proof)
 * "Order is beautiful. Chaos is just order waiting to happen."
 * INTERACTION: Observe -- Bismuth crystal forming -- iridescent stair-step geometry
 * STEALTH KBE: Crystallography -- structure determines property (E)
 *
 * COMPOSITOR: science_x_soul / Glacier / night / embodying / observe / 1130
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Crystal_CrystalSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Glacier',
        chrono: 'night',
        kbe: 'e',
        hook: 'observe',
        specimenSeed: 1130,
        isSeal: true,
      }}
      arrivalText="Molten bismuth. Cooling."
      prompt="Order is beautiful. Chaos is just order waiting to happen."
      resonantText="Crystallography. The study of the arrangement of atoms in crystalline solids. Structure determines property. How you organize is who you become."
      afterglowCoda="Nature's math."
      onComplete={onComplete}
    >
      {(verse) => <CrystalSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function CrystalSealInteraction({ verse }: { verse: any }) {
  const [observeTime, setObserveTime] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [growthPhase, setGrowthPhase] = useState(0);
  const OBSERVE_TARGET = 6;

  // Crystal growth animation
  useEffect(() => {
    const interval = setInterval(() => {
      setGrowthPhase(prev => (prev + 0.02) % 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Observe timer
  useEffect(() => {
    if (revealed) return;
    const interval = setInterval(() => {
      setObserveTime(prev => {
        const next = prev + 0.1;
        if (next >= OBSERVE_TARGET) {
          setRevealed(true);
          clearInterval(interval);
          setTimeout(() => verse.advance(), 3000);
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [revealed, verse]);

  const progressPct = Math.min(1, observeTime / OBSERVE_TARGET);

  // Bismuth stair-step geometry
  const STEPS = 5;
  const iridescent = [
    'hsla(270, 40%, 55%, 0.4)',
    'hsla(200, 45%, 50%, 0.4)',
    'hsla(160, 40%, 50%, 0.4)',
    'hsla(45, 50%, 55%, 0.4)',
    'hsla(320, 35%, 50%, 0.4)',
  ];

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Bismuth crystal */}
      <div style={navicueStyles.heroCssScene(verse.palette, 160 / 140)}>
        {/* Stair-step structure */}
        {Array.from({ length: STEPS }).map((_, i) => {
          const size = 30 + (STEPS - i) * 16;
          const visible = progressPct > i / STEPS;
          const colorIdx = (i + Math.floor(growthPhase * STEPS)) % STEPS;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: visible ? 0.3 + progressPct * 0.4 : 0,
                scale: visible ? 1 : 0.8,
                boxShadow: revealed
                  ? `0 0 ${8 + i * 3}px ${iridescent[colorIdx]}`
                  : 'none',
              }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{
                position: 'absolute',
                bottom: 10 + i * 12,
                left: '50%',
                width: size,
                height: 14,
                borderRadius: 2,
                background: iridescent[colorIdx],
                border: `1px solid hsla(0, 0%, 70%, ${0.1 + progressPct * 0.15})`,
                transform: `translateX(-50%) rotate(${i % 2 === 0 ? 0 : 2}deg)`,
              }}
            />
          );
        })}

        {/* Inner hollow (bismuth signature) */}
        {progressPct > 0.5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            style={{
              position: 'absolute',
              bottom: 25, left: '50%',
              width: 20, height: 25,
              border: `1px solid hsla(200, 40%, 60%, 0.3)`,
              borderRadius: 2,
              transform: 'translateX(-50%)',
            }}
          />
        )}
      </div>

      {/* Status */}
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="observing"
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11, opacity: 0.5 }}>
              observe
            </span>
            <div style={{ width: 60, height: 2, borderRadius: 1, background: verse.palette.primaryGlow, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${progressPct * 100}%` }}
                style={{ height: '100%', background: verse.palette.accent, borderRadius: 1 }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <span style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 12 }}>
              nature's math
            </span>
            <span style={navicueStyles.annotation(verse.palette)}>
              structure determines property
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}