/**
 * TUNING #6 -- 1196. The Overtone Series
 * "Listen for the harmonics. The magic is in the texture."
 * INTERACTION: One note. Listen closer. Hear higher notes inside it. Richness.
 * STEALTH KBE: Depth -- nuance (K)
 *
 * COMPOSITOR: koan_paradox / Echo / night / knowing / tap / 1196
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const OVERTONES = [
  { label: '1st', ratio: '1:1', y: 55, desc: 'fundamental' },
  { label: '2nd', ratio: '2:1', y: 45, desc: 'octave' },
  { label: '3rd', ratio: '3:1', y: 38, desc: 'fifth' },
  { label: '4th', ratio: '4:1', y: 32, desc: 'fourth' },
  { label: '5th', ratio: '5:1', y: 27, desc: 'third' },
];

export default function Tuning_OvertoneSeries({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Echo',
        chrono: 'night',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1196,
        isSeal: false,
      }}
      arrivalText="One note."
      prompt="A single truth contains many layers. Do not just hear the surface. Listen for the harmonics. The magic is in the texture."
      resonantText="Depth. One note contained five. You only heard one because you were not listening closely enough. Nuance is not complexity added. It is complexity noticed."
      afterglowCoda="Richness."
      onComplete={onComplete}
    >
      {(verse) => <OvertoneInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function OvertoneInteraction({ verse }: { verse: any }) {
  const [revealed, setRevealed] = useState(1); // start with fundamental
  const [done, setDone] = useState(false);

  const listenDeeper = useCallback(() => {
    if (done) return;
    setRevealed(prev => {
      const next = prev + 1;
      if (next >= OVERTONES.length) {
        setDone(true);
        setTimeout(() => verse.advance(), 2400);
      }
      return next;
    });
  }, [done, verse]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 80)}>
        <svg viewBox="0 0 160 80" style={navicueStyles.heroSvg}>
          {/* Overtone lines */}
          {OVERTONES.map((ot, i) => {
            const isVisible = i < revealed;
            const amplitude = 12 / (i + 1);
            return (
              <motion.g key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: isVisible ? 1 : 0 }}
                transition={{ duration: 0.8 }}
              >
                {/* Wave */}
                <path
                  d={Array.from({ length: 50 }).map((_, j) => {
                    const x = 30 + j * 2;
                    const y = ot.y + Math.sin(j * (i + 1) * 0.15) * amplitude;
                    return `${j === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke={i === 0
                    ? (done ? verse.palette.accent : 'hsla(200, 25%, 50%, 0.5)')
                    : (done ? verse.palette.accent : 'hsla(200, 20%, 55%, 0.3)')
                  }
                  strokeWidth={i === 0 ? 1.5 : 0.8}
                  opacity={i === 0 ? 0.5 : 0.3}
                />

                {/* Label */}
                <text x={15} y={ot.y + 3}
                  style={{ ...navicueType.micro }}
                  fill={done ? verse.palette.accent : verse.palette.textFaint}
                  opacity={0.3} textAnchor="middle">
                  {ot.ratio}
                </text>

                {/* Description */}
                <text x={140} y={ot.y + 3}
                  style={{ ...navicueType.micro }}
                  fill={verse.palette.textFaint}
                  opacity={0.2} textAnchor="start">
                  {ot.desc}
                </text>
              </motion.g>
            );
          })}

          {/* Depth counter */}
          <text x={80} y={72} textAnchor="middle"
            style={{ ...navicueType.hint, fontSize: 8 }}
            fill={done ? verse.palette.accent : verse.palette.textFaint}
            opacity={0.4}>
            {done ? 'all harmonics' : `${revealed}/${OVERTONES.length} heard`}
          </text>
        </svg>
      </div>

      {!done ? (
        <motion.button onClick={listenDeeper}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          listen deeper
        </motion.button>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          richness
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {done ? 'nuance' : 'the magic is in the texture'}
      </div>
    </div>
  );
}