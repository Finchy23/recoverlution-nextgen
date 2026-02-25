/**
 * GAME DESIGNER #7 -- 1397. The Save Point
 * "Capture your state. If you fail, you don't start from zero."
 * INTERACTION: "Danger ahead." Save (journal). Enter. Fail. Reload from save.
 * STEALTH KBE: Reflection -- Learning Retention (K)
 *
 * COMPOSITOR: poetic_precision / Arc / work / knowing / tap / 1397
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function GameDesigner_SavePoint({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Arc',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1397,
        isSeal: false,
      }}
      arrivalText="Danger ahead."
      prompt="Capture your state. If you fail, you do not start from zero. You start from the lesson. Save your progress."
      resonantText="Reflection. You saved before the danger and when you failed, you reloaded from the lesson. Learning retention: journaling is the save point. Every reflection is a checkpoint you can return to."
      afterglowCoda="Save your progress."
      onComplete={onComplete}
    >
      {(verse) => <SavePointInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SavePointInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'danger' | 'saved' | 'entering' | 'failed' | 'reloaded'>('danger');

  const handleSave = () => {
    if (phase !== 'danger') return;
    setPhase('saved');
  };

  const handleEnter = () => {
    if (phase !== 'saved') return;
    setPhase('entering');
    setTimeout(() => setPhase('failed'), 1200);
  };

  const handleReload = () => {
    if (phase !== 'failed') return;
    setPhase('reloaded');
    setTimeout(() => verse.advance(), 3000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 150;
  const CX = W / 2;

  // Save crystal
  const CRYSTAL_X = CX - 50, CRYSTAL_Y = 55;
  // Danger zone
  const DANGER_X = CX + 30;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>checkpoint</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'reloaded' ? verse.palette.accent
            : phase === 'failed' ? verse.palette.shadow : verse.palette.text,
          fontFamily: 'monospace',
        }}>
          {phase === 'reloaded' ? 'reloaded (lesson kept)'
            : phase === 'failed' ? 'failed. reload?'
              : phase === 'saved' ? 'saved'
                : 'unsaved'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Save point crystal */}
          <motion.g>
            <path
              d={`M ${CRYSTAL_X},${CRYSTAL_Y - 15} L ${CRYSTAL_X + 10},${CRYSTAL_Y} L ${CRYSTAL_X},${CRYSTAL_Y + 15} L ${CRYSTAL_X - 10},${CRYSTAL_Y} Z`}
              fill={phase !== 'danger' ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(phase !== 'danger' ? 0.15 : 0.06)} />
            <path
              d={`M ${CRYSTAL_X},${CRYSTAL_Y - 15} L ${CRYSTAL_X + 10},${CRYSTAL_Y} L ${CRYSTAL_X},${CRYSTAL_Y + 15} L ${CRYSTAL_X - 10},${CRYSTAL_Y} Z`}
              fill="none"
              stroke={phase !== 'danger' ? verse.palette.accent : verse.palette.primary}
              strokeWidth={1}
              opacity={safeOpacity(phase !== 'danger' ? 0.3 : 0.12)} />
            {/* Glow */}
            {phase !== 'danger' && (
              <motion.circle
                cx={CRYSTAL_X} cy={CRYSTAL_Y} r={18}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.5}
                animate={{ opacity: [safeOpacity(0.05), safeOpacity(0.15), safeOpacity(0.05)] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            )}
            <text x={CRYSTAL_X} y={CRYSTAL_Y + 28} textAnchor="middle"
              fill={phase !== 'danger' ? verse.palette.accent : verse.palette.textFaint}
              style={{ fontSize: '7px' }}
              opacity={phase !== 'danger' ? 0.4 : 0.15}>
              save point
            </text>
          </motion.g>

          {/* Danger zone */}
          <rect x={DANGER_X - 30} y={30} width={60} height={60} rx={4}
            fill={verse.palette.shadow}
            opacity={safeOpacity(phase === 'failed' ? 0.06 : 0.03)} />
          <rect x={DANGER_X - 30} y={30} width={60} height={60} rx={4}
            fill="none" stroke={verse.palette.shadow}
            strokeWidth={0.5} opacity={safeOpacity(0.08)} />
          <text x={DANGER_X} y={25} textAnchor="middle"
            fill={verse.palette.shadow} style={{ fontSize: '7px' }} opacity={0.18}>
            danger zone
          </text>

          {/* "FAIL" in danger zone */}
          {phase === 'failed' && (
            <motion.text x={DANGER_X} y={65} textAnchor="middle"
              fill={verse.palette.shadow}
              style={{ fontSize: '12px', fontFamily: 'monospace' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}>
              FAIL
            </motion.text>
          )}

          {/* Player position */}
          {(() => {
            const px = phase === 'entering' || phase === 'failed' ? DANGER_X
              : phase === 'reloaded' ? CRYSTAL_X + 20
                : CRYSTAL_X - 20;
            const py = phase === 'entering' || phase === 'failed' ? 60 : CRYSTAL_Y;
            return (
              <motion.circle
                r={6}
                fill={phase === 'reloaded' ? verse.palette.accent
                  : phase === 'failed' ? verse.palette.shadow : verse.palette.primary}
                animate={{
                  cx: px, cy: py,
                  opacity: safeOpacity(phase === 'reloaded' ? 0.2 : 0.1),
                }}
                transition={{ duration: 0.4 }}
              />
            );
          })()}

          {/* Reload arrow (from danger back to save) */}
          {phase === 'reloaded' && (
            <motion.path
              d={`M ${DANGER_X},${60} Q ${CX},${100} ${CRYSTAL_X + 20},${CRYSTAL_Y}`}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={1} strokeDasharray="4 3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: safeOpacity(0.2) }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Lesson retained indicator */}
          {phase === 'reloaded' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <text x={CX} y={115} textAnchor="middle"
                fill={verse.palette.accent} style={{ fontSize: '8px', fontFamily: 'monospace' }}
                opacity={0.3}>
                lesson_retained = true
              </text>
              <text x={CX} y={H - 5} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.micro}
                opacity={0.5}>
                you start from the lesson, not from zero
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      {phase === 'danger' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleSave}>
          save game (journal)
        </motion.button>
      )}

      {phase === 'saved' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleEnter}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          enter danger zone
        </motion.button>
      )}

      {phase === 'failed' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleReload}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          reload from save
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'reloaded' ? 'failure mitigated. the lesson is the checkpoint.'
          : phase === 'failed' ? 'you failed. but you saved.'
            : phase === 'entering' ? 'entering danger...'
              : phase === 'saved' ? 'state captured. safe to proceed.'
                : 'danger ahead. save first.'}
      </span>

      {phase === 'reloaded' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          learning retention
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'reloaded' ? 'reflection' : 'save your progress'}
      </div>
    </div>
  );
}
