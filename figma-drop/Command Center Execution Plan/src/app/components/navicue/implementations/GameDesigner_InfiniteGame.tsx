/**
 * GAME DESIGNER #1 -- 1391. The Infinite Game
 * "Finite games are played to win. Infinite games are played to keep playing."
 * INTERACTION: "Game Over." Change rule to "Respawn." Game continues.
 * STEALTH KBE: Sustainability -- Infinite Mindset (B)
 *
 * COMPOSITOR: pattern_glitch / Pulse / work / believing / tap / 1391
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

export default function GameDesigner_InfiniteGame({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Pulse',
        chrono: 'work',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1391,
        isSeal: false,
      }}
      arrivalText="Game Over."
      prompt="Finite games are played to win. Infinite games are played to keep playing. Do not try to beat life. Try to stay in the game."
      resonantText="Sustainability. You changed the rule and the game continued. Infinite mindset: the point was never to win. The point was to keep playing. The game that never ends is the only game worth entering."
      afterglowCoda="Keep playing."
      onComplete={onComplete}
    >
      {(verse) => <InfiniteGameInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function InfiniteGameInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'over' | 'editing' | 'respawn' | 'infinite'>('over');

  const handleEdit = () => {
    if (phase !== 'over') return;
    setPhase('editing');
  };

  const handleRespawn = () => {
    if (phase !== 'editing') return;
    setPhase('respawn');
    setTimeout(() => {
      setPhase('infinite');
      setTimeout(() => verse.advance(), 3000);
    }, 1500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 150;
  const CX = W / 2, CY = H / 2;

  const alive = phase === 'respawn' || phase === 'infinite';

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>state</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'infinite' ? verse.palette.accent
            : alive ? verse.palette.text
              : phase === 'editing' ? verse.palette.text : verse.palette.shadow,
        }}>
          {phase === 'infinite' ? 'playing (infinite)'
            : alive ? 'respawning...'
              : phase === 'editing' ? 'editing rules...'
                : 'game over'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Screen frame */}
          <rect x={CX - 65} y={20} width={130} height={90} rx={5}
            fill={verse.palette.primary} opacity={safeOpacity(0.03)} />
          <rect x={CX - 65} y={20} width={130} height={90} rx={5}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={1} opacity={safeOpacity(0.1)} />

          {/* Screen scanline */}
          <line x1={CX - 60} y1={25} x2={CX + 60} y2={25}
            stroke={verse.palette.primary} strokeWidth={0.3}
            opacity={safeOpacity(0.04)} />

          {/* GAME OVER text (fades when editing) */}
          {!alive && (
            <motion.text
              x={CX} y={CY + 2} textAnchor="middle"
              fill={verse.palette.shadow}
              style={{ fontSize: '14px', fontFamily: 'monospace' }}
              animate={{
                opacity: phase === 'editing' ? 0.15 : 0.35,
              }}
            >
              GAME OVER
            </motion.text>
          )}

          {/* Rule editor overlay */}
          {phase === 'editing' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Console box */}
              <rect x={CX - 55} y={35} width={110} height={55} rx={3}
                fill={verse.palette.primary} opacity={safeOpacity(0.06)} />

              {/* Old rule (strikethrough) */}
              <text x={CX - 45} y={50}
                fill={verse.palette.shadow} style={{ fontSize: '8px', fontFamily: 'monospace' }}
                opacity={0.2} textDecoration="line-through">
                rule: onDeath = "end"
              </text>

              {/* New rule */}
              <motion.text x={CX - 45} y={65}
                fill={verse.palette.accent} style={{ fontSize: '8px', fontFamily: 'monospace' }}
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ repeat: Infinity, duration: 1 }}>
                rule: onDeath = "respawn"
              </motion.text>

              {/* Cursor blink */}
              <motion.rect
                x={CX + 40} y={58} width={5} height={10}
                fill={verse.palette.accent}
                animate={{ opacity: [0.4, 0, 0.4] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              />
            </motion.g>
          )}

          {/* Respawn animation */}
          {alive && (
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              style={{ transformOrigin: `${CX}px ${CY}px` }}
            >
              {/* Player avatar */}
              <circle cx={CX} cy={CY - 5} r={8}
                fill={verse.palette.accent} opacity={safeOpacity(0.15)} />
              <line x1={CX} y1={CY + 3} x2={CX} y2={CY + 18}
                stroke={verse.palette.accent} strokeWidth={1.5}
                opacity={safeOpacity(0.2)} />

              {/* Respawn rings */}
              {[0, 1, 2].map(i => (
                <motion.circle key={i}
                  cx={CX} cy={CY + 5} r={12 + i * 8}
                  fill="none" stroke={verse.palette.accent}
                  strokeWidth={0.5}
                  initial={{ opacity: 0.3, scale: 0.5 }}
                  animate={{ opacity: 0, scale: 1.5 }}
                  transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
                />
              ))}

              {/* Score continuing */}
              {phase === 'infinite' && (
                <motion.text x={CX + 40} y={40}
                  fill={verse.palette.accent} style={{ fontSize: '8px', fontFamily: 'monospace' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}>
                  playing...
                </motion.text>
              )}
            </motion.g>
          )}

          {/* Infinity symbol */}
          {phase === 'infinite' && (
            <motion.path
              d={`M ${CX - 12},${H - 20} C ${CX - 12},${H - 28} ${CX - 2},${H - 28} ${CX},${H - 20} C ${CX + 2},${H - 12} ${CX + 12},${H - 12} ${CX + 12},${H - 20} C ${CX + 12},${H - 28} ${CX + 2},${H - 28} ${CX},${H - 20} C ${CX - 2},${H - 12} ${CX - 12},${H - 12} ${CX - 12},${H - 20}`}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={1.5}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: safeOpacity(0.3) }}
              transition={{ duration: 1.5, delay: 0.3 }}
            />
          )}

          {/* Result */}
          {phase === 'infinite' && (
            <motion.text x={CX} y={H - 3} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              transition={{ delay: 0.8 }}>
              the game that never ends
            </motion.text>
          )}
        </svg>
      </div>

      {phase === 'over' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleEdit}>
          edit the rules
        </motion.button>
      )}

      {phase === 'editing' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleRespawn}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          apply: respawn
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'infinite' ? 'the point was never to win. the point was to keep playing.'
          : alive ? 'respawning...'
            : phase === 'editing' ? 'change the rule. onDeath = "respawn".'
              : 'game over. unless you change the rules.'}
      </span>

      {phase === 'infinite' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          infinite mindset
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'infinite' ? 'sustainability' : 'stay in the game'}
      </div>
    </div>
  );
}
