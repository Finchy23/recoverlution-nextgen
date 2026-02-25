/**
 * HYDRODYNAMICIST #10 -- 1140. The Hydro Seal (The Proof)
 * "Be soft. You cannot be broken."
 * INTERACTION: Observe -- two waves crossing -- they pass through each other
 * STEALTH KBE: Fluid Mechanics -- yield to win (E)
 *
 * COMPOSITOR: science_x_soul / Tide / night / embodying / observe / 1140
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Hydrodynamicist_HydroSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Tide',
        chrono: 'night',
        kbe: 'e',
        hook: 'observe',
        specimenSeed: 1140,
        isSeal: true,
      }}
      arrivalText="Two waves. Approaching."
      prompt="Be soft. You cannot be broken."
      resonantText="Fluid Mechanics. Liquids cannot be compressed. They transmit force perfectly because they yield to the container but maintain their volume. The waves passed through each other. Yield to win."
      afterglowCoda="Be water."
      onComplete={onComplete}
    >
      {(verse) => <HydroSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function HydroSealInteraction({ verse }: { verse: any }) {
  const [time, setTime] = useState(0);
  const [observeTime, setObserveTime] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const OBSERVE_TARGET = 6;

  // Wave animation
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 0.05);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Observe timer
  useEffect(() => {
    if (revealed) return;
    const interval = setInterval(() => {
      setObserveTime(prev => {
        const next = prev + 0.1;
        if (next >= OBSERVE_TARGET) {
          setRevealed(true);
          clearInterval(interval);
          setTimeout(() => verse.advance(), 3000);
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [revealed, verse]);

  const progressPct = Math.min(1, observeTime / OBSERVE_TARGET);

  // Two waves approaching from opposite sides
  const POINTS = 40;
  const width = 180;

  const wavePoints = Array.from({ length: POINTS }, (_, i) => {
    const x = (i / (POINTS - 1)) * width;
    const normalizedX = x / width;

    // Wave 1: moving right
    const wave1 = Math.sin((normalizedX * 4 - time * 2) * Math.PI) *
      Math.exp(-Math.pow((normalizedX - 0.3 - time * 0.05) * 3, 2)) * 15;

    // Wave 2: moving left
    const wave2 = Math.sin((normalizedX * 4 + time * 2) * Math.PI) *
      Math.exp(-Math.pow((normalizedX - 0.7 + time * 0.05) * 3, 2)) * 15;

    // Superposition: waves pass through each other
    const y = 50 + wave1 + wave2;
    return { x, y };
  });

  const pathD = wavePoints.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 180 / 100)}>
        <svg viewBox="0 0 180 100" style={navicueStyles.heroSvg}>
          {/* Baseline */}
          <line
            x1={0} y1={50} x2={180} y2={50}
            stroke={verse.palette.primaryGlow}
            strokeWidth={1}
            opacity={0.08}
          />

          {/* Wave path */}
          <path
            d={pathD}
            fill="none"
            stroke={revealed ? verse.palette.accent : 'hsla(200, 40%, 55%, 0.4)'}
            strokeWidth={revealed ? 2 : 1.5}
            strokeLinecap="round"
          />

          {/* Labels */}
          <text
            x={5} y={97}
            style={navicueStyles.annotation(verse.palette, 0.3)}
          >
            pressure
          </text>
          <text
            x={175} y={97}
            style={navicueStyles.annotation(verse.palette, 0.3)}
          >
            flow
          </text>
        </svg>
      </div>

      {/* Status */}
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="observing"
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11, opacity: 0.5 }}>
              observe
            </span>
            <div style={{ width: 60, height: 2, borderRadius: 1, background: verse.palette.primaryGlow, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${progressPct * 100}%` }}
                style={{ height: '100%', background: verse.palette.accent, borderRadius: 1 }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <span style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 12 }}>
              they passed through each other
            </span>
            <span style={navicueStyles.annotation(verse.palette)}>
              yield to win
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}