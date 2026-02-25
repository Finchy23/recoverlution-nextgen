/**
 * POLITICIAN #9 -- 1359. The Long Game (Incumbency)
 * "If you lose, don't leave. Stay. Serve. The wheel turns."
 * INTERACTION: Lose election. Stay. Serve. 4 years pass. Win.
 * STEALTH KBE: Persistence -- Tenacity (E)
 *
 * COMPOSITOR: witness_ritual / Arc / night / embodying / tap / 1359
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

export default function Politician_LongGame({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Arc',
        chrono: 'night',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1359,
        isSeal: false,
      }}
      arrivalText="You lost the election."
      prompt="Politics is a marathon. If you lose, do not leave. Stay. Serve. The wheel turns. Be there when it comes back around."
      resonantText="Persistence. You lost, stayed, served, and won four years later. Tenacity: the wheel of fortune always turns. The question is whether you are still standing when it comes back around."
      afterglowCoda="The wheel turns."
      onComplete={onComplete}
    >
      {(verse) => <LongGameInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function LongGameInteraction({ verse }: { verse: any }) {
  const [year, setYear] = useState(0);
  const [done, setDone] = useState(false);
  const YEARS = 4;

  const phases = ['loss', 'stay', 'serve', 'serve', 'win'] as const;
  const currentPhase = phases[Math.min(year, phases.length - 1)];

  const handleNextYear = () => {
    if (done) return;
    const next = year + 1;
    setYear(next);
    if (next >= YEARS) {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 140;
  const CX = W / 2;

  // Timeline
  const TL_X1 = 30, TL_X2 = W - 30, TL_Y = H / 2;
  const TL_W = TL_X2 - TL_X1;

  // Year markers
  const yearMarkers = Array.from({ length: YEARS + 1 }).map((_, i) => ({
    x: TL_X1 + (i / YEARS) * TL_W,
    label: i === 0 ? 'loss' : i === YEARS ? 'election' : `year ${i}`,
    active: i <= year,
  }));

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>status</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent
            : year === 0 ? verse.palette.shadow : verse.palette.text,
        }}>
          {done ? 'elected'
            : year > 0 && year < YEARS ? 'serving (year ' + year + ')'
              : year === 0 ? 'lost'
                : 'election day'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Timeline track */}
          <line x1={TL_X1} y1={TL_Y} x2={TL_X2} y2={TL_Y}
            stroke={verse.palette.primary} strokeWidth={1}
            opacity={safeOpacity(0.1)} />

          {/* Progress fill */}
          <motion.line
            x1={TL_X1} y1={TL_Y}
            y2={TL_Y}
            stroke={done ? verse.palette.accent : verse.palette.primary}
            strokeWidth={2}
            animate={{
              x2: TL_X1 + (year / YEARS) * TL_W,
              opacity: safeOpacity(done ? 0.3 : 0.15),
            }}
            transition={{ duration: 0.5 }}
          />

          {/* Year markers */}
          {yearMarkers.map((m, i) => (
            <g key={i}>
              <motion.circle
                cx={m.x} cy={TL_Y} r={6}
                fill={m.active ? (i === YEARS && done ? verse.palette.accent : verse.palette.primary) : verse.palette.primary}
                animate={{
                  opacity: safeOpacity(m.active ? (i === YEARS && done ? 0.25 : 0.12) : 0.05),
                }}
                transition={{ duration: 0.3 }}
              />
              <text x={m.x} y={TL_Y + 18} textAnchor="middle"
                fill={m.active ? (done && i === YEARS ? verse.palette.accent : verse.palette.text) : verse.palette.textFaint}
                style={{ fontSize: '7px' }}
                opacity={m.active ? 0.3 : 0.15}>
                {m.label}
              </text>
            </g>
          ))}

          {/* Service dots (community goodwill accumulates) */}
          {year > 0 && year < YEARS && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {Array.from({ length: year * 3 }).map((_, i) => (
                <motion.circle key={i}
                  cx={TL_X1 + ((i + 1) / (YEARS * 3 + 1)) * TL_W}
                  cy={TL_Y - 20 - (i % 3) * 8}
                  r={3}
                  fill={verse.palette.accent}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: safeOpacity(0.1), scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                />
              ))}
              <text x={CX} y={TL_Y - 40} textAnchor="middle"
                fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}>
                goodwill
              </text>
            </motion.g>
          )}

          {/* Win celebration */}
          {done && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* Goodwill converges to victory */}
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.circle key={`win-${i}`}
                  r={3}
                  fill={verse.palette.accent}
                  initial={{
                    cx: TL_X1 + (i / 8) * TL_W,
                    cy: TL_Y - 25,
                    opacity: 0.1,
                  }}
                  animate={{
                    cx: TL_X2,
                    cy: TL_Y,
                    opacity: 0,
                  }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                />
              ))}

              {/* Victory pulse */}
              <motion.circle
                cx={TL_X2} cy={TL_Y}
                fill={verse.palette.accent}
                initial={{ r: 6, opacity: 0.2 }}
                animate={{ r: 30, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />

              <text x={CX} y={H - 8} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.micro}
                opacity={0.5}>
                the wheel turned
              </text>
            </motion.g>
          )}

          {/* Loss mark */}
          {year === 0 && (
            <motion.g
              animate={{ opacity: [0.2, 0.35, 0.2] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <text x={TL_X1} y={TL_Y - 15} textAnchor="middle"
                fill={verse.palette.shadow} style={{ fontSize: '8px' }}>
                defeated
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      {!done && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleNextYear}>
          {year === 0 ? 'stay in the district'
            : year < YEARS - 1 ? 'serve another year'
              : 'run again'}
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'you stayed. you served. you won.'
          : year > 0 ? 'serving. building goodwill. the wheel turns.'
            : 'defeated. the choice: leave or stay.'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          tenacity
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'persistence' : 'the wheel turns'}
      </div>
    </div>
  );
}
