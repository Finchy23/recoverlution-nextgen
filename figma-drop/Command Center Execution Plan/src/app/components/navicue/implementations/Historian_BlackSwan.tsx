/**
 * HISTORIAN #3 -- 1383. The Black Swan (The Crash)
 * "Stability breeds instability. Build the ark in the sun."
 * INTERACTION: 100 years of peace. Crash. War. Prepare during peace to survive.
 * STEALTH KBE: Risk Awareness -- Historical Literacy (K)
 *
 * COMPOSITOR: pattern_glitch / Pulse / work / knowing / tap / 1383
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

export default function Historian_BlackSwan({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Pulse',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1383,
        isSeal: false,
      }}
      arrivalText="100 years of peace."
      prompt="Stability breeds instability. The longer it is quiet, the closer the storm. Do not be lulled. Build the ark in the sun."
      resonantText="Risk awareness. You prepared during the peace and survived the crash. Historical literacy: the black swan always comes. The question is not if, but when. The wise build the ark while the sun shines."
      afterglowCoda="Build the ark in the sun."
      onComplete={onComplete}
    >
      {(verse) => <BlackSwanInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function BlackSwanInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'peace' | 'building' | 'built' | 'crash' | 'survived'>('peace');
  const [years, setYears] = useState(0);

  // Peace counter
  useEffect(() => {
    if (phase !== 'peace' && phase !== 'building') return;
    const iv = setInterval(() => {
      setYears(y => {
        if (y >= 100) return 100;
        return y + 5;
      });
    }, 80);
    return () => clearInterval(iv);
  }, [phase]);

  const handleBuild = () => {
    if (phase !== 'peace') return;
    setPhase('building');
    setTimeout(() => {
      setPhase('built');
      setTimeout(() => {
        setPhase('crash');
        setTimeout(() => {
          setPhase('survived');
          setTimeout(() => verse.advance(), 3000);
        }, 1500);
      }, 1500);
    }, 1000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 230, H = 150;
  const CX = W / 2;

  // Stability line
  const LINE_Y = 70, LINE_X1 = 25, LINE_X2 = W - 25;
  const progress = Math.min(years / 100, 1);
  const lineEnd = LINE_X1 + (LINE_X2 - LINE_X1) * progress;

  const crashed = phase === 'crash' || phase === 'survived';

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>stability</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'survived' ? verse.palette.accent
            : crashed ? verse.palette.shadow : verse.palette.text,
        }}>
          {phase === 'survived' ? 'survived'
            : phase === 'crash' ? 'crash'
              : phase === 'built' ? 'ark ready. waiting...'
                : phase === 'building' ? 'building ark...'
                  : `${years} years of peace`}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Stability line (flat then drops) */}
          <line x1={LINE_X1} y1={LINE_Y} x2={LINE_X2} y2={LINE_Y}
            stroke={verse.palette.primary} strokeWidth={0.3}
            opacity={safeOpacity(0.06)} />

          {/* Peace line (growing) */}
          <motion.line
            x1={LINE_X1} y1={LINE_Y}
            y2={LINE_Y}
            stroke={verse.palette.primary} strokeWidth={1.5}
            animate={{
              x2: lineEnd,
              opacity: safeOpacity(crashed ? 0.05 : 0.12),
            }}
          />

          {/* Crash drop */}
          {crashed && (
            <motion.path
              d={`M ${LINE_X2 - 20},${LINE_Y} L ${LINE_X2},${LINE_Y + 50}`}
              fill="none" stroke={verse.palette.shadow}
              strokeWidth={2} strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: safeOpacity(0.3) }}
              transition={{ duration: 0.4 }}
            />
          )}

          {/* Crash label */}
          {crashed && (
            <motion.text x={LINE_X2 - 5} y={LINE_Y + 60} textAnchor="end"
              fill={verse.palette.shadow} style={{ fontSize: '8px' }}
              initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}>
              crash
            </motion.text>
          )}

          {/* "Peace is forever" illusion text */}
          {!crashed && years > 50 && (
            <motion.text x={CX} y={LINE_Y - 10} textAnchor="middle"
              fill={verse.palette.textFaint} style={{ fontSize: '8px' }}
              animate={{ opacity: [0.08, 0.15, 0.08] }}
              transition={{ repeat: Infinity, duration: 2 }}>
              "peace is forever"
            </motion.text>
          )}

          {/* Ark (bottom left, built during peace) */}
          {(phase === 'building' || phase === 'built' || crashed) && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Hull */}
              <path
                d={`M ${40},${H - 25} Q ${65},${H - 10} ${90},${H - 25}`}
                fill={phase === 'survived' ? verse.palette.accent : verse.palette.primary}
                opacity={safeOpacity(phase === 'survived' ? 0.15 : 0.08)} />
              <path
                d={`M ${40},${H - 25} Q ${65},${H - 10} ${90},${H - 25}`}
                fill="none"
                stroke={phase === 'survived' ? verse.palette.accent : verse.palette.primary}
                strokeWidth={1.5}
                opacity={safeOpacity(phase === 'survived' ? 0.3 : 0.15)} />
              {/* Cabin */}
              <rect x={55} y={H - 38} width={20} height={13} rx={2}
                fill={verse.palette.primary} opacity={safeOpacity(0.06)} />
              {/* Mast */}
              <line x1={65} y1={H - 38} x2={65} y2={H - 52}
                stroke={verse.palette.primary} strokeWidth={1}
                opacity={safeOpacity(0.1)} />

              <text x={65} y={H - 55} textAnchor="middle"
                fill={phase === 'survived' ? verse.palette.accent : verse.palette.textFaint}
                style={{ fontSize: '7px' }}
                opacity={phase === 'survived' ? 0.4 : 0.15}>
                the ark
              </text>
            </motion.g>
          )}

          {/* Flood waters (crash) */}
          {crashed && (
            <motion.rect
              x={0} y={H - 18} width={W} height={18} rx={0}
              fill={verse.palette.shadow}
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.04) }}
            />
          )}

          {/* Survived */}
          {phase === 'survived' && (
            <motion.text x={CX} y={H - 5} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}>
              the ark held. you prepared.
            </motion.text>
          )}

          {/* Year markers on timeline */}
          {[0, 25, 50, 75, 100].map(y => {
            const x = LINE_X1 + (LINE_X2 - LINE_X1) * (y / 100);
            return (
              <g key={y}>
                <line x1={x} y1={LINE_Y - 3} x2={x} y2={LINE_Y + 3}
                  stroke={verse.palette.primary} strokeWidth={0.5}
                  opacity={safeOpacity(0.06)} />
                <text x={x} y={LINE_Y + 12} textAnchor="middle"
                  fill={verse.palette.textFaint} style={{ fontSize: '6px' }} opacity={0.1}>
                  {y}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {phase === 'peace' && years > 30 && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleBuild}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          build the ark
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'survived' ? 'the swan came. the ark held.'
          : phase === 'crash' ? 'the crash. everything falls.'
            : phase === 'built' ? 'ark ready. the peace continues... for now.'
              : phase === 'building' ? 'building while the sun shines...'
                : years > 50 ? 'the longer the peace, the closer the storm.'
                  : 'peace. stability. comfort.'}
      </span>

      {phase === 'survived' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          historical literacy
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'survived' ? 'risk awareness' : 'stability breeds instability'}
      </div>
    </div>
  );
}
