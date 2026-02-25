/**
 * VECTOR #8 -- 1188. The Decomposition
 * "Break it down. Solve X. Then solve Y. Orthogonal thinking."
 * INTERACTION: Arrow pointing NE (hard). Split into North + East (two simple tasks).
 * STEALTH KBE: Deconstruction -- problem solving (K)
 *
 * COMPOSITOR: science_x_soul / Drift / work / knowing / tap / 1188
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Vector_Decomposition({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Drift',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1188,
        isSeal: false,
      }}
      arrivalText="A diagonal arrow. Intimidating."
      prompt="The diagonal is intimidating. Break it down. Solve the X axis. Then solve the Y axis. Orthogonal thinking."
      resonantText="Deconstruction. The NE arrow looked impossible. Split into North and East, each was simple. Problem solving is rarely about the diagonal. It is about the components."
      afterglowCoda="Solved."
      onComplete={onComplete}
    >
      {(verse) => <DecompositionInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function DecompositionInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'diagonal' | 'splitting' | 'components' | 'done'>('diagonal');
  const cx = 40, cy = 70;
  const diagX = 120, diagY = 15;

  const decompose = useCallback(() => {
    if (phase !== 'diagonal') return;
    setPhase('splitting');
    setTimeout(() => setPhase('components'), 1000);
  }, [phase]);

  const solve = useCallback(() => {
    if (phase !== 'components') return;
    setPhase('done');
    setTimeout(() => verse.advance(), 2200);
  }, [phase, verse]);

  const showDiag = phase === 'diagonal' || phase === 'splitting';
  const showComponents = phase === 'components' || phase === 'done';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 90)}>
        <svg viewBox="0 0 160 90" style={navicueStyles.heroSvg}>
          {/* Axes */}
          <line x1={cx} y1={cy} x2={145} y2={cy}
            stroke={verse.palette.primaryGlow} strokeWidth={0.5} opacity={0.1} />
          <line x1={cx} y1={cy} x2={cx} y2={5}
            stroke={verse.palette.primaryGlow} strokeWidth={0.5} opacity={0.1} />
          <text x={148} y={cy + 3} style={{ ...navicueType.micro }}
            fill={verse.palette.textFaint} opacity={0.2}>x</text>
          <text x={cx - 5} y={8} style={{ ...navicueType.micro }}
            fill={verse.palette.textFaint} opacity={0.2}>y</text>

          {/* Diagonal arrow (NE) */}
          <AnimatePresence>
            {showDiag && (
              <motion.g
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <line x1={cx} y1={cy} x2={diagX} y2={diagY}
                  stroke="hsla(0, 0%, 50%, 0.3)" strokeWidth={2.5} strokeLinecap="round" />
                <circle cx={diagX} cy={diagY} r={3}
                  fill="hsla(0, 0%, 50%, 0.3)" />
                <text x={(cx + diagX) / 2 + 8} y={(cy + diagY) / 2}
                  style={{ ...navicueType.micro }}
                  fill="hsla(0, 25%, 50%, 0.3)">
                  hard
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Component: X (East) */}
          {showComponents && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <line x1={cx} y1={cy} x2={diagX} y2={cy}
                stroke={phase === 'done' ? verse.palette.accent : 'hsla(200, 30%, 55%, 0.5)'}
                strokeWidth={2} strokeLinecap="round" />
              <circle cx={diagX} cy={cy} r={2}
                fill={phase === 'done' ? verse.palette.accent : 'hsla(200, 30%, 55%, 0.5)'} />
              <text x={(cx + diagX) / 2} y={cy + 12} textAnchor="middle"
                style={{ ...navicueType.micro }}
                fill={phase === 'done' ? verse.palette.accent : 'hsla(200, 30%, 55%, 0.4)'}>
                do this
              </text>
            </motion.g>
          )}

          {/* Component: Y (North) */}
          {showComponents && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <line x1={diagX} y1={cy} x2={diagX} y2={diagY}
                stroke={phase === 'done' ? verse.palette.accent : 'hsla(150, 30%, 50%, 0.5)'}
                strokeWidth={2} strokeLinecap="round" />
              <circle cx={diagX} cy={diagY} r={2}
                fill={phase === 'done' ? verse.palette.accent : 'hsla(150, 30%, 50%, 0.5)'} />
              <text x={diagX + 12} y={(cy + diagY) / 2} textAnchor="start"
                style={{ ...navicueType.micro }}
                fill={phase === 'done' ? verse.palette.accent : 'hsla(150, 30%, 50%, 0.4)'}>
                do that
              </text>
            </motion.g>
          )}

          {/* Right angle marker */}
          {showComponents && (
            <rect x={diagX - 5} y={cy - 5} width={5} height={5}
              fill="none"
              stroke={verse.palette.primaryGlow} strokeWidth={0.5} opacity={0.2} />
          )}

          {/* Origin */}
          <circle cx={cx} cy={cy} r={2}
            fill={verse.palette.primaryGlow} opacity={0.2} />
        </svg>
      </div>

      {phase === 'diagonal' && (
        <motion.button onClick={decompose}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          decompose
        </motion.button>
      )}
      {phase === 'splitting' && (
        <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11, opacity: 0.5 }}>
          splitting...
        </span>
      )}
      {phase === 'components' && (
        <motion.button onClick={solve}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          solve both
        </motion.button>
      )}
      {phase === 'done' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          solved
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {phase === 'done' ? 'problem solving' : 'orthogonal thinking'}
      </div>
    </div>
  );
}