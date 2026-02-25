/**
 * VECTOR #2 -- 1182. The Resultant Force
 * "Cut the opposing rope."
 * INTERACTION: Pull North. Fear pulls South. Net = 0. Cut the South rope. Fly North.
 * STEALTH KBE: Self-Sabotage Removal -- subtraction (B)
 *
 * COMPOSITOR: sacred_ordinary / Drift / morning / believing / tap / 1182
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Vector_ResultantForce({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Drift',
        chrono: 'morning',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1182,
        isSeal: false,
      }}
      arrivalText="Pulled in two directions. Net: zero."
      prompt="You are fighting yourself. The net force is zero because your fear cancels your ambition. Cut the opposing rope."
      resonantText="Self-Sabotage Removal. You did not need more force. You needed less. The moment you cut the opposing rope, all the energy you already had became motion. Subtraction is acceleration."
      afterglowCoda="North."
      onComplete={onComplete}
    >
      {(verse) => <ResultantForceInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ResultantForceInteraction({ verse }: { verse: any }) {
  const [cut, setCut] = useState(false);
  const [flying, setFlying] = useState(false);
  const cx = 80, cy = 50;

  const cutRope = useCallback(() => {
    if (cut) return;
    setCut(true);
    setTimeout(() => {
      setFlying(true);
      setTimeout(() => verse.advance(), 2200);
    }, 600);
  }, [cut, verse]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 100)}>
        <svg viewBox="0 0 160 100" style={navicueStyles.heroSvg}>
          {/* You (center dot) */}
          <motion.circle
            animate={{ cy: flying ? 5 : cy }}
            transition={{ duration: 1.5, ease: 'easeIn' }}
            cx={cx} r={5}
            fill={flying ? verse.palette.accent : 'hsla(0, 0%, 50%, 0.3)'}
            opacity={0.5}
          />

          {/* North arrow (ambition) */}
          <motion.g animate={{ opacity: 1 }}>
            <line x1={cx} y1={cy - 8} x2={cx} y2={15}
              stroke={flying ? verse.palette.accent : 'hsla(200, 30%, 55%, 0.4)'}
              strokeWidth={2} />
            <path d={`M ${cx - 4} 20 L ${cx} 12 L ${cx + 4} 20`}
              fill="none" stroke={flying ? verse.palette.accent : 'hsla(200, 30%, 55%, 0.4)'}
              strokeWidth={2} strokeLinecap="round" />
            <text x={cx + 10} y={20}
              style={{ ...navicueType.micro }}
              fill={verse.palette.textFaint} opacity={0.3}>
              ambition
            </text>
          </motion.g>

          {/* South arrow (fear) -- disappears when cut */}
          <AnimatePresence>
            {!cut && (
              <motion.g exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <line x1={cx} y1={cy + 8} x2={cx} y2={85}
                  stroke="hsla(0, 25%, 50%, 0.35)" strokeWidth={2} />
                <path d={`M ${cx - 4} 80 L ${cx} 88 L ${cx + 4} 80`}
                  fill="none" stroke="hsla(0, 25%, 50%, 0.35)"
                  strokeWidth={2} strokeLinecap="round" />
                <text x={cx + 10} y={82}
                  style={{ ...navicueType.micro }}
                  fill="hsla(0, 25%, 50%, 0.3)">
                  fear
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Net force label */}
          <text x={15} y={50} style={{ ...navicueType.micro }}
            fill={verse.palette.textFaint} opacity={0.3}>
            {cut ? 'max' : '0'}
          </text>

          {/* Cut mark */}
          {cut && !flying && (
            <motion.line
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              x1={cx - 8} y1={cy + 12} x2={cx + 8} y2={cy + 8}
              stroke="hsla(0, 30%, 50%, 0.4)" strokeWidth={2}
            />
          )}
        </svg>
      </div>

      {!cut ? (
        <motion.button onClick={cutRope}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          cut the south rope
        </motion.button>
      ) : flying ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          free
        </motion.div>
      ) : (
        <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 10, opacity: 0.5 }}>
          releasing...
        </span>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {flying ? 'subtraction' : 'net force = ambition - fear'}
      </div>
    </div>
  );
}