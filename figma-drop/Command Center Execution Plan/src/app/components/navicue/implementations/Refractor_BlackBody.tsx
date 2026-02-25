/**
 * REFRACTOR #7 -- 1047. The Black Body (Absorption)
 * "You are absorbing their anger. Be white. Reflect the energy."
 * INTERACTION: Tap to switch from absorb to reflect mode
 * STEALTH KBE: Boundaries -- psychological shielding (B)
 *
 * COMPOSITOR: relational_ghost / Stellar / social / believing / tap / 1047
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Refractor_BlackBody({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'relational_ghost',
        form: 'Stellar',
        chrono: 'social',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1047,
        isSeal: false,
      }}
      arrivalText="Energy arriving."
      prompt="You are absorbing their anger. It is heating you up. Be white. Reflect the energy. Do not let it enter the system."
      resonantText="Boundaries. A black body absorbs all wavelengths and heats up. A white body reflects them and stays cool. You get to choose your albedo."
      afterglowCoda="Reflect."
      onComplete={onComplete}
    >
      {(verse) => <BlackBodyInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function BlackBodyInteraction({ verse }: { verse: any }) {
  const [mode, setMode] = useState<'absorb' | 'reflect'>('absorb');
  const [heat, setHeat] = useState(60);
  const [cooled, setCooled] = useState(false);

  const handleReflect = () => {
    setMode('reflect');
    // Animate heat decreasing
    let h = heat;
    const iv = setInterval(() => {
      h -= 3;
      setHeat(h);
      if (h <= 10) {
        clearInterval(iv);
        setCooled(true);
        setTimeout(() => verse.advance(), 2000);
      }
    }, 80);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Two bodies comparison */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end' }}>
        {/* Absorb body */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <motion.div
            style={{
              width: 50,
              height: 50,
              borderRadius: 8,
              background: mode === 'absorb'
                ? `hsla(0, ${heat * 0.6}%, ${15 + heat * 0.2}%, 0.8)`
                : `hsla(0, 10%, 12%, 0.6)`,
              border: `1px solid ${mode === 'absorb' ? `hsla(0, 40%, 40%, 0.5)` : verse.palette.primaryFaint}`,
              position: 'relative',
              overflow: 'hidden',
            }}
            animate={mode === 'absorb' ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {/* Incoming energy arrows (absorbed) */}
            {mode === 'absorb' && Array.from({ length: 3 }, (_, i) => (
              <motion.div
                key={i}
                style={{
                  position: 'absolute',
                  width: 1,
                  height: 12,
                  background: 'hsla(45, 50%, 60%, 0.4)',
                  left: 12 + i * 14,
                  top: -15,
                }}
                animate={{ y: [0, 60], opacity: [0.5, 0] }}
                transition={{ duration: 0.8, delay: i * 0.3, repeat: Infinity }}
              />
            ))}
          </motion.div>
          <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>absorb</span>
        </div>

        {/* Reflect body */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <motion.div
            style={{
              width: 50,
              height: 50,
              borderRadius: 8,
              background: mode === 'reflect'
                ? `hsla(0, 0%, 85%, 0.15)`
                : `hsla(0, 0%, 70%, 0.08)`,
              border: `1px solid ${mode === 'reflect' ? verse.palette.accent : verse.palette.primaryFaint}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Bouncing energy arrows (reflected) */}
            {mode === 'reflect' && Array.from({ length: 3 }, (_, i) => (
              <motion.div
                key={i}
                style={{
                  position: 'absolute',
                  width: 1,
                  height: 10,
                  background: `${verse.palette.accent}88`,
                  left: 12 + i * 14,
                  top: 25,
                }}
                animate={{ y: [0, -40], opacity: [0.5, 0] }}
                transition={{ duration: 0.6, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </motion.div>
          <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>reflect</span>
        </div>
      </div>

      {/* Temperature indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>temp</span>
        <div style={{ width: 80, height: 4, background: verse.palette.primaryFaint, borderRadius: 2 }}>
          <motion.div
            style={{
              height: '100%',
              borderRadius: 2,
              background: heat > 40 ? 'hsla(0, 50%, 50%, 0.6)' : verse.palette.accent,
            }}
            animate={{ width: `${heat}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>

      {/* Action */}
      {mode === 'absorb' && (
        <motion.button onClick={handleReflect}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          reflect
        </motion.button>
      )}

      {cooled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          cool
        </motion.div>
      )}
    </div>
  );
}