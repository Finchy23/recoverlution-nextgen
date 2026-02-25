/**
 * VECTOR #6 -- 1186. The Null Vector (Rest)
 * "Peace is not the absence of force. It is the balance of forces."
 * INTERACTION: Chaos of arrows. Sum them to zero. Stillness. Equilibrium.
 * STEALTH KBE: Centering -- dynamic equilibrium (E)
 *
 * COMPOSITOR: sensory_cinema / Drift / night / embodying / tap / 1186
 */
import { useState, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

export default function Vector_NullVector({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Drift',
        chrono: 'night',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1186,
        isSeal: false,
      }}
      arrivalText="Arrows everywhere. Chaos."
      prompt="Peace is not the absence of force. It is the balance of forces. Let the pulls cancel each other out. Stand in the center."
      resonantText="Centering. Every force still exists. You did not remove them. You balanced them. The null vector is not emptiness. It is dynamic equilibrium: all forces present, net movement zero. Stillness within storm."
      afterglowCoda="Equilibrium."
      onComplete={onComplete}
    >
      {(verse) => <NullVectorInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function NullVectorInteraction({ verse }: { verse: any }) {
  const [balanced, setBalanced] = useState(0);
  const [done, setDone] = useState(false);
  const BALANCE_TARGET = 5;

  const rng = useMemo(() => seededRandom(1186), []);
  const arrows = useMemo(() => {
    const pairs: { angle: number; len: number; paired: boolean }[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = rng() * 360;
      const len = 15 + rng() * 20;
      pairs.push({ angle, len, paired: false });
      // Opposing arrow
      pairs.push({ angle: angle + 180, len, paired: false });
    }
    return pairs;
  }, []);

  const balance = useCallback(() => {
    if (done) return;
    setBalanced(prev => {
      const next = prev + 1;
      if (next >= BALANCE_TARGET) {
        setDone(true);
        setTimeout(() => verse.advance(), 2400);
      }
      return next;
    });
  }, [done, verse]);

  const pct = balanced / BALANCE_TARGET;
  const cx = 80, cy = 50;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 100)}>
        <svg viewBox="0 0 160 100" style={navicueStyles.heroSvg}>
          {/* Arrows -- fade as balanced */}
          {arrows.map((a, i) => {
            const rad = (a.angle * Math.PI) / 180;
            const fadeStart = i / arrows.length;
            const opacity = pct > fadeStart
              ? Math.max(0.05, 0.3 - (pct - fadeStart) * 0.5)
              : 0.3;
            const x2 = cx + Math.cos(rad) * a.len * (1 - pct * 0.3);
            const y2 = cy + Math.sin(rad) * a.len * (1 - pct * 0.3);
            return (
              <line key={i}
                x1={cx} y1={cy} x2={x2} y2={y2}
                stroke={done ? verse.palette.accent : 'hsla(0, 0%, 50%, 0.3)'}
                strokeWidth={1}
                opacity={done ? 0.08 : opacity}
              />
            );
          })}

          {/* Center point -- grows as balanced */}
          <motion.circle
            animate={{
              r: done ? 6 : 2 + pct * 3,
              opacity: done ? 0.5 : 0.2 + pct * 0.2,
            }}
            cx={cx} cy={cy}
            fill={done ? verse.palette.accent : 'hsla(0, 0%, 50%, 0.3)'}
          />

          {/* Zero label */}
          {done && (
            <motion.text
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              x={cx} y={cy + 18} textAnchor="middle"
              style={{ ...navicueType.hint, fontSize: 9 }}
              fill={verse.palette.accent}>
              0
            </motion.text>
          )}

          {/* Net force meter */}
          <text x={15} y={92}
            style={{ ...navicueType.hint, fontSize: 8 }}
            fill={done ? verse.palette.accent : verse.palette.textFaint} opacity={0.4}>
            net: {done ? '0' : (100 - pct * 100).toFixed(0)}
          </text>
        </svg>
      </div>

      {!done ? (
        <motion.button onClick={balance}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          balance
        </motion.button>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          equilibrium
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {done ? 'dynamic equilibrium' : `balancing: ${balanced}/${BALANCE_TARGET}`}
      </div>
    </div>
  );
}