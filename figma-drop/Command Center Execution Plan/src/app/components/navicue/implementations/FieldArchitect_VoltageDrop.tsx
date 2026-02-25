/**
 * FIELD ARCHITECT #8 -- 1108. The Voltage Drop (Leakage)
 * "Tape the wire. Send the energy to the bulb."
 * INTERACTION: Frayed wire with sparks -- tap to tape the fray -- light brightens
 * STEALTH KBE: Resource Management -- energy conservation (K)
 *
 * COMPOSITOR: pattern_glitch / Stellar / work / knowing / tap / 1108
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const LEAKS = ['gossip', 'resentment', 'scrolling'];

export default function FieldArchitect_VoltageDrop({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Stellar',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1108,
        isSeal: false,
      }}
      arrivalText="The wire is frayed. Sparks flying."
      prompt="You are generating enough power, but you are leaking it on petty arguments. Tape the wire. Send the energy to the bulb."
      resonantText="Resource Management. The power was always sufficient. The problem was the frays. You patched them, and the dim light became a beacon. Conservation is generation."
      afterglowCoda="No leaks."
      onComplete={onComplete}
    >
      {(verse) => <VoltageDropInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function VoltageDropInteraction({ verse }: { verse: any }) {
  const [leaks, setLeaks] = useState<string[]>([...LEAKS]);
  const [brightness, setBrightness] = useState(0.2);
  const [patched, setPatched] = useState(false);
  const [sparkPositions, setSparkPositions] = useState<{ x: number; y: number; opacity: number }[]>([]);

  // Sparks animation
  useEffect(() => {
    if (patched) { setSparkPositions([]); return; }
    const interval = setInterval(() => {
      setSparkPositions(
        leaks.map((_, i) => ({
          x: 30 + i * 50 + (Math.random() - 0.5) * 20,
          y: 45 + (Math.random() - 0.5) * 15,
          opacity: 0.3 + Math.random() * 0.5,
        }))
      );
    }, 200);
    return () => clearInterval(interval);
  }, [leaks.length, patched]);

  const patchLeak = useCallback((leak: string) => {
    setLeaks(prev => {
      const next = prev.filter(l => l !== leak);
      const newBrightness = 0.2 + ((LEAKS.length - next.length) / LEAKS.length) * 0.8;
      setBrightness(newBrightness);
      if (next.length === 0) {
        setPatched(true);
        setTimeout(() => verse.advance(), 2200);
      }
      return next;
    });
  }, [verse]);

  const bulbColor = `hsla(45, 70%, ${Math.round(30 + brightness * 40)}%, ${brightness})`;

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 200 / 90)}>
        {/* Wire */}
        <div style={{ position: 'relative', width: 200, height: 90 }}>
          {/* Wire */}
          <div style={{
            position: 'absolute', top: 40, left: 10, right: 40,
            height: 2,
            background: verse.palette.primaryGlow,
            opacity: 0.3,
          }} />

          {/* Spark locations */}
          {sparkPositions.map((sp, i) => (
            <motion.div
              key={i}
              animate={{ opacity: sp.opacity, scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                left: sp.x, top: sp.y,
                width: 4, height: 4, borderRadius: '50%',
                background: 'hsla(40, 80%, 60%, 0.7)',
              }}
            />
          ))}

          {/* Bulb */}
          <motion.div
            animate={{
              boxShadow: patched
                ? `0 0 30px ${bulbColor}`
                : `0 0 ${Math.round(brightness * 15)}px ${bulbColor}`,
            }}
            style={{
              position: 'absolute', right: 10, top: 25,
              width: 30, height: 30, borderRadius: '50%',
              background: bulbColor,
              border: `1px solid ${verse.palette.primaryGlow}`,
            }}
          />
        </div>

        {/* Leak patches */}
        {leaks.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 10, opacity: 0.5 }}>
              patch the leaks
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {leaks.map(leak => (
                <motion.button key={leak} onClick={() => patchLeak(leak)}
                  style={immersiveTapButton(verse.palette).base}
                  whileTap={immersiveTapButton(verse.palette).active}>
                  {leak}
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ ...navicueType.hint, color: 'hsla(45, 70%, 60%, 0.9)', fontSize: 11 }}
            >
              full brightness
            </motion.div>
          </AnimatePresence>
        )}

        <div style={navicueStyles.kbeLabel(verse.palette)}>
          {patched ? 'energy conserved' : `${leaks.length} leak${leaks.length !== 1 ? 's' : ''} remaining`}
        </div>
      </div>
    </div>
  );
}