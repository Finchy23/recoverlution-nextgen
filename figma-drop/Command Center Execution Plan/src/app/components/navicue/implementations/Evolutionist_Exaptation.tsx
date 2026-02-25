/**
 * EVOLUTIONIST #8 -- 1338. The Exaptation (Repurpose)
 * "Your pain is now your power."
 * INTERACTION: Feathers for warmth -> bird jumps -> feathers catch air -> flight
 * STEALTH KBE: Skill Transfer -- Innovation (K)
 *
 * COMPOSITOR: pattern_glitch / Arc / work / knowing / tap / 1338
 */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Evolutionist_Exaptation({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Arc',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1338,
        isSeal: false,
      }}
      arrivalText="Feathers. For warmth."
      prompt="You developed the skill for one reason. Now use it for another. Your pain is now your power."
      resonantText="Skill transfer. The feathers evolved for warmth, then caught the air and became wings. Innovation is exaptation: the most powerful breakthroughs come from repurposing what already exists."
      afterglowCoda="Upgrade."
      onComplete={onComplete}
    >
      {(verse) => <ExaptationInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ExaptationInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'warmth' | 'jump' | 'catch' | 'flight'>('warmth');

  const handleJump = () => {
    if (phase !== 'warmth') return;
    setPhase('jump');
    setTimeout(() => {
      setPhase('catch');
      setTimeout(() => {
        setPhase('flight');
        setTimeout(() => verse.advance(), 3000);
      }, 1200);
    }, 800);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 180;
  const CX = W / 2;
  const GROUND = H - 20;

  const birdY = phase === 'warmth' ? GROUND - 15
    : phase === 'jump' ? GROUND - 60
      : phase === 'catch' ? GROUND - 80
        : GROUND - 120;

  // Feather/wing spread
  const wingSpread = phase === 'warmth' ? 8 : phase === 'jump' ? 15 : 30;
  const wingAngle = phase === 'flight' ? -20 : phase === 'catch' ? -10 : 5;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>feathers</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'flight' ? verse.palette.accent : verse.palette.text,
        }}>
          {phase === 'flight' ? 'flight'
            : phase === 'catch' ? 'catching air'
              : phase === 'jump' ? 'jumping'
                : 'warmth'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Ground */}
          <line x1={20} y1={GROUND} x2={W - 20} y2={GROUND}
            stroke={verse.palette.primary} strokeWidth={0.5}
            opacity={safeOpacity(0.1)} />

          {/* Wind lines (during catch/flight) */}
          {(phase === 'catch' || phase === 'flight') && (
            <g>
              {[0, 1, 2, 3].map(i => (
                <motion.line key={i}
                  y1={birdY + (i - 1.5) * 12}
                  y2={birdY + (i - 1.5) * 12 + 2}
                  stroke={verse.palette.accent}
                  strokeWidth={0.8}
                  animate={{
                    x1: [CX + 40, CX - 60],
                    x2: [CX + 55, CX - 45],
                    opacity: [0, safeOpacity(0.15), 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </g>
          )}

          {/* Bird */}
          <motion.g
            animate={{ y: birdY - (GROUND - 15) }}
            transition={{ duration: phase === 'flight' ? 1.5 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Body */}
            <ellipse cx={CX} cy={GROUND - 15} rx={10} ry={7}
              fill={phase === 'flight' ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(phase === 'flight' ? 0.2 : 0.1)} />

            {/* Head */}
            <circle cx={CX + 8} cy={GROUND - 22} r={5}
              fill={phase === 'flight' ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(phase === 'flight' ? 0.2 : 0.1)} />

            {/* Eye */}
            <circle cx={CX + 10} cy={GROUND - 23} r={1}
              fill={verse.palette.text} opacity={safeOpacity(0.15)} />

            {/* Left wing/feathers */}
            <motion.path
              fill={phase === 'catch' || phase === 'flight' ? verse.palette.accent : verse.palette.primary}
              animate={{
                d: `M ${CX - 5},${GROUND - 15} Q ${CX - wingSpread},${GROUND - 15 + wingAngle} ${CX - wingSpread - 5},${GROUND - 18 + wingAngle}`,
                opacity: safeOpacity(phase === 'flight' ? 0.25 : 0.1),
              }}
              transition={{ duration: 0.4 }}
            />

            {/* Right wing/feathers */}
            <motion.path
              fill={phase === 'catch' || phase === 'flight' ? verse.palette.accent : verse.palette.primary}
              animate={{
                d: `M ${CX + 5},${GROUND - 15} Q ${CX + wingSpread},${GROUND - 15 + wingAngle} ${CX + wingSpread + 5},${GROUND - 18 + wingAngle}`,
                opacity: safeOpacity(phase === 'flight' ? 0.25 : 0.1),
              }}
              transition={{ duration: 0.4 }}
            />

            {/* Warmth indicator (huddled) */}
            {phase === 'warmth' && (
              <motion.g
                animate={{ opacity: [safeOpacity(0.05), safeOpacity(0.08), safeOpacity(0.05)] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <circle cx={CX} cy={GROUND - 15} r={18}
                  fill={verse.palette.primary} opacity={safeOpacity(0.04)} />
                <text x={CX} y={GROUND - 30} textAnchor="middle"
                  fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}>
                  warmth
                </text>
              </motion.g>
            )}

            {/* Legs (disappear during flight) */}
            {(phase === 'warmth' || phase === 'jump') && (
              <g>
                <line x1={CX - 3} y1={GROUND - 8} x2={CX - 5} y2={GROUND - 1}
                  stroke={verse.palette.primary} strokeWidth={1}
                  opacity={safeOpacity(0.1)} />
                <line x1={CX + 3} y1={GROUND - 8} x2={CX + 5} y2={GROUND - 1}
                  stroke={verse.palette.primary} strokeWidth={1}
                  opacity={safeOpacity(0.1)} />
              </g>
            )}
          </motion.g>

          {/* Purpose label */}
          {phase === 'warmth' && (
            <text x={CX} y={H - 5} textAnchor="middle"
              fill={verse.palette.textFaint} style={{ fontSize: '8px' }} opacity={0.2}>
              feathers = insulation
            </text>
          )}

          {phase === 'flight' && (
            <motion.text x={CX} y={H - 5} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}
            >
              feathers = flight
            </motion.text>
          )}

          {/* Upgrade arrow */}
          {phase === 'flight' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 0.8 }}
            >
              <line x1={CX + 40} y1={H - 10} x2={CX + 40} y2={40}
                stroke={verse.palette.accent} strokeWidth={0.5}
                strokeDasharray="3 3" />
              <text x={CX + 50} y={H / 2} textAnchor="start"
                fill={verse.palette.accent} style={{ fontSize: '8px' }} opacity={0.4}>
                upgrade
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      {phase === 'warmth' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleJump}>
          jump
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'flight' ? 'warmth became flight. repurposed.'
          : phase === 'catch' ? 'the feathers catch the air...'
            : phase === 'jump' ? 'airborne...'
              : 'feathers evolved for warmth. or did they?'}
      </span>

      {phase === 'flight' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          innovation
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'flight' ? 'skill transfer' : 'repurpose'}
      </div>
    </div>
  );
}
