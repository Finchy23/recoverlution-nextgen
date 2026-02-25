/**
 * WARRIOR II #7 -- 1367. The Empty Fort
 * "When you are weak, appear strong."
 * INTERACTION: Defenseless. Enemy approaches. Open gates. Play flute. They leave.
 * STEALTH KBE: Confidence -- Psychological Warfare (B)
 *
 * COMPOSITOR: koan_paradox / Pulse / night / believing / tap / 1367
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

export default function WarriorII_EmptyFort({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Pulse',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1367,
        isSeal: false,
      }}
      arrivalText="Defenseless. They approach."
      prompt="When you are weak, appear strong. When you are empty, appear full. Confusion is a weapon."
      resonantText="Confidence. You opened the gates and played the flute and they turned away. Psychological warfare: the appearance of calm in the face of danger is indistinguishable from power."
      afterglowCoda="Confusion is a weapon."
      onComplete={onComplete}
    >
      {(verse) => <EmptyFortInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function EmptyFortInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'approaching' | 'gates' | 'open' | 'retreating' | 'gone'>('approaching');
  const [enemyX, setEnemyX] = useState(30);

  // Enemy slowly approaches
  useEffect(() => {
    if (phase !== 'approaching') return;
    const interval = setInterval(() => {
      setEnemyX(x => {
        if (x >= 90) {
          setPhase('gates');
          clearInterval(interval);
        }
        return x + 1;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [phase]);

  const handleOpen = () => {
    if (phase !== 'gates') return;
    setPhase('open');
    setTimeout(() => {
      setPhase('retreating');
      setTimeout(() => {
        setPhase('gone');
        setTimeout(() => verse.advance(), 3000);
      }, 1500);
    }, 2000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 160;
  const CX = W / 2;

  // Fort
  const FORT_X = 140, FORT_Y = 35;
  const FORT_W = 60, FORT_H = 70;
  const GATE_Y = FORT_Y + FORT_H - 25;

  const isOpen = phase === 'open' || phase === 'retreating' || phase === 'gone';
  const enemyFinalX = phase === 'retreating' ? 15 : phase === 'gone' ? -20 : enemyX;

  // Music notes
  const notes = [
    { x: FORT_X + 20, y: FORT_Y + 15, delay: 0 },
    { x: FORT_X + 30, y: FORT_Y + 8, delay: 0.3 },
    { x: FORT_X + 10, y: FORT_Y + 5, delay: 0.6 },
  ];

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>bluff</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'gone' ? verse.palette.accent
            : isOpen ? verse.palette.text : verse.palette.shadow,
        }}>
          {phase === 'gone' ? 'they fled'
            : phase === 'retreating' ? 'retreating...'
              : isOpen ? 'gates wide open'
                : phase === 'gates' ? 'at the gates'
                  : 'approaching'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Fort walls */}
          <rect x={FORT_X} y={FORT_Y} width={FORT_W} height={FORT_H} rx={2}
            fill={verse.palette.primary} opacity={safeOpacity(0.04)} />
          <rect x={FORT_X} y={FORT_Y} width={FORT_W} height={FORT_H} rx={2}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={1.5} opacity={safeOpacity(0.15)} />

          {/* Battlements */}
          {[0, 1, 2, 3].map(i => (
            <rect key={i}
              x={FORT_X + 5 + i * 15} y={FORT_Y - 6}
              width={10} height={6} rx={1}
              fill={verse.palette.primary} opacity={safeOpacity(0.06)} />
          ))}

          {/* Gate (opens) */}
          <motion.g>
            {/* Left gate door */}
            <motion.rect
              y={GATE_Y} height={25} rx={1}
              fill={verse.palette.primary}
              stroke={verse.palette.primary}
              strokeWidth={0.5}
              animate={{
                x: isOpen ? FORT_X - 2 : FORT_X + 15,
                width: isOpen ? 12 : 15,
                opacity: safeOpacity(isOpen ? 0.06 : 0.1),
              }}
              transition={{ duration: 0.5 }}
            />
            {/* Right gate door */}
            <motion.rect
              y={GATE_Y} height={25} rx={1}
              fill={verse.palette.primary}
              stroke={verse.palette.primary}
              strokeWidth={0.5}
              animate={{
                x: isOpen ? FORT_X + FORT_W - 10 : FORT_X + 30,
                width: isOpen ? 12 : 15,
                opacity: safeOpacity(isOpen ? 0.06 : 0.1),
              }}
              transition={{ duration: 0.5 }}
            />
          </motion.g>

          {/* Figure on wall playing flute (when open) */}
          {isOpen && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <circle cx={FORT_X + FORT_W / 2} cy={FORT_Y - 12} r={4}
                fill={verse.palette.accent} opacity={safeOpacity(0.2)} />
              <line x1={FORT_X + FORT_W / 2} y1={FORT_Y - 8}
                x2={FORT_X + FORT_W / 2} y2={FORT_Y - 2}
                stroke={verse.palette.accent} strokeWidth={1.5}
                opacity={safeOpacity(0.2)} />
              {/* Flute */}
              <line x1={FORT_X + FORT_W / 2 - 3} y1={FORT_Y - 10}
                x2={FORT_X + FORT_W / 2 + 8} y2={FORT_Y - 10}
                stroke={verse.palette.accent} strokeWidth={1}
                opacity={safeOpacity(0.25)} />
            </motion.g>
          )}

          {/* Music notes floating */}
          {isOpen && notes.map((n, i) => (
            <motion.text key={i}
              x={n.x} textAnchor="middle"
              fill={verse.palette.accent} style={{ fontSize: '11px' }}
              initial={{ y: FORT_Y + 10, opacity: 0 }}
              animate={{
                y: [FORT_Y, n.y, n.y - 10],
                opacity: [0, safeOpacity(0.3), 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                delay: n.delay,
              }}
            >
              ~
            </motion.text>
          ))}

          {/* Enemy army */}
          <motion.g
            animate={{
              x: phase === 'retreating' ? -50 : phase === 'gone' ? -100 : 0,
              opacity: phase === 'gone' ? 0 : 1,
            }}
            transition={{ duration: 1 }}
          >
            {[0, 1, 2, 3, 4].map(i => (
              <motion.circle key={`army-${i}`}
                cx={enemyFinalX + (i % 3) * 14}
                cy={H / 2 - 5 + Math.floor(i / 3) * 14}
                r={6}
                fill={verse.palette.shadow}
                opacity={safeOpacity(0.08)}
              />
            ))}
            {/* Question mark (confusion) */}
            {isOpen && phase !== 'gone' && (
              <motion.text
                x={enemyFinalX + 15} y={H / 2 - 25}
                textAnchor="middle" fill={verse.palette.shadow}
                style={{ fontSize: '14px' }}
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              >
                ?
              </motion.text>
            )}
          </motion.g>

          {/* "Empty" label inside fort */}
          <text x={FORT_X + FORT_W / 2} y={GATE_Y + 10} textAnchor="middle"
            fill={verse.palette.textFaint} style={{ fontSize: '7px' }}
            opacity={isOpen ? 0.15 : 0}>
            empty
          </text>

          {/* Win text */}
          {phase === 'gone' && (
            <motion.text
              x={CX} y={H - 5} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}
            >
              the bluff worked
            </motion.text>
          )}
        </svg>
      </div>

      {phase === 'gates' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleOpen}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          open the gates
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'gone' ? 'calm in danger is indistinguishable from power.'
          : phase === 'retreating' ? 'they think it is a trap. they run.'
            : isOpen ? 'you play the flute. gates wide open.'
              : phase === 'gates' ? 'they are at the gates. you are defenseless.'
                : 'the army approaches. you have nothing.'}
      </span>

      {phase === 'gone' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          psychological warfare
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'gone' ? 'confidence' : 'appear strong when weak'}
      </div>
    </div>
  );
}
