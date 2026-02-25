/**
 * WARRIOR II #2 -- 1362. The High Ground (Terrain)
 * "Take the high ground before the battle starts."
 * INTERACTION: Move to the hill. Roll a rock downhill. Easy win.
 * STEALTH KBE: Positioning -- Terrain Mastery (K)
 *
 * COMPOSITOR: poetic_precision / Arc / work / knowing / tap / 1362
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

export default function WarriorII_HighGround({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Arc',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1362,
        isSeal: false,
      }}
      arrivalText="A hill. An enemy below."
      prompt="Do not fight on even terms. Fight where gravity helps you. Take the high ground before the battle starts."
      resonantText="Positioning. You took the hill and let gravity do the work. Terrain mastery: the battle is won or lost before the first blow. Position is everything."
      afterglowCoda="Take the high ground."
      onComplete={onComplete}
    >
      {(verse) => <HighGroundInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function HighGroundInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'flat' | 'climbing' | 'top' | 'roll' | 'win'>('flat');

  const handleClimb = () => {
    if (phase !== 'flat') return;
    setPhase('climbing');
    setTimeout(() => setPhase('top'), 1000);
  };

  const handleRoll = () => {
    if (phase !== 'top') return;
    setPhase('roll');
    setTimeout(() => {
      setPhase('win');
      setTimeout(() => verse.advance(), 3000);
    }, 1200);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 160;

  // Hill shape
  const HILL_TOP = { x: 70, y: 40 };
  const HILL_BASE_L = { x: 10, y: 130 };
  const HILL_BASE_R = { x: 200, y: 130 };
  const hillPath = `M ${HILL_BASE_L.x},${HILL_BASE_L.y} Q ${HILL_TOP.x - 10},${HILL_TOP.y + 20} ${HILL_TOP.x},${HILL_TOP.y} Q ${HILL_TOP.x + 40},${HILL_TOP.y + 30} ${HILL_BASE_R.x},${HILL_BASE_R.y}`;

  // Character positions
  const YOU_FLAT = { x: 50, y: 125 };
  const YOU_TOP = { x: HILL_TOP.x, y: HILL_TOP.y - 8 };
  const ENEMY = { x: 185, y: 125 };

  const atTop = phase === 'top' || phase === 'roll' || phase === 'win';

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>terrain</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'win' ? verse.palette.accent
            : atTop ? verse.palette.text : verse.palette.shadow,
        }}>
          {phase === 'win' ? 'dominant'
            : phase === 'roll' ? 'gravity...'
              : atTop ? 'high ground'
                : 'even'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Hill */}
          <path d={hillPath}
            fill={verse.palette.primary} opacity={safeOpacity(0.05)} />
          <path d={hillPath}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={1} opacity={safeOpacity(0.12)} />

          {/* Ground line */}
          <line x1={0} y1={130} x2={W} y2={130}
            stroke={verse.palette.primary} strokeWidth={0.5}
            opacity={safeOpacity(0.08)} />

          {/* You */}
          <motion.g
            animate={{
              x: atTop ? YOU_TOP.x - YOU_FLAT.x : 0,
              y: atTop ? YOU_TOP.y - YOU_FLAT.y : 0,
            }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <circle cx={YOU_FLAT.x} cy={YOU_FLAT.y - 12} r={8}
              fill={atTop ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(atTop ? 0.2 : 0.1)} />
            <line x1={YOU_FLAT.x} y1={YOU_FLAT.y - 4}
              x2={YOU_FLAT.x} y2={YOU_FLAT.y + 8}
              stroke={atTop ? verse.palette.accent : verse.palette.primary}
              strokeWidth={2} opacity={safeOpacity(atTop ? 0.25 : 0.12)} />
            <text x={YOU_FLAT.x} y={YOU_FLAT.y + 20} textAnchor="middle"
              fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}>
              you
            </text>
          </motion.g>

          {/* Enemy */}
          <motion.g
            animate={{
              opacity: phase === 'win' ? 0.3 : 1,
            }}
          >
            <circle cx={ENEMY.x} cy={ENEMY.y - 12} r={8}
              fill={verse.palette.shadow} opacity={safeOpacity(0.08)} />
            <line x1={ENEMY.x} y1={ENEMY.y - 4}
              x2={ENEMY.x} y2={ENEMY.y + 8}
              stroke={verse.palette.shadow} strokeWidth={2}
              opacity={safeOpacity(0.1)} />
            <text x={ENEMY.x} y={ENEMY.y + 20} textAnchor="middle"
              fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}>
              enemy
            </text>
          </motion.g>

          {/* Rolling rock */}
          {(phase === 'roll' || phase === 'win') && (
            <motion.circle
              r={10}
              fill={verse.palette.accent}
              initial={{
                cx: HILL_TOP.x + 5,
                cy: HILL_TOP.y + 10,
                opacity: safeOpacity(0.2),
              }}
              animate={{
                cx: ENEMY.x,
                cy: ENEMY.y - 10,
                opacity: safeOpacity(phase === 'win' ? 0.1 : 0.2),
              }}
              transition={{ duration: 0.8, ease: [0.45, 0, 0.55, 1] }}
            />
          )}

          {/* Gravity arrow */}
          {atTop && phase !== 'win' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
            >
              <line x1={HILL_TOP.x + 20} y1={HILL_TOP.y + 20}
                x2={160} y2={110}
                stroke={verse.palette.accent} strokeWidth={0.5}
                strokeDasharray="4 3" />
              <text x={120} y={80} textAnchor="middle"
                fill={verse.palette.accent} style={{ fontSize: '7px' }}>
                gravity
              </text>
            </motion.g>
          )}

          {/* Win indicator */}
          {phase === 'win' && (
            <motion.text
              x={W / 2} y={H - 5} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.3 }}
            >
              gravity did the work
            </motion.text>
          )}
        </svg>
      </div>

      {phase === 'flat' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleClimb}>
          take the hill
        </motion.button>
      )}

      {phase === 'top' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleRoll}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          roll the rock
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'win' ? 'position won the battle before it started.'
          : phase === 'roll' ? 'gravity carries it down...'
            : atTop ? 'the high ground. gravity is yours.'
              : phase === 'climbing' ? 'climbing...'
                : 'even ground. no advantage.'}
      </span>

      {phase === 'win' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          terrain mastery
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'win' ? 'positioning' : 'fight where gravity helps'}
      </div>
    </div>
  );
}
