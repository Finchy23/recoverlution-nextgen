/**
 * EVOLUTIONIST #6 -- 1336. The Extinction Event
 * "The small and agile survive. Pivot."
 * INTERACTION: Meteor incoming. Choose burrow (survive) vs fight (extinction).
 * STEALTH KBE: Pivot -- Adaptability (K)
 *
 * COMPOSITOR: science_x_soul / Arc / night / knowing / tap / 1336
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

export default function Evolutionist_ExtinctionEvent({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Arc',
        chrono: 'night',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1336,
        isSeal: false,
      }}
      arrivalText="The sky darkens."
      prompt="The big are too slow to change. The small and agile survive. When the meteor comes, go underground. Pivot."
      resonantText="Pivot. The meteor hit and the giants fell, but you burrowed and survived. Adaptability is the only durable advantage: size is a liability when the environment changes overnight."
      afterglowCoda="Go underground."
      onComplete={onComplete}
    >
      {(verse) => <ExtinctionEventInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ExtinctionEventInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'incoming' | 'choose' | 'impact' | 'aftermath'>('incoming');

  useEffect(() => {
    if (phase === 'incoming') {
      const t = setTimeout(() => setPhase('choose'), 2500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleBurrow = () => {
    if (phase !== 'choose') return;
    setPhase('impact');
    setTimeout(() => {
      setPhase('aftermath');
      setTimeout(() => verse.advance(), 3000);
    }, 2000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 180;
  const GROUND = H - 30;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>event</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'aftermath' ? verse.palette.accent : verse.palette.shadow,
        }}>
          {phase === 'aftermath' ? 'survived'
            : phase === 'impact' ? 'impact'
              : phase === 'choose' ? 'imminent'
                : 'approaching'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Sky */}
          <rect x={0} y={0} width={W} height={GROUND} rx={6}
            fill={verse.palette.shadow}
            opacity={safeOpacity(phase === 'impact' ? 0.08 : phase === 'incoming' ? 0.02 : 0.04)} />

          {/* Ground */}
          <rect x={0} y={GROUND} width={W} height={H - GROUND} rx={0}
            fill={verse.palette.primary} opacity={safeOpacity(0.05)} />

          {/* Meteor */}
          {(phase === 'incoming' || phase === 'choose') && (
            <motion.g
              animate={{
                x: phase === 'choose' ? 0 : 0,
                y: phase === 'choose' ? 0 : 0,
              }}
            >
              <motion.circle
                fill={verse.palette.shadow}
                animate={{
                  cx: [W - 30, W / 2 + 20],
                  cy: [15, 45],
                  r: [4, phase === 'choose' ? 10 : 6],
                }}
                transition={{ duration: 2.5 }}
                opacity={safeOpacity(0.3)}
              />
              {/* Tail */}
              <motion.line
                stroke={verse.palette.shadow}
                strokeWidth={1.5}
                animate={{
                  x1: [W - 25, W / 2 + 25],
                  y1: [12, 42],
                  x2: [W + 10, W - 20],
                  y2: [5, 20],
                }}
                transition={{ duration: 2.5 }}
                opacity={safeOpacity(0.15)}
              />
            </motion.g>
          )}

          {/* Impact flash */}
          {phase === 'impact' && (
            <motion.circle
              cx={W / 2} cy={GROUND - 20}
              fill={verse.palette.shadow}
              initial={{ r: 10, opacity: 0.4 }}
              animate={{ r: 120, opacity: 0 }}
              transition={{ duration: 1 }}
            />
          )}

          {/* Dinosaurs (big, slow -- they die) */}
          {(phase === 'incoming' || phase === 'choose') && [
            { x: 40, scale: 1 }, { x: 160, scale: 0.8 },
          ].map((dino, i) => (
            <g key={`dino-${i}`} transform={`translate(${dino.x}, ${GROUND - 30 * dino.scale}) scale(${dino.scale})`}>
              {/* Body */}
              <ellipse cx={0} cy={0} rx={18} ry={10}
                fill={verse.palette.primary} opacity={safeOpacity(0.08)} />
              {/* Head */}
              <circle cx={-15} cy={-8} r={6}
                fill={verse.palette.primary} opacity={safeOpacity(0.08)} />
              {/* Tail */}
              <line x1={18} y1={0} x2={30} y2={-5}
                stroke={verse.palette.primary} strokeWidth={3}
                opacity={safeOpacity(0.06)} />
              {/* Legs */}
              <line x1={-8} y1={10} x2={-8} y2={22}
                stroke={verse.palette.primary} strokeWidth={3}
                opacity={safeOpacity(0.06)} />
              <line x1={8} y1={10} x2={8} y2={22}
                stroke={verse.palette.primary} strokeWidth={3}
                opacity={safeOpacity(0.06)} />
            </g>
          ))}

          {/* Dead dinosaurs (after impact) */}
          {(phase === 'impact' || phase === 'aftermath') && [40, 160].map((x, i) => (
            <motion.g key={`dead-${i}`}
              initial={{ opacity: 0.08 }}
              animate={{ opacity: safeOpacity(0.03) }}
              transition={{ delay: 0.5 + i * 0.2 }}
            >
              <line x1={x - 15} y1={GROUND - 3} x2={x + 20} y2={GROUND - 1}
                stroke={verse.palette.shadow} strokeWidth={3}
                strokeLinecap="round" />
            </motion.g>
          ))}

          {/* Mammal (small, burrowing) */}
          <motion.g
            animate={{
              y: (phase === 'impact' || phase === 'aftermath') ? 15 : 0,
            }}
            transition={{ duration: 0.5 }}
          >
            {/* Small mammal body */}
            <ellipse cx={W / 2} cy={GROUND - 8} rx={6} ry={4}
              fill={verse.palette.accent}
              opacity={safeOpacity(phase === 'aftermath' ? 0.3 : 0.15)} />
            {/* Eyes */}
            <circle cx={W / 2 - 3} cy={GROUND - 10} r={1}
              fill={verse.palette.accent}
              opacity={safeOpacity(phase === 'aftermath' ? 0.4 : 0.2)} />

            {/* Burrow hole (appears when burrowing) */}
            {(phase === 'impact' || phase === 'aftermath') && (
              <motion.ellipse
                cx={W / 2} cy={GROUND + 2} rx={10} ry={4}
                fill={verse.palette.primary}
                initial={{ opacity: 0 }}
                animate={{ opacity: safeOpacity(0.1) }}
              />
            )}
          </motion.g>

          {/* Emergence */}
          {phase === 'aftermath' && (
            <motion.g
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              {/* Mammal emerges */}
              <ellipse cx={W / 2} cy={GROUND - 12} rx={8} ry={5}
                fill={verse.palette.accent}
                opacity={safeOpacity(0.25)} />
              <circle cx={W / 2 - 4} cy={GROUND - 15} r={1.5}
                fill={verse.palette.accent}
                opacity={safeOpacity(0.35)} />

              {/* Open sky */}
              <text x={W / 2} y={25} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.micro}
                opacity={0.4}>
                the world is yours
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      {phase === 'choose' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleBurrow}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          burrow (pivot)
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'aftermath' ? 'the giants fell. the agile survived.'
          : phase === 'impact' ? 'impact. underground.'
            : phase === 'choose' ? 'the meteor is here. big or small?'
              : 'something is coming'}
      </span>

      {phase === 'aftermath' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          adaptability
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'aftermath' ? 'pivot' : 'when the meteor comes'}
      </div>
    </div>
  );
}
