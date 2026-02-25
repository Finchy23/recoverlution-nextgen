/**
 * HISTORIAN #9 -- 1389. The Zeitgeist (The Spirit)
 * "Know the spirit of the times."
 * INTERACTION: Sail against the wind (culture). Hard. Sail with it. Fast.
 * STEALTH KBE: Cultural Intelligence -- Contextual Awareness (K)
 *
 * COMPOSITOR: poetic_precision / Drift / work / knowing / tap / 1389
 */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Historian_Zeitgeist({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Drift',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1389,
        isSeal: false,
      }}
      arrivalText="The wind blows right."
      prompt="Know the spirit of the times. You do not have to agree with it, but you must understand it to navigate it."
      resonantText="Cultural intelligence. You adjusted sails to the zeitgeist and moved fast. Contextual awareness: the wind does not care about your opinion. But if you read it, it will carry you."
      afterglowCoda="Read the wind."
      onComplete={onComplete}
    >
      {(verse) => <ZeitgeistInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ZeitgeistInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'against' | 'struggling' | 'adjusting' | 'with' | 'fast'>('against');

  useEffect(() => {
    if (phase === 'against') {
      const t = setTimeout(() => setPhase('struggling'), 2000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleAdjust = () => {
    if (phase !== 'struggling') return;
    setPhase('adjusting');
    setTimeout(() => {
      setPhase('with');
      setTimeout(() => {
        setPhase('fast');
        setTimeout(() => verse.advance(), 3000);
      }, 1500);
    }, 1000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 150;
  const CX = W / 2;

  // Wind direction (right to left visually, so sailing right = against)
  const WIND_DIR = -1; // blowing left
  const adjusted = phase === 'with' || phase === 'fast';
  const boatX = adjusted ? W - 60 : phase === 'adjusting' ? CX : 60;

  // Wind lines
  const windLines = Array.from({ length: 6 }).map((_, i) => ({
    y: 25 + i * 18,
    length: 25 + (i % 3) * 10,
    delay: i * 0.15,
  }));

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>sailing</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'fast' ? verse.palette.accent
            : adjusted ? verse.palette.text
              : phase === 'struggling' ? verse.palette.shadow : verse.palette.text,
        }}>
          {phase === 'fast' ? 'effortless speed'
            : adjusted ? 'with the wind'
              : phase === 'adjusting' ? 'adjusting sails...'
                : phase === 'struggling' ? 'struggling'
                  : 'against the wind'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Wind lines (blowing right) */}
          {windLines.map((wl, i) => (
            <motion.g key={i}>
              <motion.line
                y1={wl.y} y2={wl.y}
                stroke={verse.palette.primary} strokeWidth={0.5}
                strokeLinecap="round"
                animate={{
                  x1: [20, W - wl.length],
                  x2: [20 + wl.length, W],
                  opacity: safeOpacity(adjusted ? 0.08 : 0.05),
                }}
                transition={{
                  repeat: Infinity,
                  duration: adjusted ? 1.5 : 3,
                  delay: wl.delay,
                  ease: 'linear',
                }}
              />
            </motion.g>
          ))}

          {/* Wind label */}
          <text x={CX} y={15} textAnchor="middle"
            fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.15}>
            zeitgeist (wind direction)
          </text>
          <motion.path
            d={`M ${CX + 40},${12} L ${CX + 50},${12}`}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={0.5} opacity={safeOpacity(0.1)}
            markerEnd="none"
          />

          {/* Boat */}
          <motion.g
            animate={{ x: boatX - 60 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Hull */}
            <path
              d={`M 45,${H / 2 + 15} Q 60,${H / 2 + 22} 75,${H / 2 + 15}`}
              fill={phase === 'fast' ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(phase === 'fast' ? 0.15 : 0.08)} />
            <path
              d={`M 45,${H / 2 + 15} Q 60,${H / 2 + 22} 75,${H / 2 + 15}`}
              fill="none"
              stroke={phase === 'fast' ? verse.palette.accent : verse.palette.primary}
              strokeWidth={1.5}
              opacity={safeOpacity(phase === 'fast' ? 0.3 : 0.15)} />

            {/* Mast */}
            <line x1={60} y1={H / 2 + 14} x2={60} y2={H / 2 - 15}
              stroke={verse.palette.primary} strokeWidth={1}
              opacity={safeOpacity(0.12)} />

            {/* Sail (direction changes) */}
            <motion.path
              fill={adjusted ? verse.palette.accent : verse.palette.primary}
              animate={{
                d: adjusted
                  ? `M 60,${H / 2 - 15} Q 73,${H / 2} 60,${H / 2 + 10}`
                  : `M 60,${H / 2 - 15} Q 48,${H / 2} 60,${H / 2 + 10}`,
                opacity: safeOpacity(phase === 'fast' ? 0.15 : 0.08),
              }}
              transition={{ duration: 0.5 }}
            />
          </motion.g>

          {/* Speed indicator (wake trail) */}
          {adjusted && (
            <motion.line
              y1={H / 2 + 18} y2={H / 2 + 18}
              stroke={verse.palette.accent} strokeWidth={1}
              strokeDasharray="6 4"
              initial={{ x1: boatX - 20, x2: boatX - 20, opacity: 0 }}
              animate={{
                x1: 20,
                x2: boatX - 20,
                opacity: safeOpacity(phase === 'fast' ? 0.15 : 0.08),
              }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Struggle indicator */}
          {phase === 'struggling' && (
            <motion.g
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ repeat: Infinity, duration: 0.4 }}
            >
              <text x={75} y={H / 2 - 5}
                fill={verse.palette.shadow} style={{ fontSize: '8px' }}>
                resistance
              </text>
            </motion.g>
          )}

          {/* Water line */}
          <line x1={0} y1={H / 2 + 25} x2={W} y2={H / 2 + 25}
            stroke={verse.palette.primary} strokeWidth={0.3}
            opacity={safeOpacity(0.06)} />

          {/* Result */}
          {phase === 'fast' && (
            <motion.text x={CX} y={H - 8} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}>
              the wind carries you
            </motion.text>
          )}
        </svg>
      </div>

      {phase === 'struggling' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleAdjust}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          adjust sails
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'fast' ? 'read the wind. it does not care about your opinion.'
          : adjusted ? 'sailing with the zeitgeist. fast.'
            : phase === 'adjusting' ? 'adjusting to the wind...'
              : phase === 'struggling' ? 'sailing against culture. exhausting.'
                : 'the wind blows. you sail against it.'}
      </span>

      {phase === 'fast' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          contextual awareness
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'fast' ? 'cultural intelligence' : 'know the spirit of the times'}
      </div>
    </div>
  );
}
