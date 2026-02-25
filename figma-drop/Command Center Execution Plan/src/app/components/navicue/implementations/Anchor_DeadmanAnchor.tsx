/**
 * ANCHOR #7 -- 1297. The Deadman Anchor
 * "Bury your Why so deep that the avalanche cannot move it."
 * INTERACTION: Tap to bury the anchor deeper -- it holds the weight
 * STEALTH KBE: Purpose -- Deep Purpose (B)
 *
 * COMPOSITOR: koan_paradox / Arc / night / believing / tap / 1297
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

export default function Anchor_DeadmanAnchor({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Arc',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1297,
        isSeal: false,
      }}
      arrivalText="Slipping. No grip."
      prompt="Surface anchors fail. Dig deep. Bury your Why so deep that the avalanche cannot move it. Trust the buried thing."
      resonantText="Purpose. You buried the anchor and it held the full weight of the fall. Deep purpose is the deadman that does not care about the storm above. It holds because it is hidden."
      afterglowCoda="Trust the buried thing."
      onComplete={onComplete}
    >
      {(verse) => <DeadmanAnchorInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function DeadmanAnchorInteraction({ verse }: { verse: any }) {
  const [depth, setDepth] = useState(0);
  const [tested, setTested] = useState(false);
  const [done, setDone] = useState(false);
  const TARGET = 4;

  const handleDig = () => {
    if (tested || done) return;
    const next = depth + 1;
    setDepth(next);
    if (next >= TARGET) {
      setTimeout(() => {
        setTested(true);
        setDone(true);
        setTimeout(() => verse.advance(), 3000);
      }, 600);
    }
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 200;
  const CX = W / 2;
  const SNOW_Y = 90;
  const anchorDepth = 15 + depth * 18;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>depth</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.text,
        }}>
          {done ? 'buried' : `${depth}/${TARGET}`}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Snow slope */}
          <path d={`M 0,${SNOW_Y + 30} L ${W},${SNOW_Y - 20} L ${W},${H} L 0,${H} Z`}
            fill={verse.palette.primary} opacity={safeOpacity(0.04)} />
          <line x1={0} y1={SNOW_Y + 30} x2={W} y2={SNOW_Y - 20}
            stroke={verse.palette.primary} strokeWidth={0.5}
            opacity={safeOpacity(0.12)} />

          {/* Person (slipping) */}
          <motion.g
            animate={{
              x: tested ? 0 : [0, 3, 5, 3, 0],
              y: tested ? 0 : [0, 2, 4, 2, 0],
            }}
            transition={tested ? {} : { repeat: Infinity, duration: 2 }}
          >
            <circle cx={70} cy={SNOW_Y - 5} r={7}
              fill={verse.palette.accent} opacity={safeOpacity(0.15)} />
            <line x1={70} y1={SNOW_Y + 2} x2={70} y2={SNOW_Y + 20}
              stroke={verse.palette.accent} strokeWidth={1.5}
              opacity={safeOpacity(0.15)} />
          </motion.g>

          {/* Rope from person to anchor */}
          <motion.path
            fill="none" stroke={verse.palette.accent}
            strokeWidth={1} strokeLinecap="round"
            animate={{
              d: `M 70,${SNOW_Y + 10} Q ${CX},${SNOW_Y + 5} ${CX},${SNOW_Y + 5}`,
              opacity: safeOpacity(done ? 0.35 : 0.15),
            }}
          />

          {/* Rope going underground */}
          <motion.line
            x1={CX} y1={SNOW_Y + 5} x2={CX}
            stroke={verse.palette.accent}
            strokeWidth={1}
            animate={{
              y2: SNOW_Y + 5 + anchorDepth,
              opacity: safeOpacity(done ? 0.3 : 0.15),
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Buried anchor (log shape) */}
          <motion.g>
            <motion.rect
              x={CX - 18} width={36} height={8} rx={4}
              fill={done ? verse.palette.accent : verse.palette.primary}
              animate={{
                y: SNOW_Y + 5 + anchorDepth,
                opacity: safeOpacity(done ? 0.3 : 0.12),
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Ground compression lines */}
            {depth > 0 && Array.from({ length: depth }).map((_, i) => {
              const y = SNOW_Y + 10 + i * 18;
              return (
                <line key={i}
                  x1={CX - 25} y1={y} x2={CX + 25} y2={y}
                  stroke={verse.palette.primary} strokeWidth={0.3}
                  opacity={safeOpacity(0.06)} />
              );
            })}
          </motion.g>

          {/* Tension test (when buried deep enough) */}
          {tested && (
            <motion.g>
              {/* Taut rope flash */}
              <motion.line
                x1={70} y1={SNOW_Y + 10}
                x2={CX} y2={SNOW_Y + 5}
                stroke={verse.palette.accent}
                strokeWidth={2}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: safeOpacity(0.35) }}
                transition={{ duration: 0.3 }}
              />

              {/* "Holds" text */}
              <motion.text
                x={CX} y={SNOW_Y - 25} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.choice}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 0.5 }}
              >
                holds
              </motion.text>

              {/* Stress lines from anchor */}
              {[-1, 0, 1].map(dir => (
                <motion.line key={dir}
                  x1={CX + dir * 20}
                  y1={SNOW_Y + 5 + anchorDepth + 10}
                  x2={CX + dir * 25}
                  y2={SNOW_Y + 5 + anchorDepth + 18}
                  stroke={verse.palette.accent}
                  strokeWidth={0.5}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: safeOpacity(0.15) }}
                  transition={{ delay: 0.3 + Math.abs(dir) * 0.1 }}
                />
              ))}
            </motion.g>
          )}
        </svg>
      </div>

      {depth < TARGET && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleDig}>
          dig deeper
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'the buried thing held'
          : `surface anchors fail. dig deep.`}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          deep purpose
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'purpose' : 'bury your why'}
      </div>
    </div>
  );
}
