/**
 * WARRIOR II #1 -- 1361. The Formless (Deception)
 * "Be water. Be mist. Let them punch the air."
 * INTERACTION: Solid block (easy target). Dissolve into mist. Attack passes through.
 * STEALTH KBE: Adaptability -- Elusiveness (E)
 *
 * COMPOSITOR: pattern_glitch / Drift / night / embodying / tap / 1361
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

export default function WarriorII_Formless({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Drift',
        chrono: 'night',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1361,
        isSeal: false,
      }}
      arrivalText="A solid block. Easy to hit."
      prompt="All warfare is based on deception. If you have a shape, they can kill you. Be water. Be mist. Let them punch the air."
      resonantText="Adaptability. You dissolved the ego and the attack passed through nothing. Elusiveness: the shape that cannot be grasped cannot be destroyed. Formlessness is the ultimate defense."
      afterglowCoda="Be mist."
      onComplete={onComplete}
    >
      {(verse) => <FormlessInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FormlessInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'solid' | 'dissolving' | 'mist' | 'attack' | 'through'>('solid');

  const handleDissolve = () => {
    if (phase !== 'solid') return;
    setPhase('dissolving');
    setTimeout(() => {
      setPhase('mist');
      setTimeout(() => {
        setPhase('attack');
        setTimeout(() => {
          setPhase('through');
          setTimeout(() => verse.advance(), 3000);
        }, 800);
      }, 1500);
    }, 1200);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 160;
  const CX = W / 2, CY = H / 2;

  // Mist particles (scattered from center block)
  const particles = Array.from({ length: 24 }).map((_, i) => {
    const angle = (i / 24) * Math.PI * 2;
    const dist = 25 + (i % 3) * 15;
    return {
      x: CX + Math.cos(angle) * dist,
      y: CY + Math.sin(angle) * dist,
      delay: i * 0.03,
      size: 2 + (i % 3),
    };
  });

  // Attack arrow
  const ARROW_START = -20;
  const ARROW_END = W + 20;

  const isMist = phase === 'mist' || phase === 'attack' || phase === 'through';

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>form</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'through' ? verse.palette.accent
            : isMist ? verse.palette.text : verse.palette.shadow,
        }}>
          {phase === 'through' ? 'untouchable'
            : phase === 'attack' ? 'incoming...'
              : isMist ? 'formless'
                : phase === 'dissolving' ? 'dissolving...'
                  : 'solid (target)'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Solid block (visible when solid/dissolving) */}
          {!isMist && (
            <motion.rect
              x={CX - 25} y={CY - 25} width={50} height={50} rx={4}
              fill={verse.palette.primary}
              stroke={verse.palette.primary}
              strokeWidth={1.5}
              animate={{
                opacity: phase === 'dissolving'
                  ? safeOpacity(0.02) : safeOpacity(0.12),
              }}
              transition={{ duration: 1 }}
            />
          )}

          {/* Target crosshair on solid */}
          {phase === 'solid' && (
            <g opacity={0.15}>
              <line x1={CX} y1={CY - 35} x2={CX} y2={CY - 28}
                stroke={verse.palette.shadow} strokeWidth={1} />
              <line x1={CX} y1={CY + 28} x2={CX} y2={CY + 35}
                stroke={verse.palette.shadow} strokeWidth={1} />
              <line x1={CX - 35} y1={CY} x2={CX - 28} y2={CY}
                stroke={verse.palette.shadow} strokeWidth={1} />
              <line x1={CX + 28} y1={CY} x2={CX + 35} y2={CY}
                stroke={verse.palette.shadow} strokeWidth={1} />
              <circle cx={CX} cy={CY} r={32} fill="none"
                stroke={verse.palette.shadow} strokeWidth={0.5}
                strokeDasharray="4 4" />
            </g>
          )}

          {/* Mist particles */}
          {isMist && particles.map((p, i) => (
            <motion.circle key={i}
              cx={p.x} cy={p.y} r={p.size}
              fill={phase === 'through' ? verse.palette.accent : verse.palette.primary}
              initial={{ opacity: 0 }}
              animate={{
                opacity: safeOpacity(phase === 'through' ? 0.15 : 0.06),
                x: [0, (Math.random() - 0.5) * 8, 0],
                y: [0, (Math.random() - 0.5) * 8, 0],
              }}
              transition={{
                opacity: { delay: p.delay, duration: 0.3 },
                x: { repeat: Infinity, duration: 2 + i * 0.1, ease: 'easeInOut' },
                y: { repeat: Infinity, duration: 2.5 + i * 0.1, ease: 'easeInOut' },
              }}
            />
          ))}

          {/* Attack arrow (passes through mist) */}
          {(phase === 'attack' || phase === 'through') && (
            <motion.g>
              <motion.line
                y1={CY} y2={CY}
                stroke={verse.palette.shadow}
                strokeWidth={2}
                strokeLinecap="round"
                initial={{ x1: ARROW_START, x2: ARROW_START + 30 }}
                animate={{
                  x1: ARROW_END - 30,
                  x2: ARROW_END,
                  opacity: [safeOpacity(0.3), safeOpacity(0.3), safeOpacity(0)],
                }}
                transition={{ duration: 0.8, ease: 'linear' }}
              />
              {/* Arrow head */}
              <motion.path
                d="M 0,-4 L 8,0 L 0,4"
                fill={verse.palette.shadow}
                initial={{ x: ARROW_START + 30, y: CY, opacity: 0.3 }}
                animate={{
                  x: ARROW_END,
                  opacity: [0.3, 0.3, 0],
                }}
                transition={{ duration: 0.8, ease: 'linear' }}
              />
            </motion.g>
          )}

          {/* "Passed through" indicator */}
          {phase === 'through' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <text x={CX} y={H - 10} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.micro}
                opacity={0.5}>
                punched the air
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      {phase === 'solid' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleDissolve}>
          dissolve
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'through' ? 'they hit nothing. you are mist.'
          : phase === 'attack' ? 'the strike arrives...'
            : isMist ? 'no shape. no target.'
              : phase === 'dissolving' ? 'the ego dissolves...'
                : 'a solid block. easy to target.'}
      </span>

      {phase === 'through' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          elusiveness
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'through' ? 'adaptability' : 'be water'}
      </div>
    </div>
  );
}
