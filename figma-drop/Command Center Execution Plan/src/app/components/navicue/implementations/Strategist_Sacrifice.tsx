/**
 * STRATEGIST #2 -- 1302. The Sacrifice (Gambit)
 * "Sacrifice the ego to capture the King."
 * INTERACTION: Tap to sacrifice the Queen -- opponent takes, then checkmate in 2
 * STEALTH KBE: Strategic Loss -- Long-Term Gain (K)
 *
 * COMPOSITOR: koan_paradox / Arc / work / knowing / tap / 1302
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Strategist_Sacrifice({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Arc',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1302,
        isSeal: false,
      }}
      arrivalText="You are losing. One piece remains powerful."
      prompt="You are holding onto the pieces too tightly. To win the game, you must lose the piece. Sacrifice the ego to capture the King."
      resonantText="Strategic loss. You gave up the queen and won the game. Long-term gain is the counterintuitive truth that the strongest move is sometimes to lose your strongest piece."
      afterglowCoda="Sacrifice the ego."
      onComplete={onComplete}
    >
      {(verse) => <SacrificeInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SacrificeInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'decide' | 'taken' | 'mate1' | 'checkmate'>('decide');

  const handleSacrifice = () => {
    if (phase !== 'decide') return;
    setPhase('taken');
    setTimeout(() => setPhase('mate1'), 1500);
    setTimeout(() => setPhase('checkmate'), 3000);
    setTimeout(() => verse.advance(), 5500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 200, H = 160;

  // Simplified board representation
  const queenPos = { x: 70, y: 60 };
  const enemyKingPos = { x: 150, y: 40 };
  const rookPos = { x: 40, y: 120 };
  const sacrificeTarget = { x: 130, y: 45 };

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Material readout */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>material</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'checkmate' ? verse.palette.accent
            : phase === 'taken' ? verse.palette.shadow : verse.palette.text,
        }}>
          {phase === 'decide' ? 'losing' : phase === 'taken' ? 'queen lost'
            : phase === 'mate1' ? 'rook moves...' : 'checkmate'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Board region */}
          <rect x={15} y={15} width={W - 30} height={H - 30} rx={4}
            fill={verse.palette.primary} opacity={safeOpacity(0.04)} />

          {/* Grid lines */}
          {Array.from({ length: 5 }).map((_, i) => (
            <g key={i}>
              <line x1={15} y1={15 + i * 32} x2={W - 15} y2={15 + i * 32}
                stroke={verse.palette.primary} strokeWidth={0.3} opacity={safeOpacity(0.06)} />
              <line x1={15 + i * 42} y1={15} x2={15 + i * 42} y2={H - 15}
                stroke={verse.palette.primary} strokeWidth={0.3} opacity={safeOpacity(0.06)} />
            </g>
          ))}

          {/* White Queen */}
          <AnimatePresence>
            {phase === 'decide' && (
              <motion.g exit={{ opacity: 0, scale: 0 }} transition={{ duration: 0.3 }}>
                <circle cx={queenPos.x} cy={queenPos.y} r={12}
                  fill={verse.palette.accent} opacity={safeOpacity(0.15)} />
                <circle cx={queenPos.x} cy={queenPos.y} r={12}
                  fill="none" stroke={verse.palette.accent}
                  strokeWidth={1} opacity={safeOpacity(0.4)} />
                <text x={queenPos.x} y={queenPos.y + 4} textAnchor="middle"
                  fill={verse.palette.accent} style={{ fontSize: '12px' }} opacity={0.6}>
                  Q
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Sacrifice arrow */}
          {phase === 'decide' && (
            <motion.line
              x1={queenPos.x + 14} y1={queenPos.y - 5}
              x2={sacrificeTarget.x - 8} y2={sacrificeTarget.y}
              stroke={verse.palette.accent}
              strokeWidth={1} strokeDasharray="3 2"
              animate={{ opacity: [safeOpacity(0.15), safeOpacity(0.3), safeOpacity(0.15)] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}

          {/* Sacrifice capture burst */}
          {phase === 'taken' && (
            <motion.g>
              {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
                const rad = angle * Math.PI / 180;
                return (
                  <motion.line key={angle}
                    x1={sacrificeTarget.x} y1={sacrificeTarget.y}
                    stroke={verse.palette.shadow}
                    strokeWidth={0.8}
                    initial={{
                      x2: sacrificeTarget.x + 3 * Math.cos(rad),
                      y2: sacrificeTarget.y + 3 * Math.sin(rad),
                      opacity: 0.4,
                    }}
                    animate={{
                      x2: sacrificeTarget.x + 12 * Math.cos(rad),
                      y2: sacrificeTarget.y + 12 * Math.sin(rad),
                      opacity: 0,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                );
              })}
            </motion.g>
          )}

          {/* Black King */}
          <motion.g
            animate={{
              x: phase === 'checkmate' ? 5 : 0,
            }}
          >
            <circle cx={enemyKingPos.x} cy={enemyKingPos.y} r={12}
              fill={verse.palette.shadow} opacity={safeOpacity(0.1)} />
            <circle cx={enemyKingPos.x} cy={enemyKingPos.y} r={12}
              fill="none" stroke={verse.palette.shadow}
              strokeWidth={1} opacity={safeOpacity(0.25)} />
            <text x={enemyKingPos.x} y={enemyKingPos.y + 4} textAnchor="middle"
              fill={verse.palette.shadow} style={{ fontSize: '12px' }} opacity={0.4}>
              K
            </text>
          </motion.g>

          {/* White Rook (delivers checkmate) */}
          <motion.g
            animate={{
              x: phase === 'mate1' || phase === 'checkmate' ? enemyKingPos.x - rookPos.x : 0,
              y: phase === 'mate1' || phase === 'checkmate' ? enemyKingPos.y + 20 - rookPos.y : 0,
            }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <circle cx={rookPos.x} cy={rookPos.y} r={10}
              fill={verse.palette.accent} opacity={safeOpacity(0.12)} />
            <circle cx={rookPos.x} cy={rookPos.y} r={10}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={0.8} opacity={safeOpacity(0.3)} />
            <text x={rookPos.x} y={rookPos.y + 4} textAnchor="middle"
              fill={verse.palette.accent} style={{ fontSize: '11px' }} opacity={0.5}>
              R
            </text>
          </motion.g>

          {/* Checkmate indicator */}
          {phase === 'checkmate' && (
            <motion.g>
              <motion.text
                x={W / 2} y={H - 15} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.choice}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.3 }}
              >
                checkmate
              </motion.text>
            </motion.g>
          )}
        </svg>
      </div>

      {phase === 'decide' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleSacrifice}>
          sacrifice queen
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'checkmate' ? 'you lost the piece. you won the game.'
          : phase === 'mate1' ? 'the path is clear...'
            : phase === 'taken' ? 'the queen is gone...'
              : 'to win the game, lose the piece'}
      </span>

      {phase === 'checkmate' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          long-term gain
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'checkmate' ? 'strategic loss' : 'sacrifice the ego'}
      </div>
    </div>
  );
}
