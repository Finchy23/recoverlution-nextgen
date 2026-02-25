/**
 * HISTORIAN #4 -- 1384. The Renaissance (Rebirth)
 * "When the world goes dark, go to the library."
 * INTERACTION: Dark ages. Knowledge lost. Find scroll. Read it. Light returns.
 * STEALTH KBE: Learning -- Intellectual Curiosity (E)
 *
 * COMPOSITOR: witness_ritual / Drift / night / embodying / tap / 1384
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

export default function Historian_Renaissance({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Drift',
        chrono: 'night',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1384,
        isSeal: false,
      }}
      arrivalText="The dark ages. Knowledge lost."
      prompt="When the world goes dark, go to the library. The light is stored in the old words. Rediscover what was lost to find the future."
      resonantText="Learning. You found the scroll and read the old words and light returned. Intellectual curiosity: the renaissance was not invention. It was rediscovery. The future is hidden in the past."
      afterglowCoda="Go to the library."
      onComplete={onComplete}
    >
      {(verse) => <RenaissanceInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function RenaissanceInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'dark' | 'found' | 'reading' | 'light'>('dark');

  const handleFind = () => {
    if (phase !== 'dark') return;
    setPhase('found');
  };

  const handleRead = () => {
    if (phase !== 'found') return;
    setPhase('reading');
    setTimeout(() => {
      setPhase('light');
      setTimeout(() => verse.advance(), 3000);
    }, 2000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 160;
  const CX = W / 2, CY = H / 2;

  const isLight = phase === 'light';
  const isReading = phase === 'reading' || isLight;

  // Light radius (grows as reading progresses)
  const lightR = isLight ? 90 : isReading ? 45 : 0;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>age</span>
        <motion.span style={{
          ...navicueType.data,
          color: isLight ? verse.palette.accent : verse.palette.shadow,
        }}>
          {isLight ? 'renaissance'
            : phase === 'reading' ? 'reading...'
              : phase === 'found' ? 'scroll found'
                : 'dark ages'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Darkness overlay */}
          <motion.rect
            x={0} y={0} width={W} height={H}
            fill={verse.palette.primary}
            animate={{
              opacity: safeOpacity(isLight ? 0 : isReading ? 0.02 : 0.05),
            }}
            transition={{ duration: 1 }}
          />

          {/* Light emanation from scroll */}
          {isReading && (
            <motion.circle
              cx={CX} cy={CY}
              fill={verse.palette.accent}
              initial={{ r: 0, opacity: 0 }}
              animate={{ r: lightR, opacity: safeOpacity(isLight ? 0.06 : 0.03) }}
              transition={{ duration: isLight ? 1.5 : 1 }}
            />
          )}

          {/* Ruined columns (dark ages scenery) */}
          {[40, 180].map((x, i) => (
            <g key={`col-${i}`}>
              <rect x={x - 4} y={30} width={8} height={70} rx={1}
                fill={verse.palette.primary}
                opacity={safeOpacity(isLight ? 0.04 : 0.06)} />
              {/* Broken top */}
              <path d={`M ${x - 4},${30} L ${x - 2},${25} L ${x + 2},${28} L ${x + 4},${30}`}
                fill={verse.palette.primary} opacity={safeOpacity(0.04)} />
            </g>
          ))}

          {/* Scroll (center) */}
          {phase !== 'dark' && (
            <motion.g
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Scroll body */}
              <rect x={CX - 22} y={CY - 18} width={44} height={36} rx={3}
                fill={isLight ? verse.palette.accent : verse.palette.primary}
                opacity={safeOpacity(isLight ? 0.1 : 0.06)} />
              <rect x={CX - 22} y={CY - 18} width={44} height={36} rx={3}
                fill="none"
                stroke={isLight ? verse.palette.accent : verse.palette.primary}
                strokeWidth={1}
                opacity={safeOpacity(isLight ? 0.3 : 0.15)} />

              {/* Text lines on scroll */}
              {[0, 1, 2, 3].map(i => (
                <motion.line key={i}
                  x1={CX - 14} y1={CY - 10 + i * 7}
                  x2={CX + 14} y2={CY - 10 + i * 7}
                  stroke={isLight ? verse.palette.accent : verse.palette.primary}
                  strokeWidth={0.5}
                  animate={{
                    opacity: safeOpacity(
                      isReading ? (isLight ? 0.2 : 0.1) : 0.04
                    ),
                  }}
                  transition={{ delay: isReading ? i * 0.3 : 0 }}
                />
              ))}

              {/* Glow halo when reading */}
              {isReading && (
                <motion.circle
                  cx={CX} cy={CY} r={28}
                  fill="none" stroke={verse.palette.accent}
                  strokeWidth={0.5}
                  animate={{ opacity: [safeOpacity(0.05), safeOpacity(0.15), safeOpacity(0.05)] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              )}
            </motion.g>
          )}

          {/* Stars appearing (renaissance) */}
          {isLight && Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const r = 65 + (i % 2) * 15;
            return (
              <motion.circle key={`star-${i}`}
                cx={CX + Math.cos(angle) * r}
                cy={CY + Math.sin(angle) * r}
                r={1.5}
                fill={verse.palette.accent}
                initial={{ opacity: 0 }}
                animate={{ opacity: safeOpacity(0.2) }}
                transition={{ delay: 0.2 + i * 0.1 }}
              />
            );
          })}

          {/* Result */}
          {isLight && (
            <motion.text x={CX} y={H - 5} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}>
              the light is stored in the old words
            </motion.text>
          )}
        </svg>
      </div>

      {phase === 'dark' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleFind}>
          search for the scroll
        </motion.button>
      )}

      {phase === 'found' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleRead}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          read the old words
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {isLight ? 'the renaissance. rediscovery. the future hidden in the past.'
          : isReading ? 'the words glow. light spreads...'
            : phase === 'found' ? 'a scroll. ancient. full of old knowledge.'
              : 'darkness. knowledge lost. but somewhere, a library.'}
      </span>

      {isLight && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          intellectual curiosity
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {isLight ? 'learning' : 'go to the library'}
      </div>
    </div>
  );
}
