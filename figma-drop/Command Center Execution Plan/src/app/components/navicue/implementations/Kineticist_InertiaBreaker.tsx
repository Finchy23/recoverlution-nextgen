/**
 * KINETICIST #1 -- 1111. The Inertia Breaker
 * "Static friction is higher than sliding friction. Do not stop."
 * INTERACTION: Tap the boulder itself to push it -- momentum builds, decay on pause
 * STEALTH KBE: Persistence -- consistency (E)
 *
 * COMPOSITOR: witness_ritual / Storm / morning / embodying / tap / 1111
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, navicueInteraction, immersiveTap } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Kineticist_InertiaBreaker({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Storm',
        chrono: 'morning',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1111,
        isSeal: false,
      }}
      arrivalText="A massive boulder. Stationary."
      prompt="Static friction is higher than sliding friction. It takes 10 units of energy to start, and only 1 to keep going. Do not stop."
      resonantText="Persistence. The first tap barely moved it. The tenth tap sent it flying. The boulder did not get lighter. Your friction got lower. Consistency is physics."
      afterglowCoda="Keep rolling."
      onComplete={onComplete}
    >
      {(verse) => <InertiaInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function InertiaInteraction({ verse }: { verse: any }) {
  const [taps, setTaps] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [posX, setPosX] = useState(0);
  const [done, setDone] = useState(false);
  const lastTapRef = useRef(Date.now());
  const TARGET_TAPS = 12;

  // Velocity decay if no taps
  useEffect(() => {
    if (done) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastTapRef.current;
      if (elapsed > 800) {
        setVelocity(prev => Math.max(0, prev - 0.3));
      }
    }, 100);
    return () => clearInterval(interval);
  }, [done]);

  // Move boulder with velocity
  useEffect(() => {
    if (done) return;
    const frame = setInterval(() => {
      setPosX(prev => prev + velocity * 0.5);
    }, 50);
    return () => clearInterval(frame);
  }, [velocity, done]);

  const tap = useCallback(() => {
    if (done) return;
    lastTapRef.current = Date.now();
    setTaps(prev => {
      const next = prev + 1;
      const boost = next < 3 ? 0.3 : next < 6 ? 0.8 : 2;
      setVelocity(v => Math.min(12, v + boost));
      if (next >= TARGET_TAPS) {
        setDone(true);
        setVelocity(14);
        setTimeout(() => verse.advance(), 2200);
      }
      return next;
    });
  }, [done, verse]);

  const progress = Math.min(1, taps / TARGET_TAPS);

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Terrain + boulder -- entire area is tappable */}
      <motion.div
        style={{
          ...immersiveTap(verse.palette).zone,
          position: 'relative',
          width: 260,
          height: 140,
          overflow: 'hidden',
          cursor: done ? 'default' : 'pointer',
        }}
        onClick={tap}
        whileTap={done ? {} : { scale: 0.97 }}
      >
        {/* Ground line */}
        <div style={{
          position: 'absolute', bottom: 30, left: 0, right: 0,
          height: 1, background: verse.palette.primary, opacity: 0.1,
        }} />

        {/* Boulder */}
        <motion.div
          animate={{
            x: posX % 260,
            rotate: posX * 2,
            scale: done ? [1, 1.08, 1] : 1,
          }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          style={{
            position: 'absolute', bottom: 32, left: 40,
            width: 52, height: 52, borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, ${verse.palette.primary}, transparent 80%)`,
            opacity: 0.4 + progress * 0.3,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Inner pulse when moving */}
          {velocity > 0 && (
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ repeat: Infinity, duration: Math.max(0.15, 0.5 - velocity * 0.03) }}
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: verse.palette.accent, opacity: 0.6,
              }}
            />
          )}
        </motion.div>

        {/* Speed lines -- appear at high velocity */}
        {velocity > 4 && Array.from({ length: Math.min(6, Math.floor(velocity / 2)) }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0, 0.25, 0], x: [0, -20] }}
            transition={{ repeat: Infinity, duration: 0.4, delay: i * 0.08 }}
            style={{
              position: 'absolute',
              bottom: 40 + i * 8, left: 30 + (posX % 260),
              width: 15 + velocity * 1.5, height: 1,
              background: verse.palette.accent,
            }}
          />
        ))}

        {/* Tap ripple feedback */}
        {taps > 0 && !done && (
          <motion.div
            key={taps}
            initial={{ scale: 0.5, opacity: 0.2 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              position: 'absolute',
              bottom: 45, left: 55 + (posX % 260),
              width: 30, height: 30, borderRadius: '50%',
              border: `1px solid ${verse.palette.accent}`,
              pointerEvents: 'none',
            }}
          />
        )}
      </motion.div>

      {/* Status */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <span style={{ ...navicueInteraction.tapHint, color: verse.palette.textFaint }}>
          {done ? 'unstoppable' : taps === 0 ? 'tap to push' : velocity < 0.5 ? 'tap again -- do not stop' : `push ${taps} of ${TARGET_TAPS}`}
        </span>

        {/* Subtle progress bar */}
        {!done && taps > 0 && (
          <div style={{ width: 80, height: 2, borderRadius: 1, background: verse.palette.primaryFaint, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${progress * 100}%` }}
              style={{ height: '100%', background: verse.palette.accent, borderRadius: 1, opacity: 0.6 }}
            />
          </div>
        )}
      </div>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          consistency is physics
        </motion.div>
      )}
    </div>
  );
}