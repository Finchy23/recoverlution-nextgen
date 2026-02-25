/**
 * TUNING #3 -- 1193. The Fundamental Frequency
 * "What is the one deep note driving your life? Find the bass."
 * INTERACTION: Complex messy wave. Filter out noise. Big slow wave remains.
 * STEALTH KBE: Core Values -- value clarity (K)
 *
 * COMPOSITOR: science_x_soul / Echo / work / knowing / tap / 1193
 */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Tuning_FundamentalFrequency({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Echo',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1193,
        isSeal: false,
      }}
      arrivalText="A complex wave. Messy."
      prompt="The overtones are distracting. What is the fundamental? What is the one deep note driving your life? Find the bass."
      resonantText="Core Values. Beneath the noise of deadlines, opinions, and urgencies there was one slow wave. The fundamental. You filtered everything else and found it: the deep note that was always there, driving the rhythm of everything above. Value clarity."
      afterglowCoda="Base."
      onComplete={onComplete}
    >
      {(verse) => <FundamentalInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FundamentalInteraction({ verse }: { verse: any }) {
  const [filterLevel, setFilterLevel] = useState(0);
  const [done, setDone] = useState(false);
  const [time, setTime] = useState(0);
  const MAX_FILTER = 5;

  useEffect(() => {
    const interval = setInterval(() => setTime(t => t + 0.04), 30);
    return () => clearInterval(interval);
  }, []);

  const filter = useCallback(() => {
    if (done) return;
    setFilterLevel(prev => {
      const next = prev + 1;
      if (next >= MAX_FILTER) {
        setDone(true);
        setTimeout(() => verse.advance(), 2400);
      }
      return next;
    });
  }, [done, verse]);

  const pct = filterLevel / MAX_FILTER;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 80)}>
        <svg viewBox="0 0 160 80" style={navicueStyles.heroSvg}>
          {/* Complex wave */}
          <path
            d={Array.from({ length: 80 }).map((_, i) => {
              const x = i * 2;
              const fundamental = Math.sin((x + time * 15) * 0.04) * 18;
              const h2 = Math.sin((x + time * 15) * 0.08) * 8 * (1 - pct * 0.8);
              const h3 = Math.sin((x + time * 15) * 0.12) * 5 * (1 - pct);
              const h4 = Math.sin((x + time * 15) * 0.18) * 3 * Math.max(0, 1 - pct * 1.5);
              const noise = (Math.sin(x * 1.7 + time * 40) * 2 + Math.sin(x * 2.3) * 1.5) * Math.max(0, 1 - pct * 2);
              const y = 40 + fundamental + h2 + h3 + h4 + noise;
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke={done ? verse.palette.accent : 'hsla(200, 25%, 50%, 0.4)'}
            strokeWidth={done ? 2 : 1.5}
            opacity={done ? 0.6 : 0.4}
          />

          {/* Filter label */}
          <text x={80} y={12} textAnchor="middle"
            style={{ ...navicueType.hint, fontSize: 8 }}
            fill={done ? verse.palette.accent : verse.palette.textFaint} opacity={0.4}>
            {done ? 'fundamental' : `filter: ${filterLevel}/${MAX_FILTER}`}
          </text>

          {/* Overtone indicators being filtered */}
          {!done && (
            <g transform="translate(130, 20)">
              {['h4', 'h3', 'h2', 'f'].map((label, i) => {
                const isFiltered = (3 - i) < filterLevel;
                return (
                  <text key={label} x={0} y={i * 10}
                    style={{ ...navicueType.micro }}
                    fill={verse.palette.textFaint}
                    opacity={isFiltered ? 0.1 : 0.3}
                    textDecoration={isFiltered ? 'line-through' : 'none'}>
                    {label}
                  </text>
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {!done ? (
        <motion.button onClick={filter}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          filter
        </motion.button>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          base
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {done ? 'value clarity' : 'find the deep note'}
      </div>
    </div>
  );
}