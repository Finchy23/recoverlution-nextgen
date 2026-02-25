/**
 * CRYSTAL #2 -- 1122. The Piezoelectric Spark
 * "When you squeeze a crystal, it generates electricity. Harvest the voltage."
 * INTERACTION: Hold/squeeze a quartz crystal -- spark jumps
 * STEALTH KBE: Stress Utilization -- stress-is-enhancing (B)
 *
 * COMPOSITOR: science_x_soul / Glacier / work / believing / hold / 1122
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Crystal_PiezoelectricSpark({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Glacier',
        chrono: 'work',
        kbe: 'b',
        hook: 'hold',
        specimenSeed: 1122,
        isSeal: false,
      }}
      arrivalText="A quartz crystal. Inert."
      prompt="When you squeeze a crystal, it generates electricity. Do not waste the stress. It is a power source. Harvest the voltage."
      resonantText="Stress Utilization. You squeezed, and light appeared. The pressure was never damage. It was a generator. Stress is enhancing when you know how to harvest it."
      afterglowCoda="Stress equals power."
      onComplete={onComplete}
    >
      {(verse) => <PiezoInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function PiezoInteraction({ verse }: { verse: any }) {
  const [squeezing, setSqueezing] = useState(false);
  const [pressure, setPressure] = useState(0);
  const [sparked, setSparked] = useState(false);
  const PRESSURE_TARGET = 100;

  useEffect(() => {
    if (!squeezing || sparked) return;
    const interval = setInterval(() => {
      setPressure(prev => {
        const next = prev + 2;
        if (next >= PRESSURE_TARGET) {
          setSparked(true);
          clearInterval(interval);
          setTimeout(() => verse.advance(), 2500);
        }
        return Math.min(next, PRESSURE_TARGET);
      });
    }, 50);
    return () => clearInterval(interval);
  }, [squeezing, sparked, verse]);

  // Decay when not squeezing
  useEffect(() => {
    if (squeezing || sparked) return;
    const interval = setInterval(() => {
      setPressure(prev => Math.max(0, prev - 1));
    }, 60);
    return () => clearInterval(interval);
  }, [squeezing, sparked]);

  const startSqueeze = useCallback(() => { if (!sparked) setSqueezing(true); }, [sparked]);
  const endSqueeze = useCallback(() => setSqueezing(false), []);

  const pct = pressure / PRESSURE_TARGET;
  const crystalColor = `hsla(270, ${Math.round(20 + pct * 40)}%, ${Math.round(40 + pct * 20)}%, ${0.3 + pct * 0.5})`;

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Crystal */}
      <div style={navicueStyles.heroCssScene(verse.palette, 140 / 140)}>
        <motion.div
          animate={{
            scale: squeezing ? [1, 0.92, 0.88] : sparked ? [1, 1.05, 1] : 1,
            boxShadow: sparked
              ? `0 0 30px hsla(210, 70%, 65%, 0.5), 0 0 60px hsla(210, 70%, 65%, 0.2)`
              : `0 0 ${Math.round(pct * 15)}px ${crystalColor}`,
          }}
          transition={squeezing ? { repeat: Infinity, duration: 0.8 } : {}}
          style={{
            width: 60, height: 80,
            background: `linear-gradient(135deg, ${crystalColor}, hsla(270, 30%, 50%, 0.2))`,
            clipPath: 'polygon(50% 0%, 85% 25%, 85% 75%, 50% 100%, 15% 75%, 15% 25%)',
            border: `1px solid hsla(270, 30%, 60%, 0.3)`,
          }}
        />

        {/* Spark */}
        <AnimatePresence>
          {sparked && (
            <>
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                  position: 'absolute', top: '30%', right: '15%',
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'hsla(210, 80%, 70%, 0.8)',
                }}
              />
              <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 1, 0], y: -20 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                style={{
                  position: 'absolute', top: '25%', right: '10%',
                  ...navicueType.hint, color: 'hsla(210, 80%, 70%, 0.8)', fontSize: 14,
                }}
              >
                *
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Compression arrows */}
        {squeezing && !sparked && (
          <>
            <motion.span animate={{ x: [5, 0] }} transition={{ repeat: Infinity, duration: 0.4 }}
              style={{ position: 'absolute', left: 10, top: '50%', ...navicueType.hint, color: verse.palette.textFaint, fontSize: 14, opacity: 0.3 }}>
              {'>>'}
            </motion.span>
            <motion.span animate={{ x: [-5, 0] }} transition={{ repeat: Infinity, duration: 0.4 }}
              style={{ position: 'absolute', right: 10, top: '50%', ...navicueType.hint, color: verse.palette.textFaint, fontSize: 14, opacity: 0.3 }}>
              {'<<'}
            </motion.span>
          </>
        )}
      </div>

      {/* Action */}
      {!sparked ? (
        <button
          onPointerDown={startSqueeze}
          onPointerUp={endSqueeze}
          onPointerLeave={endSqueeze}
          style={{
            ...immersiveTapButton,
            ...navicueType.hint,
            color: verse.palette.text,
            cursor: 'pointer',
          }}
        >
          <span style={{ ...navicueType.hint, fontSize: 11 }}>
            {squeezing ? 'squeezing...' : 'squeeze'}
          </span>
        </button>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: 'hsla(210, 70%, 65%, 0.9)', fontSize: 11 }}>
          voltage harvested
        </motion.div>
      )}

      {/* Pressure bar */}
      {!sparked && (
        <div style={{ width: 80, height: 3, borderRadius: 2, background: verse.palette.primaryGlow, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${pct * 100}%` }}
            style={{ height: '100%', background: crystalColor, borderRadius: 2 }}
          />
        </div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {sparked ? 'stress is power' : `pressure: ${Math.round(pressure)}%`}
      </div>
    </div>
  );
}