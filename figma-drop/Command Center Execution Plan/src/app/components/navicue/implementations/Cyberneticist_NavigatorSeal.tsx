/**
 * CYBERNETICIST #10 -- 1100. The Navigator Seal (The Proof)
 * "The world turns. You stay true."
 * INTERACTION: Observe -- a gyroscope spinning; the frame tilts but the center stays upright
 * STEALTH KBE: Cybernetics -- steer the ship (E)
 *
 * COMPOSITOR: science_x_soul / Circuit / night / embodying / observe / 1100
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Cyberneticist_NavigatorSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Circuit',
        chrono: 'night',
        kbe: 'e',
        hook: 'observe',
        specimenSeed: 1100,
        isSeal: true,
      }}
      arrivalText="A gyroscope. Spinning."
      prompt="The world turns. You stay true."
      resonantText="Cybernetics. The science of communications and automatic control systems in both machines and living things. You have learned to steer the ship."
      afterglowCoda="Steer the ship."
      onComplete={onComplete}
    >
      {(verse) => <NavigatorSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function NavigatorSealInteraction({ verse }: { verse: any }) {
  const [frameAngle, setFrameAngle] = useState(0);
  const [observeTime, setObserveTime] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const OBSERVE_TARGET = 6; // seconds

  // Frame tilts continuously
  useEffect(() => {
    const interval = setInterval(() => {
      setFrameAngle(Math.sin(Date.now() * 0.001) * 20 + Math.cos(Date.now() * 0.0007) * 10);
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

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Gyroscope */}
      <div style={navicueStyles.heroCssScene(verse.palette, 160 / 160)}>
        {/* Outer frame (tilts) */}
        <motion.div
          animate={{ rotate: frameAngle }}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            borderRadius: '50%',
            border: `1px solid ${verse.palette.primaryGlow}`,
            opacity: 0.25,
          }}
        />
        {/* Middle ring (tilts less) */}
        <motion.div
          animate={{ rotate: frameAngle * 0.5 }}
          style={{
            position: 'absolute',
            top: 20, left: 20, right: 20, bottom: 20,
            borderRadius: '50%',
            border: `1px solid ${verse.palette.primaryGlow}`,
            opacity: 0.2,
          }}
        />
        {/* Inner disk (stays upright) */}
        <motion.div
          animate={{
            rotate: 0,
            boxShadow: revealed
              ? `0 0 20px ${verse.palette.accent}`
              : `0 0 8px ${verse.palette.primaryGlow}`,
          }}
          style={{
            position: 'absolute',
            top: 40, left: 40, right: 40, bottom: 40,
            borderRadius: '50%',
            border: `1px solid ${verse.palette.accent}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.6 + progressPct * 0.4,
          }}
        >
          {/* Center dot */}
          <motion.div
            animate={{
              scale: revealed ? [1, 1.2, 1] : 1,
              opacity: revealed ? [0.6, 1, 0.6] : 0.5,
            }}
            transition={revealed ? { repeat: Infinity, duration: 2.5 } : {}}
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: verse.palette.accent,
            }}
          />
        </motion.div>

        {/* Spin line (the gyroscope spinning effect) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: 60, height: 1,
            background: `linear-gradient(90deg, transparent, ${verse.palette.accent}, transparent)`,
            opacity: 0.15,
            transformOrigin: 'center center',
          }}
        />
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
              true north
            </span>
            <span style={navicueStyles.annotation(verse.palette)}>
              the world turns. you stay true.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}