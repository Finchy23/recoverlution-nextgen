/**
 * VECTOR #3 -- 1183. The Unit Vector (Direction)
 * "Even a tiny step in the right direction is infinite progress."
 * INTERACTION: Massive messy arrow. Shrink to length 1. Pure direction. Take one step.
 * STEALTH KBE: Micro-Step -- directional accuracy (E)
 *
 * COMPOSITOR: witness_ritual / Drift / morning / embodying / tap / 1183
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Vector_UnitVector({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Drift',
        chrono: 'morning',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1183,
        isSeal: false,
      }}
      arrivalText="A massive, messy arrow."
      prompt="Forget the magnitude. Just get the direction right. Even a tiny step in the right direction is infinite progress."
      resonantText="Micro-Step. The arrow was enormous and terrifying. You shrank it to length one: pure direction, no magnitude. Then you stepped. Directional accuracy matters more than force."
      afterglowCoda="Point."
      onComplete={onComplete}
    >
      {(verse) => <UnitVectorInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function UnitVectorInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'messy' | 'shrinking' | 'unit' | 'stepped'>('messy');

  const shrinkArrow = useCallback(() => {
    if (phase !== 'messy') return;
    setPhase('shrinking');
    setTimeout(() => setPhase('unit'), 1000);
  }, [phase]);

  const step = useCallback(() => {
    if (phase !== 'unit') return;
    setPhase('stepped');
    setTimeout(() => verse.advance(), 2200);
  }, [phase, verse]);

  const arrowLen = phase === 'messy' ? 55 : phase === 'shrinking' ? 25 : 12;
  const cx = 80, cy = 50;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 90)}>
        <svg viewBox="0 0 160 90" style={navicueStyles.heroSvg}>
          {/* Arrow */}
          <motion.g animate={{ opacity: 1 }}>
            <motion.line
              animate={{
                x1: cx, y1: cy,
                x2: cx + arrowLen * 0.7, y2: cy - arrowLen * 0.7,
              }}
              stroke={phase === 'stepped' ? verse.palette.accent :
                phase === 'unit' ? 'hsla(200, 30%, 55%, 0.6)' :
                'hsla(0, 0%, 50%, 0.3)'}
              strokeWidth={phase === 'messy' ? 3 : 2}
              strokeLinecap="round"
            />
            {/* Arrowhead */}
            <motion.circle
              animate={{
                cx: cx + arrowLen * 0.7,
                cy: cy - arrowLen * 0.7,
              }}
              r={2}
              fill={phase === 'stepped' ? verse.palette.accent :
                phase === 'unit' ? 'hsla(200, 30%, 55%, 0.6)' :
                'hsla(0, 0%, 50%, 0.3)'}
            />
          </motion.g>

          {/* Messy noise lines (scatter around the main arrow) */}
          {phase === 'messy' && (
            <>
              {[
                [65, 55, 90, 30], [70, 40, 110, 45], [85, 60, 120, 25],
                [55, 45, 95, 50], [75, 35, 105, 55],
              ].map(([x1, y1, x2, y2], i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="hsla(0, 0%, 50%, 0.1)" strokeWidth={1.5} />
              ))}
            </>
          )}

          {/* Magnitude label */}
          <text x={15} y={82}
            style={{ ...navicueType.hint, fontSize: 8 }}
            fill={verse.palette.textFaint} opacity={0.3}>
            |v| = {phase === 'messy' ? '???' : phase === 'shrinking' ? '...' : '1'}
          </text>

          {/* Unit label */}
          {(phase === 'unit' || phase === 'stepped') && (
            <motion.text
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              x={cx + arrowLen * 0.7 + 8}
              y={cy - arrowLen * 0.7}
              style={{ ...navicueType.micro }}
              fill={phase === 'stepped' ? verse.palette.accent : verse.palette.textFaint}>
              unit
            </motion.text>
          )}

          {/* Origin dot */}
          <circle cx={cx} cy={cy} r={2}
            fill={verse.palette.primaryGlow} opacity={0.2} />
        </svg>
      </div>

      {phase === 'messy' && (
        <motion.button onClick={shrinkArrow}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          normalize
        </motion.button>
      )}
      {phase === 'shrinking' && (
        <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 10, opacity: 0.5 }}>
          simplifying...
        </span>
      )}
      {phase === 'unit' && (
        <motion.button onClick={step}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          take one step
        </motion.button>
      )}
      {phase === 'stepped' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          point
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {phase === 'stepped' ? 'directional accuracy' : 'pure direction'}
      </div>
    </div>
  );
}