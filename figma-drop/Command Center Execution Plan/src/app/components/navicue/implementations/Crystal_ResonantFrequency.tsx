/**
 * CRYSTAL #5 -- 1125. The Resonant Frequency
 * "Sing the truth until the lie shatters."
 * INTERACTION: Hold to hum/match a tone -- glass vibrates then shatters at resonance
 * STEALTH KBE: Vocal Alignment -- resonance (E)
 *
 * COMPOSITOR: sacred_ordinary / Glacier / social / embodying / hold / 1125
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Crystal_ResonantFrequency({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Glacier',
        chrono: 'social',
        kbe: 'e',
        hook: 'hold',
        specimenSeed: 1125,
        isSeal: false,
      }}
      arrivalText="A glass. Waiting for the right frequency."
      prompt="Everything has a natural frequency. If you match it perfectly, the structure cannot hold. Sing the truth until the lie shatters."
      resonantText="Vocal Alignment. You held the note. The glass could not resist its own nature. When truth vibrates at the right frequency, the lie cannot maintain its shape."
      afterglowCoda="Breakthrough."
      onComplete={onComplete}
    >
      {(verse) => <ResonantFrequencyInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ResonantFrequencyInteraction({ verse }: { verse: any }) {
  const [holding, setHolding] = useState(false);
  const [resonance, setResonance] = useState(0);
  const [shattered, setShattered] = useState(false);
  const [vibration, setVibration] = useState(0);
  const RESONANCE_TARGET = 100;

  useEffect(() => {
    if (!holding || shattered) return;
    const interval = setInterval(() => {
      setResonance(prev => {
        const next = prev + 1.5;
        setVibration(next / RESONANCE_TARGET);
        if (next >= RESONANCE_TARGET) {
          setShattered(true);
          clearInterval(interval);
          setTimeout(() => verse.advance(), 2500);
        }
        return Math.min(next, RESONANCE_TARGET);
      });
    }, 60);
    return () => clearInterval(interval);
  }, [holding, shattered, verse]);

  useEffect(() => {
    if (holding || shattered) return;
    const interval = setInterval(() => {
      setResonance(prev => Math.max(0, prev - 0.8));
      setVibration(prev => Math.max(0, prev - 0.02));
    }, 60);
    return () => clearInterval(interval);
  }, [holding, shattered]);

  const startHold = useCallback(() => { if (!shattered) setHolding(true); }, [shattered]);
  const endHold = useCallback(() => setHolding(false), []);

  const pct = resonance / RESONANCE_TARGET;

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Glass */}
      <div style={navicueStyles.heroCssScene(verse.palette, 140 / 130)}>
        <AnimatePresence mode="wait">
          {!shattered ? (
            <motion.div
              key="glass"
              animate={{
                x: holding ? [-(vibration * 3), vibration * 3, -(vibration * 2)] : 0,
                borderColor: `hsla(0, 0%, ${60 + pct * 20}%, ${0.3 + pct * 0.3})`,
              }}
              transition={holding ? { repeat: Infinity, duration: 0.1 } : {}}
              style={{
                width: 36, height: 50,
                borderRadius: '0 0 18px 18px',
                borderTop: 'none',
                border: `2px solid hsla(0, 0%, 60%, 0.3)`,
                background: `hsla(0, 0%, 80%, ${0.05 + pct * 0.08})`,
                position: 'relative',
              }}
            >
              {/* Stem */}
              <div style={{
                position: 'absolute', bottom: -15, left: '50%',
                width: 3, height: 15,
                background: 'hsla(0, 0%, 60%, 0.2)',
                transform: 'translateX(-50%)',
              }} />
              {/* Base */}
              <div style={{
                position: 'absolute', bottom: -18, left: '50%',
                width: 24, height: 3, borderRadius: 2,
                background: 'hsla(0, 0%, 60%, 0.2)',
                transform: 'translateX(-50%)',
              }} />
            </motion.div>
          ) : (
            <motion.div
              key="shattered"
              initial={{ scale: 1 }}
              animate={{ scale: 1.2 }}
              style={{ display: 'flex', gap: 3, flexWrap: 'wrap', width: 50, justifyContent: 'center' }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 0.6 }}
                  animate={{
                    x: (Math.random() - 0.5) * 40,
                    y: (Math.random() - 0.5) * 40,
                    opacity: 0.15,
                    rotate: Math.random() * 180,
                  }}
                  transition={{ duration: 0.6 }}
                  style={{
                    width: 6 + Math.random() * 6,
                    height: 4 + Math.random() * 4,
                    background: 'hsla(0, 0%, 75%, 0.3)',
                    borderRadius: 1,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sound waves */}
        {holding && !shattered && (
          <>
            {[1, 2, 3].map(r => (
              <motion.div
                key={r}
                animate={{ scale: [0.8, 1.2], opacity: [0.15, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: r * 0.15 }}
                style={{
                  position: 'absolute', top: '45%', left: '50%',
                  width: 30 + r * 15, height: 30 + r * 15,
                  borderRadius: '50%',
                  border: `1px solid ${verse.palette.accent}`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Action */}
      {!shattered ? (
        <motion.button
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          style={{
            ...immersiveTapButton(verse.palette).base,
            background: holding ? verse.palette.primaryFaint : 'transparent',
          }}
          whileTap={immersiveTapButton(verse.palette).active}
        >
          {holding ? 'holding the note...' : 'sing'}
        </motion.button>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          breakthrough
        </motion.div>
      )}

      {!shattered && (
        <div style={{ width: 80, height: 3, borderRadius: 2, background: verse.palette.primaryGlow, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${pct * 100}%` }}
            style={{ height: '100%', background: verse.palette.accent, borderRadius: 2 }}
          />
        </div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {shattered ? 'resonance' : `frequency: ${Math.round(pct * 100)}%`}
      </div>
    </div>
  );
}