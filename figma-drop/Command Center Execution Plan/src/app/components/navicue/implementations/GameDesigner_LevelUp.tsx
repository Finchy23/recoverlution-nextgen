/**
 * GAME DESIGNER #5 -- 1395. The Level Up (Grind)
 * "The grind is boring until you see the XP bar."
 * INTERACTION: Chopping wood. Boring. Track XP. Level up.
 * STEALTH KBE: Gamification -- Progress Tracking (B)
 *
 * COMPOSITOR: sacred_ordinary / Circuit / morning / believing / tap / 1395
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

export default function GameDesigner_LevelUp({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Circuit',
        chrono: 'morning',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1395,
        isSeal: false,
      }}
      arrivalText="Chopping wood. Boring."
      prompt="The grind is boring until you see the XP bar. Track the points. The level up makes it worth it."
      resonantText="Gamification. You tracked the XP and the boredom vanished. Progress tracking: the work did not change. Your perception of it did. The bar made the invisible visible."
      afterglowCoda="Track the points."
      onComplete={onComplete}
    >
      {(verse) => <LevelUpInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function LevelUpInteraction({ verse }: { verse: any }) {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [tracking, setTracking] = useState(false);
  const [done, setDone] = useState(false);
  const XP_PER_LEVEL = 40;
  const TARGET_LEVEL = 3;

  const handleChop = () => {
    if (done) return;
    const gain = 8 + Math.floor(Math.random() * 5);
    const newXp = xp + gain;
    if (newXp >= XP_PER_LEVEL) {
      const newLevel = level + 1;
      setXp(newXp - XP_PER_LEVEL);
      setLevel(newLevel);
      if (newLevel >= TARGET_LEVEL) {
        setDone(true);
        setTimeout(() => verse.advance(), 3000);
      }
    } else {
      setXp(newXp);
    }
    if (!tracking) setTracking(true);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 145;
  const CX = W / 2;

  const xpRatio = xp / XP_PER_LEVEL;
  const BAR_X = 30, BAR_W = W - 60, BAR_Y = 95;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>level</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.text,
          fontFamily: 'monospace',
        }}>
          {done ? `LVL ${level}` : tracking ? `LVL ${level}` : '?'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Chopping area */}
          <rect x={CX - 50} y={20} width={100} height={55} rx={4}
            fill={verse.palette.primary} opacity={safeOpacity(0.03)} />

          {/* Log */}
          <rect x={CX - 12} y={45} width={24} height={14} rx={3}
            fill={verse.palette.primary} opacity={safeOpacity(0.08)} />
          <ellipse cx={CX - 12} cy={52} rx={3} ry={7}
            fill={verse.palette.primary} opacity={safeOpacity(0.04)} />

          {/* Axe (simple) */}
          <line x1={CX + 15} y1={30} x2={CX + 5} y2={50}
            stroke={verse.palette.primary} strokeWidth={1.5}
            opacity={safeOpacity(0.1)} />
          <path d={`M ${CX + 3},${48} L ${CX + 9},${44} L ${CX + 7},${52} Z`}
            fill={verse.palette.primary} opacity={safeOpacity(0.08)} />

          {/* XP floating numbers */}
          {tracking && xp > 0 && (
            <motion.text
              x={CX + 25} y={38}
              fill={verse.palette.accent}
              style={{ fontSize: '9px', fontFamily: 'monospace' }}
              key={xp}
              initial={{ opacity: 0.5, y: 0 }}
              animate={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.8 }}
            >
              +XP
            </motion.text>
          )}

          {/* Boredom indicator (before tracking) */}
          {!tracking && (
            <motion.text x={CX} y={80} textAnchor="middle"
              fill={verse.palette.shadow} style={{ fontSize: '8px' }}
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ repeat: Infinity, duration: 2 }}>
              boring...
            </motion.text>
          )}

          {/* XP Bar */}
          {tracking && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <rect x={BAR_X} y={BAR_Y} width={BAR_W} height={10} rx={5}
                fill={verse.palette.primary} opacity={safeOpacity(0.05)} />
              <motion.rect
                x={BAR_X} y={BAR_Y} height={10} rx={5}
                fill={done ? verse.palette.accent : verse.palette.accent}
                animate={{
                  width: BAR_W * (done ? 1 : xpRatio),
                  opacity: safeOpacity(done ? 0.25 : 0.15),
                }}
                transition={{ duration: 0.2 }}
              />
              <text x={BAR_X} y={BAR_Y + 22}
                fill={verse.palette.textFaint} style={{ fontSize: '7px', fontFamily: 'monospace' }}
                opacity={0.2}>
                {xp}/{XP_PER_LEVEL} XP
              </text>
              <text x={BAR_X + BAR_W} y={BAR_Y + 22} textAnchor="end"
                fill={verse.palette.textFaint} style={{ fontSize: '7px', fontFamily: 'monospace' }}
                opacity={0.2}>
                LVL {level}/{TARGET_LEVEL}
              </text>
            </motion.g>
          )}

          {/* Level up flash */}
          {done && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <text x={CX} y={H - 5} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.micro}
                opacity={0.5}>
                the bar made the invisible visible
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      {!done && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleChop}>
          chop
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'the work did not change. your perception of it did.'
          : tracking ? `chopping. XP ${xp}/${XP_PER_LEVEL}. level ${level}.`
            : 'chopping wood. tedious. pointless.'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          progress tracking
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'gamification' : 'see the xp bar'}
      </div>
    </div>
  );
}
