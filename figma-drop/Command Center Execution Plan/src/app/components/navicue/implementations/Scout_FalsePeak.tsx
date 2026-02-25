/**
 * SCOUT #8 -- 1278. The False Peak
 * "The false peak was necessary to see the real one."
 * INTERACTION: Tap to keep climbing after the false summit reveals a higher peak
 * STEALTH KBE: Resilience -- Grit (B)
 *
 * COMPOSITOR: sensory_cinema / Arc / work / believing / tap / 1278
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

export default function Scout_FalsePeak({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Arc',
        chrono: 'work',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1278,
        isSeal: false,
      }}
      arrivalText="Almost there. The top."
      prompt="Disappointment is heavy. Drop it. The false peak was necessary to see the real one. You are higher than you were."
      resonantText="Resilience. You reached the false peak and kept climbing without pause. Grit is not the absence of disappointment. It is continuing the ascent with disappointment as extra weight."
      afterglowCoda="Keep going."
      onComplete={onComplete}
    >
      {(verse) => <FalsePeakInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FalsePeakInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'climbing' | 'false' | 'continue' | 'done'>('climbing');

  const handleClimb = () => {
    if (phase !== 'climbing') return;
    setPhase('false');
  };

  const handleContinue = () => {
    if (phase !== 'false') return;
    setPhase('continue');
    setTimeout(() => {
      setPhase('done');
      setTimeout(() => verse.advance(), 3000);
    }, 1500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 280, H = 180;

  const falsePeakY = 70;
  const realPeakY = 30;
  const climberX = phase === 'done' ? 220 : phase === 'continue' ? 180 : phase === 'false' ? 150 : 80;
  const climberY = phase === 'done' ? realPeakY + 5 : phase === 'continue' ? 55 : phase === 'false' ? falsePeakY + 5 : 120;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>altitude</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'done' ? verse.palette.accent : verse.palette.text,
        }}>
          {phase === 'climbing' ? 'ascending'
            : phase === 'false' ? 'false summit'
              : phase === 'done' ? 'true summit'
                : 'climbing...'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Mountain silhouette */}
          <path
            d={`M 0,${H} L 30,${H - 30} L 80,120 L 150,${falsePeakY} L 170,${falsePeakY + 15} L 190,55 L 220,${realPeakY} L 250,80 L ${W},${H - 20} L ${W},${H} Z`}
            fill={verse.palette.primary}
            opacity={safeOpacity(0.06)}
          />
          <path
            d={`M 0,${H} L 30,${H - 30} L 80,120 L 150,${falsePeakY} L 170,${falsePeakY + 15} L 190,55 L 220,${realPeakY} L 250,80 L ${W},${H - 20}`}
            fill="none"
            stroke={verse.palette.primary}
            strokeWidth={1}
            opacity={safeOpacity(0.15)} />

          {/* False peak marker */}
          <motion.g animate={{
            opacity: phase === 'false' || phase === 'climbing' ? 0.5 : 0.2,
          }}>
            <circle cx={150} cy={falsePeakY - 8} r={2}
              fill={phase === 'false' ? verse.palette.shadow : verse.palette.textFaint} />
            <text x={150} y={falsePeakY - 15} textAnchor="middle"
              fill={phase === 'false' ? verse.palette.shadow : verse.palette.textFaint}
              style={navicueType.micro}>
              {phase === 'false' ? 'false peak' : 'top?'}
            </text>
          </motion.g>

          {/* Real peak marker */}
          {(phase === 'false' || phase === 'continue' || phase === 'done') && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: phase === 'false' ? 0.5 : 0 }}
            >
              <circle cx={220} cy={realPeakY - 8} r={2}
                fill={verse.palette.accent} />
              <text x={220} y={realPeakY - 15} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.micro}>
                real peak
              </text>
            </motion.g>
          )}

          {/* Climber dot */}
          <motion.circle
            r={5}
            fill={verse.palette.accent}
            animate={{
              cx: climberX,
              cy: climberY,
              opacity: safeOpacity(0.4),
            }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Trail */}
          <motion.path
            fill="none" stroke={verse.palette.accent}
            strokeWidth={1} strokeDasharray="3 3"
            animate={{
              d: `M 80,120 L ${phase === 'climbing' ? climberX : 150},${phase === 'climbing' ? climberY : falsePeakY + 5}${phase === 'continue' || phase === 'done' ? ` L ${climberX},${climberY}` : ''}`,
              opacity: safeOpacity(0.2),
            }}
            transition={{ duration: 1 }}
          />

          {/* Height comparison */}
          {phase === 'done' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.2) }}
              transition={{ delay: 0.5 }}
            >
              <line x1={15} y1={120} x2={15} y2={realPeakY + 5}
                stroke={verse.palette.accent} strokeWidth={0.5}
                strokeDasharray="2 2" />
              <text x={20} y={(120 + realPeakY) / 2 + 4}
                fill={verse.palette.accent} style={navicueType.micro} opacity={0.4}>
                higher than you were
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      {phase === 'climbing' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleClimb}>
          reach the top
        </motion.button>
      )}

      {phase === 'false' && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={btn.base}
          whileTap={btn.active}
          onClick={handleContinue}
        >
          keep going
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'done' ? 'the false peak showed you the real one'
          : phase === 'false' ? 'there is a higher peak. keep climbing.'
            : phase === 'continue' ? 'climbing...'
              : 'almost there'}
      </span>

      {phase === 'done' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          grit
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'done' ? 'resilience' : 'keep climbing'}
      </div>
    </div>
  );
}
