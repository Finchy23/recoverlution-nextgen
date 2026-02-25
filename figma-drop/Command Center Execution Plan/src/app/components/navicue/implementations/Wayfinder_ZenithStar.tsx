/**
 * WAYFINDER #3 -- 1163. The Zenith Star
 * "Do not chase the horizon. Keep your star at the zenith."
 * INTERACTION: Night sky chaos. Identify YOUR star overhead. Follow it.
 * STEALTH KBE: North Star -- purpose driven action (K)
 *
 * COMPOSITOR: koan_paradox / Compass / night / knowing / tap / 1163
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

export default function Wayfinder_ZenithStar({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Compass',
        chrono: 'night',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1163,
        isSeal: false,
      }}
      arrivalText="A night sky. Chaos."
      prompt="Every island has a star that passes directly over it. Do not chase the horizon. Keep your star at the zenith."
      resonantText="North Star. You found your star among thousands. It was not the brightest. It was the one directly above you. Purpose-driven action does not chase every light. It follows the one that is yours."
      afterglowCoda="Follow it."
      onComplete={onComplete}
    >
      {(verse) => <ZenithStarInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ZenithStarInteraction({ verse }: { verse: any }) {
  const [selectedStar, setSelectedStar] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const ZENITH_IDX = 7; // The zenith star

  const rng = useMemo(() => seededRandom(1163), []);
  const stars = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      x: rng() * 150 + 5,
      y: i === ZENITH_IDX ? 12 + rng() * 8 : rng() * 90 + 5,
      r: i === ZENITH_IDX ? 2.5 : rng() * 1.8 + 0.5,
      twinkle: rng() * 2 + 1,
    }));
  }, []);

  const selectStar = useCallback((idx: number) => {
    if (done) return;
    setSelectedStar(idx);
    if (idx === ZENITH_IDX) {
      setDone(true);
      setTimeout(() => verse.advance(), 2200);
    } else {
      setTimeout(() => setSelectedStar(null), 800);
    }
  }, [done, verse]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroCssScene(verse.palette, 160 / 110)}>
        {/* Zenith marker */}
        <div style={{
          position: 'absolute', top: 3, left: '50%', transform: 'translateX(-50%)',
          ...navicueType.micro, color: verse.palette.textFaint, opacity: 0.3,
        }}>
          zenith
        </div>

        <svg viewBox="0 0 160 110" style={navicueStyles.heroSvg}>
          {/* Stars */}
          {stars.map((s, i) => (
            <motion.circle key={i}
              cx={s.x} cy={s.y} r={s.r}
              fill={
                done && i === ZENITH_IDX ? verse.palette.accent :
                selectedStar === i ? 'hsla(40, 50%, 60%, 0.7)' :
                i === ZENITH_IDX ? 'hsla(45, 30%, 55%, 0.5)' :
                'hsla(220, 15%, 55%, 0.3)'
              }
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ repeat: Infinity, duration: s.twinkle, delay: i * 0.1 }}
              style={{ cursor: done ? 'default' : 'pointer' }}
              onClick={() => selectStar(i)}
            />
          ))}

          {/* Horizon line */}
          <line x1={0} y1={100} x2={160} y2={100}
            stroke={verse.palette.primaryGlow} strokeWidth={1} opacity={0.1} />

          {/* Wrong choice indicator */}
          {selectedStar !== null && selectedStar !== ZENITH_IDX && (
            <text x={stars[selectedStar].x} y={stars[selectedStar].y + 10}
              textAnchor="middle"
              style={{ ...navicueType.micro }}
              fill="hsla(0, 30%, 50%, 0.4)">
              not yours
            </text>
          )}

          {/* Zenith selection glow */}
          {done && (
            <motion.circle
              initial={{ r: 3, opacity: 0.5 }}
              animate={{ r: 12, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              cx={stars[ZENITH_IDX].x} cy={stars[ZENITH_IDX].y}
              fill="none" stroke={verse.palette.accent} strokeWidth={0.5}
            />
          )}
        </svg>
      </div>

      {/* Status */}
      {!done ? (
        <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11, opacity: 0.5 }}>
          find your star
        </span>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          your star
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {done ? 'purpose driven action' : 'the zenith'}
      </div>
    </div>
  );
}