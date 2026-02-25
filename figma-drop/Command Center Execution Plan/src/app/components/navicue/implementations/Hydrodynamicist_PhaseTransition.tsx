/**
 * HYDRODYNAMICIST #8 -- 1138. The Phase Transition (Steam)
 * "If you are trapped, change your state. Rise."
 * INTERACTION: Water in a pot (trapped) -- swipe up to add heat -- turns to steam and escapes
 * STEALTH KBE: State Shift -- transformation (E)
 *
 * COMPOSITOR: witness_ritual / Tide / night / embodying / drag / 1138
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Hydrodynamicist_PhaseTransition({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Tide',
        chrono: 'night',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1138,
        isSeal: false,
      }}
      arrivalText="Water in a pot. Trapped."
      prompt="If you are trapped in the container, change your state. You cannot leave as water. You can leave as steam. Rise."
      resonantText="State Shift. You added heat. The water did not break the pot. It transcended it. Transformation is not escape. It is evolution. Change your state, change your world."
      afterglowCoda="Rise."
      onComplete={onComplete}
    >
      {(verse) => <PhaseTransitionInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function PhaseTransitionInteraction({ verse }: { verse: any }) {
  const [heat, setHeat] = useState(0);
  const [phase, setPhase] = useState<'liquid' | 'boiling' | 'steam'>('liquid');
  const [steamParticles, setSteamParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleDrag = useCallback((_: any, info: any) => {
    if (phase === 'steam') return;
    // Only upward motion adds heat
    if (info.delta.y < 0) {
      setHeat(prev => {
        const next = Math.min(100, prev + Math.abs(info.delta.y) * 0.5);
        if (next >= 60 && phase === 'liquid') {
          setPhase('boiling');
        }
        if (next >= 100 && phase !== 'steam') {
          setPhase('steam');
          setTimeout(() => verse.advance(), 2500);
        }
        return next;
      });
    }
  }, [phase, verse]);

  // Steam animation
  useEffect(() => {
    if (phase !== 'steam') return;
    const interval = setInterval(() => {
      setSteamParticles(prev => {
        const next = prev
          .map(p => ({ ...p, y: p.y - 2, x: p.x + (Math.random() - 0.5) * 2 }))
          .filter(p => p.y > -20);
        if (Math.random() > 0.3) {
          next.push({ id: Date.now(), x: 60 + Math.random() * 40, y: 40 });
        }
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [phase]);

  const heatPct = heat / 100;
  const heatColor = `hsla(${Math.round(200 - heatPct * 180)}, ${Math.round(30 + heatPct * 40)}%, ${Math.round(40 + heatPct * 15)}%, 0.4)`;

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 160 / 130)}>
        {/* Container */}
        <div style={{
          position: 'absolute',
          width: 160, height: 130,
          left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
        }}>
          {/* Pot */}
          <div style={{
            position: 'absolute', bottom: 15, left: 40, right: 40,
            height: 50, borderRadius: '0 0 8px 8px',
            background: 'hsla(0, 0%, 35%, 0.2)',
            border: `1px solid ${verse.palette.primaryGlow}`,
            overflow: 'hidden',
          }}>
            {/* Water level (shrinks as steam) */}
            <motion.div
              animate={{
                height: `${Math.max(20, 100 - (phase === 'steam' ? 80 : 0))}%`,
                background: heatColor,
              }}
              style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                borderRadius: '0 0 7px 7px',
              }}
            />

            {/* Bubbles (boiling) */}
            {phase === 'boiling' && Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ y: [-5, -20], opacity: [0.4, 0] }}
                transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.12 }}
                style={{
                  position: 'absolute', bottom: 8,
                  left: 10 + i * 16,
                  width: 4, height: 4, borderRadius: '50%',
                  border: '1px solid hsla(0, 0%, 60%, 0.3)',
                }}
              />
            ))}
          </div>

          {/* Pot rim */}
          <div style={{
            position: 'absolute', bottom: 63, left: 36, right: 36,
            height: 4, borderRadius: 2,
            background: 'hsla(0, 0%, 40%, 0.25)',
            border: `1px solid ${verse.palette.primaryGlow}`,
          }} />

          {/* Steam particles */}
          {steamParticles.map(p => (
            <motion.div
              key={p.id}
              style={{
                position: 'absolute', left: p.x, top: p.y,
                width: 6, height: 6, borderRadius: '50%',
                background: 'hsla(0, 0%, 75%, 0.15)',
              }}
            />
          ))}

          {/* Heat source */}
          {heat > 10 && (
            <motion.div
              animate={{ opacity: [heatPct * 0.3, heatPct * 0.5, heatPct * 0.3] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
              style={{
                position: 'absolute', bottom: 5, left: 50, right: 50,
                height: 6, borderRadius: 3,
                background: `hsla(${Math.round(30 - heatPct * 20)}, 60%, 50%, 0.4)`,
              }}
            />
          )}
        </div>

        {/* Action */}
        {phase !== 'steam' ? (
          <motion.div
            drag="y"
            dragConstraints={{ top: -60, bottom: 20 }}
            dragElastic={0.1}
            dragMomentum={false}
            onDrag={handleDrag}
            style={{
              ...immersiveTapButton(verse.palette).base,
              cursor: 'grab',
              touchAction: 'none',
            }}
            whileTap={immersiveTapButton(verse.palette).active}
          >
            {phase === 'boiling' ? 'keep heating...' : 'swipe up to heat'}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
            transcended
          </motion.div>
        )}

        {phase !== 'steam' && (
          <div style={{ width: 80, height: 3, borderRadius: 2, background: verse.palette.primaryGlow, overflow: 'hidden' }}>
            <motion.div animate={{ width: `${heatPct * 100}%` }}
              style={{ height: '100%', background: heatColor, borderRadius: 2 }} />
          </div>
        )}

        <div style={navicueStyles.kbeLabel(verse.palette)}>
          {phase === 'steam' ? 'transformation' : phase === 'boiling' ? 'boiling' : `heat: ${Math.round(heat)}%`}
        </div>
      </div>
    </div>
  );
}