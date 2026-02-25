/**
 * AVIATOR #3 -- 1143. The Thrust-to-Weight Ratio
 * "If you cannot increase the thrust, decrease the mass."
 * INTERACTION: Rocket too heavy -- dump ego cargo -- blast off
 * STEALTH KBE: Prioritization -- essentialism (K)
 *
 * COMPOSITOR: koan_paradox / Drift / work / knowing / tap / 1143
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const CARGO = [
  { id: 0, label: 'ego', weight: 200 },
  { id: 1, label: 'pride', weight: 150 },
  { id: 2, label: 'image', weight: 100 },
  { id: 3, label: 'status', weight: 50 },
];

export default function Aviator_ThrustToWeightRatio({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Drift',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1143,
        isSeal: false,
      }}
      arrivalText="A rocket. Too heavy to fly."
      prompt="Gravity is a constant. Weight is a variable. If you cannot increase the thrust, you must decrease the mass. What are you carrying that you do not need?"
      resonantText="Prioritization. You dropped the weight and the rocket flew. You did not need more power. You needed less cargo. Essentialism is the fuel of flight."
      afterglowCoda="Blast off."
      onComplete={onComplete}
    >
      {(verse) => <ThrustWeightInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ThrustWeightInteraction({ verse }: { verse: any }) {
  const [jettisoned, setJettisoned] = useState<Set<number>>(new Set());
  const [launched, setLaunched] = useState(false);
  const [rocketY, setRocketY] = useState(0);
  const THRUST = 900;

  const totalWeight = 1000 - CARGO.filter(c => jettisoned.has(c.id)).reduce((s, c) => s + c.weight, 0);
  const canLaunch = THRUST > totalWeight;

  const jettison = useCallback((id: number) => {
    if (launched) return;
    setJettisoned(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, [launched]);

  const launch = useCallback(() => {
    if (!canLaunch || launched) return;
    setLaunched(true);
    let y = 0;
    const interval = setInterval(() => {
      y -= 3;
      setRocketY(y);
      if (y <= -80) {
        clearInterval(interval);
        setTimeout(() => verse.advance(), 1500);
      }
    }, 30);
  }, [canLaunch, launched, verse]);

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 160 / 120)}>
        {/* Pad */}
        <div style={{
          position: 'absolute', bottom: 10, left: 55, right: 55,
          height: 3, borderRadius: 1,
          background: verse.palette.primaryGlow, opacity: 0.2,
        }} />

        {/* Rocket */}
        <motion.div
          animate={{ y: rocketY }}
          style={{
            position: 'absolute', bottom: 15, left: '50%',
            width: 20, height: 50,
            transform: 'translateX(-50%)',
          }}
        >
          {/* Nose cone */}
          <div style={{
            width: 0, height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderBottom: `15px solid hsla(210, 20%, 50%, 0.3)`,
          }} />
          {/* Body */}
          <div style={{
            width: 20, height: 30,
            background: `hsla(210, 15%, 45%, ${0.2 + (canLaunch ? 0.1 : 0)})`,
            border: `1px solid ${verse.palette.primaryGlow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ ...navicueType.micro, color: verse.palette.textFaint, opacity: 0.5 }}>
              {totalWeight}
            </span>
          </div>
          {/* Exhaust */}
          {launched && (
            <motion.div
              animate={{ height: [5, 15, 8], opacity: [0.4, 0.7, 0.4] }}
              transition={{ repeat: Infinity, duration: 0.2 }}
              style={{
                width: 14, height: 10, marginLeft: 3,
                background: `linear-gradient(to bottom, hsla(30, 60%, 55%, 0.5), hsla(20, 70%, 50%, 0.3), transparent)`,
                borderRadius: '0 0 4px 4px',
              }}
            />
          )}
        </motion.div>

        {/* Stats */}
        <div style={{ position: 'absolute', top: 5, right: 5 }}>
          <span style={{ ...navicueStyles.annotation(verse.palette, 0.5), display: 'block' }}>
            thrust: {THRUST}
          </span>
          <span style={{
            ...navicueType.micro,
            color: canLaunch ? verse.palette.accent : verse.palette.shadow,
            display: 'block',
          }}>
            weight: {totalWeight}
          </span>
        </div>
      </div>

      {/* Cargo to jettison */}
      {!launched && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {CARGO.map(c => (
            <AnimatePresence key={c.id}>
              {!jettisoned.has(c.id) && (
                <motion.button
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={() => jettison(c.id)}
                  style={immersiveTapButton(verse.palette, 'faint').base}
                  whileTap={immersiveTapButton(verse.palette, 'faint').active}
                >
                  {c.label} ({c.weight})
                </motion.button>
              )}
            </AnimatePresence>
          ))}
        </div>
      )}

      {/* Launch */}
      {canLaunch && !launched && (
        <motion.button onClick={launch}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          launch
        </motion.button>
      )}
      {launched && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={navicueStyles.accentHint(verse.palette)}>
          liftoff
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {launched ? 'essentialism' : canLaunch ? 'ready' : 'too heavy'}
      </div>
    </div>
  );
}