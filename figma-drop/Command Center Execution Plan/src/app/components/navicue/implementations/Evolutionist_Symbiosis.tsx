/**
 * EVOLUTIONIST #4 -- 1334. The Symbiosis
 * "Find your partner. The team survives."
 * INTERACTION: Clownfish alone (eaten). Tap to pair with anemone (safe).
 * STEALTH KBE: Cooperation -- Mutualism (B)
 *
 * COMPOSITOR: sacred_ordinary / Arc / morning / believing / tap / 1334
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

export default function Evolutionist_Symbiosis({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Arc',
        chrono: 'morning',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1334,
        isSeal: false,
      }}
      arrivalText="A small fish. Alone in open water."
      prompt="Independence is a myth. Find your partner. You protect them; they protect you. The team survives."
      resonantText="Cooperation. You paired with the anemone and both survived. Mutualism is the evolutionary proof that interdependence is not weakness. It is the highest form of adaptation."
      afterglowCoda="The team survives."
      onComplete={onComplete}
    >
      {(verse) => <SymbiosisInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SymbiosisInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'alone' | 'danger' | 'paired' | 'safe'>('alone');

  useEffect(() => {
    if (phase === 'alone') {
      const t = setTimeout(() => setPhase('danger'), 2500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handlePair = () => {
    if (phase !== 'danger') return;
    setPhase('paired');
    setTimeout(() => {
      setPhase('safe');
      setTimeout(() => verse.advance(), 3000);
    }, 1500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 170;
  const CX = W / 2;

  // Anemone center
  const ANE_X = 140, ANE_Y = 120;

  // Anemone tentacles
  const tentacles = Array.from({ length: 10 }).map((_, i) => {
    const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const len = 25 + (i % 3) * 5;
    return {
      x1: ANE_X, y1: ANE_Y,
      x2: ANE_X + Math.cos(angle) * len,
      y2: ANE_Y + Math.sin(angle) * len,
      cp: {
        x: ANE_X + Math.cos(angle + 0.3) * len * 0.6,
        y: ANE_Y + Math.sin(angle + 0.3) * len * 0.6,
      },
    };
  });

  const fishInAnemone = phase === 'paired' || phase === 'safe';

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>status</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'safe' ? verse.palette.accent
            : phase === 'danger' ? verse.palette.shadow : verse.palette.text,
        }}>
          {phase === 'safe' ? 'symbiosis'
            : phase === 'paired' ? 'pairing...'
              : phase === 'danger' ? 'exposed'
                : 'alone'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Water background */}
          <rect x={0} y={0} width={W} height={H} rx={6}
            fill={verse.palette.primary} opacity={safeOpacity(0.02)} />

          {/* Predator (shark silhouette, appears during danger) */}
          {phase === 'danger' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.1) }}
            >
              <path d={`M 15,50 L 50,40 L 60,35 L 55,45 L 70,42 L 50,50 L 15,55 Z`}
                fill={verse.palette.shadow} />
              <text x={45} y={62} textAnchor="middle"
                fill={verse.palette.shadow} style={{ fontSize: '7px' }} opacity={0.3}>
                predator
              </text>
            </motion.g>
          )}

          {/* Predator retreats from anemone */}
          {phase === 'safe' && (
            <motion.g
              initial={{ x: 0, opacity: 0.1 }}
              animate={{ x: -80, opacity: 0 }}
              transition={{ duration: 1.5 }}
            >
              <path d={`M 15,50 L 50,40 L 60,35 L 55,45 L 70,42 L 50,50 L 15,55 Z`}
                fill={verse.palette.shadow} />
            </motion.g>
          )}

          {/* Anemone */}
          <g>
            {/* Base */}
            <ellipse cx={ANE_X} cy={ANE_Y + 15} rx={20} ry={6}
              fill={verse.palette.primary} opacity={safeOpacity(0.08)} />

            {/* Tentacles */}
            {tentacles.map((t, i) => (
              <motion.path key={i}
                d={`M ${t.x1},${t.y1} Q ${t.cp.x},${t.cp.y} ${t.x2},${t.y2}`}
                fill="none"
                stroke={fishInAnemone ? verse.palette.accent : verse.palette.primary}
                strokeWidth={2}
                strokeLinecap="round"
                animate={{
                  opacity: safeOpacity(fishInAnemone ? 0.2 : 0.08),
                }}
              />
            ))}

            {/* Anemone center */}
            <circle cx={ANE_X} cy={ANE_Y} r={8}
              fill={fishInAnemone ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(fishInAnemone ? 0.12 : 0.06)} />
          </g>

          {/* Clownfish */}
          <motion.g
            animate={{
              x: fishInAnemone ? ANE_X - 55 : phase === 'danger' ? 50 : 60,
              y: fishInAnemone ? ANE_Y - 85 : phase === 'danger' ? 55 : 65,
            }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Fish body */}
            <ellipse cx={0} cy={0} rx={12} ry={7}
              fill={verse.palette.accent}
              opacity={safeOpacity(fishInAnemone ? 0.3 : 0.15)} />
            {/* Tail */}
            <path d="M 12,-4 L 18,0 L 12,4"
              fill={verse.palette.accent}
              opacity={safeOpacity(fishInAnemone ? 0.25 : 0.12)} />
            {/* Stripes */}
            <line x1={-3} y1={-6} x2={-3} y2={6}
              stroke={verse.palette.text} strokeWidth={1.5}
              opacity={safeOpacity(0.08)} />
            <line x1={5} y1={-5} x2={5} y2={5}
              stroke={verse.palette.text} strokeWidth={1.5}
              opacity={safeOpacity(0.08)} />
            {/* Eye */}
            <circle cx={-7} cy={-2} r={1.5}
              fill={verse.palette.text} opacity={safeOpacity(0.2)} />

            {/* "Alone" label */}
            {phase === 'alone' && (
              <text x={0} y={18} textAnchor="middle"
                fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}>
                alone
              </text>
            )}
          </motion.g>

          {/* Safe zone glow */}
          {phase === 'safe' && (
            <motion.circle cx={ANE_X} cy={ANE_Y}
              fill={verse.palette.accent}
              initial={{ r: 8, opacity: 0.1 }}
              animate={{ r: 45, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}

          {/* Partnership label */}
          {phase === 'safe' && (
            <motion.text
              x={ANE_X} y={ANE_Y + 40} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}
            >
              mutualism
            </motion.text>
          )}
        </svg>
      </div>

      {phase === 'danger' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handlePair}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          pair with anemone
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'safe' ? 'you protect them. they protect you.'
          : phase === 'paired' ? 'hiding in the tentacles...'
            : phase === 'danger' ? 'predator approaching. find shelter.'
              : 'alone in open water'}
      </span>

      {phase === 'safe' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          mutualism
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'safe' ? 'cooperation' : 'find your partner'}
      </div>
    </div>
  );
}
