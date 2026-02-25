/**
 * DIPLOMAT #10 -- 1270. The Diplomat Seal (The Proof)
 * "One plus one is three."
 * INTERACTION: Observe -- two interlocking circles form a third entity
 * STEALTH KBE: Dyadic Regulation -- seal completion
 *
 * COMPOSITOR: science_x_soul / Cosmos / night / knowing / observe / 1270
 */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Diplomat_DiplomatSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Cosmos',
        chrono: 'night',
        kbe: 'k',
        hook: 'observe',
        specimenSeed: 1270,
        isSeal: true,
      }}
      arrivalText="Two circles."
      prompt="One plus one is three."
      resonantText="Dyadic regulation. Humans regulate each other's nervous systems. A relationship is a third entity created by the interaction of two. The geometry of connection is not addition. It is emergence."
      afterglowCoda="The geometry of relationship."
      onComplete={onComplete}
    >
      {(verse) => <DiplomatSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function DiplomatSealInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1500);  // Two separate circles
    const t2 = setTimeout(() => setPhase(2), 4000);  // Circles approach
    const t3 = setTimeout(() => setPhase(3), 6500);  // Overlap / interlock
    const t4 = setTimeout(() => setPhase(4), 9500);  // Third entity emerges
    const t5 = setTimeout(() => {
      setPhase(5);
      setTimeout(() => verse.advance(), 3500);
    }, 12000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, [verse]);

  const W = 240, H = 240;
  const CX = W / 2, CY = H / 2;
  const R = 45;

  // Circle positions: start far, merge
  const leftX = phase >= 2 ? CX - 28 : CX - 60;
  const rightX = phase >= 2 ? CX + 28 : CX + 60;
  const overlap = phase >= 3;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Outer seal ring */}
          {phase >= 5 && (
            <motion.circle
              cx={CX} cy={CY} r={105}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={0.5}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: safeOpacity(0.15), scale: 1 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            />
          )}

          {/* Left circle */}
          {phase >= 1 && (
            <motion.circle
              cy={CY} r={R}
              fill={verse.palette.accent}
              animate={{
                cx: leftX,
                opacity: safeOpacity(0.08),
              }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
          {phase >= 1 && (
            <motion.circle
              cy={CY} r={R}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={1}
              animate={{
                cx: leftX,
                opacity: safeOpacity(0.3),
              }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            />
          )}

          {/* Right circle */}
          {phase >= 1 && (
            <motion.circle
              cy={CY} r={R}
              fill={verse.palette.primary}
              animate={{
                cx: rightX,
                opacity: safeOpacity(0.06),
              }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
          {phase >= 1 && (
            <motion.circle
              cy={CY} r={R}
              fill="none" stroke={verse.palette.primary}
              strokeWidth={1}
              animate={{
                cx: rightX,
                opacity: safeOpacity(0.25),
              }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            />
          )}

          {/* Overlap glow (vesica piscis) */}
          {overlap && (
            <motion.g>
              <defs>
                <clipPath id="left-clip-1270">
                  <circle cx={leftX} cy={CY} r={R} />
                </clipPath>
              </defs>
              <motion.circle
                cx={rightX} cy={CY} r={R}
                fill={verse.palette.accent}
                clipPath="url(#left-clip-1270)"
                initial={{ opacity: 0 }}
                animate={{ opacity: safeOpacity(phase >= 4 ? 0.2 : 0.1) }}
                transition={{ duration: 1 }}
              />
            </motion.g>
          )}

          {/* Third entity pulse (phase 4+) */}
          {phase >= 4 && (
            <motion.g>
              <motion.circle
                cx={CX} cy={CY} r={12}
                fill={verse.palette.accent}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: safeOpacity(0.25),
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  opacity: { duration: 0.5 },
                  scale: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' },
                }}
              />
              <motion.circle
                cx={CX} cy={CY} r={12}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.5}
                initial={{ opacity: 0 }}
                animate={{ opacity: safeOpacity(0.4) }}
              />
            </motion.g>
          )}

          {/* Labels */}
          {phase >= 1 && phase < 4 && (
            <>
              <motion.text
                y={CY + R + 20} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.micro}
                animate={{ x: leftX, opacity: 0.4 }}
                transition={{ duration: 1.5 }}
              >
                one
              </motion.text>
              <motion.text
                y={CY + R + 20} textAnchor="middle"
                fill={verse.palette.textFaint} style={navicueType.micro}
                animate={{ x: rightX, opacity: 0.4 }}
                transition={{ duration: 1.5 }}
              >
                one
              </motion.text>
            </>
          )}

          {phase >= 4 && (
            <motion.text
              x={CX} y={CY + R + 25}
              textAnchor="middle"
              fill={verse.palette.accent}
              style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}
            >
              three
            </motion.text>
          )}

          {/* Phase text */}
          <motion.text
            x={CX} y={H - 15}
            textAnchor="middle"
            fill={phase >= 5 ? verse.palette.accent : verse.palette.textFaint}
            style={navicueType.hint}
            animate={{ opacity: 0.6 }}
          >
            {phase === 0 && 'two beings'}
            {phase === 1 && 'separate'}
            {phase === 2 && 'approaching'}
            {phase === 3 && 'interlocking'}
            {phase === 4 && 'a third entity emerges'}
            {phase >= 5 && 'one plus one is three'}
          </motion.text>
        </svg>
      </div>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase >= 5 ? 'dyadic regulation' : 'observe'}
      </div>
    </div>
  );
}
