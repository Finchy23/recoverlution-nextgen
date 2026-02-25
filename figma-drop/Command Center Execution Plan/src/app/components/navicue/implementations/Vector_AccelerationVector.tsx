/**
 * VECTOR #7 -- 1187. The Acceleration Vector
 * "If you feel the pressure, you are accelerating."
 * INTERACTION: Moving fast, feel nothing. Speed up. G-force. Hold through the shake.
 * STEALTH KBE: Discomfort Tolerance -- growth tolerance (E)
 *
 * COMPOSITOR: sensory_cinema / Drift / social / embodying / hold / 1187
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Vector_AccelerationVector({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Drift',
        chrono: 'social',
        kbe: 'e',
        hook: 'hold',
        specimenSeed: 1187,
        isSeal: false,
      }}
      arrivalText="Cruising. Comfortable."
      prompt="You only feel the change. If you are comfortable, you are coasting. If you feel the pressure, you are accelerating."
      resonantText="Discomfort Tolerance. Constant velocity feels like nothing. Acceleration feels like pressure. You held through the G-force. Growth tolerance is the willingness to feel the push."
      afterglowCoda="Accelerating."
      onComplete={onComplete}
    >
      {(verse) => <AccelerationInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function AccelerationInteraction({ verse }: { verse: any }) {
  const [holding, setHolding] = useState(false);
  const [accel, setAccel] = useState(0);
  const [done, setDone] = useState(false);
  const ACCEL_TARGET = 100;

  useEffect(() => {
    if (!holding || done) return;
    const interval = setInterval(() => {
      setAccel(prev => {
        const next = prev + 1.2;
        if (next >= ACCEL_TARGET) {
          setDone(true);
          setHolding(false);
          setTimeout(() => verse.advance(), 2200);
          return ACCEL_TARGET;
        }
        return next;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [holding, done, verse]);

  const startHold = useCallback(() => {
    if (done) return;
    setHolding(true);
  }, [done]);

  const endHold = useCallback(() => {
    setHolding(false);
  }, []);

  const pct = accel / ACCEL_TARGET;
  const shakeAmt = holding ? pct * 3 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <motion.div
        animate={{
          x: holding ? (Math.random() - 0.5) * shakeAmt * 2 : 0,
          y: holding ? (Math.random() - 0.5) * shakeAmt : 0,
        }}
        transition={{ duration: 0.05 }}
        style={{ position: 'relative', width: 160, height: 90 }}
      >
        <svg viewBox="0 0 160 90" style={navicueStyles.heroSvg}>
          {/* Speed lines (increase with acceleration) */}
          {Array.from({ length: Math.floor(pct * 8) + 2 }).map((_, i) => (
            <line key={i}
              x1={10 + i * 5} y1={20 + i * 7}
              x2={10 + i * 5 - pct * 15} y2={20 + i * 7}
              stroke={done ? verse.palette.accent : 'hsla(0, 0%, 50%, 0.15)'}
              strokeWidth={1}
              opacity={0.1 + pct * 0.2}
            />
          ))}

          {/* Arrow (velocity + acceleration) */}
          <line x1={50} y1={50} x2={50 + 40 + pct * 40} y2={50}
            stroke={done ? verse.palette.accent : 'hsla(200, 30%, 55%, 0.4)'}
            strokeWidth={2} strokeLinecap="round" />
          <circle cx={50 + 40 + pct * 40} cy={50} r={2}
            fill={done ? verse.palette.accent : 'hsla(200, 30%, 55%, 0.4)'} />

          {/* Readouts */}
          <text x={15} y={15}
            style={{ ...navicueType.hint, fontSize: 8 }}
            fill={verse.palette.textFaint} opacity={0.3}>
            v: {(60 + pct * 40).toFixed(0)}
          </text>
          <text x={15} y={25}
            style={{ ...navicueType.hint, fontSize: 8 }}
            fill={holding ? verse.palette.accent : verse.palette.textFaint}
            opacity={holding ? 0.5 : 0.3}>
            a: {holding ? (pct * 9.8).toFixed(1) + 'g' : '0'}
          </text>

          {/* G-force indicator */}
          {pct > 0.3 && (
            <text x={80} y={35} textAnchor="middle"
              style={{ ...navicueType.hint, fontSize: 9 }}
              fill={done ? verse.palette.accent : 'hsla(0, 25%, 50%, 0.3)'}
              opacity={pct * 0.5}>
              {done ? 'through' : 'pressure'}
            </text>
          )}
        </svg>
      </motion.div>

      {!done ? (
        <motion.button
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          style={{
            ...immersiveTapButton(verse.palette).base,
            background: holding ? `${verse.palette.accent}22` : undefined,
          }}
          whileTap={immersiveTapButton(verse.palette).active}
        >
          {holding ? 'holding...' : 'hold to accelerate'}
        </motion.button>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          accelerating
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {done ? 'growth tolerance' : `g-force: ${(pct * 100).toFixed(0)}%`}
      </div>
    </div>
  );
}