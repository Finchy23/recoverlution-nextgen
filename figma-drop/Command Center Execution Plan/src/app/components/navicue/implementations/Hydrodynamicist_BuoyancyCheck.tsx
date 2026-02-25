/**
 * HYDRODYNAMICIST #2 -- 1132. The Buoyancy Check
 * "The truth wants to float. Let it surface."
 * INTERACTION: Hold beach ball underwater -- it fights -- release -- it shoots up
 * STEALTH KBE: Release -- surrender (B)
 *
 * COMPOSITOR: koan_paradox / Tide / social / believing / tap / 1132
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Hydrodynamicist_BuoyancyCheck({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Tide',
        chrono: 'social',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1132,
        isSeal: false,
      }}
      arrivalText="A ball held underwater. Fighting."
      prompt="You are using all your energy to suppress the truth. Let go. The truth wants to float. Let it surface."
      resonantText="Release. You stopped holding it down. And it flew. All that energy you spent suppressing was energy the truth already had. Surrender is not weakness. It is physics."
      afterglowCoda="Surfaced."
      onComplete={onComplete}
    >
      {(verse) => <BuoyancyCheckInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function BuoyancyCheckInteraction({ verse }: { verse: any }) {
  const [holding, setHolding] = useState(true);
  const [ballY, setBallY] = useState(100);
  const [released, setReleased] = useState(false);
  const [done, setDone] = useState(false);
  const [wobble, setWobble] = useState(0);

  // Ball fights while held
  useEffect(() => {
    if (!holding || done) return;
    const interval = setInterval(() => {
      setWobble(prev => prev + 1);
    }, 100);
    return () => clearInterval(interval);
  }, [holding, done]);

  // Release animation
  useEffect(() => {
    if (!released || done) return;
    const interval = setInterval(() => {
      setBallY(prev => {
        const next = prev - 5;
        if (next <= -20) {
          setDone(true);
          clearInterval(interval);
          setTimeout(() => verse.advance(), 2000);
        }
        return next;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [released, done, verse]);

  const release = useCallback(() => {
    if (!holding || done) return;
    setHolding(false);
    setReleased(true);
  }, [holding, done]);

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 160 / 140)}>
        {/* Water surface */}
        <div style={{ position: 'relative', width: 160, height: 140, overflow: 'hidden' }}>
          {/* Water surface */}
          <div style={{
            position: 'absolute', top: 30, left: 0, right: 0, height: 2,
          }} />

          {/* Water body */}
          <div style={{
            position: 'absolute', top: 32, left: 0, right: 0, bottom: 0,
            background: 'hsla(200, 30%, 40%, 0.08)',
          }} />

          {/* Ball */}
          <motion.div
            animate={{
              y: ballY,
              x: holding ? [78, 82, 76, 80] : 80,
              scale: released && ballY < 30 ? [1, 1.1, 1] : 1,
            }}
            transition={holding ? { repeat: Infinity, duration: 0.3 } : { type: 'spring', stiffness: 60 }}
            style={{
              position: 'absolute',
              left: 60,
              width: 30, height: 30, borderRadius: '50%',
              background: `radial-gradient(circle at 40% 35%, 
                hsla(350, 50%, 60%, 0.5), 
                hsla(350, 40%, 45%, 0.3))`,
              border: `1px solid hsla(350, 40%, 60%, 0.3)`,
            }}
          />

          {/* Struggle bubbles */}
          {holding && Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={`b${wobble}-${i}`}
              initial={{ y: ballY - 5, opacity: 0.4 }}
              animate={{ y: ballY - 30 - i * 10, opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                position: 'absolute',
                left: 70 + (i - 1) * 8,
                width: 4, height: 4, borderRadius: '50%',
                border: '1px solid hsla(200, 30%, 55%, 0.3)',
              }}
            />
          ))}

          {/* Splash on surface break */}
          {released && ballY < 35 && ballY > 10 && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'absolute', top: 25, left: 65,
                width: 20, height: 10, borderRadius: '50%',
                background: 'hsla(200, 40%, 60%, 0.3)',
              }}
            />
          )}

          {/* Depth label */}
          {holding && (
            <span style={{
              position: 'absolute', bottom: 8, right: 8,
              ...navicueStyles.annotation(verse.palette, 0.3),
            }}>
              suppressed
            </span>
          )}
        </div>

        {/* Action */}
        {holding ? (
          <motion.button onClick={release}
            style={immersiveTapButton(verse.palette).base}
            whileTap={immersiveTapButton(verse.palette).active}>
            let go
          </motion.button>
        ) : done ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
            surfaced
          </motion.div>
        ) : (
          <span style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11, opacity: 0.6 }}>
            rising...
          </span>
        )}

        <div style={navicueStyles.kbeLabel(verse.palette)}>
          {done ? 'surrender' : holding ? 'fighting you' : 'buoyant'}
        </div>
      </div>
    </div>
  );
}