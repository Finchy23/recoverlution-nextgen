/**
 * TUNING #10 -- 1200. The Harmonic Seal (The Proof)
 * "The universe is a song. Sing your part."
 * INTERACTION: Observe -- mathematical ratios of frequencies. 1:2, 2:3, 3:4. Hidden order.
 * STEALTH KBE: Entrainment -- rhythmic alignment (K)
 *
 * COMPOSITOR: science_x_soul / Echo / night / knowing / observe / 1200
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const RATIOS = [
  { num: 1, den: 2, name: 'octave', freq: 0.04 },
  { num: 2, den: 3, name: 'fifth', freq: 0.06 },
  { num: 3, den: 4, name: 'fourth', freq: 0.08 },
  { num: 4, den: 5, name: 'third', freq: 0.10 },
  { num: 5, den: 6, name: 'minor third', freq: 0.12 },
];

export default function Tuning_HarmonicSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Echo',
        chrono: 'night',
        kbe: 'k',
        hook: 'observe',
        specimenSeed: 1200,
        isSeal: true,
      }}
      arrivalText="Ratios. The hidden order of sound."
      prompt="The universe is a song. Sing your part."
      resonantText="Entrainment. Rhythmic systems with similar periods adjust to fall into lockstep. Your heart beats with the music you listen to. The ratios are not arbitrary: 1:2, 2:3, 3:4. They are the mathematics of beauty. The universe is a song built on simple ratios, and you are one of its instruments. Choose your soundtrack."
      afterglowCoda="Harmony."
      onComplete={onComplete}
    >
      {(verse) => <HarmonicSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function HarmonicSealInteraction({ verse }: { verse: any }) {
  const [observeTime, setObserveTime] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [time, setTime] = useState(0);
  const OBSERVE_TARGET = 7;

  useEffect(() => {
    const interval = setInterval(() => setTime(t => t + 0.03), 30);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, minHeight: 260 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 110)}>
        <svg viewBox="0 0 160 110" style={navicueStyles.heroSvg}>
          {/* Harmonic ratio waves -- each appears progressively */}
          {RATIOS.map((r, i) => {
            const revealAt = i / RATIOS.length;
            const isVisible = pct > revealAt;
            if (!isVisible) return null;

            const yBase = 15 + i * 18;
            const amplitude = 6 - i * 0.5;
            const opacity = revealed ? 0.4 : 0.2 + (pct - revealAt) * 0.3;

            return (
              <g key={i}>
                {/* Wave */}
                <path
                  d={Array.from({ length: 50 }).map((_, j) => {
                    const x = 30 + j * 2.2;
                    const y = yBase + Math.sin((x + time * 20) * r.freq) * amplitude;
                    return `${j === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke={revealed ? verse.palette.accent : 'hsla(200, 22%, 50%, 0.4)'}
                  strokeWidth={1}
                  opacity={opacity}
                />

                {/* Ratio label */}
                <text x={15} y={yBase + 3} textAnchor="middle"
                  style={{ ...navicueType.micro }}
                  fill={revealed ? verse.palette.accent : verse.palette.textFaint}
                  opacity={opacity}>
                  {r.num}:{r.den}
                </text>

                {/* Name */}
                <text x={148} y={yBase + 3} textAnchor="end"
                  style={{ ...navicueType.micro }}
                  fill={verse.palette.textFaint} opacity={0.3}>
                  {r.name}
                </text>
              </g>
            );
          })}

          {/* Combined harmony at bottom (appears when all ratios visible) */}
          {pct > 0.8 && (
            <motion.path
              initial={{ opacity: 0 }}
              animate={{ opacity: revealed ? 0.3 : 0.15 }}
              d={Array.from({ length: 80 }).map((_, j) => {
                const x = j * 2;
                let y = 100;
                RATIOS.forEach(r => {
                  y += Math.sin((x + time * 20) * r.freq) * 2;
                });
                return `${j === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke={revealed ? verse.palette.accent : 'hsla(200, 22%, 50%, 0.3)'}
              strokeWidth={1.5}
            />
          )}
        </svg>
      </div>

      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="observing"
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11, opacity: 0.5 }}>
              the hidden order
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
              the universe is a song. sing your part.
            </span>
            <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 9, opacity: 0.4 }}>
              choose your soundtrack
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}