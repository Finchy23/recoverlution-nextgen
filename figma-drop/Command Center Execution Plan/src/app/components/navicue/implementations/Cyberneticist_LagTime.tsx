/**
 * CYBERNETICIST #4 -- 1094. The Lag Time
 * "You turned the wheel today. The ship will turn on Tuesday."
 * INTERACTION: Turn the steering wheel of a ship -- hold -- delayed response
 * STEALTH KBE: Patience -- long-term vision (B)
 *
 * COMPOSITOR: koan_paradox / Circuit / night / believing / hold / 1094
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, navicueInteraction, immersiveTapButton, immersiveHoldButton } from '@/app/design-system/navicue-blueprint';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

interface Props { data?: any; onComplete?: () => void; }

export default function Cyberneticist_LagTime({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Circuit',
        chrono: 'night',
        kbe: 'b',
        hook: 'hold',
        specimenSeed: 1094,
        isSeal: false,
      }}
      arrivalText="A massive hull. Still water."
      prompt="Big systems have inertia. You turned the wheel today. The ship will turn on Tuesday. Trust the delay."
      resonantText="Patience. The wheel was turned. The ship responded on its own schedule, not yours. You held through the silence between action and result."
      afterglowCoda="Trust the delay."
      onComplete={onComplete}
    >
      {(verse) => <LagTimeInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function LagTimeInteraction({ verse }: { verse: any }) {
  const [wheelTurned, setWheelTurned] = useState(false);
  const [shipAngle, setShipAngle] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [responded, setResponded] = useState(false);
  const LAG_SECONDS = 4;

  const hold = useHoldInteraction({
    maxDuration: 2000,
    onComplete: () => {
      setWheelTurned(true);
    },
  });

  // Lag: ship responds after delay
  useEffect(() => {
    if (!wheelTurned || responded) return;
    const timer = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 0.1;
        if (next >= LAG_SECONDS) {
          clearInterval(timer);
          setResponded(true);
          setTimeout(() => verse.advance(), 2000);
        }
        return next;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [wheelTurned, responded, verse]);

  // Ship turns after lag
  useEffect(() => {
    if (!responded) return;
    const anim = setInterval(() => {
      setShipAngle(prev => {
        if (prev >= 25) { clearInterval(anim); return 25; }
        return prev + 1;
      });
    }, 40);
    return () => clearInterval(anim);
  }, [responded]);

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Ship indicator */}
      <motion.div
        animate={{ rotate: shipAngle }}
        style={{
          width: 60, height: 80,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${verse.palette.primaryGlow}`,
          borderRadius: '4px 4px 20px 20px',
          opacity: 0.5,
        }}
      >
        <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 10 }}>
          {responded ? 'turning' : 'still'}
        </span>
      </motion.div>

      {/* Wheel */}
      {!wheelTurned ? (() => {
        const btn = immersiveHoldButton(verse.palette);
        return (
          <motion.div
            {...hold.holdProps}
            animate={hold.isHolding ? btn.holding : {}}
            transition={{ duration: 0.2 }}
            style={{ ...hold.holdProps.style, ...btn.base }}
          >
            <svg viewBox="0 0 90 90" style={btn.progressRing.svg}>
              <circle {...btn.progressRing.track} />
              <circle {...btn.progressRing.fill(hold.tension)} />
            </svg>
            <div style={btn.label}>{hold.isHolding ? 'turning wheel...' : 'hold to turn wheel'}</div>
          </motion.div>
        );
      })() : !responded ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11 }}>
            wheel turned. waiting...
          </span>
          {/* Lag progress */}
          <div style={{ width: 100, height: 3, borderRadius: 2, background: verse.palette.primaryGlow, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${(elapsed / LAG_SECONDS) * 100}%` }}
              style={{ height: '100%', background: verse.palette.accent, borderRadius: 2 }}
            />
          </div>
          <span style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 9 }}>
            {Math.max(0, Math.ceil(LAG_SECONDS - elapsed))}s lag
          </span>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}
          >
            the ship responds
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}