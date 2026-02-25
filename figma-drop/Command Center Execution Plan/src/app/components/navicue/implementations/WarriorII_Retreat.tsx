/**
 * WARRIOR II #3 -- 1363. The Retreat (Strategic)
 * "Running away is a valid tactic."
 * INTERACTION: Outnumbered. Attack (die). Retreat (live). Draw into trap. Win.
 * STEALTH KBE: Patience -- Strategic Patience (B)
 *
 * COMPOSITOR: witness_ritual / Arc / night / believing / tap / 1363
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

export default function WarriorII_Retreat({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Arc',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1363,
        isSeal: false,
      }}
      arrivalText="Outnumbered. Five to one."
      prompt="Running away is a valid tactic. Draw them into your territory. Stretch their supply line. Strike when they are tired."
      resonantText="Patience. You retreated, drew them in, and struck when they were exhausted. Strategic patience: the retreat is not cowardice. It is the setup for the counterattack."
      afterglowCoda="Draw them in."
      onComplete={onComplete}
    >
      {(verse) => <RetreatInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function RetreatInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'outnumbered' | 'retreating' | 'drawn' | 'trap' | 'win'>('outnumbered');

  const handleRetreat = () => {
    if (phase !== 'outnumbered') return;
    setPhase('retreating');
    setTimeout(() => {
      setPhase('drawn');
      setTimeout(() => {
        setPhase('trap');
        setTimeout(() => {
          setPhase('win');
          setTimeout(() => verse.advance(), 3000);
        }, 1000);
      }, 1500);
    }, 1000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 150;

  // Positions
  const YOU_START = 180, YOU_RETREAT = 220;
  const ENEMIES_START = 60;
  const TRAP_ZONE = { x: 170, w: 50 };
  const CY = H / 2;

  const retreated = phase !== 'outnumbered';
  const enemiesChasing = phase === 'drawn' || phase === 'trap' || phase === 'win';
  const enemyX = enemiesChasing ? TRAP_ZONE.x + 10 : ENEMIES_START;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>status</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'win' ? verse.palette.accent
            : phase === 'trap' ? verse.palette.accent
              : verse.palette.shadow,
        }}>
          {phase === 'win' ? 'victory'
            : phase === 'trap' ? 'sprung'
              : phase === 'drawn' ? 'they follow...'
                : phase === 'retreating' ? 'retreating'
                  : 'outnumbered 5:1'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Trap zone (hidden until sprung) */}
          <motion.rect
            x={TRAP_ZONE.x} y={CY - 30} width={TRAP_ZONE.w} height={60} rx={4}
            fill={verse.palette.accent}
            animate={{
              opacity: safeOpacity(
                phase === 'trap' || phase === 'win' ? 0.08 : 0.02
              ),
            }}
            transition={{ duration: 0.3 }}
          />
          {(phase === 'trap' || phase === 'win') && (
            <motion.rect
              x={TRAP_ZONE.x} y={CY - 30} width={TRAP_ZONE.w} height={60} rx={4}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={1}
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.3) }}
            />
          )}

          {/* Enemy dots (5 of them) */}
          {[0, 1, 2, 3, 4].map(i => {
            const row = Math.floor(i / 3);
            const col = i % 3;
            return (
              <motion.circle key={`e-${i}`}
                cy={CY - 10 + row * 20}
                r={7}
                fill={phase === 'win' ? verse.palette.shadow : verse.palette.shadow}
                animate={{
                  cx: enemyX + col * 18,
                  opacity: safeOpacity(phase === 'win' ? 0.04 : 0.1),
                }}
                transition={{ duration: 0.8, delay: i * 0.05 }}
              />
            );
          })}

          {/* You (single dot, retreating right) */}
          <motion.circle
            cy={CY} r={8}
            fill={phase === 'win' ? verse.palette.accent : verse.palette.primary}
            animate={{
              cx: retreated ? YOU_RETREAT : YOU_START,
              opacity: safeOpacity(phase === 'win' ? 0.25 : 0.12),
            }}
            transition={{ duration: 0.5 }}
          />
          <motion.text
            y={CY + 22} textAnchor="middle"
            fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}
            animate={{ x: retreated ? YOU_RETREAT : YOU_START }}
          >
            you
          </motion.text>

          {/* Supply line stretching */}
          {enemiesChasing && (
            <motion.line
              x1={ENEMIES_START} y1={CY + 30}
              y2={CY + 30}
              stroke={verse.palette.shadow} strokeWidth={0.5}
              strokeDasharray="4 3"
              initial={{ x2: ENEMIES_START, opacity: 0 }}
              animate={{
                x2: enemyX,
                opacity: safeOpacity(phase === 'win' ? 0.05 : 0.12),
              }}
              transition={{ duration: 0.8 }}
            />
          )}
          {enemiesChasing && phase !== 'win' && (
            <text x={(ENEMIES_START + enemyX) / 2} y={CY + 40} textAnchor="middle"
              fill={verse.palette.shadow} style={{ fontSize: '6px' }} opacity={0.15}>
              supply line stretched
            </text>
          )}

          {/* Trap snap lines */}
          {(phase === 'trap' || phase === 'win') && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
            >
              <line x1={TRAP_ZONE.x} y1={CY - 30}
                x2={TRAP_ZONE.x} y2={CY + 30}
                stroke={verse.palette.accent} strokeWidth={1} />
              <line x1={TRAP_ZONE.x + TRAP_ZONE.w} y1={CY - 30}
                x2={TRAP_ZONE.x + TRAP_ZONE.w} y2={CY + 30}
                stroke={verse.palette.accent} strokeWidth={1} />
            </motion.g>
          )}

          {/* Win text */}
          {phase === 'win' && (
            <motion.text
              x={W / 2} y={H - 8} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.3 }}
            >
              struck when they were tired
            </motion.text>
          )}
        </svg>
      </div>

      {phase === 'outnumbered' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleRetreat}>
          retreat
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'win' ? 'the retreat was the setup for the win.'
          : phase === 'trap' ? 'trap sprung. they are exhausted.'
            : phase === 'drawn' ? 'they follow. supply line stretches...'
              : phase === 'retreating' ? 'falling back...'
                : 'five to one. a direct fight is death.'}
      </span>

      {phase === 'win' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          strategic patience
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'win' ? 'patience' : 'running away is a valid tactic'}
      </div>
    </div>
  );
}
