/**
 * KINETICIST #10 -- 1120. The Kinetic Seal (The Proof)
 * "Motion is life. Stagnation is death. Keep moving."
 * INTERACTION: Observe -- Newton's cradle -- perfect transfer of energy
 * STEALTH KBE: Momentum Conservation -- energy transfer (E)
 *
 * COMPOSITOR: science_x_soul / Storm / night / embodying / observe / 1120
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Kineticist_KineticSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Storm',
        chrono: 'night',
        kbe: 'e',
        hook: 'observe',
        specimenSeed: 1120,
        isSeal: true,
      }}
      arrivalText="Five silver balls. Suspended."
      prompt="Motion is life. Stagnation is death. Keep moving."
      resonantText="Momentum Conservation. In a closed system, the total momentum remains constant. The energy you put in yesterday is still there, moving you today. Nothing is wasted."
      afterglowCoda="Keep moving."
      onComplete={onComplete}
    >
      {(verse) => <KineticSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function KineticSealInteraction({ verse }: { verse: any }) {
  const [observeTime, setObserveTime] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [phase, setPhase] = useState(0); // 0-1 oscillation
  const OBSERVE_TARGET = 6;

  // Newton's cradle animation
  const BALL_COUNT = 5;
  const BALL_R = 10;
  const STRING_LEN = 50;
  const cx = 90;
  const baseY = 20;

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(prev => (prev + 0.04) % (Math.PI * 2));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Observe timer
  useEffect(() => {
    if (revealed) return;
    const interval = setInterval(() => {
      setObserveTime(prev => {
        const next = prev + 0.1;
        if (next >= OBSERVE_TARGET) {
          setRevealed(true);
          clearInterval(interval);
          setTimeout(() => verse.advance(), 3000);
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [revealed, verse]);

  const progressPct = Math.min(1, observeTime / OBSERVE_TARGET);

  // Ball positions
  const balls = Array.from({ length: BALL_COUNT }, (_, i) => {
    const spacing = BALL_R * 2.2;
    const startX = cx - ((BALL_COUNT - 1) * spacing) / 2 + i * spacing;
    let angle = 0;

    if (i === 0 && Math.sin(phase) < 0) {
      // Left ball swings
      angle = Math.sin(phase) * 0.6;
    } else if (i === BALL_COUNT - 1 && Math.sin(phase) > 0) {
      // Right ball swings
      angle = Math.sin(phase) * 0.6;
    }

    const ballX = startX + Math.sin(angle) * STRING_LEN;
    const ballY = baseY + STRING_LEN + (1 - Math.cos(angle)) * STRING_LEN;

    return { x: ballX, y: ballY, stringX: startX, angle };
  });

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 180 / 140)}>
        <svg viewBox="0 0 180 140" style={navicueStyles.heroSvg}>
          {/* Top bar */}
          <div style={{
            position: 'absolute', top: baseY, left: cx - 55, right: cx - 55 + 110,
            height: 2, background: verse.palette.primaryGlow, opacity: 0.2,
            width: 110,
          }} />

          {balls.map((b, i) => (
            <g key={i}>
              {/* String */}
              <line
                x1={b.stringX} y1={baseY}
                x2={b.x} y2={b.y - BALL_R}
                stroke={verse.palette.primaryGlow}
                strokeWidth={0.8}
                opacity={0.25}
              />
              {/* Ball */}
              <circle
                cx={b.x} cy={b.y}
                r={BALL_R}
                fill={`hsla(0, 0%, ${50 + progressPct * 15}%, ${0.25 + progressPct * 0.15})`}
                stroke={verse.palette.primaryGlow}
                strokeWidth={0.5}
                opacity={0.6}
              />
              {/* Highlight */}
              <circle
                cx={b.x - 3} cy={b.y - 3}
                r={3}
                fill={verse.palette.accent}
                opacity={Math.abs(b.angle) > 0.1 ? 0.3 : 0.05}
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Status */}
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="observing"
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11, opacity: 0.5 }}>
              observe
            </span>
            <div style={{ width: 60, height: 2, borderRadius: 1, background: verse.palette.primaryGlow, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${progressPct * 100}%` }}
                style={{ height: '100%', background: verse.palette.accent, borderRadius: 1 }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <span style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 12 }}>
              perfect transfer
            </span>
            <span style={navicueStyles.annotation(verse.palette)}>
              the energy you put in yesterday is still moving you today
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}