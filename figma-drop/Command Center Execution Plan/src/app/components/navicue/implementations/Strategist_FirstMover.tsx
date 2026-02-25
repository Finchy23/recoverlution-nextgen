/**
 * STRATEGIST #1 -- 1301. The First Mover
 * "The first mover sets the tempo. Do not wait for permission."
 * INTERACTION: Tap to move pawn to e4 -- advantage bar shifts, board illuminates
 * STEALTH KBE: Initiative -- Proactivity (B)
 *
 * COMPOSITOR: science_x_soul / Lattice / morning / believing / tap / 1301
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

export default function Strategist_FirstMover({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Lattice',
        chrono: 'morning',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1301,
        isSeal: false,
      }}
      arrivalText="A chessboard. You are White. The clock ticks."
      prompt="The board is neutral until you move. The first mover sets the tempo. Do not wait for permission. Open the game."
      resonantText="Initiative. You moved first and the board came alive. Proactivity is the understanding that advantage decays with hesitation. The tempo belongs to the one who opens."
      afterglowCoda="Open the game."
      onComplete={onComplete}
    >
      {(verse) => <FirstMoverInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FirstMoverInteraction({ verse }: { verse: any }) {
  const [moved, setMoved] = useState(false);
  const [done, setDone] = useState(false);

  const handleMove = () => {
    if (moved) return;
    setMoved(true);
    setDone(true);
    setTimeout(() => verse.advance(), 3200);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 220;
  const BOARD_X = 30, BOARD_Y = 30;
  const SQ = 20; // square size
  const COLS = 8, ROWS = 8;

  // e2 = col 4, row 6; e4 = col 4, row 4 (0-indexed from top)
  const E2 = { col: 4, row: 6 };
  const E4 = { col: 4, row: 4 };

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      {/* Advantage bar */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', width: COLS * SQ + BOARD_X * 2 - 60 }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint, opacity: 0.4 }}>advantage</span>
        <div style={{
          flex: 1, height: 4, borderRadius: 2,
          background: verse.palette.primary,
          opacity: 0.08, position: 'relative', overflow: 'hidden',
        }}>
          <motion.div
            style={{
              position: 'absolute', top: 0, left: '50%', height: '100%',
              background: verse.palette.accent, borderRadius: 2,
            }}
            animate={{
              width: moved ? 30 : 0,
              left: moved ? '50%' : '50%',
              opacity: moved ? 0.5 : 0,
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <motion.span style={{
          ...navicueType.micro,
          color: moved ? verse.palette.accent : verse.palette.textFaint,
        }} animate={{ opacity: moved ? 0.6 : 0.3 }}>
          {moved ? 'white' : 'neutral'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Board squares */}
          {Array.from({ length: ROWS }).map((_, row) =>
            Array.from({ length: COLS }).map((_, col) => {
              const isDark = (row + col) % 2 === 1;
              const x = BOARD_X + col * SQ;
              const y = BOARD_Y + row * SQ;
              const isE4 = row === E4.row && col === E4.col;

              return (
                <motion.rect key={`${row}-${col}`}
                  x={x} y={y} width={SQ} height={SQ}
                  fill={isDark ? verse.palette.primary : 'transparent'}
                  animate={{
                    opacity: isE4 && moved
                      ? safeOpacity(0.15)
                      : isDark ? safeOpacity(0.06) : 0,
                  }}
                />
              );
            })
          )}

          {/* Board border */}
          <rect x={BOARD_X} y={BOARD_Y} width={COLS * SQ} height={ROWS * SQ}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={0.5} opacity={safeOpacity(0.15)} />

          {/* Rank/file labels */}
          {['a','b','c','d','e','f','g','h'].map((f, i) => (
            <text key={f} x={BOARD_X + i * SQ + SQ / 2} y={BOARD_Y + ROWS * SQ + 12}
              textAnchor="middle" fill={verse.palette.textFaint}
              style={{ fontSize: '8px' }} opacity={f === 'e' && moved ? 0.5 : 0.2}>
              {f}
            </text>
          ))}
          {['8','7','6','5','4','3','2','1'].map((r, i) => (
            <text key={r} x={BOARD_X - 8} y={BOARD_Y + i * SQ + SQ / 2 + 3}
              textAnchor="middle" fill={verse.palette.textFaint}
              style={{ fontSize: '8px' }} opacity={r === '4' && moved ? 0.5 : 0.2}>
              {r}
            </text>
          ))}

          {/* White pawn on e2 (before move) */}
          {!moved && (
            <g>
              <circle
                cx={BOARD_X + E2.col * SQ + SQ / 2}
                cy={BOARD_Y + E2.row * SQ + SQ / 2}
                r={7}
                fill={verse.palette.accent} opacity={safeOpacity(0.2)} />
              <circle
                cx={BOARD_X + E2.col * SQ + SQ / 2}
                cy={BOARD_Y + E2.row * SQ + SQ / 2}
                r={7}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.5} opacity={safeOpacity(0.35)} />
            </g>
          )}

          {/* Pawn moving to e4 */}
          {moved && (
            <motion.g
              initial={{
                y: (E2.row - E4.row) * SQ,
              }}
              animate={{ y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <circle
                cx={BOARD_X + E4.col * SQ + SQ / 2}
                cy={BOARD_Y + E4.row * SQ + SQ / 2}
                r={7}
                fill={verse.palette.accent} opacity={safeOpacity(0.3)} />
              <circle
                cx={BOARD_X + E4.col * SQ + SQ / 2}
                cy={BOARD_Y + E4.row * SQ + SQ / 2}
                r={7}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={1} opacity={safeOpacity(0.5)} />
            </motion.g>
          )}

          {/* Board illumination on move */}
          {moved && (
            <motion.g>
              {/* Central diagonal influence lines */}
              {[
                [E4.col - 1, E4.row - 1], [E4.col + 1, E4.row - 1],
              ].map(([c, r], i) => (
                <motion.rect key={i}
                  x={BOARD_X + c * SQ + 2} y={BOARD_Y + r * SQ + 2}
                  width={SQ - 4} height={SQ - 4} rx={2}
                  fill={verse.palette.accent}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: safeOpacity(0.08) }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                />
              ))}

              {/* Central control squares (d5, e5, f5) */}
              {[3, 4, 5].map((c, i) => (
                <motion.rect key={`ctrl-${i}`}
                  x={BOARD_X + c * SQ + 1} y={BOARD_Y + 3 * SQ + 1}
                  width={SQ - 2} height={SQ - 2} rx={1}
                  fill={verse.palette.accent}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: safeOpacity(0.05) }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                />
              ))}
            </motion.g>
          )}

          {/* "1. e4" notation */}
          {moved && (
            <motion.text
              x={W - 15} y={BOARD_Y + 15}
              textAnchor="end"
              fill={verse.palette.accent}
              style={navicueType.choice}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.4 }}
            >
              1. e4
            </motion.text>
          )}
        </svg>
      </div>

      {!moved && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleMove}>
          e4
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'advantage is yours'
          : 'advantage is decaying. move.'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          proactivity
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'initiative' : 'open the game'}
      </div>
    </div>
  );
}
