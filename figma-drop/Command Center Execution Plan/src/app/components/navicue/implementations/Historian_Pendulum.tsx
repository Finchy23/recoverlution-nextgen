/**
 * HISTORIAN #6 -- 1386. The Pendulum (Politics)
 * "Do not attach to the swing. Stand in the stillness."
 * INTERACTION: Pendulum swings Left, Right. Stand in center. Don't get hit.
 * STEALTH KBE: Centering -- Non-Attachment (E)
 *
 * COMPOSITOR: sacred_ordinary / Pulse / work / embodying / tap / 1386
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

export default function Historian_Pendulum({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Pulse',
        chrono: 'work',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1386,
        isSeal: false,
      }}
      arrivalText="The pendulum swings."
      prompt="History swings. Extremes beget extremes. Do not attach to the swing. Watch the arc. Stand in the stillness."
      resonantText="Centering. You stood in the center and watched the pendulum pass. Non-attachment: the extremes destroy each other. The center endures. It is not indifference. It is stability."
      afterglowCoda="Stand in the stillness."
      onComplete={onComplete}
    >
      {(verse) => <PendulumInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function PendulumInteraction({ verse }: { verse: any }) {
  const [positioned, setPositioned] = useState(false);
  const [swings, setSwings] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!positioned || done) return;
    const iv = setInterval(() => {
      setSwings(s => {
        const next = s + 1;
        if (next >= 6) {
          setDone(true);
          setTimeout(() => verse.advance(), 3000);
          clearInterval(iv);
        }
        return next;
      });
    }, 900);
    return () => clearInterval(iv);
  }, [positioned, done, verse]);

  const handleCenter = () => {
    if (positioned) return;
    setPositioned(true);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 230, H = 160;
  const CX = W / 2, CY = 15;

  // Pendulum
  const PIVOT = { x: CX, y: CY };
  const STRING_L = 85;
  const MAX_ANGLE = 45;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>position</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent
            : positioned ? verse.palette.text : verse.palette.shadow,
        }}>
          {done ? 'centered (safe)'
            : positioned ? `watching... ${swings}/6`
              : 'choose your position'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Pivot */}
          <circle cx={PIVOT.x} cy={PIVOT.y} r={3}
            fill={verse.palette.primary} opacity={safeOpacity(0.1)} />

          {/* Pendulum string and bob */}
          <motion.g
            animate={{
              rotate: positioned
                ? [MAX_ANGLE, -MAX_ANGLE, MAX_ANGLE]
                : [MAX_ANGLE * 0.5, -MAX_ANGLE * 0.5, MAX_ANGLE * 0.5],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.8,
              ease: 'easeInOut',
            }}
            style={{ transformOrigin: `${PIVOT.x}px ${PIVOT.y}px` }}
          >
            {/* String */}
            <line x1={PIVOT.x} y1={PIVOT.y} x2={PIVOT.x} y2={PIVOT.y + STRING_L}
              stroke={verse.palette.primary} strokeWidth={1}
              opacity={safeOpacity(0.12)} />
            {/* Bob */}
            <circle cx={PIVOT.x} cy={PIVOT.y + STRING_L} r={12}
              fill={verse.palette.shadow} opacity={safeOpacity(0.1)} />
            <circle cx={PIVOT.x} cy={PIVOT.y + STRING_L} r={12}
              fill="none" stroke={verse.palette.shadow}
              strokeWidth={1} opacity={safeOpacity(0.15)} />
          </motion.g>

          {/* Arc path */}
          <path
            d={`M ${PIVOT.x - 70},${PIVOT.y + STRING_L + 5} Q ${PIVOT.x},${PIVOT.y + STRING_L + 25} ${PIVOT.x + 70},${PIVOT.y + STRING_L + 5}`}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={0.3} strokeDasharray="4 4"
            opacity={safeOpacity(0.06)} />

          {/* Labels: left, center, right */}
          <text x={30} y={PIVOT.y + STRING_L + 18} textAnchor="middle"
            fill={verse.palette.textFaint} style={{ fontSize: '8px' }} opacity={0.18}>
            left
          </text>
          <text x={W - 30} y={PIVOT.y + STRING_L + 18} textAnchor="middle"
            fill={verse.palette.textFaint} style={{ fontSize: '8px' }} opacity={0.18}>
            right
          </text>

          {/* Center zone */}
          <rect x={CX - 12} y={PIVOT.y + STRING_L + 15} width={24} height={20} rx={3}
            fill={positioned ? verse.palette.accent : verse.palette.primary}
            opacity={safeOpacity(positioned ? 0.08 : 0.03)} />
          <rect x={CX - 12} y={PIVOT.y + STRING_L + 15} width={24} height={20} rx={3}
            fill="none"
            stroke={positioned ? verse.palette.accent : verse.palette.primary}
            strokeWidth={positioned ? 1 : 0.5}
            opacity={safeOpacity(positioned ? 0.25 : 0.1)} />

          {/* You (in center or not yet placed) */}
          {positioned && (
            <motion.circle
              cx={CX} cy={PIVOT.y + STRING_L + 25} r={5}
              fill={done ? verse.palette.accent : verse.palette.primary}
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(done ? 0.3 : 0.15) }}
            />
          )}

          <text x={CX} y={PIVOT.y + STRING_L + 45} textAnchor="middle"
            fill={positioned ? verse.palette.accent : verse.palette.textFaint}
            style={{ fontSize: '7px' }}
            opacity={positioned ? 0.4 : 0.15}>
            center
          </text>

          {/* Done */}
          {done && (
            <motion.text x={CX} y={H - 5} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}>
              the extremes pass. the center endures.
            </motion.text>
          )}
        </svg>
      </div>

      {!positioned && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleCenter}>
          stand in the center
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'the pendulum passed on both sides. you are still.'
          : positioned ? 'the pendulum swings past you. left. right. left.'
            : 'it swings left. it swings right. where do you stand?'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          non-attachment
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'centering' : 'watch the arc'}
      </div>
    </div>
  );
}
