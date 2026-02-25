/**
 * WEAVER PATTERN #6 -- 1286. The Warp and Weft
 * "Weave the routine with the play. Make the cloth."
 * INTERACTION: Drag horizontal threads through vertical ones to weave fabric
 * STEALTH KBE: Balance -- Integration (B)
 *
 * COMPOSITOR: sacred_ordinary / Circuit / work / believing / drag / 1286
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

export default function WeaverPattern_WarpAndWeft({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Circuit',
        chrono: 'work',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1286,
        isSeal: false,
      }}
      arrivalText="Vertical threads. Horizontal threads. Separate."
      prompt="Structure without color is a cage. Color without structure is a mess. Weave the routine with the play. Make the cloth."
      resonantText="Balance. You wove structure and color together and the fabric held. Integration is the loom that turns two weaknesses into one strength."
      afterglowCoda="Make the cloth."
      onComplete={onComplete}
    >
      {(verse) => <WarpAndWeftInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function WarpAndWeftInteraction({ verse }: { verse: any }) {
  const [woven, setWoven] = useState(0);
  const [done, setDone] = useState(false);
  const TARGET = 5;

  const handleWeave = () => {
    if (done) return;
    const next = woven + 1;
    setWoven(next);
    if (next >= TARGET) {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 170;
  const LEFT = 40, RIGHT = W - 40;
  const TOP = 20, BOT = H - 30;
  const WARPS = 8; // vertical threads (structure)

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Fabric readout */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>fabric</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.text,
        }}>
          {done ? 'cloth' : `${woven}/${TARGET} rows`}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Warp threads (vertical / structure) */}
          {Array.from({ length: WARPS }).map((_, i) => {
            const x = LEFT + i * ((RIGHT - LEFT) / (WARPS - 1));
            return (
              <line key={`warp-${i}`}
                x1={x} y1={TOP} x2={x} y2={BOT}
                stroke={verse.palette.primary}
                strokeWidth={1}
                opacity={safeOpacity(0.15)} />
            );
          })}

          {/* Weft threads (horizontal / color) -- woven ones */}
          {Array.from({ length: woven }).map((_, row) => {
            const y = TOP + 15 + row * ((BOT - TOP - 30) / (TARGET - 1));
            const segments: JSX.Element[] = [];

            for (let col = 0; col < WARPS - 1; col++) {
              const x1 = LEFT + col * ((RIGHT - LEFT) / (WARPS - 1));
              const x2 = LEFT + (col + 1) * ((RIGHT - LEFT) / (WARPS - 1));
              const isOver = (col + row) % 2 === 0;

              segments.push(
                <motion.line key={`weft-${row}-${col}`}
                  x1={x1} y1={y + (isOver ? -1.5 : 1.5)}
                  x2={x2} y2={y + (isOver ? -1.5 : 1.5)}
                  stroke={verse.palette.accent}
                  strokeWidth={2}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: 1,
                    opacity: safeOpacity(0.3),
                  }}
                  transition={{ duration: 0.15, delay: col * 0.04 }}
                />
              );
            }

            return <g key={`row-${row}`}>{segments}</g>;
          })}

          {/* Unwoven weft preview lines */}
          {Array.from({ length: Math.max(0, TARGET - woven) }).map((_, i) => {
            const row = woven + i;
            const y = TOP + 15 + row * ((BOT - TOP - 30) / (TARGET - 1));
            return (
              <line key={`preview-${i}`}
                x1={LEFT - 20} y1={y} x2={LEFT - 5} y2={y}
                stroke={verse.palette.accent}
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={safeOpacity(0.12)} />
            );
          })}

          {/* Labels */}
          <text x={W / 2} y={TOP - 5} textAnchor="middle"
            fill={verse.palette.primary} style={navicueType.micro} opacity={0.3}>
            structure
          </text>
          <text x={LEFT - 25} y={(TOP + BOT) / 2 + 4}
            fill={verse.palette.accent} style={navicueType.micro} opacity={0.3}
            transform={`rotate(-90, ${LEFT - 25}, ${(TOP + BOT) / 2})`}
            textAnchor="middle">
            color
          </text>

          {/* Fabric strength indicator */}
          {done && (
            <motion.rect
              x={LEFT} y={TOP + 10}
              width={RIGHT - LEFT} height={BOT - TOP - 20}
              rx={4}
              fill={verse.palette.accent}
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.05) }}
              transition={{ duration: 0.8 }}
            />
          )}
        </svg>
      </div>

      {!done && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleWeave}>
          weave row {woven + 1}
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'structure and color became cloth'
          : 'weave the routine with the play'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          integration
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'balance' : 'make the cloth'}
      </div>
    </div>
  );
}
