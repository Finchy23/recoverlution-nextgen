/**
 * CYBERNETICIST #7 -- 1097. The Feedforward (Anticipation)
 * "Don't wait for the rain. Close the window when you see the clouds."
 * INTERACTION: Storm on radar -- tap to close shutters before it hits
 * STEALTH KBE: Proactivity -- strategic foresight (B)
 *
 * COMPOSITOR: poetic_precision / Circuit / social / believing / tap / 1097
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Cyberneticist_Feedforward({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Circuit',
        chrono: 'social',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1097,
        isSeal: false,
      }}
      arrivalText="Clouds on the horizon."
      prompt="Feedback reacts to the past. Feedforward prepares for the future. Do not wait for the rain. Close the window when you see the clouds."
      resonantText="Proactivity. You acted before the event. The storm came and found you ready. Foresight is not paranoia. It is the discipline of reading the sky."
      afterglowCoda="Prepared."
      onComplete={onComplete}
    >
      {(verse) => <FeedforwardInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FeedforwardInteraction({ verse }: { verse: any }) {
  const [stormProgress, setStormProgress] = useState(0);
  const [shuttersClosed, setShuttersClosed] = useState(false);
  const [stormHit, setStormHit] = useState(false);
  const [safe, setSafe] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const STORM_SPEED = 100; // ms per tick

  // Storm approaches
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setStormProgress(prev => {
        const next = prev + 1;
        if (next >= 100) {
          clearInterval(intervalRef.current);
          setStormHit(true);
        }
        return Math.min(next, 100);
      });
    }, STORM_SPEED);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Storm hits
  useEffect(() => {
    if (!stormHit) return;
    if (shuttersClosed) {
      setSafe(true);
      setTimeout(() => verse.advance(), 2200);
    }
  }, [stormHit, shuttersClosed, verse]);

  const closeShutters = useCallback(() => {
    if (shuttersClosed || stormHit) return;
    setShuttersClosed(true);
  }, [shuttersClosed, stormHit]);

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Radar */}
      <div style={{
        width: 140, height: 140, borderRadius: '50%',
        border: `1px solid ${verse.palette.primaryGlow}`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Concentric rings */}
        {[1, 2, 3].map(r => (
          <div key={r} style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: r * 40, height: r * 40,
            borderRadius: '50%',
            border: `1px solid ${verse.palette.primaryGlow}`,
            opacity: 0.12,
            transform: 'translate(-50%, -50%)',
          }} />
        ))}
        {/* Storm blob approaching center */}
        <motion.div
          animate={{
            top: `${50 - (stormProgress / 100) * 30}%`,
            left: `${50 + (1 - stormProgress / 100) * 25}%`,
            scale: 0.6 + (stormProgress / 100) * 0.8,
            opacity: 0.3 + (stormProgress / 100) * 0.5,
          }}
          style={{
            position: 'absolute',
            width: 20, height: 20, borderRadius: '50%',
            background: stormHit
              ? (safe ? 'hsla(140, 40%, 50%, 0.5)' : 'hsla(0, 50%, 50%, 0.6)')
              : 'hsla(0, 40%, 50%, 0.5)',
            transform: 'translate(-50%, -50%)',
          }}
        />
        {/* Center dot (you) */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: 6, height: 6, borderRadius: '50%',
          background: verse.palette.accent,
          transform: 'translate(-50%, -50%)',
        }} />
      </div>

      {/* Shutters indicator */}
      <div style={{ display: 'flex', gap: 4 }}>
        <motion.div
          animate={{ width: shuttersClosed ? 30 : 16 }}
          style={{
            height: 30, borderRadius: 2,
            background: shuttersClosed ? verse.palette.accent : verse.palette.primaryGlow,
            opacity: shuttersClosed ? 0.5 : 0.2,
          }}
        />
        <motion.div
          animate={{ width: shuttersClosed ? 30 : 16 }}
          style={{
            height: 30, borderRadius: 2,
            background: shuttersClosed ? verse.palette.accent : verse.palette.primaryGlow,
            opacity: shuttersClosed ? 0.5 : 0.2,
          }}
        />
      </div>

      {/* Action */}
      {!shuttersClosed && !stormHit ? (
        <motion.button onClick={closeShutters}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          close shutters
        </motion.button>
      ) : stormHit && !shuttersClosed ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: 'hsla(0, 40%, 55%, 0.8)', fontSize: 11 }}
        >
          too late
        </motion.div>
      ) : safe ? (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ ...navicueType.hint, color: 'hsla(140, 40%, 55%, 0.8)', fontSize: 11 }}
          >
            safe
          </motion.div>
        </AnimatePresence>
      ) : (
        <span style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11, opacity: 0.6 }}>
          shutters closed. waiting...
        </span>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {stormHit ? (safe ? 'prepared' : 'exposed') : `storm: ${stormProgress}%`}
      </div>
    </div>
  );
}