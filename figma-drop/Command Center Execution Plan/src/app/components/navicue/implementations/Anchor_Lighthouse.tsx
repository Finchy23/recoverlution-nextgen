/**
 * ANCHOR #8 -- 1298. The Lighthouse (Fixed Point)
 * "Be the fixed point. Let the waves crash against the rock."
 * INTERACTION: Tap to identify your fixed point -- the beam sweeps, steady
 * STEALTH KBE: Consistency -- Reliability (K)
 *
 * COMPOSITOR: witness_ritual / Drift / night / knowing / tap / 1298
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

const FIXED_POINTS = [
  { id: 'routine', label: 'routine' },
  { id: 'values', label: 'values' },
  { id: 'practice', label: 'practice' },
];

export default function Anchor_Lighthouse({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Drift',
        chrono: 'night',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1298,
        isSeal: false,
      }}
      arrivalText="Pitch black ocean. Waves crashing."
      prompt="The ocean changes every second. The light does not change. Be the fixed point. Let the waves crash against the rock."
      resonantText="Consistency. You found your fixed point and the beam began to sweep. Reliability is the lighthouse that does not care about the weather. It shines because that is what it does."
      afterglowCoda="Be the fixed point."
      onComplete={onComplete}
    >
      {(verse) => <LighthouseInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function LighthouseInteraction({ verse }: { verse: any }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSelect = (id: string) => {
    if (selected) return;
    setSelected(id);
    setDone(true);
    setTimeout(() => verse.advance(), 4000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 260, H = 200;
  const CX = W / 2;

  // Beam color: warm amber
  const beamColor = '#f5c542';

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Dark ocean background */}
          <rect x={0} y={0} width={W} height={H} rx={8}
            fill={verse.palette.primary} opacity={safeOpacity(0.06)} />

          {/* Waves */}
          {[0, 1, 2].map(i => (
            <motion.path key={i}
              fill="none" stroke={verse.palette.primary}
              strokeWidth={0.5}
              d={`M 0,${140 + i * 15} Q 50,${135 + i * 15} 100,${140 + i * 15} Q 150,${145 + i * 15} 200,${140 + i * 15} Q 250,${135 + i * 15} ${W},${140 + i * 15}`}
              animate={{
                x: [0, 15, 0, -15, 0],
                opacity: safeOpacity(0.08 + i * 0.02),
              }}
              transition={{ repeat: Infinity, duration: 3 + i * 0.5 }}
            />
          ))}

          {/* Lighthouse tower */}
          <path d={`M ${CX - 8},${H - 35} L ${CX - 12},130 L ${CX + 12},130 L ${CX + 8},${H - 35}`}
            fill={verse.palette.primary} opacity={safeOpacity(0.1)} />
          <path d={`M ${CX - 8},${H - 35} L ${CX - 12},130 L ${CX + 12},130 L ${CX + 8},${H - 35}`}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={0.8} opacity={safeOpacity(0.2)} />

          {/* Lantern room */}
          <rect x={CX - 14} y={120} width={28} height={12} rx={2}
            fill={verse.palette.primary} opacity={safeOpacity(0.12)} />

          {/* Light source */}
          <motion.circle
            cx={CX} cy={126} r={5}
            fill={selected ? beamColor : verse.palette.textFaint}
            animate={{
              opacity: selected
                ? [safeOpacity(0.4), safeOpacity(0.6), safeOpacity(0.4)]
                : safeOpacity(0.15),
            }}
            transition={selected ? { repeat: Infinity, duration: 1.5 } : {}}
          />

          {/* Sweeping beam */}
          {selected && (
            <motion.g
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
              style={{ transformOrigin: `${CX}px 126px` }}
            >
              <defs>
                <radialGradient id="beam-grad-1298" cx="0%" cy="50%" r="100%">
                  <stop offset="0%" stopColor={beamColor} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={beamColor} stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Beam cone */}
              <path
                d={`M ${CX},126 L ${CX + 120},106 L ${CX + 120},146 Z`}
                fill="url(#beam-grad-1298)"
              />
              <line x1={CX} y1={126} x2={CX + 120} y2={126}
                stroke={beamColor} strokeWidth={0.5}
                opacity={safeOpacity(0.15)} />
            </motion.g>
          )}

          {/* Light glow halo */}
          {selected && (
            <motion.circle
              cx={CX} cy={126} r={25}
              fill={beamColor}
              animate={{
                opacity: [safeOpacity(0.04), safeOpacity(0.08), safeOpacity(0.04)],
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}

          {/* Rock base */}
          <path d={`M ${CX - 25},${H - 35} Q ${CX - 35},${H - 25} ${CX - 40},${H - 15}
                     Q ${CX},${H - 10} ${CX + 40},${H - 15}
                     Q ${CX + 35},${H - 25} ${CX + 25},${H - 35}`}
            fill={verse.palette.primary} opacity={safeOpacity(0.08)} />

          {/* "I am here" */}
          {done && (
            <motion.text
              x={CX} y={115} textAnchor="middle"
              fill={beamColor} style={navicueType.choice}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1 }}
            >
              i am here
            </motion.text>
          )}

          {/* Selected point label */}
          {selected && (
            <motion.text
              x={CX} y={H - 3} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}
            >
              fixed point: {selected}
            </motion.text>
          )}
        </svg>
      </div>

      {/* Fixed point selection */}
      {!selected && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {FIXED_POINTS.map(fp => (
            <motion.button key={fp.id}
              style={{ ...btn.base, padding: '8px 14px' }}
              whileTap={btn.active}
              onClick={() => handleSelect(fp.id)}
            >
              {fp.label}
            </motion.button>
          ))}
        </div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'the light does not change'
          : 'choose your fixed point'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          reliability
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'consistency' : 'be the fixed point'}
      </div>
    </div>
  );
}
