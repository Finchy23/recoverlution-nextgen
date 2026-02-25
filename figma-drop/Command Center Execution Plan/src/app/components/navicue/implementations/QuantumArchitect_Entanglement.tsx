/**
 * QUANTUM ARCHITECT #6 -- 1236. The Entanglement (Love)
 * "Separation is an optical illusion."
 * INTERACTION: Tap to spin one particle -- the other instantly mirrors, infinite distance
 * STEALTH KBE: Connection -- Relational Permanence (B)
 *
 * COMPOSITOR: sacred_ordinary / Drift / night / believing / tap / 1236
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

export default function QuantumArchitect_Entanglement({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Drift',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1236,
        isSeal: false,
      }}
      arrivalText="Two particles. Distance: infinite."
      prompt="Separation is an optical illusion. You are forever entangled with what you love. Physics confirms the heart."
      resonantText="Connection. You spun one and the other moved instantly. No signal crossed the distance. The bond was already there. Relational permanence. Love is not proximity. It is entanglement."
      afterglowCoda="Physics confirms the heart."
      onComplete={onComplete}
    >
      {(verse) => <EntanglementInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function EntanglementInteraction({ verse }: { verse: any }) {
  const [spin, setSpin] = useState<'none' | 'up' | 'down'>('none');
  const [mirrored, setMirrored] = useState(false);
  const [done, setDone] = useState(false);
  const [distance, setDistance] = useState(100);

  // Expand distance over time for drama
  useEffect(() => {
    const interval = setInterval(() => {
      setDistance(prev => Math.min(prev + 2, 300));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleSpin = (dir: 'up' | 'down') => {
    if (spin !== 'none') return;
    setSpin(dir);
    // Instant mirror (spooky action)
    setTimeout(() => setMirrored(true), 80);
    setTimeout(() => {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }, 2000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const SCENE_W = 280;
  const SCENE_H = 120;
  const LEFT_X = 50;
  const RIGHT_X = 230;

  // Arrow direction for spin
  const upArrow = (cx: number, cy: number) =>
    `M ${cx},${cy + 8} L ${cx},${cy - 8} M ${cx - 4},${cy - 4} L ${cx},${cy - 8} L ${cx + 4},${cy - 4}`;
  const downArrow = (cx: number, cy: number) =>
    `M ${cx},${cy - 8} L ${cx},${cy + 8} M ${cx - 4},${cy + 4} L ${cx},${cy + 8} L ${cx + 4},${cy + 4}`;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Distance counter */}
      <motion.div
        style={{ display: 'flex', gap: 8, alignItems: 'center' }}
        animate={{ opacity: 0.5 }}
      >
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>distance</span>
        <span style={{ ...navicueType.data, color: verse.palette.text }}>
          {done ? '\u221E' : `${Math.round(distance)} ly`}
        </span>
      </motion.div>

      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Connection line (dashed, entanglement) */}
          <motion.line
            x1={LEFT_X} y1={SCENE_H / 2}
            x2={RIGHT_X} y2={SCENE_H / 2}
            stroke={verse.palette.accent}
            strokeWidth={0.5}
            strokeDasharray="3 5"
            animate={{
              opacity: safeOpacity(mirrored ? 0.4 : 0.08),
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Entanglement flash */}
          {mirrored && (
            <motion.line
              x1={LEFT_X} y1={SCENE_H / 2}
              x2={RIGHT_X} y2={SCENE_H / 2}
              stroke={verse.palette.accent}
              strokeWidth={2}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          )}

          {/* Particle A (left) */}
          <motion.g>
            <motion.circle
              cx={LEFT_X} cy={SCENE_H / 2}
              r={16}
              fill={verse.palette.accent}
              animate={{
                opacity: safeOpacity(spin !== 'none' ? 0.2 : 0.1),
              }}
            />
            <motion.circle
              cx={LEFT_X} cy={SCENE_H / 2}
              r={16}
              fill="none"
              stroke={verse.palette.accent}
              strokeWidth={1}
              animate={{
                opacity: safeOpacity(0.3),
                rotate: spin === 'up' ? 360 : spin === 'down' ? -360 : 0,
              }}
              transition={{ duration: 0.6 }}
              style={{ transformOrigin: `${LEFT_X}px ${SCENE_H / 2}px` }}
            />

            {/* Spin arrow A */}
            {spin !== 'none' && (
              <motion.path
                d={spin === 'up' ? upArrow(LEFT_X, SCENE_H / 2) : downArrow(LEFT_X, SCENE_H / 2)}
                fill="none"
                stroke={verse.palette.accent}
                strokeWidth={1.5}
                initial={{ opacity: 0 }}
                animate={{ opacity: safeOpacity(0.6) }}
              />
            )}

            <text x={LEFT_X} y={SCENE_H / 2 + 30} textAnchor="middle"
              fill={verse.palette.textFaint} style={navicueType.micro}>
              {spin !== 'none' ? (spin === 'up' ? 'spin up' : 'spin down') : 'particle A'}
            </text>
          </motion.g>

          {/* Particle B (right) */}
          <motion.g>
            <motion.circle
              cx={RIGHT_X} cy={SCENE_H / 2}
              r={16}
              fill={verse.palette.accent}
              animate={{
                opacity: safeOpacity(mirrored ? 0.2 : 0.1),
              }}
            />
            <motion.circle
              cx={RIGHT_X} cy={SCENE_H / 2}
              r={16}
              fill="none"
              stroke={verse.palette.accent}
              strokeWidth={1}
              animate={{
                opacity: safeOpacity(0.3),
                rotate: mirrored
                  ? (spin === 'up' ? -360 : 360)
                  : 0,
              }}
              transition={{ duration: 0.6 }}
              style={{ transformOrigin: `${RIGHT_X}px ${SCENE_H / 2}px` }}
            />

            {/* Spin arrow B (opposite) */}
            {mirrored && (
              <motion.path
                d={spin === 'up' ? downArrow(RIGHT_X, SCENE_H / 2) : upArrow(RIGHT_X, SCENE_H / 2)}
                fill="none"
                stroke={verse.palette.accent}
                strokeWidth={1.5}
                initial={{ opacity: 0 }}
                animate={{ opacity: safeOpacity(0.6) }}
                transition={{ delay: 0.05 }}
              />
            )}

            <text x={RIGHT_X} y={SCENE_H / 2 + 30} textAnchor="middle"
              fill={verse.palette.textFaint} style={navicueType.micro}>
              {mirrored ? (spin === 'up' ? 'spin down' : 'spin up') : 'particle B'}
            </text>
          </motion.g>

          {/* "Instant" label on the connection */}
          {mirrored && (
            <motion.text
              x={SCENE_W / 2} y={SCENE_H / 2 - 15}
              textAnchor="middle"
              fill={verse.palette.accent}
              style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.5) }}
              transition={{ delay: 0.3 }}
            >
              instant
            </motion.text>
          )}
        </svg>
      </div>

      {/* Spin buttons */}
      {spin === 'none' && (
        <div style={{ display: 'flex', gap: 12 }}>
          <motion.button
            style={{ ...btn.base, padding: '10px 20px' }}
            whileTap={btn.active}
            onClick={() => handleSpin('up')}
          >
            spin up
          </motion.button>
          <motion.button
            style={{ ...btn.base, padding: '10px 20px' }}
            whileTap={btn.active}
            onClick={() => handleSpin('down')}
          >
            spin down
          </motion.button>
        </div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'entangled forever'
          : mirrored
            ? 'no signal. instant mirror.'
            : 'spin particle A'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          relational permanence
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'connection' : 'separation is an illusion'}
      </div>
    </div>
  );
}
