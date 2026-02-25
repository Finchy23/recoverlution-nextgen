/**
 * ANCHOR #2 -- 1292. The Deep Root (Resilience)
 * "Let the surface storm rage. Hold on to the deep earth."
 * INTERACTION: Observe the storm stripping leaves/branches, tap to focus on roots
 * STEALTH KBE: Core Values -- Inner Strength (B)
 *
 * COMPOSITOR: witness_ritual / Arc / night / believing / tap / 1292
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

export default function Anchor_DeepRoot({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Arc',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1292,
        isSeal: false,
      }}
      arrivalText="A tree in a hurricane."
      prompt="What you see is fragile. What you do not see is invincible. Let the surface storm rage. Hold on to the deep earth."
      resonantText="Core values. The leaves tore off and the branches cracked. But the roots held. Inner strength is invisible architecture. The storm tests what the soil protects."
      afterglowCoda="Hold the deep earth."
      onComplete={onComplete}
    >
      {(verse) => <DeepRootInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function DeepRootInteraction({ verse }: { verse: any }) {
  const [focused, setFocused] = useState(false);
  const [done, setDone] = useState(false);
  const [stormTime, setStormTime] = useState(0);

  // Storm timer
  useEffect(() => {
    const interval = setInterval(() => {
      setStormTime(p => p + 1);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const handleFocus = () => {
    if (focused) return;
    setFocused(true);
    setDone(true);
    setTimeout(() => verse.advance(), 3500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 220;
  const CX = W / 2;
  const GROUND_Y = 120;

  // How many leaves/branches remain
  const leavesGone = Math.min(5, Math.floor(stormTime / 3));
  const branchesGone = Math.min(3, Math.floor(stormTime / 5));

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Wind lines */}
          {!done && Array.from({ length: 4 }).map((_, i) => (
            <motion.line key={`wind-${i}`}
              y1={25 + i * 22} y2={25 + i * 22}
              stroke={verse.palette.shadow}
              strokeWidth={0.5}
              animate={{
                x1: [W + 20, -20],
                x2: [W + 50, -50],
                opacity: [0, safeOpacity(0.12), 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                delay: i * 0.3,
                ease: 'linear',
              }}
            />
          ))}

          {/* Ground */}
          <line x1={20} y1={GROUND_Y} x2={W - 20} y2={GROUND_Y}
            stroke={verse.palette.primary} strokeWidth={0.5}
            opacity={safeOpacity(0.15)} />

          {/* ABOVE GROUND -- Tree trunk and branches */}
          <motion.g animate={{
            rotate: done ? 0 : [0, 3, -2, 4, -1, 0],
            opacity: focused ? 0.4 : 1,
          }} transition={{
            rotate: { repeat: Infinity, duration: 1.5 },
            opacity: { duration: 0.8 },
          }} style={{ transformOrigin: `${CX}px ${GROUND_Y}px` }}>
            {/* Trunk */}
            <line x1={CX} y1={GROUND_Y} x2={CX} y2={55}
              stroke={verse.palette.primary} strokeWidth={3}
              opacity={safeOpacity(0.2)} strokeLinecap="round" />

            {/* Branches (break off over time) */}
            {[
              { d: `M ${CX},70 L ${CX + 30},50`, gone: branchesGone >= 1 },
              { d: `M ${CX},85 L ${CX - 25},65`, gone: branchesGone >= 2 },
              { d: `M ${CX},60 L ${CX - 15},40`, gone: branchesGone >= 3 },
            ].map((branch, i) => !branch.gone && (
              <motion.path key={`b-${i}`} d={branch.d}
                fill="none" stroke={verse.palette.primary}
                strokeWidth={1.5} strokeLinecap="round"
                opacity={safeOpacity(0.15)} />
            ))}

            {/* Leaves (blow off over time) */}
            {[
              { cx: CX + 25, cy: 45 }, { cx: CX - 20, cy: 55 },
              { cx: CX + 10, cy: 35 }, { cx: CX - 10, cy: 42 },
              { cx: CX + 5, cy: 50 },
            ].map((leaf, i) => i >= leavesGone && (
              <circle key={`l-${i}`} cx={leaf.cx} cy={leaf.cy} r={4}
                fill={verse.palette.primary} opacity={safeOpacity(0.08)} />
            ))}

            {/* Flying debris */}
            {!done && leavesGone > 0 && Array.from({ length: Math.min(3, leavesGone) }).map((_, i) => (
              <motion.circle key={`fly-${i}`}
                r={2.5}
                fill={verse.palette.shadow}
                animate={{
                  cx: [CX + 20, W + 20],
                  cy: [50 + i * 15, 40 + i * 20],
                  opacity: [safeOpacity(0.1), 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  delay: i * 0.5,
                }}
              />
            ))}
          </motion.g>

          {/* BELOW GROUND -- Roots */}
          <motion.g animate={{
            opacity: focused ? 1 : 0.5,
          }} transition={{ duration: 0.8 }}>
            {/* Root system */}
            {[
              `M ${CX},${GROUND_Y} Q ${CX - 20},${GROUND_Y + 25} ${CX - 45},${GROUND_Y + 40}`,
              `M ${CX},${GROUND_Y} Q ${CX + 15},${GROUND_Y + 30} ${CX + 50},${GROUND_Y + 35}`,
              `M ${CX},${GROUND_Y} Q ${CX - 5},${GROUND_Y + 35} ${CX - 20},${GROUND_Y + 55}`,
              `M ${CX},${GROUND_Y} Q ${CX + 8},${GROUND_Y + 40} ${CX + 30},${GROUND_Y + 60}`,
              `M ${CX},${GROUND_Y} L ${CX},${GROUND_Y + 65}`,
              `M ${CX - 45},${GROUND_Y + 40} Q ${CX - 55},${GROUND_Y + 50} ${CX - 60},${GROUND_Y + 55}`,
              `M ${CX + 50},${GROUND_Y + 35} Q ${CX + 55},${GROUND_Y + 45} ${CX + 55},${GROUND_Y + 55}`,
            ].map((d, i) => (
              <motion.path key={`r-${i}`} d={d}
                fill="none"
                stroke={focused ? verse.palette.accent : verse.palette.primary}
                strokeWidth={i < 5 ? 2 : 1}
                strokeLinecap="round"
                animate={{
                  opacity: safeOpacity(focused ? 0.35 : 0.12),
                }}
                transition={{ duration: 0.5 }}
              />
            ))}

            {/* Root glow */}
            {focused && (
              <motion.ellipse
                cx={CX} cy={GROUND_Y + 40} rx={55} ry={30}
                fill={verse.palette.accent}
                initial={{ opacity: 0 }}
                animate={{ opacity: safeOpacity(0.06) }}
                transition={{ duration: 0.8 }}
              />
            )}
          </motion.g>

          {/* Labels */}
          {!focused && (
            <text x={W - 15} y={50} textAnchor="end"
              fill={verse.palette.shadow} style={navicueType.micro} opacity={0.3}>
              fragile
            </text>
          )}
          <motion.text
            x={CX} y={H - 5} textAnchor="middle"
            fill={focused ? verse.palette.accent : verse.palette.textFaint}
            style={navicueType.micro}
            animate={{ opacity: focused ? 0.6 : 0.25 }}
          >
            {focused ? 'invincible' : 'roots'}
          </motion.text>

          {/* "The tree lives" */}
          {done && (
            <motion.text
              x={CX} y={GROUND_Y - 10} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.choice}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.8 }}
            >
              the tree lives
            </motion.text>
          )}
        </svg>
      </div>

      {!focused && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleFocus}>
          focus on the roots
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'the roots held'
          : `storm raging... ${5 - leavesGone} leaves remain`}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          inner strength
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'core values' : 'hold the deep earth'}
      </div>
    </div>
  );
}
