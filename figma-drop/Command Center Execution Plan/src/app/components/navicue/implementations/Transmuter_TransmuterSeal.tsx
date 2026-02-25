/**
 * TRANSMUTER #10 -- 1090. The Transmuter Seal (The Proof)
 * "Energy is never lost. It only changes form."
 * INTERACTION: Observe the ouroboros -- snake eating its tail -- infinite recycling
 * STEALTH KBE: Conservation of energy -- first law of thermodynamics (E)
 *
 * COMPOSITOR: science_x_soul / Ember / night / embodying / observe / 1090
 */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Transmuter_TransmuterSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Ember',
        chrono: 'night',
        kbe: 'e',
        hook: 'observe',
        specimenSeed: 1090,
        isSeal: true,
      }}
      arrivalText="A circle. No beginning."
      prompt="Energy is never lost. It only changes form. You cannot destroy your pain, but you can convert it into power. The first law."
      resonantText="Conservation. Nothing was wasted. Every hurt, every failure, every dark night fed the furnace. The snake eats its tail because the end is the beginning."
      afterglowCoda="Nothing is lost."
      onComplete={onComplete}
    >
      {(verse) => <TransmuterSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function TransmuterSealInteraction({ verse }: { verse: any }) {
  const [observing, setObserving] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const OBSERVE_TIME = 6;

  useEffect(() => {
    if (!observing) return;
    const interval = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 0.1;
        if (next >= OBSERVE_TIME) {
          setTimeout(() => verse.advance(), 1500);
          return OBSERVE_TIME;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [observing, verse]);

  const progress = elapsed / OBSERVE_TIME;
  const done = elapsed >= OBSERVE_TIME;

  // Ouroboros: a circular path with a head chasing its tail
  const RADIUS = 52;
  const CX = 60;
  const CY = 60;

  // Head position on the circle
  const headAngle = -Math.PI / 2 + progress * Math.PI * 2 * 2; // 2 full rotations over duration
  const headX = CX + RADIUS * Math.cos(headAngle);
  const headY = CY + RADIUS * Math.sin(headAngle);

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Ouroboros */}
      <div style={navicueStyles.heroScene(verse.palette, 120 / 120)}>
        <svg viewBox="0 0 120 120" style={navicueStyles.heroSvg}>
          {/* Circle body */}
          <circle
            cx={CX}
            cy={CY}
            r={RADIUS}
            fill="none"
            stroke={verse.palette.primaryGlow}
            strokeWidth="1.5"
            opacity="0.3"
          />

          {/* Animated progress arc */}
          <motion.circle
            cx={CX}
            cy={CY}
            r={RADIUS}
            fill="none"
            stroke={verse.palette.accent}
            strokeWidth="1.5"
            strokeDasharray={2 * Math.PI * RADIUS}
            strokeDashoffset={2 * Math.PI * RADIUS * (1 - progress)}
            strokeLinecap="round"
            opacity="0.5"
            style={{ transformOrigin: `${CX}px ${CY}px`, rotate: '-90deg' }}
          />

          {/* Head dot */}
          {observing && (
            <motion.circle
              cx={headX}
              cy={headY}
              r={4}
              fill={verse.palette.accent}
              opacity={0.7}
            />
          )}

          {/* Tail dot (static at top) */}
          <circle
            cx={CX}
            cy={CY - RADIUS}
            r={3}
            fill={verse.palette.textFaint}
            opacity={0.4}
          />
        </svg>

        {/* Centre text */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <motion.span
            animate={done ? { opacity: [0.5, 1, 0.5] } : {}}
            transition={done ? { repeat: Infinity, duration: 3 } : {}}
            style={{
              ...navicueType.hint,
              color: done ? verse.palette.accent : verse.palette.textFaint,
              fontSize: 9,
              textAlign: 'center',
              lineHeight: 1.4,
              maxWidth: 70,
            }}
          >
            {done ? 'energy is never lost' : observing ? 'watching...' : ''}
          </motion.span>
        </div>
      </div>

      {/* Action */}
      {!observing && (
        <motion.button
          onClick={() => setObserving(true)}
          whileTap={immersiveTapButton(verse.palette).active}
          style={immersiveTapButton(verse.palette).base}
        >
          observe the cycle
        </motion.button>
      )}

      {observing && !done && (
        <div style={navicueStyles.kbeLabel(verse.palette)}>
          the snake eats its tail
        </div>
      )}
    </div>
  );
}