/**
 * CHRONOMANCER #5 -- 1015. The Legacy Cast
 * "Your action today is a fossil for the future. Be a good ancestor."
 * INTERACTION: Tap to throw a stone into water. Watch ripples extend
 * through decades -- 2025, 2050, 2100. A child picks up the stone.
 * Then name the legacy action.
 * STEALTH KBE: K (Knowing) -- Long-Term Consequence / Cathedral Thinking
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueQuickstart,
  navicueType,
  safeOpacity,
  immersiveTapButton,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const YEARS = [2025, 2050, 2075, 2100];

export default function Chronomancer_LegacyCast({ onComplete }: Props) {
  const [thrown, setThrown] = useState(false);
  const [rippleCount, setRippleCount] = useState(0);
  const [committed, setCommitted] = useState(false);

  const handleThrow = useCallback(() => {
    if (thrown) return;
    setThrown(true);
    // Cascade ripples over time
    YEARS.forEach((_, i) => {
      setTimeout(() => setRippleCount(i + 1), (i + 1) * 1200);
    });
  }, [thrown]);

  const handleCommit = useCallback((advance: () => void) => {
    setCommitted(true);
    setTimeout(() => advance(), 2000);
  }, []);

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Cosmos',
        chrono: 'social',
        kbe: 'knowing',
        hook: 'tap',
        specimenSeed: 1015,
        isSeal: false,
      }}
      arrivalText="Still water..."
      prompt="Tap to throw the stone. Watch how far it reaches."
      resonantText="Your action today is a fossil for the future."
      afterglowCoda="Be a good ancestor."
      onComplete={onComplete}
      mechanism="Cathedral Thinking"
    >
      {(verse) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}>
          {/* Pond */}
          <div style={navicueStyles.heroScene(verse.palette, 260 / 180)}>
            <svg viewBox="0 0 260 180" style={navicueStyles.heroSvg}>
              {/* Water surface line */}
              <line x1={20} y1={90} x2={240} y2={90}
                stroke={verse.palette.primary} strokeWidth={0.5} opacity={0.08} />

              {/* Ripples */}
              {thrown && Array.from({ length: rippleCount }, (_, i) => (
                <motion.ellipse
                  key={i}
                  cx={130} cy={90}
                  fill="none"
                  stroke={verse.palette.accent}
                  strokeWidth={0.5}
                  initial={{ rx: 5, ry: 2, opacity: 0.3 }}
                  animate={{ rx: 30 + i * 30, ry: 10 + i * 10, opacity: safeOpacity(0.03 + (1 - i / YEARS.length) * 0.1) }}
                  transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                />
              ))}

              {/* Impact point */}
              {thrown && (
                <motion.circle
                  cx={130} cy={90} r={2}
                  fill={verse.palette.accent}
                  initial={{ opacity: 0.4 }} animate={{ opacity: 0.1 }}
                  transition={{ duration: 2 }}
                />
              )}

              {/* Year markers */}
              {thrown && Array.from({ length: rippleCount }, (_, i) => (
                <motion.text
                  key={`y${i}`}
                  x={130} y={110 + i * 16}
                  textAnchor="middle"
                  fill={verse.palette.textFaint}
                  fontSize={9}
                  fontFamily="inherit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  {YEARS[i]}
                </motion.text>
              ))}

              {/* Stone (before throw) */}
              {!thrown && (
                <motion.circle
                  cx={130} cy={40} r={4}
                  fill={verse.palette.primary}
                  opacity={0.2}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </svg>
          </div>

          {/* Throw button */}
          {!thrown && (
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              onClick={handleThrow}
              whileTap={immersiveTapButton(verse.palette).active}
              style={immersiveTapButton(verse.palette).base}
            >
              Throw the stone
            </motion.button>
          )}

          {/* Commit after ripples complete */}
          <AnimatePresence>
            {thrown && rippleCount >= YEARS.length && !committed && (
              <motion.button
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
                onClick={() => handleCommit(verse.advance)}
                whileTap={immersiveTapButton(verse.palette, 'accent').active}
                style={immersiveTapButton(verse.palette, 'accent').base}
              >
                I choose to be a good ancestor
              </motion.button>
            )}
          </AnimatePresence>

          {committed && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
              style={{ ...navicueType.texture, color: verse.palette.textFaint, textAlign: 'center', fontStyle: 'italic' }}
            >
              The stone lands in 2100.
            </motion.div>
          )}
        </div>
      )}
    </NaviCueVerse>
  );
}