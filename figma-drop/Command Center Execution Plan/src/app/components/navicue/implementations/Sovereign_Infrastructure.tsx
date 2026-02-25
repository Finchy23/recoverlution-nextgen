/**
 * SOVEREIGN #8 -- 1378. The Infrastructure (Habits)
 * "Willpower is a dirt road. Habit is a highway."
 * INTERACTION: Dirt road (slow, hard). Pave it (habit). Travel becomes fast and easy.
 * STEALTH KBE: Habit Formation -- System Design (K)
 *
 * COMPOSITOR: poetic_precision / Circuit / work / knowing / tap / 1378
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

export default function Sovereign_Infrastructure({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Circuit',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1378,
        isSeal: false,
      }}
      arrivalText="Dirt roads. Everything is hard."
      prompt="Willpower is a dirt road. Habit is a highway. Build the infrastructure so doing the right thing is the path of least resistance."
      resonantText="Habit formation. You paved the road and travel became effortless. System design: the kingdom that builds highways does not need to motivate its citizens. The infrastructure carries them."
      afterglowCoda="Build the highway."
      onComplete={onComplete}
    >
      {(verse) => <InfrastructureInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function InfrastructureInteraction({ verse }: { verse: any }) {
  const [paved, setPaved] = useState(0);
  const [done, setDone] = useState(false);
  const SEGMENTS = 5;

  const handlePave = () => {
    if (done) return;
    const next = paved + 1;
    setPaved(next);
    if (next >= SEGMENTS) {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 140;
  const CX = W / 2;

  // Road from left to right
  const ROAD_Y = H / 2 + 5;
  const ROAD_X1 = 25, ROAD_X2 = W - 25;
  const SEG_W = (ROAD_X2 - ROAD_X1) / SEGMENTS;

  // Traveler dot
  const travelerX = ROAD_X1 + (paved / SEGMENTS) * (ROAD_X2 - ROAD_X1);

  // Speed indicator
  const speed = done ? 1 : paved / SEGMENTS;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>speed</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.text,
        }}>
          {done ? 'effortless'
            : paved > 0 ? `${Math.round(speed * 100)}% easier`
              : 'slow (willpower)'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Road segments */}
          {Array.from({ length: SEGMENTS }).map((_, i) => {
            const x = ROAD_X1 + i * SEG_W;
            const isPaved = i < paved;
            return (
              <motion.g key={i}>
                {/* Road surface */}
                <motion.rect
                  x={x + 1} y={ROAD_Y - 8}
                  width={SEG_W - 2} height={16} rx={2}
                  fill={isPaved ? verse.palette.accent : verse.palette.primary}
                  animate={{
                    opacity: safeOpacity(isPaved ? 0.12 : 0.04),
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.rect
                  x={x + 1} y={ROAD_Y - 8}
                  width={SEG_W - 2} height={16} rx={2}
                  fill="none"
                  stroke={isPaved ? verse.palette.accent : verse.palette.primary}
                  strokeWidth={isPaved ? 1 : 0.5}
                  animate={{
                    opacity: safeOpacity(isPaved ? 0.25 : 0.08),
                  }}
                />

                {/* Dirt texture (unpaved) */}
                {!isPaved && (
                  <g opacity={0.06}>
                    {[0, 1, 2, 3].map(j => (
                      <circle key={j}
                        cx={x + 5 + j * 9} cy={ROAD_Y - 2 + (j % 2) * 4}
                        r={1}
                        fill={verse.palette.shadow} />
                    ))}
                  </g>
                )}

                {/* Center lane marking (paved) */}
                {isPaved && (
                  <line
                    x1={x + 3} y1={ROAD_Y}
                    x2={x + SEG_W - 3} y2={ROAD_Y}
                    stroke={verse.palette.accent}
                    strokeWidth={0.5}
                    strokeDasharray="4 4"
                    opacity={safeOpacity(0.15)} />
                )}
              </motion.g>
            );
          })}

          {/* Labels */}
          <text x={ROAD_X1} y={ROAD_Y - 15} fill={verse.palette.textFaint}
            style={{ fontSize: '7px' }} opacity={0.2}>
            willpower (dirt)
          </text>
          <text x={ROAD_X2} y={ROAD_Y - 15} textAnchor="end"
            fill={done ? verse.palette.accent : verse.palette.textFaint}
            style={{ fontSize: '7px' }}
            opacity={done ? 0.4 : 0.2}>
            habit (highway)
          </text>

          {/* Traveler */}
          <motion.circle
            cy={ROAD_Y} r={6}
            fill={done ? verse.palette.accent : verse.palette.primary}
            animate={{
              cx: travelerX,
              opacity: safeOpacity(done ? 0.3 : 0.15),
            }}
            transition={{ duration: 0.4 }}
          />

          {/* Speed trail (behind traveler on paved sections) */}
          {paved > 1 && (
            <motion.line
              x1={ROAD_X1} y1={ROAD_Y}
              y2={ROAD_Y}
              stroke={verse.palette.accent}
              strokeWidth={1}
              animate={{
                x2: travelerX - 8,
                opacity: safeOpacity(done ? 0.15 : 0.08),
              }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* Resistance indicator */}
          <rect x={ROAD_X1} y={H - 25} width={ROAD_X2 - ROAD_X1} height={6} rx={3}
            fill={verse.palette.primary} opacity={safeOpacity(0.04)} />
          <motion.rect
            x={ROAD_X1} y={H - 25} height={6} rx={3}
            fill={verse.palette.accent}
            animate={{
              width: (ROAD_X2 - ROAD_X1) * (1 - speed * 0.8),
              opacity: safeOpacity(done ? 0.05 : 0.1),
            }}
            transition={{ duration: 0.3 }}
          />
          <text x={ROAD_X1} y={H - 28} fill={verse.palette.textFaint}
            style={{ fontSize: '6px' }} opacity={0.15}>
            resistance
          </text>

          {/* Done */}
          {done && (
            <motion.text
              x={CX} y={H - 5} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}
            >
              path of least resistance
            </motion.text>
          )}
        </svg>
      </div>

      {!done && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handlePave}>
          pave ({paved + 1} / {SEGMENTS})
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'the highway carries you. no willpower needed.'
          : paved > 0 ? `${paved} segments paved. resistance dropping.`
            : 'dirt roads. every step costs willpower.'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          system design
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'habit formation' : 'build the infrastructure'}
      </div>
    </div>
  );
}
