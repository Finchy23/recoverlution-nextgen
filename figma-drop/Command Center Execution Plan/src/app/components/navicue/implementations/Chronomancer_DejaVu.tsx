/**
 * CHRONOMANCER #7 -- 1017. The Deja Vu
 * "You have been here before. This is a pattern loop."
 * INTERACTION: A scene glitches and repeats. Tap on the element that
 * triggers the loop to break the cycle. Wrong taps restart the glitch.
 * STEALTH KBE: K (Knowing) -- Pattern Recognition / Behavioral Break
 */
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const ELEMENTS = [
  { id: 'clock',   label: 'The Clock',   isTrigger: false, x: 55,  y: 35 },
  { id: 'door',    label: 'The Door',    isTrigger: false, x: 165, y: 60 },
  { id: 'thought', label: 'The Thought', isTrigger: true,  x: 110, y: 90 },
  { id: 'phone',   label: 'The Phone',   isTrigger: false, x: 200, y: 130 },
];

export default function Chronomancer_DejaVu({ onComplete }: Props) {
  const [glitchCycle, setGlitchCycle] = useState(0);
  const [broken, setBroken] = useState(false);
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);

  // Glitch cycle animation
  useEffect(() => {
    if (broken) return;
    const interval = setInterval(() => {
      setGlitchCycle(c => c + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [broken]);

  const handleTap = useCallback((id: string, isTrigger: boolean, advance: () => void) => {
    if (broken) return;
    if (isTrigger) {
      setBroken(true);
      setTimeout(() => advance(), 2500);
    } else {
      setWrongFlash(id);
      setTimeout(() => setWrongFlash(null), 800);
    }
  }, [broken]);

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Cosmos',
        chrono: 'work',
        kbe: 'knowing',
        hook: 'tap',
        specimenSeed: 1017,
        isSeal: false,
      }}
      arrivalText="A glitch..."
      prompt="The scene repeats. Find the trigger. Break the loop."
      resonantText="You have been here before. The pattern only breaks when you see it."
      afterglowCoda="Checkpoint cleared."
      onComplete={onComplete}
      mechanism="Pattern Break"
    >
      {(verse) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}>
          {/* Scene */}
          <div style={navicueStyles.heroScene(verse.palette, 260 / 180)}>
            <svg viewBox="0 0 260 180" style={navicueStyles.heroSvg}>
              {/* Glitch scan lines */}
              {!broken && (
                <g>
                  {Array.from({ length: 4 }, (_, i) => (
                    <motion.rect
                      key={i}
                      x={0} width={260} height={1}
                      fill={verse.palette.accent}
                      animate={{
                        y: [i * 45, i * 45 + 5, i * 45],
                        opacity: [0, 0.06, 0],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 2.5,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </g>
              )}

              {/* Interactive elements */}
              {ELEMENTS.map((el) => (
                <g key={el.id}>
                  <motion.circle
                    cx={el.x} cy={el.y} r={18}
                    fill="transparent"
                    stroke={wrongFlash === el.id
                      ? 'hsla(0, 50%, 50%, 0.3)'
                      : verse.palette.primaryGlow}
                    strokeWidth={wrongFlash === el.id ? 1.5 : 0.6}
                    style={{ cursor: broken ? 'default' : 'pointer' }}
                    onClick={() => handleTap(el.id, el.isTrigger, verse.advance)}
                    animate={broken && el.isTrigger
                      ? { stroke: verse.palette.accent, strokeWidth: 1.5, opacity: 0.4 }
                      : { opacity: 0.2 }}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.text
                    x={el.x} y={el.y + 3}
                    textAnchor="middle"
                    fill={verse.palette.textFaint}
                    fontSize={8}
                    fontFamily="inherit"
                    style={{ pointerEvents: 'none' }}
                    animate={{
                      opacity: broken && el.isTrigger ? 0.6 : 0.3,
                    }}
                  >
                    {el.label}
                  </motion.text>
                </g>
              ))}

              {/* Loop counter */}
              {!broken && (
                <AnimatePresence>
                  <motion.text
                    key={glitchCycle}
                    x={130} y={170}
                    textAnchor="middle"
                    fill={verse.palette.textFaint}
                    fontSize={9}
                    fontFamily="inherit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.25 }}
                    exit={{ opacity: 0 }}
                  >
                    loop {glitchCycle + 1}
                  </motion.text>
                </AnimatePresence>
              )}
            </svg>
          </div>

          {/* Status */}
          <motion.div
            animate={{ opacity: 0.5 }}
            style={{ ...navicueType.data, color: verse.palette.textFaint, textAlign: 'center' }}
          >
            {broken
              ? 'Loop broken.'
              : wrongFlash
                ? 'Not the trigger. Look deeper.'
                : 'Identify the pattern source.'}
          </motion.div>

          {broken && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.4, y: 0 }}
              transition={{ delay: 1, duration: 1.5 }}
              style={{ ...navicueType.texture, color: verse.palette.textFaint, fontStyle: 'italic' }}
            >
              The thought was the loop all along.
            </motion.div>
          )}
        </div>
      )}
    </NaviCueVerse>
  );
}