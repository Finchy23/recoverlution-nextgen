/**
 * ANCHOR #9 -- 1299. The Sediment (Settling)
 * "You clear the water by leaving it alone. Stop fixing. Just wait."
 * INTERACTION: Hold still (observe) -- the particles settle, the water clears
 * STEALTH KBE: Non-Action -- Wu Wei (E)
 *
 * COMPOSITOR: sacred_ordinary / Drift / morning / embodying / observe / 1299
 */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Anchor_Sediment({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Drift',
        chrono: 'morning',
        kbe: 'e',
        hook: 'observe',
        specimenSeed: 1299,
        isSeal: false,
      }}
      arrivalText="A jar of muddy water."
      prompt="You cannot clear the water by stirring it. You clear it by leaving it alone. Stop fixing. Just wait."
      resonantText="Non-action. You waited and the mud settled on its own. Wu wei is the trust that clarity does not require effort. It requires absence. Stop stirring. The water knows how to be clear."
      afterglowCoda="Just wait."
      onComplete={onComplete}
    >
      {(verse) => <SedimentInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SedimentInteraction({ verse }: { verse: any }) {
  const [clarity, setClarity] = useState(0); // 0 = muddy, 1 = clear
  const [done, setDone] = useState(false);

  // Auto-settle over time
  useEffect(() => {
    if (done) return;
    const interval = setInterval(() => {
      setClarity(prev => {
        const next = Math.min(1, prev + 0.02);
        if (next >= 1) {
          clearInterval(interval);
          setDone(true);
          setTimeout(() => verse.advance(), 3000);
        }
        return next;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [done, verse]);

  const W = 180, H = 220;
  const CX = W / 2;
  const JAR_TOP = 30, JAR_BOT = 185;
  const JAR_W = 55;

  // Particles: float up as water clears, settle to bottom
  const NUM_PARTICLES = 20;
  const particles = Array.from({ length: NUM_PARTICLES }).map((_, i) => {
    const seed = (i * 7 + 3) % 17;
    const baseX = CX - JAR_W + 15 + (seed / 17) * (JAR_W * 2 - 30);
    const maxY = JAR_BOT - 15;
    const minY = JAR_TOP + 20;
    const settled = minY + (1 - clarity) * (maxY - minY - i * 2);
    return {
      x: baseX + Math.sin(i * 1.3) * 5 * (1 - clarity),
      y: Math.min(maxY, settled + i * 2),
      r: 1.5 + (seed % 3) * 0.5,
    };
  });

  // Mud line (where settled sediment starts)
  const mudLineY = JAR_BOT - 10 - (1 - clarity) * 80;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Clarity readout */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>clarity</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.text,
        }}>
          {done ? 'clear' : `${Math.round(clarity * 100)}%`}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Jar body */}
          <path
            d={`M ${CX - JAR_W + 10},${JAR_TOP} L ${CX - JAR_W},${JAR_TOP + 20}
                L ${CX - JAR_W},${JAR_BOT} Q ${CX - JAR_W},${JAR_BOT + 10} ${CX - JAR_W + 10},${JAR_BOT + 10}
                L ${CX + JAR_W - 10},${JAR_BOT + 10} Q ${CX + JAR_W},${JAR_BOT + 10} ${CX + JAR_W},${JAR_BOT}
                L ${CX + JAR_W},${JAR_TOP + 20} L ${CX + JAR_W - 10},${JAR_TOP}`}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={1} opacity={safeOpacity(0.2)} />

          {/* Water (gets clearer) */}
          <motion.rect
            x={CX - JAR_W + 2} y={JAR_TOP + 22}
            width={JAR_W * 2 - 4} height={JAR_BOT - JAR_TOP - 22}
            fill={verse.palette.primary}
            animate={{
              opacity: safeOpacity(0.08 * (1 - clarity * 0.7)),
            }}
          />

          {/* Mud layer at bottom */}
          <motion.rect
            x={CX - JAR_W + 2}
            width={JAR_W * 2 - 4} rx={3}
            fill={verse.palette.primary}
            animate={{
              y: mudLineY,
              height: JAR_BOT - mudLineY,
              opacity: safeOpacity(0.12),
            }}
            transition={{ duration: 0.5 }}
          />

          {/* Floating particles */}
          {particles.map((p, i) => (
            <motion.circle key={i}
              cx={p.x} cy={p.y} r={p.r}
              fill={verse.palette.primary}
              animate={{
                cy: p.y,
                opacity: safeOpacity(clarity > 0.9 ? 0.05 : 0.15),
              }}
              transition={{ duration: 0.5 }}
            />
          ))}

          {/* Clarity gradient (clear water above mud line) */}
          {clarity > 0.5 && (
            <motion.rect
              x={CX - JAR_W + 3} y={JAR_TOP + 23}
              width={JAR_W * 2 - 6}
              fill={verse.palette.accent}
              animate={{
                height: Math.max(0, mudLineY - JAR_TOP - 23),
                opacity: safeOpacity(clarity * 0.03),
              }}
            />
          )}

          {/* Jar rim */}
          <line x1={CX - JAR_W + 8} y1={JAR_TOP}
            x2={CX + JAR_W - 8} y2={JAR_TOP}
            stroke={verse.palette.primary} strokeWidth={2}
            opacity={safeOpacity(0.15)} strokeLinecap="round" />

          {/* "Clear" label */}
          {done && (
            <motion.text
              x={CX} y={JAR_TOP + 50} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.choice}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}
            >
              clear
            </motion.text>
          )}

          {/* Settling arrows */}
          {!done && clarity < 0.5 && (
            <motion.g
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {[-15, 0, 15].map(dx => (
                <g key={dx}>
                  <line x1={CX + dx} y1={JAR_TOP + 50} x2={CX + dx} y2={JAR_TOP + 65}
                    stroke={verse.palette.textFaint} strokeWidth={0.5} />
                  <path d={`M ${CX + dx - 3},${JAR_TOP + 62} L ${CX + dx},${JAR_TOP + 67} L ${CX + dx + 3},${JAR_TOP + 62}`}
                    fill={verse.palette.textFaint} />
                </g>
              ))}
            </motion.g>
          )}
        </svg>
      </div>

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'you did not stir. the water cleared.'
          : clarity > 0.5 ? 'settling...'
            : 'stop fixing. just wait.'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          wu wei
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'non-action' : 'leave it alone'}
      </div>
    </div>
  );
}
