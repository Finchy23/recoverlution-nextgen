/**
 * EVOLUTIONIST #5 -- 1335. The Red Queen (Running)
 * "You must run twice as fast to get somewhere."
 * INTERACTION: Tap repeatedly to increase speed -- background parallax reveals progress
 * STEALTH KBE: Continuous Improvement -- Kaizen (E)
 *
 * COMPOSITOR: pattern_glitch / Pulse / work / embodying / tap / 1335
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

export default function Evolutionist_RedQueen({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Pulse',
        chrono: 'work',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1335,
        isSeal: false,
      }}
      arrivalText="Running. Standing still."
      prompt="In this place, it takes all the running you can do, to keep in the same place. To get somewhere else, you must run twice as fast."
      resonantText="Continuous improvement. You ran twice as fast and finally moved forward. Kaizen: the environment evolves. If you only match its pace, you stand still. Outpace it or fall behind."
      afterglowCoda="Run twice as fast."
      onComplete={onComplete}
    >
      {(verse) => <RedQueenInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function RedQueenInteraction({ verse }: { verse: any }) {
  const [taps, setTaps] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [bgOffset, setBgOffset] = useState(0);
  const [done, setDone] = useState(false);
  const THRESHOLD = 12;
  const intervalRef = useRef<any>(null);

  // Speed decays over time (environment keeps evolving)
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSpeed(s => Math.max(1, s - 0.15));
    }, 300);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Background moves based on relative speed
  useEffect(() => {
    const tick = setInterval(() => {
      const relativeSpeed = speed - 1; // net movement
      setBgOffset(o => o + relativeSpeed * 0.5);
    }, 50);
    return () => clearInterval(tick);
  }, [speed]);

  const handleTap = () => {
    if (done) return;
    setTaps(t => t + 1);
    setSpeed(s => Math.min(4, s + 0.5));
    if (taps + 1 >= THRESHOLD && !done) {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 120;
  const RUNNER_X = 60;
  const GROUND_Y = H - 20;

  // Parallax lines (ground markers)
  const markers = Array.from({ length: 8 }).map((_, i) => {
    const baseX = i * 40;
    return ((baseX - bgOffset * 5) % (W + 40)) - 20;
  });

  const netSpeed = speed - 1;
  const moving = netSpeed > 0.3;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>progress</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : moving ? verse.palette.text : verse.palette.shadow,
        }}>
          {done ? 'ahead' : moving ? 'moving' : 'standing still'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Ground */}
          <line x1={0} y1={GROUND_Y} x2={W} y2={GROUND_Y}
            stroke={verse.palette.primary} strokeWidth={0.5}
            opacity={safeOpacity(0.1)} />

          {/* Parallax ground markers */}
          {markers.map((x, i) => (
            <line key={i} x1={x} y1={GROUND_Y} x2={x} y2={GROUND_Y + 8}
              stroke={verse.palette.primary} strokeWidth={0.5}
              opacity={safeOpacity(0.06)} />
          ))}

          {/* Background elements (parallax, slower) */}
          {[0, 1, 2].map(i => {
            const x = ((i * 100 + 50 - bgOffset * 2) % (W + 60)) - 30;
            return (
              <rect key={`bg-${i}`}
                x={x} y={GROUND_Y - 40 - i * 10}
                width={3} height={35 + i * 10} rx={1}
                fill={verse.palette.primary}
                opacity={safeOpacity(0.04)} />
            );
          })}

          {/* Runner (stick figure) */}
          <g>
            {/* Head */}
            <circle cx={RUNNER_X} cy={GROUND_Y - 38} r={6}
              fill={verse.palette.accent} opacity={safeOpacity(0.2)} />
            {/* Body */}
            <line x1={RUNNER_X} y1={GROUND_Y - 32} x2={RUNNER_X} y2={GROUND_Y - 14}
              stroke={verse.palette.accent} strokeWidth={2}
              opacity={safeOpacity(0.2)} />
            {/* Legs (animated) */}
            <motion.line
              x1={RUNNER_X} y1={GROUND_Y - 14}
              stroke={verse.palette.accent} strokeWidth={2}
              strokeLinecap="round"
              animate={{
                x2: [RUNNER_X - 8, RUNNER_X + 8],
                y2: [GROUND_Y - 2, GROUND_Y - 2],
              }}
              transition={{
                repeat: Infinity,
                duration: Math.max(0.15, 0.5 / speed),
                ease: 'linear',
              }}
              opacity={safeOpacity(0.2)}
            />
            <motion.line
              x1={RUNNER_X} y1={GROUND_Y - 14}
              stroke={verse.palette.accent} strokeWidth={2}
              strokeLinecap="round"
              animate={{
                x2: [RUNNER_X + 8, RUNNER_X - 8],
                y2: [GROUND_Y - 2, GROUND_Y - 2],
              }}
              transition={{
                repeat: Infinity,
                duration: Math.max(0.15, 0.5 / speed),
                ease: 'linear',
              }}
              opacity={safeOpacity(0.2)}
            />
            {/* Arms */}
            <motion.line
              x1={RUNNER_X} y1={GROUND_Y - 28}
              stroke={verse.palette.accent} strokeWidth={1.5}
              strokeLinecap="round"
              animate={{
                x2: [RUNNER_X + 10, RUNNER_X - 5],
                y2: [GROUND_Y - 22, GROUND_Y - 18],
              }}
              transition={{
                repeat: Infinity,
                duration: Math.max(0.15, 0.5 / speed),
                ease: 'linear',
              }}
              opacity={safeOpacity(0.15)}
            />
          </g>

          {/* Speed indicator */}
          <g>
            <rect x={W - 50} y={15} width={35} height={4} rx={2}
              fill={verse.palette.primary} opacity={safeOpacity(0.06)} />
            <motion.rect
              x={W - 50} y={15} height={4} rx={2}
              fill={speed > 2 ? verse.palette.accent : verse.palette.primary}
              animate={{
                width: ((speed - 1) / 3) * 35,
                opacity: safeOpacity(speed > 2 ? 0.3 : 0.12),
              }}
            />
            <text x={W - 32} y={12} textAnchor="middle"
              fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}>
              speed
            </text>
          </g>

          {/* "Standing still" indicator */}
          {!moving && !done && speed <= 1.2 && (
            <motion.text
              x={RUNNER_X + 30} y={GROUND_Y - 25} textAnchor="start"
              fill={verse.palette.shadow} style={{ fontSize: '8px' }}
              animate={{ opacity: [0.2, 0.35, 0.2] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              standing still
            </motion.text>
          )}

          {/* Motion lines (when actually moving) */}
          {moving && (
            <g>
              {[0, 1, 2].map(i => (
                <motion.line key={`motion-${i}`}
                  x1={RUNNER_X - 15} y1={GROUND_Y - 25 + i * 8}
                  x2={RUNNER_X - 25} y2={GROUND_Y - 25 + i * 8}
                  stroke={verse.palette.accent} strokeWidth={0.8}
                  animate={{ opacity: [safeOpacity(0.15), 0] }}
                  transition={{ repeat: Infinity, duration: 0.4, delay: i * 0.1 }}
                />
              ))}
            </g>
          )}
        </svg>
      </div>

      {!done && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleTap}>
          run faster ({taps}/{THRESHOLD})
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'you outpaced the environment'
          : moving ? 'speed decays. keep tapping.'
            : 'the world moves with you. you stand still.'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          kaizen
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'continuous improvement' : 'run twice as fast'}
      </div>
    </div>
  );
}
