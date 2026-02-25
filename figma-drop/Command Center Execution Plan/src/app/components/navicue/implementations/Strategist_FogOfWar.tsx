/**
 * STRATEGIST #4 -- 1304. The Fog of War (Scouting)
 * "Information is more valuable than material."
 * INTERACTION: Tap to send a scout pawn into the dark -- it dies but reveals the map
 * STEALTH KBE: Information Gathering -- Strategic Intelligence (B)
 *
 * COMPOSITOR: sensory_cinema / Circuit / morning / believing / tap / 1304
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

export default function Strategist_FogOfWar({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Circuit',
        chrono: 'morning',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1304,
        isSeal: false,
      }}
      arrivalText="The enemy board is dark."
      prompt="Information is more valuable than material. Spend a pawn to buy the map. If you know their position, you cannot lose."
      resonantText="Information gathering. You spent the pawn and bought the map. Strategic intelligence is the willingness to pay a small price now for total clarity later."
      afterglowCoda="Buy the map."
      onComplete={onComplete}
    >
      {(verse) => <FogOfWarInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FogOfWarInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'dark' | 'scouting' | 'fallen' | 'revealed'>('dark');

  const handleScout = () => {
    if (phase !== 'dark') return;
    setPhase('scouting');
    setTimeout(() => setPhase('fallen'), 1500);
    setTimeout(() => {
      setPhase('revealed');
      setTimeout(() => verse.advance(), 3000);
    }, 2500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 180;
  const DIVIDER = W / 2;

  // Enemy formation (hidden until revealed)
  const enemies = [
    { x: DIVIDER + 35, y: 50, type: 'R', r: 10 },
    { x: DIVIDER + 70, y: 40, type: 'B', r: 8 },
    { x: DIVIDER + 55, y: 80, type: 'N', r: 8 },
    { x: DIVIDER + 85, y: 70, type: 'Q', r: 11 },
    { x: DIVIDER + 65, y: 110, type: 'K', r: 10 },
    { x: DIVIDER + 40, y: 130, type: 'P', r: 6 },
    { x: DIVIDER + 90, y: 120, type: 'P', r: 6 },
  ];

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Intel readout */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>intel</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'revealed' ? verse.palette.accent : verse.palette.text,
        }}>
          {phase === 'dark' ? 'zero' : phase === 'scouting' ? 'scouting...'
            : phase === 'fallen' ? 'pawn lost' : 'complete'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Your side (light) */}
          <rect x={5} y={5} width={DIVIDER - 10} height={H - 10} rx={4}
            fill={verse.palette.primary} opacity={safeOpacity(0.03)} />

          {/* Enemy side (dark/fog) */}
          <motion.rect
            x={DIVIDER + 5} y={5} width={DIVIDER - 10} height={H - 10} rx={4}
            fill={verse.palette.primary}
            animate={{
              opacity: safeOpacity(phase === 'revealed' ? 0.03 : 0.08),
            }}
            transition={{ duration: 0.8 }}
          />

          {/* Divider line */}
          <line x1={DIVIDER} y1={10} x2={DIVIDER} y2={H - 10}
            stroke={verse.palette.primary} strokeWidth={0.5}
            strokeDasharray="4 3" opacity={safeOpacity(0.15)} />

          {/* Your pieces (friendly) */}
          {[
            { x: 40, y: 60, type: 'R' }, { x: 70, y: 90, type: 'N' },
            { x: 50, y: 120, type: 'B' },
          ].map((p, i) => (
            <g key={`f-${i}`}>
              <circle cx={p.x} cy={p.y} r={8}
                fill={verse.palette.accent} opacity={safeOpacity(0.12)} />
              <circle cx={p.x} cy={p.y} r={8}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.5} opacity={safeOpacity(0.3)} />
              <text x={p.x} y={p.y + 3} textAnchor="middle"
                fill={verse.palette.accent} style={{ fontSize: '9px' }} opacity={0.5}>
                {p.type}
              </text>
            </g>
          ))}

          {/* Scout pawn */}
          {(phase === 'dark' || phase === 'scouting') && (
            <motion.g
              animate={{
                x: phase === 'scouting' ? DIVIDER - 30 : 0,
                opacity: phase === 'scouting' ? [1, 1, 0] : 1,
              }}
              transition={{
                x: { duration: 1.2, ease: 'easeIn' },
                opacity: { duration: 1.5, times: [0, 0.8, 1] },
              }}
            >
              <circle cx={90} cy={70} r={6}
                fill={verse.palette.accent} opacity={safeOpacity(0.2)} />
              <circle cx={90} cy={70} r={6}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.5} opacity={safeOpacity(0.4)} />
              <text x={90} y={73} textAnchor="middle"
                fill={verse.palette.accent} style={{ fontSize: '8px' }} opacity={0.5}>
                P
              </text>
            </motion.g>
          )}

          {/* Scout death marker */}
          {(phase === 'fallen' || phase === 'revealed') && (
            <motion.text
              x={DIVIDER + 15} y={73} textAnchor="middle"
              fill={verse.palette.shadow} style={{ fontSize: '9px' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
            >
              x
            </motion.text>
          )}

          {/* Fog overlay (enemy side) */}
          {phase !== 'revealed' && (
            <motion.g>
              {/* Fog particles */}
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.ellipse key={i}
                  cx={DIVIDER + 20 + i * 18} cy={40 + (i % 3) * 45}
                  rx={20} ry={15}
                  fill={verse.palette.primary}
                  animate={{
                    opacity: phase === 'fallen'
                      ? [safeOpacity(0.06), safeOpacity(0.02)]
                      : safeOpacity(0.06),
                    x: [0, 5, 0],
                  }}
                  transition={{
                    opacity: { duration: 0.8 },
                    x: { repeat: Infinity, duration: 3 + i * 0.5 },
                  }}
                />
              ))}
            </motion.g>
          )}

          {/* Enemy pieces (revealed) */}
          {phase === 'revealed' && enemies.map((e, i) => (
            <motion.g key={`e-${i}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
            >
              <circle cx={e.x} cy={e.y} r={e.r}
                fill={verse.palette.shadow} opacity={safeOpacity(0.08)} />
              <circle cx={e.x} cy={e.y} r={e.r}
                fill="none" stroke={verse.palette.shadow}
                strokeWidth={0.5} opacity={safeOpacity(0.25)} />
              <text x={e.x} y={e.y + 3} textAnchor="middle"
                fill={verse.palette.shadow} style={{ fontSize: '9px' }} opacity={0.4}>
                {e.type}
              </text>
            </motion.g>
          ))}

          {/* Labels */}
          <text x={DIVIDER / 2} y={H - 8} textAnchor="middle"
            fill={verse.palette.textFaint} style={navicueType.micro} opacity={0.25}>
            you
          </text>
          <text x={DIVIDER + DIVIDER / 2} y={H - 8} textAnchor="middle"
            fill={phase === 'revealed' ? verse.palette.accent : verse.palette.textFaint}
            style={navicueType.micro} opacity={phase === 'revealed' ? 0.5 : 0.25}>
            {phase === 'revealed' ? 'revealed' : 'unknown'}
          </text>
        </svg>
      </div>

      {phase === 'dark' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleScout}>
          send scout
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'revealed' ? 'worth it. the map is yours.'
          : phase === 'fallen' ? 'the pawn falls... but the fog lifts'
            : phase === 'scouting' ? 'scouting the dark...'
              : 'spend a pawn. buy the map.'}
      </span>

      {phase === 'revealed' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          strategic intelligence
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'revealed' ? 'information gathering' : 'knowledge is power'}
      </div>
    </div>
  );
}
