/**
 * SCOUT #7 -- 1277. The Compass Bearing
 * "Don't memorize the path. Trust the needle."
 * INTERACTION: Tap a value to magnetize the compass -- needle locks on
 * STEALTH KBE: Values Orientation -- Internal Guidance (K)
 *
 * COMPOSITOR: poetic_precision / Circuit / morning / knowing / tap / 1277
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

const VALUES = [
  { id: 'freedom', label: 'freedom', angle: -30 },
  { id: 'truth', label: 'truth', angle: 15 },
  { id: 'kindness', label: 'kindness', angle: -60 },
];

export default function Scout_CompassBearing({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Circuit',
        chrono: 'morning',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1277,
        isSeal: false,
      }}
      arrivalText="A spinning needle. No direction."
      prompt="The terrain changes. The compass stays true. Do not memorize the path. Trust the needle."
      resonantText="Values orientation. You held the magnet and the needle locked on. Internal guidance is the compass that does not need a map. The terrain will change. The needle will not."
      afterglowCoda="Trust the needle."
      onComplete={onComplete}
    >
      {(verse) => <CompassBearingInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function CompassBearingInteraction({ verse }: { verse: any }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [spinAngle, setSpinAngle] = useState(0);
  const [done, setDone] = useState(false);

  // Needle spins when no value selected
  useEffect(() => {
    if (selected) return;
    const interval = setInterval(() => {
      setSpinAngle(prev => prev + 15 + Math.random() * 20);
    }, 200);
    return () => clearInterval(interval);
  }, [selected]);

  const handleSelect = (id: string) => {
    if (selected) return;
    setSelected(id);
    setDone(true);
    setTimeout(() => verse.advance(), 3200);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 220;
  const CX = W / 2, CY = 105, R = 70;

  const lockedAngle = selected ? VALUES.find(v => v.id === selected)?.angle ?? 0 : 0;
  const needleAngle = selected ? lockedAngle : spinAngle;

  return (
    <div style={navicueStyles.interactionContainer(12)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Compass body */}
          <circle cx={CX} cy={CY} r={R}
            fill={verse.palette.primary} opacity={safeOpacity(0.04)} />
          <circle cx={CX} cy={CY} r={R}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={0.5} opacity={safeOpacity(0.15)} />

          {/* Inner ring */}
          <circle cx={CX} cy={CY} r={R - 10}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={0.3} opacity={safeOpacity(0.08)} />

          {/* Cardinal marks */}
          {[
            { label: 'N', angle: -90 },
            { label: 'E', angle: 0 },
            { label: 'S', angle: 90 },
            { label: 'W', angle: 180 },
          ].map(({ label, angle }) => {
            const rad = angle * Math.PI / 180;
            const x = CX + (R - 18) * Math.cos(rad);
            const y = CY + (R - 18) * Math.sin(rad);
            return (
              <text key={label} x={x} y={y + 4} textAnchor="middle"
                fill={verse.palette.textFaint} style={navicueType.micro}
                opacity={0.25}>
                {label}
              </text>
            );
          })}

          {/* Degree tick marks */}
          {Array.from({ length: 36 }).map((_, i) => {
            const angle = i * 10;
            const rad = angle * Math.PI / 180;
            const isCardinal = i % 9 === 0;
            const r1 = R - (isCardinal ? 6 : 3);
            const r2 = R;
            return (
              <line key={i}
                x1={CX + r1 * Math.cos(rad)} y1={CY + r1 * Math.sin(rad)}
                x2={CX + r2 * Math.cos(rad)} y2={CY + r2 * Math.sin(rad)}
                stroke={verse.palette.primary}
                strokeWidth={isCardinal ? 1 : 0.3}
                opacity={safeOpacity(isCardinal ? 0.2 : 0.08)} />
            );
          })}

          {/* Needle */}
          <motion.g
            animate={{ rotate: needleAngle }}
            transition={selected
              ? { duration: 1, ease: [0.22, 1, 0.36, 1] }
              : { duration: 0.15 }}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          >
            {/* North tip (red/accent) */}
            <motion.path
              d={`M ${CX},${CY - R + 20} L ${CX - 4},${CY} L ${CX + 4},${CY} Z`}
              fill={verse.palette.accent}
              animate={{
                opacity: safeOpacity(selected ? 0.5 : 0.25),
              }}
            />
            {/* South tip */}
            <path
              d={`M ${CX},${CY + R - 20} L ${CX - 3},${CY} L ${CX + 3},${CY} Z`}
              fill={verse.palette.primary}
              opacity={safeOpacity(0.12)} />
          </motion.g>

          {/* Center pin */}
          <circle cx={CX} cy={CY} r={3}
            fill={verse.palette.primary} opacity={safeOpacity(0.15)} />

          {/* Locked value label */}
          {selected && (
            <motion.text
              x={CX} y={CY + R + 20}
              textAnchor="middle"
              fill={verse.palette.accent}
              style={navicueType.choice}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1 }}
            >
              {selected}
            </motion.text>
          )}
        </svg>
      </div>

      {/* Value magnets */}
      {!selected && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {VALUES.map(v => (
            <motion.button key={v.id}
              style={{ ...btn.base, padding: '8px 14px' }}
              whileTap={btn.active}
              onClick={() => handleSelect(v.id)}
            >
              {v.label}
            </motion.button>
          ))}
        </div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'the needle locked on'
          : 'hold a value near the compass'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 1.2 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          internal guidance
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'values orientation' : 'magnetize the needle'}
      </div>
    </div>
  );
}
