/**
 * CONDUCTOR #6 -- 1216. The Short Circuit (Distraction)
 * "The distraction is a short circuit. Insulate the wire."
 * INTERACTION: Tap to wrap insulation around the exposed wire
 * STEALTH KBE: Focus -- Attention Control (K)
 *
 * COMPOSITOR: pattern_glitch / Circuit / work / knowing / tap / 1216
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

export default function Conductor_ShortCircuit({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Circuit',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1216,
        isSeal: false,
      }}
      arrivalText="Current flows to the light."
      prompt="The energy takes the path of least resistance. The distraction is a short circuit. Insulate the wire. Force the energy to the bulb."
      resonantText="Focus. The current did not increase. The leak was sealed. Attention control is not about pushing harder toward the goal. It is about insulating against the shortcuts."
      afterglowCoda="Insulate the wire."
      onComplete={onComplete}
    >
      {(verse) => <ShortCircuitInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ShortCircuitInteraction({ verse }: { verse: any }) {
  const [shorted, setShorted] = useState(false);
  const [insulated, setInsulated] = useState(false);
  const [done, setDone] = useState(false);
  const [smokePulse, setSmokePulse] = useState(0);

  // Show the short after a beat
  useEffect(() => {
    const timer = setTimeout(() => setShorted(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Smoke while shorted
  useEffect(() => {
    if (!shorted || insulated) return;
    const interval = setInterval(() => setSmokePulse(prev => prev + 1), 400);
    return () => clearInterval(interval);
  }, [shorted, insulated]);

  const handleInsulate = () => {
    if (insulated) return;
    setInsulated(true);
    setDone(true);
    setTimeout(() => verse.advance(), 2500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const SCENE_W = 260;
  const SCENE_H = 100;

  const bulbOn = !shorted || insulated;

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Circuit diagram */}
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Source */}
          <circle cx={20} cy={50} r={8} fill="none"
            stroke={verse.palette.primary} strokeWidth={1}
            opacity={safeOpacity(0.3)} />
          <text x={20} y={75} textAnchor="middle"
            fill={verse.palette.textFaint} style={navicueType.micro}>
            source
          </text>

          {/* Main wire to bulb */}
          <line x1={28} y1={50} x2={100} y2={50}
            stroke={verse.palette.primary} strokeWidth={1.5}
            opacity={safeOpacity(insulated ? 0.3 : 0.2)} />

          {/* Short circuit cross-wire (distraction) */}
          {shorted && !insulated && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <line x1={70} y1={50} x2={70} y2={85}
                stroke={verse.palette.shadow} strokeWidth={1.5}
                opacity={safeOpacity(0.4)} />
              <line x1={55} y1={85} x2={85} y2={85}
                stroke={verse.palette.shadow} strokeWidth={1}
                opacity={safeOpacity(0.3)} />
              <text x={70} y={98} textAnchor="middle"
                fill={verse.palette.shadow} style={navicueType.micro}>
                distraction
              </text>

              {/* Smoke wisps */}
              {Array.from({ length: 2 }).map((_, i) => (
                <motion.path
                  key={`smoke-${smokePulse}-${i}`}
                  d={`M${65 + i * 10},${45} Q${68 + i * 10},${35} ${72 + i * 10},${40}`}
                  fill="none"
                  stroke={verse.palette.textFaint}
                  strokeWidth={0.6}
                  initial={{ opacity: 0.3, y: 0 }}
                  animate={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.8 }}
                />
              ))}
            </motion.g>
          )}

          {/* Insulation wrap (appears after tap) */}
          {insulated && (
            <motion.rect
              x={60} y={44} width={20} height={12} rx={3}
              fill={verse.palette.accent}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: safeOpacity(0.25), scale: 1 }}
              transition={{ duration: 0.4 }}
            />
          )}

          {/* Continuation wire */}
          <line x1={100} y1={50} x2={185} y2={50}
            stroke={verse.palette.primary} strokeWidth={1.5}
            opacity={safeOpacity(insulated ? 0.3 : shorted ? 0.08 : 0.2)} />

          {/* Current flow particles */}
          {bulbOn && Array.from({ length: 3 }).map((_, i) => (
            <motion.circle
              key={`flow-${i}`}
              cy={50} r={1.5}
              fill={verse.palette.accent}
              animate={{
                cx: [30, 185],
                opacity: [0, safeOpacity(0.4), 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                delay: i * 0.35,
              }}
            />
          ))}

          {/* Bulb */}
          <motion.g
            animate={{
              opacity: bulbOn ? safeOpacity(0.6) : safeOpacity(0.12),
            }}
          >
            <circle cx={200} cy={45} r={14} fill="none"
              stroke={verse.palette.primary} strokeWidth={1}
              opacity={safeOpacity(0.3)} />
            {bulbOn && (
              <motion.circle
                cx={200} cy={45} r={22}
                fill={verse.palette.accent}
                animate={{ opacity: [0.04, 0.08, 0.04] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            )}
            <text x={200} y={75} textAnchor="middle"
              fill={bulbOn ? verse.palette.accent : verse.palette.textFaint}
              style={navicueType.micro}>
              {bulbOn ? 'on' : 'dead'}
            </text>
          </motion.g>
        </svg>
      </div>

      {/* Action */}
      {shorted && !insulated && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={btn.base}
          whileTap={btn.active}
          onClick={handleInsulate}
        >
          insulate the wire
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'the light returns'
          : shorted
            ? 'energy leaking to distraction'
            : 'current flowing...'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          attention control
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'focus' : 'seal the leak'}
      </div>
    </div>
  );
}
