/**
 * FIELD ARCHITECT #5 -- 1105. The Induced Current (Inspiration)
 * "Motivation is induced by motion. Move the magnet."
 * INTERACTION: Drag the magnet back and forth inside a coil -- coil lights up
 * STEALTH KBE: Activation -- state generation (E)
 *
 * COMPOSITOR: sensory_cinema / Stellar / work / embodying / drag / 1105
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, navicueInteraction } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function FieldArchitect_InducedCurrent({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Stellar',
        chrono: 'work',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1105,
        isSeal: false,
      }}
      arrivalText="A dead coil. No light."
      prompt="Motivation does not strike like lightning. It is induced by motion. Move the magnet. The movement creates the charge."
      resonantText="Activation. You moved first. The energy came second. You did not wait for inspiration. You generated it with friction. Action creates power."
      afterglowCoda="Motion creates charge."
      onComplete={onComplete}
    >
      {(verse) => <InducedCurrentInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function InducedCurrentInteraction({ verse }: { verse: any }) {
  const [magnetX, setMagnetX] = useState(0);
  const [charge, setCharge] = useState(0);
  const [lit, setLit] = useState(false);
  const lastXRef = useRef(0);
  const velocityRef = useRef(0);
  const CHARGE_TARGET = 100;

  const handleDrag = useCallback((_: any, info: any) => {
    if (lit) return;
    const speed = Math.abs(info.delta.x);
    velocityRef.current = speed;
    setMagnetX(prev => prev + info.delta.x);
    // Faster movement = more charge
    setCharge(prev => {
      const next = Math.min(CHARGE_TARGET, prev + speed * 0.4);
      if (next >= CHARGE_TARGET && !lit) {
        setLit(true);
        setTimeout(() => verse.advance(), 2200);
      }
      return next;
    });
  }, [lit, verse]);

  const chargePct = charge / CHARGE_TARGET;
  const bulbColor = lit
    ? 'hsla(45, 80%, 65%, 0.9)'
    : `hsla(45, ${Math.round(20 + chargePct * 60)}%, ${Math.round(25 + chargePct * 40)}%, ${0.2 + chargePct * 0.7})`;

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Coil */}
      <div style={{
        width: 160, height: 60, borderRadius: 30,
        border: `1px solid ${verse.palette.primaryGlow}`,
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* Coil lines */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: 12 + i * 18,
            top: 8, bottom: 8,
            width: 1,
            background: verse.palette.primaryGlow,
            opacity: 0.15 + chargePct * 0.2,
          }} />
        ))}

        {/* Magnet */}
        {!lit && (
          <motion.div
            drag="x"
            dragConstraints={{ left: -55, right: 55 }}
            dragElastic={0.1}
            dragMomentum={false}
            onDrag={handleDrag}
            style={{
              width: 28, height: 28, borderRadius: 4,
              background: `linear-gradient(135deg, hsla(0, 45%, 50%, 0.6), hsla(220, 40%, 50%, 0.6))`,
              border: `1px solid ${verse.palette.primaryGlow}`,
              cursor: 'grab',
              touchAction: 'none',
              zIndex: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>N S</span>
          </motion.div>
        )}
      </div>

      {/* Wire to bulb */}
      <div style={{ width: 1, height: 20, background: verse.palette.primaryGlow, opacity: 0.2 + chargePct * 0.3 }} />

      {/* Bulb */}
      <motion.div
        animate={{
          boxShadow: lit
            ? `0 0 30px ${bulbColor}, 0 0 60px hsla(45, 80%, 65%, 0.3)`
            : `0 0 ${Math.round(chargePct * 15)}px ${bulbColor}`,
        }}
        style={{
          width: 36, height: 36, borderRadius: '50%',
          background: bulbColor,
          border: `1px solid ${verse.palette.primaryGlow}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {lit && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ fontSize: 14 }}
          >
            *
          </motion.span>
        )}
      </motion.div>

      {/* Status */}
      <AnimatePresence mode="wait">
        {lit ? (
          <motion.div
            key="lit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ ...navicueType.hint, color: 'hsla(45, 70%, 60%, 0.9)', fontSize: 11 }}
          >
            power generated
          </motion.div>
        ) : (
          <motion.div key="charging" style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11, opacity: 0.5 }}>
            move the magnet
          </motion.div>
        )}
      </AnimatePresence>

      {/* Charge bar */}
      {!lit && (
        <div style={{ width: 80, height: 3, borderRadius: 2, background: verse.palette.primaryGlow, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${chargePct * 100}%` }}
            style={{ height: '100%', background: bulbColor, borderRadius: 2 }}
          />
        </div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {lit ? 'state generated' : `charge: ${Math.round(charge)}%`}
      </div>
    </div>
  );
}