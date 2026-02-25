/**
 * RECEIVER #4 -- 1174. The Antenna Gain (Range)
 * "Climb the mountain. Extend your reach. Rise to meet the signal."
 * INTERACTION: No signal. Extend antenna. Climb higher. Signal received.
 * STEALTH KBE: State Elevation -- state management (E)
 *
 * COMPOSITOR: witness_ritual / Pulse / social / embodying / tap / 1174
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Receiver_AntennaGain({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Pulse',
        chrono: 'social',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1174,
        isSeal: false,
      }}
      arrivalText="No signal."
      prompt="You are too low to hear the truth. Climb the mountain. Extend your reach. The signal is there, but you have to rise to meet it."
      resonantText="State Elevation. The signal never moved. You did. You climbed until the noise floor dropped below the truth. State management is not about the signal. It is about your altitude."
      afterglowCoda="Signal received."
      onComplete={onComplete}
    >
      {(verse) => <AntennaGainInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function AntennaGainInteraction({ verse }: { verse: any }) {
  const [height, setHeight] = useState(0);
  const [done, setDone] = useState(false);
  const MAX_HEIGHT = 7;

  const climb = useCallback(() => {
    if (done) return;
    setHeight(prev => {
      const next = prev + 1;
      if (next >= MAX_HEIGHT) {
        setDone(true);
        setTimeout(() => verse.advance(), 2200);
      }
      return next;
    });
  }, [done, verse]);

  const pct = height / MAX_HEIGHT;
  const signalBars = Math.floor(pct * 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 100)}>
        <svg viewBox="0 0 160 100" style={navicueStyles.heroSvg}>
          {/* Mountain */}
          <path d="M 0 95 L 60 30 L 80 50 L 120 15 L 160 95 Z"
            fill="none" stroke={verse.palette.primaryGlow} strokeWidth={0.8} opacity={0.12} />

          {/* Climber position */}
          <motion.circle
            animate={{
              cx: 60 + pct * 60,
              cy: 90 - pct * 75,
            }}
            r={3}
            fill={done ? verse.palette.accent : 'hsla(30, 25%, 50%, 0.4)'}
            stroke={verse.palette.primaryGlow} strokeWidth={0.5}
          />

          {/* Antenna extending from climber */}
          <motion.line
            animate={{
              x1: 60 + pct * 60,
              y1: 90 - pct * 75 - 3,
              x2: 60 + pct * 60,
              y2: 90 - pct * 75 - 3 - pct * 15,
            }}
            stroke={done ? verse.palette.accent : 'hsla(0, 0%, 50%, 0.4)'}
            strokeWidth={1}
          />

          {/* Signal waves at top */}
          {pct > 0.3 && (
            <>
              {[1, 2, 3].map(i => (
                <motion.path key={i}
                  d={`M ${130 + i * 5} ${10 + i * 3} Q ${135 + i * 5} ${5 + i * 3} ${140 + i * 5} ${10 + i * 3}`}
                  fill="none"
                  stroke={done ? verse.palette.accent : 'hsla(200, 25%, 50%, 0.3)'}
                  strokeWidth={0.8}
                  animate={{ opacity: [0, pct * 0.4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                />
              ))}
            </>
          )}

          {/* Signal strength bars */}
          <g transform="translate(15, 10)">
            {[0, 1, 2, 3, 4].map(i => (
              <rect key={i}
                x={i * 6} y={20 - (i + 1) * 4} width={4} height={(i + 1) * 4}
                rx={1}
                fill={i < signalBars
                  ? (done ? verse.palette.accent : 'hsla(200, 25%, 50%, 0.4)')
                  : verse.palette.primaryGlow}
                opacity={i < signalBars ? 0.5 : 0.15}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Action */}
      {!done ? (
        <motion.button onClick={climb}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          climb higher
        </motion.button>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          signal received
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {done ? 'state management' : `altitude: ${Math.round(pct * 100)}%`}
      </div>
    </div>
  );
}