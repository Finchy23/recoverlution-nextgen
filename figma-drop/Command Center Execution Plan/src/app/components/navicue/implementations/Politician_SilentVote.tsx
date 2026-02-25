/**
 * POLITICIAN #5 -- 1355. The Silent Vote
 * "The loudest voices are often the smallest group."
 * INTERACTION: Loud protesters (few, big). Quiet nodders (many, small). Count the nods.
 * STEALTH KBE: Data vs. Noise -- Objectivity (B)
 *
 * COMPOSITOR: science_x_soul / Lattice / work / believing / tap / 1355
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

export default function Politician_SilentVote({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Lattice',
        chrono: 'work',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1355,
        isSeal: false,
      }}
      arrivalText="The room is loud."
      prompt="The loudest voices are often the smallest group. Count the silent heads. Do not be bullied by the noise."
      resonantText="Data vs. noise. You counted the silent nods and found the real majority. Objectivity: perception is distorted by volume. The data never shouts. It whispers. Listen carefully."
      afterglowCoda="Count the silent heads."
      onComplete={onComplete}
    >
      {(verse) => <SilentVoteInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SilentVoteInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'noise' | 'counting' | 'counted' | 'safe'>('noise');
  const [counted, setCounted] = useState(0);
  const SILENT_COUNT = 12;
  const LOUD_COUNT = 3;

  const handleCount = () => {
    if (phase === 'noise') {
      setPhase('counting');
      return;
    }
    if (phase !== 'counting') return;
    const next = counted + 1;
    setCounted(next);
    if (next >= SILENT_COUNT) {
      setPhase('counted');
      setTimeout(() => {
        setPhase('safe');
        setTimeout(() => verse.advance(), 3000);
      }, 1200);
    }
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 150;
  const CX = W / 2;

  // Loud protesters (few, large circles, left side)
  const loud = [
    { x: 35, y: 45, r: 18 }, { x: 75, y: 55, r: 16 }, { x: 55, y: 90, r: 14 },
  ];

  // Silent nodders (many, small circles, spread across right side)
  const silent = Array.from({ length: SILENT_COUNT }).map((_, i) => ({
    x: 120 + (i % 4) * 28,
    y: 30 + Math.floor(i / 4) * 30,
    counted: i < counted,
  }));

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>count</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'safe' ? verse.palette.accent : verse.palette.text,
        }}>
          {phase === 'safe' ? `${SILENT_COUNT} vs ${LOUD_COUNT} (safe)`
            : phase === 'counted' ? `${SILENT_COUNT} silent`
              : phase === 'counting' ? `${counted} / ${SILENT_COUNT}`
                : '?'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Divider */}
          <line x1={100} y1={15} x2={100} y2={H - 15}
            stroke={verse.palette.primary} strokeWidth={0.3}
            strokeDasharray="3 4" opacity={safeOpacity(0.06)} />

          {/* Loud protesters */}
          {loud.map((p, i) => (
            <motion.g key={`loud-${i}`}>
              <motion.circle cx={p.x} cy={p.y} r={p.r}
                fill={verse.palette.shadow}
                animate={{
                  opacity: safeOpacity(phase === 'safe' ? 0.04 : 0.1),
                  r: phase === 'safe' ? p.r * 0.6 : p.r,
                }}
                transition={{ duration: 0.5 }}
              />
              {/* Noise lines */}
              {phase !== 'safe' && (
                <motion.g
                  animate={{ opacity: [safeOpacity(0.08), safeOpacity(0.15), safeOpacity(0.08)] }}
                  transition={{ repeat: Infinity, duration: 0.4 + i * 0.1 }}
                >
                  <line x1={p.x + p.r + 3} y1={p.y - 3}
                    x2={p.x + p.r + 8} y2={p.y - 5}
                    stroke={verse.palette.shadow} strokeWidth={1} />
                  <line x1={p.x + p.r + 3} y1={p.y}
                    x2={p.x + p.r + 10} y2={p.y}
                    stroke={verse.palette.shadow} strokeWidth={1} />
                  <line x1={p.x + p.r + 3} y1={p.y + 3}
                    x2={p.x + p.r + 8} y2={p.y + 5}
                    stroke={verse.palette.shadow} strokeWidth={1} />
                </motion.g>
              )}
            </motion.g>
          ))}

          {/* Label: loud */}
          <text x={55} y={H - 8} textAnchor="middle"
            fill={verse.palette.shadow} style={{ fontSize: '7px' }}
            opacity={phase === 'safe' ? 0.1 : 0.2}>
            loud ({LOUD_COUNT})
          </text>

          {/* Silent nodders */}
          {silent.map((s, i) => (
            <motion.g key={`silent-${i}`}>
              <motion.circle cx={s.x} cy={s.y} r={8}
                fill={s.counted || phase === 'safe' ? verse.palette.accent : verse.palette.primary}
                animate={{
                  opacity: safeOpacity(
                    s.counted || phase === 'safe' ? 0.2 : 0.05
                  ),
                }}
                transition={{ duration: 0.2 }}
              />
              <motion.circle cx={s.x} cy={s.y} r={8}
                fill="none"
                stroke={s.counted || phase === 'safe' ? verse.palette.accent : verse.palette.primary}
                strokeWidth={0.5}
                animate={{
                  opacity: safeOpacity(
                    s.counted || phase === 'safe' ? 0.3 : 0.08
                  ),
                }}
              />
              {/* Check mark when counted */}
              {(s.counted || phase === 'safe') && (
                <motion.path
                  d={`M ${s.x - 3},${s.y} L ${s.x - 1},${s.y + 3} L ${s.x + 4},${s.y - 3}`}
                  fill="none" stroke={verse.palette.accent}
                  strokeWidth={1.5} strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1, opacity: safeOpacity(0.5) }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.g>
          ))}

          {/* Label: silent */}
          <text x={162} y={H - 8} textAnchor="middle"
            fill={phase === 'safe' ? verse.palette.accent : verse.palette.textFaint}
            style={{ fontSize: '7px' }}
            opacity={phase === 'safe' ? 0.4 : 0.2}>
            silent ({phase === 'safe' || phase === 'counted' ? SILENT_COUNT : '?'})
          </text>

          {/* Majority indicator */}
          {phase === 'safe' && (
            <motion.text
              x={CX} y={H - 8} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}
            >
              majority confirmed
            </motion.text>
          )}
        </svg>
      </div>

      {phase === 'noise' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleCount}>
          count the nods
        </motion.button>
      )}

      {phase === 'counting' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleCount}>
          count ({counted}/{SILENT_COUNT})
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'safe' ? 'the silent were the majority. safe.'
          : phase === 'counted' ? 'twelve silent nods. three loud voices.'
            : phase === 'counting' ? 'counting the quiet ones...'
              : 'loud voices. they seem like everyone.'}
      </span>

      {phase === 'safe' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          objectivity
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'safe' ? 'data vs. noise' : 'do not be bullied by the noise'}
      </div>
    </div>
  );
}
