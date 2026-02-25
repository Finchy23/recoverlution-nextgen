/**
 * FULCRUM #3 -- 1203. The Pulley System (Distribution)
 * "Pull the rope, don't carry the rock."
 * INTERACTION: Tap to add pulleys (ropes), watch load lighten progressively
 * STEALTH KBE: Delegation -- Systemic Thinking (K)
 *
 * COMPOSITOR: science_x_soul / Lattice / work / knowing / tap / 1203
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const STAGES = [
  { ropes: 1, label: 'you alone', load: 100, color: 'shadow' },
  { ropes: 2, label: 'you + system', load: 50, color: 'primary' },
  { ropes: 4, label: 'you + system + team', load: 25, color: 'accent' },
] as const;

export default function Fulcrum_PulleySystem({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Lattice',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1203,
        isSeal: false,
      }}
      arrivalText="A weight. A single rope."
      prompt="You are carrying 100% of the load. Rig the pulley. Let the system carry 50%. Let the team carry 25%. Pull the rope, do not carry the rock."
      resonantText="Delegation. The weight did not change. The distribution did. Systemic thinking is not about doing less. It is about engineering the load path."
      afterglowCoda="Pull the rope."
      onComplete={onComplete}
    >
      {(verse) => <PulleyInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function PulleyInteraction({ verse }: { verse: any }) {
  const [stageIdx, setStageIdx] = useState(0);
  const [done, setDone] = useState(false);

  const stage = STAGES[stageIdx];
  const btn = immersiveTapButton(verse.palette, stageIdx === STAGES.length - 1 ? 'accent' : 'primary');

  const addPulley = () => {
    if (done) return;
    if (stageIdx < STAGES.length - 1) {
      setStageIdx(prev => prev + 1);
    } else {
      setDone(true);
      setTimeout(() => verse.advance(), 2500);
    }
  };

  const SCENE_W = 220;
  const SCENE_H = 160;
  const weightY = 120 - (STAGES.length - 1 - stageIdx) * 20;

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Pulley visualization */}
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Ceiling beam */}
          <line
            x1={30} y1={15} x2={SCENE_W - 30} y2={15}
            stroke={verse.palette.primary}
            strokeWidth={1}
            opacity={safeOpacity(0.15)}
          />

          {/* Ropes */}
          {Array.from({ length: stage.ropes }).map((_, i) => {
            const x = 50 + i * ((SCENE_W - 100) / Math.max(1, stage.ropes - 1));
            const pulleyR = 8;
            return (
              <g key={i}>
                {/* Pulley wheel */}
                <motion.circle
                  cx={x} cy={25}
                  r={pulleyR}
                  fill="none"
                  stroke={verse.palette.accent}
                  strokeWidth={1}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: safeOpacity(0.4), scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                />
                {/* Rope line */}
                <motion.line
                  x1={x} y1={25 + pulleyR}
                  x2={SCENE_W / 2} y2={weightY - 10}
                  stroke={verse.palette.primary}
                  strokeWidth={0.8}
                  strokeDasharray="3 3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: safeOpacity(0.2 + i * 0.05) }}
                  transition={{ duration: 0.3, delay: i * 0.15 }}
                />
              </g>
            );
          })}

          {/* Weight block */}
          <motion.rect
            x={SCENE_W / 2 - 20}
            y={weightY - 10}
            width={40}
            height={30}
            rx={4}
            fill={verse.palette.primary}
            animate={{
              opacity: safeOpacity(0.15 + (1 - stage.load / 100) * 0.2),
              y: done ? weightY - 40 : weightY - 10,
            }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Load percentage */}
          <motion.text
            x={SCENE_W / 2}
            y={weightY + 8}
            textAnchor="middle"
            fill={verse.palette.textFaint}
            style={navicueType.data}
            animate={{ opacity: safeOpacity(0.5) }}
          >
            {stage.load}%
          </motion.text>
        </svg>
      </div>

      {/* Stage label */}
      <AnimatePresence mode="wait">
        <motion.span
          key={stageIdx}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 0.7, y: 0 }}
          exit={{ opacity: 0 }}
          style={{ ...navicueType.hint, color: verse.palette.text }}
        >
          {stage.label}
        </motion.span>
      </AnimatePresence>

      {/* Action button */}
      {!done && (
        <motion.button
          style={btn.base}
          whileTap={btn.active}
          onClick={addPulley}
        >
          {stageIdx === 0 ? 'add system' : stageIdx === 1 ? 'add team' : 'release'}
        </motion.button>
      )}

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          weightless
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'delegation' : 'add pulleys'}
      </div>
    </div>
  );
}
