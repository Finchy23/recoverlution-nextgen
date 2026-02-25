/**
 * ECONOMIST #3 -- 1343. The Compound Interest
 * "Do not quit in the flat days."
 * INTERACTION: Penny doubles daily. Tap through the flat days. Explosion at 30.
 * STEALTH KBE: Patience -- Exponential Thinking (E)
 *
 * COMPOSITOR: science_x_soul / Circuit / work / embodying / tap / 1343
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Economist_CompoundInterest({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Circuit',
        chrono: 'work',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1343,
        isSeal: false,
      }}
      arrivalText="A penny. Day one."
      prompt="The curve is flat for a long time. Then it is vertical. Do not quit in the flat days. The explosion is mathematical."
      resonantText="Patience. You held through the flat days and the explosion arrived. Exponential thinking: the power of compounding is invisible for 90% of the journey, then overwhelming in the final 10%."
      afterglowCoda="Do not quit in the flat days."
      onComplete={onComplete}
    >
      {(verse) => <CompoundInterestInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function CompoundInterestInteraction({ verse }: { verse: any }) {
  const [day, setDay] = useState(1);
  const [done, setDone] = useState(false);
  const MAX_DAY = 30;

  const value = Math.pow(2, day - 1); // cents
  const dollars = value / 100;

  const formatValue = (v: number) => {
    if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
    if (v >= 1) return `$${v.toFixed(2)}`;
    return `${(v * 100).toFixed(0)}c`;
  };

  const handleNext = () => {
    if (done) return;
    const next = day + 1;
    setDay(next);
    if (next >= MAX_DAY) {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 150;
  const CHART_X = 25, CHART_Y = 10;
  const CHART_W = W - 50, CHART_H = H - 30;

  // Build sparkline of all values up to current day
  const maxVal = Math.pow(2, MAX_DAY - 1) / 100;
  const points: string[] = [];
  for (let d = 1; d <= day; d++) {
    const v = Math.pow(2, d - 1) / 100;
    const x = CHART_X + ((d - 1) / (MAX_DAY - 1)) * CHART_W;
    const y = CHART_Y + CHART_H - (v / maxVal) * CHART_H;
    points.push(`${x},${y}`);
  }

  // Determine phase description
  const isFlat = day <= 20;
  const isElbow = day > 20 && day <= 25;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>day {day}</span>
        <motion.span
          key={day}
          style={{
            ...navicueType.data,
            color: done ? verse.palette.accent : isFlat ? verse.palette.text : verse.palette.accent,
          }}
          initial={{ opacity: 0.5, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {formatValue(dollars)}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Chart background */}
          <rect x={CHART_X} y={CHART_Y} width={CHART_W} height={CHART_H} rx={3}
            fill={verse.palette.primary} opacity={safeOpacity(0.02)} />

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(frac => (
            <line key={frac}
              x1={CHART_X} y1={CHART_Y + CHART_H * (1 - frac)}
              x2={CHART_X + CHART_W} y2={CHART_Y + CHART_H * (1 - frac)}
              stroke={verse.palette.primary} strokeWidth={0.3}
              strokeDasharray="3 4" opacity={safeOpacity(0.06)} />
          ))}

          {/* The curve */}
          {points.length > 1 && (
            <polyline
              points={points.join(' ')}
              fill="none"
              stroke={done ? verse.palette.accent : verse.palette.primary}
              strokeWidth={1.5}
              opacity={safeOpacity(done ? 0.4 : 0.25)}
            />
          )}

          {/* Current value dot */}
          {points.length > 0 && (
            <motion.circle
              cx={parseFloat(points[points.length - 1].split(',')[0])}
              cy={parseFloat(points[points.length - 1].split(',')[1])}
              r={4}
              fill={done ? verse.palette.accent : verse.palette.primary}
              animate={{ opacity: safeOpacity(done ? 0.5 : 0.3) }}
            />
          )}

          {/* "Flat" zone label */}
          {isFlat && (
            <text x={CHART_X + CHART_W * 0.3} y={CHART_Y + CHART_H - 5}
              textAnchor="middle" fill={verse.palette.textFaint}
              style={{ fontSize: '7px' }} opacity={0.2}>
              flat
            </text>
          )}

          {/* Elbow indicator */}
          {isElbow && (
            <motion.text
              x={CHART_X + CHART_W * 0.7} y={CHART_Y + 20}
              textAnchor="middle" fill={verse.palette.accent}
              style={{ fontSize: '8px' }}
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              here it comes
            </motion.text>
          )}

          {/* X-axis labels */}
          <text x={CHART_X} y={CHART_Y + CHART_H + 12}
            fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.15}>
            day 1
          </text>
          <text x={CHART_X + CHART_W} y={CHART_Y + CHART_H + 12}
            textAnchor="end" fill={verse.palette.textFaint}
            style={{ fontSize: '7px' }} opacity={0.15}>
            day 30
          </text>

          {/* Explosion label */}
          {done && (
            <motion.text
              x={CHART_X + CHART_W - 5} y={CHART_Y + 15}
              textAnchor="end" fill={verse.palette.accent}
              style={navicueType.choice}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.3 }}
            >
              $5.4M
            </motion.text>
          )}
        </svg>
      </div>

      {!done && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleNext}>
          next day ({day}/{MAX_DAY})
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'the explosion was mathematical'
          : isElbow ? 'the curve bends...'
            : isFlat ? 'flat. keep going.'
              : 'a penny doubles'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          exponential thinking
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'patience' : 'do not quit in the flat days'}
      </div>
    </div>
  );
}
