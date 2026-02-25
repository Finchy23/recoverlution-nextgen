/**
 * SCOUT #6 -- 1276. The Sample (Testing)
 * "Taste the future. Low risk, high data."
 * INTERACTION: Tap to micro-test, wait, then eat
 * STEALTH KBE: Experimentation -- Iterative Design (K)
 *
 * COMPOSITOR: sacred_ordinary / Pulse / work / knowing / tap / 1276
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

export default function Scout_Sample({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Pulse',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1276,
        isSeal: false,
      }}
      arrivalText="Strange fruit. Safe?"
      prompt="Do not bet the farm. Run a test. Taste the future. Low risk, high data. If it does not kill you, it feeds you."
      resonantText="Experimentation. You tasted before you committed. Iterative design is the science of small bets. The micro-test cost nothing and taught everything."
      afterglowCoda="Taste the future."
      onComplete={onComplete}
    >
      {(verse) => <SampleInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SampleInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'unknown' | 'tasting' | 'waiting' | 'safe' | 'done'>('unknown');
  const [waitTimer, setWaitTimer] = useState(0);

  const handleTaste = () => {
    if (phase !== 'unknown') return;
    setPhase('tasting');
    setTimeout(() => setPhase('waiting'), 800);
  };

  // Wait timer
  useEffect(() => {
    if (phase !== 'waiting') return;
    const interval = setInterval(() => {
      setWaitTimer(prev => {
        if (prev >= 3) {
          clearInterval(interval);
          setPhase('safe');
          setTimeout(() => {
            setPhase('done');
            setTimeout(() => verse.advance(), 2500);
          }, 1200);
          return 3;
        }
        return prev + 1;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [phase, verse]);

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 160;
  const CX = W / 2, CY = 70;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Status readout */}
      <div style={{
        display: 'flex', gap: 8, alignItems: 'center',
        padding: '4px 12px', borderRadius: 12,
        border: `1px solid ${phase === 'safe' || phase === 'done' ? verse.palette.accent + '25' : verse.palette.primary + '15'}`,
      }}>
        <motion.div style={{
          width: 6, height: 6, borderRadius: 3,
          backgroundColor:
            phase === 'safe' || phase === 'done' ? verse.palette.accent
              : phase === 'waiting' ? verse.palette.text
                : verse.palette.textFaint,
        }} animate={{
          opacity: phase === 'waiting' ? [0.3, 0.7, 0.3] : 0.5,
        }} transition={phase === 'waiting' ? { repeat: Infinity, duration: 0.8 } : {}} />
        <span style={{
          ...navicueType.micro,
          color: phase === 'safe' || phase === 'done' ? verse.palette.accent : verse.palette.textFaint,
        }}>
          {phase === 'unknown' ? 'unknown'
            : phase === 'tasting' ? 'sampling...'
              : phase === 'waiting' ? `testing... ${waitTimer}/3`
                : 'safe'}
        </span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Fruit shape */}
          <motion.g>
            <motion.ellipse
              cx={CX} cy={CY} rx={25} ry={22}
              fill={
                phase === 'safe' || phase === 'done' ? verse.palette.accent
                  : verse.palette.primary
              }
              animate={{
                opacity: safeOpacity(
                  phase === 'safe' || phase === 'done' ? 0.15 : 0.08
                ),
              }}
            />
            <ellipse cx={CX} cy={CY} rx={25} ry={22}
              fill="none"
              stroke={
                phase === 'safe' || phase === 'done' ? verse.palette.accent
                  : verse.palette.primary
              }
              strokeWidth={0.8}
              opacity={safeOpacity(0.25)} />

            {/* Stem */}
            <path d={`M ${CX},${CY - 22} Q ${CX + 5},${CY - 32} ${CX + 2},${CY - 35}`}
              fill="none"
              stroke={phase === 'safe' || phase === 'done' ? verse.palette.accent : verse.palette.primary}
              strokeWidth={1} opacity={safeOpacity(0.2)} />

            {/* Leaf */}
            <path d={`M ${CX + 2},${CY - 33} Q ${CX + 12},${CY - 38} ${CX + 8},${CY - 28}`}
              fill={phase === 'safe' || phase === 'done' ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(0.12)} />

            {/* Bite mark (after tasting) */}
            {(phase !== 'unknown') && (
              <motion.path
                d={`M ${CX + 18},${CY - 8} Q ${CX + 22},${CY} ${CX + 18},${CY + 8}`}
                fill={verse.palette.bg}
                stroke={verse.palette.accent}
                strokeWidth={0.5}
                initial={{ opacity: 0 }}
                animate={{ opacity: safeOpacity(0.4) }}
              />
            )}

            {/* Question mark (unknown) */}
            {phase === 'unknown' && (
              <motion.text
                x={CX} y={CY + 5}
                textAnchor="middle"
                fill={verse.palette.textFaint}
                style={navicueType.choice}
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                ?
              </motion.text>
            )}

            {/* Check mark (safe) */}
            {(phase === 'safe' || phase === 'done') && (
              <motion.path
                d={`M ${CX - 6},${CY + 2} L ${CX - 1},${CY + 7} L ${CX + 8},${CY - 5}`}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={1.5} strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: safeOpacity(0.5) }}
                transition={{ duration: 0.4 }}
              />
            )}
          </motion.g>

          {/* Data readout bar */}
          <rect x={CX - 60} y={H - 40} width={120} height={4} rx={2}
            fill={verse.palette.primary} opacity={safeOpacity(0.06)} />
          <motion.rect
            x={CX - 60} y={H - 40} height={4} rx={2}
            fill={verse.palette.accent}
            animate={{
              width: phase === 'unknown' ? 0
                : phase === 'tasting' ? 20
                  : phase === 'waiting' ? 40 + waitTimer * 25
                    : 120,
              opacity: safeOpacity(0.3),
            }}
            transition={{ duration: 0.4 }}
          />

          {/* Data labels */}
          <text x={CX - 60} y={H - 25}
            fill={verse.palette.textFaint} style={navicueType.micro} opacity={0.3}>
            data: 0
          </text>
          <motion.text
            x={CX + 60} y={H - 25}
            textAnchor="end"
            fill={verse.palette.accent} style={navicueType.micro}
            animate={{ opacity: phase === 'done' ? 0.5 : 0.3 }}
          >
            data: {phase === 'done' || phase === 'safe' ? 'complete' : `${waitTimer}/3`}
          </motion.text>
        </svg>
      </div>

      {phase === 'unknown' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleTaste}>
          micro-test
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'low risk, high data'
          : phase === 'safe' ? 'safe. eat.'
            : phase === 'waiting' ? 'gathering data...'
              : phase === 'tasting' ? 'tasting...'
                : 'do not bet the farm. test first.'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          iterative design
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'experimentation' : 'run the test'}
      </div>
    </div>
  );
}
