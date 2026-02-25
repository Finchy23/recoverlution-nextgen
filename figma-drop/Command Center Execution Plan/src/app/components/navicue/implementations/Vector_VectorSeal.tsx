/**
 * VECTOR #10 -- 1190. The Vector Seal (The Proof)
 * "Direction is destiny."
 * INTERACTION: Observe -- flow field. Thousands of tiny arrows moving in unison like a river.
 * STEALTH KBE: Vector Addition -- habit summation (K)
 *
 * COMPOSITOR: science_x_soul / Drift / night / knowing / observe / 1190
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Vector_VectorSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Drift',
        chrono: 'night',
        kbe: 'k',
        hook: 'observe',
        specimenSeed: 1190,
        isSeal: true,
      }}
      arrivalText="A flow field. Thousands of arrows."
      prompt="Direction is destiny."
      resonantText="Vector Addition. When two forces act on an object, the result is the vector sum. You are the sum of all your habits. Every tiny arrow, every repeated direction, every daily vector adds up. The flow field is not random. It is the accumulation of every small choice, moving in unison, like a river that was once a thousand separate drops."
      afterglowCoda="Sum."
      onComplete={onComplete}
    >
      {(verse) => <VectorSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function VectorSealInteraction({ verse }: { verse: any }) {
  const [observeTime, setObserveTime] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [time, setTime] = useState(0);
  const OBSERVE_TARGET = 7;

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => setTime(t => t + 0.03), 30);
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

  const pct = Math.min(1, observeTime / OBSERVE_TARGET);

  // Generate flow field arrows
  const cols = 12;
  const rows = 7;
  const cellW = 160 / cols;
  const cellH = 100 / rows;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, minHeight: 260 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 105)}>
        <svg viewBox="0 0 160 105" style={navicueStyles.heroSvg}>
          {/* Flow field -- tiny arrows */}
          {Array.from({ length: rows }).map((_, row) =>
            Array.from({ length: cols }).map((_, col) => {
              const cx = col * cellW + cellW / 2;
              const cy = row * cellH + cellH / 2;

              // Flow direction (gentle curve like a river)
              const baseAngle = Math.sin(cy * 0.03) * 0.4 - 0.3;
              const flowAngle = baseAngle + Math.sin((cx + time * 30) * 0.04) * 0.15;
              const len = 4 + pct * 2;

              const x2 = cx + Math.cos(flowAngle) * len;
              const y2 = cy + Math.sin(flowAngle) * len;

              const isVisible = (row * cols + col) / (rows * cols) < pct * 1.2;

              if (!isVisible) return null;

              return (
                <g key={`${row}-${col}`}>
                  <line x1={cx} y1={cy} x2={x2} y2={y2}
                    stroke={revealed ? verse.palette.accent : 'hsla(200, 20%, 50%, 0.3)'}
                    strokeWidth={0.8}
                    opacity={revealed ? 0.35 : 0.15 + pct * 0.1}
                  />
                  {/* Tiny arrowhead */}
                  <circle cx={x2} cy={y2} r={0.6}
                    fill={revealed ? verse.palette.accent : 'hsla(200, 20%, 50%, 0.3)'}
                    opacity={revealed ? 0.4 : 0.2}
                  />
                </g>
              );
            })
          )}

          {/* River-like streamlines (appear later) */}
          {pct > 0.5 && [20, 45, 70].map((baseY, i) => (
            <path key={`stream${i}`}
              d={`M 0 ${baseY + Math.sin(time + i) * 3} Q 40 ${baseY - 5 + Math.sin(time + i + 1) * 3} 80 ${baseY + Math.sin(time + i + 2) * 3} Q 120 ${baseY + 5 + Math.sin(time + i + 3) * 3} 160 ${baseY + Math.sin(time + i + 4) * 3}`}
              fill="none"
              stroke={revealed ? verse.palette.accent : 'hsla(200, 20%, 50%, 0.15)'}
              strokeWidth={0.5}
              opacity={(pct - 0.5) * 0.4}
            />
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
              observe the field
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
              direction is destiny
            </span>
            <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 9, opacity: 0.4 }}>
              you are the sum of all your habits
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}