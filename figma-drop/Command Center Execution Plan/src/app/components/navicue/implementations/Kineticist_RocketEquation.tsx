/**
 * KINETICIST #5 -- 1115. The Rocket Equation
 * "The ego is lead. Drop the need to be right."
 * INTERACTION: Rocket too heavy to launch -- tap to jettison 'Ego' cargo -- it launches
 * STEALTH KBE: Subtraction -- understanding drag (K)
 *
 * COMPOSITOR: sacred_ordinary / Storm / work / knowing / tap / 1115
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const CARGO = ['ego', 'approval', 'control'];

export default function Kineticist_RocketEquation({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Storm',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1115,
        isSeal: false,
      }}
      arrivalText="A rocket. Too heavy. Cannot launch."
      prompt="To go to orbit, you have to be light. The ego is lead. Drop the need to be right. Keep the need to be free."
      resonantText="Subtraction. You did not add more fuel. You removed weight. The rocket did not get stronger. It got lighter. Understanding drag is understanding growth."
      afterglowCoda="Light enough to fly."
      onComplete={onComplete}
    >
      {(verse) => <RocketEquationInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function RocketEquationInteraction({ verse }: { verse: any }) {
  const [cargo, setCargo] = useState<string[]>([...CARGO]);
  const [launched, setLaunched] = useState(false);
  const [rocketY, setRocketY] = useState(0);

  const jettison = useCallback((item: string) => {
    setCargo(prev => {
      const next = prev.filter(c => c !== item);
      if (next.length === 0) {
        setLaunched(true);
        // Launch animation
        let y = 0;
        const launch = setInterval(() => {
          y -= 4;
          setRocketY(y);
          if (y <= -120) {
            clearInterval(launch);
            setTimeout(() => verse.advance(), 1500);
          }
        }, 30);
      }
      return next;
    });
  }, [verse]);

  const weightPct = cargo.length / CARGO.length;

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 160 / 160)}>
        {/* Pad line */}
        <div style={{
          position: 'absolute', bottom: 20, left: 20, right: 20,
          height: 1, background: verse.palette.primaryGlow, opacity: 0.15,
        }} />

        {/* Rocket */}
        <motion.div
          animate={{ y: rocketY }}
          style={{
            position: 'absolute', bottom: 30, left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}
        >
          {/* Nose */}
          <div style={{
            width: 0, height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderBottom: `16px solid ${launched ? verse.palette.accent : verse.palette.primaryGlow}`,
            opacity: launched ? 0.8 : 0.4,
          }} />
          {/* Body */}
          <div style={{
            width: 20, height: 40,
            background: launched
              ? `linear-gradient(to bottom, ${verse.palette.accent}, hsla(210, 30%, 40%, 0.5))`
              : verse.palette.primaryGlow,
            opacity: launched ? 0.7 : 0.3,
            borderRadius: '0 0 4px 4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {cargo.length > 0 && (
              <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>
                {cargo.length}
              </span>
            )}
          </div>

          {/* Exhaust */}
          {launched && (
            <motion.div
              animate={{ height: [10, 25, 10], opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 0.3 }}
              style={{
                width: 14,
                background: 'linear-gradient(to bottom, hsla(30, 80%, 55%, 0.6), hsla(0, 70%, 50%, 0.3), transparent)',
                borderRadius: '0 0 50% 50%',
              }}
            />
          )}
        </motion.div>

        {/* Weight indicator */}
        <span style={{
          position: 'absolute', top: 8, right: 8,
          ...navicueStyles.annotation(verse.palette, 0.4),
        }}>
          weight: {Math.round(weightPct * 100)}%
        </span>
      </div>

      {/* Cargo to jettison */}
      {!launched ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={navicueStyles.annotation(verse.palette, 0.5)}>
            jettison the weight
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {cargo.map(item => (
              <motion.button key={item} onClick={() => jettison(item)}
                style={immersiveTapButton(verse.palette).base}
                whileTap={immersiveTapButton(verse.palette).active}>
                {item}
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}
        >
          launched
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {launched ? 'drag removed' : `${cargo.length} item${cargo.length !== 1 ? 's' : ''} holding you down`}
      </div>
    </div>
  );
}