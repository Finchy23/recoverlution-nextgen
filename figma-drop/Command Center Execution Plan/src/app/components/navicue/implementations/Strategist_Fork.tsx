/**
 * STRATEGIST #5 -- 1305. The Fork (Dual Threat)
 * "Create a dilemma. The fork forces the error."
 * INTERACTION: Place a knight to attack two pieces at once -- opponent saves one, loses the other
 * STEALTH KBE: Leverage -- Multi-Vector Attack (K)
 *
 * COMPOSITOR: poetic_precision / Lattice / work / knowing / tap / 1305
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

export default function Strategist_Fork({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Lattice',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1305,
        isSeal: false,
      }}
      arrivalText="Two targets. One move."
      prompt="Do not attack one problem. Create a dilemma. Make them choose between two bad options. The fork forces the error."
      resonantText="Leverage. You forked two targets and the opponent could only save one. Multi-vector attack is the geometry of pressure: one point is a threat, two points is a dilemma."
      afterglowCoda="Force the error."
      onComplete={onComplete}
    >
      {(verse) => <ForkInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ForkInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'setup' | 'forked' | 'chosen' | 'captured'>('setup');
  const [saved, setSaved] = useState<'rook' | 'queen' | null>(null);

  const handleFork = () => {
    if (phase !== 'setup') return;
    setPhase('forked');
  };

  const handleSave = (piece: 'rook' | 'queen') => {
    if (phase !== 'forked') return;
    setSaved(piece);
    setPhase('chosen');
    setTimeout(() => {
      setPhase('captured');
      setTimeout(() => verse.advance(), 2800);
    }, 1200);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 180;

  const rookPos = { x: 60, y: 50 };
  const queenPos = { x: 170, y: 50 };
  const knightTarget = { x: 115, y: 100 };

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Board backdrop */}
          <rect x={10} y={10} width={W - 20} height={H - 20} rx={6}
            fill={verse.palette.primary} opacity={safeOpacity(0.04)} />

          {/* Grid pattern */}
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={i} x1={10} y1={10 + i * 25} x2={W - 10} y2={10 + i * 25}
              stroke={verse.palette.primary} strokeWidth={0.2} opacity={safeOpacity(0.05)} />
          ))}

          {/* Enemy Rook */}
          <motion.g
            animate={{
              opacity: saved === 'queen' && phase === 'captured' ? 0 : 1,
              y: saved === 'rook' && phase !== 'setup' ? -20 : 0,
            }}
            transition={{ duration: 0.4 }}
          >
            <circle cx={rookPos.x} cy={rookPos.y} r={14}
              fill={verse.palette.shadow} opacity={safeOpacity(0.08)} />
            <circle cx={rookPos.x} cy={rookPos.y} r={14}
              fill="none" stroke={verse.palette.shadow}
              strokeWidth={1} opacity={safeOpacity(0.25)} />
            <text x={rookPos.x} y={rookPos.y + 4} textAnchor="middle"
              fill={verse.palette.shadow} style={{ fontSize: '14px' }} opacity={0.4}>
              R
            </text>
          </motion.g>

          {/* Enemy Queen */}
          <motion.g
            animate={{
              opacity: saved === 'rook' && phase === 'captured' ? 0 : 1,
              y: saved === 'queen' && phase !== 'setup' ? -20 : 0,
            }}
            transition={{ duration: 0.4 }}
          >
            <circle cx={queenPos.x} cy={queenPos.y} r={14}
              fill={verse.palette.shadow} opacity={safeOpacity(0.08)} />
            <circle cx={queenPos.x} cy={queenPos.y} r={14}
              fill="none" stroke={verse.palette.shadow}
              strokeWidth={1} opacity={safeOpacity(0.25)} />
            <text x={queenPos.x} y={queenPos.y + 4} textAnchor="middle"
              fill={verse.palette.shadow} style={{ fontSize: '14px' }} opacity={0.4}>
              Q
            </text>
          </motion.g>

          {/* Knight (your piece) */}
          {phase !== 'setup' && (
            <motion.g
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <circle cx={knightTarget.x} cy={knightTarget.y} r={12}
                fill={verse.palette.accent} opacity={safeOpacity(0.15)} />
              <circle cx={knightTarget.x} cy={knightTarget.y} r={12}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={1} opacity={safeOpacity(0.4)} />
              <text x={knightTarget.x} y={knightTarget.y + 4} textAnchor="middle"
                fill={verse.palette.accent} style={{ fontSize: '13px' }} opacity={0.6}>
                N
              </text>
            </motion.g>
          )}

          {/* Attack lines from knight to targets */}
          {phase !== 'setup' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.line
                x1={knightTarget.x - 8} y1={knightTarget.y - 10}
                x2={rookPos.x + 10} y2={rookPos.y + 10}
                stroke={verse.palette.accent}
                strokeWidth={1} strokeDasharray="4 3"
                animate={{
                  opacity: saved === 'rook'
                    ? safeOpacity(0.08)
                    : [safeOpacity(0.15), safeOpacity(0.3), safeOpacity(0.15)],
                }}
                transition={saved ? {} : { repeat: Infinity, duration: 1 }}
              />
              <motion.line
                x1={knightTarget.x + 8} y1={knightTarget.y - 10}
                x2={queenPos.x - 10} y2={queenPos.y + 10}
                stroke={verse.palette.accent}
                strokeWidth={1} strokeDasharray="4 3"
                animate={{
                  opacity: saved === 'queen'
                    ? safeOpacity(0.08)
                    : [safeOpacity(0.15), safeOpacity(0.3), safeOpacity(0.15)],
                }}
                transition={saved ? {} : { repeat: Infinity, duration: 1 }}
              />
            </motion.g>
          )}

          {/* Capture burst */}
          {phase === 'captured' && (
            <motion.g>
              {[0, 60, 120, 180, 240, 300].map(angle => {
                const target = saved === 'rook' ? queenPos : rookPos;
                const rad = angle * Math.PI / 180;
                return (
                  <motion.line key={angle}
                    x1={target.x} y1={target.y}
                    stroke={verse.palette.accent}
                    strokeWidth={1}
                    initial={{
                      x2: target.x + 4 * Math.cos(rad),
                      y2: target.y + 4 * Math.sin(rad),
                      opacity: 0.4,
                    }}
                    animate={{
                      x2: target.x + 15 * Math.cos(rad),
                      y2: target.y + 15 * Math.sin(rad),
                      opacity: 0,
                    }}
                    transition={{ duration: 0.4 }}
                  />
                );
              })}
            </motion.g>
          )}

          {/* Result text */}
          {phase === 'captured' && (
            <motion.text
              x={W / 2} y={H - 12} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.choice}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.3 }}
            >
              {saved === 'rook' ? 'queen captured' : 'rook captured'}
            </motion.text>
          )}
        </svg>
      </div>

      {/* Actions */}
      {phase === 'setup' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleFork}>
          place the fork
        </motion.button>
      )}

      {phase === 'forked' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button
            style={{ ...btn.base, padding: '8px 14px' }}
            whileTap={btn.active}
            onClick={() => handleSave('rook')}
          >
            save rook
          </motion.button>
          <motion.button
            style={{ ...btn.base, padding: '8px 14px' }}
            whileTap={btn.active}
            onClick={() => handleSave('queen')}
          >
            save queen
          </motion.button>
        </div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'captured' ? 'the fork forced the error'
          : phase === 'chosen' ? 'they saved one...'
            : phase === 'forked' ? 'they can only save one'
              : 'attack both. they choose which to lose.'}
      </span>

      {phase === 'captured' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          multi-vector attack
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'captured' ? 'leverage' : 'create the dilemma'}
      </div>
    </div>
  );
}
