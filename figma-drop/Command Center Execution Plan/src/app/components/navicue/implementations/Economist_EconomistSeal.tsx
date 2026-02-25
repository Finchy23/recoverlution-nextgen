/**
 * ECONOMIST #10 -- 1350. The Economist Seal (The Proof)
 * "Value is subjective. Price is objective."
 * INTERACTION: Observe -- supply and demand curves cross at equilibrium
 * STEALTH KBE: Behavioral Economics -- seal completion
 *
 * COMPOSITOR: science_x_soul / Cosmos / night / knowing / observe / 1350
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

export default function Economist_EconomistSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Cosmos',
        chrono: 'night',
        kbe: 'k',
        hook: 'observe',
        specimenSeed: 1350,
        isSeal: true,
      }}
      arrivalText="Two curves."
      prompt="Value is subjective. Price is objective."
      resonantText="Behavioral economics. We are not rational actors. We are predictably irrational. Know your bias to save your wallet. The crossing point is the equilibrium price: where what buyers will pay meets what sellers will accept. Specimen 1350. The proof."
      afterglowCoda="Know your bias."
      onComplete={onComplete}
    >
      {(verse) => <EconomistSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function EconomistSealInteraction({ verse }: { verse: any }) {
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

  // Chart area
  const CX_CHART = W / 2;
  const CHART_X = 40, CHART_Y = 30;
  const CHART_W = W - 80, CHART_H = 160;
  const ORIGIN = { x: CHART_X, y: CHART_Y + CHART_H };

  // Supply curve (upward sloping): from bottom-left to top-right
  const supplyPoints = Array.from({ length: 20 }).map((_, i) => {
    const t = i / 19;
    const x = ORIGIN.x + t * CHART_W;
    const y = ORIGIN.y - t * CHART_H * 0.85;
    return { x, y };
  });

  // Demand curve (downward sloping): from top-left to bottom-right
  const demandPoints = Array.from({ length: 20 }).map((_, i) => {
    const t = i / 19;
    const x = ORIGIN.x + t * CHART_W;
    const y = ORIGIN.y - (1 - t) * CHART_H * 0.85;
    return { x, y };
  });

  // Equilibrium (crossing point -- roughly at t=0.5)
  const EQ_X = ORIGIN.x + CHART_W * 0.5;
  const EQ_Y = ORIGIN.y - CHART_H * 0.425;

  return (
    <div style={navicueStyles.interactionContainer(12)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Axes */}
          {phase >= 1 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {/* Y-axis (Price) */}
              <motion.line
                x1={ORIGIN.x} y1={ORIGIN.y}
                x2={ORIGIN.x} y2={CHART_Y}
                stroke={verse.palette.primary}
                strokeWidth={1}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1, opacity: safeOpacity(0.2) }}
                transition={{ duration: 0.6 }}
              />
              <text x={ORIGIN.x - 5} y={CHART_Y + 5}
                textAnchor="end" fill={verse.palette.textFaint}
                style={{ fontSize: '8px' }} opacity={0.3}>
                price
              </text>

              {/* X-axis (Quantity) */}
              <motion.line
                x1={ORIGIN.x} y1={ORIGIN.y}
                x2={ORIGIN.x + CHART_W} y2={ORIGIN.y}
                stroke={verse.palette.primary}
                strokeWidth={1}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1, opacity: safeOpacity(0.2) }}
                transition={{ duration: 0.6, delay: 0.3 }}
              />
              <text x={ORIGIN.x + CHART_W} y={ORIGIN.y + 15}
                textAnchor="end" fill={verse.palette.textFaint}
                style={{ fontSize: '8px' }} opacity={0.3}>
                quantity
              </text>
            </motion.g>
          )}

          {/* Supply curve (S) */}
          {phase >= 2 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <motion.polyline
                points={supplyPoints.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={verse.palette.primary}
                strokeWidth={1.5}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1, opacity: safeOpacity(0.25) }}
                transition={{ duration: 1 }}
              />
              <text
                x={supplyPoints[supplyPoints.length - 1].x + 5}
                y={supplyPoints[supplyPoints.length - 1].y + 5}
                fill={verse.palette.primary}
                style={{ fontSize: '11px' }} opacity={0.3}>
                S
              </text>
            </motion.g>
          )}

          {/* Demand curve (D) */}
          {phase >= 2 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.polyline
                points={demandPoints.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={verse.palette.accent}
                strokeWidth={1.5}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1, opacity: safeOpacity(0.25) }}
                transition={{ duration: 1, delay: 0.5 }}
              />
              <text
                x={demandPoints[demandPoints.length - 1].x + 5}
                y={demandPoints[demandPoints.length - 1].y - 5}
                fill={verse.palette.accent}
                style={{ fontSize: '11px' }} opacity={0.3}>
                D
              </text>
            </motion.g>
          )}

          {/* Equilibrium point */}
          {phase >= 3 && (
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Crosshair */}
              <line x1={ORIGIN.x} y1={EQ_Y} x2={EQ_X} y2={EQ_Y}
                stroke={verse.palette.accent} strokeWidth={0.5}
                strokeDasharray="3 3" opacity={safeOpacity(0.15)} />
              <line x1={EQ_X} y1={EQ_Y} x2={EQ_X} y2={ORIGIN.y}
                stroke={verse.palette.accent} strokeWidth={0.5}
                strokeDasharray="3 3" opacity={safeOpacity(0.15)} />

              {/* Equilibrium dot */}
              <circle cx={EQ_X} cy={EQ_Y} r={5}
                fill={verse.palette.accent} opacity={safeOpacity(0.3)} />

              {/* Labels */}
              <text x={ORIGIN.x - 5} y={EQ_Y + 3} textAnchor="end"
                fill={verse.palette.accent} style={{ fontSize: '7px' }} opacity={0.4}>
                P*
              </text>
              <text x={EQ_X} y={ORIGIN.y + 12} textAnchor="middle"
                fill={verse.palette.accent} style={{ fontSize: '7px' }} opacity={0.4}>
                Q*
              </text>

              <text x={EQ_X + 12} y={EQ_Y - 5}
                fill={verse.palette.accent} style={{ fontSize: '8px' }} opacity={0.5}>
                equilibrium
              </text>
            </motion.g>
          )}

          {/* Bias annotations */}
          {phase >= 4 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* Consumer surplus (triangle above eq, below demand) */}
              <path
                d={`M ${ORIGIN.x},${demandPoints[0].y} L ${EQ_X},${EQ_Y} L ${ORIGIN.x},${EQ_Y} Z`}
                fill={verse.palette.accent}
                opacity={safeOpacity(0.04)}
              />
              <text x={ORIGIN.x + 15} y={EQ_Y - 15}
                fill={verse.palette.accent} style={{ fontSize: '7px' }} opacity={0.25}>
                surplus
              </text>

              {/* Producer surplus (triangle below eq, above supply) */}
              <path
                d={`M ${ORIGIN.x},${ORIGIN.y} L ${EQ_X},${EQ_Y} L ${ORIGIN.x},${EQ_Y} Z`}
                fill={verse.palette.primary}
                opacity={safeOpacity(0.03)}
              />
            </motion.g>
          )}

          {/* Seal ring */}
          {phase >= 4 && (
            <motion.circle
              cx={CX} cy={CHART_Y + CHART_H / 2 + 10} r={110}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={0.5}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: safeOpacity(0.1), scale: 1 }}
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
            {phase === 0 && 'two curves'}
            {phase === 1 && 'price and quantity'}
            {phase === 2 && 'supply meets demand'}
            {phase === 3 && 'the crossing point'}
            {phase === 4 && 'the equilibrium price'}
            {phase >= 5 && 'we are predictably irrational'}
          </motion.text>
        </svg>
      </div>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase >= 5 ? 'behavioral economics / specimen 1350' : 'observe'}
      </div>
    </div>
  );
}
