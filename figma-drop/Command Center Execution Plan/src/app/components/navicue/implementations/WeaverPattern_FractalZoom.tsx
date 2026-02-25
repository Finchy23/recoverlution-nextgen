/**
 * WEAVER PATTERN #4 -- 1284. The Fractal Zoom
 * "The small is the big."
 * INTERACTION: Tap to zoom deeper -- leaf veins, river delta, lightning -- same pattern
 * STEALTH KBE: Pattern Recognition -- Fractal Insight (K)
 *
 * COMPOSITOR: science_x_soul / Cosmos / morning / knowing / tap / 1284
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const LEVELS = [
  { label: 'leaf', scale: 'macro' },
  { label: 'veins', scale: 'meso' },
  { label: 'river delta', scale: 'geo' },
  { label: 'lightning', scale: 'cosmic' },
];

export default function WeaverPattern_FractalZoom({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Cosmos',
        chrono: 'morning',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1284,
        isSeal: false,
      }}
      arrivalText="A leaf."
      prompt="The universe repeats the winning patterns. If you solve the pattern in your morning routine, you solve it in your career. The small is the big."
      resonantText="Pattern recognition. The leaf, the river, the lightning. Same branching. Same fractal. Fractal insight is seeing that the universe uses one blueprint at every scale. Solve it once, solve it everywhere."
      afterglowCoda="The small is the big."
      onComplete={onComplete}
    >
      {(verse) => <FractalZoomInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FractalZoomInteraction({ verse }: { verse: any }) {
  const [level, setLevel] = useState(0);
  const [done, setDone] = useState(false);

  const handleZoom = () => {
    if (done) return;
    const next = level + 1;
    setLevel(next);
    if (next >= LEVELS.length) {
      setDone(true);
      setTimeout(() => verse.advance(), 3200);
    }
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 180;
  const CX = W / 2, CY = H / 2;

  // Branching pattern -- same shape, different context
  const branchPath = (baseX: number, baseY: number, size: number, depth: number): string[] => {
    if (depth <= 0 || size < 4) return [];
    const paths: string[] = [];
    const angles = [-35, 0, 35];
    for (const angle of angles) {
      const rad = ((angle - 90) * Math.PI) / 180;
      const endX = baseX + size * Math.cos(rad);
      const endY = baseY + size * Math.sin(rad);
      paths.push(`M ${baseX},${baseY} L ${endX},${endY}`);
      if (depth > 1) {
        paths.push(...branchPath(endX, endY, size * 0.55, depth - 1));
      }
    }
    return paths;
  };

  const branches = branchPath(CX, H - 25, 40, 3);

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Scale indicator */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {LEVELS.map((l, i) => (
          <motion.span key={l.label}
            style={{
              ...navicueType.micro,
              color: i <= level - 1 ? verse.palette.accent : verse.palette.textFaint,
            }}
            animate={{ opacity: i <= level - 1 ? 0.6 : 0.2 }}
          >
            {l.label}
          </motion.span>
        ))}
      </div>

      <div style={{ position: 'relative', width: W, height: H, overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.svg
            key={level}
            width={W} height={H} viewBox={`0 0 ${W} ${H}`}
            initial={{ opacity: 0, scale: 1.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Context label */}
            <text x={W - 10} y={18} textAnchor="end"
              fill={verse.palette.textFaint} style={navicueType.micro} opacity={0.25}>
              {level < LEVELS.length ? LEVELS[level].label : 'same pattern'}
            </text>

            {/* Zoom ring */}
            <circle cx={CX} cy={CY} r={70}
              fill="none" stroke={verse.palette.primary}
              strokeWidth={0.3} opacity={safeOpacity(0.08)}
              strokeDasharray="4 4" />

            {/* The fractal branch pattern -- always the same shape */}
            {branches.map((d, i) => (
              <motion.path key={i} d={d}
                fill="none"
                stroke={done ? verse.palette.accent : verse.palette.primary}
                strokeLinecap="round"
                strokeWidth={i < 3 ? 1.5 : i < 12 ? 1 : 0.6}
                initial={{ pathLength: 0 }}
                animate={{
                  pathLength: 1,
                  opacity: safeOpacity(done ? 0.35 : 0.2),
                }}
                transition={{ duration: 0.3, delay: i * 0.02 }}
              />
            ))}

            {/* Context decoration per level */}
            {level === 0 && (
              /* Leaf outline */
              <path
                d={`M ${CX},${H - 25} Q ${CX - 50},${CY - 20} ${CX},20 Q ${CX + 50},${CY - 20} ${CX},${H - 25}`}
                fill="none" stroke={verse.palette.primary}
                strokeWidth={0.5} opacity={safeOpacity(0.12)} />
            )}
            {level === 2 && (
              /* River bed outline */
              <path
                d={`M ${CX - 80},${H - 10} Q ${CX - 40},${CY + 30} ${CX + 80},${H - 10}`}
                fill={verse.palette.primary} opacity={safeOpacity(0.04)} />
            )}
            {level >= 3 && (
              /* Lightning sky flash */
              <motion.rect
                x={0} y={0} width={W} height={H}
                fill={verse.palette.accent}
                initial={{ opacity: 0.1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* "Same pattern" label (done) */}
            {done && (
              <motion.text
                x={CX} y={H - 5}
                textAnchor="middle"
                fill={verse.palette.accent}
                style={navicueType.choice}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.5 }}
              >
                same pattern
              </motion.text>
            )}
          </motion.svg>
        </AnimatePresence>
      </div>

      {!done && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleZoom}>
          {level === 0 ? 'zoom in' : 'zoom deeper'}
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'one blueprint. every scale.'
          : `zoom level ${level + 1} of ${LEVELS.length}`}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          fractal insight
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'pattern recognition' : 'the small is the big'}
      </div>
    </div>
  );
}
