/**
 * FULCRUM #7 -- 1207. The Counterweight (Balance)
 * "Add a counterweight. Let gravity help you lift."
 * INTERACTION: Tap to add counterweight (routine/habit). Motor strain stops.
 * STEALTH KBE: Support Systems -- Automated Support (B)
 *
 * COMPOSITOR: science_x_soul / Compass / social / believing / tap / 1207
 */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Fulcrum_Counterweight({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Compass',
        chrono: 'social',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1207,
        isSeal: false,
      }}
      arrivalText="An elevator. The motor is straining."
      prompt="The motor is burning out because you are lifting dead weight. Add a counterweight. Let gravity help you lift."
      resonantText="Support systems. The motor did not get stronger. The system got smarter. Automated support means building the counterweight into the routine so gravity works for you."
      afterglowCoda="Let gravity help."
      onComplete={onComplete}
    >
      {(verse) => <CounterweightInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function CounterweightInteraction({ verse }: { verse: any }) {
  const [hasCounterweight, setHasCounterweight] = useState(false);
  const [motorStrain, setMotorStrain] = useState(1); // 1 = full strain, 0 = none
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(0);

  // Motor strain animation -- shakes when strained
  useEffect(() => {
    if (hasCounterweight || done) return;
    const interval = setInterval(() => {
      setShake(prev => prev + 1);
    }, 200);
    return () => clearInterval(interval);
  }, [hasCounterweight, done]);

  // Smooth motor strain reduction
  useEffect(() => {
    if (!hasCounterweight) return;
    const interval = setInterval(() => {
      setMotorStrain(prev => {
        const next = Math.max(0, prev - 0.04);
        if (next <= 0) {
          clearInterval(interval);
          setDone(true);
          setTimeout(() => verse.advance(), 2500);
        }
        return next;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [hasCounterweight, verse]);

  const btn = immersiveTapButton(verse.palette, 'accent');
  const SCENE_W = 200;
  const SCENE_H = 180;

  const carY = hasCounterweight ? 30 + (1 - motorStrain) * 40 : 60;
  const cwY = hasCounterweight ? 140 - (1 - motorStrain) * 40 : 140;

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Elevator visualization */}
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Shaft */}
          <rect x={40} y={10} width={50} height={160} rx={4}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={0.8} opacity={safeOpacity(0.12)} />

          {/* Motor at top */}
          <motion.g
            animate={!hasCounterweight
              ? { x: shake % 2 === 0 ? -1 : 1 }
              : { x: 0 }
            }
          >
            <rect x={50} y={5} width={30} height={12} rx={2}
              fill={verse.palette.primary}
              opacity={safeOpacity(0.15 + motorStrain * 0.15)} />
            {/* Motor strain indicator */}
            <motion.circle
              cx={65} cy={11} r={3}
              fill={motorStrain > 0.3 ? verse.palette.shadow : verse.palette.accent}
              animate={{
                opacity: safeOpacity(motorStrain > 0.3 ? 0.4 + motorStrain * 0.3 : 0.3),
              }}
            />
          </motion.g>

          {/* Cable */}
          <line x1={65} y1={17} x2={65} y2={carY}
            stroke={verse.palette.primary}
            strokeWidth={0.8} opacity={safeOpacity(0.2)} />

          {/* Car */}
          <motion.rect
            x={48} y={carY} width={34} height={28} rx={3}
            fill={verse.palette.primary}
            animate={{ y: carY }}
            transition={{ type: 'spring', stiffness: 60, damping: 15 }}
            opacity={safeOpacity(0.2)}
          />

          {/* Counterweight side */}
          {hasCounterweight && (
            <>
              {/* Pulley at top */}
              <circle cx={135} cy={14} r={6}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={1} opacity={safeOpacity(0.4)} />
              {/* Cable to counterweight */}
              <line x1={65} y1={14} x2={135} y2={14}
                stroke={verse.palette.primary}
                strokeWidth={0.6} opacity={safeOpacity(0.15)} />
              <line x1={135} y1={20} x2={135} y2={cwY}
                stroke={verse.palette.primary}
                strokeWidth={0.8} opacity={safeOpacity(0.2)} />
              {/* Counterweight block */}
              <motion.rect
                x={120} y={cwY} width={30} height={20} rx={3}
                fill={verse.palette.accent}
                animate={{ y: cwY }}
                transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                opacity={safeOpacity(0.25)}
              />
              <motion.text
                x={135} y={cwY + 13}
                textAnchor="middle"
                fill={verse.palette.accent}
                style={navicueType.micro}
                opacity={0.5}
              >
                habit
              </motion.text>
            </>
          )}
        </svg>
      </div>

      {/* Motor status */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>motor strain</span>
          <div style={{ width: 60, height: 3, borderRadius: 2, background: verse.palette.primaryFaint }}>
            <motion.div
              animate={{ width: `${motorStrain * 100}%` }}
              style={{
                height: '100%', borderRadius: 2,
                background: motorStrain > 0.5 ? verse.palette.shadow : verse.palette.accent,
                opacity: 0.6,
              }}
            />
          </div>
        </div>
      </div>

      {/* Action */}
      {!hasCounterweight && (
        <motion.button
          style={btn.base}
          whileTap={btn.active}
          onClick={() => setHasCounterweight(true)}
        >
          add counterweight
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'the motor hums silently'
          : hasCounterweight
            ? 'gravity is helping now'
            : 'the motor is burning out'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          automated support
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'support systems' : 'balance the system'}
      </div>
    </div>
  );
}
