/**
 * STRATEGIST #8 -- 1308. The Stalemate (Draw)
 * "If you cannot win, do not lose. Find the stalemate."
 * INTERACTION: Tap to maneuver into stalemate -- refusing to concede
 * STEALTH KBE: Resilience -- Survival Instinct (B)
 *
 * COMPOSITOR: koan_paradox / Pulse / night / believing / tap / 1308
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

export default function Strategist_Stalemate({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Pulse',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1308,
        isSeal: false,
      }}
      arrivalText="You are losing badly. No path to victory."
      prompt="If you cannot win, do not lose. Find the stalemate. Survival is a victory when the odds are impossible."
      resonantText="Resilience. You could not win, so you refused to lose. Survival instinct is the stalemate strategy: when every door is closed, close the last one yourself. A draw from a loss is a victory of will."
      afterglowCoda="Find the stalemate."
      onComplete={onComplete}
    >
      {(verse) => <StalemateInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function StalemateInteraction({ verse }: { verse: any }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const STEPS = 3;

  const handleMove = () => {
    if (done) return;
    const next = step + 1;
    setStep(next);
    if (next >= STEPS) {
      setDone(true);
      setTimeout(() => verse.advance(), 3200);
    }
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 200, H = 170;

  // King positions as it retreats into the corner
  const kingPositions = [
    { x: 100, y: 85 },
    { x: 140, y: 55 },
    { x: 165, y: 35 },
    { x: 175, y: 30 }, // corner: stalemate
  ];

  // Enemy pieces surrounding
  const enemyPieces = [
    { x: 50, y: 60, type: 'Q' },
    { x: 70, y: 100, type: 'R' },
    { x: 120, y: 120, type: 'R' },
    { x: 40, y: 130, type: 'K' },
  ];

  const currentKing = kingPositions[Math.min(step, kingPositions.length - 1)];

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Status */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>position</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.shadow,
        }}>
          {done ? 'stalemate' : 'losing'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <rect x={10} y={10} width={W - 20} height={H - 20} rx={6}
            fill={verse.palette.primary} opacity={safeOpacity(0.04)} />

          {/* Enemy pieces */}
          {enemyPieces.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={p.type === 'K' ? 10 : 11}
                fill={verse.palette.shadow} opacity={safeOpacity(0.06)} />
              <circle cx={p.x} cy={p.y} r={p.type === 'K' ? 10 : 11}
                fill="none" stroke={verse.palette.shadow}
                strokeWidth={0.8} opacity={safeOpacity(0.2)} />
              <text x={p.x} y={p.y + 4} textAnchor="middle"
                fill={verse.palette.shadow} style={{ fontSize: '11px' }} opacity={0.35}>
                {p.type}
              </text>
            </g>
          ))}

          {/* Control lines from enemy (threat squares) */}
          {step >= 1 && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: safeOpacity(0.08) }}>
              {/* Horizontal/vertical threat lines */}
              <line x1={70} y1={100} x2={W - 15} y2={100}
                stroke={verse.palette.shadow} strokeWidth={0.5} strokeDasharray="3 3" />
              <line x1={120} y1={15} x2={120} y2={120}
                stroke={verse.palette.shadow} strokeWidth={0.5} strokeDasharray="3 3" />
            </motion.g>
          )}

          {/* Your King (retreating to corner) */}
          <motion.g
            animate={{
              x: currentKing.x - kingPositions[0].x,
              y: currentKing.y - kingPositions[0].y,
            }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <circle cx={kingPositions[0].x} cy={kingPositions[0].y} r={10}
              fill={verse.palette.accent} opacity={safeOpacity(0.15)} />
            <circle cx={kingPositions[0].x} cy={kingPositions[0].y} r={10}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={1} opacity={safeOpacity(0.4)} />
            <text x={kingPositions[0].x} y={kingPositions[0].y + 4} textAnchor="middle"
              fill={verse.palette.accent} style={{ fontSize: '11px' }} opacity={0.6}>
              K
            </text>
          </motion.g>

          {/* No legal moves indicator (done) */}
          {done && (
            <motion.g>
              {/* X marks on all adjacent squares */}
              {[
                [currentKing.x - 15, currentKing.y],
                [currentKing.x + 15, currentKing.y],
                [currentKing.x, currentKing.y - 15],
                [currentKing.x, currentKing.y + 15],
                [currentKing.x - 12, currentKing.y - 12],
                [currentKing.x + 12, currentKing.y - 12],
              ].filter(([x, y]) => x > 10 && x < W - 10 && y > 10 && y < H - 10)
                .map(([x, y], i) => (
                  <motion.g key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: safeOpacity(0.2) }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <line x1={x - 3} y1={y - 3} x2={x + 3} y2={y + 3}
                      stroke={verse.palette.shadow} strokeWidth={1} />
                    <line x1={x + 3} y1={y - 3} x2={x - 3} y2={y + 3}
                      stroke={verse.palette.shadow} strokeWidth={1} />
                  </motion.g>
                ))}

              {/* "Draw" */}
              <motion.text
                x={W / 2} y={H - 12} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.choice}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.5 }}
              >
                1/2 - 1/2
              </motion.text>
            </motion.g>
          )}
        </svg>
      </div>

      {!done && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleMove}>
          {step === 0 ? 'retreat' : step === 1 ? 'corner' : 'trap yourself'}
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'survival is victory'
          : `no legal moves in ${STEPS - step} moves`}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          survival instinct
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'resilience' : 'refuse to lose'}
      </div>
    </div>
  );
}
