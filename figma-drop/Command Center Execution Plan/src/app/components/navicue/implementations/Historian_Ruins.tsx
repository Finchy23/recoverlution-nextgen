/**
 * HISTORIAN #5 -- 1385. The Ruins (Perspective)
 * "Look on my works, ye Mighty, and despair."
 * INTERACTION: Mighty empire. Time lapse. Sand covers it. Stress drops.
 * STEALTH KBE: Humility -- Cosmic Perspective (B)
 *
 * COMPOSITOR: koan_paradox / Drift / night / believing / observe / 1385
 */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Historian_Ruins({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Drift',
        chrono: 'night',
        kbe: 'b',
        hook: 'observe',
        specimenSeed: 1385,
        isSeal: false,
      }}
      arrivalText="A mighty empire."
      prompt="Look on my works, ye Mighty, and despair. Nothing remains. Your stress is temporary. Your empire is sand. Relax."
      resonantText="Humility. You watched the empire fade into sand and your stress dissolved with it. Cosmic perspective: on a long enough timeline, everything is ruins. This is not tragedy. It is liberation."
      afterglowCoda="Relax."
      onComplete={onComplete}
    >
      {(verse) => <RuinsInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function RuinsInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 2000),
      setTimeout(() => setPhase(2), 4500),
      setTimeout(() => setPhase(3), 7000),
      setTimeout(() => setPhase(4), 9500),
      setTimeout(() => {
        setPhase(5);
        setTimeout(() => verse.advance(), 3000);
      }, 12000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [verse]);

  const W = 240, H = 180;
  const CX = W / 2;

  // Sand level rises
  const sandY = phase >= 4 ? 80 : phase >= 3 ? 110 : phase >= 2 ? 135 : H;

  // Stress meter
  const stress = phase >= 5 ? 0.05 : phase >= 4 ? 0.15 : phase >= 3 ? 0.3 : phase >= 2 ? 0.5 : 0.85;

  return (
    <div style={navicueStyles.interactionContainer(12)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>stress</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase >= 5 ? verse.palette.accent
            : phase >= 3 ? verse.palette.text : verse.palette.shadow,
        }}>
          {phase >= 5 ? 'released'
            : phase >= 4 ? 'dissolving'
              : phase >= 3 ? 'fading...'
                : phase >= 2 ? 'the sands...'
                  : phase >= 1 ? '"I am Ozymandias"'
                    : 'a mighty empire'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Empire structures (columns, palace) */}
          {/* Central palace */}
          <motion.rect
            x={CX - 30} y={60} width={60} height={50} rx={2}
            fill={verse.palette.primary}
            animate={{ opacity: safeOpacity(phase >= 3 ? 0.02 : 0.06) }}
          />
          {/* Pediment */}
          <motion.path
            d={`M ${CX - 35},${60} L ${CX},${42} L ${CX + 35},${60}`}
            fill={verse.palette.primary}
            animate={{ opacity: safeOpacity(phase >= 3 ? 0.02 : 0.05) }}
          />

          {/* Columns */}
          {[-25, -10, 10, 25].map((dx, i) => (
            <motion.rect key={`col-${i}`}
              x={CX + dx - 3} y={60} width={6} height={50} rx={1}
              fill={verse.palette.primary}
              animate={{
                opacity: safeOpacity(phase >= 2 ? 0.03 : 0.08),
                height: phase >= 3 ? 30 : 50,
              }}
              transition={{ duration: 1 }}
            />
          ))}

          {/* Side towers */}
          {[-55, 55].map((dx, i) => (
            <motion.rect key={`tw-${i}`}
              x={CX + dx - 8} y={70} width={16} height={40} rx={2}
              fill={verse.palette.primary}
              animate={{ opacity: safeOpacity(phase >= 2 ? 0.02 : 0.05) }}
            />
          ))}

          {/* Sand rising */}
          <motion.rect
            x={0} width={W} rx={0}
            fill={verse.palette.primary}
            animate={{
              y: sandY,
              height: H - sandY,
              opacity: safeOpacity(phase >= 2 ? 0.05 : 0),
            }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />

          {/* Sand texture dots */}
          {phase >= 2 && Array.from({ length: 10 }).map((_, i) => (
            <motion.circle key={`sand-${i}`}
              cx={20 + i * 22} r={1}
              fill={verse.palette.primary}
              animate={{
                cy: sandY + 5,
                opacity: safeOpacity(0.04),
              }}
              transition={{ duration: 1.5 }}
            />
          ))}

          {/* "I am Ozymandias" plaque */}
          {phase >= 1 && phase < 4 && (
            <motion.g
              animate={{ opacity: phase >= 3 ? 0.1 : 0.4 }}
            >
              <rect x={CX - 45} y={115} width={90} height={16} rx={2}
                fill="none" stroke={verse.palette.primary}
                strokeWidth={0.5} />
              <text x={CX} y={126} textAnchor="middle"
                fill={verse.palette.text} style={{ fontSize: '8px' }}>
                I am Ozymandias
              </text>
            </motion.g>
          )}

          {/* Buried plaque */}
          {phase >= 4 && (
            <motion.text x={CX} y={sandY + 20} textAnchor="middle"
              fill={verse.palette.textFaint} style={{ fontSize: '7px' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.12 }}>
              ...nothing beside remains...
            </motion.text>
          )}

          {/* Stress bar */}
          <rect x={W - 18} y={20} width={6} height={100} rx={3}
            fill={verse.palette.primary} opacity={safeOpacity(0.04)} />
          <motion.rect
            x={W - 18} width={6} rx={3}
            fill={phase >= 5 ? verse.palette.accent : verse.palette.shadow}
            animate={{
              y: 20 + 100 * (1 - stress),
              height: 100 * stress,
              opacity: safeOpacity(phase >= 5 ? 0.1 : 0.12),
            }}
            transition={{ duration: 1 }}
          />
          <text x={W - 15} y={15} textAnchor="middle"
            fill={verse.palette.textFaint} style={{ fontSize: '6px' }} opacity={0.12}>
            stress
          </text>

          {/* Liberation */}
          {phase >= 5 && (
            <motion.text x={CX} y={H - 5} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}>
              everything is temporary. relax.
            </motion.text>
          )}
        </svg>
      </div>

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase >= 5 ? 'on a long enough timeline, everything is ruins. liberation.'
          : phase >= 4 ? 'sand covers it all. the stress dissolves.'
            : phase >= 3 ? 'the columns crumble. nothing remains.'
              : phase >= 2 ? 'the sands of time begin to rise...'
                : phase >= 1 ? '"look on my works, ye mighty..."'
                  : 'a mighty empire. surely it will last.'}
      </span>

      {phase >= 5 && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          cosmic perspective
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase >= 5 ? 'humility' : 'observe'}
      </div>
    </div>
  );
}
