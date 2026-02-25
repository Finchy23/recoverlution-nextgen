/**
 * CONDUCTOR #1 -- 1211. The Resistance Check (Heat)
 * "Heat is wasted energy. Drop the resistance. Keep the current."
 * INTERACTION: Tap to accept -- wire cools from red hot to superconductor blue
 * STEALTH KBE: Acceptance -- Radical Acceptance (B)
 *
 * COMPOSITOR: science_x_soul / Circuit / work / believing / tap / 1211
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Conductor_ResistanceCheck({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Circuit',
        chrono: 'work',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1211,
        isSeal: false,
      }}
      arrivalText="A wire. Glowing red."
      prompt="Heat is wasted energy. It means you are resisting the flow. Stop fighting the reality. Drop the resistance. Keep the current."
      resonantText="Acceptance. The current did not change. The resistance did. Radical acceptance is not surrender. It is superconductivity. Zero resistance, maximum flow."
      afterglowCoda="Zero resistance."
      onComplete={onComplete}
    >
      {(verse) => <ResistanceInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ResistanceInteraction({ verse }: { verse: any }) {
  const [resistance, setResistance] = useState(1); // 1=max, 0=superconductor
  const [accepted, setAccepted] = useState(false);
  const [done, setDone] = useState(false);
  const [heatPulse, setHeatPulse] = useState(0);

  // Heat pulse animation while resisting
  useEffect(() => {
    if (accepted) return;
    const interval = setInterval(() => {
      setHeatPulse(prev => prev + 1);
    }, 300);
    return () => clearInterval(interval);
  }, [accepted]);

  // Smooth cooling after acceptance
  useEffect(() => {
    if (!accepted) return;
    const interval = setInterval(() => {
      setResistance(prev => {
        const next = Math.max(0, prev - 0.02);
        if (next <= 0) {
          clearInterval(interval);
          setDone(true);
          setTimeout(() => verse.advance(), 2500);
        }
        return next;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [accepted, verse]);

  const btn = immersiveTapButton(verse.palette, 'accent');

  // Wire color interpolation: red-hot -> cool blue
  const wireHue = 0 + (1 - resistance) * 210; // 0=red, 210=blue
  const wireSat = 60 - (1 - resistance) * 20;
  const wireLight = 50 + (1 - resistance) * 10;
  const wireColor = `hsla(${wireHue}, ${wireSat}%, ${wireLight}%, ${safeOpacity(0.5 + resistance * 0.3)})`;
  const glowColor = `hsla(${wireHue}, ${wireSat}%, ${wireLight}%, ${resistance * 0.3})`;

  const SCENE_W = 260;
  const SCENE_H = 100;

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Wire visualization */}
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Heat glow behind wire */}
          <motion.ellipse
            cx={SCENE_W / 2} cy={SCENE_H / 2}
            rx={100} ry={30}
            fill={glowColor}
            animate={{ opacity: resistance * 0.4 }}
          />

          {/* Wire path */}
          <motion.path
            d={`M 20,${SCENE_H / 2} C 80,${SCENE_H / 2 - 10} 180,${SCENE_H / 2 + 10} ${SCENE_W - 20},${SCENE_H / 2}`}
            fill="none"
            stroke={wireColor}
            strokeWidth={resistance > 0.5 ? 3 : 2}
            strokeLinecap="round"
            animate={{
              y: !accepted && heatPulse % 2 === 0 ? [-1, 1] : 0,
            }}
            transition={{ duration: 0.15 }}
          />

          {/* Heat waves (visible when resisting) */}
          {resistance > 0.3 && Array.from({ length: 4 }).map((_, i) => (
            <motion.path
              key={i}
              d={`M ${60 + i * 40},${SCENE_H / 2 - 15} Q ${70 + i * 40},${SCENE_H / 2 - 25} ${80 + i * 40},${SCENE_H / 2 - 15}`}
              fill="none"
              stroke={wireColor}
              strokeWidth={0.6}
              animate={{
                opacity: [resistance * 0.2, resistance * 0.4, resistance * 0.2],
                y: [-2, -8, -2],
              }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
            />
          ))}

          {/* Current flow arrows (visible when conducting) */}
          {resistance < 0.5 && Array.from({ length: 3 }).map((_, i) => (
            <motion.circle
              key={`flow-${i}`}
              cy={SCENE_H / 2}
              r={2}
              fill={verse.palette.accent}
              animate={{
                cx: [30 + i * 60, SCENE_W - 30],
                opacity: [0, safeOpacity(0.5 - resistance), 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5 - (1 - resistance) * 0.8,
                delay: i * 0.4,
              }}
            />
          ))}

          {/* Terminal dots */}
          <circle cx={20} cy={SCENE_H / 2} r={4}
            fill={verse.palette.primary} opacity={safeOpacity(0.3)} />
          <circle cx={SCENE_W - 20} cy={SCENE_H / 2} r={4}
            fill={verse.palette.primary} opacity={safeOpacity(0.3)} />
        </svg>
      </div>

      {/* Resistance readout */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>resistance</span>
        <div style={{ width: 80, height: 3, borderRadius: 2, background: verse.palette.primaryFaint }}>
          <motion.div
            animate={{ width: `${resistance * 100}%` }}
            style={{
              height: '100%', borderRadius: 2,
              background: resistance > 0.5
                ? `hsla(0, 50%, 55%, 0.6)`
                : verse.palette.accent,
              opacity: 0.6,
            }}
          />
        </div>
        <span style={{ ...navicueType.data, color: verse.palette.text }}>
          {resistance > 0.01 ? `${Math.round(resistance * 100)}%` : '0'}
        </span>
      </div>

      {/* Accept button */}
      {!accepted && (
        <motion.button
          style={btn.base}
          whileTap={btn.active}
          onClick={() => setAccepted(true)}
        >
          accept
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'superconductor'
          : accepted
            ? 'cooling...'
            : 'the wire is burning. stop fighting.'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          radical acceptance
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'acceptance' : 'resistance check'}
      </div>
    </div>
  );
}
