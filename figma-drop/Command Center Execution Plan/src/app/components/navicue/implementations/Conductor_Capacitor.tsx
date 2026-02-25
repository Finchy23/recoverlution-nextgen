/**
 * CONDUCTOR #4 -- 1214. The Capacitor (Storage)
 * "Store the energy. Wait for the capacity to fill. Then release."
 * INTERACTION: Hold to charge. Premature tap = weak flash. Full charge = blast.
 * STEALTH KBE: Restraint -- Power Management (E)
 *
 * COMPOSITOR: science_x_soul / Pulse / morning / embodying / hold / 1214
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveHoldButton,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

interface Props { data?: any; onComplete?: () => void; }

export default function Conductor_Capacitor({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Pulse',
        chrono: 'morning',
        kbe: 'e',
        hook: 'hold',
        specimenSeed: 1214,
        isSeal: false,
      }}
      arrivalText="Energy flows in."
      prompt="Trickle charge is weak. Store the energy. Wait for the capacity to fill. Then release it in one decisive pulse."
      resonantText="Restraint. The premature flash was a flicker. The full charge was a lightning bolt. Power management is not about having more energy. It is about releasing it at the right moment."
      afterglowCoda="Charge. Then release."
      onComplete={onComplete}
    >
      {(verse) => <CapacitorInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function CapacitorInteraction({ verse }: { verse: any }) {
  const [charge, setCharge] = useState(0);
  const [released, setReleased] = useState(false);
  const [premature, setPremature] = useState(false);
  const [blastRadius, setBlastRadius] = useState(0);
  const [done, setDone] = useState(false);

  const hold = useHoldInteraction({
    maxDuration: 5000,
    tickRate: 40,
    onThreshold: (t: number) => {
      setCharge(t);
    },
    onComplete: () => {
      setCharge(1);
    },
  });

  // Charging tracks hold tension
  useEffect(() => {
    if (hold.isHolding) {
      setCharge(hold.tension);
    }
  }, [hold.tension, hold.isHolding]);

  const handleRelease = useCallback(() => {
    if (released || done) return;
    setReleased(true);

    if (charge < 0.9) {
      // Premature release -- weak flash
      setPremature(true);
      setBlastRadius(charge * 30);
      setTimeout(() => {
        setPremature(false);
        setReleased(false);
        setCharge(0);
      }, 2000);
    } else {
      // Full charge -- decisive blast
      setBlastRadius(120);
      setDone(true);
      setTimeout(() => verse.advance(), 2800);
    }
  }, [charge, released, done, verse]);

  const holdBtn = immersiveHoldButton(verse.palette, 100, 28);
  const releaseBtn = immersiveTapButton(verse.palette, charge >= 0.9 ? 'accent' : 'faint');

  const SCENE_W = 200;
  const SCENE_H = 100;

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Capacitor visualization */}
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Capacitor plates */}
          <rect x={80} y={15} width={4} height={70} rx={1}
            fill={verse.palette.primary} opacity={safeOpacity(0.3)} />
          <rect x={116} y={15} width={4} height={70} rx={1}
            fill={verse.palette.primary} opacity={safeOpacity(0.3)} />

          {/* Charge fill between plates */}
          <motion.rect
            x={86} y={15 + 70 * (1 - charge)}
            width={28}
            height={70 * charge}
            rx={2}
            fill={verse.palette.accent}
            animate={{
              opacity: safeOpacity(charge * 0.3),
              height: 70 * charge,
              y: 15 + 70 * (1 - charge),
            }}
          />

          {/* Input wire */}
          <line x1={20} y1={50} x2={80} y2={50}
            stroke={verse.palette.primary} strokeWidth={1}
            opacity={safeOpacity(0.2)} />

          {/* Output wire */}
          <line x1={120} y1={50} x2={180} y2={50}
            stroke={verse.palette.primary} strokeWidth={1}
            opacity={safeOpacity(0.2)} />

          {/* Input flow particles */}
          {hold.isHolding && Array.from({ length: 3 }).map((_, i) => (
            <motion.circle
              key={i}
              cy={50} r={1.5}
              fill={verse.palette.accent}
              animate={{
                cx: [25, 78],
                opacity: [0, safeOpacity(0.5), 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.8,
                delay: i * 0.25,
              }}
            />
          ))}

          {/* Blast effect */}
          {released && (
            <motion.circle
              cx={150} cy={50}
              fill={verse.palette.accent}
              initial={{ r: 0, opacity: 0.6 }}
              animate={{
                r: blastRadius,
                opacity: 0,
              }}
              transition={{ duration: done ? 1.5 : 0.5 }}
            />
          )}
        </svg>
      </div>

      {/* Charge readout */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>charge</span>
        <div style={{ width: 100, height: 4, borderRadius: 2, background: verse.palette.primaryFaint }}>
          <motion.div
            animate={{ width: `${charge * 100}%` }}
            style={{
              height: '100%', borderRadius: 2,
              background: charge >= 0.9 ? verse.palette.accent : verse.palette.primary,
              opacity: 0.6,
            }}
          />
        </div>
        <span style={{
          ...navicueType.data,
          color: charge >= 0.9 ? verse.palette.accent : verse.palette.text,
        }}>
          {Math.round(charge * 100)}%
        </span>
      </div>

      {/* Hold to charge + release */}
      {!done && (
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {/* Hold zone */}
          <motion.div
            {...hold.holdProps}
            animate={hold.isHolding ? holdBtn.holding : {}}
            transition={{ duration: 0.2 }}
            style={{ ...hold.holdProps.style, ...holdBtn.base, width: 70, height: 70 }}
          >
            <svg viewBox="0 0 70 70" style={{ ...holdBtn.progressRing.svg, width: '100%', height: '100%' }}>
              <circle cx={35} cy={35} r={28} fill="none"
                stroke={verse.palette.primary} strokeWidth={1} opacity={0.12} />
              <circle cx={35} cy={35} r={28} fill="none"
                stroke={verse.palette.primary} strokeWidth={1.5}
                strokeDasharray={`${charge * 176} 176`}
                strokeLinecap="round" opacity={0.5}
                transform="rotate(-90 35 35)" />
            </svg>
            <div style={{ ...holdBtn.label, fontSize: 12 }}>
              {hold.isHolding ? 'charging' : 'hold'}
            </div>
          </motion.div>

          {/* Release button */}
          {charge > 0.1 && !hold.isHolding && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={releaseBtn.base}
              whileTap={releaseBtn.active}
              onClick={handleRelease}
            >
              release
            </motion.button>
          )}
        </div>
      )}

      {/* Premature feedback */}
      <AnimatePresence>
        {premature && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            style={{ ...navicueType.hint, color: verse.palette.shadow }}
          >
            weak flash. charge longer.
          </motion.span>
        )}
      </AnimatePresence>

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'decisive pulse'
          : charge >= 0.9
            ? 'fully charged. release.'
            : premature
              ? ''
              : 'hold to charge the capacitor'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          power management
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'restraint' : 'store the energy'}
      </div>
    </div>
  );
}