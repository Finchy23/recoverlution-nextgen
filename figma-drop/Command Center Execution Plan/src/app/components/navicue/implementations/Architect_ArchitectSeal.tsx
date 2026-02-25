/**
 * ARCHITECT #10 -- 1330. The Architect Seal (The Proof)
 * "The structure determines the behavior."
 * INTERACTION: Observe -- system dynamics diagram: stocks, flows, feedback loops
 * STEALTH KBE: System Dynamics -- seal completion
 *
 * COMPOSITOR: science_x_soul / Cosmos / night / knowing / observe / 1330
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

export default function Architect_ArchitectSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Cosmos',
        chrono: 'night',
        kbe: 'k',
        hook: 'observe',
        specimenSeed: 1330,
        isSeal: true,
      }}
      arrivalText="The system. Its structure."
      prompt="The structure determines the behavior."
      resonantText="System dynamics. The approach to understanding the nonlinear behavior of complex systems over time. Fix the system, not the symptom. Stocks accumulate. Flows rate. Feedback loops amplify or dampen. The structure determines the behavior. Specimen 1330. The proof."
      afterglowCoda="Fix the system."
      onComplete={onComplete}
    >
      {(verse) => <ArchitectSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ArchitectSealInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 2000),
      setTimeout(() => setPhase(2), 5000),
      setTimeout(() => setPhase(3), 8500),
      setTimeout(() => setPhase(4), 11500),
      setTimeout(() => {
        setPhase(5);
        setTimeout(() => verse.advance(), 3500);
      }, 14000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [verse]);

  const W = 280, H = 260;
  const CX = W / 2, CY = H / 2;

  // System dynamics elements
  const stocks = [
    { x: 70, y: 80, label: 'energy', w: 60, h: 30 },
    { x: 190, y: 80, label: 'output', w: 60, h: 30 },
    { x: 130, y: 180, label: 'capacity', w: 60, h: 30 },
  ];

  const flows = [
    { from: stocks[0], to: stocks[1], label: 'work rate' },
    { from: stocks[1], to: stocks[2], label: 'learning' },
    { from: stocks[2], to: stocks[0], label: 'renewal' },
  ];

  return (
    <div style={navicueStyles.interactionContainer(12)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Stocks (rectangles) */}
          {phase >= 1 && stocks.map((stock, i) => (
            <motion.g key={`stock-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.3, duration: 0.5 }}
            >
              <rect x={stock.x - stock.w / 2} y={stock.y - stock.h / 2}
                width={stock.w} height={stock.h} rx={3}
                fill={verse.palette.primary} opacity={safeOpacity(0.06)} />
              <rect x={stock.x - stock.w / 2} y={stock.y - stock.h / 2}
                width={stock.w} height={stock.h} rx={3}
                fill="none" stroke={verse.palette.primary}
                strokeWidth={1} opacity={safeOpacity(0.15)} />

              {/* Stock level (fill) */}
              <motion.rect
                x={stock.x - stock.w / 2 + 2}
                y={stock.y + stock.h / 2 - 2}
                width={stock.w - 4} rx={2}
                fill={verse.palette.accent}
                animate={{
                  height: phase >= 3 ? stock.h * 0.6 : stock.h * 0.3,
                  y: stock.y + stock.h / 2 - (phase >= 3 ? stock.h * 0.6 : stock.h * 0.3) - 2,
                  opacity: safeOpacity(phase >= 3 ? 0.15 : 0.08),
                }}
                transition={{ duration: 1 }}
              />

              <text x={stock.x} y={stock.y + 4} textAnchor="middle"
                fill={verse.palette.text} style={{ fontSize: '9px' }} opacity={0.4}>
                {stock.label}
              </text>
            </motion.g>
          ))}

          {/* Flows (arrows between stocks) */}
          {phase >= 2 && flows.map((flow, i) => {
            const dx = flow.to.x - flow.from.x;
            const dy = flow.to.y - flow.from.y;
            const angle = Math.atan2(dy, dx);
            const fromX = flow.from.x + Math.cos(angle) * 35;
            const fromY = flow.from.y + Math.sin(angle) * 18;
            const toX = flow.to.x - Math.cos(angle) * 35;
            const toY = flow.to.y - Math.sin(angle) * 18;
            const midX = (fromX + toX) / 2;
            const midY = (fromY + toY) / 2;

            // Curve offset for visual clarity
            const perpX = -Math.sin(angle) * 20;
            const perpY = Math.cos(angle) * 20;

            return (
              <motion.g key={`flow-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.3 + 0.5, duration: 0.5 }}
              >
                {/* Flow line (curved) */}
                <path
                  d={`M ${fromX},${fromY} Q ${midX + perpX},${midY + perpY} ${toX},${toY}`}
                  fill="none" stroke={verse.palette.primary}
                  strokeWidth={0.8} opacity={safeOpacity(0.15)}
                  markerEnd="url(#arrowhead)" />

                {/* Flow label */}
                <text x={midX + perpX * 0.6} y={midY + perpY * 0.6 - 3}
                  textAnchor="middle"
                  fill={verse.palette.textFaint}
                  style={{ fontSize: '7px' }} opacity={0.25}>
                  {flow.label}
                </text>

                {/* Flow particle */}
                {phase >= 3 && (
                  <motion.circle
                    r={2} fill={verse.palette.accent}
                    animate={{
                      cx: [fromX, midX + perpX * 0.8, toX],
                      cy: [fromY, midY + perpY * 0.8, toY],
                      opacity: [0, safeOpacity(0.3), 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      delay: i * 0.6,
                      ease: 'linear',
                    }}
                  />
                )}
              </motion.g>
            );
          })}

          {/* Arrowhead marker */}
          <defs>
            <marker id="arrowhead" viewBox="0 0 10 10"
              refX={8} refY={5} markerWidth={5} markerHeight={5}
              orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z"
                fill={verse.palette.primary} opacity={0.15} />
            </marker>
          </defs>

          {/* Feedback loop indicators */}
          {phase >= 3 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {/* Reinforcing loop (R) */}
              <circle cx={CX} cy={CY - 15} r={18}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.5} strokeDasharray="4 3"
                opacity={safeOpacity(0.15)} />
              <text x={CX} y={CY - 12} textAnchor="middle"
                fill={verse.palette.accent} style={{ fontSize: '9px' }} opacity={0.3}>
                R
              </text>

              {/* Balancing loop (B) */}
              <circle cx={CX - 30} cy={CY + 30} r={14}
                fill="none" stroke={verse.palette.primary}
                strokeWidth={0.5} strokeDasharray="3 3"
                opacity={safeOpacity(0.1)} />
              <text x={CX - 30} y={CY + 33} textAnchor="middle"
                fill={verse.palette.textFaint} style={{ fontSize: '8px' }} opacity={0.25}>
                B
              </text>
            </motion.g>
          )}

          {/* Delay marks (||) */}
          {phase >= 3 && flows.map((flow, i) => {
            const dx = flow.to.x - flow.from.x;
            const dy = flow.to.y - flow.from.y;
            const angle = Math.atan2(dy, dx);
            const midX = (flow.from.x + flow.to.x) / 2;
            const midY = (flow.from.y + flow.to.y) / 2;
            const perpX = -Math.sin(angle) * 20;
            const perpY = Math.cos(angle) * 20;
            const markX = midX + perpX * 0.3;
            const markY = midY + perpY * 0.3;

            return i === 1 ? (
              <motion.g key={`delay-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: safeOpacity(0.2) }}
                transition={{ delay: 1 }}
              >
                <line x1={markX - 2} y1={markY - 4} x2={markX - 2} y2={markY + 4}
                  stroke={verse.palette.primary} strokeWidth={1} />
                <line x1={markX + 2} y1={markY - 4} x2={markX + 2} y2={markY + 4}
                  stroke={verse.palette.primary} strokeWidth={1} />
              </motion.g>
            ) : null;
          })}

          {/* Seal ring */}
          {phase >= 4 && (
            <motion.circle
              cx={CX} cy={CY} r={115}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={0.5}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: safeOpacity(0.12), scale: 1 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            />
          )}

          {/* Phase text */}
          <motion.text
            x={CX} y={H - 8}
            textAnchor="middle"
            fill={phase >= 5 ? verse.palette.accent : verse.palette.textFaint}
            style={navicueType.hint}
            animate={{ opacity: 0.6 }}
          >
            {phase === 0 && 'the system emerges'}
            {phase === 1 && 'stocks accumulate'}
            {phase === 2 && 'flows connect'}
            {phase === 3 && 'feedback loops amplify'}
            {phase === 4 && 'structure determines behavior'}
            {phase >= 5 && 'fix the system, not the symptom'}
          </motion.text>
        </svg>
      </div>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase >= 5 ? 'system dynamics / specimen 1330' : 'observe'}
      </div>
    </div>
  );
}
