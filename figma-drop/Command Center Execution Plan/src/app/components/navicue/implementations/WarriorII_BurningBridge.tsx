/**
 * WARRIOR II #5 -- 1365. The Burning Bridge
 * "Commitment creates courage."
 * INTERACTION: Land on island. Burn your boat. No return. Fight intensity doubles.
 * STEALTH KBE: Commitment -- Death Ground Strategy (B)
 *
 * COMPOSITOR: koan_paradox / Pulse / night / believing / tap / 1365
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

export default function WarriorII_BurningBridge({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Pulse',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1365,
        isSeal: false,
      }}
      arrivalText="You land on the island."
      prompt="Throw your soldiers into positions whence there is no escape, and they will prefer death to flight. Commitment creates courage."
      resonantText="Commitment. You burned the boat and fought harder because retreat was impossible. Death ground strategy: when there is no way back, every step forward becomes inevitable."
      afterglowCoda="No return."
      onComplete={onComplete}
    >
      {(verse) => <BurningBridgeInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function BurningBridgeInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'landed' | 'burning' | 'burned' | 'fight'>('landed');

  const handleBurn = () => {
    if (phase !== 'landed') return;
    setPhase('burning');
    setTimeout(() => {
      setPhase('burned');
      setTimeout(() => {
        setPhase('fight');
        setTimeout(() => verse.advance(), 3000);
      }, 1500);
    }, 1500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 160;

  // Water line
  const WATER_Y = 120;
  // Island (right side)
  const ISLAND_X = 120, ISLAND_W = 90;
  // Boat position (at shore)
  const BOAT_X = ISLAND_X - 15, BOAT_Y = WATER_Y - 8;

  const isBurned = phase === 'burned' || phase === 'fight';

  // Intensity meter
  const intensity = phase === 'fight' ? 0.95
    : isBurned ? 0.7 : phase === 'burning' ? 0.5 : 0.35;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>intensity</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'fight' ? verse.palette.accent : verse.palette.text,
        }}>
          {phase === 'fight' ? 'maximum'
            : isBurned ? 'no retreat possible'
              : phase === 'burning' ? 'rising...'
                : 'standard'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Water */}
          <rect x={0} y={WATER_Y} width={W} height={H - WATER_Y} rx={0}
            fill={verse.palette.primary} opacity={safeOpacity(0.03)} />
          {/* Wave lines */}
          {[0, 1, 2].map(i => (
            <motion.path key={i}
              d={`M 0,${WATER_Y + 5 + i * 8} Q ${W / 4},${WATER_Y + 2 + i * 8} ${W / 2},${WATER_Y + 5 + i * 8} Q ${W * 3 / 4},${WATER_Y + 8 + i * 8} ${W},${WATER_Y + 5 + i * 8}`}
              fill="none" stroke={verse.palette.primary}
              strokeWidth={0.3} opacity={safeOpacity(0.06)}
            />
          ))}

          {/* Island */}
          <path
            d={`M ${ISLAND_X},${WATER_Y} Q ${ISLAND_X + ISLAND_W / 2},${WATER_Y - 20} ${ISLAND_X + ISLAND_W},${WATER_Y}`}
            fill={verse.palette.primary} opacity={safeOpacity(0.06)} />
          <path
            d={`M ${ISLAND_X},${WATER_Y} Q ${ISLAND_X + ISLAND_W / 2},${WATER_Y - 20} ${ISLAND_X + ISLAND_W},${WATER_Y}`}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={0.8} opacity={safeOpacity(0.12)} />

          {/* Boat */}
          {!isBurned && (
            <motion.g
              animate={{
                opacity: phase === 'burning' ? 0.3 : 1,
              }}
            >
              {/* Hull */}
              <path
                d={`M ${BOAT_X - 12},${BOAT_Y} Q ${BOAT_X},${BOAT_Y + 8} ${BOAT_X + 12},${BOAT_Y}`}
                fill={verse.palette.primary} opacity={safeOpacity(0.08)} />
              <path
                d={`M ${BOAT_X - 12},${BOAT_Y} Q ${BOAT_X},${BOAT_Y + 8} ${BOAT_X + 12},${BOAT_Y}`}
                fill="none" stroke={verse.palette.primary}
                strokeWidth={1} opacity={safeOpacity(0.15)} />
              {/* Mast */}
              <line x1={BOAT_X} y1={BOAT_Y} x2={BOAT_X} y2={BOAT_Y - 18}
                stroke={verse.palette.primary} strokeWidth={1}
                opacity={safeOpacity(0.12)} />
            </motion.g>
          )}

          {/* Flames (during burning) */}
          {phase === 'burning' && (
            <g>
              {[0, 1, 2, 3, 4].map(i => (
                <motion.ellipse key={i}
                  cx={BOAT_X - 6 + i * 4}
                  ry={4 + i % 2 * 3}
                  rx={2}
                  fill={verse.palette.accent}
                  animate={{
                    cy: [BOAT_Y - 5, BOAT_Y - 12, BOAT_Y - 5],
                    opacity: [safeOpacity(0.1), safeOpacity(0.2), safeOpacity(0.1)],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.3 + i * 0.05,
                    delay: i * 0.05,
                  }}
                />
              ))}
            </g>
          )}

          {/* Boat ashes (after burned) */}
          {isBurned && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
            >
              {[0, 1, 2].map(i => (
                <circle key={i}
                  cx={BOAT_X - 5 + i * 5}
                  cy={WATER_Y - 2}
                  r={1.5}
                  fill={verse.palette.shadow}
                />
              ))}
            </motion.g>
          )}

          {/* Soldier figure on island */}
          <motion.g
            animate={{
              scale: phase === 'fight' ? 1.15 : 1,
            }}
            style={{ transformOrigin: `${ISLAND_X + ISLAND_W / 2}px ${WATER_Y - 25}px` }}
          >
            <circle cx={ISLAND_X + ISLAND_W / 2} cy={WATER_Y - 35} r={6}
              fill={phase === 'fight' ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(phase === 'fight' ? 0.25 : 0.1)} />
            <line x1={ISLAND_X + ISLAND_W / 2} y1={WATER_Y - 29}
              x2={ISLAND_X + ISLAND_W / 2} y2={WATER_Y - 16}
              stroke={phase === 'fight' ? verse.palette.accent : verse.palette.primary}
              strokeWidth={2}
              opacity={safeOpacity(phase === 'fight' ? 0.3 : 0.12)} />
          </motion.g>

          {/* Intensity bar (bottom) */}
          <rect x={15} y={H - 12} width={W - 30} height={4} rx={2}
            fill={verse.palette.primary} opacity={safeOpacity(0.04)} />
          <motion.rect
            x={15} y={H - 12} height={4} rx={2}
            fill={phase === 'fight' ? verse.palette.accent : verse.palette.primary}
            animate={{
              width: (W - 30) * intensity,
              opacity: safeOpacity(phase === 'fight' ? 0.3 : 0.1),
            }}
            transition={{ duration: 0.5 }}
          />

          {/* No return label */}
          {isBurned && (
            <motion.text
              x={BOAT_X} y={WATER_Y + 20} textAnchor="middle"
              fill={verse.palette.accent} style={{ fontSize: '7px' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
            >
              no return
            </motion.text>
          )}

          {/* Fight indicator */}
          {phase === 'fight' && (
            <motion.text
              x={ISLAND_X + ISLAND_W / 2} y={30} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.3 }}
            >
              death ground. maximum intensity.
            </motion.text>
          )}
        </svg>
      </div>

      {phase === 'landed' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleBurn}>
          burn the boat
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'fight' ? 'no escape. only forward. you fight harder.'
          : isBurned ? 'the boat is ash. no retreat.'
            : phase === 'burning' ? 'the boat burns...'
              : 'you landed. the boat can still take you back.'}
      </span>

      {phase === 'fight' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          death ground strategy
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'fight' ? 'commitment' : 'commitment creates courage'}
      </div>
    </div>
  );
}
