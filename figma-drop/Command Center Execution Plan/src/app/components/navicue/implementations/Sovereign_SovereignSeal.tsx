/**
 * SOVEREIGN #10 -- 1380. The Sovereign Seal (The Proof)
 * "Heavy is the head. Strong is the neck."
 * INTERACTION: Observe -- a heavy crown descending, settling on a steady neck.
 * STEALTH KBE: Self-Determination Theory -- seal completion
 *
 * COMPOSITOR: science_x_soul / Cosmos / night / knowing / observe / 1380
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

export default function Sovereign_SovereignSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Cosmos',
        chrono: 'night',
        kbe: 'k',
        hook: 'observe',
        specimenSeed: 1380,
        isSeal: true,
      }}
      arrivalText="A heavy crown."
      prompt="Heavy is the head. Strong is the neck."
      resonantText="Self-determination theory. Autonomy, competence, and relatedness. You are the master of your fate. The crown is heavy because it carries the weight of every decree, every border, every shadow invited to dinner. But the neck is strong. Specimen 1380. The proof."
      afterglowCoda="Strong is the neck."
      onComplete={onComplete}
    >
      {(verse) => <SovereignSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SovereignSealInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1500),
      setTimeout(() => setPhase(2), 4000),
      setTimeout(() => setPhase(3), 7000),
      setTimeout(() => setPhase(4), 10000),
      setTimeout(() => {
        setPhase(5);
        setTimeout(() => verse.advance(), 3500);
      }, 13000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [verse]);

  const W = 260, H = 260;
  const CX = W / 2, CY = H / 2 + 10;

  // Crown geometry (complex, ornate)
  const crownY = phase >= 2 ? CY - 35 : CY - 80;
  const crownPts = (y: number) => {
    const hw = 28;
    return `M ${CX - hw},${y} L ${CX - hw + 5},${y - 20} L ${CX - hw + 12},${y - 8} L ${CX - hw + 18},${y - 25} L ${CX},${y - 12} L ${CX + hw - 18},${y - 25} L ${CX + hw - 12},${y - 8} L ${CX + hw - 5},${y - 20} L ${CX + hw},${y} Z`;
  };

  // SDT pillars
  const pillars = ['autonomy', 'competence', 'relatedness'];

  return (
    <div style={navicueStyles.interactionContainer(12)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Crown (descending) */}
          {phase >= 1 && (
            <motion.g
              animate={{ y: phase >= 2 ? 0 : 0 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.path
                fill={verse.palette.accent}
                animate={{
                  d: crownPts(crownY),
                  opacity: safeOpacity(phase >= 3 ? 0.2 : 0.1),
                }}
                transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.path
                fill="none"
                stroke={verse.palette.accent}
                strokeWidth={1.5}
                animate={{
                  d: crownPts(crownY),
                  opacity: safeOpacity(phase >= 3 ? 0.35 : 0.15),
                }}
                transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Crown band */}
              <motion.rect
                x={CX - 28} width={56} height={6} rx={2}
                fill={verse.palette.accent}
                animate={{
                  y: crownY,
                  opacity: safeOpacity(phase >= 3 ? 0.15 : 0.08),
                }}
                transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Jewels on crown points */}
              {phase >= 3 && [-18, 0, 18].map((dx, i) => (
                <motion.circle key={i}
                  cx={CX + dx * 1.5}
                  r={2}
                  fill={verse.palette.accent}
                  animate={{
                    cy: crownY - 22 + (i === 1 ? -3 : 5),
                    opacity: safeOpacity(0.3),
                  }}
                  initial={{ opacity: 0 }}
                  transition={{ delay: i * 0.2 }}
                />
              ))}
            </motion.g>
          )}

          {/* Head silhouette (appears when crown settles) */}
          {phase >= 2 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <ellipse cx={CX} cy={CY - 10} rx={18} ry={22}
                fill={verse.palette.primary} opacity={safeOpacity(0.06)} />
              {/* Neck */}
              <rect x={CX - 8} y={CY + 12} width={16} height={20} rx={4}
                fill={verse.palette.primary} opacity={safeOpacity(0.06)} />
              {/* Shoulders */}
              <path
                d={`M ${CX - 8},${CY + 30} Q ${CX - 30},${CY + 35} ${CX - 40},${CY + 45}`}
                fill="none" stroke={verse.palette.primary}
                strokeWidth={2} opacity={safeOpacity(0.06)} />
              <path
                d={`M ${CX + 8},${CY + 30} Q ${CX + 30},${CY + 35} ${CX + 40},${CY + 45}`}
                fill="none" stroke={verse.palette.primary}
                strokeWidth={2} opacity={safeOpacity(0.06)} />
            </motion.g>
          )}

          {/* Weight lines (crown is heavy) */}
          {phase >= 3 && phase < 5 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
            >
              {[-15, -5, 5, 15].map((dx, i) => (
                <line key={i}
                  x1={CX + dx} y1={crownY + 8}
                  x2={CX + dx} y2={crownY + 14}
                  stroke={verse.palette.accent}
                  strokeWidth={0.5} />
              ))}
            </motion.g>
          )}

          {/* SDT three pillars */}
          {phase >= 4 && pillars.map((p, i) => {
            const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
            const r = 90;
            const px = CX + Math.cos(angle) * r;
            const py = CY + Math.sin(angle) * r;
            return (
              <motion.g key={p}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.3 }}
              >
                <circle cx={px} cy={py} r={20}
                  fill={verse.palette.accent} opacity={safeOpacity(0.04)} />
                <circle cx={px} cy={py} r={20}
                  fill="none" stroke={verse.palette.accent}
                  strokeWidth={0.5} opacity={safeOpacity(0.12)} />
                <text x={px} y={py + 3} textAnchor="middle"
                  fill={verse.palette.accent} style={{ fontSize: '8px' }}
                  opacity={0.3}>
                  {p}
                </text>
                {/* Line to center */}
                <line x1={px} y1={py}
                  x2={CX} y2={CY}
                  stroke={verse.palette.accent} strokeWidth={0.3}
                  strokeDasharray="4 4" opacity={safeOpacity(0.08)} />
              </motion.g>
            );
          })}

          {/* Seal ring */}
          {phase >= 4 && (
            <motion.circle
              cx={CX} cy={CY} r={110}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={0.5}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: safeOpacity(0.1), scale: 1 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            />
          )}

          {/* Phase text */}
          <motion.text
            x={CX} y={H - 15}
            textAnchor="middle"
            fill={phase >= 5 ? verse.palette.accent : verse.palette.textFaint}
            style={navicueType.hint}
            animate={{ opacity: 0.6 }}
          >
            {phase === 0 && 'a heavy crown'}
            {phase === 1 && 'descending'}
            {phase === 2 && 'it settles on the head'}
            {phase === 3 && 'heavy is the head'}
            {phase === 4 && 'strong is the neck'}
            {phase >= 5 && 'self-determination'}
          </motion.text>
        </svg>
      </div>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase >= 5 ? 'self-governance / specimen 1380' : 'observe'}
      </div>
    </div>
  );
}
