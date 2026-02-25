/**
 * DIPLOMAT #1 -- 1261. The Bridge Builder
 * "Throw the rope of curiosity first. Meet them halfway."
 * INTERACTION: Tap to throw rope across chasm, then walk to the middle
 * STEALTH KBE: Perspective Taking -- Relational Agency (K)
 *
 * COMPOSITOR: sacred_ordinary / Arc / social / knowing / tap / 1261
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

export default function Diplomat_BridgeBuilder({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Arc',
        chrono: 'social',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1261,
        isSeal: false,
      }}
      arrivalText="A chasm. Two sides."
      prompt="You cannot shout across the canyon. You have to build the structure. Throw the rope of curiosity first. Meet them halfway."
      resonantText="Perspective taking. You threw the rope before you threw the argument. Relational agency is the understanding that connection is infrastructure. You build it before you cross it."
      afterglowCoda="Meet them halfway."
      onComplete={onComplete}
    >
      {(verse) => <BridgeBuilderInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function BridgeBuilderInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'chasm' | 'rope' | 'walking' | 'done'>('chasm');

  const handleThrow = () => {
    if (phase !== 'chasm') return;
    setPhase('rope');
  };

  const handleWalk = () => {
    if (phase !== 'rope') return;
    setPhase('walking');
    setTimeout(() => {
      setPhase('done');
      setTimeout(() => verse.advance(), 2800);
    }, 2200);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 280, H = 150;
  const CHASM_L = 95, CHASM_R = 185;
  const CLIFF_Y = 85;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Left cliff */}
          <path d={`M 0,${CLIFF_Y} L ${CHASM_L},${CLIFF_Y} L ${CHASM_L},${H} L 0,${H} Z`}
            fill={verse.palette.primary} opacity={safeOpacity(0.06)} />
          <line x1={0} y1={CLIFF_Y} x2={CHASM_L} y2={CLIFF_Y}
            stroke={verse.palette.primary} strokeWidth={1} opacity={safeOpacity(0.15)} />

          {/* Right cliff */}
          <path d={`M ${CHASM_R},${CLIFF_Y} L ${W},${CLIFF_Y} L ${W},${H} L ${CHASM_R},${H} Z`}
            fill={verse.palette.primary} opacity={safeOpacity(0.06)} />
          <line x1={CHASM_R} y1={CLIFF_Y} x2={W} y2={CLIFF_Y}
            stroke={verse.palette.primary} strokeWidth={1} opacity={safeOpacity(0.15)} />

          {/* Chasm depth lines */}
          {[0, 1, 2].map(i => (
            <line key={i}
              x1={CHASM_L + 5} y1={CLIFF_Y + 15 + i * 15}
              x2={CHASM_R - 5} y2={CLIFF_Y + 15 + i * 15}
              stroke={verse.palette.primary} strokeWidth={0.3}
              opacity={safeOpacity(0.05 - i * 0.01)} />
          ))}

          {/* Labels */}
          <text x={CHASM_L / 2} y={CLIFF_Y - 20} textAnchor="middle"
            fill={verse.palette.text} style={navicueType.micro} opacity={0.5}>
            my truth
          </text>
          <text x={CHASM_R + (W - CHASM_R) / 2} y={CLIFF_Y - 20} textAnchor="middle"
            fill={verse.palette.textFaint} style={navicueType.micro} opacity={0.5}>
            their truth
          </text>

          {/* Rope / bridge */}
          {phase !== 'chasm' && (
            <motion.line
              x1={CHASM_L} y1={CLIFF_Y}
              x2={CHASM_R} y2={CLIFF_Y}
              stroke={verse.palette.accent}
              strokeWidth={1.5}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: safeOpacity(0.4) }}
              transition={{ duration: 0.8 }}
            />
          )}

          {/* Bridge planks (appear after rope) */}
          {phase !== 'chasm' && [0, 1, 2, 3, 4].map(i => {
            const x = CHASM_L + 8 + i * ((CHASM_R - CHASM_L - 16) / 4);
            return (
              <motion.rect
                key={i}
                x={x} y={CLIFF_Y - 2} width={12} height={4} rx={1}
                fill={verse.palette.accent}
                initial={{ opacity: 0 }}
                animate={{ opacity: safeOpacity(0.15) }}
                transition={{ delay: 0.8 + i * 0.1 }}
              />
            );
          })}

          {/* Person on left (you) */}
          <motion.g
            animate={{
              x: phase === 'walking' || phase === 'done'
                ? (CHASM_L + CHASM_R) / 2 - 50
                : 0,
            }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
          >
            <circle cx={50} cy={CLIFF_Y - 35} r={5}
              fill={verse.palette.accent} opacity={safeOpacity(0.3)} />
            <line x1={50} y1={CLIFF_Y - 30} x2={50} y2={CLIFF_Y - 15}
              stroke={verse.palette.accent} strokeWidth={1} opacity={safeOpacity(0.25)} />
          </motion.g>

          {/* Person on right (them) */}
          <motion.g
            animate={{
              x: phase === 'walking' || phase === 'done'
                ? -((CHASM_R + (W - CHASM_R) / 2) - (CHASM_L + CHASM_R) / 2 - 10)
                : 0,
            }}
            transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          >
            <circle cx={CHASM_R + (W - CHASM_R) / 2} cy={CLIFF_Y - 35} r={5}
              fill={verse.palette.primary} opacity={safeOpacity(0.2)} />
            <line x1={CHASM_R + (W - CHASM_R) / 2} y1={CLIFF_Y - 30}
              x2={CHASM_R + (W - CHASM_R) / 2} y2={CLIFF_Y - 15}
              stroke={verse.palette.primary} strokeWidth={1} opacity={safeOpacity(0.15)} />
          </motion.g>

          {/* Middle meeting point glow */}
          {phase === 'done' && (
            <motion.circle
              cx={(CHASM_L + CHASM_R) / 2} cy={CLIFF_Y - 25}
              r={15}
              fill={verse.palette.accent}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: safeOpacity(0.1), scale: 1 }}
              transition={{ duration: 1 }}
            />
          )}
        </svg>
      </div>

      {phase === 'chasm' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleThrow}>
          throw the rope
        </motion.button>
      )}

      {phase === 'rope' && (
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          style={btn.base} whileTap={btn.active} onClick={handleWalk}
        >
          walk to the middle
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'done' ? 'you met halfway'
          : phase === 'walking' ? 'crossing...'
            : phase === 'rope' ? 'the rope holds. now walk.'
              : 'too far to shout'}
      </span>

      {phase === 'done' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          relational agency
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'done' ? 'perspective taking' : 'build the bridge'}
      </div>
    </div>
  );
}
