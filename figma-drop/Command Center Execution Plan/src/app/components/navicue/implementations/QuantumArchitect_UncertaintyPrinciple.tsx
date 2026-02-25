/**
 * QUANTUM ARCHITECT #8 -- 1238. The Uncertainty Principle
 * "You cannot know everything. Choose."
 * INTERACTION: Toggle between measuring Speed and Position -- one always blurs when the other sharpens
 * STEALTH KBE: Trade-off Analysis -- Agility (K)
 *
 * COMPOSITOR: science_x_soul / Circuit / work / knowing / tap / 1238
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

export default function QuantumArchitect_UncertaintyPrinciple({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Circuit',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1238,
        isSeal: false,
      }}
      arrivalText="A particle. Moving fast."
      prompt="You cannot know everything. If you want speed, you lose precision. If you want certainty, you lose momentum. Choose."
      resonantText="Trade-off analysis. You chose momentum over certainty. Agility is the willingness to move without a complete map. You traded the comfort of knowing where you are for the power of knowing how fast you are going."
      afterglowCoda="Choose."
      onComplete={onComplete}
    >
      {(verse) => <UncertaintyInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function UncertaintyInteraction({ verse }: { verse: any }) {
  const [measuring, setMeasuring] = useState<'none' | 'speed' | 'position'>('none');
  const [committed, setCommitted] = useState(false);
  const [done, setDone] = useState(false);

  const handleMeasure = (what: 'speed' | 'position') => {
    if (committed) return;
    setMeasuring(what);
  };

  const handleCommit = () => {
    if (committed) return;
    setCommitted(true);
    setDone(true);
    setTimeout(() => verse.advance(), 3000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const btnFaint = immersiveTapButton(verse.palette, 'faint');
  const SCENE_W = 260;
  const SCENE_H = 120;

  const isSpeed = measuring === 'speed';
  const isPosition = measuring === 'position';

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Particle */}
          <motion.circle
            cy={SCENE_H / 2}
            r={isPosition ? 6 : 8}
            fill={verse.palette.accent}
            animate={{
              cx: isSpeed
                ? [60, 100, 160, 200] // Position uncertain -- particle moves
                : isPosition
                  ? 130 // Position certain -- particle fixed
                  : [80, 130, 180],
              opacity: safeOpacity(
                isPosition ? 0.5 : isSpeed ? 0.3 : 0.25
              ),
            }}
            transition={
              isSpeed
                ? { repeat: Infinity, duration: 0.8, ease: 'linear' }
                : isPosition
                  ? { duration: 0.5 }
                  : { repeat: Infinity, duration: 2 }
            }
          />

          {/* Position uncertainty cloud (when measuring speed) */}
          {isSpeed && (
            <motion.ellipse
              cx={130} cy={SCENE_H / 2}
              rx={80} ry={15}
              fill={verse.palette.accent}
              animate={{
                opacity: [safeOpacity(0.03), safeOpacity(0.08), safeOpacity(0.03)],
              }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          )}

          {/* Speed uncertainty (when measuring position) */}
          {isPosition && (
            <motion.g>
              {/* Arrow that flickers direction */}
              <motion.path
                fill="none"
                stroke={verse.palette.shadow}
                strokeWidth={1}
                strokeDasharray="3 3"
                animate={{
                  d: [
                    `M 140,${SCENE_H / 2} L 200,${SCENE_H / 2}`,
                    `M 120,${SCENE_H / 2} L 60,${SCENE_H / 2}`,
                    `M 140,${SCENE_H / 2} L 200,${SCENE_H / 2}`,
                  ],
                  opacity: [safeOpacity(0.2), safeOpacity(0.3), safeOpacity(0.2)],
                }}
                transition={{ repeat: Infinity, duration: 0.6 }}
              />
              <text x={130} y={SCENE_H / 2 - 20} textAnchor="middle"
                fill={verse.palette.shadow} style={navicueType.micro}>
                speed unknown
              </text>
            </motion.g>
          )}

          {/* Speed label with certainty bar */}
          <rect x={20} y={SCENE_H - 28} width={100} height={18} rx={4}
            fill={verse.palette.primary}
            opacity={safeOpacity(isSpeed ? 0.1 : 0.03)} />
          <text x={70} y={SCENE_H - 16} textAnchor="middle"
            fill={isSpeed ? verse.palette.accent : verse.palette.textFaint}
            style={navicueType.micro}>
            speed: {isSpeed ? 'known' : isPosition ? '???' : '~'}
          </text>

          {/* Position label with certainty bar */}
          <rect x={140} y={SCENE_H - 28} width={100} height={18} rx={4}
            fill={verse.palette.primary}
            opacity={safeOpacity(isPosition ? 0.1 : 0.03)} />
          <text x={190} y={SCENE_H - 16} textAnchor="middle"
            fill={isPosition ? verse.palette.accent : verse.palette.textFaint}
            style={navicueType.micro}>
            position: {isPosition ? 'known' : isSpeed ? '???' : '~'}
          </text>

          {/* Heisenberg notation */}
          <text x={130} y={18} textAnchor="middle"
            fill={verse.palette.textFaint} style={navicueType.micro}>
            {'\u0394'}x {'\u00B7'} {'\u0394'}p {'\u2265'} {'\u0127'}/2
          </text>
        </svg>
      </div>

      {/* Measurement toggles */}
      {!committed && (
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button
            style={{
              ...(isSpeed ? btn.base : btnFaint.base),
              padding: '10px 16px',
            }}
            whileTap={isSpeed ? btn.active : btnFaint.active}
            onClick={() => handleMeasure('speed')}
          >
            measure speed
          </motion.button>
          <motion.button
            style={{
              ...(isPosition ? btn.base : btnFaint.base),
              padding: '10px 16px',
            }}
            whileTap={isPosition ? btn.active : btnFaint.active}
            onClick={() => handleMeasure('position')}
          >
            measure position
          </motion.button>
        </div>
      )}

      {/* Commit (choosing momentum = speed) */}
      {measuring !== 'none' && !committed && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={btn.base}
          whileTap={btn.active}
          onClick={handleCommit}
        >
          accept the trade-off
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? `you chose ${measuring}. the other is uncertain.`
          : measuring !== 'none'
            ? 'one sharpens. the other blurs.'
            : 'you cannot measure both'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          agility
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'trade-off analysis' : 'you cannot know everything'}
      </div>
    </div>
  );
}
