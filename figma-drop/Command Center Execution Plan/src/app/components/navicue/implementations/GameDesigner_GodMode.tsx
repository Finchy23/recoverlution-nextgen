/**
 * GAME DESIGNER #9 -- 1399. The God Mode (Lucid Dreaming)
 * "Lucidity is realizing you are the dreamer."
 * INTERACTION: Trapped in nightmare. Realize "I am dreaming." Monster -> puppy.
 * STEALTH KBE: Agency -- Lucidity (B)
 *
 * COMPOSITOR: koan_paradox / Drift / night / believing / tap / 1399
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

export default function GameDesigner_GodMode({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Drift',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1399,
        isSeal: false,
      }}
      arrivalText="A nightmare. You are trapped."
      prompt="Lucidity is realizing you are the dreamer. The nightmare has no power over the creator. Wake up within the dream."
      resonantText="Agency. You realized you were dreaming and the monster transformed. Lucidity: the nightmare was always yours to control. The moment you know you are the dreamer, the dream obeys."
      afterglowCoda="Wake up within the dream."
      onComplete={onComplete}
    >
      {(verse) => <GodModeInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function GodModeInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'nightmare' | 'realizing' | 'lucid' | 'transformed'>('nightmare');

  const handleRealize = () => {
    if (phase !== 'nightmare') return;
    setPhase('realizing');
    setTimeout(() => {
      setPhase('lucid');
      setTimeout(() => {
        setPhase('transformed');
        setTimeout(() => verse.advance(), 3000);
      }, 1500);
    }, 1000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 160;
  const CX = W / 2, CY = H / 2;

  const lucid = phase === 'lucid' || phase === 'transformed';

  // Monster / puppy position
  const MON_X = CX, MON_Y = CY - 10;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>awareness</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'transformed' ? verse.palette.accent
            : lucid ? verse.palette.text
              : verse.palette.shadow,
        }}>
          {phase === 'transformed' ? 'god mode'
            : lucid ? 'lucid'
              : phase === 'realizing' ? '"I am dreaming..."'
                : 'asleep'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Dream fog */}
          <motion.rect
            x={0} y={0} width={W} height={H}
            fill={verse.palette.primary}
            animate={{
              opacity: safeOpacity(lucid ? 0 : 0.04),
            }}
            transition={{ duration: 1 }}
          />

          {/* Dream border (wavy) */}
          <motion.rect
            x={15} y={15} width={W - 30} height={H - 30} rx={8}
            fill="none"
            stroke={lucid ? verse.palette.accent : verse.palette.shadow}
            strokeWidth={0.5}
            strokeDasharray="6 4"
            animate={{
              opacity: safeOpacity(lucid ? 0.15 : 0.06),
            }}
          />

          {/* Monster (nightmare) -- transforms to puppy */}
          {!lucid ? (
            // Monster
            <motion.g
              animate={{
                scale: phase === 'realizing' ? [1, 0.9, 1] : 1,
              }}
              transition={{ duration: 0.3, repeat: phase === 'realizing' ? 3 : 0 }}
              style={{ transformOrigin: `${MON_X}px ${MON_Y}px` }}
            >
              <ellipse cx={MON_X} cy={MON_Y} rx={28} ry={22}
                fill={verse.palette.shadow} opacity={safeOpacity(0.08)} />
              {/* Eyes (glowing) */}
              <motion.circle cx={MON_X - 8} cy={MON_Y - 3} r={3}
                fill={verse.palette.shadow}
                animate={{ opacity: [safeOpacity(0.1), safeOpacity(0.2), safeOpacity(0.1)] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
              <motion.circle cx={MON_X + 8} cy={MON_Y - 3} r={3}
                fill={verse.palette.shadow}
                animate={{ opacity: [safeOpacity(0.1), safeOpacity(0.2), safeOpacity(0.1)] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
              />
              {/* Teeth */}
              <path d={`M ${MON_X - 12},${MON_Y + 8} L ${MON_X - 8},${MON_Y + 14} L ${MON_X - 4},${MON_Y + 8} L ${MON_X},${MON_Y + 14} L ${MON_X + 4},${MON_Y + 8} L ${MON_X + 8},${MON_Y + 14} L ${MON_X + 12},${MON_Y + 8}`}
                fill="none" stroke={verse.palette.shadow} strokeWidth={0.8}
                opacity={safeOpacity(0.1)} />
              <text x={MON_X} y={MON_Y + 35} textAnchor="middle"
                fill={verse.palette.shadow} style={{ fontSize: '8px' }} opacity={0.2}>
                fear
              </text>
            </motion.g>
          ) : (
            // Puppy
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              style={{ transformOrigin: `${MON_X}px ${MON_Y}px` }}
            >
              {/* Body */}
              <ellipse cx={MON_X} cy={MON_Y + 5} rx={16} ry={12}
                fill={verse.palette.accent} opacity={safeOpacity(0.1)} />
              {/* Head */}
              <circle cx={MON_X} cy={MON_Y - 8} r={10}
                fill={verse.palette.accent} opacity={safeOpacity(0.12)} />
              {/* Ears */}
              <ellipse cx={MON_X - 8} cy={MON_Y - 14} rx={4} ry={6}
                fill={verse.palette.accent} opacity={safeOpacity(0.08)} />
              <ellipse cx={MON_X + 8} cy={MON_Y - 14} rx={4} ry={6}
                fill={verse.palette.accent} opacity={safeOpacity(0.08)} />
              {/* Eyes (friendly) */}
              <circle cx={MON_X - 3} cy={MON_Y - 9} r={1.5}
                fill={verse.palette.accent} opacity={safeOpacity(0.25)} />
              <circle cx={MON_X + 3} cy={MON_Y - 9} r={1.5}
                fill={verse.palette.accent} opacity={safeOpacity(0.25)} />
              {/* Tail */}
              <motion.path
                d={`M ${MON_X + 14},${MON_Y + 5} Q ${MON_X + 22},${MON_Y - 5} ${MON_X + 18},${MON_Y - 10}`}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={2} strokeLinecap="round"
                animate={{ d: [
                  `M ${MON_X + 14},${MON_Y + 5} Q ${MON_X + 22},${MON_Y - 5} ${MON_X + 18},${MON_Y - 10}`,
                  `M ${MON_X + 14},${MON_Y + 5} Q ${MON_X + 25},${MON_Y} ${MON_X + 20},${MON_Y - 8}`,
                ] }}
                transition={{ repeat: Infinity, duration: 0.4, repeatType: 'reverse' }}
                opacity={safeOpacity(0.2)}
              />
              <text x={MON_X} y={MON_Y + 30} textAnchor="middle"
                fill={verse.palette.accent} style={{ fontSize: '8px' }} opacity={0.3}>
                friend
              </text>
            </motion.g>
          )}

          {/* "I am dreaming" text */}
          {phase === 'realizing' && (
            <motion.text x={CX} y={H - 30} textAnchor="middle"
              fill={verse.palette.text} style={{ fontSize: '11px' }}
              animate={{ opacity: [0.1, 0.35, 0.1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}>
              "I am dreaming."
            </motion.text>
          )}

          {/* God mode indicator */}
          {phase === 'transformed' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <text x={CX} y={H - 25} textAnchor="middle"
                fill={verse.palette.accent} style={{ fontSize: '8px', fontFamily: 'monospace' }}
                opacity={0.3}>
                creator_mode = true
              </text>
              <text x={CX} y={H - 8} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.micro}
                opacity={0.5}>
                the dream obeys the dreamer
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      {phase === 'nightmare' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleRealize}>
          "I am dreaming."
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'transformed' ? 'the nightmare had no power over the creator.'
          : lucid ? 'lucid. the monster transforms...'
            : phase === 'realizing' ? 'waking up within the dream...'
              : 'trapped in a nightmare. a monster. unless...'}
      </span>

      {phase === 'transformed' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          lucidity
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'transformed' ? 'agency' : 'wake up within the dream'}
      </div>
    </div>
  );
}
