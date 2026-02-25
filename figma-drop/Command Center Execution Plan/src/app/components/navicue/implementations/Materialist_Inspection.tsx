/**
 * MATERIALIST #9 -- 1039. The Inspection
 * "The perfect wall hides the crack. X-ray it."
 * INTERACTION: A seemingly perfect wall. Draw across it to reveal
 * hidden cracks via an X-ray effect. The lesson: surface beauty
 * can mask structural weakness. Seeing clearly is the repair.
 * STEALTH KBE: K (Knowing) -- Deep Inspection / Honest Assessment
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
} from '@/app/design-system/navicue-blueprint';
import { useDrawInteraction } from '../interactions/useDrawInteraction';

interface Props { data?: any; onComplete?: () => void; }

const CRACKS = [
  { x1: 80, y1: 40, x2: 95, y2: 70 },
  { x1: 95, y1: 70, x2: 85, y2: 100 },
  { x1: 150, y1: 80, x2: 165, y2: 120 },
  { x1: 120, y1: 130, x2: 140, y2: 150 },
];

export default function Materialist_Inspection({ onComplete }: Props) {
  const [committed, setCommitted] = useState(false);

  const draw = useDrawInteraction({
    coverageThreshold: 0.8,
  });

  const handleCommit = useCallback((advance: () => void) => {
    setCommitted(true);
    setTimeout(() => advance(), 2000);
  }, []);

  const revealProgress = draw.coverage;
  const cracksVisible = revealProgress;

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Ember',
        chrono: 'work',
        kbe: 'knowing',
        hook: 'draw',
        specimenSeed: 1039,
        isSeal: false,
      }}
      arrivalText="A perfect surface..."
      prompt="Draw across the wall. X-ray what hides beneath."
      resonantText="The perfect wall hides the crack. Seeing clearly is the repair."
      afterglowCoda="Inspected."
      onComplete={onComplete}
      mechanism="Honest Assessment"
    >
      {(verse) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}>
          {/* Wall + X-ray */}
          <div
            {...draw.drawProps}
            style={{
              ...draw.drawProps.style,
              position: 'relative', width: 240, height: 180,
            }}
          >
            <svg viewBox="0 0 240 180" style={navicueStyles.heroSvg}>
              {/* Wall surface -- clean, smooth */}
              <rect x={30} y={20} width={180} height={140} rx={4}
                fill="none" stroke={verse.palette.primary} strokeWidth={0.8} opacity={0.12} />

              {/* Brick pattern */}
              {Array.from({ length: 5 }, (_, row) =>
                Array.from({ length: 4 }, (_, col) => (
                  <rect
                    key={`b${row}${col}`}
                    x={35 + col * 42 + (row % 2 ? 21 : 0)}
                    y={25 + row * 28}
                    width={38} height={24} rx={1}
                    fill="none" stroke={verse.palette.primary}
                    strokeWidth={0.3} opacity={0.04}
                  />
                ))
              )}

              {/* Hidden cracks (revealed by drawing) */}
              {CRACKS.map((crack, i) => (
                <motion.line
                  key={i}
                  x1={crack.x1} y1={crack.y1}
                  x2={crack.x2} y2={crack.y2}
                  stroke={verse.palette.accent}
                  strokeWidth={0.8}
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: cracksVisible > i / CRACKS.length ? 0.3 : 0 }}
                  transition={{ duration: 0.5 }}
                />
              ))}

              {/* X-ray sweep indicator */}
              {revealProgress > 0 && revealProgress < 1 && (
                <motion.rect
                  x={30 + revealProgress * 180} y={20}
                  width={4} height={140}
                  fill={verse.palette.accent}
                  opacity={0.08}
                />
              )}

              {/* Draw path visualization */}
              {draw.allPoints.length > 1 && (
                <polyline
                  points={draw.allPoints.map(p => `${p.x * 240},${p.y * 180}`).join(' ')}
                  fill="none"
                  stroke={verse.palette.accent}
                  strokeWidth={0.5}
                  opacity={0.1}
                />
              )}
            </svg>
          </div>

          {/* Status */}
          <motion.div
            animate={{ opacity: 0.5 }}
            style={{ ...navicueType.data, color: verse.palette.textFaint, textAlign: 'center' }}
          >
            {revealProgress < 0.1
              ? 'draw across the surface'
              : revealProgress < 1
                ? `${Math.round(revealProgress * 100)}% inspected`
                : 'All cracks revealed.'}
          </motion.div>

          {revealProgress >= 0.8 && !committed && (
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              onClick={() => handleCommit(verse.advance)}
              whileTap={{ scale: 0.95 }}
              style={{
                ...immersiveTapButton,
                ...navicueType.hint,
                color: verse.palette.text,
                cursor: 'pointer',
              }}
            >
              Now I see clearly
            </motion.button>
          )}

          {committed && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
              style={{ ...navicueType.texture, color: verse.palette.textFaint, fontStyle: 'italic' }}
            >
              The crack was always there. Now it can be fixed.
            </motion.div>
          )}
        </div>
      )}
    </NaviCueVerse>
  );
}