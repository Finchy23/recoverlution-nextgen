/**
 * HYDRODYNAMICIST #5 -- 1135. The Hydraulic Press
 * "Leverage allows the weak to lift the strong. Multiply your force."
 * INTERACTION: Cannot lift car -- use hydraulic lever -- small push lifts massive weight
 * STEALTH KBE: Leverage -- strategic advantage (K)
 *
 * COMPOSITOR: science_x_soul / Tide / work / knowing / tap / 1135
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Hydrodynamicist_HydraulicPress({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Tide',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1135,
        isSeal: false,
      }}
      arrivalText="A car. Too heavy to lift."
      prompt="Leverage allows the weak to lift the strong. Do not use your back. Use the fluid. Multiply your force."
      resonantText="Leverage. A small push moved a massive weight. You did not get stronger. You got smarter. Strategic advantage is the physics of the underdog."
      afterglowCoda="Multiplied."
      onComplete={onComplete}
    >
      {(verse) => <HydraulicPressInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function HydraulicPressInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'try' | 'failed' | 'lever' | 'lifting' | 'lifted'>('try');
  const [liftY, setLiftY] = useState(0);

  const tryDirect = useCallback(() => {
    if (phase !== 'try') return;
    setPhase('failed');
  }, [phase]);

  const useLever = useCallback(() => {
    if (phase !== 'failed') return;
    setPhase('lever');
  }, [phase]);

  const pushLever = useCallback(() => {
    if (phase !== 'lever') return;
    setPhase('lifting');
    let y = 0;
    const lift = setInterval(() => {
      y += 1;
      setLiftY(y);
      if (y >= 25) {
        setPhase('lifted');
        clearInterval(lift);
        setTimeout(() => verse.advance(), 2000);
      }
    }, 40);
  }, [phase, verse]);

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 180 / 120)}>
        {/* Ground */}
        <div style={{
          position: 'absolute', bottom: 10, left: 10, right: 10,
          height: 1, background: verse.palette.primaryGlow, opacity: 0.15,
        }} />

        {/* Car (heavy object) */}
        <motion.div
          animate={{ y: -liftY }}
          style={{
            position: 'absolute', bottom: 15, left: 50,
            width: 60, height: 25, borderRadius: '4px 4px 2px 2px',
            background: 'hsla(0, 0%, 40%, 0.25)',
            border: `1px solid ${verse.palette.primaryGlow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ ...navicueType.micro, color: verse.palette.textFaint, opacity: 0.4 }}>
            heavy
          </span>
          {/* Wheels */}
          <div style={{
            position: 'absolute', bottom: -5, left: 8,
            width: 8, height: 8, borderRadius: '50%',
            background: 'hsla(0, 0%, 35%, 0.3)', border: `1px solid ${verse.palette.primaryGlow}`,
          }} />
          <div style={{
            position: 'absolute', bottom: -5, right: 8,
            width: 8, height: 8, borderRadius: '50%',
            background: 'hsla(0, 0%, 35%, 0.3)', border: `1px solid ${verse.palette.primaryGlow}`,
          }} />
        </motion.div>

        {/* Hydraulic lever (visible after failed) */}
        {(phase === 'lever' || phase === 'lifting' || phase === 'lifted') && (
          <>
            {/* Cylinder */}
            <motion.div
              animate={{ height: 20 + liftY }}
              style={{
                position: 'absolute', bottom: 12, left: 75,
                width: 10, borderRadius: 2,
                background: `linear-gradient(to top, hsla(200, 30%, 45%, 0.3), hsla(200, 30%, 55%, 0.2))`,
                border: `1px solid ${verse.palette.primaryGlow}`,
              }}
            />
            {/* Small lever arm */}
            <div style={{
              position: 'absolute', bottom: 12, right: 20,
              width: 30, height: 6, borderRadius: 2,
              background: 'hsla(200, 25%, 45%, 0.25)',
              border: `1px solid ${verse.palette.primaryGlow}`,
            }} />
          </>
        )}

        {/* Force multiplier label */}
        {(phase === 'lifting' || phase === 'lifted') && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            style={{
              position: 'absolute', top: 5, right: 5,
              ...navicueType.hint, color: verse.palette.accent, fontSize: 9,
            }}
          >
            10x
          </motion.span>
        )}
      </div>

      {/* Actions */}
      {phase === 'try' && (
        <motion.button onClick={tryDirect}
          style={immersiveTapButton(verse.palette, 'faint').base}
          whileTap={immersiveTapButton(verse.palette, 'faint').active}>
          lift it
        </motion.button>
      )}
      {phase === 'failed' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={navicueStyles.shadowAnnotation(verse.palette)}>
            too heavy
          </span>
          <motion.button onClick={useLever}
            style={immersiveTapButton(verse.palette).base}
            whileTap={immersiveTapButton(verse.palette).active}>
            use hydraulics
          </motion.button>
        </div>
      )}
      {phase === 'lever' && (
        <motion.button onClick={pushLever}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          small push
        </motion.button>
      )}
      {phase === 'lifting' && (
        <span style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11, opacity: 0.6 }}>
          lifting...
        </span>
      )}
      {phase === 'lifted' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          multiplied
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'lifted' ? 'strategic advantage' : phase === 'failed' ? 'brute force failed' : 'leverage'}
      </div>
    </div>
  );
}