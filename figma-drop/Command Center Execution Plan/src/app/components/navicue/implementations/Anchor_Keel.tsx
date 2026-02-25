/**
 * ANCHOR #4 -- 1294. The Keel (Depth)
 * "The invisible work keeps you upright."
 * INTERACTION: Tap to add weight to the keel -- boat stabilizes against wind
 * STEALTH KBE: Character Building -- Depth (K)
 *
 * COMPOSITOR: poetic_precision / Arc / work / knowing / tap / 1294
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

export default function Anchor_Keel({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Arc',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1294,
        isSeal: false,
      }}
      arrivalText="A sailboat. Wind rising."
      prompt="You need a counterweight. If you have big sails, you need a deep keel. The invisible work keeps you upright."
      resonantText="Character building. You added weight below the waterline and the boat held true. Depth is the invisible ballast that makes ambition safe. Big sails need deep keels."
      afterglowCoda="The invisible work."
      onComplete={onComplete}
    >
      {(verse) => <KeelInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function KeelInteraction({ verse }: { verse: any }) {
  const [keelWeight, setKeelWeight] = useState(0);
  const [done, setDone] = useState(false);
  const TARGET = 4;

  const handleAdd = () => {
    if (done) return;
    const next = keelWeight + 1;
    setKeelWeight(next);
    if (next >= TARGET) {
      setDone(true);
      setTimeout(() => verse.advance(), 3200);
    }
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 210;
  const CX = W / 2;
  const WATER_Y = 100;

  // Tilt angle: less tilt with more keel weight
  const tiltDeg = Math.max(0, 18 - keelWeight * 4.5);
  const keelDepth = 25 + keelWeight * 12;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      {/* Stability readout */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>keel</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.text,
        }}>
          {done ? 'stable' : `${keelWeight}/${TARGET}`}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Water */}
          <rect x={0} y={WATER_Y} width={W} height={H - WATER_Y}
            fill={verse.palette.primary} opacity={safeOpacity(0.04)} />
          <line x1={0} y1={WATER_Y} x2={W} y2={WATER_Y}
            stroke={verse.palette.primary} strokeWidth={0.5}
            opacity={safeOpacity(0.12)} />

          {/* Wave texture */}
          <path d={`M 0,${WATER_Y + 5} Q 40,${WATER_Y} 80,${WATER_Y + 5} Q 120,${WATER_Y + 10} 160,${WATER_Y + 5} Q 200,${WATER_Y} ${W},${WATER_Y + 5}`}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={0.3} opacity={safeOpacity(0.08)} />

          {/* Wind arrows */}
          {!done && [0, 1, 2].map(i => (
            <motion.g key={i}
              animate={{
                x: [-20, W + 20],
                opacity: [0, safeOpacity(0.15), 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                delay: i * 0.6,
                ease: 'linear',
              }}
            >
              <line x1={0} y1={50 + i * 18} x2={25} y2={50 + i * 18}
                stroke={verse.palette.shadow} strokeWidth={0.8} />
            </motion.g>
          ))}

          {/* Boat group -- tilts based on keel weight */}
          <motion.g
            animate={{ rotate: tiltDeg }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: `${CX}px ${WATER_Y}px` }}
          >
            {/* Hull */}
            <path d={`M ${CX - 35},${WATER_Y} Q ${CX - 30},${WATER_Y + 15} ${CX},${WATER_Y + 18} Q ${CX + 30},${WATER_Y + 15} ${CX + 35},${WATER_Y}`}
              fill={verse.palette.primary} opacity={safeOpacity(0.08)} />
            <path d={`M ${CX - 35},${WATER_Y} Q ${CX - 30},${WATER_Y + 15} ${CX},${WATER_Y + 18} Q ${CX + 30},${WATER_Y + 15} ${CX + 35},${WATER_Y}`}
              fill="none" stroke={verse.palette.primary}
              strokeWidth={1} opacity={safeOpacity(0.2)} />

            {/* Mast */}
            <line x1={CX} y1={WATER_Y} x2={CX} y2={WATER_Y - 55}
              stroke={verse.palette.primary} strokeWidth={1.5}
              opacity={safeOpacity(0.2)} />

            {/* Sail */}
            <path d={`M ${CX},${WATER_Y - 52} L ${CX + 30},${WATER_Y - 20} L ${CX},${WATER_Y - 5} Z`}
              fill={verse.palette.primary} opacity={safeOpacity(0.06)} />
            <path d={`M ${CX},${WATER_Y - 52} L ${CX + 30},${WATER_Y - 20} L ${CX},${WATER_Y - 5}`}
              fill="none" stroke={verse.palette.primary}
              strokeWidth={0.5} opacity={safeOpacity(0.15)} />

            {/* Keel (below waterline) */}
            <motion.g>
              <motion.line
                x1={CX} y1={WATER_Y + 18}
                x2={CX}
                stroke={done ? verse.palette.accent : verse.palette.primary}
                strokeWidth={3} strokeLinecap="round"
                animate={{
                  y2: WATER_Y + 18 + keelDepth,
                  opacity: safeOpacity(done ? 0.4 : 0.2),
                }}
                transition={{ duration: 0.5 }}
              />

              {/* Keel weight bulb */}
              <motion.ellipse
                cx={CX} ry={5}
                fill={done ? verse.palette.accent : verse.palette.primary}
                animate={{
                  cy: WATER_Y + 18 + keelDepth,
                  rx: 6 + keelWeight * 2,
                  opacity: safeOpacity(done ? 0.25 : 0.12),
                }}
                transition={{ duration: 0.5 }}
              />
            </motion.g>
          </motion.g>

          {/* Labels */}
          <text x={W - 15} y={WATER_Y - 40} textAnchor="end"
            fill={verse.palette.textFaint} style={navicueType.micro} opacity={0.2}>
            sail
          </text>
          <motion.text
            x={CX} y={WATER_Y + 18 + keelDepth + 20}
            textAnchor="middle"
            fill={done ? verse.palette.accent : verse.palette.textFaint}
            style={navicueType.micro}
            animate={{ opacity: done ? 0.5 : 0.25 }}
          >
            {done ? 'righting moment' : 'keel'}
          </motion.text>
        </svg>
      </div>

      {!done && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleAdd}>
          add depth
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'the invisible work held you upright'
          : `tilt: ${tiltDeg.toFixed(0)} degrees`}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          depth
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'character building' : 'big sails need deep keels'}
      </div>
    </div>
  );
}
