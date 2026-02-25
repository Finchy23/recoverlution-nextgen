/**
 * SCOUT #5 -- 1275. The Edge (The Cliff)
 * "The edge of the map is not the edge of the world."
 * INTERACTION: Tap to step past the warning -- the map expands
 * STEALTH KBE: Growth -- Openness to Experience (B)
 *
 * COMPOSITOR: koan_paradox / Arc / morning / believing / tap / 1275
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

export default function Scout_Edge({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Arc',
        chrono: 'morning',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1275,
        isSeal: false,
      }}
      arrivalText="Edge of the map. Here be dragons."
      prompt="The edge of the map is not the edge of the world. It is just the edge of your experience. Expand the paper."
      resonantText="Growth. You stepped past the edge and the world expanded. Openness to experience is the understanding that the border of the map is drawn by fear, not geography."
      afterglowCoda="Expand the paper."
      onComplete={onComplete}
    >
      {(verse) => <EdgeInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function EdgeInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'edge' | 'stepping' | 'expanded' | 'done'>('edge');

  const handleStep = () => {
    if (phase !== 'edge') return;
    setPhase('stepping');
    setTimeout(() => {
      setPhase('expanded');
      setTimeout(() => {
        setPhase('done');
        setTimeout(() => verse.advance(), 2500);
      }, 1500);
    }, 800);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 260, H = 180;
  const expanded = phase === 'expanded' || phase === 'done';

  // Map edge position
  const mapEdge = expanded ? W - 20 : W * 0.55;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Known map area */}
          <motion.rect
            x={15} y={15}
            height={H - 30} rx={3}
            fill={verse.palette.primary}
            animate={{
              width: mapEdge - 15,
              opacity: safeOpacity(0.06),
            }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.rect
            x={15} y={15}
            height={H - 30} rx={3}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={0.5}
            animate={{
              width: mapEdge - 15,
              opacity: safeOpacity(0.15),
            }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Grid lines on known map */}
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.line key={`h-${i}`}
              x1={25} y1={30 + i * 28}
              y2={30 + i * 28}
              stroke={verse.palette.primary} strokeWidth={0.3}
              animate={{
                x2: mapEdge - 10,
                opacity: safeOpacity(0.08),
              }}
              transition={{ duration: 0.8 }}
            />
          ))}

          {/* Edge boundary (dashed, moves when expanded) */}
          <motion.line
            y1={15} y2={H - 15}
            stroke={expanded ? verse.palette.accent : verse.palette.shadow}
            strokeWidth={expanded ? 0.5 : 1.5}
            strokeDasharray={expanded ? '4 3' : '6 4'}
            animate={{
              x1: mapEdge,
              x2: mapEdge,
              opacity: safeOpacity(expanded ? 0.15 : 0.35),
            }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* "Here Be Dragons" warning */}
          {!expanded && (
            <motion.text
              y={H / 2} textAnchor="middle"
              fill={verse.palette.shadow}
              style={{ ...navicueType.micro, fontStyle: 'italic' }}
              animate={{
                x: mapEdge + 35,
                opacity: phase === 'stepping' ? 0 : 0.35,
              }}
              transition={{ duration: 0.3 }}
            >
              here be dragons
            </motion.text>
          )}

          {/* New territory revealed */}
          {expanded && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* New terrain features */}
              {[
                { x: W * 0.65, y: 50, r: 12 },
                { x: W * 0.75, y: 100, r: 8 },
                { x: W * 0.85, y: 70, r: 15 },
                { x: W * 0.7, y: 130, r: 10 },
              ].map((feature, i) => (
                <motion.circle key={i}
                  cx={feature.x} cy={feature.y} r={feature.r}
                  fill={verse.palette.accent}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: safeOpacity(0.08), scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.12 }}
                />
              ))}

              {/* New paths */}
              <motion.path
                d={`M ${W * 0.55},${H / 2} Q ${W * 0.65},${H / 2 - 20} ${W * 0.75},${H / 2 - 30}
                    M ${W * 0.55},${H / 2} Q ${W * 0.65},${H / 2 + 15} ${W * 0.8},${H / 2 + 25}`}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.8} strokeDasharray="3 3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1, opacity: safeOpacity(0.25) }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </motion.g>
          )}

          {/* You marker */}
          <motion.circle
            cy={H / 2} r={4}
            fill={verse.palette.accent}
            animate={{
              cx: expanded ? mapEdge - 30 : mapEdge - 15,
              opacity: safeOpacity(0.4),
            }}
            transition={{ duration: 0.8 }}
          />
        </svg>
      </div>

      {phase === 'edge' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleStep}>
          step past the edge
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'the world got bigger'
          : expanded ? 'new territory...'
            : phase === 'stepping' ? 'stepping...'
              : 'the map ends here. does the world?'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          openness to experience
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'growth' : 'expand the paper'}
      </div>
    </div>
  );
}
