/**
 * HISTORIAN #10 -- 1390. The Historian Seal (The Proof)
 * "Time is the great judge."
 * INTERACTION: Observe -- sand flowing through an hourglass. The patterns repeat.
 * STEALTH KBE: Historiography -- seal completion
 *
 * COMPOSITOR: science_x_soul / Cosmos / night / knowing / observe / 1390
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

export default function Historian_HistorianSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Cosmos',
        chrono: 'night',
        kbe: 'k',
        hook: 'observe',
        specimenSeed: 1390,
        isSeal: true,
      }}
      arrivalText="Sand flowing."
      prompt="Time is the great judge."
      resonantText="Historiography. The study of how history is written. History is not just facts; it is the pattern of human nature repeating itself. The lindy, the cycle, the swan, the renaissance, the ruins, the pendulum, the golden age, the turning, the zeitgeist. It has all happened before. It will all happen again. Specimen 1390. The proof."
      afterglowCoda="It will all happen again."
      onComplete={onComplete}
    >
      {(verse) => <HistorianSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function HistorianSealInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1500),
      setTimeout(() => setPhase(2), 4000),
      setTimeout(() => setPhase(3), 7000),
      setTimeout(() => setPhase(4), 10000),
      setTimeout(() => {
        setPhase(5);
        setTimeout(() => verse.advance(), 3500);
      }, 13000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [verse]);

  const W = 260, H = 260;
  const CX = W / 2, CY = H / 2;

  // Hourglass geometry
  const HG_TOP = CY - 55;
  const HG_BOT = CY + 55;
  const HG_MID = CY;
  const HG_W = 35;

  // Sand particles (falling through the neck)
  const sandParticles = Array.from({ length: 12 }).map((_, i) => ({
    delay: i * 0.4,
    x: CX + (Math.random() - 0.5) * 4,
    dur: 1.5 + Math.random() * 0.5,
  }));

  // Lesson words
  const lessons = ['lindy', 'cycle', 'swan', 'renaissance', 'ruins', 'pendulum', 'golden age', 'turning', 'zeitgeist'];

  return (
    <div style={navicueStyles.interactionContainer(12)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Hourglass frame */}
          {phase >= 1 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
            >
              {/* Top glass */}
              <path
                d={`M ${CX - HG_W},${HG_TOP} L ${CX - 4},${HG_MID} L ${CX + 4},${HG_MID} L ${CX + HG_W},${HG_TOP} Z`}
                fill={verse.palette.primary} opacity={safeOpacity(0.03)} />
              <path
                d={`M ${CX - HG_W},${HG_TOP} L ${CX - 4},${HG_MID} L ${CX + 4},${HG_MID} L ${CX + HG_W},${HG_TOP}`}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={1} opacity={safeOpacity(0.15)} />

              {/* Bottom glass */}
              <path
                d={`M ${CX - 4},${HG_MID} L ${CX - HG_W},${HG_BOT} L ${CX + HG_W},${HG_BOT} L ${CX + 4},${HG_MID} Z`}
                fill={verse.palette.primary} opacity={safeOpacity(0.03)} />
              <path
                d={`M ${CX - 4},${HG_MID} L ${CX - HG_W},${HG_BOT} L ${CX + HG_W},${HG_BOT} L ${CX + 4},${HG_MID}`}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={1} opacity={safeOpacity(0.15)} />

              {/* Top cap */}
              <line x1={CX - HG_W - 5} y1={HG_TOP}
                x2={CX + HG_W + 5} y2={HG_TOP}
                stroke={verse.palette.accent} strokeWidth={2}
                strokeLinecap="round" opacity={safeOpacity(0.2)} />

              {/* Bottom cap */}
              <line x1={CX - HG_W - 5} y1={HG_BOT}
                x2={CX + HG_W + 5} y2={HG_BOT}
                stroke={verse.palette.accent} strokeWidth={2}
                strokeLinecap="round" opacity={safeOpacity(0.2)} />
            </motion.g>
          )}

          {/* Sand in top (diminishing) */}
          {phase >= 2 && (
            <motion.path
              fill={verse.palette.accent}
              animate={{
                d: phase >= 4
                  ? `M ${CX - 8},${HG_MID - 6} L ${CX - 4},${HG_MID} L ${CX + 4},${HG_MID} L ${CX + 8},${HG_MID - 6} Z`
                  : `M ${CX - 20},${HG_TOP + 15} L ${CX - 4},${HG_MID} L ${CX + 4},${HG_MID} L ${CX + 20},${HG_TOP + 15} Z`,
                opacity: safeOpacity(0.08),
              }}
              transition={{ duration: 3 }}
            />
          )}

          {/* Sand in bottom (accumulating) */}
          {phase >= 2 && (
            <motion.path
              fill={verse.palette.accent}
              animate={{
                d: phase >= 4
                  ? `M ${CX - HG_W + 3},${HG_BOT} L ${CX - 4},${HG_MID + 15} L ${CX + 4},${HG_MID + 15} L ${CX + HG_W - 3},${HG_BOT} Z`
                  : `M ${CX - HG_W + 3},${HG_BOT} L ${CX - 10},${HG_BOT - 15} L ${CX + 10},${HG_BOT - 15} L ${CX + HG_W - 3},${HG_BOT} Z`,
                opacity: safeOpacity(0.08),
              }}
              transition={{ duration: 3 }}
            />
          )}

          {/* Falling sand stream */}
          {phase >= 2 && phase < 5 && (
            <motion.line
              x1={CX} y1={HG_MID}
              x2={CX} y2={HG_MID + 20}
              stroke={verse.palette.accent} strokeWidth={1}
              animate={{ opacity: [safeOpacity(0.1), safeOpacity(0.2), safeOpacity(0.1)] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            />
          )}

          {/* Sand particles (individual grains falling) */}
          {phase >= 2 && phase < 5 && sandParticles.map((sp, i) => (
            <motion.circle key={i}
              cx={sp.x} r={1}
              fill={verse.palette.accent}
              animate={{
                cy: [HG_MID, HG_BOT - 10],
                opacity: [safeOpacity(0.2), safeOpacity(0)],
              }}
              transition={{
                repeat: Infinity,
                duration: sp.dur,
                delay: sp.delay,
                ease: 'easeIn',
              }}
            />
          ))}

          {/* Lesson ring */}
          {phase >= 3 && lessons.map((word, i) => {
            const angle = (i / lessons.length) * Math.PI * 2 - Math.PI / 2;
            const r = 105;
            return (
              <motion.text key={word}
                x={CX + Math.cos(angle) * r}
                y={CY + Math.sin(angle) * r + 3}
                textAnchor="middle"
                fill={verse.palette.textFaint}
                style={{ fontSize: '7px' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{ delay: i * 0.15 }}
              >
                {word}
              </motion.text>
            );
          })}

          {/* Cycle arrows (showing repetition) */}
          {phase >= 4 && (
            <motion.circle
              cx={CX} cy={CY} r={95}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={0.5} strokeDasharray="8 6"
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.1) }}
              transition={{ duration: 1 }}
            />
          )}

          {/* Seal ring */}
          {phase >= 4 && (
            <motion.circle
              cx={CX} cy={CY} r={115}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={0.5}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: safeOpacity(0.1), scale: 1 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            />
          )}

          {/* Phase text */}
          <motion.text
            x={CX} y={H - 15}
            textAnchor="middle"
            fill={phase >= 5 ? verse.palette.accent : verse.palette.textFaint}
            style={navicueType.hint}
            animate={{ opacity: 0.6 }}
          >
            {phase === 0 && 'sand flowing'}
            {phase === 1 && 'the hourglass'}
            {phase === 2 && 'time passes'}
            {phase === 3 && 'the patterns repeat'}
            {phase === 4 && 'it has all happened before'}
            {phase >= 5 && 'historiography'}
          </motion.text>
        </svg>
      </div>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase >= 5 ? 'temporal patterns / specimen 1390' : 'observe'}
      </div>
    </div>
  );
}
