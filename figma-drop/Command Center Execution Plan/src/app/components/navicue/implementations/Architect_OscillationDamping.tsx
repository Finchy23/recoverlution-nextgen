/**
 * ARCHITECT #6 -- 1326. The Oscillation Damping
 * "Apply friction at the nadir. Dampen the wave."
 * INTERACTION: Tap at the bottom of each swing to dampen the pendulum
 * STEALTH KBE: Regulation -- Crisis Management (E)
 *
 * COMPOSITOR: witness_ritual / Pulse / night / embodying / tap / 1326
 */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Architect_OscillationDamping({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Pulse',
        chrono: 'night',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1326,
        isSeal: false,
      }}
      arrivalText="A pendulum. Swinging wildly."
      prompt="The system is out of control. Apply friction at the nadir. Dampen the wave before it breaks the machine."
      resonantText="Regulation. You timed the touch and the pendulum stilled. Crisis management is oscillation damping: do not fight the swing at its peak. Meet it at the bottom, where a gentle touch has the most effect."
      afterglowCoda="Dampen the wave."
      onComplete={onComplete}
    >
      {(verse) => <OscillationDampingInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function OscillationDampingInteraction({ verse }: { verse: any }) {
  const [amplitude, setAmplitude] = useState(55);
  const [angle, setAngle] = useState(0);
  const [done, setDone] = useState(false);
  const frameRef = useRef(0);
  const timeRef = useRef(0);
  const ampRef = useRef(55);

  useEffect(() => {
    ampRef.current = amplitude;
  }, [amplitude]);

  useEffect(() => {
    const tick = () => {
      timeRef.current += 0.035;
      const a = ampRef.current;
      const newAngle = Math.sin(timeRef.current * 2.5) * a;
      setAngle(newAngle);
      if (a > 3) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const handleDampen = () => {
    if (done) return;
    // Check if near nadir (center = good timing)
    const nearCenter = Math.abs(angle) < 15;
    const reduction = nearCenter ? 18 : 5;
    const newAmp = Math.max(0, amplitude - reduction);
    setAmplitude(newAmp);

    if (newAmp <= 3 && !done) {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 180;
  const PIVOT = { x: W / 2, y: 25 };
  const LENGTH = 110;

  const rad = (angle * Math.PI) / 180;
  const bobX = PIVOT.x + Math.sin(rad) * LENGTH;
  const bobY = PIVOT.y + Math.cos(rad) * LENGTH;

  const nearCenter = Math.abs(angle) < 15;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>amplitude</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : amplitude > 35 ? verse.palette.shadow : verse.palette.text,
        }}>
          {done ? 'stable' : `${Math.round(amplitude)}°`}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Pivot mount */}
          <rect x={PIVOT.x - 15} y={PIVOT.y - 5} width={30} height={8} rx={2}
            fill={verse.palette.primary} opacity={safeOpacity(0.1)} />
          <circle cx={PIVOT.x} cy={PIVOT.y} r={3}
            fill={verse.palette.primary} opacity={safeOpacity(0.15)} />

          {/* Pendulum rod */}
          <line x1={PIVOT.x} y1={PIVOT.y} x2={bobX} y2={bobY}
            stroke={verse.palette.primary} strokeWidth={1.5}
            opacity={safeOpacity(0.2)} />

          {/* Trail arc */}
          {amplitude > 5 && (
            <motion.path
              d={`M ${PIVOT.x + Math.sin(-amplitude * Math.PI / 180) * LENGTH},${PIVOT.y + Math.cos(-amplitude * Math.PI / 180) * LENGTH} A ${LENGTH} ${LENGTH} 0 0 1 ${PIVOT.x + Math.sin(amplitude * Math.PI / 180) * LENGTH},${PIVOT.y + Math.cos(amplitude * Math.PI / 180) * LENGTH}`}
              fill="none" stroke={verse.palette.primary}
              strokeWidth={0.5} strokeDasharray="3 3"
              opacity={safeOpacity(0.06)}
            />
          )}

          {/* Bob */}
          <circle cx={bobX} cy={bobY} r={12}
            fill={verse.palette.accent} opacity={safeOpacity(done ? 0.2 : 0.1)} />
          <circle cx={bobX} cy={bobY} r={12}
            fill="none" stroke={verse.palette.accent}
            strokeWidth={done ? 1.5 : 1}
            opacity={safeOpacity(done ? 0.4 : 0.25)} />

          {/* Nadir zone indicator */}
          {!done && (
            <g>
              <line x1={PIVOT.x} y1={PIVOT.y + LENGTH - 15}
                x2={PIVOT.x} y2={PIVOT.y + LENGTH + 15}
                stroke={nearCenter ? verse.palette.accent : verse.palette.primary}
                strokeWidth={0.5} strokeDasharray="2 2"
                opacity={safeOpacity(nearCenter ? 0.2 : 0.06)} />
              <text x={PIVOT.x} y={H - 5} textAnchor="middle"
                fill={nearCenter ? verse.palette.accent : verse.palette.textFaint}
                style={{ fontSize: '7px' }}
                opacity={nearCenter ? 0.4 : 0.15}>
                nadir
              </text>
            </g>
          )}

          {/* Damping ripple on good timing */}
          {done && (
            <motion.circle
              cx={PIVOT.x} cy={PIVOT.y + LENGTH}
              fill={verse.palette.accent}
              initial={{ r: 12, opacity: 0.2 }}
              animate={{ r: 40, opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          )}
        </svg>
      </div>

      {!done && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleDampen}>
          touch
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'the pendulum stilled'
          : nearCenter ? 'now. at the nadir.'
            : 'time the touch. wait for the bottom.'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          crisis management
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'regulation' : 'dampen the wave'}
      </div>
    </div>
  );
}
