/**
 * ANCHOR #10 -- 1300. The Anchor Seal (The Century Proof)
 * "The storm passes. The anchor remains."
 * INTERACTION: Observe -- massive iron anchor descends to seabed, chain rises to surface
 * STEALTH KBE: Inertia / Static Equilibrium -- seal completion
 *
 * COMPOSITOR: science_x_soul / Cosmos / night / knowing / observe / 1300
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

export default function Anchor_AnchorSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Cosmos',
        chrono: 'night',
        kbe: 'k',
        hook: 'observe',
        specimenSeed: 1300,
        isSeal: true,
      }}
      arrivalText="Iron. The seabed."
      prompt="The storm passes. The anchor remains."
      resonantText="Inertia. The resistance of any physical object to any change in its velocity. Your mass is your resistance to the chaos. Your values are the iron. The storm is irrelevant. Specimen 1300. The century proof."
      afterglowCoda="The anchor remains."
      onComplete={onComplete}
    >
      {(verse) => <AnchorSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function AnchorSealInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2000);
    const t2 = setTimeout(() => setPhase(2), 4500);
    const t3 = setTimeout(() => setPhase(3), 7500);
    const t4 = setTimeout(() => setPhase(4), 10500);
    const t5 = setTimeout(() => {
      setPhase(5);
      setTimeout(() => verse.advance(), 3500);
    }, 13500);
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      clearTimeout(t4); clearTimeout(t5);
    };
  }, [verse]);

  const W = 240, H = 280;
  const CX = W / 2;

  // Chain links
  const CHAIN_LINKS = 12;
  const chainStartY = 15;
  const chainEndY = 160;
  const linkSpacing = (chainEndY - chainStartY) / CHAIN_LINKS;

  return (
    <div style={navicueStyles.interactionContainer(12)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Deep water gradient */}
          <defs>
            <linearGradient id="depth-grad-1300" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={verse.palette.primary} stopOpacity="0.02" />
              <stop offset="100%" stopColor={verse.palette.primary} stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={W} height={H} rx={8}
            fill="url(#depth-grad-1300)" />

          {/* Depth pressure lines */}
          {[0, 1, 2, 3].map(i => (
            <line key={i}
              x1={15} y1={50 + i * 55} x2={W - 15} y2={50 + i * 55}
              stroke={verse.palette.primary} strokeWidth={0.3}
              opacity={safeOpacity(0.04)} />
          ))}

          {/* Chain (descends in phase 1+) */}
          {phase >= 1 && Array.from({ length: CHAIN_LINKS }).map((_, i) => {
            const y = chainStartY + i * linkSpacing;
            return (
              <motion.g key={`link-${i}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: safeOpacity(0.2), y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
              >
                <ellipse cx={CX} cy={y + linkSpacing / 2} rx={4} ry={linkSpacing / 2 - 1}
                  fill="none" stroke={verse.palette.primary}
                  strokeWidth={2} opacity={safeOpacity(0.2)} />
              </motion.g>
            );
          })}

          {/* Anchor (descends in phase 2+) */}
          {phase >= 2 && (
            <motion.g
              initial={{ y: -60 }}
              animate={{ y: 0 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Shank (vertical bar) */}
              <line x1={CX} y1={chainEndY} x2={CX} y2={chainEndY + 60}
                stroke={verse.palette.accent} strokeWidth={4}
                opacity={safeOpacity(0.3)} strokeLinecap="round" />

              {/* Crown (bottom ring) */}
              <circle cx={CX} cy={chainEndY + 60} r={6}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={2} opacity={safeOpacity(0.25)} />

              {/* Stock (horizontal bar at top) */}
              <line x1={CX - 30} y1={chainEndY + 8} x2={CX + 30} y2={chainEndY + 8}
                stroke={verse.palette.accent} strokeWidth={3}
                opacity={safeOpacity(0.25)} strokeLinecap="round" />

              {/* Flukes (arms with palms) */}
              <path d={`M ${CX},${chainEndY + 45} Q ${CX - 15},${chainEndY + 50} ${CX - 35},${chainEndY + 35}`}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={3} opacity={safeOpacity(0.3)}
                strokeLinecap="round" />
              <path d={`M ${CX - 35},${chainEndY + 35} L ${CX - 40},${chainEndY + 25}`}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={4} opacity={safeOpacity(0.25)}
                strokeLinecap="round" />

              <path d={`M ${CX},${chainEndY + 45} Q ${CX + 15},${chainEndY + 50} ${CX + 35},${chainEndY + 35}`}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={3} opacity={safeOpacity(0.3)}
                strokeLinecap="round" />
              <path d={`M ${CX + 35},${chainEndY + 35} L ${CX + 40},${chainEndY + 25}`}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={4} opacity={safeOpacity(0.25)}
                strokeLinecap="round" />

              {/* Ring at top */}
              <circle cx={CX} cy={chainEndY} r={5}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={2} opacity={safeOpacity(0.3)} />
            </motion.g>
          )}

          {/* Seabed */}
          {phase >= 3 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <path d={`M 15,${chainEndY + 70} Q 60,${chainEndY + 65} 120,${chainEndY + 72} Q 180,${chainEndY + 68} ${W - 15},${chainEndY + 73}`}
                fill="none" stroke={verse.palette.primary}
                strokeWidth={0.5} opacity={safeOpacity(0.15)} />

              {/* Sediment texture */}
              {Array.from({ length: 8 }).map((_, i) => (
                <circle key={i}
                  cx={30 + i * 28} cy={chainEndY + 73 + Math.sin(i) * 3}
                  r={1} fill={verse.palette.primary}
                  opacity={safeOpacity(0.06)} />
              ))}
            </motion.g>
          )}

          {/* Weight glow (phase 4) */}
          {phase >= 4 && (
            <motion.ellipse
              cx={CX} cy={chainEndY + 40} rx={50} ry={25}
              fill={verse.palette.accent}
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.05) }}
              transition={{ duration: 1.5 }}
            />
          )}

          {/* Taut chain tension line (phase 4+) */}
          {phase >= 4 && (
            <motion.line
              x1={CX} y1={5} x2={CX} y2={chainStartY}
              stroke={verse.palette.accent}
              strokeWidth={1}
              strokeDasharray="3 4"
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.15) }}
            />
          )}

          {/* Seal outer ring */}
          {phase >= 5 && (
            <motion.circle
              cx={CX} cy={chainEndY + 30} r={65}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={0.5}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: safeOpacity(0.12), scale: 1 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            />
          )}

          {/* Phase text */}
          <motion.text
            x={CX} y={H - 10}
            textAnchor="middle"
            fill={phase >= 5 ? verse.palette.accent : verse.palette.textFaint}
            style={navicueType.hint}
            animate={{ opacity: 0.6 }}
          >
            {phase === 0 && 'the deep'}
            {phase === 1 && 'the chain descends'}
            {phase === 2 && 'iron finds the bottom'}
            {phase === 3 && 'the seabed holds'}
            {phase === 4 && 'taut. invisible. certain.'}
            {phase >= 5 && 'the storm passes. the anchor remains.'}
          </motion.text>
        </svg>
      </div>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase >= 5 ? 'inertia / specimen 1300' : 'observe'}
      </div>
    </div>
  );
}
