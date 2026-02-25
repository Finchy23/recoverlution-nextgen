/**
 * WEAVER PATTERN #8 -- 1288. The Cut (Severing)
 * "If it is choking you, it is not a lifeline. Cut it."
 * INTERACTION: Tap scissors to cut the rope -- weight falls away
 * STEALTH KBE: Boundaries -- Liberation (B)
 *
 * COMPOSITOR: pattern_glitch / Pulse / night / believing / tap / 1288
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

export default function WeaverPattern_Cut({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Pulse',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1288,
        isSeal: false,
      }}
      arrivalText="A heavy weight. A rope. Scissors."
      prompt="Some threads are lifelines. Some are nooses. Know the difference. If it is choking you, it is not a lifeline. Cut it."
      resonantText="Boundaries. You cut the rope and the weight fell. Liberation is the understanding that not every thread deserves to stay. Some were tying you down, not holding you up."
      afterglowCoda="Cut."
      onComplete={onComplete}
    >
      {(verse) => <CutInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function CutInteraction({ verse }: { verse: any }) {
  const [cut, setCut] = useState(false);
  const [done, setDone] = useState(false);

  const handleCut = () => {
    if (cut) return;
    setCut(true);
    setDone(true);
    setTimeout(() => verse.advance(), 3200);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 200, H = 220;
  const CX = W / 2;
  const PERSON_Y = 50;
  const CUT_Y = 110;
  const WEIGHT_Y = 170;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Person (you) */}
          <motion.g
            animate={{
              y: cut ? -15 : 0,
            }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <circle cx={CX} cy={PERSON_Y - 15} r={8}
              fill={verse.palette.accent} opacity={safeOpacity(0.2)} />
            <line x1={CX} y1={PERSON_Y - 7} x2={CX} y2={PERSON_Y + 15}
              stroke={verse.palette.accent} strokeWidth={1.5}
              opacity={safeOpacity(0.2)} />
            {/* Arms */}
            <line x1={CX - 12} y1={PERSON_Y + 2} x2={CX + 12} y2={PERSON_Y + 2}
              stroke={verse.palette.accent} strokeWidth={1}
              opacity={safeOpacity(0.15)} />
            {/* Legs */}
            <line x1={CX} y1={PERSON_Y + 15} x2={CX - 8} y2={PERSON_Y + 28}
              stroke={verse.palette.accent} strokeWidth={1}
              opacity={safeOpacity(0.15)} />
            <line x1={CX} y1={PERSON_Y + 15} x2={CX + 8} y2={PERSON_Y + 28}
              stroke={verse.palette.accent} strokeWidth={1}
              opacity={safeOpacity(0.15)} />
          </motion.g>

          {/* Rope (top half -- stays with person) */}
          <motion.line
            x1={CX} y1={PERSON_Y + 28} x2={CX} y2={CUT_Y}
            stroke={verse.palette.primary}
            strokeWidth={2}
            animate={{
              y1: cut ? PERSON_Y + 13 : PERSON_Y + 28,
              opacity: safeOpacity(cut ? 0.1 : 0.2),
            }}
          />

          {/* Rope (bottom half -- falls with weight) */}
          {!cut && (
            <line x1={CX} y1={CUT_Y} x2={CX} y2={WEIGHT_Y - 15}
              stroke={verse.palette.primary}
              strokeWidth={2}
              opacity={safeOpacity(0.2)} />
          )}
          {cut && (
            <motion.line
              x1={CX} y1={CUT_Y} x2={CX}
              stroke={verse.palette.primary}
              strokeWidth={2}
              initial={{ y2: WEIGHT_Y - 15, opacity: 0.2 }}
              animate={{ y2: H + 30, opacity: 0 }}
              transition={{ duration: 0.8, ease: [0, 0.55, 0.45, 1] }}
            />
          )}

          {/* Cut point indicator */}
          {!cut && (
            <motion.g
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <line x1={CX - 12} y1={CUT_Y} x2={CX + 12} y2={CUT_Y}
                stroke={verse.palette.shadow} strokeWidth={0.5}
                strokeDasharray="3 2" />
              {/* Scissors icon */}
              <path d={`M ${CX + 15},${CUT_Y - 6} L ${CX + 8},${CUT_Y} L ${CX + 15},${CUT_Y + 6}`}
                fill="none" stroke={verse.palette.textFaint}
                strokeWidth={1} strokeLinecap="round" />
              <path d={`M ${CX + 15},${CUT_Y - 6} Q ${CX + 20},${CUT_Y - 3} ${CX + 18},${CUT_Y - 8}`}
                fill="none" stroke={verse.palette.textFaint}
                strokeWidth={0.5} />
              <path d={`M ${CX + 15},${CUT_Y + 6} Q ${CX + 20},${CUT_Y + 3} ${CX + 18},${CUT_Y + 8}`}
                fill="none" stroke={verse.palette.textFaint}
                strokeWidth={0.5} />
            </motion.g>
          )}

          {/* Cut spark */}
          {cut && (
            <motion.g>
              {[0, 60, 120, 180, 240, 300].map(angle => {
                const rad = angle * Math.PI / 180;
                return (
                  <motion.line key={angle}
                    x1={CX} y1={CUT_Y}
                    stroke={verse.palette.accent}
                    strokeWidth={1}
                    initial={{
                      x2: CX + 3 * Math.cos(rad),
                      y2: CUT_Y + 3 * Math.sin(rad),
                      opacity: 0.5,
                    }}
                    animate={{
                      x2: CX + 15 * Math.cos(rad),
                      y2: CUT_Y + 15 * Math.sin(rad),
                      opacity: 0,
                    }}
                    transition={{ duration: 0.4 }}
                  />
                );
              })}
            </motion.g>
          )}

          {/* Weight (PAST) */}
          <motion.g
            animate={{
              y: cut ? H : 0,
              opacity: cut ? 0 : 1,
            }}
            transition={{
              y: { duration: 0.8, ease: [0, 0.55, 0.45, 1] },
              opacity: { duration: 0.6, delay: 0.2 },
            }}
          >
            <rect x={CX - 20} y={WEIGHT_Y - 15} width={40} height={30} rx={4}
              fill={verse.palette.shadow} opacity={safeOpacity(0.12)} />
            <rect x={CX - 20} y={WEIGHT_Y - 15} width={40} height={30} rx={4}
              fill="none" stroke={verse.palette.shadow}
              strokeWidth={1} opacity={safeOpacity(0.2)} />
            <text x={CX} y={WEIGHT_Y + 4} textAnchor="middle"
              fill={verse.palette.shadow} style={navicueType.micro} opacity={0.4}>
              past
            </text>
          </motion.g>

          {/* Release glow */}
          {done && (
            <motion.text
              x={CX} y={H - 10}
              textAnchor="middle"
              fill={verse.palette.accent}
              style={navicueType.choice}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.8 }}
            >
              free
            </motion.text>
          )}
        </svg>
      </div>

      {!cut && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleCut}>
          cut
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'the weight is gone'
          : 'it is choking you. it is not a lifeline.'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          liberation
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'boundaries' : 'know the difference'}
      </div>
    </div>
  );
}
