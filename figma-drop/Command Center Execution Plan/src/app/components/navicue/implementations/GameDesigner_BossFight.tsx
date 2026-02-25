/**
 * GAME DESIGNER #6 -- 1396. The Boss Fight
 * "The boss fight means you are at the end of the level."
 * INTERACTION: Giant monster (fear). "Ready?" Engage. Defeat.
 * STEALTH KBE: Courage -- Challenge Acceptance (E)
 *
 * COMPOSITOR: witness_ritual / Arc / night / embodying / tap / 1396
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

export default function GameDesigner_BossFight({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Arc',
        chrono: 'night',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1396,
        isSeal: false,
      }}
      arrivalText="A giant shadow. The boss."
      prompt="The boss fight means you are at the end of the level. It is supposed to be hard. It means you are progressing. Draw your sword."
      resonantText="Courage. You engaged the boss and stood your ground. Challenge acceptance: the hardest fight is always at the threshold of the next level. If it is terrifying, you are close."
      afterglowCoda="Draw your sword."
      onComplete={onComplete}
    >
      {(verse) => <BossFightInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function BossFightInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'appear' | 'ready' | 'fighting' | 'victory'>('appear');
  const [hits, setHits] = useState(0);
  const TARGET = 4;

  const handleReady = () => {
    if (phase !== 'appear') return;
    setPhase('ready');
    setTimeout(() => setPhase('fighting'), 600);
  };

  const handleStrike = () => {
    if (phase !== 'fighting') return;
    const next = hits + 1;
    setHits(next);
    if (next >= TARGET) {
      setPhase('victory');
      setTimeout(() => verse.advance(), 3000);
    }
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 160;
  const CX = W / 2;

  // Boss
  const BOSS_X = CX, BOSS_Y = 50;
  const bossScale = 1 - (hits / TARGET) * 0.4;
  const bossOp = phase === 'victory' ? 0.02 : 0.08 * bossScale;

  // Player
  const PLAYER_Y = H - 50;

  // Health bar
  const bossHealth = 1 - hits / TARGET;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>boss</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'victory' ? verse.palette.accent
            : verse.palette.shadow,
        }}>
          {phase === 'victory' ? 'defeated'
            : phase === 'fighting' ? `${hits}/${TARGET} strikes`
              : phase === 'ready' ? 'engaging...'
                : 'approaching'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Boss monster */}
          <motion.g
            animate={{
              scale: phase === 'victory' ? 0.3 : bossScale,
              opacity: phase === 'victory' ? 0.1 : 1,
            }}
            transition={{ duration: 0.3 }}
            style={{ transformOrigin: `${BOSS_X}px ${BOSS_Y}px` }}
          >
            {/* Body */}
            <ellipse cx={BOSS_X} cy={BOSS_Y} rx={35} ry={28}
              fill={verse.palette.shadow} opacity={safeOpacity(bossOp)} />
            {/* Eyes */}
            <circle cx={BOSS_X - 10} cy={BOSS_Y - 5} r={4}
              fill={verse.palette.shadow} opacity={safeOpacity(bossOp * 1.5)} />
            <circle cx={BOSS_X + 10} cy={BOSS_Y - 5} r={4}
              fill={verse.palette.shadow} opacity={safeOpacity(bossOp * 1.5)} />
            {/* Horns */}
            <path d={`M ${BOSS_X - 20},${BOSS_Y - 20} L ${BOSS_X - 28},${BOSS_Y - 35} L ${BOSS_X - 15},${BOSS_Y - 25}`}
              fill={verse.palette.shadow} opacity={safeOpacity(bossOp)} />
            <path d={`M ${BOSS_X + 20},${BOSS_Y - 20} L ${BOSS_X + 28},${BOSS_Y - 35} L ${BOSS_X + 15},${BOSS_Y - 25}`}
              fill={verse.palette.shadow} opacity={safeOpacity(bossOp)} />
          </motion.g>

          {/* Boss health bar */}
          {phase === 'fighting' && (
            <g>
              <rect x={BOSS_X - 30} y={BOSS_Y + 35} width={60} height={5} rx={2.5}
                fill={verse.palette.primary} opacity={safeOpacity(0.05)} />
              <motion.rect
                x={BOSS_X - 30} y={BOSS_Y + 35} height={5} rx={2.5}
                fill={verse.palette.shadow}
                animate={{
                  width: 60 * bossHealth,
                  opacity: safeOpacity(0.15),
                }}
                transition={{ duration: 0.2 }}
              />
            </g>
          )}

          {/* Player */}
          <motion.g
            animate={{
              y: phase === 'fighting' ? -5 : 0,
            }}
          >
            <circle cx={CX} cy={PLAYER_Y} r={8}
              fill={phase === 'victory' ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(phase === 'victory' ? 0.2 : 0.1)} />
            <line x1={CX} y1={PLAYER_Y + 8} x2={CX} y2={PLAYER_Y + 18}
              stroke={verse.palette.primary} strokeWidth={1.5}
              opacity={safeOpacity(0.1)} />

            {/* Sword */}
            {phase !== 'appear' && (
              <motion.line
                x1={CX + 10} y1={PLAYER_Y - 3}
                x2={CX + 18} y2={PLAYER_Y - 12}
                stroke={phase === 'victory' ? verse.palette.accent : verse.palette.text}
                strokeWidth={1.5} strokeLinecap="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: safeOpacity(phase === 'victory' ? 0.3 : 0.2) }}
              />
            )}
          </motion.g>

          {/* Strike lines */}
          {phase === 'fighting' && hits > 0 && (
            <motion.g key={hits}>
              {[0, 1].map(i => (
                <motion.line key={i}
                  x1={CX + 5 + i * 15} y1={BOSS_Y + 20}
                  x2={CX - 5 + i * 15} y2={BOSS_Y + 30}
                  stroke={verse.palette.accent} strokeWidth={1.5}
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </motion.g>
          )}

          {/* Level gate (behind boss) */}
          <rect x={BOSS_X - 20} y={15} width={40} height={5} rx={2}
            fill={phase === 'victory' ? verse.palette.accent : verse.palette.primary}
            opacity={safeOpacity(phase === 'victory' ? 0.2 : 0.04)} />
          <text x={BOSS_X} y={12} textAnchor="middle"
            fill={verse.palette.textFaint} style={{ fontSize: '6px' }} opacity={0.1}>
            next level
          </text>

          {/* Victory */}
          {phase === 'victory' && (
            <motion.text x={CX} y={H - 5} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}>
              the hardest fight is at the threshold
            </motion.text>
          )}
        </svg>
      </div>

      {phase === 'appear' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleReady}>
          draw your sword
        </motion.button>
      )}

      {phase === 'fighting' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleStrike}>
          strike ({hits}/{TARGET})
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'victory' ? 'you stood your ground. the next level awaits.'
          : phase === 'fighting' ? 'strike. it is supposed to be hard.'
            : phase === 'ready' ? 'sword drawn...'
              : 'the boss. it means you are progressing.'}
      </span>

      {phase === 'victory' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          challenge acceptance
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'victory' ? 'courage' : 'if it is terrifying, you are close'}
      </div>
    </div>
  );
}
