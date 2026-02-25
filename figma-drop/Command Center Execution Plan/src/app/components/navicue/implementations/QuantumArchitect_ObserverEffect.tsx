/**
 * QUANTUM ARCHITECT #3 -- 1233. The Observer Effect
 * "The act of measuring changes the result."
 * INTERACTION: Tap to open the Eye -- chaotic particles snap into grid
 * STEALTH KBE: Monitoring -- Self-Monitoring (E)
 *
 * COMPOSITOR: pattern_glitch / Lattice / work / embodying / tap / 1233
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

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export default function QuantumArchitect_ObserverEffect({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Lattice',
        chrono: 'work',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1233,
        isSeal: false,
      }}
      arrivalText="Chaos. Particles everywhere."
      prompt="The system behaves differently when you watch it. Track your habits. The act of measuring changes the result."
      resonantText="Monitoring. The particles were not forced into order. They organized themselves because they were observed. Self-monitoring is not control. It is attention. And attention is everything."
      afterglowCoda="Watch it change."
      onComplete={onComplete}
    >
      {(verse) => <ObserverEffectInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ObserverEffectInteraction({ verse }: { verse: any }) {
  const rand = useRef(seededRandom(1233)).current;
  const SCENE_W = 240;
  const SCENE_H = 160;
  const GRID_COLS = 6;
  const GRID_ROWS = 4;
  const COUNT = GRID_COLS * GRID_ROWS;

  // Random chaos positions
  const chaosPositions = useRef(
    Array.from({ length: COUNT }, () => ({
      x: 20 + rand() * (SCENE_W - 40),
      y: 20 + rand() * (SCENE_H - 40),
    }))
  ).current;

  // Grid positions
  const gridPositions = useRef(
    Array.from({ length: COUNT }, (_, i) => ({
      x: 35 + (i % GRID_COLS) * ((SCENE_W - 70) / (GRID_COLS - 1)),
      y: 30 + Math.floor(i / GRID_COLS) * ((SCENE_H - 60) / (GRID_ROWS - 1)),
    }))
  ).current;

  const [observing, setObserving] = useState(false);
  const [measured, setMeasured] = useState(false);
  const [done, setDone] = useState(false);
  const [eyeOpen, setEyeOpen] = useState(false);

  const handleObserve = () => {
    if (observing) return;
    setObserving(true);
    setEyeOpen(true);
    setTimeout(() => {
      setMeasured(true);
      setDone(true);
      setTimeout(() => verse.advance(), 2800);
    }, 1200);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Grid lines (appear after observation) */}
          {measured && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.06) }}
              transition={{ duration: 0.8 }}
            >
              {Array.from({ length: GRID_COLS }).map((_, i) => (
                <line key={`v${i}`}
                  x1={gridPositions[i].x} y1={20}
                  x2={gridPositions[i].x} y2={SCENE_H - 20}
                  stroke={verse.palette.accent} strokeWidth={0.5} />
              ))}
              {Array.from({ length: GRID_ROWS }).map((_, i) => (
                <line key={`h${i}`}
                  x1={20} y1={gridPositions[i * GRID_COLS].y}
                  x2={SCENE_W - 20} y2={gridPositions[i * GRID_COLS].y}
                  stroke={verse.palette.accent} strokeWidth={0.5} />
              ))}
            </motion.g>
          )}

          {/* Particles */}
          {Array.from({ length: COUNT }).map((_, i) => {
            const chaos = chaosPositions[i];
            const grid = gridPositions[i];
            return (
              <motion.circle
                key={i}
                r={3}
                fill={measured ? verse.palette.accent : verse.palette.primary}
                animate={{
                  cx: measured ? grid.x : observing ? grid.x : chaos.x + Math.sin(Date.now() * 0.001 + i) * 5,
                  cy: measured ? grid.y : observing ? grid.y : chaos.y + Math.cos(Date.now() * 0.001 + i * 1.3) * 5,
                  opacity: safeOpacity(measured ? 0.4 : 0.15),
                }}
                transition={
                  observing
                    ? { duration: 0.8, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }
                    : { duration: 0 }
                }
              />
            );
          })}

          {/* Chaos drift animation (before observation) */}
          {!observing && chaosPositions.map((p, i) => (
            <motion.circle
              key={`drift-${i}`}
              cx={p.x} cy={p.y} r={3}
              fill={verse.palette.primary}
              animate={{
                cx: [p.x - 8, p.x + 6, p.x - 4, p.x + 8, p.x],
                cy: [p.y + 5, p.y - 7, p.y + 3, p.y - 5, p.y],
              }}
              transition={{
                repeat: Infinity,
                duration: 2 + rand() * 2,
                ease: 'easeInOut',
              }}
              opacity={safeOpacity(0.15)}
            />
          ))}
        </svg>
      </div>

      {/* Eye icon */}
      <motion.div
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          color: eyeOpen ? verse.palette.accent : verse.palette.textFaint,
          ...navicueType.micro,
        }}
        animate={{ opacity: 0.6 }}
      >
        <svg width={20} height={14} viewBox="0 0 20 14">
          <motion.path
            d="M 1,7 Q 10,0 19,7 Q 10,14 1,7"
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            animate={{ opacity: eyeOpen ? 1 : 0.4 }}
          />
          <motion.circle
            cx={10} cy={7} r={3}
            fill="currentColor"
            animate={{
              r: eyeOpen ? 3 : 1,
              opacity: eyeOpen ? 0.8 : 0.3,
            }}
            transition={{ duration: 0.4 }}
          />
        </svg>
        {measured ? 'measured' : eyeOpen ? 'observing...' : 'unobserved'}
      </motion.div>

      {/* Observe button */}
      {!observing && (
        <motion.button
          style={btn.base}
          whileTap={btn.active}
          onClick={handleObserve}
        >
          observe
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'the act of watching changed everything'
          : observing
            ? 'organizing...'
            : 'particles in chaos'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          self-monitoring
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'monitoring' : 'open the eye'}
      </div>
    </div>
  );
}
