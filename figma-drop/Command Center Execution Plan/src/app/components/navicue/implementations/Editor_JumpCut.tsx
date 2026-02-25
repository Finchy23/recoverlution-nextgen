/**
 * EDITOR #1 -- 1251. The Jump Cut (Transition)
 * "Cut to the chase."
 * INTERACTION: Tap to jump cut from boring waiting scene to action
 * STEALTH KBE: Focus -- State Management (E)
 *
 * COMPOSITOR: sensory_cinema / Arc / work / embodying / tap / 1251
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

export default function Editor_JumpCut({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Arc',
        chrono: 'work',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1251,
        isSeal: false,
      }}
      arrivalText="Scene: Waiting. Nothing happens."
      prompt="You do not have to live the boring parts in real time. Fast forward. Use the wait to visualize the work. Cut to the chase."
      resonantText="Focus. You skipped the dead air and landed in the action. State management is knowing which scenes deserve your attention and which deserve a jump cut. Not every moment earns real time."
      afterglowCoda="Cut to the chase."
      onComplete={onComplete}
    >
      {(verse) => <JumpCutInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function JumpCutInteraction({ verse }: { verse: any }) {
  const [scene, setScene] = useState<'waiting' | 'cutting' | 'action' | 'done'>('waiting');
  const [elapsed, setElapsed] = useState(0);

  // Boring clock ticking
  useEffect(() => {
    if (scene !== 'waiting') return;
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, [scene]);

  const handleCut = () => {
    if (scene !== 'waiting') return;
    setScene('cutting');
    setTimeout(() => setScene('action'), 300);
    setTimeout(() => {
      setScene('done');
      setTimeout(() => verse.advance(), 2800);
    }, 2500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const SCENE_W = 280;
  const SCENE_H = 100;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Timeline bar */}
      <div style={{
        display: 'flex', gap: 4, alignItems: 'center',
        width: SCENE_W, height: 24,
      }}>
        {Array.from({ length: 20 }).map((_, i) => {
          const isWaiting = i < 14;
          const isCut = scene === 'action' || scene === 'done';
          return (
            <motion.div
              key={i}
              style={{
                flex: 1,
                height: isWaiting ? 8 : 16,
                borderRadius: 2,
                backgroundColor: isWaiting
                  ? verse.palette.primary
                  : verse.palette.accent,
              }}
              animate={{
                opacity: safeOpacity(
                  isCut && isWaiting ? 0.03 : isWaiting ? 0.08 : 0.2
                ),
                height: isCut && isWaiting ? 2 : isWaiting ? 8 : 16,
              }}
              transition={{ duration: 0.3, delay: isCut ? i * 0.02 : 0 }}
            />
          );
        })}
      </div>

      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          <AnimatePresence mode="wait">
            {/* WAITING scene */}
            {(scene === 'waiting') && (
              <motion.g key="wait" exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {/* Clock */}
                <circle cx={SCENE_W / 2} cy={45} r={25}
                  fill="none" stroke={verse.palette.primary}
                  strokeWidth={0.5} opacity={safeOpacity(0.2)} />
                <motion.line
                  x1={SCENE_W / 2} y1={45}
                  x2={SCENE_W / 2} y2={25}
                  stroke={verse.palette.primary}
                  strokeWidth={1}
                  opacity={safeOpacity(0.2)}
                  animate={{ rotate: elapsed * 6 }}
                  style={{ transformOrigin: `${SCENE_W / 2}px 45px` }}
                />
                <motion.line
                  x1={SCENE_W / 2} y1={45}
                  x2={SCENE_W / 2 + 12} y2={45}
                  stroke={verse.palette.primary}
                  strokeWidth={1.5}
                  opacity={safeOpacity(0.15)}
                  animate={{ rotate: elapsed * 0.5 }}
                  style={{ transformOrigin: `${SCENE_W / 2}px 45px` }}
                />

                {/* Dots (boredom) */}
                <motion.text
                  x={SCENE_W / 2} y={88}
                  textAnchor="middle"
                  fill={verse.palette.textFaint}
                  style={navicueType.micro}
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  waiting...
                </motion.text>
              </motion.g>
            )}

            {/* CUTTING flash */}
            {scene === 'cutting' && (
              <motion.g key="cut">
                <motion.rect
                  x={0} y={0} width={SCENE_W} height={SCENE_H}
                  fill={verse.palette.bg}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.g>
            )}

            {/* ACTION scene */}
            {(scene === 'action' || scene === 'done') && (
              <motion.g key="action"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Energy lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <motion.line
                    key={i}
                    x1={40 + i * 45} y1={20}
                    x2={50 + i * 45} y2={80}
                    stroke={verse.palette.accent}
                    strokeWidth={2}
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: safeOpacity(0.15 + i * 0.05) }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                  />
                ))}

                {/* Progress bar filling */}
                <rect x={40} y={55} width={200} height={6} rx={3}
                  fill={verse.palette.primary} opacity={safeOpacity(0.06)} />
                <motion.rect
                  x={40} y={55} height={6} rx={3}
                  fill={verse.palette.accent}
                  initial={{ width: 0 }}
                  animate={{ width: 200, opacity: safeOpacity(0.3) }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                />

                <motion.text
                  x={SCENE_W / 2} y={88}
                  textAnchor="middle"
                  fill={verse.palette.accent}
                  style={navicueType.micro}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 0.3 }}
                >
                  working
                </motion.text>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      </div>

      {/* Jump Cut button */}
      {scene === 'waiting' && (
        <motion.button
          style={btn.base}
          whileTap={btn.active}
          onClick={handleCut}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          jump cut
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {scene === 'done'
          ? 'you skipped the dead air'
          : scene === 'action'
            ? 'in the scene that matters'
            : `${elapsed}s of nothing. skip it.`}
      </span>

      {scene === 'done' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          state management
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {scene === 'done' ? 'focus' : 'cut to the chase'}
      </div>
    </div>
  );
}
