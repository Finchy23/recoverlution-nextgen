/**
 * HISTORIAN #2 -- 1382. The Cycle (The Wheel)
 * "Depression is a winter. It is not the end; it is a season."
 * INTERACTION: Summer -> Fall -> Winter (panic). Wait. -> Spring.
 * STEALTH KBE: Cyclicality -- Impermanence (B)
 *
 * COMPOSITOR: sacred_ordinary / Drift / night / believing / observe / 1382
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

export default function Historian_Cycle({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Drift',
        chrono: 'night',
        kbe: 'b',
        hook: 'observe',
        specimenSeed: 1382,
        isSeal: false,
      }}
      arrivalText="Summer. Everything grows."
      prompt="Depression is a winter. It is not the end of the world; it is a season. Do not cut down the tree in winter. Wait for the thaw."
      resonantText="Cyclicality. You waited through winter and spring returned. Impermanence: every season passes. The cold is not permanent. Neither is the warmth. But the wheel always turns."
      afterglowCoda="Wait for the thaw."
      onComplete={onComplete}
    >
      {(verse) => <CycleInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

const SEASONS = ['summer', 'fall', 'winter', 'spring'] as const;
type Season = typeof SEASONS[number];

function CycleInteraction({ verse }: { verse: any }) {
  const [seasonIdx, setSeasonIdx] = useState(0);
  const [waited, setWaited] = useState(false);
  const [done, setDone] = useState(false);

  const season = SEASONS[seasonIdx];

  useEffect(() => {
    if (done) return;
    if (seasonIdx < 2) {
      const t = setTimeout(() => setSeasonIdx(i => i + 1), 2200);
      return () => clearTimeout(t);
    }
  }, [seasonIdx, done]);

  const handleWait = () => {
    if (season !== 'winter' || waited) return;
    setWaited(true);
    setTimeout(() => {
      setSeasonIdx(3);
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }, 2000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 160;
  const CX = W / 2, CY = H / 2;

  // Wheel
  const R = 50;
  const seasonAngle = (i: number) => (i / 4) * Math.PI * 2 - Math.PI / 2;
  const wheelRotation = seasonIdx * -90;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>season</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent
            : season === 'winter' ? verse.palette.shadow : verse.palette.text,
        }}>
          {done ? 'spring returned'
            : waited ? 'thawing...'
              : season}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Wheel circle */}
          <circle cx={CX} cy={CY} r={R + 5}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={0.5} opacity={safeOpacity(0.08)} />

          {/* Rotating wheel group */}
          <motion.g
            animate={{ rotate: wheelRotation }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          >
            {/* Quadrant lines */}
            {[0, 1, 2, 3].map(i => {
              const a = seasonAngle(i) + Math.PI / 4;
              return (
                <line key={`q-${i}`}
                  x1={CX} y1={CY}
                  x2={CX + Math.cos(a) * R} y2={CY + Math.sin(a) * R}
                  stroke={verse.palette.primary} strokeWidth={0.3}
                  opacity={safeOpacity(0.06)} />
              );
            })}

            {/* Season markers */}
            {SEASONS.map((s, i) => {
              const a = seasonAngle(i);
              const sx = CX + Math.cos(a) * (R - 15);
              const sy = CY + Math.sin(a) * (R - 15);
              const isCurrent = i === seasonIdx;
              const isSpring = s === 'spring' && done;
              return (
                <g key={s}>
                  <circle cx={sx} cy={sy} r={12}
                    fill={isSpring ? verse.palette.accent
                      : isCurrent ? verse.palette.primary : verse.palette.primary}
                    opacity={safeOpacity(
                      isSpring ? 0.12 : isCurrent ? 0.08 : 0.03
                    )} />
                </g>
              );
            })}
          </motion.g>

          {/* Static labels (don't rotate) */}
          {SEASONS.map((s, i) => {
            const a = seasonAngle(i);
            const lx = CX + Math.cos(a) * (R + 18);
            const ly = CY + Math.sin(a) * (R + 18) + 3;
            const isCurrent = i === seasonIdx;
            const isSpring = s === 'spring' && done;
            return (
              <text key={`l-${s}`} x={lx} y={ly} textAnchor="middle"
                fill={isSpring ? verse.palette.accent
                  : isCurrent ? verse.palette.text : verse.palette.textFaint}
                style={{ fontSize: '8px' }}
                opacity={isSpring ? 0.5 : isCurrent ? 0.35 : 0.15}>
                {s}
              </text>
            );
          })}

          {/* Center indicator */}
          <circle cx={CX} cy={CY} r={4}
            fill={done ? verse.palette.accent : verse.palette.primary}
            opacity={safeOpacity(done ? 0.2 : 0.08)} />

          {/* Pointer (top, fixed) */}
          <path d={`M ${CX},${CY - R - 8} L ${CX - 4},${CY - R - 14} L ${CX + 4},${CY - R - 14} Z`}
            fill={done ? verse.palette.accent : verse.palette.primary}
            opacity={safeOpacity(done ? 0.3 : 0.12)} />

          {/* Tree (bottom, shows season effect) */}
          <g>
            {/* Trunk */}
            <line x1={CX} y1={CY + R + 20} x2={CX} y2={CY + R + 35}
              stroke={verse.palette.primary} strokeWidth={2}
              opacity={safeOpacity(0.1)} />
            {/* Canopy */}
            <motion.circle
              cx={CX} cy={CY + R + 16} r={10}
              fill={done ? verse.palette.accent
                : season === 'winter' ? verse.palette.shadow : verse.palette.primary}
              animate={{
                opacity: safeOpacity(
                  done ? 0.15 : season === 'winter' ? 0.03 : season === 'fall' ? 0.05 : 0.08
                ),
                scale: season === 'winter' ? 0.6 : done ? 1.1 : 1,
              }}
              transition={{ duration: 0.5 }}
            />
          </g>

          {/* Result */}
          {done && (
            <motion.text x={CX} y={H - 3} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}>
              the wheel always turns
            </motion.text>
          )}
        </svg>
      </div>

      {season === 'winter' && !waited && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleWait}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          wait
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'spring returned. every season passes.'
          : waited ? 'the thaw begins...'
            : season === 'winter' ? 'it is cold. do not cut down the tree.'
              : season === 'fall' ? 'the leaves fall. it gets colder.'
                : 'summer. everything grows.'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          impermanence
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'cyclicality' : 'it is a season, not the end'}
      </div>
    </div>
  );
}
