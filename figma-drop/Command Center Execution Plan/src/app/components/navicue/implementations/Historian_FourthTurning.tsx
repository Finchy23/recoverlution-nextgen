/**
 * HISTORIAN #8 -- 1388. The Fourth Turning (Crisis)
 * "Hard times create strong men."
 * INTERACTION: High -> Awakening -> Unraveling -> Crisis. You are in Crisis. Build.
 * STEALTH KBE: Agency -- Generational Responsibility (B)
 *
 * COMPOSITOR: witness_ritual / Arc / night / believing / tap / 1388
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

export default function Historian_FourthTurning({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Arc',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1388,
        isSeal: false,
      }}
      arrivalText="The cycle of generations."
      prompt="Hard times create strong men. We are in the winter of history. It is your job to be strong. The spring depends on you."
      resonantText="Agency. You built during the crisis and the spring depended on you. Generational responsibility: you did not choose the turning. But you chose how you responded. That is enough."
      afterglowCoda="The spring depends on you."
      onComplete={onComplete}
    >
      {(verse) => <FourthTurningInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

const TURNINGS = ['high', 'awakening', 'unraveling', 'crisis'] as const;

function FourthTurningInteraction({ verse }: { verse: any }) {
  const [turningIdx, setTurningIdx] = useState(0);
  const [building, setBuilding] = useState(false);
  const [built, setBuilt] = useState(false);

  useEffect(() => {
    if (turningIdx >= 3 || building) return;
    const t = setTimeout(() => setTurningIdx(i => i + 1), 2000);
    return () => clearTimeout(t);
  }, [turningIdx, building]);

  const handleBuild = () => {
    if (building || turningIdx < 3) return;
    setBuilding(true);
    setTimeout(() => {
      setBuilt(true);
      setTimeout(() => verse.advance(), 3000);
    }, 2000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 155;
  const CX = W / 2;

  // Four quadrants arranged as a sine-like wave
  const SEG_W = (W - 40) / 4;
  const WAVE_Y = 70;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>turning</span>
        <motion.span style={{
          ...navicueType.data,
          color: built ? verse.palette.accent
            : turningIdx >= 3 ? verse.palette.shadow : verse.palette.text,
        }}>
          {built ? 'spring incoming'
            : building ? 'building...'
              : TURNINGS[turningIdx]}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Wave path showing turnings */}
          <path
            d={`M 20,${WAVE_Y} Q ${20 + SEG_W / 2},${WAVE_Y - 30} ${20 + SEG_W},${WAVE_Y} Q ${20 + SEG_W * 1.5},${WAVE_Y + 10} ${20 + SEG_W * 2},${WAVE_Y} Q ${20 + SEG_W * 2.5},${WAVE_Y + 20} ${20 + SEG_W * 3},${WAVE_Y} Q ${20 + SEG_W * 3.5},${WAVE_Y + 35} ${20 + SEG_W * 4},${WAVE_Y}`}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={0.5} opacity={safeOpacity(0.08)} />

          {/* Turning markers */}
          {TURNINGS.map((t, i) => {
            const x = 20 + i * SEG_W + SEG_W / 2;
            const y = i === 0 ? WAVE_Y - 20
              : i === 1 ? WAVE_Y
                : i === 2 ? WAVE_Y + 15
                  : WAVE_Y + 30;
            const isCurrent = i === turningIdx;
            const isPast = i < turningIdx;
            const isCrisis = i === 3;
            return (
              <g key={t}>
                <motion.circle
                  cx={x} cy={y} r={16}
                  fill={built && isCrisis ? verse.palette.accent
                    : isCurrent ? (isCrisis ? verse.palette.shadow : verse.palette.primary)
                      : verse.palette.primary}
                  animate={{
                    opacity: safeOpacity(
                      built && isCrisis ? 0.12
                        : isCurrent ? 0.08 : isPast ? 0.03 : 0.02
                    ),
                  }}
                />
                <motion.circle
                  cx={x} cy={y} r={16}
                  fill="none"
                  stroke={built && isCrisis ? verse.palette.accent
                    : isCurrent ? verse.palette.text : verse.palette.primary}
                  strokeWidth={isCurrent ? 1 : 0.5}
                  animate={{
                    opacity: safeOpacity(
                      built && isCrisis ? 0.3
                        : isCurrent ? 0.2 : isPast ? 0.06 : 0.04
                    ),
                  }}
                />
                <text x={x} y={y + 3} textAnchor="middle"
                  fill={built && isCrisis ? verse.palette.accent
                    : isCurrent ? verse.palette.text : verse.palette.textFaint}
                  style={{ fontSize: '7px' }}
                  opacity={isCurrent || (built && isCrisis) ? 0.4 : 0.15}>
                  {i + 1}
                </text>
                <text x={x} y={y + 28} textAnchor="middle"
                  fill={verse.palette.textFaint} style={{ fontSize: '6px' }} opacity={0.15}>
                  {t}
                </text>
              </g>
            );
          })}

          {/* Progress arrow */}
          <motion.line
            x1={20} y1={WAVE_Y + 50}
            y2={WAVE_Y + 50}
            stroke={turningIdx >= 3 ? verse.palette.shadow : verse.palette.primary}
            strokeWidth={1}
            animate={{
              x2: 20 + (turningIdx + 1) * SEG_W,
              opacity: safeOpacity(0.1),
            }}
            transition={{ duration: 0.5 }}
          />

          {/* Building indicator */}
          {(building || built) && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Foundation blocks */}
              {[0, 1, 2].map(i => (
                <motion.rect key={i}
                  x={CX - 15 + i * 12} y={H - 30}
                  width={10} height={10} rx={1}
                  fill={built ? verse.palette.accent : verse.palette.primary}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: safeOpacity(built ? 0.2 : 0.1),
                    y: 0,
                  }}
                  transition={{ delay: i * 0.3 }}
                />
              ))}
              {built && [0, 1].map(i => (
                <motion.rect key={`r2-${i}`}
                  x={CX - 9 + i * 12} y={H - 40}
                  width={10} height={10} rx={1}
                  fill={verse.palette.accent}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: safeOpacity(0.15), y: 0 }}
                  transition={{ delay: 0.8 + i * 0.2 }}
                />
              ))}
            </motion.g>
          )}

          {/* Result */}
          {built && (
            <motion.text x={CX} y={H - 3} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}>
              you built during winter. spring depends on you.
            </motion.text>
          )}
        </svg>
      </div>

      {turningIdx >= 3 && !building && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleBuild}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          build
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {built ? 'hard times create strong men. you chose strength.'
          : building ? 'building during the crisis...'
            : turningIdx >= 3 ? 'the fourth turning. crisis. your move.'
              : turningIdx >= 2 ? 'unraveling. the fabric tears.'
                : turningIdx >= 1 ? 'awakening. cracks appear.'
                  : 'the high. prosperity. stability.'}
      </span>

      {built && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          generational responsibility
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {built ? 'agency' : 'be strong. the spring depends on it.'}
      </div>
    </div>
  );
}
