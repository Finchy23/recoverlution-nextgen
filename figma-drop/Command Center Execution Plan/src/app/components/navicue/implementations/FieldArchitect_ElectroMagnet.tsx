/**
 * FIELD ARCHITECT #7 -- 1107. The Electro-Magnet (The Switch)
 * "You turn it on to lift the room. You turn it off to drop the weight."
 * INTERACTION: Heavy load -- tap power on (lifts) -- tap power off (drops) -- feel the release
 * STEALTH KBE: Role Transition -- role decompression (E)
 *
 * COMPOSITOR: poetic_precision / Stellar / social / embodying / tap / 1107
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function FieldArchitect_ElectroMagnet({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Stellar',
        chrono: 'social',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1107,
        isSeal: false,
      }}
      arrivalText="A heavy load. Immovable."
      prompt="Charisma is an electromagnet. You turn it on to lift the room. You turn it off to drop the weight. Do not carry it home."
      resonantText="Role Transition. You lifted and you released. The power was never in the carrying. It was in the switching. On at work, off at home. The weight is not yours to hold forever."
      afterglowCoda="Switch off."
      onComplete={onComplete}
    >
      {(verse) => <ElectroMagnetInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ElectroMagnetInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'off' | 'on' | 'lifting' | 'lifted' | 'releasing' | 'released'>('off');
  const [loadY, setLoadY] = useState(0);

  const togglePower = useCallback(() => {
    if (phase === 'off') {
      setPhase('on');
      setTimeout(() => {
        setPhase('lifting');
        // Animate lift
        let y = 0;
        const lift = setInterval(() => {
          y -= 3;
          setLoadY(y);
          if (y <= -60) {
            clearInterval(lift);
            setPhase('lifted');
          }
        }, 40);
      }, 400);
    } else if (phase === 'lifted') {
      setPhase('releasing');
      // Animate drop
      let y = -60;
      const drop = setInterval(() => {
        y += 8;
        setLoadY(y);
        if (y >= 0) {
          clearInterval(drop);
          setLoadY(0);
          setPhase('released');
          setTimeout(() => verse.advance(), 2000);
        }
      }, 30);
    }
  }, [phase, verse]);

  const powerOn = phase !== 'off' && phase !== 'releasing' && phase !== 'released';

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 120 / 180)}>
        {/* Core */}
        <div style={{ position: 'relative', width: 120, height: 180 }}>
          {/* Vertical arm */}
          <div style={{
            position: 'absolute', top: 0, left: '50%', width: 2, height: 50,
            background: verse.palette.primaryGlow, opacity: 0.3,
            transform: 'translateX(-50%)',
          }} />

          {/* Electromagnet head */}
          <motion.div
            animate={{
              boxShadow: powerOn ? `0 0 16px ${verse.palette.accent}` : 'none',
            }}
            style={{
              position: 'absolute', top: 46, left: '50%',
              width: 40, height: 20, borderRadius: '10px 10px 0 0',
              border: `1px solid ${powerOn ? verse.palette.accent : verse.palette.primaryGlow}`,
              transform: 'translateX(-50%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: powerOn ? 0.7 : 0.3,
            }}
          >
            {powerOn && (
              <motion.div
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ repeat: Infinity, duration: 1 }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: verse.palette.accent }}
              />
            )}
          </motion.div>

          {/* Cable line to load */}
          {powerOn && loadY < 0 && (
            <div style={{
              position: 'absolute', top: 66, left: '50%',
              width: 1, height: Math.abs(loadY),
              background: verse.palette.accent,
              opacity: 0.3,
              transform: 'translateX(-50%)',
            }} />
          )}

          {/* Load */}
          <motion.div
            animate={{ y: loadY }}
            style={{
              position: 'absolute', bottom: 20, left: '50%',
              width: 60, height: 40, borderRadius: 6,
              border: `1px solid ${verse.palette.primaryGlow}`,
              background: 'hsla(0, 0%, 30%, 0.2)',
              transform: 'translateX(-50%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ ...navicueStyles.annotation(verse.palette, 0.5) }}>
              weight
            </span>
          </motion.div>

          {/* Ground line */}
          <div style={{
            position: 'absolute', bottom: 10, left: 10, right: 10,
            height: 1, background: verse.palette.primaryGlow, opacity: 0.15,
          }} />
        </div>

        {/* Action */}
        {phase === 'off' && (
          <motion.button onClick={togglePower}
            style={immersiveTapButton(verse.palette).base}
            whileTap={immersiveTapButton(verse.palette).active}>
            power on
          </motion.button>
        )}
        {phase === 'lifted' && (
          <motion.button onClick={togglePower}
            style={immersiveTapButton(verse.palette).base}
            whileTap={immersiveTapButton(verse.palette).active}>
            release
          </motion.button>
        )}
        {(phase === 'on' || phase === 'lifting') && (
          <span style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11, opacity: 0.5 }}>
            lifting...
          </span>
        )}
        {phase === 'released' && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}
            >
              released
            </motion.div>
          </AnimatePresence>
        )}

        <div style={navicueStyles.kbeLabel(verse.palette)}>
          {phase === 'released' ? 'decompressed' : phase === 'lifted' ? 'carrying' : phase === 'off' ? 'heavy' : 'working'}
        </div>
      </div>
    </div>
  );
}