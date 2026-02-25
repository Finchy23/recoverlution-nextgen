/**
 * SIMULATOR #7 -- 1247. The Glitch (Pattern Break)
 * "Do something totally unexpected. Break the pattern."
 * INTERACTION: Tap Glitch to shatter a looping argument scene into a dance
 * STEALTH KBE: Pattern Interrupt -- Behavioral Flexibility (K)
 *
 * COMPOSITOR: pattern_glitch / Lattice / social / knowing / tap / 1247
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const LOOP_PHRASES = [
  'you never listen',
  'that is not what I said',
  'you always do this',
  'you never listen',
];

const BREAK_OPTIONS = [
  { id: 'laugh', label: 'laugh' },
  { id: 'dance', label: 'dance' },
  { id: 'sing', label: 'sing' },
];

export default function Simulator_Glitch({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Lattice',
        chrono: 'social',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1247,
        isSeal: false,
      }}
      arrivalText="A loop. The argument repeats."
      prompt="You are stuck in a loop. Do not argue harder. Glitch the system. Do something totally unexpected. Break the pattern."
      resonantText="Pattern interrupt. You did the unexpected and the loop shattered. Behavioral flexibility is the ability to exit any script. When you laugh instead of argue, the system cannot sustain the loop."
      afterglowCoda="Break the pattern."
      onComplete={onComplete}
    >
      {(verse) => <GlitchInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function GlitchInteraction({ verse }: { verse: any }) {
  const [loopIndex, setLoopIndex] = useState(0);
  const [glitched, setGlitched] = useState(false);
  const [choice, setChoice] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Loop the argument
  useEffect(() => {
    if (glitched) return;
    const interval = setInterval(() => {
      setLoopIndex(prev => (prev + 1) % LOOP_PHRASES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [glitched]);

  const handleGlitch = (action: string) => {
    if (glitched) return;
    setChoice(action);
    setGlitched(true);
    setTimeout(() => {
      setDone(true);
      setTimeout(() => verse.advance(), 2800);
    }, 2000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const SCENE_W = 260;
  const SCENE_H = 120;

  // Fragment positions for shatter effect
  const fragments = useRef(
    Array.from({ length: 16 }, (_, i) => ({
      x: 30 + (i % 4) * 55,
      y: 20 + Math.floor(i / 4) * 25,
      angle: (Math.random() - 0.5) * 360,
      dx: (Math.random() - 0.5) * 100,
      dy: (Math.random() - 0.5) * 80,
    }))
  ).current;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Loop counter */}
      {!glitched && (
        <motion.div
          style={{ display: 'flex', gap: 8, alignItems: 'center' }}
          animate={{ opacity: 0.4 }}
        >
          <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>
            loop iteration
          </span>
          <motion.span
            key={loopIndex}
            style={{ ...navicueType.data, color: verse.palette.shadow }}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0.6 }}
          >
            #{loopIndex + 1}
          </motion.span>
        </motion.div>
      )}

      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          <AnimatePresence mode="wait">
            {/* Looping argument */}
            {!glitched && (
              <motion.g key="loop">
                {/* Loop arrow */}
                <motion.path
                  d="M 40,60 Q 130,20 220,60 Q 130,100 40,60"
                  fill="none"
                  stroke={verse.palette.primary}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  opacity={safeOpacity(0.15)}
                />

                {/* Current phrase */}
                <motion.text
                  key={loopIndex}
                  x={SCENE_W / 2} y={65}
                  textAnchor="middle"
                  fill={verse.palette.text}
                  style={navicueType.choice}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.5, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {LOOP_PHRASES[loopIndex]}
                </motion.text>

                {/* Repeat indicator */}
                <text x={SCENE_W / 2} y={95} textAnchor="middle"
                  fill={verse.palette.textFaint} style={navicueType.micro}>
                  repeating...
                </text>
              </motion.g>
            )}

            {/* Glitch shatter effect */}
            {glitched && !done && (
              <motion.g key="shatter">
                {fragments.map((frag, i) => (
                  <motion.rect
                    key={i}
                    width={50} height={20} rx={2}
                    fill={verse.palette.primary}
                    initial={{
                      x: frag.x, y: frag.y,
                      opacity: safeOpacity(0.1),
                      rotate: 0,
                    }}
                    animate={{
                      x: frag.x + frag.dx,
                      y: frag.y + frag.dy,
                      opacity: 0,
                      rotate: frag.angle,
                    }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                ))}
              </motion.g>
            )}

            {/* Reassembled as dance/flow */}
            {done && (
              <motion.g key="dance"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Flowing curves instead of sharp loop */}
                <motion.path
                  d="M 30,80 Q 70,30 130,60 Q 190,90 230,40"
                  fill="none"
                  stroke={verse.palette.accent}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1 }}
                  opacity={safeOpacity(0.3)}
                />

                {/* Dancing dots */}
                {[0, 1, 2].map(i => (
                  <motion.circle
                    key={i}
                    r={5}
                    fill={verse.palette.accent}
                    animate={{
                      cx: [60 + i * 60, 80 + i * 60, 60 + i * 60],
                      cy: [50, 70, 50],
                      opacity: safeOpacity(0.3),
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      delay: i * 0.3,
                    }}
                  />
                ))}

                <motion.text
                  x={SCENE_W / 2} y={105}
                  textAnchor="middle"
                  fill={verse.palette.accent}
                  style={navicueType.choice}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ delay: 0.5 }}
                >
                  {choice}
                </motion.text>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      </div>

      {/* Glitch options */}
      {!glitched && (
        <div style={{ display: 'flex', gap: 8 }}>
          {BREAK_OPTIONS.map(opt => (
            <motion.button
              key={opt.id}
              style={{ ...btn.base, padding: '10px 16px' }}
              whileTap={btn.active}
              onClick={() => handleGlitch(opt.label)}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'the loop is broken'
          : glitched
            ? 'shattering...'
            : 'stuck in a loop. do something unexpected.'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          behavioral flexibility
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'pattern interrupt' : 'break the loop'}
      </div>
    </div>
  );
}
