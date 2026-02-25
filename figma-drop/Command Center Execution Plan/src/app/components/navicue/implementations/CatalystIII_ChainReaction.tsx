/**
 * CATALYST III #6 -- 1226. The Chain Reaction
 * "You just need to trigger the first one."
 * INTERACTION: Tap to identify the lead domino, then trigger it -- cascade
 * STEALTH KBE: Leverage -- Systems Leverage (K)
 *
 * COMPOSITOR: science_x_soul / Lattice / morning / knowing / tap / 1226
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

const TRAPS = [
  { label: 'sleep', x: 30, y: 30 },
  { label: 'mood', x: 90, y: 25 },
  { label: 'energy', x: 150, y: 35 },
  { label: 'focus', x: 210, y: 28 },
  { label: 'exercise', x: 55, y: 70 },
  { label: 'nutrition', x: 120, y: 75 },
  { label: 'social', x: 180, y: 72 },
  { label: 'purpose', x: 240, y: 68 },
  { label: 'calm', x: 40, y: 110 },
  { label: 'clarity', x: 105, y: 115 },
  { label: 'joy', x: 170, y: 108 },
  { label: 'growth', x: 230, y: 112 },
];

export default function CatalystIII_ChainReaction({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Lattice',
        chrono: 'morning',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1226,
        isSeal: false,
      }}
      arrivalText="A field of mousetraps."
      prompt="You do not need to snap every trap. You just need to trigger the first one. Find the domino that knocks down the rest."
      resonantText="Leverage. One correct action cascaded through the entire system. Systems leverage means you do not fix everything. You fix the one thing that fixes everything."
      afterglowCoda="Find the first one."
      onComplete={onComplete}
    >
      {(verse) => <ChainReactionInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ChainReactionInteraction({ verse }: { verse: any }) {
  const [selectedTrap, setSelectedTrap] = useState(-1);
  const [triggered, setTriggered] = useState(false);
  const [snappedCount, setSnappedCount] = useState(0);
  const [done, setDone] = useState(false);

  const LEAD_DOMINO = 0; // "sleep" is the lead domino

  // Chain reaction cascade
  useEffect(() => {
    if (!triggered) return;
    if (snappedCount >= TRAPS.length) {
      setDone(true);
      setTimeout(() => verse.advance(), 2500);
      return;
    }
    const delay = snappedCount === 0 ? 200 : 150 + Math.random() * 100;
    const timer = setTimeout(() => {
      setSnappedCount(prev => prev + 1);
    }, delay);
    return () => clearTimeout(timer);
  }, [triggered, snappedCount, verse]);

  const handleSelectTrap = (idx: number) => {
    if (triggered) return;
    setSelectedTrap(idx);
  };

  const handleTrigger = () => {
    if (selectedTrap !== LEAD_DOMINO || triggered) return;
    setTriggered(true);
    setSnappedCount(1);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const SCENE_W = 280;
  const SCENE_H = 140;

  // Sort order for cascade: proximity-based from the lead domino
  const cascadeOrder = TRAPS.map((trap, i) => {
    const dx = trap.x - TRAPS[LEAD_DOMINO].x;
    const dy = trap.y - TRAPS[LEAD_DOMINO].y;
    return { idx: i, dist: Math.sqrt(dx * dx + dy * dy) };
  }).sort((a, b) => a.dist - b.dist).map(t => t.idx);

  const isSnapped = (idx: number) => {
    if (!triggered) return false;
    const order = cascadeOrder.indexOf(idx);
    return order < snappedCount;
  };

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Connection lines (visible during cascade) */}
          {triggered && cascadeOrder.slice(0, snappedCount).map((idx, i) => {
            if (i === 0) return null;
            const prevIdx = cascadeOrder[i - 1];
            return (
              <motion.line
                key={`line-${idx}`}
                x1={TRAPS[prevIdx].x} y1={TRAPS[prevIdx].y}
                x2={TRAPS[idx].x} y2={TRAPS[idx].y}
                stroke={verse.palette.accent}
                strokeWidth={0.5}
                initial={{ opacity: 0 }}
                animate={{ opacity: safeOpacity(0.15) }}
              />
            );
          })}

          {/* Trap nodes */}
          {TRAPS.map((trap, i) => {
            const snapped = isSnapped(i);
            const isSelected = selectedTrap === i;
            const isLead = i === LEAD_DOMINO;

            return (
              <motion.g
                key={trap.label}
                style={{ cursor: triggered ? 'default' : 'pointer' }}
                onClick={() => handleSelectTrap(i)}
              >
                {/* Trap base */}
                <motion.rect
                  x={trap.x - 12} y={trap.y - 8}
                  width={24} height={16} rx={3}
                  fill={snapped ? verse.palette.accent : verse.palette.primary}
                  animate={{
                    opacity: safeOpacity(snapped ? 0.25 : isSelected ? 0.15 : 0.06),
                    scale: snapped ? [1, 1.15, 1] : 1,
                  }}
                  transition={snapped ? { duration: 0.2 } : {}}
                />

                {/* Selection ring */}
                {isSelected && !triggered && (
                  <motion.rect
                    x={trap.x - 15} y={trap.y - 11}
                    width={30} height={22} rx={5}
                    fill="none"
                    stroke={isLead ? verse.palette.accent : verse.palette.shadow}
                    strokeWidth={1}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: safeOpacity(0.4) }}
                  />
                )}

                {/* Snap burst */}
                {snapped && (
                  <motion.circle
                    cx={trap.x} cy={trap.y}
                    fill={verse.palette.accent}
                    initial={{ r: 3, opacity: 0.4 }}
                    animate={{ r: 18, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                )}

                {/* Label */}
                <text x={trap.x} y={trap.y + 24} textAnchor="middle"
                  fill={snapped ? verse.palette.accent : verse.palette.textFaint}
                  style={navicueType.micro}>
                  {trap.label}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>

      {/* Counter */}
      {triggered && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>cascade</span>
          <span style={{ ...navicueType.data, color: verse.palette.accent }}>
            {snappedCount}/{TRAPS.length}
          </span>
        </div>
      )}

      {/* Trigger button */}
      {selectedTrap >= 0 && !triggered && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            ...btn.base,
            opacity: selectedTrap === LEAD_DOMINO ? 1 : 0.4,
          }}
          whileTap={selectedTrap === LEAD_DOMINO ? btn.active : {}}
          onClick={handleTrigger}
        >
          {selectedTrap === LEAD_DOMINO
            ? `trigger "${TRAPS[LEAD_DOMINO].label}"`
            : 'not the lead domino'}
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'one trigger. twelve reactions.'
          : triggered
            ? 'cascading...'
            : selectedTrap >= 0
              ? selectedTrap === LEAD_DOMINO
                ? 'this is the one'
                : 'find the keystone habit'
              : 'which one triggers the rest?'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          systems leverage
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'leverage' : 'find the first domino'}
      </div>
    </div>
  );
}
