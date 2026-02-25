/**
 * NETWORK #4 -- 1314. The Echo Chamber
 * "Break the mirror. Invite the challenge."
 * INTERACTION: Tap to break the mirror -- window opens, fresh perspective enters
 * STEALTH KBE: Epistemic Humility -- Open-Mindedness (E)
 *
 * COMPOSITOR: pattern_glitch / Pulse / work / embodying / tap / 1314
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

export default function Network_EchoChamber({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Pulse',
        chrono: 'work',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1314,
        isSeal: false,
      }}
      arrivalText="Surrounded by mirrors. Hearing your own voice."
      prompt="Comfort is hearing your own voice. Growth is hearing the dissent. Break the mirror. Invite the challenge."
      resonantText="Epistemic humility. You broke the mirror and fresh air rushed in. Open-mindedness is the willingness to trade the comfort of being right for the growth of being challenged."
      afterglowCoda="Invite the challenge."
      onComplete={onComplete}
    >
      {(verse) => <EchoChamberInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function EchoChamberInteraction({ verse }: { verse: any }) {
  const [broken, setBroken] = useState(false);
  const [done, setDone] = useState(false);

  const handleBreak = () => {
    if (broken) return;
    setBroken(true);
    setDone(true);
    setTimeout(() => verse.advance(), 3500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 180;
  const CX = W / 2, CY = H / 2;

  // Mirror panels around the user
  const mirrors = [
    { x: CX - 55, y: CY - 40, w: 30, h: 50 },
    { x: CX + 25, y: CY - 40, w: 30, h: 50 },
    { x: CX - 55, y: CY + 10, w: 30, h: 50 },
    { x: CX + 25, y: CY + 10, w: 30, h: 50 },
  ];

  // Crack shards (for the right-side mirrors)
  const shards = [
    { x: 12, y: 5, r: 15 }, { x: -8, y: -12, r: 25 },
    { x: 18, y: -5, r: 20 }, { x: -5, y: 15, r: 18 },
    { x: 5, y: -18, r: 12 }, { x: -15, y: 8, r: 22 },
  ];

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Mirrors */}
          {mirrors.map((m, i) => {
            const isRight = i === 1 || i === 3;
            const isBroken = broken && isRight;

            return (
              <motion.g key={i}
                animate={isBroken ? {
                  opacity: 0,
                  scale: 0.8,
                } : {}}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={2}
                  fill={verse.palette.primary}
                  opacity={safeOpacity(0.06)} />
                <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={2}
                  fill="none" stroke={verse.palette.primary}
                  strokeWidth={0.8}
                  opacity={safeOpacity(0.15)} />

                {/* Reflection (echo text) */}
                {!isBroken && (
                  <text x={m.x + m.w / 2} y={m.y + m.h / 2 + 3}
                    textAnchor="middle"
                    fill={verse.palette.textFaint}
                    style={{ fontSize: '8px' }}
                    opacity={0.15}>
                    {i % 2 === 0 ? 'right' : 'right'}
                  </text>
                )}
              </motion.g>
            );
          })}

          {/* Remaining mirrors (left side, after break) */}
          {broken && [mirrors[0], mirrors[2]].map((m, i) => (
            <motion.rect key={`rem-${i}`}
              x={m.x} y={m.y} width={m.w} height={m.h} rx={2}
              fill={verse.palette.primary}
              animate={{ opacity: safeOpacity(0.03) }}
              transition={{ duration: 0.5 }}
            />
          ))}

          {/* Crack lines (appear on break) */}
          {broken && shards.map((s, i) => (
            <motion.line key={`crack-${i}`}
              x1={CX + 40} y1={CY}
              stroke={verse.palette.shadow}
              strokeWidth={0.5}
              initial={{
                x2: CX + 40,
                y2: CY,
                opacity: 0.4,
              }}
              animate={{
                x2: CX + 40 + s.x * 2,
                y2: CY + s.y * 2,
                opacity: 0,
              }}
              transition={{ duration: 0.5, delay: i * 0.03 }}
            />
          ))}

          {/* You (center) */}
          <circle cx={CX} cy={CY} r={8}
            fill={verse.palette.accent} opacity={safeOpacity(0.15)} />
          <circle cx={CX} cy={CY} r={8}
            fill="none" stroke={verse.palette.accent}
            strokeWidth={0.8} opacity={safeOpacity(0.3)} />

          {/* Echo arrows (bouncing back, before break) */}
          {!broken && [0, 1, 2, 3].map(i => {
            const m = mirrors[i];
            return (
              <motion.g key={`echo-${i}`}
                animate={{
                  opacity: [safeOpacity(0.05), safeOpacity(0.12), safeOpacity(0.05)],
                }}
                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
              >
                <line
                  x1={CX} y1={CY}
                  x2={m.x + m.w / 2} y2={m.y + m.h / 2}
                  stroke={verse.palette.primary} strokeWidth={0.3}
                  strokeDasharray="2 3" />
              </motion.g>
            );
          })}

          {/* Window (opens where mirrors broke) */}
          {broken && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {/* Window frame */}
              <rect x={CX + 25} y={CY - 40} width={50} height={80} rx={3}
                fill={verse.palette.accent} opacity={safeOpacity(0.04)} />
              <rect x={CX + 25} y={CY - 40} width={50} height={80} rx={3}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.8} opacity={safeOpacity(0.2)} />

              {/* Cross bar */}
              <line x1={CX + 50} y1={CY - 40} x2={CX + 50} y2={CY + 40}
                stroke={verse.palette.accent} strokeWidth={0.5}
                opacity={safeOpacity(0.15)} />
              <line x1={CX + 25} y1={CY} x2={CX + 75} y2={CY}
                stroke={verse.palette.accent} strokeWidth={0.5}
                opacity={safeOpacity(0.15)} />

              {/* Fresh air / new perspective flowing in */}
              {[0, 1, 2].map(i => (
                <motion.circle key={`air-${i}`}
                  r={3} fill={verse.palette.accent}
                  animate={{
                    cx: [CX + 60, CX + 10],
                    cy: [CY - 15 + i * 15, CY - 5 + i * 10],
                    opacity: [safeOpacity(0.2), 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    delay: 0.5 + i * 0.3,
                  }}
                />
              ))}

              <text x={CX + 50} y={CY + 55} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.micro} opacity={0.4}>
                window
              </text>
            </motion.g>
          )}

          {/* "I might be wrong" */}
          {done && (
            <motion.text
              x={CX} y={H - 8} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.choice}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.8 }}
            >
              i might be wrong
            </motion.text>
          )}
        </svg>
      </div>

      {!broken && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleBreak}>
          break the mirror
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'fresh air. fresh perspective.'
          : 'comfort is hearing your own voice'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          open-mindedness
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'epistemic humility' : 'break the echo'}
      </div>
    </div>
  );
}
