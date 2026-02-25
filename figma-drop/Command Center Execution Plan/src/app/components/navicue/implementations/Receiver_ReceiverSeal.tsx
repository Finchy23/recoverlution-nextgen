/**
 * RECEIVER #10 -- 1180. The Receiver Seal (The Proof)
 * "The answer is already in the air."
 * INTERACTION: Observe -- massive radio telescope array pointing at the deep sky. Listening.
 * STEALTH KBE: Stochastic Resonance -- signal detection (K)
 *
 * COMPOSITOR: science_x_soul / Pulse / night / knowing / observe / 1180
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Receiver_ReceiverSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Pulse',
        chrono: 'night',
        kbe: 'k',
        hook: 'observe',
        specimenSeed: 1180,
        isSeal: true,
      }}
      arrivalText="A massive array. Pointing skyward."
      prompt="The answer is already in the air."
      resonantText="Stochastic Resonance. A phenomenon where a signal too weak to detect can be boosted by adding white noise to the system. Sometimes, a little chaos helps you hear. The universe has been broadcasting since the beginning. The answer is already in the air. You just had to build the receiver."
      afterglowCoda="Listening."
      onComplete={onComplete}
    >
      {(verse) => <ReceiverSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ReceiverSealInteraction({ verse }: { verse: any }) {
  const [observeTime, setObserveTime] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const OBSERVE_TARGET = 7;

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

  const pct = Math.min(1, observeTime / OBSERVE_TARGET);

  // Telescope array positions
  const dishes = [
    { x: 25, y: 55, size: 12 },
    { x: 55, y: 50, size: 14 },
    { x: 80, y: 45, size: 16 },
    { x: 105, y: 50, size: 14 },
    { x: 135, y: 55, size: 12 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, minHeight: 260 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 110)}>
        <svg viewBox="0 0 160 110" style={navicueStyles.heroSvg}>
          {/* Stars */}
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.circle key={i}
              cx={10 + (i * 37) % 145} cy={5 + (i * 13) % 30}
              r={0.8}
              fill="hsla(220, 20%, 55%, 0.3)"
              animate={{ opacity: [0.1, 0.4, 0.1] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
            />
          ))}

          {/* Radio telescope dishes */}
          {dishes.map((d, i) => (
            <g key={i}>
              {/* Stand */}
              <line x1={d.x} y1={d.y + d.size * 0.4} x2={d.x} y2={d.y + d.size * 1.2}
                stroke={revealed ? verse.palette.accent : 'hsla(0, 0%, 45%, 0.3)'}
                strokeWidth={1.5} />

              {/* Dish (parabola pointing up) */}
              <path
                d={`M ${d.x - d.size * 0.7} ${d.y + d.size * 0.3} Q ${d.x} ${d.y - d.size * 0.4} ${d.x + d.size * 0.7} ${d.y + d.size * 0.3}`}
                fill="none"
                stroke={revealed ? verse.palette.accent : 'hsla(210, 20%, 50%, 0.3)'}
                strokeWidth={1.5}
                opacity={0.4 + pct * 0.2}
              />

              {/* Feed point */}
              <circle cx={d.x} cy={d.y - d.size * 0.15} r={1}
                fill={revealed ? verse.palette.accent : 'hsla(210, 20%, 50%, 0.3)'}
                opacity={0.4}
              />

              {/* Signal reception lines (appear gradually) */}
              {pct > (i / dishes.length) * 0.8 && (
                <motion.line
                  x1={d.x} y1={d.y - d.size * 0.4}
                  x2={d.x + (Math.random() - 0.5) * 10} y2={5}
                  stroke={revealed ? verse.palette.accent : 'hsla(200, 25%, 50%, 0.15)'}
                  strokeWidth={0.5}
                  strokeDasharray="2 4"
                  animate={{ opacity: [0, 0.2, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
                />
              )}
            </g>
          ))}

          {/* Ground line */}
          <line x1={0} y1={85} x2={160} y2={85}
            stroke={verse.palette.primaryGlow} strokeWidth={0.5} opacity={0.1} />

          {/* Noise + signal visualization at bottom */}
          {pct > 0.3 && (
            <g transform="translate(10, 90)">
              {Array.from({ length: 40 }).map((_, i) => {
                const x = i * 3.5;
                const noise = (Math.random() - 0.5) * 6;
                const signal = pct > 0.7 ? Math.sin((i + observeTime * 5) * 0.3) * 4 : 0;
                return (
                  <line key={i}
                    x1={x} y1={8} x2={x} y2={8 + noise + signal}
                    stroke={revealed ? verse.palette.accent : 'hsla(200, 20%, 50%, 0.2)'}
                    strokeWidth={1}
                    opacity={0.3}
                  />
                );
              })}
            </g>
          )}
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
              listening
            </span>
            <div style={{ width: 60, height: 2, borderRadius: 1, background: verse.palette.primaryGlow, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${pct * 100}%` }}
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
              the answer is already in the air
            </span>
            <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 9, opacity: 0.4 }}>
              sometimes, a little chaos helps you hear
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}