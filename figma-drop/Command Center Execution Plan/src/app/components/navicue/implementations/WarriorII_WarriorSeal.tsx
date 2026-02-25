/**
 * WARRIOR II #10 -- 1370. The Warrior Seal (The Proof)
 * "The greatest victory is that which requires no battle."
 * INTERACTION: Observe -- the sage commander. Calm in chaos.
 * STEALTH KBE: Asymmetrical Warfare -- seal completion
 *
 * COMPOSITOR: science_x_soul / Cosmos / night / knowing / observe / 1370
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

export default function WarriorII_WarriorSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Cosmos',
        chrono: 'night',
        kbe: 'k',
        hook: 'observe',
        specimenSeed: 1370,
        isSeal: true,
      }}
      arrivalText="The sage commander."
      prompt="The greatest victory is that which requires no battle."
      resonantText="Asymmetrical warfare. Using leverage and unconventional tactics to defeat a superior force. The sage commander sits calm in the midst of chaos because the battle was won before it began. Specimen 1370. The proof."
      afterglowCoda="No battle required."
      onComplete={onComplete}
    >
      {(verse) => <WarriorSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function WarriorSealInteraction({ verse }: { verse: any }) {
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

  // Chaos particles (swirling around center)
  const chaosCount = 20;
  const chaosParticles = Array.from({ length: chaosCount }).map((_, i) => {
    const angle = (i / chaosCount) * Math.PI * 2;
    const r = 60 + (i % 3) * 20;
    return { angle, r, size: 2 + (i % 3), speed: 3 + (i % 4) };
  });

  return (
    <div style={navicueStyles.interactionContainer(12)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Chaos swirl (arrows, fragments, movement) */}
          {phase >= 1 && chaosParticles.map((p, i) => (
            <motion.circle key={i}
              r={p.size}
              fill={verse.palette.primary}
              animate={{
                cx: [
                  CX + Math.cos(p.angle) * p.r,
                  CX + Math.cos(p.angle + Math.PI * 0.5) * p.r,
                  CX + Math.cos(p.angle + Math.PI) * p.r,
                  CX + Math.cos(p.angle + Math.PI * 1.5) * p.r,
                  CX + Math.cos(p.angle + Math.PI * 2) * p.r,
                ],
                cy: [
                  CY + Math.sin(p.angle) * p.r,
                  CY + Math.sin(p.angle + Math.PI * 0.5) * p.r,
                  CY + Math.sin(p.angle + Math.PI) * p.r,
                  CY + Math.sin(p.angle + Math.PI * 1.5) * p.r,
                  CY + Math.sin(p.angle + Math.PI * 2) * p.r,
                ],
                opacity: safeOpacity(
                  phase >= 4 ? 0.03 : phase >= 3 ? 0.04 : 0.06
                ),
              }}
              transition={{
                repeat: Infinity,
                duration: p.speed,
                ease: 'linear',
                delay: i * 0.1,
              }}
            />
          ))}

          {/* Sage commander (center, still) */}
          {phase >= 2 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
            >
              {/* Seated figure */}
              {/* Head */}
              <circle cx={CX} cy={CY - 18} r={10}
                fill={verse.palette.accent} opacity={safeOpacity(0.12)} />
              {/* Body (seated cross-legged) */}
              <line x1={CX} y1={CY - 8} x2={CX} y2={CY + 8}
                stroke={verse.palette.accent} strokeWidth={2}
                opacity={safeOpacity(0.15)} />
              {/* Arms resting (hands on knees) */}
              <line x1={CX} y1={CY - 2} x2={CX - 15} y2={CY + 8}
                stroke={verse.palette.accent} strokeWidth={1.5}
                opacity={safeOpacity(0.12)} />
              <line x1={CX} y1={CY - 2} x2={CX + 15} y2={CY + 8}
                stroke={verse.palette.accent} strokeWidth={1.5}
                opacity={safeOpacity(0.12)} />
              {/* Legs (crossed) */}
              <line x1={CX - 12} y1={CY + 8} x2={CX + 5} y2={CY + 15}
                stroke={verse.palette.accent} strokeWidth={1.5}
                opacity={safeOpacity(0.1)} />
              <line x1={CX + 12} y1={CY + 8} x2={CX - 5} y2={CY + 15}
                stroke={verse.palette.accent} strokeWidth={1.5}
                opacity={safeOpacity(0.1)} />
            </motion.g>
          )}

          {/* Calm aura (inner circle of stillness) */}
          {phase >= 3 && (
            <motion.circle
              cx={CX} cy={CY} r={35}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={0.5}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: safeOpacity(0.15), scale: 1 }}
              transition={{ duration: 1.5 }}
            />
          )}

          {/* Chaos receding (outer ring dims) */}
          {phase >= 4 && (
            <motion.circle
              cx={CX} cy={CY} r={90}
              fill="none" stroke={verse.palette.primary}
              strokeWidth={0.3}
              strokeDasharray="4 6"
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.06) }}
              transition={{ duration: 1 }}
            />
          )}

          {/* The lessons (arranged around) */}
          {phase >= 3 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              {['formless', 'terrain', 'retreat', 'intel', 'bridge',
                'elements', 'bluff', 'flank', 'peace'].map((word, i) => {
                const angle = (i / 9) * Math.PI * 2 - Math.PI / 2;
                const r = 100;
                return (
                  <text key={word}
                    x={CX + Math.cos(angle) * r}
                    y={CY + Math.sin(angle) * r + 3}
                    textAnchor="middle"
                    fill={verse.palette.textFaint}
                    style={{ fontSize: '7px' }}
                  >
                    {word}
                  </text>
                );
              })}
            </motion.g>
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
            {phase === 0 && 'the sage commander'}
            {phase === 1 && 'chaos swirls'}
            {phase === 2 && 'stillness at the center'}
            {phase === 3 && 'the battle was won before it began'}
            {phase === 4 && 'the greatest victory requires no battle'}
            {phase >= 5 && 'asymmetrical warfare'}
          </motion.text>
        </svg>
      </div>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase >= 5 ? 'strategic conflict / specimen 1370' : 'observe'}
      </div>
    </div>
  );
}
