/**
 * CATALYST #8 -- 1068. The Inert Gas (Protection)
 * "Surround yourself with boundaries so the spark doesn't catch."
 * INTERACTION: Tap to flood the chamber with argon before oxygen arrives
 * STEALTH KBE: Shielding -- protective regulation (E)
 *
 * COMPOSITOR: relational_ghost / Glacier / social / embodying / tap / 1068
 */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Catalyst_InertGas({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'relational_ghost',
        form: 'Glacier',
        chrono: 'social',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1068,
        isSeal: false,
      }}
      arrivalText="A volatile chemical. Unprotected."
      prompt="You are reactive. You need a buffer gas. Surround yourself with boundaries so the spark does not catch."
      resonantText="Shielding. The inert gas does not fight the oxygen. It simply fills the space. Boundaries are not walls. They are atmosphere."
      afterglowCoda="Fill the space."
      onComplete={onComplete}
    >
      {(verse) => <InertGasInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function InertGasInteraction({ verse }: { verse: any }) {
  const [shielded, setShielded] = useState(false);
  const [oxygenApproach, setOxygenApproach] = useState(0); // 0 to 1
  const [exploded, setExploded] = useState(false);
  const [safe, setSafe] = useState(false);

  // Oxygen approaches over time
  useEffect(() => {
    if (safe || exploded) return;
    const timer = setInterval(() => {
      setOxygenApproach(prev => {
        const next = prev + 0.01;
        if (next >= 1 && !shielded) {
          setExploded(true);
          clearInterval(timer);
          // Reset after explosion
          setTimeout(() => {
            setExploded(false);
            setOxygenApproach(0);
          }, 2000);
          return 1;
        }
        if (next >= 1 && shielded) {
          setSafe(true);
          clearInterval(timer);
          setTimeout(() => verse.advance(), 2000);
          return 1;
        }
        return next;
      });
    }, 80);
    return () => clearInterval(timer);
  }, [shielded, safe, exploded]);

  const handleShield = () => {
    setShielded(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      {/* Chamber */}
      <div style={{
        width: 160,
        height: 120,
        borderRadius: 12,
        border: `1px solid ${verse.palette.primaryGlow}`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Argon shield fill */}
        {shielded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle, ${verse.palette.accent}, transparent)`,
            }}
          />
        )}

        {/* Volatile chemical in center */}
        <motion.div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 24,
            height: 24,
            borderRadius: 4,
            border: `1px solid hsla(50, 60%, 50%, 0.4)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          animate={exploded ? { scale: [1, 3, 0], opacity: [1, 1, 0] } : {}}
          transition={{ duration: 0.6 }}
        >
          <div style={{ width: 8, height: 8, borderRadius: 2, background: 'hsla(50, 60%, 50%, 0.3)' }} />
        </motion.div>

        {/* Approaching oxygen */}
        {!safe && !exploded && (
          <motion.div
            style={{
              position: 'absolute',
              right: 160 - oxygenApproach * 120,
              top: '45%',
              width: 14,
              height: 14,
              borderRadius: '50%',
              border: '1px solid hsla(0, 50%, 50%, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ ...navicueType.micro, color: 'hsla(0, 50%, 50%, 0.5)' }}>O</span>
          </motion.div>
        )}

        {/* Blocked indicator */}
        {shielded && oxygenApproach > 0.6 && !safe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            style={{
              position: 'absolute',
              right: 35,
              top: '42%',
              ...navicueType.hint,
              color: verse.palette.accent,
              fontSize: 11,
            }}
          >
            blocked
          </motion.div>
        )}

        {/* Explosion flash */}
        {exploded && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle, hsla(30, 80%, 50%, 0.4), transparent)',
            }}
          />
        )}

        {/* Safe indicator */}
        {safe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ ...navicueType.hint, color: verse.palette.accent }}>
              protected
            </span>
          </motion.div>
        )}
      </div>

      {/* Urgency */}
      {!shielded && !exploded && !safe && (
        <div style={{ ...navicueType.hint, color: oxygenApproach > 0.6 ? 'hsla(0, 40%, 60%, 0.6)' : verse.palette.textFaint }}>
          {oxygenApproach > 0.6 ? 'oxygen approaching fast' : 'oxygen is approaching'}
        </div>
      )}

      {exploded && (
        <div style={{ ...navicueType.hint, color: 'hsla(0, 40%, 60%, 0.5)' }}>
          too late. try again.
        </div>
      )}

      {/* Shield button */}
      {!shielded && !safe && (
        <motion.button onClick={handleShield}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          activate argon shield
        </motion.button>
      )}
    </div>
  );
}