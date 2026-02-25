/**
 * AVIATOR #9 -- 1149. The Feathered Prop (Failure)
 * "Feather it. Turn the failure so it cuts the wind."
 * INTERACTION: Engine dies -- prop windmills (drag) -- tap to feather -- glide extends
 * STEALTH KBE: Damage Control -- resilience (B)
 *
 * COMPOSITOR: science_x_soul / Drift / social / believing / tap / 1149
 */
import { useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Aviator_FeatheredProp({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Drift',
        chrono: 'social',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1149,
        isSeal: false,
      }}
      arrivalText="Engine failure. The prop is windmilling."
      prompt="The engine died. Do not let the dead prop drag you down. Feather it. Turn the failure so it cuts the wind."
      resonantText="Damage Control. You feathered the prop and the glide extended. The failure was a fact. The drag was optional. Resilience is not preventing the failure. It is managing the aftermath."
      afterglowCoda="Gliding."
      onComplete={onComplete}
    >
      {(verse) => <FeatheredPropInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FeatheredPropInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'windmilling' | 'feathered' | 'gliding'>('windmilling');
  const [altitude, setAltitude] = useState(80);
  const [propAngle, setPropAngle] = useState(0);

  // Prop spinning (windmill drag)
  useEffect(() => {
    if (phase !== 'windmilling') return;
    const interval = setInterval(() => {
      setPropAngle(prev => prev + 15);
      setAltitude(prev => Math.max(10, prev - 0.5)); // Losing altitude fast
    }, 50);
    return () => clearInterval(interval);
  }, [phase]);

  // Slow descent after feathering
  useEffect(() => {
    if (phase !== 'feathered') return;
    setPhase('gliding');
    const interval = setInterval(() => {
      setAltitude(prev => {
        const next = prev - 0.1; // Much slower descent
        if (next <= 50) {
          clearInterval(interval);
          setTimeout(() => verse.advance(), 2000);
        }
        return Math.max(50, next);
      });
    }, 60);
    return () => clearInterval(interval);
  }, [phase, verse]);

  const feather = useCallback(() => {
    if (phase !== 'windmilling') return;
    setPhase('feathered');
  }, [phase]);

  const descentRate = phase === 'windmilling' ? 'high' : 'low';

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 160 / 100)}>
        {/* Wing */}
        <div style={{
          position: 'absolute', top: 45, left: 30, right: 30,
          height: 6, borderRadius: 3,
          background: `hsla(210, 15%, 45%, 0.25)`,
          border: `1px solid ${verse.palette.primaryGlow}`,
        }} />

        {/* Engine nacelle */}
        <div style={{
          position: 'absolute', top: 35, left: 55,
          width: 20, height: 22, borderRadius: '8px 8px 4px 4px',
          background: 'hsla(0, 0%, 35%, 0.2)',
          border: `1px solid ${verse.palette.primaryGlow}`,
        }}>
          {/* Dead engine indicator */}
          <div style={{
            position: 'absolute', top: 3, left: '50%', transform: 'translateX(-50%)',
            width: 4, height: 4, borderRadius: '50%',
            background: verse.palette.shadowFaint,
          }} />
        </div>

        {/* Propeller */}
        <motion.div
          animate={{
            rotate: phase === 'windmilling' ? propAngle : propAngle,
          }}
          transition={phase === 'windmilling' ? { duration: 0 } : { duration: 0.3 }}
          style={{
            position: 'absolute', top: 30, left: 58,
            width: 14, height: 2,
            background: phase === 'gliding'
              ? verse.palette.accent
              : 'hsla(0, 0%, 50%, 0.4)',
            borderRadius: 1,
            transformOrigin: '50% 50%',
            opacity: phase === 'gliding' ? 0.4 : 0.6,
          }}
        />

        {/* Altitude gauge */}
        <div style={{
          position: 'absolute', right: 10, top: 10, bottom: 10,
          width: 4, borderRadius: 2,
          background: verse.palette.primaryGlow, overflow: 'hidden', opacity: 0.15,
        }}>
          <motion.div
            animate={{ height: `${altitude}%` }}
            style={{
              position: 'absolute', bottom: 0, width: '100%',
              background: altitude < 30 ? verse.palette.shadow : verse.palette.accent,
              borderRadius: 2, opacity: 0.5,
            }}
          />
        </div>

        {/* Descent rate */}
        <span style={{
          position: 'absolute', bottom: 5, left: 10,
          ...navicueType.micro,
          color: descentRate === 'high' ? verse.palette.shadow : verse.palette.accent,
          opacity: 0.5,
        }}>
          descent: {descentRate}
        </span>

        {/* Drag label */}
        {phase === 'windmilling' && (
          <motion.span
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            style={{
              position: 'absolute', top: 25, left: 80,
              ...navicueStyles.shadowAnnotation(verse.palette),
            }}
          >
            drag
          </motion.span>
        )}
      </div>

      {/* Action */}
      {phase === 'windmilling' && (
        <motion.button onClick={feather}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          feather the prop
        </motion.button>
      )}
      {phase === 'gliding' && altitude > 50 ? (
        <span style={navicueStyles.accentReadout(verse.palette, 0.6)}>
          gliding...
        </span>
      ) : phase === 'gliding' ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={navicueStyles.accentHint(verse.palette)}>
          glide extended
        </motion.div>
      ) : null}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'gliding' ? 'resilience' : 'windmilling'}
      </div>
    </div>
  );
}