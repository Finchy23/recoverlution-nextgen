/**
 * AVIATOR #8 -- 1148. The Ground Effect
 * "When you are empty, stay low. Ride the cushion."
 * INTERACTION: Low on fuel -- hold steady just above ocean surface -- efficiency bonus
 * STEALTH KBE: Resource Conservation -- survival strategy (E)
 *
 * COMPOSITOR: witness_ritual / Drift / night / embodying / hold / 1148
 */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Aviator_GroundEffect({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Drift',
        chrono: 'night',
        kbe: 'e',
        hook: 'hold',
        specimenSeed: 1148,
        isSeal: false,
      }}
      arrivalText="Low on fuel. The ocean below."
      prompt="When you are empty, stay low. The earth pushes back. Ride the cushion of air until you find the fuel."
      resonantText="Resource Conservation. You flew low and the ground held you up. When you have nothing left, the earth itself becomes your lift. Survival strategy is not about having more. It is about wasting less."
      afterglowCoda="Carried."
      onComplete={onComplete}
    >
      {(verse) => <GroundEffectInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function GroundEffectInteraction({ verse }: { verse: any }) {
  const [holding, setHolding] = useState(false);
  const [distance, setDistance] = useState(0); // 0-100
  const [done, setDone] = useState(false);
  const [fuel, setFuel] = useState(8); // Very low fuel
  const DISTANCE_TARGET = 100;

  useEffect(() => {
    if (!holding || done) return;
    const interval = setInterval(() => {
      setDistance(prev => {
        const next = prev + 0.8;
        setFuel(f => Math.max(0, f - 0.05)); // Very slow fuel burn in ground effect
        if (next >= DISTANCE_TARGET) {
          setDone(true);
          clearInterval(interval);
          setTimeout(() => verse.advance(), 2200);
        }
        return Math.min(next, DISTANCE_TARGET);
      });
    }, 60);
    return () => clearInterval(interval);
  }, [holding, done, verse]);

  // Fuel drains faster when not in ground effect
  useEffect(() => {
    if (holding || done) return;
    if (fuel <= 0) return;
    const interval = setInterval(() => {
      setFuel(prev => Math.max(0, prev - 0.15));
    }, 60);
    return () => clearInterval(interval);
  }, [holding, done, fuel]);

  const startHold = useCallback(() => { if (!done) setHolding(true); }, [done]);
  const endHold = useCallback(() => setHolding(false), []);

  const pct = distance / DISTANCE_TARGET;

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={{ ...navicueStyles.heroCssScene(verse.palette, 180 / 100), overflow: 'hidden' }}>
        {/* Ocean scene */}
        <div style={{ position: 'relative', width: 180, height: 100, overflow: 'hidden' }}>
          {/* Ocean surface */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 25,
            background: 'hsla(210, 30%, 30%, 0.1)',
          }}>
            {/* Waves */}
            {[0, 1, 2, 3].map(i => (
              <motion.div key={i}
                animate={{ x: [i * 40, i * 40 + 10, i * 40] }}
                transition={{ repeat: Infinity, duration: 1.5 + i * 0.3 }}
                style={{
                  position: 'absolute', top: 2,
                  left: i * 45, width: 30, height: 2,
                  background: 'hsla(200, 30%, 50%, 0.15)',
                  borderRadius: 1,
                }}
              />
            ))}
          </div>

          {/* Air cushion (visible when holding) */}
          {holding && !done && (
            <motion.div
              animate={{ opacity: [0.08, 0.15, 0.08] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              style={{
                position: 'absolute', bottom: 22, left: 60, right: 60,
                height: 10,
                background: `linear-gradient(to bottom, hsla(200, 30%, 55%, 0.1), transparent)`,
                borderRadius: '50%',
              }}
            />
          )}

          {/* Plane */}
          <motion.div
            animate={{
              y: holding ? [0, -1, 0] : -3,
            }}
            transition={holding ? { repeat: Infinity, duration: 0.6 } : {}}
            style={{
              position: 'absolute', bottom: 28, left: '50%',
              width: 24, height: 6,
              background: done ? verse.palette.accent : 'hsla(210, 20%, 50%, 0.3)',
              borderRadius: '60% 40% 40% 60%',
              border: `1px solid ${verse.palette.primaryGlow}`,
              transform: 'translateX(-50%)',
              opacity: done ? 0.5 : 0.4,
            }}
          />

          {/* Fuel gauge */}
          <div style={{ position: 'absolute', top: 8, right: 8 }}>
            <span style={navicueStyles.annotation(verse.palette)}>
              fuel
            </span>
            <div style={{
              width: 30, height: 4, borderRadius: 2, marginTop: 2,
              background: verse.palette.primaryGlow, overflow: 'hidden',
            }}>
              <div style={{
                width: `${(fuel / 8) * 100}%`, height: '100%',
                background: fuel < 3 ? verse.palette.shadow : verse.palette.accent,
                borderRadius: 2,
              }} />
            </div>
          </div>

          {/* Efficiency bonus */}
          {holding && (
            <span style={{
              position: 'absolute', top: 8, left: 8,
              ...navicueStyles.accentReadout(verse.palette, 0.4),
            }}>
              +50% efficiency
            </span>
          )}

          {/* Distance */}
          <div style={{
            position: 'absolute', bottom: 3, left: 8,
            width: 60, height: 2, borderRadius: 1,
            background: verse.palette.primaryGlow, overflow: 'hidden', opacity: 0.3,
          }}>
            <motion.div animate={{ width: `${pct * 100}%` }}
              style={{ height: '100%', background: verse.palette.accent, borderRadius: 1 }} />
          </div>
        </div>

        {/* Action */}
        {!done ? (
          <motion.button
            onPointerDown={startHold}
            onPointerUp={endHold}
            onPointerLeave={endHold}
            style={immersiveTapButton(verse.palette).base}
            whileTap={immersiveTapButton(verse.palette).active}
          >
            {holding ? 'riding the cushion...' : 'fly low'}
          </motion.button>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={navicueStyles.accentHint(verse.palette)}>
            carried
          </motion.div>
        )}

        <div style={navicueStyles.kbeLabel(verse.palette)}>
          {done ? 'survival strategy' : `distance: ${Math.round(pct * 100)}%`}
        </div>
      </div>
    </div>
  );
}