/**
 * CYBERNETICIST #2 -- 1092. The Negative Feedback Loop
 * "Do not decide to rest. Build the rest into the loop."
 * INTERACTION: Temperature rises -- tap to engage the fan -- homeostasis
 * STEALTH KBE: System Design -- automated self-care (B)
 *
 * COMPOSITOR: science_x_soul / Circuit / work / believing / tap / 1092
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Cyberneticist_NegativeFeedbackLoop({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Circuit',
        chrono: 'work',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1092,
        isSeal: false,
      }}
      arrivalText="Temperature rising."
      prompt="When the system gets too hot, the cooling must be automatic. Do not decide to rest. Build the rest into the loop."
      resonantText="System Design. You connected stress to rest. The loop runs itself now. Homeostasis is not a choice you make. It is a system you build."
      afterglowCoda="Homeostasis."
      onComplete={onComplete}
    >
      {(verse) => <NegativeFeedbackInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function NegativeFeedbackInteraction({ verse }: { verse: any }) {
  const [temp, setTemp] = useState(68);
  const [fanOn, setFanOn] = useState(false);
  const [loopBuilt, setLoopBuilt] = useState(false);
  const [phase, setPhase] = useState<'rising' | 'cooling' | 'stable'>('rising');
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  // Temperature rises naturally
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTemp(prev => {
        if (phase === 'stable') return prev;
        if (fanOn && prev > 70) return prev - 0.8;
        if (!fanOn) return Math.min(prev + 0.5, 99);
        return prev;
      });
    }, 120);
    return () => clearInterval(intervalRef.current);
  }, [fanOn, phase]);

  // Check homeostasis
  useEffect(() => {
    if (fanOn && temp <= 72 && temp >= 68 && !loopBuilt) {
      setLoopBuilt(true);
      setPhase('stable');
      setTimeout(() => verse.advance(), 2000);
    }
  }, [temp, fanOn, loopBuilt, verse]);

  const toggleFan = useCallback(() => {
    setFanOn(f => !f);
    if (!fanOn) setPhase('cooling');
  }, [fanOn]);

  const heatPct = Math.min(1, Math.max(0, (temp - 68) / 30));
  const barColor = loopBuilt
    ? 'hsla(140, 40%, 50%, 0.7)'
    : `hsla(${Math.round(40 - 40 * heatPct)}, ${Math.round(40 + 30 * heatPct)}%, ${Math.round(50 - 5 * heatPct)}%, 0.7)`;

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Thermometer */}
      <div style={{
        width: 30,
        height: 140,
        borderRadius: 15,
        border: `1px solid ${verse.palette.primaryGlow}`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <motion.div
          animate={{ height: `${Math.max(5, heatPct * 100)}%` }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            background: barColor,
            borderRadius: '0 0 15px 15px',
          }}
        />
      </div>

      <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 12 }}>
        {Math.round(temp)}deg
      </span>

      {/* Fan button */}
      {!loopBuilt && (
        <motion.button onClick={toggleFan}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          {fanOn ? 'fan running' : 'engage fan'}
        </motion.button>
      )}

      {/* Fan visual */}
      {fanOn && (
        <motion.div
          animate={{ rotate: loopBuilt ? 0 : 360 }}
          transition={{ repeat: loopBuilt ? 0 : Infinity, duration: 0.8, ease: 'linear' }}
          style={{
            width: 28, height: 28, borderRadius: '50%',
            border: `1px solid ${verse.palette.accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ ...navicueType.micro, color: verse.palette.accent }}>+</span>
        </motion.div>
      )}

      <AnimatePresence>
        {loopBuilt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ ...navicueType.hint, color: 'hsla(140, 40%, 55%, 0.8)', fontSize: 11 }}
          >
            homeostasis
          </motion.div>
        )}
      </AnimatePresence>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'rising' ? 'stress building' : phase === 'cooling' ? 'cooling...' : 'loop built'}
      </div>
    </div>
  );
}