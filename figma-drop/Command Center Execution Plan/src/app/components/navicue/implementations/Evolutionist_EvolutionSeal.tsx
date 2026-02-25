/**
 * EVOLUTIONIST #10 -- 1340. The Evolution Seal (The Proof)
 * "Change or die."
 * INTERACTION: Observe -- The Tree of Life grows from a single root
 * STEALTH KBE: Natural Selection -- seal completion
 *
 * COMPOSITOR: science_x_soul / Cosmos / night / knowing / observe / 1340
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

export default function Evolutionist_EvolutionSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Cosmos',
        chrono: 'night',
        kbe: 'k',
        hook: 'observe',
        specimenSeed: 1340,
        isSeal: true,
      }}
      arrivalText="A single root."
      prompt="Change or die."
      resonantText="Natural selection. Differential survival and reproduction of individuals due to differences in phenotype. It is the only known mechanism for creating complex design. All branches connect back to a single root. The Tree of Life. Specimen 1340. The proof."
      afterglowCoda="Change or die."
      onComplete={onComplete}
    >
      {(verse) => <EvolutionSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function EvolutionSealInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 2000),
      setTimeout(() => setPhase(2), 4500),
      setTimeout(() => setPhase(3), 7500),
      setTimeout(() => setPhase(4), 10500),
      setTimeout(() => {
        setPhase(5);
        setTimeout(() => verse.advance(), 3500);
      }, 13500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [verse]);

  const W = 260, H = 280;
  const CX = W / 2;
  const ROOT_Y = H - 25;
  const TOP_Y = 25;

  // Tree structure -- trunk splits into branches which split further
  // Level 0: root
  // Level 1: 2 branches
  // Level 2: 4 branches
  // Level 3: 8 branches (tips)
  const trunk = { x1: CX, y1: ROOT_Y, x2: CX, y2: ROOT_Y - 60 };

  const branchLevels = [
    // Level 1
    [
      { x1: CX, y1: ROOT_Y - 60, x2: CX - 45, y2: ROOT_Y - 120 },
      { x1: CX, y1: ROOT_Y - 60, x2: CX + 45, y2: ROOT_Y - 120 },
    ],
    // Level 2
    [
      { x1: CX - 45, y1: ROOT_Y - 120, x2: CX - 70, y2: ROOT_Y - 170 },
      { x1: CX - 45, y1: ROOT_Y - 120, x2: CX - 25, y2: ROOT_Y - 175 },
      { x1: CX + 45, y1: ROOT_Y - 120, x2: CX + 25, y2: ROOT_Y - 175 },
      { x1: CX + 45, y1: ROOT_Y - 120, x2: CX + 70, y2: ROOT_Y - 170 },
    ],
    // Level 3
    [
      { x1: CX - 70, y1: ROOT_Y - 170, x2: CX - 85, y2: ROOT_Y - 210 },
      { x1: CX - 70, y1: ROOT_Y - 170, x2: CX - 55, y2: ROOT_Y - 215 },
      { x1: CX - 25, y1: ROOT_Y - 175, x2: CX - 38, y2: ROOT_Y - 215 },
      { x1: CX - 25, y1: ROOT_Y - 175, x2: CX - 12, y2: ROOT_Y - 218 },
      { x1: CX + 25, y1: ROOT_Y - 175, x2: CX + 12, y2: ROOT_Y - 218 },
      { x1: CX + 25, y1: ROOT_Y - 175, x2: CX + 38, y2: ROOT_Y - 215 },
      { x1: CX + 70, y1: ROOT_Y - 170, x2: CX + 55, y2: ROOT_Y - 215 },
      { x1: CX + 70, y1: ROOT_Y - 170, x2: CX + 85, y2: ROOT_Y - 210 },
    ],
  ];

  const tipLabels = [
    'bacteria', 'archaea', 'fungi', 'plants',
    'insects', 'fish', 'birds', 'mammals',
  ];

  return (
    <div style={navicueStyles.interactionContainer(12)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Root */}
          {phase >= 1 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {/* Root node */}
              <circle cx={CX} cy={ROOT_Y} r={6}
                fill={verse.palette.accent} opacity={safeOpacity(0.2)} />
              <text x={CX} y={ROOT_Y + 15} textAnchor="middle"
                fill={verse.palette.accent} style={{ fontSize: '8px' }} opacity={0.4}>
                LUCA
              </text>

              {/* Trunk */}
              <motion.line
                x1={trunk.x1} y1={trunk.y1} x2={trunk.x2} y2={trunk.y2}
                stroke={verse.palette.accent}
                strokeWidth={2.5}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1, opacity: safeOpacity(0.25) }}
                transition={{ duration: 1 }}
              />
            </motion.g>
          )}

          {/* Level 1 branches */}
          {phase >= 2 && branchLevels[0].map((b, i) => (
            <motion.line key={`l1-${i}`}
              x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2}
              stroke={verse.palette.accent}
              strokeWidth={2}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: safeOpacity(0.2) }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
            />
          ))}

          {/* Level 2 branches */}
          {phase >= 3 && branchLevels[1].map((b, i) => (
            <motion.line key={`l2-${i}`}
              x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2}
              stroke={verse.palette.primary}
              strokeWidth={1.5}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: safeOpacity(0.15) }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            />
          ))}

          {/* Level 3 branches (tips) */}
          {phase >= 4 && branchLevels[2].map((b, i) => (
            <motion.g key={`l3-${i}`}>
              <motion.line
                x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2}
                stroke={verse.palette.primary}
                strokeWidth={1}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: safeOpacity(0.12) }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              />

              {/* Tip node */}
              <motion.circle
                cx={b.x2} cy={b.y2} r={4}
                fill={verse.palette.accent}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: safeOpacity(0.2), scale: 1 }}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.2 }}
              />

              {/* Tip label */}
              <motion.text
                x={b.x2} y={b.y2 - 8}
                textAnchor="middle"
                fill={verse.palette.textFaint}
                style={{ fontSize: '6px' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 0.5 + i * 0.06 }}
              >
                {tipLabels[i]}
              </motion.text>
            </motion.g>
          ))}

          {/* Branch point nodes */}
          {phase >= 2 && (
            <g>
              <circle cx={CX} cy={ROOT_Y - 60} r={3}
                fill={verse.palette.accent} opacity={safeOpacity(0.15)} />
            </g>
          )}
          {phase >= 3 && branchLevels[0].map((b, i) => (
            <circle key={`node1-${i}`} cx={b.x2} cy={b.y2} r={3}
              fill={verse.palette.accent} opacity={safeOpacity(0.12)} />
          ))}
          {phase >= 4 && branchLevels[1].map((b, i) => (
            <circle key={`node2-${i}`} cx={b.x2} cy={b.y2} r={2.5}
              fill={verse.palette.primary} opacity={safeOpacity(0.1)} />
          ))}

          {/* Seal ring */}
          {phase >= 4 && (
            <motion.circle
              cx={CX} cy={H / 2} r={120}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={0.5}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: safeOpacity(0.1), scale: 1 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            />
          )}

          {/* Phase text */}
          <motion.text
            x={CX} y={H - 5}
            textAnchor="middle"
            fill={phase >= 5 ? verse.palette.accent : verse.palette.textFaint}
            style={navicueType.hint}
            animate={{ opacity: 0.6 }}
          >
            {phase === 0 && 'a single root'}
            {phase === 1 && 'life begins'}
            {phase === 2 && 'the first divergence'}
            {phase === 3 && 'branches multiply'}
            {phase === 4 && 'the tree of life'}
            {phase >= 5 && 'change or die'}
          </motion.text>
        </svg>
      </div>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase >= 5 ? 'natural selection / specimen 1340' : 'observe'}
      </div>
    </div>
  );
}
