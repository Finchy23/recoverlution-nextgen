/**
 * POLITICIAN #10 -- 1360. The Politician Seal (The Proof)
 * "To rule is to serve."
 * INTERACTION: Observe -- scales balancing perfectly. Power distributed = power preserved.
 * STEALTH KBE: Political Science -- seal completion
 *
 * COMPOSITOR: science_x_soul / Cosmos / night / knowing / observe / 1360
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

export default function Politician_PoliticianSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Cosmos',
        chrono: 'night',
        kbe: 'k',
        hook: 'observe',
        specimenSeed: 1360,
        isSeal: true,
      }}
      arrivalText="The scales."
      prompt="To rule is to serve."
      resonantText="Political science. The study of systems of governance and power analysis. It is not about being liked; it is about being effective. Power distributed is power preserved. The scales balance when service outweighs control. Specimen 1360. The proof."
      afterglowCoda="To rule is to serve."
      onComplete={onComplete}
    >
      {(verse) => <PoliticianSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function PoliticianSealInteraction({ verse }: { verse: any }) {
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
  const CX = W / 2;
  const FULCRUM_Y = 130;

  // Scale geometry
  const BEAM_W = 160;
  const PAN_DROP = 35;
  const L_PAN_X = CX - BEAM_W / 2;
  const R_PAN_X = CX + BEAM_W / 2;

  // Tilt: starts tilted (power side heavy), then balances
  const tiltDeg = phase < 3 ? -8 : phase === 3 ? -3 : 0;

  // Items on each pan
  const leftItems = ['coalition', 'optics', 'favor', 'leverage', 'long game'];
  const rightItems = ['service', 'trust', 'ownership', 'compromise', 'listening'];

  return (
    <div style={navicueStyles.interactionContainer(12)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Fulcrum (triangle) */}
          {phase >= 1 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <path
                d={`M ${CX},${FULCRUM_Y} L ${CX - 12},${FULCRUM_Y + 20} L ${CX + 12},${FULCRUM_Y + 20} Z`}
                fill={verse.palette.primary}
                opacity={safeOpacity(0.1)}
              />
              {/* Base */}
              <rect x={CX - 25} y={FULCRUM_Y + 20} width={50} height={4} rx={2}
                fill={verse.palette.primary} opacity={safeOpacity(0.08)} />
            </motion.g>
          )}

          {/* Beam */}
          {phase >= 1 && (
            <motion.g
              animate={{ rotate: tiltDeg }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: `${CX}px ${FULCRUM_Y}px` }}
            >
              {/* Beam bar */}
              <line x1={L_PAN_X} y1={FULCRUM_Y} x2={R_PAN_X} y2={FULCRUM_Y}
                stroke={verse.palette.primary} strokeWidth={2}
                opacity={safeOpacity(0.15)} />

              {/* Left pan chains */}
              <line x1={L_PAN_X} y1={FULCRUM_Y} x2={L_PAN_X} y2={FULCRUM_Y + PAN_DROP}
                stroke={verse.palette.primary} strokeWidth={0.5}
                opacity={safeOpacity(0.12)} />

              {/* Left pan */}
              <path
                d={`M ${L_PAN_X - 25},${FULCRUM_Y + PAN_DROP} Q ${L_PAN_X},${FULCRUM_Y + PAN_DROP + 12} ${L_PAN_X + 25},${FULCRUM_Y + PAN_DROP}`}
                fill="none" stroke={verse.palette.primary}
                strokeWidth={1.5} opacity={safeOpacity(0.15)} />

              {/* Right pan chains */}
              <line x1={R_PAN_X} y1={FULCRUM_Y} x2={R_PAN_X} y2={FULCRUM_Y + PAN_DROP}
                stroke={verse.palette.primary} strokeWidth={0.5}
                opacity={safeOpacity(0.12)} />

              {/* Right pan */}
              <path
                d={`M ${R_PAN_X - 25},${FULCRUM_Y + PAN_DROP} Q ${R_PAN_X},${FULCRUM_Y + PAN_DROP + 12} ${R_PAN_X + 25},${FULCRUM_Y + PAN_DROP}`}
                fill="none"
                stroke={phase >= 3 ? verse.palette.accent : verse.palette.primary}
                strokeWidth={1.5}
                opacity={safeOpacity(phase >= 3 ? 0.2 : 0.15)} />

              {/* Left pan label */}
              <text x={L_PAN_X} y={FULCRUM_Y + PAN_DROP + 25} textAnchor="middle"
                fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.25}>
                power
              </text>

              {/* Right pan label */}
              <text x={R_PAN_X} y={FULCRUM_Y + PAN_DROP + 25} textAnchor="middle"
                fill={phase >= 3 ? verse.palette.accent : verse.palette.textFaint}
                style={{ fontSize: '7px' }}
                opacity={phase >= 3 ? 0.4 : 0.25}>
                service
              </text>

              {/* Left items (power tools) */}
              {phase >= 2 && leftItems.slice(0, Math.min(phase - 1, leftItems.length)).map((item, i) => (
                <motion.g key={`l-${i}`}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                >
                  <circle
                    cx={L_PAN_X - 15 + (i % 3) * 15}
                    cy={FULCRUM_Y + PAN_DROP - 8 - Math.floor(i / 3) * 10}
                    r={4}
                    fill={verse.palette.primary}
                    opacity={safeOpacity(0.08)}
                  />
                </motion.g>
              ))}

              {/* Right items (service virtues) */}
              {phase >= 3 && rightItems.slice(0, Math.min(phase - 2, rightItems.length)).map((item, i) => (
                <motion.g key={`r-${i}`}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                >
                  <circle
                    cx={R_PAN_X - 15 + (i % 3) * 15}
                    cy={FULCRUM_Y + PAN_DROP - 8 - Math.floor(i / 3) * 10}
                    r={4}
                    fill={verse.palette.accent}
                    opacity={safeOpacity(0.12)}
                  />
                </motion.g>
              ))}
            </motion.g>
          )}

          {/* Equilibrium indicator */}
          {phase >= 4 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {/* Balance line */}
              <motion.line
                x1={CX - 5} y1={FULCRUM_Y - 15}
                x2={CX + 5} y2={FULCRUM_Y - 15}
                stroke={verse.palette.accent} strokeWidth={1}
                animate={{ opacity: safeOpacity(0.3) }}
              />
              <text x={CX} y={FULCRUM_Y - 20} textAnchor="middle"
                fill={verse.palette.accent} style={{ fontSize: '8px' }} opacity={0.4}>
                balanced
              </text>
            </motion.g>
          )}

          {/* Seal ring */}
          {phase >= 4 && (
            <motion.circle
              cx={CX} cy={FULCRUM_Y + 10} r={100}
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
            {phase === 0 && 'the scales'}
            {phase === 1 && 'power on one side'}
            {phase === 2 && 'it tilts'}
            {phase === 3 && 'service on the other'}
            {phase === 4 && 'power distributed is power preserved'}
            {phase >= 5 && 'to rule is to serve'}
          </motion.text>
        </svg>
      </div>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase >= 5 ? 'political science / specimen 1360' : 'observe'}
      </div>
    </div>
  );
}
