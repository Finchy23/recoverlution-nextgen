/**
 * ECONOMIST #6 -- 1346. The Utility Function
 * "The first bite is heaven. The last bite is poison. Stop at the peak."
 * INTERACTION: Tap to eat donuts. Utility rises, peaks, then falls. Stop at peak.
 * STEALTH KBE: Moderation -- Satisfaction Optimization (E)
 *
 * COMPOSITOR: sacred_ordinary / Pulse / morning / embodying / tap / 1346
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

const UTILITY_CURVE = [0, 10, 18, 24, 28, 30, 29, 25, 18, 8, -5];
// donut 0 to 10: 0, +10, +8, +6, +4, +2, -1, -4, -7, -10, -13

export default function Economist_UtilityFunction({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Pulse',
        chrono: 'morning',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1346,
        isSeal: false,
      }}
      arrivalText="A donut. Delicious."
      prompt="More is not always better. The first bite is heaven. The last bite is poison. Stop at the peak."
      resonantText="Moderation. You stopped at the peak and maximized satisfaction. Satisfaction optimization is the economic law of diminishing returns applied to life: know when the next unit subtracts more than it adds."
      afterglowCoda="Stop at the peak."
      onComplete={onComplete}
    >
      {(verse) => <UtilityFunctionInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function UtilityFunctionInteraction({ verse }: { verse: any }) {
  const [count, setCount] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [done, setDone] = useState(false);

  const utility = UTILITY_CURVE[count] || 0;
  const peak = count === 5;
  const declining = count > 5;
  const sick = count >= 9;

  const handleEat = () => {
    if (stopped || done) return;
    if (count >= 10) return;
    setCount(c => c + 1);
  };

  const handleStop = () => {
    if (done) return;
    setStopped(true);
    setDone(true);
    setTimeout(() => verse.advance(), 3000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 140;
  const CHART_X = 30, CHART_W = W - 60, CHART_H = 90, CHART_Y = 15;
  const ZERO_Y = CHART_Y + CHART_H * 0.85; // where utility=0 sits

  // Build sparkline
  const points = UTILITY_CURVE.slice(0, count + 1).map((u, i) => {
    const x = CHART_X + (i / 10) * CHART_W;
    const y = ZERO_Y - (u / 35) * (CHART_H * 0.8);
    return `${x},${y}`;
  });

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>utility</span>
        <motion.span style={{
          ...navicueType.data,
          color: done && peak ? verse.palette.accent
            : sick ? verse.palette.shadow
              : declining ? verse.palette.text : verse.palette.accent,
        }}>
          {done ? (peak ? 'peak' : `${utility}`) : utility < 0 ? `${utility}` : `+${utility}`}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Zero line */}
          <line x1={CHART_X} y1={ZERO_Y} x2={CHART_X + CHART_W} y2={ZERO_Y}
            stroke={verse.palette.primary} strokeWidth={0.5}
            strokeDasharray="3 3" opacity={safeOpacity(0.1)} />

          {/* Full curve hint (faint) */}
          <polyline
            points={UTILITY_CURVE.map((u, i) => {
              const x = CHART_X + (i / 10) * CHART_W;
              const y = ZERO_Y - (u / 35) * (CHART_H * 0.8);
              return `${x},${y}`;
            }).join(' ')}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={0.5} strokeDasharray="2 3"
            opacity={safeOpacity(0.04)}
          />

          {/* Actual progress curve */}
          {points.length > 1 && (
            <polyline
              points={points.join(' ')}
              fill="none"
              stroke={declining ? verse.palette.shadow : verse.palette.accent}
              strokeWidth={1.5}
              opacity={safeOpacity(0.3)}
            />
          )}

          {/* Current dot */}
          {count > 0 && (
            <motion.circle
              cx={CHART_X + (count / 10) * CHART_W}
              cy={ZERO_Y - (utility / 35) * (CHART_H * 0.8)}
              r={4}
              fill={declining ? verse.palette.shadow : verse.palette.accent}
              animate={{ opacity: safeOpacity(0.4) }}
            />
          )}

          {/* Peak marker */}
          {count >= 5 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
            >
              <line
                x1={CHART_X + (5 / 10) * CHART_W}
                y1={ZERO_Y - (30 / 35) * (CHART_H * 0.8) - 8}
                x2={CHART_X + (5 / 10) * CHART_W}
                y2={ZERO_Y - (30 / 35) * (CHART_H * 0.8) - 2}
                stroke={verse.palette.accent} strokeWidth={0.5}
              />
              <text
                x={CHART_X + (5 / 10) * CHART_W}
                y={ZERO_Y - (30 / 35) * (CHART_H * 0.8) - 10}
                textAnchor="middle" fill={verse.palette.accent}
                style={{ fontSize: '7px' }}
              >
                peak
              </text>
            </motion.g>
          )}

          {/* Donut count */}
          {Array.from({ length: Math.min(count, 10) }).map((_, i) => (
            <circle key={i}
              cx={CHART_X + (i / 10) * CHART_W + CHART_W / 20}
              cy={H - 8}
              r={3}
              fill={i < 5 ? verse.palette.accent : verse.palette.shadow}
              opacity={safeOpacity(i < 5 ? 0.2 : 0.1)}
            />
          ))}

          {/* X-axis label */}
          <text x={CHART_X + CHART_W / 2} y={H - 1} textAnchor="middle"
            fill={verse.palette.textFaint} style={{ fontSize: '6px' }} opacity={0.15}>
            donuts consumed
          </text>

          {/* Negative zone */}
          {utility < 0 && (
            <motion.text
              x={CHART_X + (count / 10) * CHART_W + 15}
              y={ZERO_Y - (utility / 35) * (CHART_H * 0.8)}
              fill={verse.palette.shadow} style={{ fontSize: '8px' }}
              animate={{ opacity: [0.2, 0.35, 0.2] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              sick
            </motion.text>
          )}
        </svg>
      </div>

      {!stopped && (
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button style={btn.base} whileTap={btn.active} onClick={handleEat}>
            eat donut #{count + 1}
          </motion.button>
          {count >= 3 && (
            <motion.button
              style={{ ...btn.base, padding: '8px 12px' }}
              whileTap={btn.active}
              onClick={handleStop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              stop
            </motion.button>
          )}
        </div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? (peak ? 'you stopped at the peak. optimal.'
          : declining ? 'past the peak. diminishing returns.'
            : 'you stopped. not bad.')
          : sick ? 'negative utility. too much.'
            : declining ? 'diminishing... consider stopping.'
              : peak ? 'this is the peak.'
                : 'more is better... for now.'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          satisfaction optimization
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'moderation' : 'stop at the peak'}
      </div>
    </div>
  );
}
